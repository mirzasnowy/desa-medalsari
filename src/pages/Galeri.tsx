import React, { useEffect, useState } from 'react';
import { Camera, Heart, Eye, X } from 'lucide-react';
import AOS from 'aos';

const Galeri = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<any>(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  const categories = [
    { id: 'all', name: 'Semua', count: 24 },
    { id: 'alam', name: 'Alam', count: 8 },
    { id: 'budaya', name: 'Budaya', count: 6 },
    { id: 'kegiatan', name: 'Kegiatan', count: 7 },
    { id: 'fasilitas', name: 'Fasilitas', count: 3 },
  ];

  const photos = [
    {
      id: 1,
      src: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Air Terjun Medalsari',
      category: 'alam',
      likes: 245,
      views: 1200,
      photographer: 'Desa Medalsari',
    },
    {
      id: 2,
      src: 'https://images.pexels.com/photos/1652229/pexels-photo-1652229.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Kebun Teh Panorama',
      category: 'alam',
      likes: 189,
      views: 980,
      photographer: 'Desa Medalsari',
    },
    {
      id: 3,
      src: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Rumah Adat Tradisional',
      category: 'budaya',
      likes: 156,
      views: 750,
      photographer: 'Tim Dokumentasi',
    },
    {
      id: 4,
      src: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Danau Cermin',
      category: 'alam',
      likes: 203,
      views: 1100,
      photographer: 'Desa Medalsari',
    },
    {
      id: 5,
      src: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Sunrise di Bukit Medalsari',
      category: 'alam',
      likes: 312,
      views: 1500,
      photographer: 'Fotografer Lokal',
    },
    {
      id: 6,
      src: 'https://images.pexels.com/photos/1578662/pexels-photo-1578662.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Hutan Pinus Asri',
      category: 'alam',
      likes: 178,
      views: 890,
      photographer: 'Desa Medalsari',
    },
    {
      id: 7,
      src: 'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Sawah Terasering',
      category: 'alam',
      likes: 234,
      views: 1200,
      photographer: 'Tim Dokumentasi',
    },
    {
      id: 8,
      src: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Tarian Tradisional',
      category: 'budaya',
      likes: 167,
      views: 820,
      photographer: 'Event Organizer',
    },
    {
      id: 9,
      src: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Kerajinan Anyaman',
      category: 'budaya',
      likes: 145,
      views: 680,
      photographer: 'UMKM Lokal',
    },
    {
      id: 10,
      src: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Festival Panen',
      category: 'kegiatan',
      likes: 289,
      views: 1400,
      photographer: 'Desa Medalsari',
    },
    {
      id: 11,
      src: 'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Gotong Royong Masyarakat',
      category: 'kegiatan',
      likes: 198,
      views: 950,
      photographer: 'Warga Desa',
    },
    {
      id: 12,
      src: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Balai Desa',
      category: 'fasilitas',
      likes: 112,
      views: 560,
      photographer: 'Aparatur Desa',
    },
  ];

  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter(photo => photo.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Galeri Foto</h1>
            <p className="text-xl text-purple-100">Potret kehidupan dan keindahan Desa Medalsari</p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-2 bg-white rounded-xl p-2 shadow-lg">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                data-aos="fade-up"
                data-aos-delay={index * 100}
                onClick={() => setSelectedImage(photo)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-semibold mb-1">{photo.title}</h3>
                    <p className="text-sm text-gray-300">{photo.photographer}</p>
                  </div>
                </div>
                
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-5 h-5 text-gray-700" />
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{photo.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>{photo.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span>{photo.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            
            <img
              src={selectedImage.src}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain"
            />
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
              <p className="text-gray-300 mb-4">Foto oleh: {selectedImage.photographer}</p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>{selectedImage.likes} likes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  <span>{selectedImage.views} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-500 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-aos="fade-up">
            <h2 className="text-3xl font-bold text-white mb-4">Bagikan Foto Anda</h2>
            <p className="text-xl text-purple-100 mb-8">
              Punya foto menarik tentang Desa Medalsari? Bagikan dengan kami!
            </p>
            <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Upload Foto</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Galeri;