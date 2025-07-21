import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, LucideIcon, X, UploadCloud, Save, Star, Phone, ShoppingBag, Award, Users, MapPin, LocateFixed } from 'lucide-react';
import { initializeApp, FirebaseApp, getApps, FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously, Auth, User as FirebaseAuthUser } from 'firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  Firestore,
  query,
} from 'firebase/firestore';
// Firebase Storage imports are removed as per requirement

// Import React-Leaflet Components
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Pastikan CSS Leaflet diimpor
import L from 'leaflet'; // Import Leaflet library untuk custom marker

// Custom marker icon (untuk React-Leaflet)
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// Penting: Atasi masalah ikon default Leaflet di Webpack/Vite
L.Marker.prototype.options.icon = defaultIcon;


// Declare global variables for Firebase configuration and app ID.
declare global {
  var __firebase_config: string | undefined;
  var __app_id: string | undefined;
}

// Dummy Firebase config for demonstration. REPLACE WITH YOUR ACTUAL CONFIG IN A REAL APP.
if (typeof window !== 'undefined' && typeof __firebase_config === 'undefined') {
  window.__firebase_config = JSON.stringify({
    apiKey: "YOUR_API_KEY", 
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com", 
    projectId: "YOUR_PROJECT_ID", 
    storageBucket: "YOUR_PROJECT_ID.appspot.com", 
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID", 
    appId: "YOUR_APP_ID" 
  });
  window.__app_id = "UMKM_Demo_App"; 
}


// Definisi tipe untuk item UMKM
export interface UMKMItem {
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
  latitude?: number; // Tambahkan properti untuk koordinat
  longitude?: number;
  address?: string; // Tambahkan properti untuk alamat
}

// Definisi tipe untuk props komponen UMKM
interface UMKMProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  menuItems: { id: string; label: string; icon: LucideIcon }[];
}


// Komponen Helper untuk Leaflet map clicks
interface MapClickEventHandlerProps {
    onMapClick: (lat: number, lng: number) => void;
    currentPosition?: [number, number];
}
const MapClickEventHandler: React.FC<MapClickEventHandlerProps> = ({ onMapClick, currentPosition }) => {
    const map = useMapEvents({
        click: (e) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });

    useEffect(() => {
      if (currentPosition) {
        // map.setView(currentPosition, map.getZoom()); // Pindah peta ke posisi saat ini
      }
    }, [currentPosition, map]);

    return null;
};


// UMKMModal Component - For Add/Edit Form
interface UMKMModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  editingItem: UMKMItem | null;
  handleSave: (formData: UMKMItem, file: File | null) => Promise<void>;
  isSaving: boolean;
  CLOUDINARY_CLOUD_NAME: string; 
  CLOUDINARY_UPLOAD_PRESET: string; 
}

