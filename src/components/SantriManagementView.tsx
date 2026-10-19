import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  CreditCard, 
  Receipt, 
  HandCoins, 
  PlusCircle, 
  X, 
  Printer, 
  Building,
  CheckCircle,
  Lock,
  AlertTriangle,
  QrCode
} from 'lucide-react';
import { Santri, Transaction, PesantrenProfile } from '../types/finance';
import { 
  formatRupiah, 
  checkDailyAllowanceEligibility, 
  getTodayDateString 
} from '../utils/accounting';

interface SantriManagementViewProps {
  santriList: Santri[];
  transactions: Transaction[];
  pesantrenProfile: PesantrenProfile;
  onAddSantri: (newSantri: Omit<Santri, 'id' | 'accountNumber' | 'createdAt'>, initialDeposit: number) => void;
  onOpenTellerForSantri: (santriId: string) => void;
  onOpenDepositForSantri: (santriId: string) => void;
  onViewStatementForSantri: (santriId: string) => void;
}

export const SantriManagementView: React.FC<SantriManagementViewProps> = ({
  santriList,
  transactions,
  pesantrenProfile,
  onAddSantri,
  onOpenTellerForSantri,
  onOpenDepositForSantri,
  onViewStatementForSantri,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDormitory, setSelectedDormitory] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCardSantri, setSelectedCardSantri] = useState<Santri | null>(null);

  // Form state for adding new Santri
  const [formData, setFormData] = useState({
    name: '',
    nisn: '',
    gender: 'L' as 'L' | 'P',
    dormitory: 'Asrama Al-Fatih - Kamar 01',
    className: 'Kelas 1 Aliyah (SMA)',
    guardianName: '',
    guardianPhone: '',
    guardianAddress: '',
    initialDeposit: 200000,
  });

  const todayStr = getTodayDateString();

  // Dormitories list
  const dormitories = Array.from(new Set(santriList.map((s) => s.dormitory.split(' - ')[0])));

  const filteredSantri = santriList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm) ||
      s.accountNumber.includes(searchTerm) ||
      s.guardianName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDorm = selectedDormitory === 'ALL' || s.dormitory.startsWith(selectedDormitory);
    return matchesSearch && matchesDorm;
  });

  const handleCreateSantriSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nisn || !formData.guardianName) return;

    onAddSantri(
      {
        name: formData.name,
        nisn: formData.nisn,
        gender: formData.gender,
        dormitory: formData.dormitory,
        className: formData.className,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone || '0812-0000-0000',
        guardianAddress: formData.guardianAddress || 'Alamat Wali Santri',
        balance: 0, // balance will be initialized with initialDeposit if > 0
        dailyAllowanceLimit: 10000,
        status: 'AKTIF',
        avatarSeed: formData.name.split(' ')[0],
      },
      formData.initialDeposit
    );

    setIsAddModalOpen(false);
    // Reset form
    setFormData({
      name: '',
      nisn: '',
      gender: 'L',
      dormitory: 'Asrama Al-Fatih - Kamar 01',
      className: 'Kelas 1 Aliyah (SMA)',
      guardianName: '',
      guardianPhone: '',
      guardianAddress: '',
      initialDeposit: 200000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Search Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">
              Data Santri & Rekening Wadiah Titipan
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {santriList.length} rekening santri aktif terdaftar dalam sistem kas perbankan syariah
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari santri, NISN, wali..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Dormitory Dropdown */}
          <select
            value={selectedDormitory}
            onChange={(e) => setSelectedDormitory(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Asrama</option>
            {dormitories.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Add Santri Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Santri Baru</span>
          </button>
        </div>
      </div>

      {/* Santri Table View */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[11px] tracking-wider">
                <th className="px-4 py-3 text-left w-28">No. Rekening</th>
                <th className="px-4 py-3 text-left">Nama Santri & NISN</th>
                <th className="px-4 py-3 text-left">Asrama & Kelas</th>
                <th className="px-4 py-3 text-left">Wali Santri (Pemberi)</th>
                <th className="px-4 py-3 text-right w-36">Saldo Wadiah</th>
                <th className="px-4 py-3 text-center w-36">Status Jajan Hari Ini</th>
                <th className="px-4 py-3 text-center w-48 no-print">Aksi Loket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSantri.map((santri) => {
                const eligibility = checkDailyAllowanceEligibility(santri, transactions, todayStr);

                return (
                  <tr key={santri.id} className="hover:bg-slate-50 transition-colors">
                    {/* Account Number */}
                    <td className="px-4 py-3 font-mono text-[11px] font-bold text-slate-700 whitespace-nowrap">
                      {santri.accountNumber}
                    </td>

                    {/* Name & NISN */}
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                            santri.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {santri.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{santri.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">NISN: {santri.nisn}</p>
                        </div>
                      </div>
                    </td>

                    {/* Dormitory & Class */}
                    <td className="px-4 py-3 text-slate-700">
                      <p className="font-medium">{santri.dormitory}</p>
                      <p className="text-[10px] text-slate-500">{santri.className}</p>
                    </td>

                    {/* Guardian */}
                    <td className="px-4 py-3 text-slate-700">
                      <p className="font-semibold">{santri.guardianName}</p>
                      <p className="text-[10px] text-slate-500">{santri.guardianPhone}</p>
                    </td>

                    {/* Saldo Wadiah */}
                    <td className="px-4 py-3 text-right font-mono-numbers">
                      <span className="font-black text-sm text-emerald-800">
                        {formatRupiah(santri.balance)}
                      </span>
                    </td>

                    {/* Today Allowance Status */}
                    <td className="px-4 py-3 text-center">
                      {eligibility.status === 'ALREADY_TAKEN' ? (
                        <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                          <Lock className="w-3 h-3" />
                          <span>Sudah Ambil ({eligibility.todayWithdrawal?.time.slice(0, 5)})</span>
                        </div>
                      ) : eligibility.status === 'INSUFFICIENT_BALANCE' ? (
                        <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Saldo Habis</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle className="w-3 h-3" />
                          <span>Belum Ambil (10rb)</span>
                        </div>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="px-4 py-3 text-center no-print">
                      <div className="flex items-center justify-center space-x-1">
                        {/* Quick Teller jajan */}
                        <button
                          onClick={() => onOpenTellerForSantri(santri.id)}
                          title="Loket Penarikan Jajan Rp 10.000"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                        >
                          <HandCoins className="w-4 h-4" />
                        </button>

                        {/* Top up / Deposit */}
                        <button
                          onClick={() => onOpenDepositForSantri(santri.id)}
                          title="Setor Titipan Wali"
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white transition-all cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>

                        {/* View Statement */}
                        <button
                          onClick={() => onViewStatementForSantri(santri.id)}
                          title="Buka Rekening Koran"
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>

                        {/* View Digital ATM Card */}
                        <button
                          onClick={() => setSelectedCardSantri(santri)}
                          title="Cetak Kartu Wadiah Santri"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD NEW SANTRI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Registrasi Rekening Wadiah Santri Baru</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSantriSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Santri</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Muhammad Ilham"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NISN (Nomor Induk)</label>
                  <input
                    type="text"
                    required
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    placeholder="Contoh: 0081239999"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="L">Laki-laki (Ikhwan)</option>
                    <option value="P">Perempuan (Akhwat)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asrama</label>
                  <input
                    type="text"
                    value={formData.dormitory}
                    onChange={(e) => setFormData({ ...formData, dormitory: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                  <input
                    type="text"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    required
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    placeholder="Contoh: H. Abdul Rasyid"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp / HP Wali</label>
                  <input
                    type="text"
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Setoran Titipan Awal (Rupiah)</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={formData.initialDeposit}
                  onChange={(e) => setFormData({ ...formData, initialDeposit: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono-numbers font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Otomatis dicatat sebagai setoran wadiah pertama dengan batas harian jajan Rp 10.000.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg shadow-xs cursor-pointer"
                >
                  Simpan & Buka Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DIGITAL SANTRI ATM/SMART CARD */}
      {selectedCardSantri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Kartu Santri Wadiah (Smart Card Mini Pesantren)</span>
              </span>
              <button
                onClick={() => setSelectedCardSantri(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-100 flex flex-col items-center">
              {/* The Physical Card Mockup */}
              <div className="w-full aspect-[85.6/53.98] rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white p-5 shadow-2xl border border-emerald-500/40 relative overflow-hidden flex flex-col justify-between select-none">
                {/* Background calligraphy pattern watermark */}
                <div className="absolute right-0 top-0 opacity-10 font-arabic text-7xl font-black pointer-events-none">
                  وديعة
                </div>

                {/* Card Header */}
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-wider text-emerald-200">
                      {pesantrenProfile.name}
                    </h4>
                    <p className="text-[9px] text-slate-300">
                      KARTU TITIPAN WADIAH SANTRI
                    </p>
                  </div>
                  <span className="font-arabic text-amber-300 text-xs font-bold">
                    بِسْمِ اللَّهِ
                  </span>
                </div>

                {/* Chip & Contactless Icon */}
                <div className="flex items-center space-x-3 my-1">
                  <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 border border-amber-600/60 shadow-xs flex items-center justify-center">
                    <div className="w-5 h-4 border border-amber-700/40 rounded-xs"></div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono tracking-widest">
                    JAJAN HARIAN 10K
                  </span>
                </div>

                {/* Card Number & Holder */}
                <div className="relative z-10">
                  <p className="font-mono text-sm sm:text-base font-bold tracking-widest text-slate-100 shadow-xs">
                    {selectedCardSantri.accountNumber.replace(/\./g, '  ')}
                  </p>
                  <div className="flex justify-between items-end mt-2">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-emerald-300">Nama Santri</p>
                      <p className="font-bold text-xs text-white truncate max-w-[190px]">
                        {selectedCardSantri.name}
                      </p>
                      <p className="text-[8px] text-slate-400">
                        NISN: {selectedCardSantri.nisn} • {selectedCardSantri.dormitory.split(' - ')[0]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-wider text-emerald-300">Batas Jajan</p>
                      <p className="font-mono text-xs font-black text-amber-300">
                        Rp 10.000 / Hari
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barcode / QR Simulation for scanner */}
              <div className="mt-4 bg-white p-3 rounded-xl border border-slate-300 flex items-center space-x-4 w-full">
                <QrCode className="w-12 h-12 text-slate-800 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">Scan Barcode di Loket Jajan</p>
                  <p className="text-[10px] text-slate-500">
                    Bawakan kartu ini ke loket teller bendahara pesantren setiap pagi/istirahat untuk pencairan jajan harian.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedCardSantri(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kartu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
