import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, FileText, Download, Bot, User, HelpCircle, FileDown } from 'lucide-react';
import faqData from '../data/faqData.json'; // Pastikan path ini sesuai dengan lokasi file Anda

// --- IMPOR UNTUK GENERASI DOKUMEN WORD ---
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js';
import { saveAs } from 'file-saver';
// --- AKHIR IMPOR WORD DOC ---

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'document' | 'faq';
  documentUrl?: string;
  documentName?: string;
}

interface DocumentTemplate {
  id: string; // ID unik internal (misal: 'surat-domisili')
  name: string;
  description: string;
  keywords: string[];
  filename: string; // Nama file untuk diunduh (misal: "Surat Keterangan Domisili.docx")
  category: string;
  templatePath: string; // Path ke file .docx template di folder public/templates
}

interface FAQItem {
  id: number; // ID numerik untuk FAQ
  question: string;
  answer: string;
  keywords: string[];
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Document Templates (dengan path dan nama file yang sesuai)
  const documentTemplates: DocumentTemplate[] = [
    { id: 'surat-domisili', name: 'Surat Keterangan Domisili', description: 'Template surat keterangan domisili untuk keperluan administrasi', keywords: ['domisili', 'tempat tinggal', 'alamat', 'keterangan domisili'], filename: 'template-surat-keterangan-domisili.docx', category: 'Administrasi', templatePath: '/templates/template-surat-keterangan-domisili.docx' },
    { id: 'surat-usaha', name: 'Surat Keterangan Usaha', description: 'Template surat keterangan usaha untuk UMKM dan wirausaha', keywords: ['usaha', 'umkm', 'bisnis', 'keterangan usaha', 'wirausaha'], filename: 'template-surat-keterangan-usaha.docx', category: 'UMKM', templatePath: '/templates/template-surat-keterangan-usaha.docx' },
    { id: 'surat-tidak-mampu', name: 'Surat Keterangan Tidak Mampu', description: 'Template surat keterangan tidak mampu untuk bantuan sosial', keywords: ['tidak mampu', 'miskin', 'bantuan', 'sosial', 'sktm'], filename: 'template-surat-keterangan-tidak-mampu.docx', category: 'Bantuan Sosial', templatePath: '/templates/template-surat-keterangan-tidak-mampu.docx' },
    { id: 'surat-kelahiran', name: 'Surat Keterangan Kelahiran', description: 'Template surat keterangan kelahiran untuk bayi baru lahir', keywords: ['kelahiran', 'bayi', 'lahir', 'akte kelahiran'], filename: 'template-surat-keterangan-kelahiran.docx', category: 'Kependudukan', templatePath: '/templates/template-surat-keterangan-kelahiran.docx' },
    { id: 'surat-kematian', name: 'Surat Keterangan Kematian', description: 'Template surat keterangan kematian', keywords: ['kematian', 'meninggal', 'wafat', 'akte kematian'], filename: 'template-surat-keterangan-kematian.docx', category: 'Kependudukan', templatePath: '/templates/template-surat-keterangan-kematian.docx' },
    { id: 'surat-pindah', name: 'Surat Keterangan Pindah', description: 'Template surat keterangan pindah domisili', keywords: ['pindah', 'mutasi', 'pindah domisili', 'pindah alamat'], filename: 'template-surat-keterangan-pindah.docx', category: 'Kependudukan', templatePath: '/templates/template-surat-keterangan-pindah.docx' },
    { id: 'surat-nikah', name: 'Surat Pengantar Nikah', description: 'Template surat pengantar untuk pernikahan', keywords: ['nikah', 'menikah', 'pernikahan', 'pengantar nikah'], filename: 'template-surat-keterangan-nikah.docx', category: 'Kependudukan', templatePath: '/templates/template-surat-keterangan-nikah.docx' },
    { id: 'surat-izin-kegiatan', name: 'Surat Izin Kegiatan', description: 'Template surat izin untuk kegiatan masyarakat', keywords: ['izin kegiatan', 'acara', 'event', 'kegiatan masyarakat'], filename: 'template-surat-izin-kegiatan.docx', category: 'Kegiatan', templatePath: '/templates/template-surat-izin-kegiatan.docx' }
  ];

