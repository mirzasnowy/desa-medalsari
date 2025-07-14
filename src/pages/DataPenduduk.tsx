import React, { useState, useEffect } from 'react'; // Menambahkan useState
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Users, UserCheck, Baby, User } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Pastikan CSS AOS diimpor

// Firebase Imports
import { initializeApp, FirebaseApp, getApps, FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously, Auth, User as FirebaseAuthUser } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, Firestore } from 'firebase/firestore';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Definisi Tipe Data Statistik Penduduk (sesuai dengan Firestore)
export interface StatistikPendudukData {
  id?: string;
  totalPenduduk: number;
  kepalaKeluarga: number;
  anakAnak: number; // 0-14 tahun
  dewasa: number; // 15-64 tahun
  distribusiJenisKelamin: {
    lakiLaki: number;
    perempuan: number;
  };
  distribusiUsia: {
    '0-14': number;
    '15-64': number;
    '65+': number;
  };
  tingkatPendidikan: {
    tidakSekolah: number;
    sd: number;
    smp: number;
    sma: number;
    sarjana: number;
    lainnya: number;
  };
  mataPencarian: {
    petani: number;
    pedagang: number;
    pns: number;
    karyawanSwasta: number;
    wiraswasta: number;
    lainnya: number;
  };
}

// Tambahkan deklarasi global untuk config Firebase jika belum ada di file ini atau main entry point
declare global {
  var __firebase_config: string | undefined;
  var __app_id: string | undefined;
}


