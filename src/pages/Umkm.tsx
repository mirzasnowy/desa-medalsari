import React, { useEffect, useState } from 'react';
import { MapPin, Clock, Star, Phone, ExternalLink, ShoppingBag, Award, Users } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom'; // Import Link dari react-router-dom

// Firebase Imports
import { initializeApp, FirebaseApp, getApps, FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously, Auth, User as FirebaseAuthUser } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, Firestore, query } from 'firebase/firestore';

// Definisi tipe untuk item UMKM (sesuai dengan yang Anda gunakan di komponen CRUD)
export interface UMKMItem {
  id?: string; // Firestore ID will be a string
  name: string;
  description: string;
  image: string; // URL gambar
  rating: number;
  price: string; // e.g., "Rp 15.000 - 25.000"
  category: string; // e.g., "Makanan & Minuman", "Kerajinan Tangan"
  products: string[]; // Array of strings, e.g., ['Keripik Original', 'Keripik Balado']
  contact: string; // e.g., "+62 812 3456 7890"
  established: string; // e.g., "2018"
  employees: string; // e.g., "5 orang"
  latitude?: number; // Tambahkan properti untuk koordinat
  longitude?: number;
  address?: string; // Tambahkan properti untuk alamat
}

// Tambahkan deklarasi global untuk config Firebase jika belum ada di file ini atau main entry point
declare global {
  var __firebase_config: string | undefined;
  var __app_id: string | undefined;
}


