import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Home,
  Users, // Digunakan di Profil Desa -> Data Penduduk
  Building, // Digunakan di Profil Desa
  TreePine, // Digunakan di Visi & Misi dan Wisata
  Camera,
  Phone,
  Newspaper,
  ChevronDown,
  Star,
  MapPin,
  LogIn
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import pemdesLogo from '../assets/pemdes.png';
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const location = useLocation();

  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { type: 'link', path: '/', label: 'Beranda', icon: Home },
    {
      type: 'dropdown',
      label: 'Profil Desa',
      icon: Building,
      items: [
        { path: '/visi-misi', label: 'Visi & Misi', icon: TreePine },
        { path: '/aparatur', label: 'Aparatur Desa', icon: Users },
        { path: '/data-penduduk', label: 'Data Penduduk', icon: Users }, // DIPINDAHKAN DI SINI
      ],
    },
    // { type: 'link', path: '/data-penduduk', label: 'Data Penduduk', icon: Users }, // DIHAPUS DARI SINI
    { type: 'link', path: '/berita', label: 'Berita', icon: Newspaper },
    {
      type: 'dropdown',
      label: 'Layanan & Potensi',
      icon: MapPin,
      items: [
        { path: '/wisata', label: 'Wisata', icon: TreePine },
        { path: '/umkm', label: 'UMKM', icon: Building },
        { path: '/kearifan', label: 'Kearifan Lokal', icon: Star },
      ],
    },
    { type: 'link', path: '/galeri', label: 'Galeri', icon: Camera },
    { type: 'link', path: '/kontak', label: 'Kontak', icon: Phone },
  ];

  const isDropdownActive = (dropdownItems: { path: string }[]) => {
    return dropdownItems.some(item => location.pathname === item.path);
  };

  const handleMouseEnterDropdownArea = (label: string) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setDropdownOpen(label);
  };

  const handleMouseLeaveDropdownArea = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(null);
    }, 200);
  };

  const handleSubMenuItemClick = () => {
    setDropdownOpen(null);
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white shadow">
  <img
    src={pemdesLogo}
    alt="Pemdes"
    className="w-full h-full object-contain"
  />
</div>

              <span className="text-xl font-bold text-gray-800">Desa Medalsari</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 items-center justify-end">
            <div className="flex items-baseline space-x-4">
              {navItems.map((item, index) => {
                if (item.type === 'link') {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        location.pathname === item.path
                          ? 'bg-emerald-500 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-white/50 hover:text-emerald-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                } else if (item.type === 'dropdown') {
                  const DropdownIcon = item.icon;
                  const isActive = isDropdownActive(item.items);
                  return (
                    <div
                      key={index}
                      className="relative"
                      onMouseEnter={() => handleMouseEnterDropdownArea(item.label)}
                      onMouseLeave={handleMouseLeaveDropdownArea}
                    >
                      <button
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-emerald-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-white/50 hover:text-emerald-600'
                        }`}
                      >
                        <DropdownIcon className="w-4 h-4" />
                        <span>{item.label}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen === item.label ? 'rotate-180' : ''}`} />
                      </button>
                      {dropdownOpen === item.label && (
                        <div className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transition-opacity transition-transform duration-200 ${
                          dropdownOpen === item.label ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                        }`}>
                          <div className="py-1">
                            {item.items.map(subItem => {
                              const SubIcon = subItem.icon;
                              return (
                                <Link
                                  key={subItem.path}
                                  to={subItem.path}
                                  onClick={handleSubMenuItemClick}
                                  className={`flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                                    location.pathname === subItem.path ? 'bg-gray-100 text-emerald-600 font-semibold' : ''
                                  }`}
                                >
                                  <SubIcon className="w-4 h-4" />
                                  <span>{subItem.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
            {/* Tombol Login Admin untuk Desktop - Ditempatkan di luar flex items-baseline space-x-4 */}
            <Link
              to="/admin"
              className={`ml-6 flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                location.pathname === '/admin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Login Admin</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-emerald-600 hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item, index) => {
              if (item.type === 'link') {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                      location.pathname === item.path
                        ? 'bg-emerald-500 text-white'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              } else if (item.type === 'dropdown') {
                const DropdownIcon = item.icon;
                return (
                  <div key={index}>
                    <button
                      onClick={() => {
                        setDropdownOpen(dropdownOpen === item.label ? null : item.label);
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                        isDropdownActive(item.items)
                          ? 'bg-emerald-500 text-white'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <DropdownIcon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${dropdownOpen === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    {dropdownOpen === item.label && (
                      <div className="pl-6 pt-1 pb-1 space-y-1">
                        {item.items.map(subItem => {
                          const SubIcon = subItem.icon;
                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              onClick={() => {
                                setIsOpen(false); // Tutup mobile menu
                                setDropdownOpen(null); // Tutup dropdown
                              }}
                              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                location.pathname === subItem.path
                                  ? 'bg-gray-100 text-emerald-600 font-semibold'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                              }`}
                            >
                              <SubIcon className="w-4 h-4" />
                              <span>{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
            {/* Tombol Login Admin untuk Mobile */}
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={`mt-4 flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                location.pathname === '/admin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <LogIn className="w-5 h-5" />
              <span>Login Admin</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;