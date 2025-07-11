import React, { useEffect } from 'react';
import { Phone, Mail, MapPin, Award } from 'lucide-react';
import AOS from 'aos';

const Aparatur = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  const officials = [
    {
      name: 'Budi Santoso, S.AP',
      position: 'Kepala Desa',
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
      phone: '+62 812 3456 7890',
      email: 'kades@medalsari.desa.id',
      description: 'Memimpin pemerintahan desa dengan visi mewujudkan desa yang maju dan sejahtera',
      experience: '8 tahun',
      education: 'S1 Administrasi Publik',
    },
    {
      name: 'Siti Rahayu, S.E',
      position: 'Sekretaris Desa',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      phone: '+62 812 3456 7891',
      email: 'sekdes@medalsari.desa.id',
      description: 'Mengelola administrasi dan dokumentasi seluruh kegiatan pemerintahan desa',
      experience: '6 tahun',
      education: 'S1 Ekonomi',
    },
    {
      name: 'Ahmad Fauzi, S.T',
      position: 'Kaur Pembangunan',
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
      phone: '+62 812 3456 7892',
      email: 'pembangunan@medalsari.desa.id',
      description: 'Mengkoordinir pembangunan infrastruktur dan fasilitas umum desa',
      experience: '5 tahun',
      education: 'S1 Teknik Sipil',
    },
    {
      name: 'Dewi Lestari, S.Sos',
      position: 'Kaur Kesejahteraan',
      image: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400',
      phone: '+62 812 3456 7893',
      email: 'kesejahteraan@medalsari.desa.id',
      description: 'Mengelola program-program kesejahteraan dan pemberdayaan masyarakat',
      experience: '4 tahun',
      education: 'S1 Ilmu Sosial',
    },
    {
      name: 'Rudi Hermawan, S.IP',
      position: 'Kaur Pemerintahan',
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
      phone: '+62 812 3456 7894',
      email: 'pemerintahan@medalsari.desa.id',
      description: 'Mengurus administrasi kependudukan dan tata kelola pemerintahan',
      experience: '7 tahun',
      education: 'S1 Ilmu Pemerintahan',
    },
    {
      name: 'Maya Sari, S.E',
      position: 'Bendahara Desa',
      image: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400',
      phone: '+62 812 3456 7895',
      email: 'bendahara@medalsari.desa.id',
      description: 'Mengelola keuangan desa dan pertanggungjawaban anggaran',
      experience: '5 tahun',
      education: 'S1 Ekonomi',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-slate-600 to-gray-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Aparatur Desa</h1>
            <p className="text-xl text-slate-200">Struktur pemerintahan Desa Medalsari</p>
          </div>
        </div>
      </section>

      {/* Officials Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {officials.map((official, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="p-6">
                  <div className="relative mb-6">
                    <img
                      src={official.image}
                      alt={official.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-200"
                    />
                    <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {official.position}
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{official.name}</h3>
                    <p className="text-gray-600 mb-4">{official.description}</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Award className="w-4 h-4 text-blue-500" />
                      <span>Pengalaman: {official.experience}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span>{official.education}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <a
                      href={`tel:${official.phone}`}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Telepon</span>
                    </a>
                    <a
                      href={`mailto:${official.email}`}
                      className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organizational Chart */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Struktur Organisasi</h2>
            <p className="text-xl text-gray-600">Bagan organisasi pemerintahan Desa Medalsari</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {/* Kepala Desa */}
            <div className="text-center mb-8" data-aos="fade-up">
              <div className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold">
                Kepala Desa
              </div>
            </div>
            
            {/* Vertical Line */}
            <div className="flex justify-center mb-8">
              <div className="w-1 h-12 bg-gray-300"></div>
            </div>
            
            {/* Sekretaris Desa */}
            <div className="text-center mb-8" data-aos="fade-up" data-aos-delay="200">
              <div className="inline-block bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold">
                Sekretaris Desa
              </div>
            </div>
            
            {/* Horizontal Line */}
            <div className="flex justify-center mb-8">
              <div className="w-1 h-12 bg-gray-300"></div>
            </div>
            
            {/* Kepala Urusan */}
            <div className="grid md:grid-cols-4 gap-4">
              {['Kaur Pembangunan', 'Kaur Kesejahteraan', 'Kaur Pemerintahan', 'Bendahara Desa'].map((position, index) => (
                <div
                  key={index}
                  className="text-center"
                  data-aos="fade-up"
                  data-aos-delay={300 + index * 100}
                >
                  <div className="bg-purple-500 text-white px-4 py-3 rounded-lg font-semibold text-sm">
                    {position}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Jam Pelayanan</h2>
            <p className="text-xl text-gray-600">Jadwal pelayanan kantor desa</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center" data-aos="fade-up">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Hari Kerja</h3>
              <p className="text-gray-600">Senin - Jumat<br />08:00 - 16:00 WIB</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center" data-aos="fade-up" data-aos-delay="200">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Sabtu</h3>
              <p className="text-gray-600">Sabtu<br />08:00 - 12:00 WIB</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center" data-aos="fade-up" data-aos-delay="400">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Minggu</h3>
              <p className="text-gray-600">Minggu<br />Tutup</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Aparatur;