import React, { useState } from 'react';
import { 
  HandCoins, 
  Wallet, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  PlusCircle, 
  ArrowRight, 
  Search,
  Users,
  Coins,
  History,
  Info,
  Building2
} from 'lucide-react';
import { Santri, Transaction, PesantrenProfile } from '../types/finance';
import { 
  formatRupiah, 
  formatDateIndo, 
  checkDailyAllowanceEligibility, 
  getTodayDateString 
} from '../utils/accounting';

interface DashboardTellerViewProps {
  santriList: Santri[];
  transactions: Transaction[];
  pesantrenProfile: PesantrenProfile;
  totalWadiah: number;
  onOpenTellerForSantri: (santriId: string) => void;
  onOpenDeposit: () => void;
  onQuickDispense: (santriId: string) => void;
  onViewStatement: (santriId: string) => void;
}

export const DashboardTellerView: React.FC<DashboardTellerViewProps> = ({
  santriList,
  transactions,
  pesantrenProfile,
  totalWadiah,
  onOpenTellerForSantri,
  onOpenDeposit,
  onQuickDispense,
  onViewStatement,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'READY' | 'ALREADY_TAKEN'>('READY');
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = getTodayDateString();

  // Transactions today
  const todayTransactions = transactions.filter((t) => t.date === todayStr);
  const todayWithdrawals = todayTransactions.filter((t) => t.type === 'WITHDRAWAL_JAJAN');
  const todayDeposits = todayTransactions.filter((t) => t.type === 'DEPOSIT_WADIAH');

  const totalJajanToday = todayWithdrawals.reduce((sum, t) => sum + t.amount, 0);
  const totalDepositToday = todayDeposits.reduce((sum, t) => sum + t.amount, 0);

  // Compute status for all santri
  const santriStatusList = santriList.map((santri) => {
    const eligibility = checkDailyAllowanceEligibility(santri, transactions, todayStr);
    return {
      santri,
      eligibility,
    };
  });

  const readySantriCount = santriStatusList.filter((s) => s.eligibility.canWithdraw).length;
  const alreadyTakenCount = santriStatusList.filter((s) => s.eligibility.status === 'ALREADY_TAKEN').length;
  const insufficientCount = santriStatusList.filter((s) => s.eligibility.status === 'INSUFFICIENT_BALANCE').length;

  const filteredList = santriStatusList.filter(({ santri, eligibility }) => {
    const matchesSearch =
      santri.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      santri.nisn.includes(searchTerm) ||
      santri.accountNumber.includes(searchTerm) ||
      santri.dormitory.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'READY') return eligibility.canWithdraw;
    if (filterMode === 'ALREADY_TAKEN') return eligibility.status === 'ALREADY_TAKEN';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome & Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Wadiah */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              Total Saldo Titipan Wadiah
            </span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono-numbers mt-2">
            {formatRupiah(totalWadiah)}
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold">100% Dijamin</span>
            <span>(Akad Wadiah Dhamanah)</span>
          </p>
        </div>

        {/* Card 2: Pengeluaran Jajan Hari Ini */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              Jajan Dicairkan Hari Ini
            </span>
            <div className="p-2 bg-rose-100 text-rose-800 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-700 font-mono-numbers mt-2">
            {formatRupiah(totalJajanToday)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {todayWithdrawals.length} santri telah mengambil
          </p>
        </div>

        {/* Card 3: Status Kuota Hari Ini */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              Kepatuhan Kuota Jajan
            </span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <p className="text-2xl font-black text-slate-900 font-mono-numbers">
              {alreadyTakenCount}
            </p>
            <span className="text-xs text-slate-500">dari {santriList.length} santri</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(alreadyTakenCount / santriList.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Card 4: Kebijakan Pondok */}
        <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Aturan Utama Pondok</span>
            </span>
            <p className="text-sm font-bold mt-1 text-slate-100">
              Maksimal Rp 10.000 / Hari (1x)
            </p>
            <p className="text-[11px] text-slate-300 mt-1">
              Uang jajan dibatasi maksimal 1 kali sehari. Jika sudah diambil, sistem otomatis mengunci penarikan.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-emerald-300 font-mono flex items-center justify-between">
            <span>Sistem Otomatis</span>
            <span className="text-amber-300">1x / Hari</span>
          </div>
        </div>
      </div>

      {/* Main Teller Section: Quick Dispenser Santri Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Loket */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-emerald-700" />
              <span>Penarikan Jajan Harian Santri (Maks. Rp 10.000)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pencairan uang saku santri dengan pembatasan maksimal 1 kali pengambilan setiap hari.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full md:w-60">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama santri / NISN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setFilterMode('READY')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterMode === 'READY'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Belum Ambil ({readySantriCount})
              </button>
              <button
                onClick={() => setFilterMode('ALREADY_TAKEN')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterMode === 'ALREADY_TAKEN'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sudah Ambil ({alreadyTakenCount})
              </button>
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterMode === 'ALL'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({santriList.length})
              </button>
            </div>
          </div>
        </div>

        {/* Santri Cards Grid */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs">
              Tidak ada data santri yang cocok dengan filter yang dipilih
            </div>
          ) : (
            filteredList.map(({ santri, eligibility }) => {
              const isEligible = eligibility.canWithdraw;
              const isTaken = eligibility.status === 'ALREADY_TAKEN';
              const isLowBalance = eligibility.status === 'INSUFFICIENT_BALANCE';

              return (
                <div
                  key={santri.id}
                  className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all ${
                    isTaken
                      ? 'bg-slate-50/70 border-slate-200 opacity-90'
                      : isLowBalance
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Top Row: Avatar & Status Badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                            santri.gender === 'L'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {santri.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">
                            {santri.name}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {santri.accountNumber} • {santri.dormitory.split(' - ')[0]}
                          </p>
                        </div>
                      </div>

                      {/* Status Tag */}
                      {isTaken ? (
                        <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                          <Lock className="w-3 h-3" />
                          <span>Sudah 1x</span>
                        </span>
                      ) : isLowBalance ? (
                        <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Saldo Habis</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Siap 10rb</span>
                        </span>
                      )}
                    </div>

                    {/* Balance & Details */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                          Saldo Titipan Wadiah
                        </p>
                        <p className="text-base font-black text-emerald-800 font-mono-numbers">
                          {formatRupiah(santri.balance)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-slate-400">Wali Santri</p>
                        <p className="font-medium text-slate-700 text-[11px] truncate max-w-[130px]">
                          {santri.guardianName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2">
                    {isEligible ? (
                      <button
                        onClick={() => onQuickDispense(santri.id)}
                        className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        <HandCoins className="w-4 h-4" />
                        <span>Cairkan Rp 10.000</span>
                      </button>
                    ) : isTaken ? (
                      <div className="flex-1 py-2 px-3 bg-slate-100 rounded-xl text-center text-slate-500 font-medium text-[11px] flex items-center justify-center space-x-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Terkunci: Diambil {eligibility.todayWithdrawal?.time.slice(0, 5)} WIB</span>
                      </div>
                    ) : (
                      <div className="flex-1 py-2 px-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-amber-900 font-semibold text-[11px] flex items-center justify-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Saldo Habis (Perlu Setor Wali)</span>
                      </div>
                    )}

                    {/* Button Details / Rekening Koran */}
                    <button
                      onClick={() => onViewStatement(santri.id)}
                      title="Lihat Rekening Koran"
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sharia Educational & Governance Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Konstruksi Fiqih Muamalah: Akad Wadiah Yad Dhamanah</span>
                <span className="font-arabic text-amber-300 text-xs">وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ</span>
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
                Uang yang disetorkan orang tua/wali santri merupakan titipan murni kepada bendahara pesantren. Pesantren menjamin keutuhan nominal titipan santri. Kebijakan pembatasan jajan <strong>maksimal Rp 10.000 dan hanya 1 kali sehari</strong> diterapkan secara terotomasi untuk menanamkan kedisiplinan hidup hemat, menjaga kesehatan santri, serta ketenangan orang tua di rumah.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
