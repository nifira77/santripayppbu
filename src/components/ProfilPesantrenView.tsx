import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Upload, 
  Trash2, 
  CheckCircle, 
  Save, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  UserCheck, 
  Coins, 
  Eye
} from 'lucide-react';
import { PesantrenProfile } from '../types/finance';
import { formatRupiah } from '../utils/accounting';

interface ProfilPesantrenViewProps {
  pesantrenProfile: PesantrenProfile;
  onUpdateProfile: (newProfile: PesantrenProfile) => void;
}

export const ProfilPesantrenView: React.FC<ProfilPesantrenViewProps> = ({
  pesantrenProfile,
  onUpdateProfile,
}) => {
  const [formData, setFormData] = useState<PesantrenProfile>({ ...pesantrenProfile });
  const [logoPreview, setLogoPreview] = useState<string | null>(pesantrenProfile.logoUrl || null);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 2MB for base64 storage
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file logo terlalu besar. Harap pilih gambar di bawah 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      setLogoPreview(base64Url);
      setFormData((prev) => ({ ...prev, logoUrl: base64Url }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setFormData((prev) => ({ ...prev, logoUrl: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">
              Profil Lembaga & Pengaturan Logo Pesantren
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Informasi identitas pondok pesantren yang tampil pada kop surat, laporan neraca, rekening koran, dan struk penarikan jajan
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300">
            <CheckCircle className="w-4 h-4" />
            <span>Perubahan Tersimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Logo Upload & Live Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Logo Upload Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Logo Resmi Pesantren</span>
              <span className="text-[10px] text-slate-400">Format: PNG, JPG, SVG</span>
            </h3>

            <div className="flex flex-col items-center p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition-colors">
              {logoPreview ? (
                <div className="relative group flex flex-col items-center">
                  <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden">
                    <img
                      src={logoPreview}
                      alt="Logo Pesantren"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Ganti Logo
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center text-center cursor-pointer py-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Klik untuk Unggah Logo Pesantren
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
                    Unggah file gambar logo pondok pesantren untuk dipasang pada kop surat & rekening koran
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Live Kop Surat Preview */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 font-sans">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center space-x-1.5">
              <Eye className="w-4 h-4 text-emerald-700" />
              <span>Pratinjau Kop Surat Resmi</span>
            </h3>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <div className="flex items-center space-x-3 border-b-2 border-slate-800 pb-3">
                {logoPreview ? (
                  <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 flex items-center justify-center shrink-0">
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-arabic text-[11px] text-emerald-800 font-bold leading-tight">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                  <p className="font-black text-xs uppercase text-slate-900 truncate">
                    {formData.formalName || 'Nama Pondok Pesantren'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {formData.address || 'Alamat Pesantren'}, {formData.district}
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center text-[10px] text-slate-400">
                Pratinjau ini yang akan tercetak otomatis di Rekening Koran dan Neraca
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Information Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Data Identitas & Rekening Pesantren
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Singkat Pesantren
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Darul Ma'arif Syariah"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Formal / Badan Yayasan
              </label>
              <input
                type="text"
                required
                value={formData.formalName}
                onChange={(e) => setFormData({ ...formData, formalName: e.target.value })}
                placeholder="Contoh: Pondok Pesantren Darul Ma'arif"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Sub Judul Unit
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Unit Pengelolaan Kas Titipan Wadiah Santri"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Amanah, Transparan, & Sesuai Syariat"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Alamat Lengkap
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Jl. Pesantren Luhur No. 99"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kabupaten / Kota & Kode Pos
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="Kabupaten Jombang, Jawa Timur"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(0321) 865-9921"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Email Resmi Pesantren
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="keuangan@pesantren.ponpes.id"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-slate-700 mb-1">
              Rekening Bank Syariah (Penampung Titipan Transfer Orang Tua)
            </label>
            <input
              type="text"
              value={formData.bankAccountBSI}
              onChange={(e) => setFormData({ ...formData, bankAccountBSI: e.target.value })}
              placeholder="BSI 712-8899-001 a.n. YPI Darul Ma'arif (Titipan Santri)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Mudir / Pengasuh Pesantren
              </label>
              <input
                type="text"
                value={formData.mudir}
                onChange={(e) => setFormData({ ...formData, mudir: e.target.value })}
                placeholder="K.H. Muhammad Syukron Ma'mun, Lc."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kepala Bendahara Pesantren
              </label>
              <input
                type="text"
                value={formData.headOfTreasury}
                onChange={(e) => setFormData({ ...formData, headOfTreasury: e.target.value })}
                placeholder="Ust. H. Ahmad Fauzi, S.E.I."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                NIP / Nomor Identitas Bendahara
              </label>
              <input
                type="text"
                value={formData.treasuryNIP}
                onChange={(e) => setFormData({ ...formData, treasuryNIP: e.target.value })}
                placeholder="NIP. 19840612.201001.1.003"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Batas Default Uang Jajan Harian (Rupiah)
              </label>
              <input
                type="number"
                value={formData.defaultDailyLimit}
                onChange={(e) => setFormData({ ...formData, defaultDailyLimit: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Profil & Logo Pesantren</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
