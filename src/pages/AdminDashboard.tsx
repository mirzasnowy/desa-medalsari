import React, { useState, useEffect } from 'react';
import { initializeApp, FirebaseApp, getApps, FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously, Auth, User as FirebaseAuthUser } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, updateDoc, Firestore, query, where, orderBy } from 'firebase/firestore'; 

// Import all necessary Lucide icons, including X now
import {
  Users,
  FileText,
  MapPin,
  Store,
  Heart,
  Camera,
  Home, 
  User,
  LucideIcon, 
  Mail, 
  CheckCircle,
  X, // <--- PASTIKAN X DIIMPOR DI SINI
  Phone, // <--- PASTIKAN Phone DIIMPOR DI SINI jika digunakan
} from 'lucide-react';

// Import komponen yang telah dipisahkan
import Sidebar from '../components/Sidebar.tsx';
import Header from '../components/Header.tsx';
import DashboardOverview from '../components/DashboardComponents.tsx'; 
import DataPenduduk from '../components/DataPenduduk.tsx';
import AparaturDesa from '../components/AparaturDesa';
import Berita from '../components/Berita';
import Wisata from '../components/Wisata';
import UMKM from '../components/UMKM';
import KearifanLokal from '../components/KearifanLokal';
import Galeri from '../components/Galeri';
import ModalForm from '../components/ModalForm'; 

// Definisi Tipe Data yang Akurat
interface StatistikPendudukData { /* ... */ }
interface AparaturDesaItem { /* ... */ }
interface BeritaItem { /* ... */ }
interface UMKMItem { /* ... */ }
interface WisataItem { /* ... */ }
interface KearifanLokalItem { /* ... */ }
interface GaleriItem { /* ... */ }

// --- TIPE BARU UNTUK PESAN KONTAK ---
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  timestamp: Date; // Firestore Timestamp bisa diubah ke Date
  isRead: boolean;
}
// --- AKHIR TIPE BARU ---

