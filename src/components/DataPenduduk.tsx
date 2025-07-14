import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Save, X, Users, Home, Baby, User, Plus } from 'lucide-react'; 
import { initializeApp, FirebaseApp, getApps, FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously, Auth, User as FirebaseAuthUser } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  Firestore,
  onSnapshot,
} from 'firebase/firestore';

// Definisi tipe untuk data statistik penduduk
export interface StatistikPendudukData {
  id?: string; // Firestore ID dokumen, akan menjadi 'data'
  totalPenduduk: number;
  kepalaKeluarga: number;
  anakAnak: number; // 0-14 tahun
  dewasa: number; // 15-64 tahun
  // Distribusi Jenis Kelamin
  distribusiJenisKelamin: {
    lakiLaki: number;
    perempuan: number;
  };
  // Distribusi Usia (contoh, bisa lebih detail)
  distribusiUsia: {
    '0-14': number;
    '15-64': number;
    '65+': number;
  };
  // Tingkat Pendidikan (contoh)
  tingkatPendidikan: {
    tidakSekolah: number;
    sd: number;
    smp: number;
    sma: number;
    sarjana: number;
    lainnya: number;
  };
  // Mata Pencarian (contoh)
  mataPencarian: {
    petani: number;
    pedagang: number;
    pns: number;
    karyawanSwasta: number;
    wiraswasta: number;
    lainnya: number;
  };
}

// Props untuk komponen DataPenduduk
interface DataPendudukProps {
  menuItems: { id: string; label: string; icon: LucideIcon }[];
}

// Default Data untuk inisialisasi jika tidak ada dokumen di Firestore
const DEFAULT_STATISTIK_DATA: StatistikPendudukData = {
    totalPenduduk: 0,
    kepalaKeluarga: 0,
    anakAnak: 0,
    dewasa: 0,
    distribusiJenisKelamin: { lakiLaki: 0, perempuan: 0 },
    distribusiUsia: { '0-14': 0, '15-64': 0, '65+': 0 },
    tingkatPendidikan: { tidakSekolah: 0, sd: 0, smp: 0, sma: 0, sarjana: 0, lainnya: 0 },
    mataPencarian: { petani: 0, pedagang: 0, pns: 0, karyawanSwasta: 0, wiraswasta: 0, lainnya: 0 },
};


