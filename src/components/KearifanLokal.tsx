import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, LucideIcon, X, UploadCloud, Save, Book, Users, Leaf, Heart, Moon, Sun, Calendar, TreePine, Droplets, Wind } from 'lucide-react';
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
// Menghapus impor Firebase Storage karena kita akan menggunakan Cloudinary untuk gambar

// Definisi tipe untuk item Kearifan Lokal
export interface KearifanLokalItem {
  id?: string; // Firestore ID will be a string
  name: string;
  description: string;
  image: string; // URL gambar
  category: string;
  philosophy: string;
  practices: string[]; // Array of strings
  benefits: string[]; // Array of strings
  iconName: string; // Nama ikon Lucide (e.g., 'Users', 'Calendar')
  colorClass: string; // Kelas warna Tailwind (e.g., 'bg-blue-500')
  status: 'Aktif' | 'Perlu Revitalisasi';
}

// Map icon names to actual LucideIcon components
const iconMap: { [key: string]: LucideIcon } = {
  Book, Users, Leaf, Heart, Moon, Sun, Calendar, TreePine, Droplets, Wind,
};

// Map color class names to actual Tailwind classes (for display in modal)
const colorOptions = [
  { value: 'bg-blue-500', label: 'Biru' },
  { value: 'bg-green-500', label: 'Hijau' },
  { value: 'bg-purple-500', label: 'Ungu' },
  { value: 'bg-emerald-500', label: 'Emerald' },
  { value: 'bg-indigo-500', label: 'Indigo' },
  { value: 'bg-teal-500', label: 'Teal' },
  { value: 'bg-cyan-500', label: 'Cyan' },
  { value: 'bg-yellow-500', label: 'Kuning' },
  { value: 'bg-lime-500', label: 'Lime' },
  { value: 'bg-orange-500', label: 'Oranye' },
  { value: 'bg-red-500', label: 'Merah' },
  { value: 'bg-gray-500', label: 'Abu-abu' },
];

// Definisi tipe untuk props komponen KearifanLokal
interface KearifanLokalProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  menuItems: { id: string; label: string; icon: LucideIcon }[];
}

// KearifanLokalModal Component - For Add/Edit Form
interface KearifanLokalModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  editingItem: KearifanLokalItem | null;
  handleSave: (formData: KearifanLokalItem, file: File | null) => Promise<void>;
  isSaving: boolean;
  CLOUDINARY_CLOUD_NAME: string; // Pass Cloudinary config to modal
  CLOUDINARY_UPLOAD_PRESET: string; // Pass Cloudinary config to modal
}

