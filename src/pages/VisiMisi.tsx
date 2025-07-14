import React, { useEffect } from 'react';
import { Target, CheckCircle, Lightbulb, Heart, Users, TreePine, Leaf,Handshake, GraduationCap, Building } from 'lucide-react';
import AOS from 'aos';

const VisiMisi = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

const missions = [
  {
    icon: Handshake, // Kebijakan yang berpihak kepada kepentingan masyarakat
    title: 'Kebijakan Pro-Rakyat',
    description: 'Menciptakan kebijakan pemerintah desa yang berpihak kepada kepentingan masyarakat.',
    color: 'bg-blue-500', // Warna biru untuk kebijakan
  },
  {
    icon: Leaf, // Pembangunan pertanian dan perekonomian (sektor unggulan)
    title: 'Pengembangan Sektor Unggulan',
    description: 'Mendukung segala upaya terhadap pembangunan di bidang pertanian dan perekonomian sebagai sektor unggulan Desa.',
    color: 'bg-emerald-500', // Warna hijau untuk pertanian/ekonomi
  },
  {
    icon: GraduationCap, // Kualitas pendidikan dan kesehatan
    title: 'Peningkatan Pendidikan & Kesehatan',
    description: 'Meningkatkan kualitas pendidikan dan kesehatan yang merata dan terjangkau bagi masyarakat.',
    color: 'bg-orange-500', // Warna oranye untuk pendidikan/kesehatan
  },
  {
    icon: Building, // Pembangunan sarana dasar
    title: 'Pembangunan Infrastruktur Dasar',
    description: 'Meningkatkan pembangunan sarana dasar yang mendukung terhadap kehidupan masyarakat.',
    color: 'bg-red-500', // Warna merah untuk pembangunan/infrastruktur
  },
];

  const values = [
    { title: 'Gotong Royong', description: 'Semangat kebersamaan dalam membangun desa' },
    { title: 'Transparansi', description: 'Keterbukaan dalam pengelolaan pemerintahan desa' },
    { title: 'Inovasi', description: 'Kreativitas dalam mengembangkan potensi desa' },
    { title: 'Keberlanjutan', description: 'Pembangunan yang memperhatikan generasi mendatang' },
    { title: 'Pelayanan Prima', description: 'Memberikan pelayanan terbaik kepada masyarakat' },
    { title: 'Kearifan Lokal', description: 'Melestarikan budaya dan tradisi setempat' },
  ];

  const roadmap = [
    {
      year: '2024',
      title: 'Infrastruktur Dasar',
      items: ['Perbaikan jalan desa', 'Pembangunan sistem drainase', 'Peningkatan fasilitas umum'],
    },
    {
      year: '2025',
      title: 'Pemberdayaan Ekonomi',
      items: ['Pengembangan UMKM', 'Pelatihan keterampilan', 'Pembangunan pasar desa'],
    },
    {
      year: '2026',
      title: 'Digitalisasi',
      items: ['E-governance', 'Sistem informasi desa', 'Pemasaran digital UMKM'],
    },
    {
      year: '2027',
      title: 'Pariwisata Berkelanjutan',
      items: ['Pengembangan destinasi wisata', 'Pelatihan pemandu wisata', 'Promosi wisata digital'],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Visi & Misi</h1>
            <p className="text-xl text-indigo-100">Desa Medalsari</p>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Visi Desa Medalsari</h2>
            <div className="max-w-4xl mx-auto">
              <blockquote className="text-2xl md:text-3xl font-light text-gray-700 italic leading-relaxed">
                "Membangun Masyarakat Desa Medalsari yang Adil dan Religius"
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Misi Desa Medalsari</h2>
            <p className="text-xl text-gray-600">Langkah-langkah strategis untuk mewujudkan visi desa</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {missions.map((mission, index) => {
              const Icon = mission.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className={`w-16 h-16 ${mission.color} rounded-full flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{mission.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{mission.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Nilai-Nilai Desa</h2>
            <p className="text-xl text-gray-600">Prinsip-prinsip yang menjadi landasan pembangunan desa</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="text-center group"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Roadmap Pembangunan</h2>
            <p className="text-xl text-gray-600">Rencana strategis pembangunan desa 2024-2027</p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
            
            <div className="space-y-12">
              {roadmap.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  data-aos="fade-up"
                  data-aos-delay={index * 200}
                >
                  <div className="w-1/2 px-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {item.year}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 ml-4">{item.title}</h3>
                      </div>
                      <ul className="space-y-2">
                        {item.items.map((subItem, subIndex) => (
                          <li key={subIndex} className="flex items-start space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{subItem}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="w-6 h-6 bg-white border-4 border-indigo-500 rounded-full flex-shrink-0 z-10"></div>
                  
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-aos="fade-up">
            <h2 className="text-3xl font-bold text-white mb-4">Mari Wujudkan Bersama</h2>
            <p className="text-xl text-indigo-100 mb-8">
               Desa Medalsari yang lebih maju dan sejahtera
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VisiMisi;