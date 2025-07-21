import React from 'react';
import { TreePine, MapPin, Phone, Mail, Instagram, Youtube } from 'lucide-react'; // Hapus Facebook dan TikTok dari import
import pemdesLogo from '../assets/pemdes.png';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white shadow">
                <img
                  src={pemdesLogo}
                  alt="Logo Desa Medalsari"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <span className="text-xl font-bold">Desa Medalsari</span>
            </div>
            <p className="text-gray-400">
              Desa yang indah, maju, dan sejahtera. Mewujudkan kehidupan yang harmonis antara alam dan masyarakat.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Kontak Kami</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-400">Kp. Tegal Simeut 41362, Medalsari, Kec. Pangkalan, Karawang, Jawa Barat 41362</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-400">+62 857-7717-7009</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-400">medalsari.pemdes.karawangkab<br/>@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tautan Cepat</h3>
            <div className="space-y-2">
              <a href="/visi-misi" className="block text-gray-400 hover:text-emerald-400 transition-colors">Visi & Misi</a>
              <a href="/data-penduduk" className="block text-gray-400 hover:text-emerald-400 transition-colors">Data Penduduk</a>
              <a href="/aparatur" className="block text-gray-400 hover:text-emerald-400 transition-colors">Aparatur Desa</a>
              <a href="/wisata" className="block text-gray-400 hover:text-emerald-400 transition-colors">Wisata</a>
              <a href="/umkm" className="block text-gray-400 hover:text-emerald-400 transition-colors">UMKM</a>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ikuti Kami</h3>
            <div className="flex space-x-4">
              {/* Tombol TikTok (menggunakan gambar dari URL) */}
              <a
                href="https://www.tiktok.com/@kkndesamedalsari2025?_t=ZS-8yDlUlxoD6f&_r=1" // Ganti dengan link TikTok Anda
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-black rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <img
                  src="https://logodownload.org/wp-content/uploads/2019/08/tiktok-logo-icon.png" // URL ikon TikTok
                  alt="TikTok"
                  className="w-5 h-5"
                />
              </a>
              {/* Tombol Instagram */}
              <a
                href="https://www.instagram.com/kknmedalsari2025?igsh=MXA5d2JwYjFoaGV0aQ%3D%3D&utm_source=qr" // Ganti dengan link Instagram Anda
                className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center hover:bg-pink-700 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              {/* Tombol Youtube */}
              <a
                href="https://youtube.com/@kknmedalsari2025?si=IPl5CpmIjTAN9tkv" // Ganti dengan link Youtube Anda
                className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy;KKN 2025 Desa Medalsari. Semua hak dilindungi undang-undang.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;