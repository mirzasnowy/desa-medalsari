import React from 'react';
import { HelpCircle, MessageCircle, FileText, Clock, Phone, Users } from 'lucide-react';

const ChatbotFAQ: React.FC = () => {
  const faqCategories = [
    {
      title: 'Layanan Administrasi',
      icon: FileText,
      color: 'bg-blue-500',
      faqs: [
        {
          question: 'Bagaimana cara mengurus surat keterangan domisili?',
          answer: 'Datang ke kantor desa dengan KTP dan KK, isi formulir, tunggu 1-2 hari kerja.',
          command: '/domisili'
        },
        {
          question: 'Apa saja template surat yang tersedia?',
          answer: 'Tersedia template untuk surat domisili, usaha, tidak mampu, kelahiran, kematian, dan lainnya.',
          command: '/surat'
        },
        {
          question: 'Bagaimana cara mengajukan bantuan sosial?',
          answer: 'Bawa KTP, KK, dan surat keterangan tidak mampu dari RT/RW ke kantor desa.',
          command: '/bantuan'
        }
      ]
    },
    {
      title: 'UMKM & Ekonomi',
      icon: Users,
      color: 'bg-emerald-500',
      faqs: [
        {
          question: 'Bagaimana cara mendaftar UMKM?',
          answer: 'Siapkan KTP, KK, surat keterangan usaha dari RT/RW, dan foto tempat usaha.',
          command: '/usaha'
        },
        {
          question: 'Apakah ada bantuan modal untuk UMKM?',
          answer: 'Ya, tersedia program bantuan modal dan pelatihan untuk UMKM. Hubungi kantor desa untuk info lebih lanjut.',
          command: '/bantuan'
        }
      ]
    },
    {
      title: 'Informasi Umum',
      icon: HelpCircle,
      color: 'bg-purple-500',
      faqs: [
        {
          question: 'Kapan jam pelayanan kantor desa?',
          answer: 'Senin-Jumat 08:00-16:00, Sabtu 08:00-12:00, Minggu tutup.',
          command: '/jam'
        },
        {
          question: 'Bagaimana cara menghubungi kantor desa?',
          answer: 'Telepon +62 21 1234 5678, WhatsApp +62 812 3456 7890, atau email info@medalsari.desa.id',
          command: '/kontak'
        }
      ]
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12" data-aos="fade-up">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-full">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Asisten Virtual Desa Medalsari</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dapatkan bantuan instan untuk pertanyaan umum dan download template surat melalui chatbot AI kami. 
            Ketik "/" untuk melihat perintah yang tersedia!
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300" data-aos="fade-up">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">FAQ Instan</h3>
            <p className="text-gray-600">Jawaban cepat untuk pertanyaan yang sering diajukan tentang layanan desa</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300" data-aos="fade-up" data-aos-delay="100">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Template Surat</h3>
            <p className="text-gray-600">Download template surat administrasi dengan mudah melalui perintah chatbot</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300" data-aos="fade-up" data-aos-delay="200">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">24/7 Tersedia</h3>
            <p className="text-gray-600">Asisten virtual siap membantu kapan saja, bahkan di luar jam kerja kantor desa</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatbotFAQ;