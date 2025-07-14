import React from 'react';
import { X, Menu, LogOut, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Definisi tipe untuk item menu
interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

// Definisi tipe untuk props komponen
interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  menuItems: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab, menuItems }) => {
  const navigate = useNavigate(); // Inisialisasi useNavigate

  const handleLogout = () => {
    // Di sini Anda bisa menambahkan logika logout Firebase (misal: signOut(auth))
    // Untuk saat ini, kita hanya akan mengarahkan ke halaman home.
    navigate('/'); // Arahkan ke root path, yang biasanya adalah halaman Home
    // Jika Anda punya route khusus untuk home, ganti menjadi navigate('/home');
    setSidebarOpen(false); // Tutup sidebar setelah logout (di mobile)
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white p-2 rounded-lg shadow-lg"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-center h-16 bg-gradient-to-r from-emerald-600 to-teal-700">
          <h1 className="text-white text-xl font-bold">Admin Panel</h1>
        </div>

        <nav className="mt-8">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false); // Close sidebar on mobile after selection
                }}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeTab === item.id ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button 
            onClick={handleLogout} // Panggil fungsi handleLogout saat diklik
            className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Keluar
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;