import React, { useEffect, useState } from 'react';
import { Book, Users, Leaf, Heart, Moon, Sun, Calendar, TreePine, Droplets, Wind, LucideIcon } from 'lucide-react'; // Import LucideIcon
import AOS from 'aos';
import 'aos/dist/aos.css';

// Firebase Imports
import { initializeApp, FirebaseApp, getApps, FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously, Auth, User as FirebaseAuthUser } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, Firestore, query } from 'firebase/firestore';

// Definisi tipe untuk item Kearifan Lokal (sesuai dengan yang Anda gunakan di komponen CRUD)
export interface KearifanLokalItem {
  id?: string; // Firestore ID will be a string
  name: string;
  description: string;
  image: string; // URL gambar
  category: string;
  philosophy: string;
  practices: string[]; // Array of strings
  benefits: string[]; // Array of strings
  iconName: string; // Nama ikon Lucide (e.g., 'Users', 'Calendar')
  colorClass: string; // Kelas warna Tailwind (e.g., 'bg-blue-500')
  status: 'Aktif' | 'Perlu Revitalisasi'; // Tambahkan status jika ada di Firestore
}

// Map icon names to actual LucideIcon components
const iconMap: { [key: string]: LucideIcon } = {
  Book, Users, Leaf, Heart, Moon, Sun, Calendar, TreePine, Droplets, Wind,
};

// Tambahkan deklarasi global untuk config Firebase jika belum ada di file ini atau main entry point
declare global {
  var __firebase_config: string | undefined;
  var __app_id: string | undefined;
}


