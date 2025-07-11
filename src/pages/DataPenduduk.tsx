import React, { useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Users, UserCheck, Baby, User } from 'lucide-react';
import AOS from 'aos';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const DataPenduduk = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  const genderData = {
    labels: ['Laki-laki', 'Perempuan'],
    datasets: [
      {
        data: [1298, 1249],
        backgroundColor: ['#3B82F6', '#EC4899'],
        borderColor: ['#2563EB', '#DB2777'],
        borderWidth: 2,
      },
    ],
  };

  const ageData = {
    labels: ['0-14 tahun', '15-64 tahun', '65+ tahun'],
    datasets: [
      {
        label: 'Jumlah Penduduk',
        data: [612, 1756, 179],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderColor: ['#059669', '#D97706', '#DC2626'],
        borderWidth: 2,
      },
    ],
  };

  const educationData = {
    labels: ['SD', 'SMP', 'SMA', 'Diploma', 'Sarjana'],
    datasets: [
      {
        label: 'Tingkat Pendidikan',
        data: [892, 654, 512, 178, 311],
        backgroundColor: '#6366F1',
        borderColor: '#4F46E5',
        borderWidth: 2,
      },
    ],
  };

  const occupationData = {
    labels: ['Petani', 'Pedagang', 'Buruh', 'PNS', 'Wiraswasta', 'Lainnya'],
    datasets: [
      {
        label: 'Mata Pencaharian',
        data: [756, 298, 412, 89, 234, 145],
        backgroundColor: '#059669',
        borderColor: '#047857',
        borderWidth: 2,
      },
    ],
  };

  const stats = [
    { icon: Users, label: 'Total Penduduk', value: '2,547', color: 'bg-blue-500' },
    { icon: UserCheck, label: 'Kepala Keluarga', value: '724', color: 'bg-emerald-500' },
    { icon: Baby, label: 'Anak-anak (0-14)', value: '612', color: 'bg-purple-500' },
    { icon: User, label: 'Dewasa (15-64)', value: '1,756', color: 'bg-orange-500' },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Data Kependudukan</h1>
            <p className="text-xl text-blue-100">Desa Medalsari</p>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className={`w-16 h-16 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
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

      {/* Charts Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Gender Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6" data-aos="fade-up">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Distribusi Jenis Kelamin</h3>
              <div className="h-64">
                <Doughnut data={genderData} options={chartOptions} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-600">Total: 2,547 jiwa</p>
              </div>
            </div>

            {/* Age Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6" data-aos="fade-up" data-aos-delay="200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Distribusi Usia</h3>
              <div className="h-64">
                <Doughnut data={ageData} options={chartOptions} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-600">Klasifikasi berdasarkan kelompok usia</p>
              </div>
            </div>

            {/* Education Level */}
            <div className="bg-white rounded-xl shadow-lg p-6" data-aos="fade-up" data-aos-delay="400">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Tingkat Pendidikan</h3>
              <div className="h-64">
                <Bar data={educationData} options={chartOptions} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-600">Pendidikan tertinggi yang ditamatkan</p>
              </div>
            </div>

            {/* Occupation */}
            <div className="bg-white rounded-xl shadow-lg p-6" data-aos="fade-up" data-aos-delay="600">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Mata Pencaharian</h3>
              <div className="h-64">
                <Bar data={occupationData} options={chartOptions} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-600">Pekerjaan utama penduduk</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Informasi Tambahan</h2>
            <p className="text-xl text-gray-600">Data demografis lengkap Desa Medalsari</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6" data-aos="fade-up">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Kepadatan Penduduk</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">127 jiwa/km²</p>
              <p className="text-gray-600">Luas wilayah: 20.1 km²</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6" data-aos="fade-up" data-aos-delay="200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Rasio Ketergantungan</h3>
              <p className="text-3xl font-bold text-emerald-600 mb-2">45.1%</p>
              <p className="text-gray-600">Perbandingan penduduk produktif dan non-produktif</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6" data-aos="fade-up" data-aos-delay="400">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Pertumbuhan Penduduk</h3>
              <p className="text-3xl font-bold text-purple-600 mb-2">1.2%</p>
              <p className="text-gray-600">Pertumbuhan per tahun (2023-2024)</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DataPenduduk;