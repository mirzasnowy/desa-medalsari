// AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { initializeApp, FirebaseApp, getApps, FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously, Auth, User as FirebaseAuthUser } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, Firestore, query } from 'firebase/firestore';

// Import all necessary Lucide icons, including HOME now
import {
  Users,
  FileText,
  MapPin,
  Store,
  Heart,
  Camera,
  Home, // <-- ADDED THIS IMPORT
  User,
  LucideIcon, // Import LucideIcon type
} from 'lucide-react';

// Import komponen yang telah dipisahkan
import Sidebar from '../components/Sidebar.tsx';
import Header from '../components/Header.tsx';
import DashboardOverview from '../components/DashboardComponents.tsx'; // Ini adalah DashboardOverview Anda
import DataPenduduk from '../components/DataPenduduk.tsx';
import AparaturDesa from '../components/AparaturDesa';
import Berita from '../components/Berita';
import Wisata from '../components/Wisata';
import UMKM from '../components/UMKM';
import KearifanLokal from '../components/KearifanLokal';
import Galeri from '../components/Galeri';
import ModalForm from '../components/ModalForm'; // Jika Anda memiliki ModalForm terpusat

// Definisi Tipe Data yang Akurat (Konsisten dengan definisi di komponen CRUD Anda)
// --- START: Type Definitions ---
interface StatistikPendudukData {
  id?: string; // Akan menjadi 'data' di Firestore
  totalPenduduk: number;
  kepalaKeluarga: number;
  anakAnak: number;
  dewasa: number;
  distribusiJenisKelamin: { lakiLaki: number; perempuan: number; };
  distribusiUsia: { '0-14': number; '15-64': number; '65+': number; };
  tingkatPendidikan: { tidakSekolah: number; sd: number; smp: number; sma: number; sarjana: number; lainnya: number; };
  mataPencarian: { petani: number; pedagang: number; pns: number; karyawanSwasta: number; wiraswasta: number; lainnya: number; };
}

interface AparaturDesaItem {
  id?: string;
  nama: string;
  jabatan: string;
  nip: string;
  foto: string;
}

interface BeritaItem {
  id?: string;
  title: string;
  excerpt: string; // Tambahkan ini jika ada di Firestore
  content: string; // Tambahkan ini jika ada di Firestore
  image: string; // Tambahkan ini jika ada di Firestore
  category: string;
  author: string; // Tambahkan ini jika ada di Firestore
  date: string;
  featured: boolean; // Tambahkan ini jika ada di Firestore
  status: 'Published' | 'Draft';
}

interface UMKMItem {
  id?: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  price: string;
  category: string;
  products: string[];
  contact: string;
  established: string;
  employees: string;
}

interface WisataItem {
  id?: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  price: string;
  hours: string;
  facilities: string[];
  contact: string;
}

interface KearifanLokalItem {
  id?: string;
  name: string;
  description: string;
  image: string;
  category: string;
  philosophy: string;
  practices: string[];
  benefits: string[];
  iconName: string;
  colorClass: string;
  status: 'Aktif' | 'Perlu Revitalisasi';
}

interface GaleriItem {
  id?: string;
  title: string;
  category: string;
  date: string;
  image: string;
  photographer: string;
}

// Tipe untuk data dashboard yang akan diteruskan ke DashboardOverview
// Perhatikan 'dataPenduduk' adalah objek tunggal, bukan array
interface DashboardDataType {
  dataPenduduk: StatistikPendudukData | null;
  aparaturDesa: AparaturDesaItem[];
  berita: BeritaItem[];
  wisata: WisataItem[];
  umkm: UMKMItem[];
  kearifanLokal: KearifanLokalItem[];
  galeri: GaleriItem[];
}
// --- END: Type Definitions ---