interface DashboardDataType { /* ... */ }
interface MenuItem { /* ... */ }

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- STATE BARU UNTUK SEMUA PESAN (TERMASUK YANG SUDAH DIBACA) ---
  const [allMessages, setAllMessages] = useState<ContactMessage[]>([]); // Ganti newMessages menjadi allMessages
  const [showMessagesModal, setShowMessagesModal] = useState<boolean>(false);
  // --- AKHIR STATE BARU ---

  // Firebase related states
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk menyimpan data dari Firestore
  const [dashboardData, setDashboardData] = useState<any>({ /* Ini akan diisi oleh useEffect di bawah */ });

  // Konfigurasi Cloudinary Anda
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

  // Fetch all dashboard data (statistik, aparatur, berita, etc.) from Firestore
  useEffect(() => {
    if (!db || !isAuthReady) {
      return;
    }

    setLoading(true);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    const unsubscribes: (() => void)[] = [];
    let fetchedCount = 0;
    const totalFetches = 8; // Total data sources + messages

    const checkLoadingComplete = () => {
      fetchedCount++;
      if (fetchedCount === totalFetches) {
        setLoading(false);
        setError(null);
      }
    };

    // --- Data Penduduk (Dokumen Tunggal) ---
    const statistikDocPath = `/artifacts/${appId}/statistikPenduduk/data`; 
    unsubscribes.push(onSnapshot(doc(db, statistikDocPath), (docSnapshot) => {
      setDashboardData(prev => ({ ...prev, dataPenduduk: docSnapshot.exists() ? docSnapshot.data() : null }));
      checkLoadingComplete();
    }, (err) => { console.error(`Error fetching statistik: ${err.message}`); setError(`Failed to fetch statistik data: ${err.message}.`); checkLoadingComplete(); }));

    // --- Aparatur Desa (Koleksi) ---
    const aparaturCollectionPath = `/artifacts/${appId}/aparaturDesa`;
    unsubscribes.push(onSnapshot(query(collection(db, aparaturCollectionPath)), (snapshot) => {
      setDashboardData(prev => ({ ...prev, aparaturDesa: snapshot.docs.map(d => ({id:d.id, ...d.data()})) }));
      checkLoadingComplete();
    }, (err) => { console.error(`Error fetching aparaturDesa: ${err.message}`); setError(`Failed to fetch aparatur desa data: ${err.message}.`); checkLoadingComplete(); }));

    // --- Berita (Koleksi) ---
    const beritaCollectionPath = `/artifacts/${appId}/berita`;
    unsubscribes.push(onSnapshot(query(collection(db, beritaCollectionPath)), (snapshot) => {
      setDashboardData(prev => ({ ...prev, berita: snapshot.docs.map(d => ({id:d.id, ...d.data()})) }));
      checkLoadingComplete();
    }, (err) => { console.error(`Error fetching berita: ${err.message}`); setError(`Failed to fetch berita data: ${err.message}.`); checkLoadingComplete(); }));

    // --- UMKM (Koleksi) ---
    const umkmCollectionPath = `/artifacts/${appId}/umkm`;
    unsubscribes.push(onSnapshot(query(collection(db, umkmCollectionPath)), (snapshot) => {
      setDashboardData(prev => ({ ...prev, umkm: snapshot.docs.map(d => ({id:d.id, ...d.data()})) }));
      checkLoadingComplete();
    }, (err) => { console.error(`Error fetching umkm: ${err.message}`); setError(`Failed to fetch UMKM data: ${err.message}.`); checkLoadingComplete(); }));

    // --- Wisata (Koleksi) ---
    const wisataCollectionPath = `/artifacts/${appId}/wisata`;
    unsubscribes.push(onSnapshot(query(collection(db, wisataCollectionPath)), (snapshot) => {
      setDashboardData(prev => ({ ...prev, wisata: snapshot.docs.map(d => ({id:d.id, ...d.data()})) }));
      checkLoadingComplete();
    }, (err) => { console.error(`Error fetching wisata: ${err.message}`); setError(`Failed to fetch wisata data: ${err.message}.`); checkLoadingComplete(); }));

    // --- Kearifan Lokal (Koleksi) ---
    const kearifanLokalCollectionPath = `/artifacts/${appId}/kearifanLokal`;
    unsubscribes.push(onSnapshot(query(collection(db, kearifanLokalCollectionPath)), (snapshot) => {
      setDashboardData(prev => ({ ...prev, kearifanLokal: snapshot.docs.map(d => ({id:d.id, ...d.data()})) }));
      checkLoadingComplete();
    }, (err) => { console.error(`Error fetching kearifanLokal: ${err.message}`); setError(`Failed to fetch kearifan lokal data: ${err.message}.`); checkLoadingComplete(); }));

    // --- Galeri (Koleksi) ---
    const galeriCollectionPath = `/artifacts/${appId}/galeri`;
    unsubscribes.push(onSnapshot(query(collection(db, galeriCollectionPath)), (snapshot) => {
      setDashboardData(prev => ({ ...prev, galeri: snapshot.docs.map(d => ({id:d.id, ...d.data()})) }));
      checkLoadingComplete();
    }, (err) => { console.error(`Error fetching galeri: ${err.message}`); setError(`Failed to fetch galeri data: ${err.message}.`); checkLoadingComplete(); }));

    // --- PESAN MASUK (SEMUA PESAN) ---
    const messagesCollectionPath = `/artifacts/${appId}/messages`;
    unsubscribes.push(onSnapshot(
      // Mengambil SEMUA pesan, diurutkan berdasarkan isRead (false dulu) lalu timestamp
      query(collection(db, messagesCollectionPath), orderBy('isRead', 'asc'), orderBy('timestamp', 'desc')), // <--- MODIFIKASI QUERY DI SINI
      (snapshot) => {
        const messages: ContactMessage[] = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          email: doc.data().email,
          phone: doc.data().phone,
          subject: doc.data().subject,
          message: doc.data().message,
          timestamp: doc.data().timestamp.toDate(), // Konversi Timestamp Firestore ke Date
          isRead: doc.data().isRead,
        }));
        setAllMessages(messages); // <--- SIMPAN SEMUA PESAN DI allMessages
        checkLoadingComplete(); 
      },
      (err) => {
        console.error(`Error fetching messages: ${err.message}`);
        setError(`Failed to fetch messages: ${err.message}.`);
        checkLoadingComplete();
      }
    ));

    // Cleanup function: unsubscribe from all listeners when component unmounts
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [db, isAuthReady]);

  // Hitung jumlah pesan yang belum dibaca
  const unreadMessagesCount = allMessages.filter(msg => !msg.isRead).length;

  // Fungsi untuk menandai pesan sebagai sudah dibaca
  const markMessageAsRead = async (messageId: string) => {
    if (!db) return;
    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const messageDocRef = doc(db, `/artifacts/${appId}/messages`, messageId);
      await updateDoc(messageDocRef, { isRead: true });
      console.log(`Message ${messageId} marked as read.`);
    } catch (err) {
      console.error(`Error marking message ${messageId} as read:`, err);
    }
  };

  // Menu Items for Sidebar
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'dataPenduduk', label: 'Data Penduduk', icon: Users },
    { id: 'aparaturDesa', label: 'Perangkat Desa', icon: User },
    { id: 'berita', label: 'Berita', icon: FileText },
    { id: 'wisata', label: 'Wisata', icon: MapPin },
    { id: 'umkm', label: 'UMKM', icon: Store },
    { id: 'kearifanLokal', label: 'Kearifan Lokal', icon: Heart },
    { id: 'galeri', label: 'Galeri', icon: Camera },
  ];

  // Logic to render active content based on tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            dashboardData={dashboardData} 
            newMessagesCount={unreadMessagesCount} // Teruskan jumlah pesan belum dibaca
            onShowMessages={() => setShowMessagesModal(true)} // Teruskan handler untuk membuka modal pesan
          />
        );
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
          setSearchQuery={setSearchQuery}
          newMessagesCount={unreadMessagesCount} // Teruskan jumlah pesan belum dibaca ke Header
          onShowMessages={() => setShowMessagesModal(true)} // Teruskan handler
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

      {/* Modal untuk Menampilkan Pesan Masuk */}
      {showMessagesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-5 text-gray-800 border-b pb-3">Pesan Masuk ({unreadMessagesCount} Belum Dibaca)</h3> {/* Tampilkan jumlah belum dibaca */}
            <button
              onClick={() => setShowMessagesModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 rounded-full p-1 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {allMessages.length === 0 ? ( // Gunakan allMessages di sini
              <p className="text-gray-600 text-center py-8">Tidak ada pesan.</p>
            ) : (
              <div className="space-y-4">
                {allMessages.map(message => ( // Iterasi melalui allMessages
                  <div 
                    key={message.id} 
                    className={`border border-gray-200 rounded-lg p-4 ${message.isRead ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-gray-800'}`} // Gaya berbeda untuk pesan sudah dibaca
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <p className="font-semibold">{message.name} <span className="text-sm font-normal">({message.email})</span></p>
                        <p className="text-sm">Subjek: {message.subject}</p>
                      </div>
                      <span className="text-xs">{message.timestamp.toLocaleString()}</span>
                    </div>
                    <p className="text-sm mb-3">{message.message}</p>
                    {message.phone && (
                      <p className="text-xs flex items-center">
                        <Phone className="w-3 h-3 mr-1" /> Telp: {message.phone}
                      </p>
                    )}
                    {!message.isRead && ( // Hanya tampilkan tombol jika belum dibaca
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => markMessageAsRead(message.id)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-md bg-blue-100 hover:bg-blue-200 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Tandai Sudah Dibaca</span>
                        </button>
                      </div>
                    )}
                    {message.isRead && ( // Tampilkan status "Sudah Dibaca" jika sudah dibaca
                      <div className="flex justify-end mt-3">
                        <span className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          <span>Sudah Dibaca</span>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </div>
      )}

      {/* ModalForm tidak lagi dikelola oleh AdminDashboard, melainkan oleh masing-masing komponen CRUD */}
    </div>
  );
};

export default AdminDashboard;