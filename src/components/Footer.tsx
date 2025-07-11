import React from 'react';
import { TreePine, MapPin, Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <TreePine className="w-6 h-6 text-white" />
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
                <span className="text-gray-400">Jl. Raya Medalsari No. 123, Kecamatan Medalsari</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-400">+62 21 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-400">info@medalsari.desa.id</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tautan Cepat</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-emerald-400 transition-colors">Visi & Misi</a>
              <a href="#" className="block text-gray-400 hover:text-emerald-400 transition-colors">Data Penduduk</a>
              <a href="#" className="block text-gray-400 hover:text-emerald-400 transition-colors">Aparatur Desa</a>
              <a href="#" className="block text-gray-400 hover:text-emerald-400 transition-colors">Wisata</a>
              <a href="#" className="block text-gray-400 hover:text-emerald-400 transition-colors">UMKM</a>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ikuti Kami</h3>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center hover:bg-pink-700 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Desa Medalsari. Semua hak dilindungi undang-undang.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;