const UMKM = () => {
  // State untuk data dinamis dari Firebase
  const [umkmData, setUmkmData] = useState<UMKMItem[]>([]);
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

  // Fetch dynamic UMKM data from Firestore
  useEffect(() => {
    if (!db || !isAuthReady) {
      return;
    }

    setLoadingData(true);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const collectionPath = `/artifacts/${appId}/umkm`; // Jalur koleksi UMKM

    const unsubscribe = onSnapshot(query(collection(db, collectionPath)), (snapshot) => {
      const data: UMKMItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<UMKMItem, 'id'>,
        // Pastikan properti array seperti products selalu array
        products: (doc.data() as any).products || [],
        // Pastikan properti baru geolocation juga dipetakan
        latitude: (doc.data() as any).latitude,
        longitude: (doc.data() as any).longitude,
        address: (doc.data() as any).address || '',
      }));
      // Anda bisa menambahkan sorting jika perlu, misal berdasarkan rating atau nama
      const sortedData = data.sort((a, b) => b.rating - a.rating); // Sort by rating descending
      setUmkmData(sortedData);
      setLoadingData(false);
      setDataError(null);
    }, (err) => {
      console.error(`Error fetching UMKM: ${err.message}`);
      setDataError(`Failed to load UMKM data: ${err.message}. Check Firestore rules for ${collectionPath}`);
      setUmkmData([]); // Reset to empty array on error
      setLoadingData(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, [db, isAuthReady]);


  // Hitung statistik dinamis dari umkmData
  const totalProducts = umkmData.reduce((sum, umkm) => sum + (umkm.products?.length || 0), 0);
  const totalUMKMPelaku = umkmData.length;
  // Hitung tahun berpengalaman dari data UMKM yang ada
  const yearsOfExperience = umkmData.reduce((maxYear, umkm) => {
    const establishedYear = parseInt(umkm.established, 10);
    if (!isNaN(establishedYear) && establishedYear > 0) { // Pastikan tahun valid dan bukan 0
      return Math.max(maxYear, new Date().getFullYear() - establishedYear);
    }
    return maxYear;
  }, 0); 

  const stats = [
    { icon: ShoppingBag, label: 'Produk UMKM', value: `${totalProducts > 0 ? totalProducts : '0'}+`, color: 'bg-amber-500' },
    { icon: Users, label: 'Pelaku UMKM', value: `${totalUMKMPelaku > 0 ? totalUMKMPelaku : '0'}+`, color: 'bg-amber-500' },
    { icon: Award, label: 'Tahun Berpengalaman', value: `${yearsOfExperience > 0 ? yearsOfExperience : '0'}+`, color: 'bg-amber-500' },
  ];


  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-screen font-sans text-xl text-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mr-3"></div>
        Memuat data UMKM...
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="text-center p-6 text-red-700 bg-red-50 rounded-lg border border-red-200 mx-auto max-w-lg font-sans mt-20">
        <p className="font-semibold text-lg mb-2">Error Memuat Data UMKM!</p>
        <p className="text-base">{dataError}</p>
        <p className="text-sm mt-3">Pastikan koneksi internet Anda stabil dan aturan keamanan Firestore mengizinkan akses publik untuk koleksi UMKM.</p>
      </div>
    );
  }

  if (umkmData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <section className="bg-gradient-to-r from-amber-600 to-orange-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center" data-aos="fade-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">UMKM Desa Medalsari</h1>
              <p className="text-xl text-amber-100">Dukung produk lokal berkualitas dari masyarakat desa</p>
            </div>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-gray-600 text-lg">
          Tidak ada data UMKM yang ditemukan.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-amber-600 to-orange-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">UMKM Desa Medalsari</h1>
            <p className="text-xl text-amber-100">Dukung produk lokal berkualitas dari masyarakat desa</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index}
                  data-aos="fade-up" 
                  data-aos-delay={index * 100}
                >
                  <div className={`w-16 h-16 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* UMKM Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {umkmData.map((umkm, index) => (
              <div 
                key={umkm.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={umkm.image || 'https://placehold.co/800x480/aabbcc/ffffff?text=No+Image'} 
                    alt={umkm.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src = 'https://placehold.co/800x480/aabbcc/ffffff?text=Error';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{umkm.rating}</span>
                  </div>
                  <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {umkm.category}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{umkm.name}</h3>
                  <p className="text-gray-600 mb-4">{umkm.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      <span>Harga: {umkm.price}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>Berdiri: {umkm.established} • {umkm.employees}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Produk Unggulan:</p>
                    <div className="flex flex-wrap gap-2">
                      {umkm.products && umkm.products.length > 0 ? (
                        umkm.products.slice(0, 3).map((product, idx) => (
                          <span key={idx} className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                            {product}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-xs">Tidak ada produk unggulan.</span>
                      )}
                      {umkm.products && umkm.products.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          +{umkm.products.length - 3} lainnya
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <a 
                      href={`https://wa.me/${umkm.contact.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Pesan</span>
                    </a>
                    <Link 
                      to={`/umkm/${umkm.id}`} // Link ke halaman detail UMKM
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Detail</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {umkmData.length === 0 && (
                <div className="text-center text-gray-600 text-lg col-span-full">
                    Tidak ada UMKM yang ditemukan.
                </div>
            )}
          </div>
        </div>
      </section>

      {/* Support Local Section */}
      <section className="py-16 bg-gradient-to-r from-amber-500 to-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-aos="fade-up">
            <h2 className="text-3xl font-bold text-white mb-4">Mari Dukung UMKM Lokal</h2>
            <p className="text-xl text-amber-100 mb-8">
              Dengan membeli produk UMKM, Anda turut mendukung perekonomian masyarakat desa
            </p>
            <div className="space-x-4">
              <a 
                href="https://wa.me/6281234567890" // Ganti dengan nomor kontak spesifik jika ada
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-amber-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
              >
                <Phone className="w-5 h-5" />
                <span>Hubungi Koordinator UMKM</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Kemitraan & Dukungan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              UMKM Desa Medalsari telah mendapat dukungan dari berbagai pihak untuk pengembangan usaha
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center" data-aos="fade-up">
              <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Sertifikasi Halal</h3>
              <p className="text-sm text-gray-600">Produk makanan tersertifikasi halal</p>
            </div>
            
            <div className="text-center" data-aos="fade-up" data-aos-delay="100">
              <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Pelatihan Bisnis</h3>
              <p className="text-sm text-gray-600">Pelatihan manajemen dan pemasaran</p>
            </div>
            
            <div className="text-center" data-aos="fade-up" data-aos-delay="200">
              <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Komunitas UMKM</h3>
              <p className="text-sm text-gray-600">Jaringan kerja sama antar UMKM</p>
            </div>
            
            <div className="text-center" data-aos="fade-up" data-aos-delay="300">
              <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Platform Digital</h3>
              <p className="text-sm text-gray-600">Akses pasar online yang lebih luas</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UMKM;