const KearifanLokal = () => {
  const [activeCategory, setActiveCategory] = useState('Semua');

  // States untuk data dinamis dari Firebase
  const [kearifanData, setKearifanData] = useState<KearifanLokalItem[]>([]);
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

  // Fetch dynamic Kearifan Lokal data from Firestore
  useEffect(() => {
    if (!db || !isAuthReady) {
      return;
    }

    setLoadingData(true);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const collectionPath = `/artifacts/${appId}/kearifanLokal`; // Jalur koleksi kearifan lokal

    const unsubscribe = onSnapshot(query(collection(db, collectionPath)), (snapshot) => {
      const data: KearifanLokalItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<KearifanLokalItem, 'id'>,
        // Pastikan properti array seperti practices dan benefits selalu array
        practices: (doc.data() as any).practices || [],
        benefits: (doc.data() as any).benefits || [],
        // Pastikan iconName dan colorClass punya fallback jika tidak ada di Firestore
        iconName: (doc.data() as any).iconName || 'Book', // Fallback icon
        colorClass: (doc.data() as any).colorClass || 'bg-gray-500', // Fallback color
      }));
      // Anda bisa menambahkan sorting jika perlu, misal berdasarkan nama
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
      setKearifanData(sortedData);
      setLoadingData(false);
      setDataError(null);
    }, (err) => {
      console.error(`Error fetching kearifanLokal: ${err.message}`);
      setDataError(`Failed to load local wisdom data: ${err.message}. Check Firestore rules for ${collectionPath}`);
      setKearifanData([]); // Reset to empty array on error
      setLoadingData(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, [db, isAuthReady]);

  // Definisi kategori statis untuk filter
  const staticCategories = [
    'Semua', 
    'Tradisi Sosial', 
    'Pengetahuan Tradisional', 
    'Ritual & Upacara', 
    'Filosofi Hidup',
    'Lainnya' // Tambahkan 'Lainnya' jika ada di data Anda
  ];

  const filteredKearifan = activeCategory === 'Semua' 
    ? kearifanData 
    : kearifanData.filter(item => item.category === activeCategory);

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-screen font-sans text-xl text-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mr-3"></div>
        Memuat data kearifan lokal...
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="text-center p-6 text-red-700 bg-red-50 rounded-lg border border-red-200 mx-auto max-w-lg font-sans mt-20">
        <p className="font-semibold text-lg mb-2">Error Memuat Data!</p>
        <p className="text-base">{dataError}</p>
        <p className="text-sm mt-3">Pastikan koneksi internet Anda stabil dan aturan keamanan Firestore mengizinkan akses publik untuk koleksi kearifan lokal.</p>
      </div>
    );
  }

  if (kearifanData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pt-20">
        <section className="bg-gradient-to-r from-amber-800 via-orange-700 to-red-800 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center" data-aos="fade-up">
              <div className="flex justify-center mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <Book className="w-12 h-12 text-amber-200" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
                Kearifan Lokal
              </h1>
              <p className="text-xl md:text-2xl text-amber-100 max-w-3xl mx-auto leading-relaxed">
                Warisan budaya dan pengetahuan turun-temurun yang menjadi pedoman hidup masyarakat Desa Medalsari
              </p>
            </div>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-gray-600 text-lg">
          Tidak ada data kearifan lokal yang ditemukan.
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-amber-800 via-orange-700 to-red-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Book className="w-12 h-12 text-amber-200" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
              Kearifan Lokal
            </h1>
            <p className="text-xl md:text-2xl text-amber-100 max-w-3xl mx-auto leading-relaxed">
              Warisan budaya dan pengetahuan turun-temurun yang menjadi pedoman hidup masyarakat Desa Medalsari
            </p>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-orange-300/20 rounded-full blur-xl"></div>
      </section>

      {/* Philosophy Quote */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-aos="fade-up">
            <blockquote className="text-2xl md:text-3xl font-light text-gray-700 italic leading-relaxed mb-6">
              "Kearifan lokal adalah cermin jati diri bangsa yang mengajarkan keseimbangan antara manusia, alam, dan sang pencipta"
            </blockquote>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto"></div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-gradient-to-r from-amber-100 to-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4" data-aos="fade-up">
            {staticCategories.map((category) => ( // Menggunakan staticCategories
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-amber-50 shadow-md'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Kearifan Lokal Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredKearifan.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">Tidak ada kearifan lokal yang ditemukan dalam kategori ini.</p>
          ) : (
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredKearifan.map((kearifan, index) => {
                const IconComponent = iconMap[kearifan.iconName || 'Book']; // Pastikan iconName punya fallback
                return (
                  <div 
                    key={kearifan.id}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-amber-100"
                    data-aos="fade-up"
                    data-aos-delay={index * 100} // aos-delay dipindahkan ke sini
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={kearifan.image || 'https://placehold.co/800x560/aabbcc/ffffff?text=No+Image'} 
                        alt={kearifan.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                            (e.target as HTMLImageElement).onerror = null;
                            (e.target as HTMLImageElement).src = 'https://placehold.co/800x560/aabbcc/ffffff?text=Error';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute top-4 left-4 flex items-center space-x-2">
                        <div className={`${kearifan.colorClass} p-2 rounded-full`}> {/* Menggunakan colorClass */}
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <span className="bg-white/90 backdrop-blur-sm text-sm font-medium px-3 py-1 rounded-full">
                          {kearifan.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3">{kearifan.name}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{kearifan.description}</p>
                      
                      <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-l-4 border-amber-400">
                        <p className="text-sm font-medium text-amber-800 mb-1">Filosofi:</p>
                        <p className="text-sm text-amber-700 italic">"{kearifan.philosophy}"</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Praktik Tradisional:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {kearifan.practices && kearifan.practices.length > 0 ? (
                              kearifan.practices.map((practice, idx) => (
                                <div key={idx} className="flex items-center space-x-2 text-xs">
                                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                  <span className="text-gray-600">{practice}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-500 text-xs col-span-full">Tidak ada praktik tercatat.</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Manfaat:</p>
                          <div className="flex flex-wrap gap-2">
                            {kearifan.benefits && kearifan.benefits.length > 0 ? (
                              kearifan.benefits.map((benefit, idx) => (
                                <span key={idx} className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                                  {benefit}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 text-xs">Tidak ada manfaat tercatat.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Preservation Call to Action */}
      <section className="py-20 bg-gradient-to-r from-amber-800 via-orange-700 to-red-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Mari Lestarikan Kearifan Lokal
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-3xl mx-auto">
              Kearifan lokal adalah harta yang tak ternilai. Dengan mempraktikkan dan meneruskan kepada generasi mendatang, 
              kita turut menjaga identitas dan keberlanjutan budaya nusantara.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-amber-800 px-8 py-4 rounded-full font-semibold hover:bg-amber-50 transition-colors shadow-lg transform hover:scale-105">
                Pelajari Lebih Lanjut
              </button>
              <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-amber-800 transition-colors">
                Bergabung dengan Komunitas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Nilai-Nilai Luhur</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kearifan lokal mengajarkan nilai-nilai universal yang relevan untuk kehidupan modern
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, title: 'Kebersamaan', desc: 'Gotong royong dan solidaritas' },
              { icon: Leaf, title: 'Kelestarian', desc: 'Harmoni dengan alam' },
              { icon: Heart, title: 'Spiritualitas', desc: 'Kedekatan dengan sang pencipta' },
              { icon: Book, title: 'Pengetahuan', desc: 'Wisdom yang teruji waktu' }
            ].map((value, index) => {
              const Icon = value.icon; // Ambil komponen ikon
              return (
                <div key={index} className="text-center group" data-aos="fade-up" data-aos-delay={index * 100}>
                  <div className="bg-gradient-to-br from-amber-100 to-orange-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-10 h-10 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default KearifanLokal;