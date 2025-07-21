import React, { useEffect, useState } from 'react';
import { Camera, Heart, Eye, X, LucideIcon, MessageCircle } from 'lucide-react'; // Import MessageCircle untuk WA
import AOS from 'aos';
import 'aos/dist/aos.css';

// Firebase Imports
import { initializeApp, FirebaseApp, getApps, FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously, Auth, User as FirebaseAuthUser } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, Firestore, query } from 'firebase/firestore';

// Definisi tipe untuk item Galeri (sesuai dengan yang Anda gunakan di komponen CRUD)
export interface GaleriItem {
  id?: string; // Firestore ID will be a string
  title: string;
  category: string;
  date: string; // Format YYYY-MM-DD
  image: string; // URL gambar
  photographer: string;
  likes?: number; // Opsional, jika Anda punya fitur likes
  views?: number; // Opsional, jika Anda punya fitur views
}

// Tambahkan deklarasi global untuk config Firebase jika belum ada di file ini atau main entry point
declare global {
  var __firebase_config: string | undefined;
  var __app_id: string | undefined;
}


const Galeri = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<GaleriItem | null>(null);

  // States untuk data dinamis dari Firebase
  const [photosData, setPhotosData] = useState<GaleriItem[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Firebase states
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  // Nomor WhatsApp Admin untuk upload foto
  const ADMIN_WHATSAPP_NUMBER = '6285777177009'; // GANTI DENGAN NOMOR WHATSAPP ADMIN YANG SESUNGGUHNYA

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

  // Fetch dynamic Galeri data from Firestore
  useEffect(() => {
    if (!db || !isAuthReady) {
      return;
    }

    setLoadingData(true);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const collectionPath = `/artifacts/${appId}/galeri`; // Jalur koleksi galeri

    const unsubscribe = onSnapshot(query(collection(db, collectionPath)), (snapshot) => {
      const data: GaleriItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<GaleriItem, 'id'>,
        likes: (doc.data() as any).likes || 0, // Fallback likes to 0
        views: (doc.data() as any).views || 0, // Fallback views to 0
      }));
      // Sortir berita berdasarkan tanggal terbaru
      const sortedData = data.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setPhotosData(sortedData);
      setLoadingData(false);
      setDataError(null);
    }, (err) => {
      console.error(`Error fetching galeri: ${err.message}`);
      setDataError(`Failed to load gallery data: ${err.message}. Check Firestore rules for ${collectionPath}`);
      setPhotosData([]); // Reset to empty array on error
      setLoadingData(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, [db, isAuthReady]);

  // Definisi kategori statis, tapi count akan dihitung dinamis
  const staticCategories = [
    { id: 'all', name: 'Semua' },
    { id: 'alam', name: 'Alam' },
    { id: 'budaya', name: 'Budaya' },
    { id: 'kegiatan', name: 'Kegiatan' },
    { id: 'fasilitas', name: 'Fasilitas' },
    { id: 'lainnya', name: 'Lainnya' }, 
  ];

  // Hitung jumlah foto untuk setiap kategori secara dinamis
  const categoriesWithCount = staticCategories.map(cat => {
    const count = cat.id === 'all' 
      ? photosData.length 
      : photosData.filter(photoItem => photoItem.category === cat.id).length;
    return { ...cat, count };
  });

  const filteredPhotos = selectedCategory === 'all' 
    ? photosData 
    : photosData.filter(photo => photo.category === selectedCategory);

  const handleUploadPhotoViaWA = () => {
    const message = encodeURIComponent("Halo admin Desa Medalsari, saya ingin mengunggah foto untuk galeri desa. Bisakah saya mendapatkan instruksi?");
    window.open(`https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };


  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-screen font-sans text-xl text-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mr-3"></div>
        Memuat data galeri...
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="text-center p-6 text-red-700 bg-red-50 rounded-lg border border-red-200 mx-auto max-w-lg font-sans mt-20">
        <p className="font-semibold text-lg mb-2">Error Memuat Data Galeri!</p>
        <p className="text-base">{dataError}</p>
        <p className="text-sm mt-3">Pastikan koneksi internet Anda stabil dan aturan keamanan Firestore mengizinkan akses publik untuk koleksi galeri.</p>
      </div>
    );
  }

  if (photosData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center" data-aos="fade-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Galeri Foto</h1>
              <p className="text-xl text-purple-100">Potret kehidupan dan keindahan Desa Medalsari</p>
            </div>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-gray-600 text-lg">
          Tidak ada foto yang ditemukan.
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Galeri Foto</h1>
            <p className="text-xl text-purple-100">Potret kehidupan dan keindahan Desa Medalsari</p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-2 bg-white rounded-xl p-2 shadow-lg">
              {categoriesWithCount.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                data-aos="fade-up"
                data-aos-delay={index * 100}
                onClick={() => setSelectedImage(photo)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={photo.image || 'https://placehold.co/800x800/aabbcc/ffffff?text=No+Image'}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src = 'https://placehold.co/800x800/aabbcc/ffffff?text=Error';
                    }}
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-semibold mb-1">{photo.title}</h3>
                    <p className="text-sm text-gray-300">{photo.photographer}</p>
                  </div>
                </div>
                
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-5 h-5 text-gray-700" />
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{photo.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>{photo.likes || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span>{photo.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredPhotos.length === 0 && selectedCategory !== 'all' && (
                <div className="text-center text-gray-600 text-lg col-span-full">
                    Tidak ada foto dalam kategori ini.
                </div>
            )}
            {filteredPhotos.length === 0 && selectedCategory === 'all' && (
                <div className="text-center text-gray-600 text-lg col-span-full">
                    Tidak ada foto di galeri.
                </div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            
            <img
              src={selectedImage.image || 'https://placehold.co/800x800/aabbcc/ffffff?text=No+Image'}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src = 'https://placehold.co/800x800/aabbcc/ffffff?text=Error';
              }}
            />
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
              <p className="text-gray-300 mb-4">Foto oleh: {selectedImage.photographer}</p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>{selectedImage.likes || 0} likes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  <span>{selectedImage.views || 0} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section - Ubah menjadi WA Chat */}
      <section className="py-16 bg-gradient-to-r from-purple-500 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-aos="fade-up">
            <h2 className="text-3xl font-bold text-white mb-4">Punya Foto Menarik tentang Desa Medalsari?</h2>
            <p className="text-xl text-purple-100 mb-8">
              Bagikan momen indah Anda! Hubungi admin desa via WhatsApp untuk mengunggah foto.
            </p>
            <a // Mengubah button menjadi <a> untuk link WhatsApp
              href={`https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent('Halo admin, saya ingin mengupload foto untuk galeri desa.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" /> {/* Ganti ikon Camera menjadi MessageCircle */}
              <span>Chat Admin via WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Galeri;