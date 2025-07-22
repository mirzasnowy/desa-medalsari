import React, { useEffect, useState } from 'react';
import { Users, TimerReset, Eye, Award, ThumbsUp, TrendingUp, Volleyball } from 'lucide-react'; // Import Volleyball icon jika tersedia

const SocialProof: React.FC = () => {
  const [totalVisitors, setTotalVisitors] = useState(12847);
  const [todaysVisitors, setTodaysVisitors] = useState(82);
  const [avgDuration, setAvgDuration] = useState(4.7); // menit
  const [engagementScore, setEngagementScore] = useState(88); // dalam %

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalVisitors((prev) => prev + Math.floor(Math.random() * 3));
      setTodaysVisitors((prev) => prev + Math.floor(Math.random() * 2));
      setAvgDuration(parseFloat((Math.random() * 3 + 3).toFixed(1)));
      setEngagementScore(80 + Math.floor(Math.random() * 20));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const achievements = [
    {
      id: 1,
      title: 'Juara 1 Bola Voli Putra U-20',
      description: 'Prestasi Juara 1 tingkat Kecamatan Pangkalan pada tahun 2018.',
      icon: Volleyball, // Menggunakan ikon voli
      color: 'text-red-600' // Warna yang berbeda untuk variasi
    },
    {
      id: 2,
      title: 'Peringkat 1 Pengumpul Zakat Kecamatan',
      description: 'Diakui sebagai desa dengan pengumpulan zakat terbaik di tingkat kecamatan pada tahun 2004/1.',
      icon: Award, // Ikon Award cocok untuk penghargaan umum/peringkat
      color: 'text-emerald-600' // Warna yang berbeda
    },
    {
      id: 3,
      title: 'Juara 1 Voli Putra HUT RI ke-58',
      description: 'Memenangkan Juara 1 Turnamen Bola Voli Putra dalam rangka HUT RI ke-58 pada tahun 2003.',
      icon: Volleyball, // Menggunakan ikon voli
      color: 'text-blue-600' // Warna yang berbeda
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Statistik Pengunjung</h3>
          <p className="text-indigo-100">Pantauan live aktivitas website</p>
        </div>
      </div>

      {/* Statistik */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Users className="mx-auto text-emerald-600" />
            <div className="text-2xl font-bold text-emerald-600">{totalVisitors.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Pengunjung</div>
          </div>
          <div className="text-center">
            <Eye className="mx-auto text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">{todaysVisitors}</div>
            <div className="text-sm text-gray-600">Pengunjung Hari Ini</div>
          </div>
          <div className="text-center">
            <TimerReset className="mx-auto text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">{avgDuration} mnt</div>
            <div className="text-sm text-gray-600">Rata-rata Kunjungan</div>
          </div>
          <div className="text-center">
            <Award className="mx-auto text-orange-500" />
            <div className="text-2xl font-bold text-orange-500">{engagementScore}%</div>
            <div className="text-sm text-gray-600">Skor Interaksi</div>
          </div>
        </div>
      </div>

      {/* Capaian Desa */}
      <div className="p-6">
        <h4 className="font-bold text-gray-800 mb-4 text-center">Capaian & Penghargaan</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map(({ id, title, description, icon: Icon, color }) => (
            <div
              key={id}
              className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-800 text-sm">{title}</h5>
                  <p className="text-gray-600 text-xs">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialProof;