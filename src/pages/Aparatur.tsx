import React, { useState, useEffect } from 'react';
import { MapPin, Award, Calendar } from 'lucide-react';

// Firebase Imports
import { initializeApp, FirebaseApp, getApps, FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously, Auth, User as FirebaseAuthUser } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, Firestore, query } from 'firebase/firestore';

// Definisi Tipe Data untuk Aparatur Desa (sesuai dengan yang Anda gunakan di komponen CRUD)
export interface AparaturDesaItem {
  id?: string;
  nama: string;
  jabatan: string;
  nip: string;
  foto: string;
  description?: string;
  experience?: string;
  education?: string;
  phone?: string;
  email?: string;
  urutanLevel?: number; // Sangat penting untuk hierarki
  urutanDalamLevel?: number; // Sangat penting untuk hierarki
}

// Tambahkan deklarasi global untuk config Firebase jika belum ada di file ini atau main entry point
declare global {
  var __firebase_config: string | undefined;
  var __app_id: string | undefined;
}

const PerangkatDesa = () => {
  const [officialsData, setOfficialsData] = useState<AparaturDesaItem[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

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
        if (!user) { // Sign in anonymously if no user is authenticated
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

  // Fetch dynamic Aparatur Desa data from Firestore
  useEffect(() => {
    if (!db || !isAuthReady) {
      return;
    }

    setLoadingData(true);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const collectionPath = `/artifacts/${appId}/aparaturDesa`;

    const unsubscribe = onSnapshot(query(collection(db, collectionPath)), (snapshot) => {
      const data: AparaturDesaItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<AparaturDesaItem, 'id'>,
        description: (doc.data() as any).description || '',
        experience: (doc.data() as any).experience || '',
        education: (doc.data() as any).education || '',
        phone: (doc.data() as any).phone || '',
        email: (doc.data() as any).email || '',
        urutanLevel: (doc.data() as any).urutanLevel || 99, 
        urutanDalamLevel: (doc.data() as any).urutanDalamLevel || 99,
      }));
      
      const sortedData = data.sort((a, b) => {
        if ((a.urutanLevel || 99) !== (b.urutanLevel || 99)) {
          return (a.urutanLevel || 99) - (b.urutanLevel || 99);
        }
        return (a.urutanDalamLevel || 99) - (b.urutanDalamLevel || 99);
      });
      setOfficialsData(sortedData);
      setLoadingData(false);
      setDataError(null);
    }, (err) => {
      console.error(`Error fetching aparatur desa: ${err.message}`);
      setDataError(`Failed to load Aparatur Desa data: ${err.message}. Check Firestore rules for ${collectionPath}`);
      setOfficialsData([]);
      setLoadingData(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, [db, isAuthReady]);

  // Kelompokkan pejabat untuk struktur organisasi
  const kepalaDesa = officialsData.find(o => o.jabatan === 'Kepala Desa');
  const sekretarisDesa = officialsData.find(o => o.jabatan === 'Sekretaris Desa');
  const kasiStaff = officialsData.filter(o => o.jabatan.startsWith('Kasi '));
  const kaurStaff = officialsData.filter(o => o.jabatan.startsWith('Kaur '));
  const kepalaDusun = officialsData.filter(o => o.jabatan.startsWith('Kepala Dusun '));

  // Fungsi untuk merender detail kartu pejabat kecil di bagan
  const renderChartOfficialCard = (official: AparaturDesaItem, bgColor: string, aosDelay: number) => (
    <div 
      key={official.id} 
      className={`relative ${bgColor} text-white px-3 py-2 rounded-lg font-semibold text-sm shadow-md min-w-[120px] max-w-[150px] flex flex-col items-center justify-center text-center group transition-all duration-300 hover:scale-105`}
      style={{ minHeight: '60px' }}
    >
      <img
        src={official.foto || 'https://placehold.co/100x100/aabbcc/ffffff?text=X'}
        alt={official.nama}
        className="absolute -top-8 -right-8 w-16 h-16 rounded-full border-2 border-white object-cover shadow-md transition-transform duration-300 group-hover:scale-110"
        onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/aabbcc/ffffff?text=Error'; }}
      />
      <span>{official.jabatan}</span>
      <span className="block text-xs mt-1 font-normal">{official.nama}</span>
    </div>
  );

  // Fungsi untuk merender detail kartu pejabat besar (untuk Officials Grid) - UPDATED VERSION
  const renderOfficialCard = (official: AparaturDesaItem, aosDelay: number) => (
    <div
      key={official.id}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border border-gray-100 h-full flex flex-col"
    >
      {/* Header dengan gradient */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
        
        <div className="relative text-center">
          <img
            src={official.foto || 'https://placehold.co/100x100/aabbcc/ffffff?text=No+Image'}
            alt={official.nama}
            className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg mb-4"
            onError={(e) => {
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/aabbcc/ffffff?text=Error';
            }}
          />
          <h3 className="text-xl font-bold mb-1">{official.nama}</h3>
          <div className="bg-white bg-opacity-20 rounded-full px-4 py-1 inline-block">
            <span className="text-sm font-medium">{official.jabatan}</span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Description */}
        <div className="mb-4 flex-1">
          {official.description ? (
            <p className="text-gray-600 text-sm leading-relaxed bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
              {official.description}
            </p>
          ) : (
            <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-300">
              <p className="text-gray-400 text-sm italic">Deskripsi tidak tersedia</p>
            </div>
          )}
        </div>
        
        {/* Info Grid */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start space-x-3 p-3 bg-emerald-50 rounded-lg min-h-[60px]">
            <Award className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700 block">Pengalaman</span>
              <span className="text-sm text-gray-600">
                {official.experience || 'Informasi pengalaman tidak tersedia'}
              </span>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg min-h-[60px]">
            <MapPin className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700 block">Pendidikan</span>
              <span className="text-sm text-gray-600">
                {official.education || 'Informasi pendidikan tidak tersedia'}
              </span>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Element */}
        <div className="pt-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Periode 2021-2029</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-screen font-sans text-xl text-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mr-3"></div>
        Memuat data aparatur desa...
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="text-center p-6 text-red-700 bg-red-50 rounded-lg border border-red-200 mx-auto max-w-lg font-sans mt-20">
        <p className="font-semibold text-lg mb-2">Error Memuat Data Aparatur Desa!</p>
        <p className="text-base">{dataError}</p>
        <p className="text-sm mt-3">Pastikan koneksi internet Anda stabil dan aturan keamanan Firestore mengizinkan akses publik untuk koleksi aparatur desa.</p>
      </div>
    );
  }

  if (officialsData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <section className="bg-gradient-to-r from-slate-600 to-gray-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Perangkat Desa</h1>
              <p className="text-xl text-slate-200">Struktur pemerintahan Desa Medalsari</p>
            </div>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-gray-600 text-lg">
          Tidak ada data aparatur desa yang ditemukan.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-slate-600 to-gray-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Perangkat Desa</h1>
            <p className="text-xl text-slate-200">Struktur pemerintahan Desa Medalsari</p>
          </div>
        </div>
      </section>

      {/* Officials Grid (Individual Cards) */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Daftar Pejabat</h2>
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {officialsData.map((official, index) => renderOfficialCard(official, index * 100))}
          </div>
        </div>
      </section>

      {/* Organizational Chart - Sesuai dengan gambar */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Struktur Organisasi</h2>
            <p className="text-xl text-gray-600">Susunan Organisasi Pemerintah Desa Medalsari</p>
            <p className="text-lg text-gray-500">Kecamatan Pangkalan Kabupaten Karawang</p>
            <p className="text-lg text-gray-500 font-semibold">Periode Tahun 2021 - 2029</p>
          </div>
          
          <div className="relative max-w-6xl mx-auto py-8">
            {/* BACKGROUND GARIS ABU-ABU (BOARD) */}
            <div className="absolute inset-0 bg-gray-200 opacity-50 rounded-lg z-0"></div>
            <div className="absolute inset-0 border-2 border-gray-300 rounded-lg z-0"></div>

            {/* Konten bagan dengan z-index di atas garis */}
            <div className="relative z-10 flex flex-col items-center">

              {/* Level 1: Kepala Desa */}
              {kepalaDesa && (
                <div className="flex flex-col items-center mb-8">
                  {renderChartOfficialCard(kepalaDesa, 'bg-blue-600', 0)}
                  {/* Garis vertikal dari Kepala Desa */}
                  <div className="w-1 h-12 bg-gray-400"></div>
                </div>
              )}
              
              {/* Percabangan Utama: Kasi, Sekretaris, Kepala Dusun */}
              <div className="flex justify-center w-full relative mb-12">
                {/* Garis horizontal percabangan */}
                <div className="absolute h-1 bg-gray-400 top-0 w-full" style={{ maxWidth: '70%' }}></div>
                
                {/* Garis vertikal dari percabangan ke masing-masing cabang */}
                {/* Kasi Branch Line */}
                <div className="absolute w-1 h-8 bg-gray-400 top-0 left-[calc(15%-4px)] translate-x-1/2"></div>
                {/* Sekretaris Branch Line */}
                <div className="absolute w-1 h-8 bg-gray-400 top-0 left-1/2 transform -translate-x-1/2"></div>
                {/* Kepala Dusun Branch Line */}
                <div className="absolute w-1 h-8 bg-gray-400 top-0 right-[calc(15%-4px)] -translate-x-1/2"></div>
                
                <div className="flex w-full justify-around items-start pt-8">
                  {/* Cabang Kasi */}
                  {kasiStaff.length > 0 && (
                    <div className="flex flex-col items-center mx-4 min-w-[200px]">
                      {kasiStaff.map((official, idx) => (
                        <React.Fragment key={official.id}>
                          {renderChartOfficialCard(official, 'bg-teal-600', 150 + idx * 50)}
                          {idx < kasiStaff.length - 1 && <div className="w-1 h-4 bg-gray-400"></div>}
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* Cabang Sekretaris & Kaur */}
                  {(sekretarisDesa || kaurStaff.length > 0) && (
                    <div className="flex flex-col items-center mx-4 min-w-[200px]">
                      {sekretarisDesa && (
                        <div className="flex flex-col items-center">
                          {renderChartOfficialCard(sekretarisDesa, 'bg-emerald-600', 250)}
                          {kaurStaff.length > 0 && <div className="w-1 h-12 bg-gray-400"></div>}
                        </div>
                      )}
                      
                      {kaurStaff.length > 0 && (
                        <div className="flex flex-col items-center">
                          {kaurStaff.map((official, idx) => (
                            <React.Fragment key={official.id}>
                              {renderChartOfficialCard(official, 'bg-purple-600', 300 + idx * 50)}
                              {idx < kaurStaff.length - 1 && <div className="w-1 h-4 bg-gray-400"></div>}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cabang Kepala Dusun */}
                  {kepalaDusun.length > 0 && (
                    <div className="flex flex-col items-center mx-4 min-w-[200px]">
                      {kepalaDusun.map((official, idx) => (
                        <React.Fragment key={official.id}>
                          {renderChartOfficialCard(official, 'bg-orange-600', 350 + idx * 50)}
                          {idx < kepalaDusun.length - 1 && <div className="w-1 h-4 bg-gray-400"></div>}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info (STILL STATIC) */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Jam Pelayanan</h2>
            <p className="text-xl text-gray-600">Jadwal pelayanan kantor desa</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Hari Kerja</h3>
              <p className="text-gray-600">Senin - Jumat<br />08:00 - 16:00 WIB</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Sabtu</h3>
              <p className="text-gray-600">Sabtu<br />08:00 - 12:00 WIB</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Minggu</h3>
              <p className="text-gray-600">Minggu<br />Tutup</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PerangkatDesa;