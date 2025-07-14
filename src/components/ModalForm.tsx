// components/ModalForm.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

// Definisi tipe untuk props komponen
interface ModalFormProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  modalType: string;
  editingItem: any; // Menggunakan 'any' untuk sementara, bisa lebih spesifik
  handleSave: (type: string, formData: any) => void;
  menuItems: { id: string; label: string; icon: LucideIcon }[];
}

const ModalForm: React.FC<ModalFormProps> = ({ showModal, setShowModal, modalType, editingItem, handleSave, menuItems }) => {
  if (!showModal) return null;

  // Placeholder function for form submission. In a real app,
  // you'd collect form data here and pass it to handleSave.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Example: For Data Penduduk, you might have inputs for NIK, Nama, etc.
    // For now, we'll just close the modal.
    // In a real application, you would gather form data and pass it to handleSave.
    // For demonstration, we'll pass a dummy object.
    const dummyFormData = {
      // This would be dynamically generated based on modalType and user input
      // For example:
      // nik: "NEW_NIK",
      // nama: "Nama Baru",
      // etc.
    };
    handleSave(modalType, editingItem ? { ...editingItem, ...dummyFormData } : dummyFormData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {editingItem ? 'Edit' : 'Tambah'} {menuItems.find(item => item.id === modalType)?.label}
        </h3>
        <p className="text-gray-600 mb-4">
          Form untuk {editingItem ? 'mengedit' : 'menambah'} data akan ditampilkan di sini.
          Anda perlu mengimplementasikan form input spesifik untuk setiap `modalType` di sini.
        </p>
        {/* Placeholder for the actual form inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Example input (you'd expand this based on modalType) */}
          {modalType === 'dataPenduduk' && (
            <div>
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700">Nama</label>
              <input
                type="text"
                id="nama"
                name="nama"
                defaultValue={editingItem?.nama || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Masukkan nama"
              />
            </div>
          )}
          {/* Add more conditions for other modalTypes (aparaturDesa, berita, etc.) */}
          {/* For simplicity, only a single input is shown. */}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalForm;
