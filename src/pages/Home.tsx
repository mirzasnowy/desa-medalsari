import React, { useEffect } from 'react';
import { ArrowRight, Users, Building, TreePine, Camera, Star, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import AOS from 'aos';

const Home = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  const stats = [
    { icon: Users, label: 'Jumlah Penduduk', value: '2,547', color: 'bg-blue-500' },
    { icon: Building, label: 'Kepala Keluarga', value: '724', color: 'bg-emerald-500' },
    { icon: TreePine, label: 'Tempat Wisata', value: '8', color: 'bg-purple-500' },
    { icon: Building, label: 'UMKM Aktif', value: '156', color: 'bg-orange-500' },
  ];

  const testimonials = [
    {
      name: 'Sari Wulandari',
      role: 'Pengunjung Wisata',
      rating: 5,
      comment: 'Desa Medalsari sangat indah dan asri. Pemandangan alamnya memukau dan warganya ramah!',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
    {
      name: 'Budi Santoso',
      role: 'Investor UMKM',
      rating: 5,
      comment: 'Potensi UMKM di desa ini luar biasa. Produk kerajinan lokalnya sangat berkualitas.',
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
    {
      name: 'Maya Indah',
      role: 'Fotografer',
      rating: 5,
      comment: 'Tempat yang sempurna untuk fotografi alam. Setiap sudut desa ini instagramable!',
      image: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
  ];

  const quickAccess = [
    { title: 'Wisata Alam', icon: TreePine, path: '/wisata', color: 'from-green-500 to-emerald-600' },
    { title: 'UMKM Lokal', icon: Building, path: '/umkm', color: 'from-blue-500 to-cyan-600' },
    { title: 'Kearifan Lokal', icon: Star, path: '/kearifan', color: 'from-purple-500 to-pink-600' },
    { title: 'Galeri Foto', icon: Camera, path: '/galeri', color: 'from-orange-500 to-red-600' },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1')`,
          }}
        ></div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4" data-aos="fade-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Selamat Datang di<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Desa Medalsari
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Desa yang indah, maju, dan sejahtera. Mewujudkan kehidupan yang harmonis antara alam dan masyarakat.
          </p>
          <div className="space-x-4">
            <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-full font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2">
              <span>Jelajahi Keindahan Desa</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link 
              to="/kontak"
              className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-all duration-300 inline-flex items-center space-x-2"
            >
              <span>Hubungi Kami</span>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index}
                  className="text-center group"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className={`w-16 h-16 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Jelajahi Desa Medalsari</h2>
            <p className="text-xl text-gray-600">Temukan keindahan dan potensi yang ada di desa kami</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {quickAccess.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  to={item.path}
                  className="group block"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className={`h-32 bg-gradient-to-r ${item.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                      <Icon className="w-16 h-16 text-white" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                      <p className="text-gray-600 group-hover:text-gray-800 transition-colors">
                        Klik untuk menjelajahi lebih lanjut
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Apa Kata Mereka</h2>
            <p className="text-xl text-gray-600">Testimoni dari para pengunjung dan mitra desa</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-aos="fade-up">
            <h2 className="text-4xl font-bold text-white mb-4">Bergabunglah dengan Kami</h2>
            <p className="text-xl text-emerald-100 mb-8">
              Mari bersama-sama membangun desa yang lebih maju dan sejahtera
            </p>
            <div className="space-x-4">
              <Link 
                to="/kontak"
                className="bg-white text-emerald-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 inline-flex items-center space-x-2"
              >
                <span>Hubungi Kami</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/wisata"
                className="bg-emerald-700 text-white px-8 py-4 rounded-full font-semibold hover:bg-emerald-800 transition-all duration-300 inline-flex items-center space-x-2"
              >
                <MapPin className="w-5 h-5" />
                <span>Kunjungi Wisata</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;