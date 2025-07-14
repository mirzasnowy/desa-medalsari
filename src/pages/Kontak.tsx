import React, { useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Kontak = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
    });
  }, []);

  // Koordinat yang Anda minta
  const latitude = -6.524828;
  const longitude = 107.174051;
  const mapZoom = 15; // Level zoom peta, sesuaikan sesuai kebutuhan (15-17 biasanya bagus untuk tingkat jalan)

  // URL embed OpenStreetMap
  // Untuk membuat bounding box yang sederhana di sekitar titik, kita bisa menambahkan/mengurangi sedikit dari koordinat
  const bboxMinLon = longitude - 0.005;
  const bboxMinLat = latitude - 0.005;
  const bboxMaxLon = longitude + 0.005;
  const bboxMaxLat = latitude + 0.005;

  const openStreetMapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bboxMinLon}%2C${bboxMinLat}%2C${bboxMaxLon}%2C${bboxMaxLat}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  
  // URL untuk membuka di Google Maps (untuk tombol "Buka di Google Maps")
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;


  const contacts = [
    {
      icon: MapPin,
      title: 'Alamat',
      info: 'Kp Tegal simeut 41362, Medalsari, Kec. Pangkalan, Karawang, Jawa Barat 41362',
      color: 'bg-blue-500',
    },
    {
      icon: Phone,
      title: 'Telepon',
      info: '+62 21 1234 5678',
      color: 'bg-emerald-500',
    },
    {
      icon: Mail,
      title: 'Email',
      info: 'info@medalsari.desa.id',
      color: 'bg-purple-500',
    },
    {
      icon: Clock,
      title: 'Jam Operasional',
      info: 'Senin - Jumat: 08:00 - 16:00\nSabtu: 08:00 - 12:00\nMinggu: Tutup',
      color: 'bg-orange-500',
    },
  ];

  const faqs = [
    {
      question: 'Bagaimana cara mengurus surat keterangan domisili?',
      answer: 'Anda dapat datang langsung ke kantor desa dengan membawa KTP dan KK. Proses pembuatan surat biasanya memakan waktu 1-2 hari kerja.',
    },
    {
      question: 'Kapan waktu terbaik untuk berkunjung ke tempat wisata?',
      answer: 'Waktu terbaik adalah pagi hari (07:00-10:00) atau sore hari (15:00-17:00) untuk menghindari cuaca yang terlalu panas.',
    },
    {
      question: 'Apakah ada program pemberdayaan masyarakat?',
      answer: 'Ya, kami memiliki berbagai program seperti pelatihan UMKM, program bantuan sosial, dan kegiatan gotong royong rutin.',
    },
    {
      question: 'Bagaimana cara mendaftar sebagai UMKM di website?',
      answer: 'Anda dapat menghubungi kantor desa atau mengisi formulir online yang tersedia di website kami.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Hubungi Kami</h1>
            <p className="text-xl text-teal-100">Kami siap membantu dan melayani Anda</p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {contacts.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className={`w-16 h-16 ${contact.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{contact.title}</h3>
                  <p className="text-gray-600 whitespace-pre-line">{contact.info}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div data-aos="fade-up">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Kirim Pesan</h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Masukkan email"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subjek
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Masukkan subjek pesan"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pesan
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Tulis pesan Anda di sini..."
                  ></textarea>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>Kirim Pesan</span>
                  </button>
                  <a
                    href="https://wa.me/6281234567890"
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </form>
            </div>

            {/* Map */}
            <div data-aos="fade-up" data-aos-delay="200">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Lokasi Kantor Desa</h2>
              {/* Ganti div placeholder ini dengan iframe peta interaktif OpenStreetMap */}
              <div className="bg-gray-200 rounded-lg h-96 mb-6 overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={openStreetMapEmbedUrl} // Menggunakan URL OpenStreetMap
                ></iframe>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-2">Petunjuk Arah</h3>
                <p className="text-gray-600 mb-4">
                  Dari pusat kota, ambil jalan raya menuju arah utara sekitar 15 km. 
                  Kantor desa berada di sebelah kanan jalan, tepat di samping masjid besar.
                </p>
                <a
                  href={googleMapsUrl} // Menggunakan URL Google Maps untuk membuka di tab baru
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors inline-block"
                >
                  Buka di Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Pertanyaan yang Sering Diajukan</h2>
            <p className="text-xl text-gray-600">FAQ seputar layanan dan informasi desa</p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Kontak;