const DataPenduduk: React.FC<DataPendudukProps> = ({ menuItems }) => {
  const [statistikData, setStatistikData] = useState<StatistikPendudukData | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState<StatistikPendudukData | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [userId, setUserId] = useState<string | null>(null); 
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Firebase Initialization and Authentication
  useEffect(() => {
    let firebaseConfig: FirebaseOptions | null = null;
    try {
      if (typeof __firebase_config !== 'undefined' && __firebase_config.trim() !== '') {
        firebaseConfig = JSON.parse(__firebase_config);
        console.log("Firebase config loaded from __firebase_config.");
      } else {
        console.warn("Firebase config (__firebase_config) is undefined or empty. Using dummy config. Firestore operations will not work.");
        firebaseConfig = {
          apiKey: "dummy-api-key",
          authDomain: "dummy-auth-domain.firebaseapp.com",
          projectId: "dummy-project-id",
          storageBucket: "dummy-storage-bucket.appspot.com",
          messagingSenderId: "dummy-sender-id",
          appId: "dummy-app-id"
        };
        setError("Konfigurasi Firebase tidak ditemukan atau kosong. UI akan dimuat, tetapi operasi data tidak akan berfungsi. Pastikan '__firebase_config' disetel dengan benar.");
      }

      let app: FirebaseApp;
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        console.log("Firebase app initialized.");
      } else {
        app = getApps()[0]; 
        console.log("Using existing Firebase app.");
      }

      const firestore: Firestore = getFirestore(app);
      const firebaseAuth: Auth = getAuth(app);

      setDb(firestore);
      setAuth(firebaseAuth);

      const unsubscribeAuth = firebaseAuth.onAuthStateChanged(async (user: FirebaseAuthUser | null) => {
        if (user) {
          setUserId(user.uid);
          console.log("User authenticated:", user.uid);
        } else {
          try {
            const anonUser = await signInAnonymously(firebaseAuth);
            setUserId(anonUser.user.uid);
            console.log("Signed in anonymously:", anonUser.user.uid);
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
      if (e.message.includes("Firebase App named '[DEFAULT]' already exists")) {
        setError("Firebase sudah diinisialisasi di tempat lain dengan konfigurasi berbeda. Pastikan Firebase hanya diinisialisasi sekali di aplikasi Anda.");
      } else if (e.message.includes("Firebase config")) {
        setError(`Kesalahan konfigurasi Firebase: ${e.message}. Pastikan __firebase_config valid.`);
      } else {
        setError(`Firebase initialization error: ${e.message}`);
      }
      setLoading(false);
    }
  }, []);

  // Fetch data from Firestore
  useEffect(() => {
    console.log("Statistik data fetching useEffect triggered.");
    console.log("db:", db ? "initialized" : "null", "isAuthReady:", isAuthReady);

    if (!db || !isAuthReady) {
      console.log("Conditions not met for data fetching. Returning.");
      if (!error && !loading) {
          const fallbackTimeout = setTimeout(() => {
              setLoading(false);
              // Jika tidak ada data dan tidak ada error konfigurasi Firebase
              if (!statistikData && !error?.includes("Konfigurasi Firebase tidak ditemukan")) {
                  setError("Data statistik belum dimuat atau tidak ditemukan. Silakan tambahkan data awal.");
              }
          }, 100);
          return () => clearTimeout(fallbackTimeout);
      }
      return;
    }

    setLoading(true);
    if (error && !error.includes("Konfigurasi Firebase tidak ditemukan")) {
        setError(null);
    }

    const loadingTimeout = setTimeout(() => {
      console.log("Statistik loading timeout reached. Setting loading to false.");
      setLoading(false);
      if (!statistikData && !error?.includes("Konfigurasi Firebase tidak ditemukan")) {
          setError("Waktu pemuatan data statistik habis. Mungkin tidak ada data atau ada masalah koneksi/izin.");
      }
    }, 5000);

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const docPath = `/artifacts/${appId}/statistikPenduduk/data`; 
    console.log("Attempting to listen to document:", docPath);

    const docRef = doc(db, docPath);

    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      console.log("onSnapshot callback triggered for statistik.");
      clearTimeout(loadingTimeout);

      if (docSnapshot.exists()) {
        const data = docSnapshot.data() as StatistikPendudukData;
        setStatistikData({ ...data, id: docSnapshot.id });
        setFormData({ ...data, id: docSnapshot.id });
        setLoading(false);
        setError(null);
        setEditingField(null);
        console.log("Statistik data loaded successfully.");
      } else {
        console.log("No statistik document found. Initializing with default values.");
        setStatistikData(DEFAULT_STATISTIK_DATA); // Gunakan default data yang lengkap
        setFormData(DEFAULT_STATISTIK_DATA);
        setLoading(false);
        setError(null);
      }
    }, (err) => {
      console.error("Error fetching statistik data in onSnapshot:", err);
      clearTimeout(loadingTimeout);
      setError(`Failed to fetch statistik data: ${err.message}. Pastikan aturan keamanan Firestore mengizinkan akses untuk path: ${docPath}`);
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up onSnapshot listener and loading timeout.");
      unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, [db, isAuthReady, error]); 

  // Handle saving data to Firestore
  const handleSave = useCallback(async (dataToSave: StatistikPendudukData) => {
    if (!db) {
      setError("Database tidak diinisialisasi. Tidak dapat menyimpan data.");
      return;
    }

    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const docRef = doc(db, `/artifacts/${appId}/statistikPenduduk/data`);
      await setDoc(docRef, dataToSave, { merge: true });
      setEditingField(null);
      setError(null);
      console.log("Statistik data successfully saved!");
    } catch (e: any) {
      console.error("Error saving statistik data: ", e);
      setError(`Failed to save data: ${e.message}`);
    }
  }, [db]);

  // PERBAIKAN FUNGSI handleChange
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return null;

      const newFormData = { ...prev }; // Buat salinan lengkap dari prev

      // Tangani bidang bersarang
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        // Pastikan parent object ada atau inisialisasi dengan objek kosong
        if (!(newFormData as any)[parent]) {
          (newFormData as any)[parent] = {};
        }
        // Salin properti parent, lalu update child
        (newFormData as any)[parent] = {
          ...(newFormData as any)[parent], // Salin semua properti yang sudah ada di parent
          [child]: parseInt(value) || 0, // Konversi nilai ke number, default 0 jika tidak valid
        };
      } else {
        // Tangani bidang tingkat atas
        (newFormData as any)[name] = parseInt(value) || 0; // Konversi nilai ke number, default 0 jika tidak valid
      }

      return newFormData;
    });
  }, []);

  // Start editing a specific field or section
  const startEditing = useCallback((field: string) => {
    setEditingField(field);
    if (statistikData) {
      setFormData({ ...statistikData }); // Copy current data to form
    } else {
        // Jika statistikData masih null (belum ada di Firestore), inisialisasi dengan DEFAULT_STATISTIK_DATA
        setFormData(DEFAULT_STATISTIK_DATA);
    }
  }, [statistikData]);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingField(null);
    setFormData(statistikData); // Reset form data to current statistikData
    setError(null);
  }, [statistikData]);

  // Save changes for the current editing field (used by individual edit buttons)
  const saveChanges = useCallback(() => {
    if (formData) {
      handleSave(formData);
    }
  }, [formData, handleSave]);

  // Display loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-600">Memuat data statistik...</p>
      </div>
    );
  }

  // Display error message
  if (error) {
    return (
      <div className="text-center p-6 text-red-700 bg-red-50 rounded-lg border border-red-200 mx-4 font-sans">
        <p className="font-semibold text-lg mb-2">Terjadi Kesalahan! 😟</p>
        <p className="text-base">{error}</p>
        <p className="text-sm mt-3">Pastikan Firebase dikonfigurasi dengan benar dan aturan keamanan Firestore mengizinkan akses.</p>
        {userId && (
          <p className="text-sm mt-2">
            User ID Anda: <code className="bg-gray-200 px-2 py-1 rounded text-gray-800 break-all">{userId}</code>
          </p>
        )}
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  // If no data is found after loading, offer to add initial data
  // Kita menggunakan DEFAULT_STATISTIK_DATA untuk memastikan struktur lengkap
  if (!statistikData || (statistikData.totalPenduduk === 0 && statistikData.kepalaKeluarga === 0 && statistikData.anakAnak === 0 && statistikData.dewasa === 0 && editingField !== 'initialEntry')) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-lg mx-auto max-w-lg font-sans">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Belum Ada Data Statistik Penduduk</h3>
        <p className="text-gray-600 mb-6">
          Sepertinya belum ada data statistik kependudukan yang tersimpan. Anda bisa menambahkannya sekarang.
        </p>
        <button
          onClick={() => {
            setStatistikData(DEFAULT_STATISTIK_DATA); // Pastikan ada data untuk diedit
            setFormData(DEFAULT_STATISTIK_DATA);
            setEditingField('initialEntry');
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center justify-center mx-auto space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Data Statistik Awal</span>
        </button>
        {userId && (
          <p className="text-sm mt-4 text-gray-500">
            User ID Aktif: <code className="font-mono bg-gray-200 px-1 py-0.5 rounded break-all">{userId}</code>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {menuItems.find(item => item.id === 'dataPenduduk')?.label || 'Data Penduduk'}
          </h2>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Penduduk */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Penduduk</p>
              <p className="text-2xl font-bold text-gray-900">{statistikData?.totalPenduduk.toLocaleString()}</p>
            </div>
          </div>
          {editingField === 'totalPenduduk' || editingField === 'initialEntry' ? (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                name="totalPenduduk"
                value={formData?.totalPenduduk || 0}
                onChange={handleChange}
                className="w-24 p-2 border rounded-md text-center"
              />
              {editingField === 'initialEntry' ? null : (
                <>
                  <button onClick={saveChanges} className="p-2 text-green-600 hover:text-green-800"><Save className="w-5 h-5" /></button>
                  <button onClick={cancelEditing} className="p-2 text-red-600 hover:text-red-800"><X className="w-5 h-5" /></button>
                </>
              )}
            </div>
          ) : (
            <button onClick={() => startEditing('totalPenduduk')} className="p-2 text-gray-500 hover:text-gray-700">
              <Edit className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Kepala Keluarga */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Kepala Keluarga</p>
              <p className="text-2xl font-bold text-gray-900">{statistikData?.kepalaKeluarga.toLocaleString()}</p>
            </div>
          </div>
          {editingField === 'kepalaKeluarga' || editingField === 'initialEntry' ? (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                name="kepalaKeluarga"
                value={formData?.kepalaKeluarga || 0}
                onChange={handleChange}
                className="w-24 p-2 border rounded-md text-center"
              />
              {editingField === 'initialEntry' ? null : (
                <>
                  <button onClick={saveChanges} className="p-2 text-green-600 hover:text-green-800"><Save className="w-5 h-5" /></button>
                  <button onClick={cancelEditing} className="p-2 text-red-600 hover:text-red-800"><X className="w-5 h-5" /></button>
                </>
              )}
            </div>
          ) : (
            <button onClick={() => startEditing('kepalaKeluarga')} className="p-2 text-gray-500 hover:text-gray-700">
              <Edit className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Anak-anak (0-14 tahun) */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Anak-anak (0-14)</p>
              <p className="text-2xl font-bold text-gray-900">{statistikData?.anakAnak.toLocaleString()}</p>
            </div>
          </div>
          {editingField === 'anakAnak' || editingField === 'initialEntry' ? (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                name="anakAnak"
                value={formData?.anakAnak || 0}
                onChange={handleChange}
                className="w-24 p-2 border rounded-md text-center"
              />
              {editingField === 'initialEntry' ? null : (
                <>
                  <button onClick={saveChanges} className="p-2 text-green-600 hover:text-green-800"><Save className="w-5 h-5" /></button>
                  <button onClick={cancelEditing} className="p-2 text-red-600 hover:text-red-800"><X className="w-5 h-5" /></button>
                </>
              )}
            </div>
          ) : (
            <button onClick={() => startEditing('anakAnak')} className="p-2 text-gray-500 hover:text-gray-700">
              <Edit className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Dewasa (15-64 tahun) */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Dewasa (15-64)</p>
              <p className="text-2xl font-bold text-gray-900">{statistikData?.dewasa.toLocaleString()}</p>
            </div>
          </div>
          {editingField === 'dewasa' || editingField === 'initialEntry' ? (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                name="dewasa"
                value={formData?.dewasa || 0}
                onChange={handleChange}
                className="w-24 p-2 border rounded-md text-center"
              />
              {editingField === 'initialEntry' ? null : (
                <>
                  <button onClick={saveChanges} className="p-2 text-green-600 hover:text-green-800"><Save className="w-5 h-5" /></button>
                  <button onClick={cancelEditing} className="p-2 text-red-600 hover:text-red-800"><X className="w-5 h-5" /></button>
                </>
              )}
            </div>
          ) : (
            <button onClick={() => startEditing('dewasa')} className="p-2 text-gray-500 hover:text-gray-700">
              <Edit className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Distribution Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Jenis Kelamin */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex justify-between items-center">
            Distribusi Jenis Kelamin
            {editingField === 'distribusiJenisKelamin' || editingField === 'initialEntry' ? (
              <div className="flex items-center space-x-2">
                {editingField === 'initialEntry' ? null : (
                  <>
                    <button onClick={saveChanges} className="p-1 text-green-600 hover:text-green-800"><Save className="w-5 h-5" /></button>
                    <button onClick={cancelEditing} className="p-1 text-red-600 hover:text-red-800"><X className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            ) : (
              <button onClick={() => startEditing('distribusiJenisKelamin')} className="p-1 text-gray-500 hover:text-gray-700">
                <Edit className="w-5 h-5" />
              </button>
            )}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-gray-700">Laki-laki:</label>
              {editingField === 'distribusiJenisKelamin' || editingField === 'initialEntry' ? (
                <input
                  type="number"
                  name="distribusiJenisKelamin.lakiLaki"
                  value={formData?.distribusiJenisKelamin.lakiLaki || 0}
                  onChange={handleChange}
                  className="w-24 p-2 border rounded-md text-center"
                />
              ) : (
                <span className="font-medium text-gray-900">{statistikData?.distribusiJenisKelamin.lakiLaki.toLocaleString()}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <label className="text-gray-700">Perempuan:</label>
              {editingField === 'distribusiJenisKelamin' || editingField === 'initialEntry' ? (
                <input
                  type="number"
                  name="distribusiJenisKelamin.perempuan"
                  value={formData?.distribusiJenisKelamin.perempuan || 0}
                  onChange={handleChange}
                  className="w-24 p-2 border rounded-md text-center"
                />
              ) : (
                <span className="font-medium text-gray-900">{statistikData?.distribusiJenisKelamin.perempuan.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>

        {/* Distribusi Usia */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex justify-between items-center">
            Distribusi Usia
            {editingField === 'distribusiUsia' || editingField === 'initialEntry' ? (
              <div className="flex items-center space-x-2">
                {editingField === 'initialEntry' ? null : (
                  <>
                    <button onClick={saveChanges} className="p-1 text-green-600 hover:text-green-800"><Save className="w-5 h-5" /></button>
                    <button onClick={cancelEditing} className="p-1 text-red-600 hover:text-red-800"><X className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            ) : (
              <button onClick={() => startEditing('distribusiUsia')} className="p-1 text-gray-500 hover:text-gray-700">
                <Edit className="w-5 h-5" />
              </button>
            )}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-gray-700">0-14 Tahun:</label>
              {editingField === 'distribusiUsia' || editingField === 'initialEntry' ? (
                <input
                  type="number"
                  name="distribusiUsia.0-14"
                  value={formData?.distribusiUsia['0-14'] || 0}
                  onChange={handleChange}
                  className="w-24 p-2 border rounded-md text-center"
                />
              ) : (
                <span className="font-medium text-gray-900">{statistikData?.distribusiUsia['0-14'].toLocaleString()}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <label className="text-gray-700">15-64 Tahun:</label>
              {editingField === 'distribusiUsia' || editingField === 'initialEntry' ? (
                <input
                  type="number"
                  name="distribusiUsia.15-64"
                  value={formData?.distribusiUsia['15-64'] || 0}
                  onChange={handleChange}
                  className="w-24 p-2 border rounded-md text-center"
                />
              ) : (
                <span className="font-medium text-gray-900">{statistikData?.distribusiUsia['15-64'].toLocaleString()}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <label className="text-gray-700">65+ Tahun:</label>
              {editingField === 'distribusiUsia' || editingField === 'initialEntry' ? (
                <input
                  type="number"
                  name="distribusiUsia.65+"
                  value={formData?.distribusiUsia['65+'] || 0}
                  onChange={handleChange}
                  className="w-24 p-2 border rounded-md text-center"
                />
              ) : (
                <span className="font-medium text-gray-900">{statistikData?.distribusiUsia['65+'].toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>

        {/* Tingkat Pendidikan */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex justify-between items-center">
            Tingkat Pendidikan
            {editingField === 'tingkatPendidikan' || editingField === 'initialEntry' ? (
              <div className="flex items-center space-x-2">
                {editingField === 'initialEntry' ? null : (
                  <>
                    <button onClick={saveChanges} className="p-1 text-green-600 hover:text-green-800"><Save className="w-5 h-5" /></button>
                    <button onClick={cancelEditing} className="p-1 text-red-600 hover:text-red-800"><X className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            ) : (
              <button onClick={() => startEditing('tingkatPendidikan')} className="p-1 text-gray-500 hover:text-gray-700">
                <Edit className="w-5 h-5" />
              </button>
            )}
          </h3>
          <div className="space-y-3">
            {Object.entries(statistikData?.tingkatPendidikan || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <label className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</label>
                {editingField === 'tingkatPendidikan' || editingField === 'initialEntry' ? (
                  <input
                    type="number"
                    name={`tingkatPendidikan.${key}`}
                    value={formData?.tingkatPendidikan[key as keyof typeof formData.tingkatPendidikan] || 0}
                    onChange={handleChange}
                    className="w-24 p-2 border rounded-md text-center"
                  />
                ) : (
                  <span className="font-medium text-gray-900">{value.toLocaleString()}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mata Pencarian */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex justify-between items-center">
            Mata Pencarian
            {editingField === 'mataPencarian' || editingField === 'initialEntry' ? (
              <div className="flex items-center space-x-2">
                {editingField === 'initialEntry' ? null : (
                  <>
                    <button onClick={saveChanges} className="p-1 text-green-600 hover:text-green-800"><Save className="w-5 h-5" /></button>
                    <button onClick={cancelEditing} className="p-1 text-red-600 hover:text-red-800"><X className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            ) : (
              <button onClick={() => startEditing('mataPencarian')} className="p-1 text-gray-500 hover:text-gray-700">
                <Edit className="w-5 h-5" />
              </button>
            )}
          </h3>
          <div className="space-y-3">
            {Object.entries(statistikData?.mataPencarian || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <label className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</label>
                {editingField === 'mataPencarian' || editingField === 'initialEntry' ? (
                  <input
                    type="number"
                    name={`mataPencarian.${key}`}
                    value={formData?.mataPencarian[key as keyof typeof formData.mataPencarian] || 0}
                    onChange={handleChange}
                    className="w-24 p-2 border rounded-md text-center"
                  />
                ) : (
                  <span className="font-medium text-gray-900">{value.toLocaleString()}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Save/Cancel for Initial Entry Mode */}
      {editingField === 'initialEntry' && (
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={saveChanges}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Simpan Data Awal</span>
          </button>
          <button
            onClick={cancelEditing}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-semibold shadow-md flex items-center space-x-2"
          >
            <X className="w-5 h-5" />
            <span>Batal</span>
          </button>
        </div>
      )}

      {userId && (
        <div className="text-center p-2 bg-gray-100 text-gray-600 rounded-lg text-sm mt-4">
          User ID Aktif: <code className="font-mono bg-gray-200 px-1 py-0.5 rounded break-all">{userId}</code>
        </div>
      )}
    </div>
  );
};

export default DataPenduduk;