  const commands = [
    { command: '/faq', description: 'Lihat daftar pertanyaan yang sering diajukan' },
    { command: '/surat', description: 'Lihat daftar template surat yang tersedia' },
    { command: '/kontak', description: 'Informasi kontak kantor desa' },
    { command: '/jam', description: 'Jam pelayanan kantor desa' },
    { command: '/help', description: 'Bantuan penggunaan chatbot' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (text: string, isBot: boolean, type: 'text' | 'document' | 'faq' = 'text', documentUrl?: string, documentName?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date(),
      type,
      documentUrl,
      documentName
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = async (duration: number = 500) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, duration));
    setIsTyping(false);
  };

  const generateDocumentUrl = async (template: DocumentTemplate): Promise<string> => {
      return new Promise((resolve, reject) => {
          PizZipUtils.getBinaryContent(template.templatePath, function(error: Error, content: string) {
              if (error) {
                  console.error("Error loading document template:", error);
                  reject(error);
                  return;
              }

              const zip = new PizZip(content);
              const doc = new Docxtemplater(zip, {
                  paragraphLoop: true,
                  linebreaks: true,
              });

              // Tanggal saat ini di Karawang, Indonesia
              const now = new Date();
              const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
              const currentDate = now.toLocaleDateString('id-ID', options);

              doc.setData({
                  tanggal_sekarang: currentDate,
                  // Anda bisa tambahkan data dinamis lainnya di sini jika diperlukan
                  // Misal: nama_pemohon: "Nama Anda", nik_pemohon: "1234567890"
                  // Pastikan placeholder ini ada di file .docx Anda
              });

              try {
                  doc.render();
              } catch (renderError) {
                  console.error("Error rendering document:", renderError);
                  reject(renderError);
                  return;
              }

              const out = doc.getZip().generate({
                  type: "blob",
                  mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  compression: "DEFLATE",
              });

              resolve(URL.createObjectURL(out));
          });
      });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    addMessage(userMessage, false);
    setInputText('');

    await simulateTyping();

    const lowerCaseUserMessage = userMessage.toLowerCase();
    let botResponseText = '';
    let responseHandled = false;

    // --- LOGIKA PENANGANAN PERINTAH DENGAN NOMOR/KATA KUNCI SPESIFIK ---

    // 1. Penanganan FAQ: '/faq <nomor>' atau 'faq <nomor>'
    const faqPrefixMatch = lowerCaseUserMessage.match(/^(?:\/faq|faq)\s+(\d+)$/);
    if (faqPrefixMatch) {
        const numericId = parseInt(faqPrefixMatch[1]);
        const faqMatchById = faqData.find(faq => faq.id === numericId);
        if (faqMatchById) {
            addMessage(faqMatchById.answer, true, 'faq');
            responseHandled = true;
        } else {
            botResponseText = `Maaf, FAQ dengan nomor ${numericId} tidak ditemukan. Ketik "/faq" untuk melihat daftar lengkap.`;
        }
    }

    // 2. Penanganan Template Surat: '/surat <nomor>' atau 'surat <nomor>' atau 'template <nomor>'
    const suratPrefixMatch = lowerCaseUserMessage.match(/^(?:\/surat|surat|template)\s+(\d+)$/);
    if (!responseHandled && suratPrefixMatch) {
        const requestedNumber = parseInt(suratPrefixMatch[1]);
        const templateIndex = requestedNumber - 1; // Kurangi 1 karena array 0-based
        
        if (templateIndex >= 0 && templateIndex < documentTemplates.length) {
            const templateMatchByIndex = documentTemplates[templateIndex];
            try {
                const documentUrl = await generateDocumentUrl(templateMatchByIndex);
                addMessage(
                    `Saya menemukan template yang Anda butuhkan: ${templateMatchByIndex.name}\n\n${templateMatchByIndex.description}\n\nKlik tombol download di bawah untuk mengunduh template.`,
                    true,
                    'document',
                    documentUrl,
                    templateMatchByIndex.filename
                );
                responseHandled = true;
            } catch (genDocError) {
                console.error("Error generating document from prefix:", genDocError);
                botResponseText = "Maaf, terjadi kesalahan saat membuat template dokumen. Silakan coba lagi nanti atau hubungi admin.";
            }
        } else {
            botResponseText = `Maaf, template surat dengan nomor ${requestedNumber} tidak ditemukan. Ketik "/surat" untuk melihat daftar lengkap.`;
        }
    }


    // --- PENANGANAN PERINTAH BIASA (misal /faq, /surat, /kontak, dll.) ---
    if (!responseHandled && userMessage.startsWith('/')) {
        handleCommand(lowerCaseUserMessage);
        responseHandled = true;
    }


    // --- PENCARIAN FAQ & TEMPLATE BERDASARKAN KATA KUNCI/PERTANYAAN (jika belum ditangani) ---
    if (!responseHandled) {
        // Cari FAQ berdasarkan kata kunci/pertanyaan
        const faqMatchByKeyword = faqData.find(faq =>
            faq.question.toLowerCase().includes(lowerCaseUserMessage) ||
            lowerCaseUserMessage.includes(faq.question.toLowerCase()) ||
            faq.keywords.some(keyword => lowerCaseUserMessage.includes(keyword.toLowerCase()))
        );

        if (faqMatchByKeyword) {
            addMessage(faqMatchByKeyword.answer, true, 'faq');
            responseHandled = true;
        }
    }

    if (!responseHandled) {
        // Cari Template berdasarkan kata kunci
        const templateMatchByKeyword = documentTemplates.find(template =>
            template.keywords.some(keyword => lowerCaseUserMessage.includes(keyword.toLowerCase())) ||
            template.name.toLowerCase().includes(lowerCaseUserMessage)
        );

        if (templateMatchByKeyword) {
            try {
                const documentUrl = await generateDocumentUrl(templateMatchByKeyword);
                addMessage(
                    `Saya menemukan template yang Anda butuhkan: ${templateMatchByKeyword.name}\n\n${templateMatchByKeyword.description}\n\nKlik tombol download di bawah untuk mengunduh template.`,
                    true,
                    'document',
                    documentUrl,
                    templateMatchByKeyword.filename
                );
                responseHandled = true;
            } catch (genDocError) {
                console.error("Error generating document from keyword:", genDocError);
                botResponseText = "Maaf, terjadi kesalahan saat membuat template dokumen. Silakan coba lagi nanti atau hubungi admin.";
            }
        }
    }


    // --- DEFAULT RESPONSE (jika tidak ada yang cocok) ---
    if (!responseHandled) {
        if (botResponseText) {
            addMessage(botResponseText, true);
        } else {
            const suggestions = [
                'Maaf, saya tidak dapat memahami pertanyaan Anda. Berikut beberapa hal yang dapat saya bantu:',
                '',
                '🔍 Ketik "/faq" untuk melihat pertanyaan yang sering diajukan',
                '📄 Ketik "/surat" untuk melihat template surat yang tersedia',
                '📞 Ketik "/kontak" untuk informasi kontak desa',
                '⏰ Ketik "/jam" untuk jam pelayanan',
                '',
                'Atau Anda dapat menanyakan hal-hanya seperti:',
                '• "Bagaimana cara mengurus surat domisili?"',
                '• "Template surat usaha"',
                '• "Jam pelayanan kantor desa"',
                '• "Syarat mendaftar UMKM"'
            ].join('\n');
            addMessage(suggestions, true);
        }
    }
  };

