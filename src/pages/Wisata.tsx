import React, { useEffect, useState } from 'react';
import { MapPin, Clock, Star, Phone, ExternalLink } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Firebase Imports
import { initializeApp, FirebaseApp, getApps, FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously, Auth, User as FirebaseAuthUser } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, Firestore, query } from 'firebase/firestore';

// Definisi tipe untuk item Wisata (sesuai dengan yang Anda gunakan di komponen CRUD)
export interface WisataItem {
  id?: string; // Firestore ID will be a string
  name: string;
  description: string;
  image: string; // URL gambar
  rating: number;
  price: string; // e.g., "Rp 15.000"
  hours: string; // e.g., "08:00 - 17:00"
  facilities: string[]; // Array of strings
  contact: string; // e.g., "+62 812 3456 7890"
}

// Tambahkan deklarasi global untuk config Firebase jika belum ada di file ini atau main entry point
declare global {
  var __firebase_config: string | undefined;
  var __app_id: string | undefined;
}


const Wisata = () => {
  // State untuk data dinamis dari Firebase
  const [destinationsData, setDestinationsData] = useState<WisataItem[]>([]);
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

  // Fetch dynamic Wisata data from Firestore
  useEffect(() => {
    if (!db || !isAuthReady) {
      return;
    }

    setLoadingData(true);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const collectionPath = `/artifacts/${appId}/wisata`; // Jalur koleksi wisata

    const unsubscribe = onSnapshot(query(collection(db, collectionPath)), (snapshot) => {
      const data: WisataItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<WisataItem, 'id'>,
        // Pastikan properti array seperti facilities selalu array
        facilities: (doc.data() as any).facilities || [],
      }));
      // Anda bisa menambahkan sorting jika perlu, misal berdasarkan rating atau nama
      const sortedData = data.sort((a, b) => b.rating - a.rating); // Sort by rating descending
      setDestinationsData(sortedData);
      setLoadingData(false);
      setDataError(null);
    }, (err) => {
      console.error(`Error fetching wisata: ${err.message}`);
      setDataError(`Failed to load tourism data: ${err.message}. Check Firestore rules for ${collectionPath}`);
      setDestinationsData([]); // Reset to empty array on error
      setLoadingData(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, [db, isAuthReady]);


  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-screen font-sans text-xl text-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mr-3"></div>
        Memuat data wisata...
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="text-center p-6 text-red-700 bg-red-50 rounded-lg border border-red-200 mx-auto max-w-lg font-sans mt-20">
        <p className="font-semibold text-lg mb-2">Error Memuat Data Wisata!</p>
        <p className="text-base">{dataError}</p>
        <p className="text-sm mt-3">Pastikan koneksi internet Anda stabil dan aturan keamanan Firestore mengizinkan akses publik untuk koleksi wisata.</p>
      </div>
    );
  }

  if (destinationsData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <section className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center" data-aos="fade-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Wisata Desa Medalsari</h1>
              <p className="text-xl text-emerald-100">Jelajahi keindahan alam dan budaya yang menakjubkan</p>
            </div>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-gray-600 text-lg">
          Tidak ada data tempat wisata yang ditemukan.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Wisata Desa Medalsari</h1>
            <p className="text-xl text-emerald-100">Jelajahi keindahan alam dan budaya yang menakjubkan</p>
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {destinationsData.map((destination, index) => (
              <div 
                key={destination.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={destination.image || 'https://placehold.co/800x480/aabbcc/ffffff?text=No+Image'} 
                    alt={destination.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src = 'https://placehold.co/800x480/aabbcc/ffffff?text=Error';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{destination.rating}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{destination.name}</h3>
                  <p className="text-gray-600 mb-4">{destination.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      <span>{destination.hours}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span>Tiket: {destination.price}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Fasilitas:</p>
                    <div className="flex flex-wrap gap-2">
                      {destination.facilities && destination.facilities.length > 0 ? (
                        destination.facilities.map((facility, idx) => (
                          <span key={idx} className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">
                            {facility}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-xs">Tidak ada fasilitas tersedia.</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <a 
                      href={`https://wa.me/${destination.contact.replace(/\D/g, '')}`}
                      target="_blank" // Tambahkan ini agar link terbuka di tab baru
                      rel="noopener noreferrer" // Praktik keamanan yang baik
                      className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Hubungi</span>
                    </a>
                    {/* Tombol Detail sementara tidak memiliki jalur routing spesifik */}
                    <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>Detail</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-aos="fade-up">
            <h2 className="text-3xl font-bold text-white mb-4">Butuh Bantuan Perencanaan Wisata?</h2>
            <p className="text-xl text-emerald-100 mb-8">
              Tim kami siap membantu Anda merencanakan perjalanan wisata yang tak terlupakan
            </p>
            <div className="space-x-4">
              <a 
                href="https://wa.me/6281234567890" // Ganti dengan nomor kontak spesifik jika ada
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-emerald-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
              >
                <Phone className="w-5 h-5" />
                <span>Hubungi Pemandu Wisata</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Wisata;