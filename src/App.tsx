// src/App.tsx
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'; // Keep useLocation
// Remove the Router import: import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import VisiMisi from './pages/VisiMisi';
import DataPenduduk from './pages/DataPenduduk';
import PerangkatDesa from './pages/Aparatur';
import Berita from './pages/Berita';
import Wisata from './pages/Wisata';
import Galeri from './pages/Galeri';
import Kontak from './pages/Kontak';
import UMKM from './pages/Umkm';
import 'aos/dist/aos.css';
import KearifanLokal from './pages/KearifanLokal';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Chatbot from './components/Chatbot';
import UMKMDetail from './components/UmkmDetail';
import WisataDetail from './pages/WisataDetail';
import BeritaDetail from './pages/BeritaDetail';
function App() {
  const location = useLocation(); // Now this hook is called within the Router's context
  const isAdminRoute = location.pathname.startsWith('/admin'); 

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Render Navbar hanya jika BUKAN rute admin */}
      {!isAdminRoute && <Navbar />} 
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/visi-misi" element={<VisiMisi />} />
          <Route path="/data-penduduk" element={<DataPenduduk />} />
          <Route path="/perangkat-desa" element={<PerangkatDesa />} />
          <Route path="/berita" element={<Berita />} />
          <Route path="/umkm" element={<UMKM />} />
          <Route path="/wisata" element={<Wisata />} />
          <Route path="/kearifan" element={<KearifanLokal />} />
          <Route path="/galeri" element={<Galeri />} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/umkm/:id" element={<UMKMDetail />} />
          <Route path="/wisata/:id" element={<WisataDetail />} />
          <Route path="/berita/:id" element={<BeritaDetail />} />
          {/* Rute Admin, tidak akan menampilkan Navbar dan Footer dari layout utama */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      
      {/* Render Footer hanya jika BUKAN rute admin */}
      {!isAdminRoute && <Footer />} 
      
      {/* Render Chatbot hanya jika BUKAN rute admin */}
      {!isAdminRoute && <Chatbot />}
    </div>
  );
}

export default App;