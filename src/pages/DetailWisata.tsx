// src/pages/WisataDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Pastikan CSS Leaflet diimpor
import L from 'leaflet'; // Import Leaflet library untuk custom marker
import {
  MapPin,
  Clock,
  Star,
  Phone,
  ArrowLeft,
  ExternalLink,
  MessageCircle, // Untuk tombol WhatsApp
} from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Firebase Imports
import { initializeApp, FirebaseApp, getApps, FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously, Auth, User as FirebaseAuthUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, Firestore } from 'firebase/firestore';

// Definisi tipe (harus sesuai dengan WisataItem di Wisata.tsx)
export interface WisataItem {
  id?: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  price: string;
  hours: string;
  facilities: string[];
  contact: string;
  latitude?: number; // Tambahkan properti untuk koordinat
  longitude?: number;
  address?: string; // Tambahkan properti untuk alamat
}

// Custom marker icon (untuk React-Leaflet)
const customMarker = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});
// Penting: Atasi masalah ikon default Leaflet di Webpack/Vite
L.Marker.prototype.options.icon = customMarker; // Gunakan customMarker di sini


// Tambahkan deklarasi global untuk config Firebase jika belum ada di file ini atau main entry point
declare global {
  var __firebase_config: string | undefined;
  var __app_id: string | undefined;
}


