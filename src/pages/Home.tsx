import React, { useState, useEffect } from 'react';
import { ArrowRight, Users, Building, TreePine, Camera, Star, MapPin, Award, BookOpen } from 'lucide-react'; // Import Award and BookOpen icons
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import WeatherWidget from '../components/WeatherWIdget';
import ChatbotFAQ from '../components/ChatbotFAQ';
import bgImage from '../assets/bg3.jpg';
import pemdesLogo from '../assets/pemdes.png';
import SocialProof from '../components/SocialProof';
// Firebase Imports
import { initializeApp, FirebaseApp, getApps, FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously, Auth, User as FirebaseAuthUser } from 'firebase/auth';
import { getFirestore, doc, collection, onSnapshot, Firestore, query } from 'firebase/firestore';

// Definisi Tipe Data yang Akurat untuk Home component
interface StatistikPendudukData {
    totalPenduduk: number;
    kepalaKeluarga: number;
}

interface UMKMItem {
    id?: string;
}

interface WisataItem {
    id?: string;
}

// Tambahkan deklarasi global untuk config Firebase jika belum ada di file ini atau main entry point
declare global {
    var __firebase_config: string | undefined;
    var __app_id: string | undefined;
}


const Home = () => {
    // State untuk data dinamis
    const [totalPenduduk, setTotalPenduduk] = useState<number | null>(null);
    const [kepalaKeluarga, setKepalaKeluarga] = useState<number | null>(null);
    const [totalWisata, setTotalWisata] = useState<number | null>(null);
    const [totalUMKM, setTotalUMKM] = useState<number | null>(null);
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

    // Fetch dynamic data from Firestore
    useEffect(() => {
        if (!db || !isAuthReady) {
            return;
        }

        setLoadingData(true);
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const unsubscribes: (() => void)[] = [];
        let fetchedCount = 0;
        const totalFetches = 3;

        const checkLoadingComplete = () => {
            fetchedCount++;
            if (fetchedCount === totalFetches) {
                setLoadingData(false);
                setDataError(null);
            }
        };

        // 1. Ambil Data Penduduk (Dokumen Tunggal)
        const statistikDocPath = `/artifacts/${appId}/statistikPenduduk/data`;
        const statistikDocRef = doc(db, statistikDocPath);
        unsubscribes.push(onSnapshot(statistikDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data() as StatistikPendudukData;
                setTotalPenduduk(data.totalPenduduk);
                setKepalaKeluarga(data.kepalaKeluarga);
            } else {
                setTotalPenduduk(0);
                setKepalaKeluarga(0);
            }
            checkLoadingComplete();
        }, (err) => {
            console.error(`Error fetching statistikPenduduk: ${err.message}`);
            setDataError(`Failed to load population data: ${err.message}`);
            setTotalPenduduk(null);
            setKepalaKeluarga(null);
            checkLoadingComplete();
        }));

        // 2. Ambil Total UMKM (Koleksi)
        const umkmCollectionPath = `/artifacts/${appId}/umkm`;
        unsubscribes.push(onSnapshot(query(collection(db, umkmCollectionPath)), (snapshot) => {
            setTotalUMKM(snapshot.size);
            checkLoadingComplete();
        }, (err) => {
            console.error(`Error fetching umkm: ${err.message}`);
            setDataError(`Failed to load UMKM count: ${err.message}`);
            setTotalUMKM(null);
            checkLoadingComplete();
        }));

        // 3. Ambil Total Wisata (Koleksi)
        const wisataCollectionPath = `/artifacts/${appId}/wisata`;
        unsubscribes.push(onSnapshot(query(collection(db, wisataCollectionPath)), (snapshot) => {
            setTotalWisata(snapshot.size);
            checkLoadingComplete();
        }, (err) => {
            console.error(`Error fetching wisata: ${err.message}`);
            setDataError(`Failed to load tourism count: ${err.message}`);
            setTotalWisata(null);
            checkLoadingComplete();
        }));

        // Cleanup function
        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [db, isAuthReady]);


    // Data statis yang tidak berubah (Testimoni dan Akses Cepat)
    const testimonials = [
        {
            name: 'Sari Wulandari',
            role: 'Pengunjung Wisata',
            rating: 5,
            comment: 'Desa Medalsari sangat indah dan asri. Pemandangan alamnya memukau dan warganya ramah!',
            image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
        },
        {
            name: 'Budi Santoso',
            role: 'Investor UMKM',
            rating: 5,
            comment: 'Potensi UMKM di desa ini luar biasa. Produk kerajinan lokalnya sangat berkualitas.',
            image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
        },
        {
            name: 'Maya Indah',
            role: 'Fotografer',
            rating: 5,
            comment: 'Tempat yang sempurna untuk fotografi alam. Setiap sudut desa ini instagramable!',
            image: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
        },
    ];

    const quickAccess = [
        { title: 'Wisata Alam', icon: TreePine, path: '/wisata', color: 'from-green-500 to-emerald-600' },
        { title: 'UMKM Lokal', icon: Building, path: '/umkm', color: 'from-blue-500 to-cyan-600' },
        { title: 'Kearifan Lokal', icon: Star, path: '/kearifan', color: 'from-purple-500 to-pink-600' },
        { title: 'Galeri Foto', icon: Camera, path: '/galeri', color: 'from-orange-500 to-red-600' },
    ];

    // Data Pencapaian dan Penghargaan Desa (contoh statis)
    const achievements = [
        {
            year: 2023,
            title: 'Desa Mandiri Terbaik Provinsi',
            description: 'Penghargaan atas kemandirian desa dalam pengelolaan sumber daya dan pengembangan ekonomi lokal.',
            icon: '🏆'
        },
        {
            year: 2022,
            title: 'Destinasi Wisata Unggulan Daerah',
            description: 'Diakui sebagai salah satu destinasi wisata terbaik dengan peningkatan jumlah pengunjung yang signifikan.',
            icon: '🏅'
        },
        {
            year: 2021,
            title: 'Desa Sadar Lingkungan',
            description: 'Penghargaan untuk inisiatif dan program pelestarian lingkungan yang berkelanjutan.',
            icon: '🌿'
        },
    ];

    // Buat array stats dinamis berdasarkan data yang diambil
    const dynamicStats = [
        { icon: Users, label: 'Jumlah Penduduk', value: totalPenduduk !== null ? totalPenduduk.toLocaleString() : '0', color: 'bg-blue-500' },
        { icon: Building, label: 'Kepala Keluarga', value: kepalaKeluarga !== null ? kepalaKeluarga.toLocaleString() : '0', color: 'bg-emerald-500' },
        { icon: TreePine, label: 'Tempat Wisata', value: totalWisata !== null ? totalWisata.toLocaleString() : '0', color: 'bg-purple-500' },
        { icon: Building, label: 'UMKM Aktif', value: totalUMKM !== null ? totalUMKM.toLocaleString() : '0', color: 'bg-orange-500' },
    ];

    if (loadingData) {
        return (
            <div className="flex justify-center items-center h-screen font-sans text-xl text-gray-700">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mr-3"></div>
                Memuat data...
            </div>
        );
    }

    if (dataError) {
        return (
            <div className="text-center p-6 text-red-700 bg-red-50 rounded-lg border border-red-200 mx-auto max-w-lg font-sans">
                <p className="font-semibold text-lg mb-2">Error Memuat Data!</p>
                <p className="text-base">{dataError}</p>
                <p className="text-sm mt-3">Pastikan koneksi internet Anda stabil dan aturan keamanan Firestore mengizinkan akses publik untuk koleksi/dokumen ini.</p>
            </div>
        );
    }


    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
                <div className="absolute inset-0 bg-black/20"></div>
                    <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${bgImage})`,
                    }}
                ></div>

                <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4" data-aos="fade-up">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        Selamat Datang di<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                            Desa Medalsari
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-gray-200">
                        Desa yang indah, maju, dan sejahtera. Mewujudkan kehidupan yang harmonis antara alam dan masyarakat.
                    </p>
                    <div className="space-x-4">
                        {/* Tombol "Jelajahi Keindahan Desa" -> Scroll ke Quick Access */}
                        <a
                            href="#jelajahi-desa" // Target ID dari section Quick Access
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-full font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
                        >
                            <span>Jelajahi Keindahan Desa</span>
                            <ArrowRight className="w-5 h-5" />
                        </a>
                        {/* Tombol "Hubungi Kami" -> Navigasi ke /kontak */}
                        <Link
                            to="/kontak"
                            className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-all duration-300 inline-flex items-center space-x-2"
                        >
                            <span>Hubungi Kami</span>
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
                    <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        {dynamicStats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={index}
                                    className="text-center group"
                                    data-aos="fade-up"
                                    data-aos-delay={index * 100}
                                >
                                    <div className={`w-16 h-16 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
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

            {/* Quick Access */}
            <section id="jelajahi-desa" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12" data-aos="fade-up">
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">Jelajahi Desa Medalsari</h2>
                        <p className="text-xl text-gray-600">Temukan keindahan dan potensi yang ada di desa kami</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {quickAccess.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className="group block"
                                    data-aos="fade-up"
                                    data-aos-delay={index * 100}
                                >
                                    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                        <div className={`h-32 bg-gradient-to-r ${item.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                                            <Icon className="w-16 h-16 text-white" />
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                                            <p className="text-gray-600 group-hover:text-gray-800 transition-colors">
                                                Klik untuk menjelajahi lebih lanjut
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Buku Profil Desa Section */}
            <section className="py-20 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12" data-aos="fade-up">
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">Buku Profil Desa Medalsari</h2>
                        <p className="text-xl text-gray-600">
                            Lihat lebih dekat data dan informasi lengkap mengenai Desa Medalsari dalam format digital.
                        </p>
                    </div>
                    <div className="flex justify-center" data-aos="fade-up" data-aos-delay="200">
                        <div className="w-full md:w-3/4 lg:w-2/3 h-[600px] bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
                            {/* Ganti URL_PDF_BUKU_PROFIL dengan URL PDF buku profil desa Anda */}
                            <iframe
                                src="https://drive.google.com/file/d/1mnNLl9VgWkSVeIbb-E-Z7DmVZUpmRUFR/preview" // GANTI DENGAN URL PDF ASLI ANDA
                                width="100%"
                                height="100%"
                                className="border-0"
                                title="Buku Profil Desa Medalsari"
                            >
                                Maaf, browser Anda tidak mendukung tampilan PDF. Silakan <a href="https://example.com/buku-profil-desa-medalsari.pdf" className="text-blue-600 hover:underline">unduh PDF</a> untuk melihatnya.
                            </iframe>
                        </div>
                    </div>
                    <div className="text-center mt-8" data-aos="fade-up" data-aos-delay="300">
                        <a
                            href="https://drive.google.com/file/d/1mnNLl9VgWkSVeIbb-E-Z7DmVZUpmRUFR/preview" // GANTI DENGAN URL PDF ASLI ANDA
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-emerald-600 transition-all duration-300 inline-flex items-center space-x-2"
                        >
                            <BookOpen className="w-5 h-5" />
                            <span>Unduh Buku Profil Desa</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Weather Widget Section */}
            <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12" data-aos="fade-up">
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">Informasi Cuaca Real-Time</h2>
                        <p className="text-xl text-gray-600">Pantau kondisi cuaca terkini di Desa Medalsari</p>
                    </div>
                    <div className="max-w-md mx-auto" data-aos="fade-up" data-aos-delay="200">
                        <WeatherWidget />
                    </div>
                </div>
            </section>

            <ChatbotFAQ />
                       {/* Social Proof Section */}
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto" data-aos="fade-up">
                  <SocialProof />
                </div>
              </div>
            </section>
            {/* Testimonials (STILL STATIC) */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12" data-aos="fade-up">
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">Apa Kata Mereka</h2>
                        <p className="text-xl text-gray-600">Testimoni dari para pengunjung dan mitra desa</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                                data-aos="fade-up"
                                data-aos-delay={index * 100}
                            >
                                <div className="flex items-center mb-4">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full mr-4 object-cover"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                                        <p className="text-gray-600 text-sm">{testimonial.role}</p>
                                    </div>
                                </div>
                                <div className="flex mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-700 italic">"{testimonial.comment}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-emerald-500 to-teal-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div data-aos="fade-up">
                        <h2 className="text-4xl font-bold text-white mb-4">Bergabunglah dengan Kami</h2>
                        <p className="text-xl text-emerald-100 mb-8">
                            Mari bersama-sama membangun desa yang lebih maju dan sejahtera
                        </p>
                        <div className="space-x-4">
                            <Link
                                to="/kontak"
                                className="bg-white text-emerald-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 inline-flex items-center space-x-2"
                            >
                                <span>Hubungi Kami</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/wisata"
                                className="bg-emerald-700 text-white px-8 py-4 rounded-full font-semibold hover:bg-emerald-800 transition-all duration-300 inline-flex items-center space-x-2"
                            >
                                <MapPin className="w-5 h-5" />
                                <span>Kunjungi Wisata</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Chatbot FAQ Section */}
        </div>
    );
};

export default Home;