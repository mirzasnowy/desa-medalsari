// components/Header.tsx
import React from 'react';
import { Bell, User, Menu, X, LucideIcon, Mail, Search } from 'lucide-react'; // Import Mail and Search if needed elsewhere

// Definisi tipe untuk item menu
interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

// Definisi tipe untuk props komponen
interface HeaderProps {
  activeTab: string;
  menuItems: MenuItem[];
  setSidebarOpen: (isOpen: boolean) => void;
  sidebarOpen: boolean;
  setSearchQuery: (query: string) => void; // Prop ini sudah ada sebelumnya, pastikan tetap ada jika digunakan
  newMessagesCount: number; // <-- PROPERTI BARU: Jumlah pesan belum dibaca
  onShowMessages: () => void; // <-- PROPERTI BARU: Fungsi untuk menampilkan modal pesan
}

const Header: React.FC<HeaderProps> = ({ activeTab, menuItems, setSidebarOpen, sidebarOpen, setSearchQuery, newMessagesCount, onShowMessages }) => {
  // Logic to determine the current tab label
  const currentTabLabel = menuItems.find(item => item.id === activeTab)?.label || 'Dashboard';

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Mobile menu toggle for larger screens */}
        <div className="lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Current Tab Title */}
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {currentTabLabel}
          </h2>
        </div>

        {/* Right Section: Notifications & Admin Info */}
        <div className="flex items-center space-x-4">
          {/* Search bar (contoh, jika ingin ada di header) */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari..."
              onChange={(e) => setSearchQuery(e.target.value)} // Gunakan setSearchQuery jika ada
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tombol Notifikasi Pesan Baru */}
          <button
            onClick={onShowMessages} // Panggil fungsi untuk menampilkan pesan
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            title="Pesan Masuk"
          >
            <Mail className="w-6 h-6" /> {/* Menggunakan ikon Mail */}
            {newMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {newMessagesCount} {/* Menampilkan jumlah pesan belum dibaca */}
              </span>
            )}
          </button>

          {/* Tombol Notifikasi Umum (opsional, jika masih ada notifikasi selain pesan) */}
          {/* Anda bisa biarkan ini atau hapus jika semua notifikasi sudah tercover oleh pesan */}
          {/* <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button> */}

          {/* Admin Avatar/Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              <img
                src="https://picsum.photos/id/1005/40/40" // Ganti dengan avatar admin
                alt="Admin"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;