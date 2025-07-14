// components/Header.tsx
import React from 'react';
import { Bell, User, Menu, X, LucideIcon } from 'lucide-react';

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
}

const Header: React.FC<HeaderProps> = ({ activeTab, menuItems, setSidebarOpen, sidebarOpen }) => {
  return (
    <div className="bg-white shadow-sm border-b">
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

        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab === 'dashboard' ? 'Dashboard' : menuItems.find(item => item.id === activeTab)?.label}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-900">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