const KearifanLokalModal: React.FC<KearifanLokalModalProps> = ({ showModal, setShowModal, editingItem, handleSave, isSaving, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET }) => {
  const [formData, setFormData] = useState<KearifanLokalItem>(
    editingItem || {
      name: '',
      description: '',
      image: 'https://placehold.co/150x100/aabbcc/ffffff?text=No+Image',
      category: 'Tradisi Sosial',
      philosophy: '',
      practices: [],
      benefits: [],
      iconName: 'Book', // Default icon
      colorClass: 'bg-blue-500', // Default color
      status: 'Aktif',
    }
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
      setImagePreview(editingItem.image);
      setSelectedFile(null);
    } else {
      const defaultImage = 'https://placehold.co/150x100/aabbcc/ffffff?text=No+Image';
      setFormData({
        name: '',
        description: '',
        image: defaultImage,
        category: 'Tradisi Sosial',
        philosophy: '',
        practices: [],
        benefits: [],
        iconName: 'Book',
        colorClass: 'bg-blue-500',
        status: 'Aktif',
      });
      setImagePreview(defaultImage);
      setSelectedFile(null);
    }
  }, [editingItem, showModal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>, fieldName: 'practices' | 'benefits') => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      [fieldName]: value.split(',').map(item => item.trim()).filter(item => item !== ''),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setImagePreview(formData.image || 'https://placehold.co/150x100/aabbcc/ffffff?text=No+Image'); // Handle case where image might be null/empty
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave(formData, selectedFile);
  };

  if (!showModal) return null;

  const categories = ['Tradisi Sosial', 'Pengetahuan Tradisional', 'Ritual & Upacara', 'Filosofi Hidup', 'Lainnya'];
  const iconNames = Object.keys(iconMap); // Get all available icon names

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
          {editingItem ? 'Edit Data Kearifan Lokal' : 'Tambah Data Kearifan Lokal Baru'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Kearifan Lokal</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="Masukkan Nama Kearifan Lokal"
              required
            />
          </div>
          {/* Deskripsi */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="Masukkan deskripsi singkat kearifan lokal"
              required
            ></textarea>
          </div>
          {/* Kategori */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-white"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {/* Filosofi */}
          <div>
            <label htmlFor="philosophy" className="block text-sm font-medium text-gray-700 mb-1">Filosofi</label>
            <input
              type="text"
              id="philosophy"
              name="philosophy"
              value={formData.philosophy}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="Masukkan filosofi kearifan lokal"
              required
            />
          </div>
          {/* Praktik Tradisional */}
          <div>
            <label htmlFor="practices" className="block text-sm font-medium text-gray-700 mb-1">Praktik Tradisional (Pisahkan dengan koma)</label>
            <textarea
              id="practices"
              name="practices"
              value={formData.practices.join(', ')}
              onChange={(e) => handleArrayChange(e as React.ChangeEvent<HTMLTextAreaElement>, 'practices')}
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="Contoh: Kerja bakti desa, Membangun rumah bersama"
            ></textarea>
          </div>
          {/* Manfaat */}
          <div>
            <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 mb-1">Manfaat (Pisahkan dengan koma)</label>
            <textarea
              id="benefits"
              name="benefits"
              value={formData.benefits.join(', ')}
              onChange={(e) => handleArrayChange(e as React.ChangeEvent<HTMLTextAreaElement>, 'benefits')}
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="Contoh: Mempererat silaturahmi, Meringankan beban"
            ></textarea>
          </div>
          {/* Icon Name */}
          <div>
            <label htmlFor="iconName" className="block text-sm font-medium text-gray-700 mb-1">Pilih Ikon</label>
            <select
              id="iconName"
              name="iconName"
              value={formData.iconName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-white"
              required
            >
              {iconNames.map(icon => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
          </div>
          {/* Color Class */}
          <div>
            <label htmlFor="colorClass" className="block text-sm font-medium text-gray-700 mb-1">Pilih Warna</label>
            <select
              id="colorClass"
              name="colorClass"
              value={formData.colorClass}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-white"
              required
            >
              {colorOptions.map(color => (
                <option key={color.value} value={color.value}>{color.label}</option>
              ))}
            </select>
          </div>
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-white"
              required
            >
              <option value="Aktif">Aktif</option>
              <option value="Perlu Revitalisasi">Perlu Revitalisasi</option>
            </select>
          </div>
          {/* Foto File Input */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Pilih Gambar Kearifan Lokal</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {imagePreview && (
              <div className="mt-4 flex items-center space-x-3">
                <img
                  src={imagePreview}
                  alt="Pratinjau Gambar"
                  className="w-32 h-24 object-cover border border-gray-200 shadow-sm rounded-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = 'https://placehold.co/150x100/aabbcc/ffffff?text=Error';
                  }}
                />
                <span className="text-sm text-gray-600">Pratinjau Gambar</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-5 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              disabled={isSaving}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md flex items-center space-x-2 justify-center"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Simpan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ConfirmationModal Component (dapat digunakan kembali dari komponen lain)
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
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 rounded-full p-1 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Konfirmasi</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setShowModal(false)}
            className="px-5 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onConfirm();
              setShowModal(false);
            }}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};


const KearifanLokal: React.FC<KearifanLokalProps> = ({ searchQuery, setSearchQuery, menuItems }) => {
  const [kearifanData, setKearifanData] = useState<KearifanLokalItem[]>([]);
  const [showAddEditModal, setShowAddEditModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<KearifanLokalItem | null>(null);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  // Hapus state `storage` karena tidak lagi digunakan untuk upload
  // const [storage, setStorage] = useState<FirebaseStorage | null>(null); 
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Konfigurasi Cloudinary Anda
  const CLOUDINARY_CLOUD_NAME = 'dkwin6gga'; // Cloud Name Anda
  const CLOUDINARY_UPLOAD_PRESET = 'medalsari-image'; // Nama Upload Preset Anda

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
      // Hapus inisialisasi Firebase Storage
      // const firebaseStorage: FirebaseStorage = getStorage(app);

      setDb(firestore);
      setAuth(firebaseAuth);
      // Hapus setStorage
      // setStorage(firebaseStorage); 
      
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
    console.log("Kearifan Lokal data fetching useEffect triggered.");
    console.log("db:", db ? "initialized" : "null", "isAuthReady:", isAuthReady, "userId:", userId);

    if (!db || !isAuthReady) { // userId removed from condition as data is shared
      console.log("Conditions not met for data fetching. Returning.");
      if (!error && !loading) {
          const fallbackTimeout = setTimeout(() => {
              setLoading(false);
              if (kearifanData.length === 0) {
                  setError("Data kearifan lokal belum dimuat atau tidak ditemukan. Silakan tambahkan data baru.");
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
      console.log("Kearifan Lokal loading timeout reached. Setting loading to false.");
      setLoading(false);
      if (kearifanData.length === 0 && !error?.includes("Konfigurasi Firebase tidak ditemukan")) {
          setError("Waktu pemuatan data habis. Mungkin tidak ada data atau ada masalah koneksi/izin.");
      }
    }, 5000); // 5 seconds timeout

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    // --- START MODIFICATION (MATCHING BERITA'S SHARED PATH) ---
    const collectionPath = `/artifacts/${appId}/kearifanLokal`; 
    // --- END MODIFICATION ---
    console.log("Attempting to listen to collection:", collectionPath);

    const q = query(collection(db, collectionPath));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("onSnapshot callback triggered for kearifan lokal.");
      clearTimeout(loadingTimeout);
      const data: KearifanLokalItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<KearifanLokalItem, 'id'>
      }));
      const sortedData = data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setKearifanData(sortedData);
      setLoading(false);
      setError(null);
      console.log("Kearifan Lokal data loaded successfully.");
    }, (err) => {
      console.error("Error fetching kearifan lokal data in onSnapshot:", err);
      clearTimeout(loadingTimeout);
      setError(`Failed to fetch data: ${err.message}. Pastikan aturan keamanan Firestore mengizinkan akses untuk path: ${collectionPath}`);
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up onSnapshot listener and loading timeout.");
      unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, [db, isAuthReady]); // userId removed from dependencies for shared data

  // Handle adding new item
  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setShowAddEditModal(true);
  }, []);

  // Handle editing an item
  const handleEdit = useCallback((item: KearifanLokalItem) => {
    setEditingItem(item);
    setShowAddEditModal(true);
  }, []);

  // Handle initiating delete confirmation
  const handleDeleteClick = useCallback((id: string) => {
    setItemToDeleteId(id);
    setShowConfirmModal(true);
  }, []);

  // Handle confirming and executing delete
  const handleDeleteConfirm = useCallback(async () => {
    // userId removed from condition as data is shared
    if (!db || !itemToDeleteId) { 
      setError("Database not initialized or no item selected for deletion. Tidak dapat menghapus data.");
      return;
    }

    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      // --- START MODIFICATION (MATCHING BERITA'S SHARED PATH) ---
      const docRef = doc(db, `/artifacts/${appId}/kearifanLokal`, itemToDeleteId);
      // --- END MODIFICATION ---
      await deleteDoc(docRef);
      console.log("Document successfully deleted!");
      setItemToDeleteId(null);
    } catch (e: any) {
      console.error("Error removing document: ", e);
      setError(`Failed to delete data: ${e.message}`);
    }
  }, [db, itemToDeleteId]); // userId removed from dependencies for shared data

  // Handle saving (add or edit) data to Firestore, now accepts a File object
  const handleSave = useCallback(async (formData: KearifanLokalItem, file: File | null) => {
    // Menghapus `storage` dari dependensi, karena tidak lagi digunakan.
    // userId removed from condition as data is shared
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
        // Karena 'asset folder: my_gallery_app' sudah diset di preset Cloudinary Anda,
        // gambar akan otomatis masuk ke folder itu.
        // Tidak perlu menambahkan 'folder' secara eksplisit di sini kecuali Anda ingin sub-folder.

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
        imageUrl = data.secure_url; // Dapatkan URL gambar dari Cloudinary
        console.log("File uploaded to Cloudinary, URL:", imageUrl);
      } else if (!formData.image) {
        // Jika tidak ada file baru dan foto sebelumnya kosong, gunakan placeholder
        imageUrl = 'https://placehold.co/150x100/aabbcc/ffffff?text=No+Image';
      }

      const dataToSave = { ...formData, image: imageUrl };

      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      if (dataToSave.id) {
        // --- START MODIFICATION (MATCHING BERITA'S SHARED PATH) ---
        const docRef = doc(db, `/artifacts/${appId}/kearifanLokal`, dataToSave.id);
        // --- END MODIFICATION ---
        await setDoc(docRef, dataToSave, { merge: true });
        console.log("Document successfully updated!");
      } else {
        // --- START MODIFICATION (MATCHING BERITA'S SHARED PATH) ---
        const collectionRef = collection(db, `/artifacts/${appId}/kearifanLokal`);
        // --- END MODIFICATION ---
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
  }, [db, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET]); // userId removed from dependencies as data is shared


  // Defines the table headers
  const getTableHeaders = useCallback(() => ['Gambar', 'Nama', 'Kategori', 'Filosofi', 'Status'], []);

  // Renders a single table row
  const renderTableRow = useCallback((item: KearifanLokalItem) => {
    const IconComponent = iconMap[item.iconName] || Book; // Fallback to Book icon
    return (
      <>
        <td className="px-4 py-3">
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-12 object-cover rounded-md border border-gray-200"
            onError={(e) => {
              (e.target as HTMLImageElement).onerror = null;
              (e.target as HTMLImageElement).src = 'https://placehold.co/64x48/aabbcc/ffffff?text=X';
            }}
          />
        </td>
        <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
        <td className="px-4 py-3 text-sm text-gray-700">
          <span className={`px-2 py-1 rounded text-xs font-medium ${item.colorClass || 'bg-gray-100 text-gray-800'}`}>
            <IconComponent className="w-4 h-4 inline-block mr-1" /> {item.category}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-700 line-clamp-2">{item.philosophy}</td>
        <td className="px-4 py-3">
          <span className={`px-2 py-1 rounded text-xs ${
            item.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
          }`}>
            {item.status}
          </span>
        </td>
      </>
    );
  }, []);

  // Filter data based on search query
  const filteredData = kearifanData.filter(item => {
    const searchFields = `${item.name} ${item.description} ${item.category} ${item.philosophy} ${item.practices.join(' ')} ${item.benefits.join(' ')} ${item.status}`.toLowerCase();
    return searchFields.includes(searchQuery.toLowerCase());
  });

  // Display loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-600">Memuat data kearifan lokal...</p>
      </div>
    );
  }

  // Display error message
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

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {menuItems.find(item => item.id === 'kearifanLokal')?.label || 'Data Kearifan Lokal'}
          </h2>
          <span className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-base font-semibold shadow-sm">
            {filteredData.length} data
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full shadow-sm text-base"
            />
          </div>
          <button
            onClick={handleAdd}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-semibold shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Kearifan Lokal</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {getTableHeaders().map(header => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredData.length > 0 ? (
                filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    {renderTableRow(item)}
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors"
                          aria-label={`Edit ${item.name}`}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => item.id && handleDeleteClick(item.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={getTableHeaders().length + 1} className="text-center py-8 text-gray-500 text-lg">
                    Tidak ada data kearifan lokal yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {userId && (
        <div className="text-center p-2 bg-gray-100 text-gray-600 rounded-lg text-sm mt-4">
          User ID Aktif: <code className="font-mono bg-gray-200 px-1 py-0.5 rounded break-all">{userId}</code>
        </div>
      )}

      {/* Modal for Add/Edit */}
      <KearifanLokalModal
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
        message="Apakah Anda yakin ingin menghapus data kearifan lokal ini secara permanen? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
};

export default KearifanLokal;