  const handleCommand = async (command: string) => { // handleCommand harus async
    switch (command) {
      case '/faq':
        const faqList = faqData.map((faq) => `${faq.id}. ${faq.question}`).join('\n');
        addMessage(`Berikut adalah pertanyaan yang sering diajukan:\n\n${faqList}\n\nKetik **nomor** atau **pertanyaan** untuk mendapatkan jawaban lengkap.`, true, 'faq');
        break;

      case '/surat':
        const templateList = documentTemplates.map((template, index) =>
          `${index + 1}. ${template.name} (${template.category})`
        ).join('\n');
        addMessage(`Template surat yang tersedia:\n\n${templateList}\n\nKetik **surat <nomor>** atau **nama surat/kata kunci** untuk mendapatkan template.`, true);
        break;

      case '/kontak':
        addMessage(
          'Kontak Kantor Desa Medalsari:\n\n' +
          '📍 Alamat: Kp Tegal simeut 41362, Medalsari, Kec. Pangkalan, Karawang, Jawa Barat 41362\n' +
          '📞 Telepon: +62 21 1234 5678\n' +
          '📧 Email: info@medalsari.desa.id\n' +
          '💬 WhatsApp: +62 812 3456 7890\n\n' +
          'Untuk layanan darurat, hubungi kepala desa di nomor yang tersedia.',
          true
        );
        break;

      case '/jam':
        addMessage(
          'Jam Pelayanan Kantor Desa Medalsari:\n\n' +
          '🕐 Senin - Jumat: 08:00 - 16:00 WIB\n' +
          '🕐 Sabtu: 08:00 - 12:00 WIB\n' +
          '❌ Minggu: Tutup\n\n' +
          'Catatan: Untuk layanan tertentu, disarankan datang sebelum jam 15:00 agar dapat dilayani dengan optimal.',
          true
        );
        break;

      case '/help':
        const helpText = commands.map(cmd => `${cmd.command} - ${cmd.description}`).join('\n');
        addMessage(
          `Panduan Penggunaan Chatbot Desa Medalsari:\n\n${helpText}\n\nAnda juga dapat menanyakan langsung tanpa menggunakan perintah, seperti:\n• "Cara mengurus surat domisili"\n• "Template surat usaha"\n• "Jam buka kantor desa"`,
          true
        );
        break;

      default:
        addMessage('Perintah tidak dikenali. Ketik "/help" untuk melihat daftar perintah yang tersedia.', true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const downloadDocument = (url: string, filename: string) => {
    fetch(url)
      .then(res => res.blob())
      .then(blob => saveAs(blob, filename))
      .catch(error => console.error('Error downloading file:', error));
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6 group-hover:animate-bounce" />
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Asisten Desa Medalsari</h3>
                <p className="text-sm text-emerald-100">Online • Siap membantu</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] ${message.isBot ? 'order-2' : 'order-1'}`}>
                  {message.isBot && (
                    <div className="flex items-center space-x-2 mb-1">
                      <Bot className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs text-gray-500">Asisten Desa</span>
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl ${
                      message.isBot
                        ? 'bg-white text-gray-800 shadow-sm border'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    {message.type === 'document' && message.documentUrl && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => downloadDocument(message.documentUrl!, message.documentName!)}
                          className="flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-200 transition-colors w-full"
                        >
                          <FileDown className="w-4 h-4" />
                          <span className="text-sm font-medium">Download Template</span>
                        </button>
                      </div>
                    )}
                  </div>
                  {!message.isBot && (
                    <div className="flex items-center justify-end space-x-2 mt-1">
                      <span className="text-xs text-gray-500">Anda</span>
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl shadow-sm border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan atau gunakan / untuk perintah..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-2 rounded-full hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <button
                onClick={() => setInputText('/faq')}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                FAQ
              </button>
              <button
                onClick={() => setInputText('/surat')}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                Template Surat
              </button>
              <button
                onClick={() => setInputText('/kontak')}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                Kontak
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;