const WisataDetail = () => {
  const { id } = useParams<{ id: string }>(); // Ambil ID dari URL
  const [wisata, setWisata] = useState<WisataItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
    });

    let firebaseConfig: FirebaseOptions | null = null;
    try {
      if (typeof __firebase_config !== 'undefined' && __firebase_config.trim() !== '') {
        firebaseConfig = JSON.parse(__firebase_config);
      } else {
        setError("Firebase config not found. Data might not load.");
        setLoading(false);
        return;
      }

      let app: FirebaseApp;
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }

      const firestore: Firestore = getFirestore(app);
      const firebaseAuth: Auth = getAuth(app);

      // Pastikan otentikasi siap sebelum mencoba mengambil data
      const unsubscribeAuth = firebaseAuth.onAuthStateChanged(async (user: FirebaseAuthUser | null) => {
        if (!user) {
          try {
            await signInAnonymously(firebaseAuth);
          } catch (anonError: any) {
            console.error("Error signing in anonymously:", anonError);
            setError(`Authentication error: ${anonError.message}`);
            setLoading(false);
            return;
          }
        }
        
        // Setelah otentikasi siap, baru ambil data
        if (id) {
          const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
          const docRef = doc(firestore, `/artifacts/${appId}/wisata`, id);
          
          getDoc(docRef)
            .then(docSnap => {
              if (docSnap.exists()) {
                setWisata({ 
                  id: docSnap.id, 
                  ...docSnap.data() as Omit<WisataItem, 'id'>,
                  facilities: (docSnap.data() as any).facilities || [],
                  latitude: (docSnap.data() as any).latitude,
                  longitude: (docSnap.data() as any).longitude,
                  address: (docSnap.data() as any).address || '',
                });
              } else {
                setError("Data Wisata tidak ditemukan.");
              }
            })
            .catch(err => {
              console.error("Error fetching Wisata detail:", err);
              setError(`Gagal memuat data: ${err.message}`);
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
            setError("ID wisata tidak tersedia.");
            setLoading(false);
        }
      });

      return () => unsubscribeAuth(); // Cleanup auth listener
    } catch (e: any) {
      console.error("Failed to initialize Firebase:", e);
      setError(`Firebase initialization error: ${e.message}`);
      setLoading(false);
    }
  }, [id]); // id sebagai dependency agar data di-fetch ulang jika ID berubah

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen font-sans text-xl text-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mr-3"></div>
        Memuat detail wisata...
      </div>
    );
  }

  if (error || !wisata) {
    return (
      <div className="text-center p-6 text-red-700 bg-red-50 rounded-lg border border-red-200 mx-auto max-w-lg font-sans mt-20">
        <p className="font-semibold text-lg mb-2">Error!</p>
        <p className="text-base">{error || "Data Wisata tidak ditemukan."}</p>
        {/* Tombol kembali yang diperbaiki */}
        <Link 
          to="/wisata" 
          className="mt-4 inline-flex items-center justify-center px-6 py-3 border border-emerald-600 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Daftar Wisata
        </Link>
      </div>
    );
  }

  const {
    name,
    description,
    image,
    rating,
    price,
    hours,
    facilities,
    contact,
    latitude,
    longitude,
    address,
  } = wisata;

  // Set posisi peta. Default ke koordinat desa jika tidak ada lat/lng.
  const position: [number, number] =
    latitude && longitude ? [latitude, longitude] : [-6.524828, 107.174051]; 

  const phoneNumber = contact?.replace(/\D/g, '') || '';
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tombol kembali yang diperbaiki */}
        <Link 
          to="/wisata" 
          className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors mb-8 
                     px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 shadow-sm w-fit"
          data-aos="fade-right"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Kembali ke Daftar Wisata
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden md:flex md:items-center">
          {/* Product Image Section */}
          <div className="md:w-1/2" data-aos="fade-right">
            <img 
              src={image || 'https://placehold.co/800x600/aabbcc/ffffff?text=Tempat+Wisata'} 
              alt={name} 
              className="w-full h-full object-cover max-h-96 md:max-h-full" 
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x600/aabbcc/ffffff?text=Error'; }}
            />
          </div>

          {/* Details Section */}
          <div className="md:w-1/2 p-8 lg:p-12" data-aos="fade-left">
            <div className="flex items-center space-x-4 mb-4">
              <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium">Wisata Alam</span> {/* Asumsi kategori, bisa diperbaiki jika ada di data */}
              <div className="flex items-center space-x-1 text-gray-500">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-bold text-gray-800">{rating}</span>
              </div>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">{name}</h1>
            <p className="text-gray-600 text-lg mb-6">{description}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-gray-700">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-emerald-600" />
                <span><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{contact}</a></span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span>Jam: {hours}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Tiket: {price}</span>
              </div>
              {address && (
                 <div className="flex items-center space-x-3 col-span-full">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>Alamat: {address}</span>
                 </div>
              )}
            </div>

            {/* Fasilitas Section */}
            <div className="mb-8">
              <p className="text-lg font-semibold text-gray-800 mb-2">Fasilitas:</p>
              <div className="flex flex-wrap gap-2">
                {facilities && facilities.length > 0 ? (
                  facilities.map((facility, idx) => (
                    <span key={idx} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                      {facility}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Tidak ada fasilitas terdaftar.</span>
                )}
              </div>
            </div>
            
            {/* Aksi */}
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full sm:w-auto flex items-center justify-center bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-emerald-700 transition-colors shadow-md"
            >
              <MessageCircle className="w-6 h-6 mr-3" /> Hubungi Wisata
            </a>
          </div>
        </div>

        {/* Geolocation Section */}
        {latitude && longitude ? (
          <div className="mt-12" data-aos="fade-up">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Lokasi Tempat Wisata</h2>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-96 w-full rounded-lg overflow-hidden">
                <MapContainer center={position} zoom={16} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={position} icon={customMarker}>
                    <Popup>
                      <strong>{name}</strong><br />
                      {address || 'Lokasi Tempat Wisata'}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              <div className="mt-4 flex items-center text-gray-600">
                <MapPin className="w-5 h-5 text-emerald-600 mr-2" />
                <p className="text-sm">Alamat: {address || 'Alamat tidak tersedia'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-12 text-center text-gray-500" data-aos="fade-up">
            <p>Informasi lokasi (geolokasi) tidak tersedia untuk tempat wisata ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WisataDetail;