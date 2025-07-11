import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import VisiMisi from './pages/VisiMisi';
import DataPenduduk from './pages/DataPenduduk';
import Aparatur from './pages/Aparatur';
import Berita from './pages/Berita';
import Wisata from './pages/Wisata';
import Galeri from './pages/Galeri';
import Kontak from './pages/Kontak';
import 'aos/dist/aos.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/visi-misi" element={<VisiMisi />} />
            <Route path="/data-penduduk" element={<DataPenduduk />} />
            <Route path="/aparatur" element={<Aparatur />} />
            <Route path="/berita" element={<Berita />} />
            <Route path="/wisata" element={<Wisata />} />
            <Route path="/galeri" element={<Galeri />} />
            <Route path="/kontak" element={<Kontak />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;