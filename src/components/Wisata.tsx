import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, LucideIcon, X, Save } from 'lucide-react'; // Removed UploadCloud, Star, MapPin, Clock, Phone as they are not directly used here
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

// Definisi tipe untuk item Wisata
export interface WisataItem {
  id?: string; // Firestore ID will be a string
  name: string;
  description: string;
  image: string; // URL gambar
  rating: number;
  price: string; // e.g., "Rp 15.000"
  hours: string; // e.g., "08:00 - 17:00"
  facilities: string[]; // Array of strings
  contact: string; // e.g., "+62 812 3456 7890"
}

// Definisi tipe untuk props komponen Wisata
interface WisataProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  menuItems: { id: string; label: string; icon: LucideIcon }[];
}

// WisataModal Component - For Add/Edit Form
interface WisataModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  editingItem: WisataItem | null;
  handleSave: (formData: WisataItem, file: File | null) => Promise<void>;
  isSaving: boolean;
  CLOUDINARY_CLOUD_NAME: string; // Pass Cloudinary config to modal
  CLOUDINARY_UPLOAD_PRESET: string; // Pass Cloudinary config to modal
}

const WisataModal: React.FC<WisataModalProps> = ({ showModal, setShowModal, editingItem, handleSave, isSaving, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET }) => {
  const [formData, setFormData] = useState<WisataItem>(
    editingItem || {
      name: '',
      description: '',
      image: 'https://placehold.co/150x100/aabbcc/ffffff?text=No+Image',
      rating: 0,
      price: '',
      hours: '',
      facilities: [],
      contact: '',
    }
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
      setImagePreview(editingItem.image);
      setSelectedFile(null); // Ensure no file is selected when in edit mode, unless re-uploaded
    } else {
      const defaultImage = 'https://placehold.co/150x100/aabbcc/ffffff?text=No+Image';
      setFormData({
        name: '',
        description: '',
        image: defaultImage,
        rating: 0,
        price: '',
        hours: '',
        facilities: [],
        contact: '',
      });
      setImagePreview(defaultImage);
      setSelectedFile(null);
    }
  }, [editingItem, showModal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleFacilitiesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    // Convert comma-separated string to array of strings
    setFormData(prev => ({
      ...prev,
      facilities: value.split(',').map(f => f.trim()).filter(f => f !== ''),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file)); // Create preview from selected file
    } else {
      setSelectedFile(null);
      setImagePreview(formData.image || 'https://placehold.co/150x100/aabbcc/ffffff?text=No+Image'); // Fallback to old image or placeholder
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave(formData, selectedFile);
  };

  if (!showModal) return null;

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
          {editingItem ? 'Edit Data Wisata' : 'Tambah Data Wisata Baru'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Wisata</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="Masukkan Nama Tempat Wisata"
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
              placeholder="Masukkan deskripsi singkat tempat wisata"
              required
            ></textarea>
          </div>
          {/* Rating */}
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Rating (0.0 - 5.0)</label>
            <input
              type="number"
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              min="0"
              max="5"
              step="0.1"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              required
            />
          </div>
          {/* Harga */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Harga Tiket</label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="Contoh: Rp 15.000"
              required
            />
          </div>
          {/* Jam Operasional */}
          <div>
            <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">Jam Operasional</label>
            <input
              type="text"
              id="hours"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="Contoh: 08:00 - 17:00"
              required
            />
          </div>
          {/* Fasilitas */}
          <div>
            <label htmlFor="facilities" className="block text-sm font-medium text-gray-700 mb-1">Fasilitas (Pisahkan dengan koma)</label>
            <textarea
              id="facilities"
              name="facilities"
              value={formData.facilities.join(', ')} // Convert array to comma-separated string for display
              onChange={handleFacilitiesChange}
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="Contoh: Parkir, Toilet, Warung, Gazebo"
            ></textarea>
          </div>
          {/* Kontak */}
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">Kontak (Nomor Telepon/WhatsApp)</label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              placeholder="Contoh: +62 812 3456 7890"
              required
            />
          </div>
          {/* Foto File Input */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Pilih Gambar Wisata</label>
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


const Wisata: React.FC<WisataProps> = ({ searchQuery, setSearchQuery, menuItems }) => {
  const [wisataData, setWisataData] = useState<WisataItem[]>([]);
  const [showAddEditModal, setShowAddEditModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<WisataItem | null>(null);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  // Removed Firebase Storage state
  // const [storage, setStorage] = useState<FirebaseStorage | null>(null); 
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Cloudinary Configuration
  const CLOUDINARY_CLOUD_NAME = 'dkwin6gga'; // Your Cloud Name
  const CLOUDINARY_UPLOAD_PRESET = 'medalsari-image'; // Your Upload Preset Name


  // Firebase Initialization and Authentication
  useEffect(() => {
    let firebaseConfig: FirebaseOptions | null = null;
    let app: FirebaseApp;

    try {
      // Check if __firebase_config is defined and not empty
      if (typeof __firebase_config !== 'undefined' && __firebase_config.trim() !== '') {
        firebaseConfig = JSON.parse(__firebase_config);
        console.log("Firebase config loaded from __firebase_config.");
      } else {
        console.warn("Firebase config (__firebase_config) is undefined or empty. Using dummy config. Firestore operations will not work.");
        // Provide a dummy config for development if not provided
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

      // Initialize Firebase app only once
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        console.log("Firebase app initialized.");
      } else {
        app = getApps()[0];
        console.log("Using existing Firebase app.");
      }

      // Get Firestore and Auth instances
      const firestore: Firestore = getFirestore(app);
      const firebaseAuth: Auth = getAuth(app);
      // Removed Firebase Storage initialization
      // const firebaseStorage: FirebaseStorage = getStorage(app); 

      setDb(firestore);
      setAuth(firebaseAuth);
      // Removed Firebase Storage state setting
      // setStorage(firebaseStorage); 

      // Listen for auth state changes
      const unsubscribeAuth = firebaseAuth.onAuthStateChanged(async (user: FirebaseAuthUser | null) => {
        if (user) {
          setUserId(user.uid);
          console.log("User authenticated:", user.uid);
        } else {
          try {
            // Sign in anonymously if no user is authenticated
            const anonUser = await signInAnonymously(firebaseAuth);
            setUserId(anonUser.user.uid);
            console.log("Signed in anonymously:", anonUser.user.uid);
          } catch (anonError: any) {
            console.error("Error signing in anonymously:", anonError);
            setError(`Authentication error: ${anonError.message}`);
          }
        }
        setIsAuthReady(true); // Mark auth as ready once state is determined
      });

      // Cleanup auth listener on component unmount
      return () => unsubscribeAuth();
    } catch (e: any) {
      console.error("Failed to initialize Firebase:", e);
      // More specific error messages for common issues
      if (e.message.includes("Firebase App named '[DEFAULT]' already exists")) {
        setError("Firebase sudah diinisialisasi di tempat lain dengan konfigurasi berbeda. Pastikan Firebase hanya diinisialisasi sekali di aplikasi Anda.");
      } else if (e.message.includes("Firebase config")) {
        setError(`Kesalahan konfigurasi Firebase: ${e.message}. Pastikan __firebase_config valid.`);
      } else {
        setError(`Firebase initialization error: ${e.message}`);
      }
      setLoading(false); // Stop loading if initialization fails
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Fetch data from Firestore
  useEffect(() => {
    console.log("Wisata data fetching useEffect triggered.");
    console.log("db:", db ? "initialized" : "null", "isAuthReady:", isAuthReady); // userId removed from log

    // Only proceed if db and auth are ready (userId is not needed for shared path)
    if (!db || !isAuthReady) {
      console.log("Conditions not met for data fetching. Returning.");
      // If no error, set loading to false after a short delay if no data loaded
      if (!error && !loading) {
        const fallbackTimeout = setTimeout(() => {
          setLoading(false);
          if (wisataData.length === 0) {
            setError("Data wisata belum dimuat atau tidak ditemukan. Silakan tambahkan data baru.");
          }
        }, 100); // Short delay to allow auth state to settle
        return () => clearTimeout(fallbackTimeout);
      }
      return;
    }

    setLoading(true);
    // Clear previous error if it's not a config error
    if (error && !error.includes("Konfigurasi Firebase tidak ditemukan")) {
      setError(null);
    }

    // Set a timeout for loading, in case onSnapshot never returns
    const loadingTimeout = setTimeout(() => {
      console.log("Wisata loading timeout reached. Setting loading to false.");
      setLoading(false);
      if (wisataData.length === 0 && !error?.includes("Konfigurasi Firebase tidak ditemukan")) {
        setError("Waktu pemuatan data habis. Mungkin tidak ada data atau ada masalah koneksi/izin.");
      }
    }, 5000); // 5 seconds timeout

    // Determine the __app_id, defaulting if not provided
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    // Construct the dynamic collection path (SHARED PATH)
    const collectionPath = `/artifacts/${appId}/wisata`;
    console.log("Attempting to listen to collection:", collectionPath);

    const q = query(collection(db, collectionPath));

    // Subscribe to real-time updates from Firestore
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("onSnapshot callback triggered for wisata.");
      clearTimeout(loadingTimeout); // Clear the loading timeout if data arrives
      const data: WisataItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<WisataItem, 'id'>
      }));
      // Sort data alphabetically by name
      const sortedData = data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setWisataData(sortedData);
      setLoading(false);
      setError(null); // Clear any previous errors on successful data load
      console.log("Wisata data loaded successfully.");
    }, (err) => {
      console.error("Error fetching wisata data in onSnapshot:", err);
      clearTimeout(loadingTimeout); // Clear the loading timeout on error
      setError(`Failed to fetch data: ${err.message}. Pastikan aturan keamanan Firestore mengizinkan akses untuk path: ${collectionPath}`);
      setLoading(false);
    });

    // Cleanup function for useEffect: unsubscribe from snapshot listener and clear timeout
    return () => {
      console.log("Cleaning up onSnapshot listener and loading timeout.");
      unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, [db, isAuthReady, error]); // userId removed from dependencies for shared data; error added to re-trigger on error change

  // Handle adding new item
  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setShowAddEditModal(true);
  }, []);

  // Handle editing an item
  const handleEdit = useCallback((item: WisataItem) => {
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
      setError("Database tidak diinisialisasi atau tidak ada item yang dipilih untuk dihapus. Tidak dapat menghapus data.");
      return;
    }

    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      // Use the shared collection path
      const docRef = doc(db, `artifacts/${appId}/wisata`, itemToDeleteId);
      await deleteDoc(docRef);
      console.log("Document successfully deleted!");
      setItemToDeleteId(null); // Clear the item to delete ID
      setError(null); // Clear any previous errors
    } catch (e: any) {
      console.error("Error removing document: ", e);
      setError(`Failed to delete data: ${e.message}`);
    }
  }, [db, itemToDeleteId]); // userId removed from dependencies

  // Handle saving (add or edit) data to Firestore, now uploads image to Cloudinary
  const handleSave = useCallback(async (formData: WisataItem, file: File | null) => {
    // Ensure db is ready. userId is not strictly needed for the save operation itself as data is shared.
    if (!db) { 
      setError("Database tidak diinisialisasi. Tidak dapat menyimpan data.");
      return;
    }

    setIsSaving(true);
    let imageUrl = formData.image; // Start with existing image URL (if in edit mode)

    try {
      if (file) {
        // Cloudinary image upload logic
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
        imageUrl = data.secure_url; // Get image URL from Cloudinary
        console.log("File uploaded to Cloudinary, URL:", imageUrl);
      } else if (!formData.image) {
        // If no new file selected and previous image was also empty, use placeholder
        imageUrl = 'https://placehold.co/150x100/aabbcc/ffffff?text=No+Image';
      }

      // Prepare data to save, including the image URL (which might be new from Cloudinary)
      const dataToSave = { ...formData, image: imageUrl };

      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      if (dataToSave.id) {
        // If editing an existing item (has ID)
        const docRef = doc(db, `artifacts/${appId}/wisata`, dataToSave.id); // Use shared collection path
        await setDoc(docRef, dataToSave, { merge: true }); // Use merge to avoid overwriting the entire document
        console.log("Document successfully updated!");
      } else {
        // If adding a new item (no ID)
        const collectionRef = collection(db, `artifacts/${appId}/wisata`); // Use shared collection path
        await addDoc(collectionRef, dataToSave);
        console.log("Document successfully added!");
      }
      setShowAddEditModal(false); // Close modal on success
      setEditingItem(null); // Clear editing item state
      setError(null); // Clear any previous errors
    } catch (e: any) {
      console.error("Error saving document or uploading image: ", e);
      setError(`Failed to save data: ${e.message}`);
    } finally {
      setIsSaving(false); // End saving state
    }
  }, [db, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET]); // userId removed from dependencies

  // Defines the table headers
  const getTableHeaders = useCallback(() => ['Gambar', 'Nama', 'Deskripsi', 'Rating', 'Harga', 'Jam', 'Fasilitas', 'Kontak'], []);

  // Renders a single table row
  const renderTableRow = useCallback((item: WisataItem) => (
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
      <td className="px-4 py-3 text-sm text-gray-700 line-clamp-2">{item.description}</td>
      <td className="px-4 py-3 text-sm text-gray-700">⭐ {item.rating}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{item.price}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{item.hours}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{item.facilities.join(', ')}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{item.contact}</td>
    </>
  ), []);

  // Filter data based on search query
  const filteredData = wisataData.filter(item => {
    const searchFields = `${item.name} ${item.description} ${item.price} ${item.hours} ${item.facilities.join(' ')} ${item.contact}`.toLowerCase();
    return searchFields.includes(searchQuery.toLowerCase());
  });

  // Display loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-600">Memuat data wisata...</p>
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
            setLoading(true); // Attempt to reload data
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
            {menuItems.find(item => item.id === 'wisata')?.label || 'Data Wisata'}
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
            <span>Tambah Wisata</span>
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
                    Tidak ada data wisata yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* The userId display here is optional, as the data is now shared.
          You might keep it if userId is still relevant for other authentication-related purposes in your broader app. */}
      {userId && (
        <div className="text-center p-2 bg-gray-100 text-gray-600 rounded-lg text-sm mt-4">
          User ID Aktif: <code className="font-mono bg-gray-200 px-1 py-0.5 rounded break-all">{userId}</code>
        </div>
      )}

      {/* Modal for Add/Edit */}
      <WisataModal
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
        message="Apakah Anda yakin ingin menghapus data wisata ini secara permanen? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
};

export default Wisata;