const UMKMModal: React.FC<UMKMModalProps> = ({ showModal, setShowModal, editingItem, handleSave, isSaving, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET }) => {
  const [formData, setFormData] = useState<UMKMItem>(
    editingItem || {
      name: '', description: '', image: 'https://placehold.co/150x100/aabbcc/ffffff?text=No+Image',
      rating: 0, price: '', category: 'Makanan & Minuman', products: [],
      contact: '', established: '', employees: '',
      latitude: undefined, longitude: undefined, address: '', // Properti geolokasi
    }
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    (editingItem?.latitude && editingItem?.longitude) 
    ? [editingItem.latitude, editingItem.longitude] 
    : [-6.524828, 107.174051] // Default ke koordinat desa Anda
  );

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
      setImagePreview(editingItem.image);
      setSelectedFile(null);
      setMapCenter((editingItem.latitude && editingItem.longitude) ? [editingItem.latitude, editingItem.longitude] : [-6.524828, 107.174051]);
    } else {
      const defaultImage = 'https://placehold.co/150x100/aabbcc/ffffff?text=No+Image';
      setFormData({
        name: '', description: '', image: defaultImage, rating: 0, price: '',
        category: 'Makanan & Minuman', products: [], contact: '',
        established: '', employees: '', latitude: undefined, longitude: undefined, address: '',
      });
      setImagePreview(defaultImage);
      setSelectedFile(null);
      setMapCenter([-6.524828, 107.174051]); // Reset map center ke default
    }
  }, [editingItem, showModal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || undefined : value, // Gunakan undefined untuk nilai kosong pada number
    }));
  };

  const handleProductsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      // PERBAIKAN DI SINI: filter hanya string yang kosong setelah di-trim
      // Ini akan mempertahankan string dengan spasi di dalamnya, misal "Produk Saya"
      products: value.split(',').map(p => p.trim()).filter(p => p.length > 0), 
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setImagePreview(formData.image || 'https://placehold.co/150x100/aabbcc/ffffff?text=No+Image');
    }
  };

  // Handler untuk klik peta
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setFormData(prev => ({ ...prev!, latitude: lat, longitude: lng }));
    setMapCenter([lat, lng]);
  }, []);

  // Handler untuk mendapatkan lokasi saat ini dari browser
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({ 
            ...prev!, 
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude 
          }));
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          alert("Gagal mendapatkan lokasi saat ini. Pastikan Anda mengizinkan akses lokasi di browser Anda.");
        }
      );
    } else {
      alert("Geolocation tidak didukung oleh browser Anda.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave(formData, selectedFile);
  };

  if (!showModal) return null;

  const categories = ['Makanan & Minuman', 'Kerajinan Tangan', 'Jasa', 'Lainnya'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 rounded-full p-1 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-semibold mb-5 text-gray-800 border-b pb-3">
          {editingItem ? 'Edit Data UMKM' : 'Tambah Data UMKM Baru'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bagian UMKM Details yang sudah ada */}
          <div> <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama UMKM</label> <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" placeholder="Masukkan Nama UMKM" required /> </div>
          <div> <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label> <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" placeholder="Masukkan deskripsi singkat UMKM" required></textarea> </div>
          <div> <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label> <select id="category" name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-white" required> {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))} </select> </div>
          <div> <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Harga Produk / Range Harga</label> <input type="text" id="price" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" placeholder="Contoh: Rp 15.000 - 25.000" required /> </div>
          <div> <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Rating (0.0 - 5.0)</label> <input type="number" id="rating" name="rating" value={formData.rating} onChange={handleChange} min="0" max="5" step="0.1" className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" placeholder="Masukkan rating" required /> </div>
          <div> <label htmlFor="products" className="block text-sm font-medium text-gray-700 mb-1">Produk Unggulan (Pisahkan dengan koma)</label> <textarea id="products" name="products" value={formData.products.join(', ')} onChange={handleProductsChange} rows={2} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" placeholder="Contoh: Keripik Original, Keripik Balado, Keripik Manis"></textarea> </div>
          <div> <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">Kontak (Nomor Telepon/WhatsApp)</label> <input type="text" id="contact" name="contact" value={formData.contact} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" placeholder="Contoh: +62 812 3456 7890" required /> </div>
          <div> <label htmlFor="established" className="block text-sm font-medium text-gray-700 mb-1">Tahun Berdiri</label> <input type="text" id="established" name="established" value={formData.established} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" placeholder="Contoh: 2018" /> </div>
          <div> <label htmlFor="employees" className="block text-sm font-medium text-gray-700 mb-1">Jumlah Karyawan</label> <input type="text" id="employees" name="employees" value={formData.employees} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" placeholder="Contoh: 5 orang" /> </div>
          
          {/* --- BAGIAN TAMBAHAN UNTUK GEOLOKASI --- */}
          <h4 className="text-lg font-semibold mt-6 mb-3 text-gray-800 border-b pb-2">Informasi Lokasi (Geolokasi)</h4>
          {/* Alamat UMKM */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
            <textarea
              id="address" name="address" value={formData.address || ''} onChange={handleChange} rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="Masukkan alamat lengkap UMKM"
            ></textarea>
          </div>
          {/* Latitude */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number" id="latitude" name="latitude" value={formData.latitude ?? ''} onChange={handleChange} step="any"
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                placeholder="Contoh: -6.123456"
              />
            </div>
            {/* Longitude */}
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number" id="longitude" name="longitude" value={formData.longitude ?? ''} onChange={handleChange} step="any"
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                placeholder="Contoh: 106.123456"
              />
            </div>
          </div>
          {/* Tombol Get Current Location */}
          <button
            type="button"
            onClick={handleGetLocation}
            className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium shadow-sm"
          >
            <LocateFixed className="w-5 h-5" />
            <span>Dapatkan Lokasi Saat Ini</span>
          </button>

          {/* Peta Interaktif di Modal */}
          <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
            <MapContainer 
              center={mapCenter} 
              zoom={14} 
              scrollWheelZoom={true} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {formData.latitude && formData.longitude && (
                <Marker position={[formData.latitude, formData.longitude]} icon={defaultIcon}>
                  <Popup>Lokasi UMKM</Popup>
                </Marker>
              )}
              <MapClickEventHandler onMapClick={handleMapClick} currentPosition={mapCenter}/>
            </MapContainer>
          </div>
          {/* --- AKHIR BAGIAN TAMBAHAN GEOLOKASI --- */}

          {/* Foto File Input */}
          <div> <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Pilih Gambar UMKM</label> <input type="file" id="image" name="image" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" /> {imagePreview && (<div className="mt-4 flex items-center space-x-3"> <img src={imagePreview} alt="Pratinjau Gambar" className="w-32 h-24 object-cover border border-gray-200 shadow-sm rounded-md" onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = 'https://placehold.co/150x100/aabbcc/ffffff?text=Error'; }} /> <span className="text-sm text-gray-600">Pratinjau Gambar</span> </div>)} </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium" disabled={isSaving}> Batal </button>
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md flex items-center space-x-2 justify-center" disabled={isSaving}>
              {isSaving ? (<><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> <span>Menyimpan...</span> </>) : (<><Save className="w-5 h-5" /> <span>Simpan</span></>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ConfirmationModal Component
interface ConfirmationModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ showModal, setShowModal, onConfirm, message }) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg text-center relative">
        <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 rounded-full p-1 transition-colors" aria-label="Close modal"> <X className="w-5 h-5" /> </button>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Konfirmasi</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <button onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"> Batal </button>
          <button onClick={() => { onConfirm(); setShowModal(false); }} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"> Hapus </button>
        </div>
      </div>
    </div>
  );
};


const UMKM: React.FC<UMKMProps> = ({ searchQuery, setSearchQuery, menuItems }) => {
  const [umkmData, setUmkmData] = useState<UMKMItem[]>([]);
  const [showAddEditModal, setShowAddEditModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<UMKMItem | null>(null);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Konfigurasi Cloudinary Anda
  const CLOUDINARY_CLOUD_NAME = 'dkwin6gga'; 
  const CLOUDINARY_UPLOAD_PRESET = 'medalsari-image'; 

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
          apiKey: "dummy-api-key", authDomain: "dummy-auth-domain.firebaseapp.com", projectId: "dummy-project-id",
          storageBucket: "dummy-storage-bucket.appspot.com", messagingSenderId: "dummy-sender-id", appId: "dummy-app-id"
        };
        setError("Konfigurasi Firebase tidak ditemukan atau kosong. UI akan dimuat, tetapi operasi data tidak akan berfungsi. Pastikan '__firebase_config' disetel dengan benar.");
      }

      let app: FirebaseApp;
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        console.log("Firebase app initialized.");
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
    console.log("UMKM data fetching useEffect triggered.");
    console.log("db:", db ? "initialized" : "null", "isAuthReady:", isAuthReady, "userId:", userId);

    if (!db || !isAuthReady) { 
      console.log("Conditions not met for data fetching. Returning.");
      if (!error && !loading) {
          const fallbackTimeout = setTimeout(() => {
              setLoading(false);
              if (umkmData.length === 0) {
                  setError("Data UMKM belum dimuat atau tidak ditemukan. Silakan tambahkan data baru.");
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
      console.log("UMKM loading timeout reached. Setting loading to false.");
      setLoading(false);
      if (umkmData.length === 0 && !error?.includes("Konfigurasi Firebase tidak ditemukan")) {
          setError("Waktu pemuatan data habis. Mungkin tidak ada data atau ada masalah koneksi/izin.");
      }
    }, 5000); // 5 seconds timeout

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const collectionPath = `/artifacts/${appId}/umkm`; 
    console.log("Attempting to listen to collection:", collectionPath);

    const q = query(collection(db, collectionPath));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("onSnapshot callback triggered for UMKM.");
      clearTimeout(loadingTimeout);
      const data: UMKMItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<UMKMItem, 'id'>,
        products: (doc.data() as any).products || [],
        latitude: (doc.data() as any).latitude,
        longitude: (doc.data() as any).longitude,
        address: (doc.data() as any).address || '',
      }));
      const sortedData = data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setUmkmData(sortedData);
      setLoading(false);
      setError(null);
      console.log("UMKM data loaded successfully.");
    }, (err) => {
      console.error("Error fetching UMKM data in onSnapshot:", err);
      clearTimeout(loadingTimeout);
      setError(`Failed to fetch data: ${err.message}. Pastikan aturan keamanan Firestore mengizinkan akses untuk path: ${collectionPath}`);
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up onSnapshot listener and loading timeout.");
      unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, [db, isAuthReady]);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setShowAddEditModal(true);
  }, []);

  const handleEdit = useCallback((item: UMKMItem) => {
    setEditingItem(item);
    setShowAddEditModal(true);
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    setItemToDeleteId(id);
    setShowConfirmModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!db || !itemToDeleteId) {
      setError("Database not initialized or no item selected for deletion. Tidak dapat menghapus data.");
      return;
    }

    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const docRef = doc(db, `/artifacts/${appId}/umkm`, itemToDeleteId);
      await deleteDoc(docRef);
      console.log("Document successfully deleted!");
      setItemToDeleteId(null);
    } catch (e: any) {
      console.error("Error removing document: ", e);
      setError(`Failed to delete data: ${e.message}`);
    }
  }, [db, itemToDeleteId]);

  const handleSave = useCallback(async (formData: UMKMItem, file: File | null) => {
    if (!db) {
      setError("Database tidak diinisialisasi. Tidak dapat menyimpan data.");
      return;
    }

    setIsSaving(true);
    let imageUrl = formData.image;

    try {
      if (file) {
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        console.log("Uploading file to Cloudinary...");
        const response = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: uploadFormData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
        }

        const data = await response.json();
        imageUrl = data.secure_url;
        console.log("File uploaded to Cloudinary, URL:", imageUrl);
      } else if (!formData.image) {
        imageUrl = 'https://placehold.co/150x100/aabbcc/ffffff?text=No+Image';
      }

      const dataToSave = { ...formData, image: imageUrl };

      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      if (dataToSave.id) {
        const docRef = doc(db, `/artifacts/${appId}/umkm`, dataToSave.id);
        await setDoc(docRef, dataToSave, { merge: true });
        console.log("Document successfully updated!");
      } else {
        const collectionRef = collection(db, `/artifacts/${appId}/umkm`);
        await addDoc(collectionRef, dataToSave);
        console.log("Document successfully added!");
      }
      setShowAddEditModal(false);
      setEditingItem(null);
      setError(null);
    } catch (e: any) {
      console.error("Error saving document or uploading image: ", e);
      setError(`Failed to save data: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [db, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET]);

  const getTableHeaders = useCallback(() => ['Gambar', 'Nama', 'Kategori', 'Harga', 'Rating', 'Kontak', 'Alamat/Lokasi'], []); // Tambahkan header baru

  const renderTableRow = useCallback((item: UMKMItem) => (
    <>
      <td className="px-4 py-3">
        <img src={item.image} alt={item.name} className="w-16 h-12 object-cover rounded-md border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = 'https://placehold.co/64x48/aabbcc/ffffff?text=X'; }} />
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{item.category}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{item.price}</td>
      <td className="px-4 py-3 text-sm text-gray-700">⭐ {item.rating}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{item.contact}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{item.address || 'N/A'}</td> {/* Tampilkan alamat */}
    </>
  ), []);

  const filteredData = umkmData.filter(item => {
    const searchFields = `${item.name} ${item.description} ${item.category} ${item.price} ${item.products.join(' ')} ${item.contact} ${item.established} ${item.employees} ${item.address || ''}`.toLowerCase(); // Tambahkan address ke pencarian
    return searchFields.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-600">Memuat data UMKM...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-700 bg-red-50 rounded-lg border border-red-200 mx-4 font-sans">
        <p className="font-semibold text-lg mb-2">Terjadi Kesalahan!</p>
        <p className="text-base">{error}</p>
        <p className="text-sm mt-3">Pastikan Firebase dikonfigurasi dengan benar dan aturan keamanan Firestore mengizinkan akses.</p>
        {userId && (
          <p className="text-sm mt-2">
            User ID Anda: <code className="bg-gray-200 px-2 py-1 rounded text-gray-800 break-all">{userId}</code>
          </p>
        )}
        <button onClick={() => { setError(null); setLoading(true); }} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"> Coba Lagi </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-3xl font-extrabold text-gray-900"> {menuItems.find(item => item.id === 'umkm')?.label || 'Data UMKM'} </h2>
          <span className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-base font-semibold shadow-sm"> {filteredData.length} data </span>
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Cari data..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full shadow-sm text-base" />
          </div>
          <button onClick={handleAdd} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-semibold shadow-md"> <Plus className="w-5 h-5" /> <span>Tambah UMKM</span> </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr> {getTableHeaders().map(header => (<th key={header} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"> {header} </th>))} <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"> Aksi </th> </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredData.length > 0 ? ( filteredData.map(item => (<tr key={item.id} className="hover:bg-gray-50 transition-colors"> {renderTableRow(item)} <td className="px-4 py-3 text-sm"> <div className="flex items-center space-x-3"> <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors" aria-label={`Edit ${item.name}`}> <Edit className="w-5 h-5" /> </button> <button onClick={() => item.id && handleDeleteClick(item.id)} className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors" aria-label={`Delete ${item.name}`}> <Trash2 className="w-5 h-5" /> </button> </div> </td> </tr>)) ) : ( <tr> <td colSpan={getTableHeaders().length + 1} className="text-center py-8 text-gray-500 text-lg"> Tidak ada data UMKM yang ditemukan. </td> </tr> )}
            </tbody>
          </table>
        </div>
      </div>

      {userId && (<div className="text-center p-2 bg-gray-100 text-gray-600 rounded-lg text-sm mt-4"> User ID Aktif: <code className="font-mono bg-gray-200 px-1 py-0.5 rounded break-all">{userId}</code> </div>)}

      {/* Modal for Add/Edit */}
      <UMKMModal
        showModal={showAddEditModal}
        setShowModal={setShowAddEditModal}
        editingItem={editingItem}
        handleSave={handleSave}
        isSaving={isSaving}
        CLOUDINARY_CLOUD_NAME={CLOUDINARY_CLOUD_NAME} // Pass Cloudinary config
        CLOUDINARY_UPLOAD_PRESET={CLOUDINARY_UPLOAD_PRESET} // Pass Cloudinary config
      />

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        showModal={showConfirmModal}
        setShowModal={setShowConfirmModal}
        onConfirm={handleDeleteConfirm}
        message="Apakah Anda yakin ingin menghapus data UMKM ini secara permanen? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
};

export default UMKM;