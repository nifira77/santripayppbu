import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  CreditCard, 
  Banknote, 
  Receipt, 
  HeartHandshake, 
  ArrowRight, 
  Printer, 
  CheckCircle,
  Clock,
  ArrowDownLeft
} from 'lucide-react';
import { Santri, Transaction, PaymentMethod, PesantrenProfile } from '../types/finance';
import { formatRupiah, formatDateIndo } from '../utils/accounting';

interface SetorTitipanViewProps {
  santriList: Santri[];
  transactions: Transaction[];
  pesantrenProfile: PesantrenProfile;
  onProcessDeposit: (
    santriId: string,
    amount: number,
    method: PaymentMethod,
    guardianName: string,
    notes: string
  ) => void;
  onViewReceipt: (trx: Transaction, santri: Santri) => void;
}

export const SetorTitipanView: React.FC<SetorTitipanViewProps> = ({
  santriList,
  transactions,
  pesantrenProfile,
  onProcessDeposit,
  onViewReceipt,
}) => {
  const [selectedSantriId, setSelectedSantriId] = useState<string>(santriList[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [amount, setAmount] = useState<number>(300000);
  const [method, setMethod] = useState<PaymentMethod>('BANK_TRANSFER_BSI');
  const [guardianSenderName, setGuardianSenderName] = useState<string>('');
  const [notes, setNotes] = useState<string>('Titipan uang saku santri');

  const selectedSantri = santriList.find((s) => s.id === selectedSantriId) || santriList[0];

  const handleSelectSantri = (id: string) => {
    setSelectedSantriId(id);
    const s = santriList.find((item) => item.id === id);
    if (s) {
      setGuardianSenderName(s.guardianName);
    }
  };

  const filteredSantri = santriList.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nisn.includes(searchTerm) ||
    s.accountNumber.includes(searchTerm) ||
    s.dormitory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const quickAmounts = [100000, 200000, 300000, 500000, 1000000];

  // Recent deposit transactions
  const recentDeposits = transactions
    .filter((t) => t.type === 'DEPOSIT_WADIAH')
    .slice(0, 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri || amount <= 0) return;
    onProcessDeposit(
      selectedSantri.id,
      amount,
      method,
      guardianSenderName || selectedSantri.guardianName,
      notes
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Description Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl shrink-0">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Loket Bendahara: Setor Titipan Wali Santri
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Penerimaan dan pencatatan dana titipan dari orang tua santri (Akad Wadiah Yad Dhamanah)
            </p>
          </div>
        </div>

        <div className="text-left md:text-right text-xs bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
          <p className="text-slate-500 text-[11px]">Batas Pengambilan Jajan Harian:</p>
          <p className="font-bold text-amber-900 font-mono-numbers">Maksimal Rp 10.000 / Hari (1x Penarikan)</p>
        </div>
      </div>

      {/* Main Grid: Form Left, Recent Deposits Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Formulir Setoran Titipan Santri</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
              Kasir Loket
            </span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Select Santri */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pilih Santri Penerima Titipan
              </label>
              <div className="relative mb-2">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama santri / NISN / asrama..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <select
                value={selectedSantriId}
                onChange={(e) => handleSelectSantri(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
              >
                {filteredSantri.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - Rek: {s.accountNumber} ({s.dormitory.split(' - ')[0]}) - Saldo: {formatRupiah(s.balance)}
                  </option>
                ))}
              </select>
            </div>

            {/* Santri Card Snapshot */}
            {selectedSantri && (
              <div className="bg-gradient-to-r from-amber-50/70 to-emerald-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{selectedSantri.name}</p>
                  <p className="text-[11px] text-slate-600">
                    NISN: {selectedSantri.nisn} • Wali: {selectedSantri.guardianName}
                  </p>
                  <p className="text-[11px] text-slate-500">{selectedSantri.dormitory}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Saldo Wadiah Berjalan</p>
                  <p className="text-base font-black text-emerald-800 font-mono-numbers">
                    {formatRupiah(selectedSantri.balance)}
                  </p>
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nominal Setoran Titipan (Rupiah)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-slate-500 text-sm">Rp</span>
                <input
                  type="number"
                  min="10000"
                  step="5000"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-11 pr-4 py-2.5 text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono-numbers"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickAmounts.map((q) => (
                  <button
                    type="button"
                    key={q}
                    onClick={() => setAmount(q)}
                    className={`px-3 py-1 text-xs rounded-lg border font-mono-numbers transition-all cursor-pointer ${
                      amount === q
                        ? 'bg-amber-600 text-white border-amber-600 font-bold'
                        : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {formatRupiah(q)}
                  </button>
                ))}
              </div>
            </div>

            {/* Kanal Setoran */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setMethod('BANK_TRANSFER_BSI')}
                  className={`p-2.5 rounded-xl border flex items-center space-x-2 text-left cursor-pointer ${
                    method === 'BANK_TRANSFER_BSI'
                      ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-600'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-semibold">Transfer BSI VA</p>
                    <p className="text-[10px] text-slate-500">Bank Syariah Indonesia</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('CASH')}
                  className={`p-2.5 rounded-xl border flex items-center space-x-2 text-left cursor-pointer ${
                    method === 'CASH'
                      ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-600'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-semibold">Tunai Bendahara</p>
                    <p className="text-[10px] text-slate-500">Langsung di Loket Pesantren</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Wali & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Orang Tua / Penyetor
                </label>
                <input
                  type="text"
                  value={guardianSenderName || selectedSantri?.guardianName || ''}
                  onChange={(e) => setGuardianSenderName(e.target.value)}
                  placeholder="Nama Ayah / Ibu / Wali"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Doa untuk Santri
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Titipan jajan bulan ini"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Sharia Akad box */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-start space-x-2.5">
              <HeartHandshake className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Kaidah Akad Wadiah Yad Dhamanah:</p>
                <p className="text-[10px] text-emerald-800 leading-relaxed mt-0.5">
                  Dana yang dititipkan adalah amanah suci dari orang tua yang dikelola oleh bendahara pesantren. Santri berhak mengambil uang jajan harian maksimal Rp 10.000 satu kali setiap harinya.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-600 hover:bg-amber-500 active:scale-95 text-white shadow-md shadow-amber-600/30 transition-all cursor-pointer"
              >
                <span>Proses Setoran Titipan {formatRupiah(amount)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Recent Deposits Column (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Riwayat Setoran Titipan Terakhir</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {recentDeposits.length} Catatan
              </span>
            </h3>

            <div className="space-y-2.5 overflow-y-auto max-h-[460px]">
              {recentDeposits.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada setoran titipan tercatat
                </div>
              ) : (
                recentDeposits.map((trx) => {
                  const s = santriList.find((item) => item.id === trx.santriId);

                  return (
                    <div
                      key={trx.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
                          <span>{trx.date}</span>
                          <span>•</span>
                          <span>{trx.time.slice(0, 5)} WIB</span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {trx.santriName}
                        </p>
                        <p className="text-[11px] text-slate-600 truncate">
                          Penyetor: {trx.guardianSenderName || 'Wali Santri'}
                        </p>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          {trx.method.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-emerald-800 font-mono-numbers">
                          +{formatRupiah(trx.amount)}
                        </p>
                        {s && (
                          <button
                            onClick={() => onViewReceipt(trx, s)}
                            className="mt-1 flex items-center space-x-1 text-[10px] text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded cursor-pointer ml-auto"
                          >
                            <Receipt className="w-3 h-3 text-slate-500" />
                            <span>Slip</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Setiap setoran otomatis tercatat ke dalam Rekening Koran dan Jurnal Umum.
          </div>
        </div>
      </div>
    </div>
  );
};