const DataPenduduk = () => {
  // State untuk data dinamis dari Firebase
  const [statistikData, setStatistikData] = useState<StatistikPendudukData | null>(null);
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
        // Sign in anonymously to ensure read access if rules allow for unauthenticated users
        if (!user) {
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

  // Fetch dynamic Statistik Penduduk data from Firestore
  useEffect(() => {
    if (!db || !isAuthReady) {
      return;
    }

    setLoadingData(true);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const statistikDocPath = `/artifacts/${appId}/statistikPenduduk/data`; // Jalur dokumen tunggal

    const unsubscribe = onSnapshot(doc(db, statistikDocPath), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setStatistikData(docSnapshot.data() as StatistikPendudukData);
        setDataError(null);
      } else {
        // Jika dokumen tidak ada, set ke nilai default/nol
        console.warn("Statistik Penduduk document not found. Displaying zeros.");
        setStatistikData({
            totalPenduduk: 0,
            kepalaKeluarga: 0,
            anakAnak: 0,
            dewasa: 0,
            distribusiJenisKelamin: { lakiLaki: 0, perempuan: 0 },
            distribusiUsia: { '0-14': 0, '15-64': 0, '65+': 0 },
            tingkatPendidikan: { tidakSekolah: 0, sd: 0, smp: 0, sma: 0, sarjana: 0, lainnya: 0 },
            mataPencarian: { petani: 0, pedagang: 0, pns: 0, karyawanSwasta: 0, wiraswasta: 0, lainnya: 0 },
        });
      }
      setLoadingData(false);
    }, (err) => {
      console.error(`Error fetching statistik data: ${err.message}`);
      setDataError(`Failed to load population data: ${err.message}. Check Firestore rules for ${statistikDocPath}`);
      setStatistikData(null); // Reset to null on error
      setLoadingData(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, [db, isAuthReady]);


  // Data untuk chart dan stats card (Dinamis dari statistikData)
  const genderData = {
    labels: ['Laki-laki', 'Perempuan'],
    datasets: [
      {
        data: [statistikData?.distribusiJenisKelamin.lakiLaki || 0, statistikData?.distribusiJenisKelamin.perempuan || 0],
        backgroundColor: ['#3B82F6', '#EC4899'],
        borderColor: ['#2563EB', '#DB2777'],
        borderWidth: 2,
      },
    ],
  };

  const ageData = {
    labels: ['0-14 tahun', '15-64 tahun', '65+ tahun'],
    datasets: [
      {
        label: 'Jumlah Penduduk',
        data: [
          statistikData?.distribusiUsia['0-14'] || 0,
          statistikData?.distribusiUsia['15-64'] || 0,
          statistikData?.distribusiUsia['65+'] || 0,
        ],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderColor: ['#059669', '#D97706', '#DC2626'],
        borderWidth: 2,
      },
    ],
  };

  const educationData = {
    labels: ['Tidak Sekolah', 'SD', 'SMP', 'SMA', 'Sarjana', 'Lainnya'], // Sesuaikan label
    datasets: [
      {
        label: 'Tingkat Pendidikan',
        data: [
          statistikData?.tingkatPendidikan.tidakSekolah || 0,
          statistikData?.tingkatPendidikan.sd || 0,
          statistikData?.tingkatPendidikan.smp || 0,
          statistikData?.tingkatPendidikan.sma || 0,
          statistikData?.tingkatPendidikan.sarjana || 0,
          statistikData?.tingkatPendidikan.lainnya || 0,
        ],
        backgroundColor: '#6366F1',
        borderColor: '#4F46E5',
        borderWidth: 2,
      },
    ],
  };

  const occupationData = {
    labels: ['Petani', 'Pedagang', 'PNS', 'Karyawan Swasta', 'Wiraswasta', 'Lainnya'], // Sesuaikan label
    datasets: [
      {
        label: 'Mata Pencaharian',
        data: [
          statistikData?.mataPencarian.petani || 0,
          statistikData?.mataPencarian.pedagang || 0,
          statistikData?.mataPencarian.pns || 0,
          statistikData?.mataPencarian.karyawanSwasta || 0,
          statistikData?.mataPencarian.wiraswasta || 0,
          statistikData?.mataPencarian.lainnya || 0,
        ],
        backgroundColor: '#059669',
        borderColor: '#047857',
        borderWidth: 2,
      },
    ],
  };

  const statsCards = [
    { icon: Users, label: 'Total Penduduk', value: statistikData?.totalPenduduk?.toLocaleString() || '0', color: 'bg-blue-500' },
    { icon: UserCheck, label: 'Kepala Keluarga', value: statistikData?.kepalaKeluarga?.toLocaleString() || '0', color: 'bg-emerald-500' },
    { icon: Baby, label: 'Anak-anak (0-14)', value: statistikData?.anakAnak?.toLocaleString() || '0', color: 'bg-purple-500' },
    { icon: User, label: 'Dewasa (15-64)', value: statistikData?.dewasa?.toLocaleString() || '0', color: 'bg-orange-500' },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: { // Pastikan title di Chart.js sudah diimport dan di-register
        display: true,
        text: 'Judul Chart Dinamis', // Ini akan diganti oleh judul di masing-masing chart Doughnut/Bar
        font: {
            size: 16
        }
      }
    },
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-screen font-sans text-xl text-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mr-3"></div>
        Memuat data kependudukan...
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="text-center p-6 text-red-700 bg-red-50 rounded-lg border border-red-200 mx-auto max-w-lg font-sans mt-20">
        <p className="font-semibold text-lg mb-2">Error Memuat Data!</p>
        <p className="text-base">{dataError}</p>
        <p className="text-sm mt-3">Pastikan koneksi internet Anda stabil dan aturan keamanan Firestore mengizinkan akses publik ke dokumen statistik penduduk.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Data Kependudukan</h1>
            <p className="text-xl text-blue-100">Desa Medalsari</p>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {statsCards.map((stat, index) => { // Menggunakan statsCards
              const Icon = stat.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className={`w-16 h-16 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Gender Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6" data-aos="fade-up">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Distribusi Jenis Kelamin</h3>
              <div className="h-64">
                {/* Pastikan statistikData tersedia sebelum merender chart */}
                {statistikData && <Doughnut data={genderData} options={chartOptions} />}
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-600">Total: {statistikData?.totalPenduduk?.toLocaleString() || '0'} jiwa</p>
              </div>
            </div>

            {/* Age Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6" data-aos="fade-up" data-aos-delay="200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Distribusi Usia</h3>
              <div className="h-64">
                {statistikData && <Doughnut data={ageData} options={chartOptions} />}
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-600">Klasifikasi berdasarkan kelompok usia</p>
              </div>
            </div>

            {/* Education Level */}
            <div className="bg-white rounded-xl shadow-lg p-6" data-aos="fade-up" data-aos-delay="400">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Tingkat Pendidikan</h3>
              <div className="h-64">
                {statistikData && <Bar data={educationData} options={chartOptions} />}
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-600">Pendidikan tertinggi yang ditamatkan</p>
              </div>
            </div>

            {/* Occupation */}
            <div className="bg-white rounded-xl shadow-lg p-6" data-aos="fade-up" data-aos-delay="600">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Mata Pencaharian</h3>
              <div className="h-64">
                {statistikData && <Bar data={occupationData} options={chartOptions} />}
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-600">Pekerjaan utama penduduk</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DataPenduduk;