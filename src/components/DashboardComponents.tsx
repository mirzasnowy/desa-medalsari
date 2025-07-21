// DashboardOverview.tsx
import React from 'react';
import { Users, FileText, Store, User, MapPin, Book, Image } from 'lucide-react'; 

// Definisi tipe untuk data (harus sesuai dengan AdminDashboard.tsx)
interface StatistikPendudukData {
    totalPenduduk: number;
    kepalaKeluarga: number;
    anakAnak: number;
    dewasa: number;
    distribusiJenisKelamin: { lakiLaki: number; perempuan: number; };
    distribusiUsia: { '0-14': number; '15-64': number; '65+': number; };
    tingkatPendidikan: { tidakSekolah: number; sd: number; smp: number; sma: number; sarjana: number; lainnya: number; };
    mataPencarian: { petani: number; pedagang: number; pns: number; karyawanSwasta: number; wiraswasta: number; lainnya: number; };
}

interface AparaturDesaItem {
    id?: string;
    nama: string;
    jabatan: string;
    nip: string;
    foto: string;
}

interface BeritaItem {
    id?: string;
    title: string;
    excerpt: string; // Tambahkan ini jika ada di Firestore
    content: string; // Tambahkan ini jika ada di Firestore
    image: string; // Tambahkan ini jika ada di Firestore
    category: string;
    author: string; // Tambahkan ini jika ada di Firestore
    date: string;
    featured: boolean; // Tambahkan ini jika ada di Firestore
    status: 'Published' | 'Draft';
}

interface UMKMItem {
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
}

interface WisataItem {
    id?: string;
    name: string;
    description: string;
    image: string;
    rating: number;
    price: string;
    hours: string;
    facilities: string[];
    contact: string;
}

interface KearifanLokalItem {
    id?: string;
    name: string;
    description: string;
    image: string;
    category: string;
    philosophy: string;
    practices: string[];
    benefits: string[];
    iconName: string;
    colorClass: string;
    status: 'Aktif' | 'Perlu Revitalisasi';
}

interface GaleriItem {
    id?: string;
    title: string;
    category: string;
    date: string;
    image: string;
    photographer: string;
}


// Definisi tipe untuk dashboardData yang diterima sebagai props
interface DashboardDataType {
    dataPenduduk: StatistikPendudukData | null; // Ini adalah dokumen tunggal
    aparaturDesa: AparaturDesaItem[];
    berita: BeritaItem[];
    wisata: WisataItem[];
    umkm: UMKMItem[];
    kearifanLokal: KearifanLokalItem[];
    galeri: GaleriItem[];
}

interface DashboardOverviewProps {
    dashboardData: DashboardDataType;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ dashboardData }) => {
  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Total Penduduk */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Penduduk</p>
              {/* Akses totalPenduduk langsung dari objek, bukan length dari array */}
              <p className="text-3xl font-bold text-blue-600">
                {dashboardData.dataPenduduk?.totalPenduduk?.toLocaleString() || '0'} {/* Default to 0 */}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        {/* Card Aparatur Desa */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Perangkat Desa</p>
              <p className="text-3xl font-bold text-green-600">{dashboardData.aparaturDesa.length}</p>
            </div>
            <User className="w-12 h-12 text-green-500" />
          </div>
        </div>
        {/* Card Berita */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Berita</p>
              <p className="text-3xl font-bold text-purple-600">{dashboardData.berita.length}</p>
            </div>
            <FileText className="w-12 h-12 text-purple-500" />
          </div>
        </div>
        {/* Card UMKM */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">UMKM</p>
              <p className="text-3xl font-bold text-orange-600">{dashboardData.umkm.length}</p>
            </div>
            <Store className="w-12 h-12 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card Wisata */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tempat Wisata</p>
              <p className="text-3xl font-bold text-red-600">{dashboardData.wisata.length}</p>
            </div>
            <MapPin className="w-12 h-12 text-red-500" />
          </div>
        </div>
        {/* Card Kearifan Lokal */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kearifan Lokal</p>
              <p className="text-3xl font-bold text-teal-600">{dashboardData.kearifanLokal.length}</p>
            </div>
            <Book className="w-12 h-12 text-teal-500" />
          </div>
        </div>
        {/* Card Galeri */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Galeri Foto</p>
              <p className="text-3xl font-bold text-indigo-600">{dashboardData.galeri.length}</p>
            </div>
            <Image className="w-12 h-12 text-indigo-500" />
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Berita Terbaru Section */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Berita Terbaru</h3>
          <div className="space-y-3">
            {dashboardData.berita.length > 0 ? (
              dashboardData.berita.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">Tidak ada berita terbaru.</p>
            )}
          </div>
        </div>

        {/* UMKM Terdaftar Section */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">UMKM Terdaftar</h3>
          <div className="space-y-3">
            {dashboardData.umkm.length > 0 ? (
              dashboardData.umkm.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Store className="w-8 h-8 text-orange-500" />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    {/* PERBAIKAN: Gunakan optional chaining dan fallback string kosong */}
                    <p className="text-sm text-gray-500">{item.description?.substring(0, 50) || ''}...</p> 
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{item.price}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">Tidak ada UMKM terdaftar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;