// Definisi tipe untuk item menu
interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon; // Pastikan LucideIcon diimpor dari lucide-react
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(''); // State untuk pencarian global

  // Firebase related states
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk menyimpan data dari Firestore
  const [dashboardData, setDashboardData] = useState<DashboardDataType>({
    dataPenduduk: null,
    aparaturDesa: [],
    berita: [],
    wisata: [],
    umkm: [],
    kearifanLokal: [],
    galeri: [],
  });

  // Konfigurasi Cloudinary Anda (jika diperlukan oleh ModalForm terpusat)
  const CLOUDINARY_CLOUD_NAME = 'dkwin6gga';
  const CLOUDINARY_UPLOAD_PRESET = 'medalsari-image';

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
        setError("Firebase config not found or empty. UI will load, but data operations might not work. Ensure '__firebase_config' is set correctly.");
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
        if (user) {
          setUserId(user.uid);
        } else {
          try {
            const anonUser = await signInAnonymously(firebaseAuth);
            setUserId(anonUser.user.uid);
          } catch (anonError: any) {
            console.error("Error signing in anonymously:", anonError);
            setError(`Authentication error: ${anonError.message}`);
          }
        }
        setIsAuthReady(true);
      });

      return () => unsubscribeAuth();
    } catch (e: any) {
      console.error("Failed to initialize Firebase:", e);
      setError(`Firebase initialization error: ${e.message}`);
      setLoading(false);
    }
  }, []);

  // Fetch all dashboard data from Firestore
  useEffect(() => {
    if (!db || !isAuthReady) {
      return;
    }

    setLoading(true);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    const unsubscribes: (() => void)[] = [];
    let fetchedCount = 0;
    const totalFetches = 7; // Total number of data sources

    const checkLoadingComplete = () => {
      fetchedCount++;
      if (fetchedCount === totalFetches) {
        setLoading(false);
        setError(null); // Clear any previous errors on successful data load
      }
    };

    // --- Data Penduduk (Dokumen Tunggal) ---
    const statistikDocPath = `/artifacts/${appId}/statistikPenduduk/data`; // Jalur dokumen tunggal
    const statistikDocRef = doc(db, statistikDocPath);
    unsubscribes.push(onSnapshot(statistikDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setDashboardData(prev => ({ ...prev, dataPenduduk: docSnapshot.data() as StatistikPendudukData }));
      } else {
        setDashboardData(prev => ({ ...prev, dataPenduduk: null })); // Jika dokumen tidak ada
      }
      checkLoadingComplete();
    }, (err) => {
      console.error(`Error fetching statistikPenduduk: ${err.message}`);
      setError(`Failed to fetch statistik data: ${err.message}. Check Firestore rules for ${statistikDocPath}`);
      checkLoadingComplete();
    }));

    // --- Aparatur Desa (Koleksi) ---
    const aparaturCollectionPath = `/artifacts/${appId}/aparaturDesa`;
    unsubscribes.push(onSnapshot(query(collection(db, aparaturCollectionPath)), (snapshot) => {
      const data: AparaturDesaItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<AparaturDesaItem, 'id'>
      }));
      setDashboardData(prev => ({ ...prev, aparaturDesa: data }));
      checkLoadingComplete();
    }, (err) => {
      console.error(`Error fetching aparaturDesa: ${err.message}`);
      setError(`Failed to fetch aparatur desa data: ${err.message}. Check Firestore rules for ${aparaturCollectionPath}`);
      checkLoadingComplete();
    }));

    // --- Berita (Koleksi) ---
    const beritaCollectionPath = `/artifacts/${appId}/berita`;
    unsubscribes.push(onSnapshot(query(collection(db, beritaCollectionPath)), (snapshot) => {
      const data: BeritaItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<BeritaItem, 'id'>
      }));
      setDashboardData(prev => ({ ...prev, berita: data }));
      checkLoadingComplete();
    }, (err) => {
      console.error(`Error fetching berita: ${err.message}`);
      setError(`Failed to fetch berita data: ${err.message}. Check Firestore rules for ${beritaCollectionPath}`);
      checkLoadingComplete();
    }));

    // --- UMKM (Koleksi) ---
    const umkmCollectionPath = `/artifacts/${appId}/umkm`;
    unsubscribes.push(onSnapshot(query(collection(db, umkmCollectionPath)), (snapshot) => {
      const data: UMKMItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<UMKMItem, 'id'>
      }));
      setDashboardData(prev => ({ ...prev, umkm: data }));
      checkLoadingComplete();
    }, (err) => {
      console.error(`Error fetching umkm: ${err.message}`);
      setError(`Failed to fetch UMKM data: ${err.message}. Check Firestore rules for ${umkmCollectionPath}`);
      checkLoadingComplete();
    }));

    // --- Wisata (Koleksi) ---
    const wisataCollectionPath = `/artifacts/${appId}/wisata`;
    unsubscribes.push(onSnapshot(query(collection(db, wisataCollectionPath)), (snapshot) => {
      const data: WisataItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<WisataItem, 'id'>
      }));
      setDashboardData(prev => ({ ...prev, wisata: data }));
      checkLoadingComplete();
    }, (err) => {
      console.error(`Error fetching wisata: ${err.message}`);
      setError(`Failed to fetch wisata data: ${err.message}. Check Firestore rules for ${wisataCollectionPath}`);
      checkLoadingComplete();
    }));

    // --- Kearifan Lokal (Koleksi) ---
    const kearifanLokalCollectionPath = `/artifacts/${appId}/kearifanLokal`;
    unsubscribes.push(onSnapshot(query(collection(db, kearifanLokalCollectionPath)), (snapshot) => {
      const data: KearifanLokalItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<KearifanLokalItem, 'id'>
      }));
      setDashboardData(prev => ({ ...prev, kearifanLokal: data }));
      checkLoadingComplete();
    }, (err) => {
      console.error(`Error fetching kearifanLokal: ${err.message}`);
      setError(`Failed to fetch kearifan lokal data: ${err.message}. Check Firestore rules for ${kearifanLokalCollectionPath}`);
      checkLoadingComplete();
    }));

    // --- Galeri (Koleksi) ---
    const galeriCollectionPath = `/artifacts/${appId}/galeri`;
    unsubscribes.push(onSnapshot(query(collection(db, galeriCollectionPath)), (snapshot) => {
      const data: GaleriItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<GaleriItem, 'id'>
      }));
      setDashboardData(prev => ({ ...prev, galeri: data }));
      checkLoadingComplete();
    }, (err) => {
      console.error(`Error fetching galeri: ${err.message}`);
      setError(`Failed to fetch galeri data: ${err.message}. Check Firestore rules for ${galeriCollectionPath}`);
      checkLoadingComplete();
    }));


    // Cleanup function: unsubscribe from all listeners when component unmounts
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [db, isAuthReady]); // Dependencies for useEffect

  // Menu Items for Sidebar
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'dataPenduduk', label: 'Data Penduduk', icon: Users },
    { id: 'aparaturDesa', label: 'Aparatur Desa', icon: User },
    { id: 'berita', label: 'Berita', icon: FileText },
    { id: 'wisata', label: 'Wisata', icon: MapPin },
    { id: 'umkm', label: 'UMKM', icon: Store },
    { id: 'kearifanLokal', label: 'Kearifan Lokal', icon: Heart },
    { id: 'galeri', label: 'Galeri', icon: Camera },
  ];

  // Logic to render active content based on tab
  const renderContent = () => {
    // These individual CRUD components (DataPenduduk, AparaturDesa, etc.)
    // now handle their own data fetching. We just pass them common props.
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview dashboardData={dashboardData} />;
      case 'dataPenduduk':
        return (
          <DataPenduduk
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            menuItems={menuItems}
          />
        );
      case 'aparaturDesa':
        return (
          <AparaturDesa
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            menuItems={menuItems}
          />
        );
      case 'berita':
        return (
          <Berita
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            menuItems={menuItems}
          />
        );
      case 'wisata':
        return (
          <Wisata
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            menuItems={menuItems}
          />
        );
      case 'umkm':
        return (
          <UMKM
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            menuItems={menuItems}
          />
        );
      case 'kearifanLokal':
        return (
          <KearifanLokal
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            menuItems={menuItems}
          />
        );
      case 'galeri':
        return (
          <Galeri
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            menuItems={menuItems}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-600">Memuat data dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-700 bg-red-50 rounded-lg border border-red-200 mx-4 font-sans">
        <p className="font-semibold text-lg mb-2">Terjadi Kesalahan! 😟</p>
        <p className="text-base">{error}</p>
        <p className="text-sm mt-3">Pastikan Firebase dikonfigurasi dengan benar dan aturan keamanan Firestore mengizinkan akses.</p>
        {userId && (
          <p className="text-sm mt-2">
            User ID Aktif: <code className="bg-gray-200 px-2 py-1 rounded text-gray-800 break-all">{userId}</code>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        menuItems={menuItems}
      />

      {/* Main content */}
      <div className="lg:ml-64 flex-1">
        {/* Header */}
        <Header
          activeTab={activeTab}
          menuItems={menuItems}
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
          setSearchQuery={setSearchQuery} // Pass setSearchQuery to Header for search bar
        />

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {/* Modal overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ModalForm tidak lagi dikelola oleh AdminDashboard, melainkan oleh masing-masing komponen CRUD */}
      {/* Jika Anda memiliki ModalForm terpusat yang perlu diakses oleh AdminDashboard, 
          Anda perlu meneruskan props CLOUDINARY_CLOUD_NAME dan CLOUDINARY_UPLOAD_PRESET kepadanya. */}
    </div>
  );
};

export default AdminDashboard;