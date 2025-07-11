import React, { useEffect, useState } from 'react';
import { Calendar, User, Eye, Tag, Search, Filter } from 'lucide-react';
import AOS from 'aos';

const Berita = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  const categories = [
    { id: 'all', name: 'Semua', count: 12 },
    { id: 'pengumuman', name: 'Pengumuman', count: 4 },
    { id: 'kegiatan', name: 'Kegiatan', count: 5 },
    { id: 'pembangunan', name: 'Pembangunan', count: 2 },
    { id: 'sosial', name: 'Sosial', count: 1 },
  ];

  const news = [
    {
      id: 1,
      title: 'Peluncuran Program Digitalisasi Desa Medalsari',
      excerpt: 'Program digitalisasi desa dimulai dengan pelatihan aparatur desa dan pengembangan sistem informasi terintegrasi.',
      content: 'Desa Medalsari meluncurkan program digitalisasi...',
      image: 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'pengumuman',
      author: 'Admin Desa',
      date: '2024-01-15',
      views: 245,
      featured: true,
    },
    {
      id: 2,
      title: 'Festival Panen Raya 2024',
      excerpt: 'Festival panen raya akan diselenggarakan pada tanggal 20-22 Januari 2024 di lapangan desa.',
      content: 'Festival panen raya merupakan acara tahunan...',
      image: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'kegiatan',
      author: 'Panitia Festival',
      date: '2024-01-10',
      views: 198,
      featured: false,
    },
    {
      id: 3,
      title: 'Pembangunan Jalan Lingkar Desa Dimulai',
      excerpt: 'Proyek pembangunan jalan lingkar desa dengan total panjang 5 km telah dimulai dan ditargetkan selesai dalam 6 bulan.',
      content: 'Pembangunan jalan lingkar desa merupakan...',
      image: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'pembangunan',
      author: 'Kaur Pembangunan',
      date: '2024-01-08',
      views: 167,
      featured: true,
    },
    {
      id: 4,
      title: 'Pelatihan UMKM Digital Marketing',
      excerpt: 'Pelatihan digital marketing untuk pelaku UMKM desa akan dilaksanakan setiap hari Sabtu di bulan Januari.',
      content: 'Pelatihan digital marketing bertujuan...',
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'kegiatan',
      author: 'Dinas Koperasi',
      date: '2024-01-05',
      views: 134,
      featured: false,
    },
    {
      id: 5,
      title: 'Bantuan Sosial untuk Keluarga Kurang Mampu',
      excerpt: 'Pemerintah desa menyalurkan bantuan sosial berupa sembako dan uang tunai untuk 150 keluarga kurang mampu.',
      content: 'Program bantuan sosial merupakan...',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'sosial',
      author: 'Kaur Kesejahteraan',
      date: '2024-01-03',
      views: 189,
      featured: false,
    },
    {
      id: 6,
      title: 'Pembukaan Wisata Baru Air Terjun Medalsari',
      excerpt: 'Destinasi wisata baru air terjun Medalsari resmi dibuka untuk umum dengan fasilitas yang lengkap.',
      content: 'Air terjun Medalsari merupakan...',
      image: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'pengumuman',
      author: 'Pokdarwis',
      date: '2024-01-01',
      views: 298,
      featured: true,
    },
  ];

  const filteredNews = news.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredNews = news.filter(item => item.featured);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      pengumuman: 'bg-blue-100 text-blue-800',
      kegiatan: 'bg-green-100 text-green-800',
      pembangunan: 'bg-purple-100 text-purple-800',
      sosial: 'bg-orange-100 text-orange-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Berita & Pengumuman</h1>
            <p className="text-xl text-blue-100">Informasi terkini dari Desa Medalsari</p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured News */}
      {selectedCategory === 'all' && searchQuery === '' && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12" data-aos="fade-up">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Berita Utama</h2>
              <p className="text-xl text-gray-600">Berita terpenting dan terkini</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {featuredNews.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  data-aos="fade-up"
                  data-aos-delay={index * 200}
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(item.category)}`}>
                        {categories.find(c => c.id === item.category)?.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{item.excerpt}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{item.author}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{item.views}</span>
                      </div>
                    </div>
                    
                    <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      Baca Selengkapnya
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All News */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {selectedCategory === 'all' ? 'Semua Berita' : `Berita ${categories.find(c => c.id === selectedCategory)?.name}`}
            </h2>
            <p className="text-xl text-gray-600">
              {filteredNews.length} berita ditemukan
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {filteredNews.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-2/3 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(item.category)}`}>
                        {categories.find(c => c.id === item.category)?.name}
                      </span>
                      {item.featured && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{item.excerpt}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{item.author}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{item.views}</span>
                      </div>
                    </div>
                    
                    <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      Baca Selengkapnya
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Berita;