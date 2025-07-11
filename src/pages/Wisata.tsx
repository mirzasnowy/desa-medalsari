import React, { useEffect } from 'react';
import { MapPin, Clock, Star, Phone, ExternalLink } from 'lucide-react';
import AOS from 'aos';

const Wisata = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  const destinations = [
    {
      id: 1,
      name: 'Air Terjun Medalsari',
      description: 'Air terjun alami dengan ketinggian 45 meter, dikelilingi pepohonan hijau yang asri.',
      image: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.8,
      price: 'Rp 15.000',
      hours: '08:00 - 17:00',
      facilities: ['Parkir', 'Toilet', 'Warung', 'Gazebo'],
      contact: '+62 812 3456 7890'
    },
    {
      id: 2,
      name: 'Kebun Teh Panorama',
      description: 'Perkebunan teh dengan pemandangan pegunungan yang menakjubkan.',
      image: 'https://images.pexels.com/photos/1652229/pexels-photo-1652229.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.7,
      price: 'Rp 10.000',
      hours: '06:00 - 18:00',
      facilities: ['Parkir', 'Toilet', 'Cafeteria', 'Spot Foto'],
      contact: '+62 812 3456 7891'
    },
    {
      id: 3,
      name: 'Danau Cermin',
      description: 'Danau jernih dengan air yang tenang, perfect untuk aktivitas memancing.',
      image: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.6,
      price: 'Rp 8.000',
      hours: '07:00 - 17:00',
      facilities: ['Parkir', 'Toilet', 'Penyewaan Perahu', 'Area Piknik'],
      contact: '+62 812 3456 7892'
    },
    {
      id: 4,
      name: 'Bukit Sunrise',
      description: 'Spot terbaik untuk menikmati sunrise dengan pemandangan 360 derajat.',
      image: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.9,
      price: 'Rp 12.000',
      hours: '05:00 - 19:00',
      facilities: ['Parkir', 'Toilet', 'Warung', 'Camping Ground'],
      contact: '+62 812 3456 7893'
    },
    {
      id: 5,
      name: 'Hutan Pinus Asri',
      description: 'Hutan pinus yang sejuk dengan jalur trekking yang menantang.',
      image: 'https://images.pexels.com/photos/1578662/pexels-photo-1578662.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.5,
      price: 'Rp 20.000',
      hours: '08:00 - 16:00',
      facilities: ['Parkir', 'Toilet', 'Pemandu', 'Flying Fox'],
      contact: '+62 812 3456 7894'
    },
    {
      id: 6,
      name: 'Desa Wisata Adat',
      description: 'Pengalaman budaya autentik dengan rumah tradisional dan aktivitas lokal.',
      image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.8,
      price: 'Rp 25.000',
      hours: '09:00 - 16:00',
      facilities: ['Parkir', 'Toilet', 'Homestay', 'Workshop'],
      contact: '+62 812 3456 7895'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Wisata Desa Medalsari</h1>
            <p className="text-xl text-emerald-100">Jelajahi keindahan alam dan budaya yang menakjubkan</p>
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {destinations.map((destination, index) => (
              <div 
                key={destination.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{destination.rating}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{destination.name}</h3>
                  <p className="text-gray-600 mb-4">{destination.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      <span>{destination.hours}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span>Tiket: {destination.price}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Fasilitas:</p>
                    <div className="flex flex-wrap gap-2">
                      {destination.facilities.map((facility, idx) => (
                        <span key={idx} className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <a 
                      href={`https://wa.me/${destination.contact.replace(/\D/g, '')}`}
                      className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Hubungi</span>
                    </a>
                    <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>Detail</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-aos="fade-up">
            <h2 className="text-3xl font-bold text-white mb-4">Butuh Bantuan Perencanaan Wisata?</h2>
            <p className="text-xl text-emerald-100 mb-8">
              Tim kami siap membantu Anda merencanakan perjalanan wisata yang tak terlupakan
            </p>
            <div className="space-x-4">
              <a 
                href="https://wa.me/6281234567890"
                className="bg-white text-emerald-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
              >
                <Phone className="w-5 h-5" />
                <span>Hubungi Pemandu Wisata</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Wisata;