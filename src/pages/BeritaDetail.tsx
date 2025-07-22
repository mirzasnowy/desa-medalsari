import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Eye, ArrowLeft, Tag } from 'lucide-react'; 
import AOS from 'aos';
import 'aos/dist/aos.css';

// Firebase Imports
import { initializeApp, FirebaseApp, getApps, FirebaseOptions } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, increment, Firestore } from 'firebase/firestore';

// Definisi tipe untuk item Berita
export interface BeritaItem {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  featured: boolean;
  status: 'Published' | 'Draft';
  views?: number;
}

// Tambahkan deklarasi global untuk config Firebase
declare global {
  var __firebase_config: string | undefined;
  var __app_id: string | undefined;
}

const BeritaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [berita, setBerita] = useState<BeritaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
    });

    const fetchBeritaDetail = async () => {
      try {
        let firebaseConfig: FirebaseOptions | null = null;
        
        // Cek apakah Firebase config tersedia
        if (typeof __firebase_config !== 'undefined' && __firebase_config.trim() !== '') {
          firebaseConfig = JSON.parse(__firebase_config);
        } else {
          setError("Firebase config not found. Data might not load.");
          setLoading(false);
          return;
        }

        // Inisialisasi Firebase App
        let app: FirebaseApp;
        if (!getApps().length) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApps()[0];
        }

        const firestore: Firestore = getFirestore(app);

        if (id) {
          const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
          const docRef = doc(firestore, `/artifacts/${appId}/berita`, id);
          
          // Langsung ambil data tanpa autentikasi
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = { 
              id: docSnap.id, 
              ...docSnap.data() as Omit<BeritaItem, 'id'>,
              views: (docSnap.data() as any).views || 0,
            };
            setBerita(data);

            // AUTO-INCREMENT VIEW COUNT (opsional - bisa dijalankan tanpa auth jika rules mengizinkan)
            try {
              await updateDoc(docRef, {
                views: increment(1)
              });
              console.log(`View count incremented for ${id}`);
            } catch (viewError) {
              console.warn(`Could not increment view count for ${id}:`, viewError);
              // Tidak menampilkan error ke user, hanya log warning
            }

          } else {
            setError("Berita tidak ditemukan.");
          }
        }
      } catch (err: any) {
        console.error("Error fetching berita detail:", err);
        setError(`Gagal memuat berita: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBeritaDetail();
  }, [id]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
          return 'Tanggal Tidak Valid';
      }
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      pengumuman: 'bg-blue-100 text-blue-800',
      kegiatan: 'bg-green-100 text-green-800',
      pembangunan: 'bg-purple-100 text-purple-800',
      sosial: 'bg-orange-100 text-orange-800',
      lainnya: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen font-sans text-xl text-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mr-3"></div>
        Memuat berita...
      </div>
    );
  }

  if (error || !berita) {
    return (
      <div className="text-center p-6 text-red-700 bg-red-50 rounded-lg border border-red-200 mx-auto max-w-lg font-sans mt-20">
        <p className="font-semibold text-lg mb-2">Error!</p>
        <p className="text-base">{error || "Berita tidak ditemukan."}</p>
        <Link 
          to="/berita" 
          className="mt-4 inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Semua Berita
        </Link>
      </div>
    );
  }

  const {
    title,
    excerpt,
    content,
    image,
    category,
    author,
    date,
    views,
    featured,
  } = berita;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tombol Kembali */}
        <Link 
          to="/berita" 
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-8 
                     px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 shadow-sm w-fit"
          data-aos="fade-right"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Kembali ke Semua Berita
        </Link>

        {/* Berita Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 lg:p-12">
          <div className="mb-8" data-aos="fade-up">
            <img 
              src={image || 'https://placehold.co/1200x600/aabbcc/ffffff?text=No+Image'} 
              alt={title} 
              className="w-full h-96 object-cover rounded-lg mb-6"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/1200x600/aabbcc/ffffff?text=Error'; }}
            />
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">{title}</h1>
            
            <div className="flex flex-wrap items-center space-x-4 text-gray-600 text-sm mb-6">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(date)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>Oleh: {author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{views || 0}x dilihat</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                <Tag className="inline w-3 h-3 mr-1"/> {category}
              </span>
              {featured && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  Featured
                </span>
              )}
            </div>

            <p className="text-xl italic text-gray-700 mb-6 border-l-4 border-blue-400 pl-4">
              "{excerpt}"
            </p>

            <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
              <p dangerouslySetInnerHTML={{ __html: content }}></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeritaDetail;