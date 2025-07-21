import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, User, Eye, Tag, Search, Filter } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom'; // Pastikan Link diimpor

// Firebase Imports
import { initializeApp, FirebaseApp, getApps, FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously, Auth, User as FirebaseAuthUser } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, Firestore, query } from 'firebase/firestore';

// Definisi tipe untuk item Berita (sesuai dengan yang Anda gunakan di komponen CRUD)
export interface BeritaItem {
  id?: string; // Firestore ID will be a string
  title: string;
  excerpt: string;
  content: string;
  image: string; // URL gambar
  category: string;
  author: string;
  date: string; // Format YYYY-MM-DD
  featured: boolean;
  status: 'Published' | 'Draft';
  views?: number; // Views bisa opsional jika tidak selalu ada atau dihitung backend
}

// Tambahkan deklarasi global untuk config Firebase jika belum ada di file ini atau main entry point
declare global {
  var __firebase_config: string | undefined;
  var __app_id: string | undefined;
}


const Berita = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // States untuk data dinamis dari Firebase
  const [beritaData, setBeritaData] = useState<BeritaItem[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Firebase states
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  // AOS Initialization
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  // Firebase Initialization and Authentication
  useEffect(() => {
    let firebaseConfig: FirebaseOptions | null = null;
    try {
      if (typeof __firebase_config !== 'undefined' && __firebase_config.trim() !== '') {
        firebaseConfig = JSON.parse(__firebase_config);
      } else {
        console.warn("Firebase config (__firebase_config) is undefined or empty. Using dummy config.");
        firebaseConfig = {
          apiKey: "dummy-api-key", authDomain: "dummy.firebaseapp.com", projectId: "dummy-project",
          storageBucket: "dummy.appspot.com", messagingSenderId: "dummy", appId: "dummy"
        };
        setDataError("Firebase config not found. Data might not load.");
      }

      let app: FirebaseApp;
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }

      const firestore: Firestore = getFirestore(app);
      const firebaseAuth: Auth = getAuth(app);

      setDb(firestore);
      setAuth(firebaseAuth);

      const unsubscribeAuth = firebaseAuth.onAuthStateChanged(async (user: FirebaseAuthUser | null) => {
        if (!user) { // Sign in anonymously to ensure read access if rules allow for unauthenticated users
          try {
            await signInAnonymously(firebaseAuth);
          } catch (anonError: any) {
            console.error("Error signing in anonymously:", anonError);
            setDataError(`Authentication error: ${anonError.message}`);
          }
        }
        setIsAuthReady(true);
      });

      return () => unsubscribeAuth();
    } catch (e: any) {
      console.error("Failed to initialize Firebase:", e);
      setDataError(`Firebase initialization error: ${e.message}`);
      setLoadingData(false);
    }
  }, []);

  // Fetch dynamic Berita data from Firestore
  useEffect(() => {
    if (!db || !isAuthReady) {
      return;
    }

    setLoadingData(true);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const collectionPath = `/artifacts/${appId}/berita`; // Jalur koleksi berita

    const unsubscribe = onSnapshot(query(collection(db, collectionPath)), (snapshot) => {
      const data: BeritaItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<BeritaItem, 'id'>,
        views: (doc.data() as any).views || 0, // Fallback views to 0 if not present
      }));
      // Sortir berita berdasarkan tanggal terbaru
      const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setBeritaData(sortedData);
      setLoadingData(false);
      setDataError(null);
    }, (err) => {
      console.error(`Error fetching berita: ${err.message}`);
      setDataError(`Failed to load news data: ${err.message}. Check Firestore rules for ${collectionPath}`);
      setBeritaData([]); // Reset to empty array on error
      setLoadingData(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, [db, isAuthReady]);


  // Definisi kategori statis, tapi count akan dihitung dinamis
  const staticCategories = [
    { id: 'all', name: 'Semua' },
    { id: 'pengumuman', name: 'Pengumuman' },
    { id: 'kegiatan', name: 'Kegiatan' },
    { id: 'pembangunan', name: 'Pembangunan' },
    { id: 'sosial', name: 'Sosial' },
    { id: 'lainnya', name: 'Lainnya' }, 
  ];

  // Hitung jumlah berita untuk setiap kategori secara dinamis
  const categoriesWithCount = staticCategories.map(cat => {
    const count = cat.id === 'all' 
      ? beritaData.length 
      : beritaData.filter(newsItem => newsItem.category === cat.id).length;
    return { ...cat, count };
  });


  const filteredNews = beritaData.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredNews = beritaData.filter(item => item.featured);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
          return 'Tanggal Tidak Valid';
      }
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      pengumuman: 'bg-blue-100 text-blue-800',
      kegiatan: 'bg-green-100 text-green-800',
      pembangunan: 'bg-purple-100 text-purple-800',
      sosial: 'bg-orange-100 text-orange-800',
      lainnya: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-screen font-sans text-xl text-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mr-3"></div>
        Memuat data berita...
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="text-center p-6 text-red-700 bg-red-50 rounded-lg border border-red-200 mx-auto max-w-lg font-sans mt-20">
        <p className="font-semibold text-lg mb-2">Error Memuat Data Berita!</p>
        <p className="text-base">{dataError}</p>
        <p className="text-sm mt-3">Pastikan koneksi internet Anda stabil dan aturan keamanan Firestore mengizinkan akses publik untuk koleksi berita.</p>
      </div>
    );
  }

  if (beritaData.length === 0 && !loadingData && !dataError) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <section className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center" data-aos="fade-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Berita & Pengumuman</h1>
              <p className="text-xl text-blue-100">Informasi terkini dari Desa Medalsari</p>
            </div>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-gray-600 text-lg">
          Tidak ada berita yang ditemukan.
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Berita & Pengumuman</h1>
            <p className="text-xl text-blue-100">Informasi terkini dari Desa Medalsari</p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categoriesWithCount.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured News */}
      {selectedCategory === 'all' && searchQuery === '' && featuredNews.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12" data-aos="fade-up">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Berita Utama</h2>
              <p className="text-xl text-gray-600">Berita terpenting dan terkini</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {featuredNews.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  data-aos="fade-up"
                  data-aos-delay={index * 200}
                >
                  <div className="relative">
                    <img
                      src={item.image || 'https://placehold.co/800x480/aabbcc/ffffff?text=No+Image'}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src = 'https://placehold.co/800x480/aabbcc/ffffff?text=Error';
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(item.category)}`}>
                        {categoriesWithCount.find(c => c.id === item.category)?.name || item.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{item.excerpt}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{item.author}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{item.views || 0}</span> {/* Tampilkan 0 jika views undefined */}
                      </div>
                    </div>
                    
                    {/* Menggunakan Link untuk navigasi ke halaman detail berita */}
                    <Link 
                      to={`/berita/${item.id}`} // Pastikan rute ini ada di App.tsx
                      className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors block text-center"
                    >
                      Baca Selengkapnya
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All News */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {selectedCategory === 'all' ? 'Semua Berita' : `Berita ${categoriesWithCount.find(c => c.id === selectedCategory)?.name || selectedCategory}`}
            </h2>
            <p className="text-xl text-gray-600">
              {filteredNews.length} berita ditemukan
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {filteredNews.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img
                      src={item.image || 'https://placehold.co/800x480/aabbcc/ffffff?text=No+Image'}
                      alt={item.title}
                      className="w-full h-48 md:h-full object-cover"
                      onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src = 'https://placehold.co/800x480/aabbcc/ffffff?text=Error';
                      }}
                    />
                  </div>
                  <div className="md:w-2/3 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(item.category)}`}>
                        {categoriesWithCount.find(c => c.id === item.category)?.name || item.category}
                      </span>
                      {item.featured && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{item.excerpt}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{item.author}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{item.views || 0}</span> {/* Tampilkan 0 jika views undefined */}
                      </div>
                    </div>
                    
                    {/* Menggunakan Link untuk navigasi ke halaman detail berita */}
                    <Link 
                      to={`/berita/${item.id}`} // Pastikan rute ini ada di App.tsx
                      className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors block text-center"
                    >
                      Baca Selengkapnya
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {filteredNews.length === 0 && searchQuery !== '' && (
                <div className="text-center text-gray-600 text-lg col-span-full">
                    Tidak ada berita yang cocok dengan pencarian Anda.
                </div>
            )}
            {filteredNews.length === 0 && selectedCategory !== 'all' && searchQuery === '' && (
                <div className="text-center text-gray-600 text-lg col-span-full">
                    Tidak ada berita dalam kategori ini.
                </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Berita;