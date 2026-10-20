import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  ShieldCheck, 
  Wallet, 
  HandCoins, 
  Calendar, 
  Clock, 
  UserCheck, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Printer, 
  Receipt,
  Landmark,
  KeyRound,
  LogIn,
  LogOut,
  Sparkles,
  Mail
} from 'lucide-react';
import { Santri, Transaction, PesantrenProfile, AuthUser } from '../types/finance';
import { 
  formatRupiah, 
  formatDateIndo, 
  checkDailyAllowanceEligibility,
  getTodayDateString 
} from '../utils/accounting';
import { User } from 'firebase/auth';

interface LandingPageProps {
  santriList: Santri[];
  transactions: Transaction[];
  pesantrenProfile: PesantrenProfile;
  currentUser: AuthUser | User | null;
  isCloudConnected: boolean;
  onSignInGoogle: () => void;
  onSignOut: () => void;
  onEnterDashboard: () => void;
  onLoginBendahara?: (user: AuthUser) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  santriList,
  transactions,
  pesantrenProfile,
  currentUser,
  isCloudConnected,
  onSignInGoogle,
  onSignOut,
  onEnterDashboard,
  onLoginBendahara,
}) => {
  // Login form state for Bendahara: username and password as requested
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);

  // Single unified search field for parents as requested: "ketik nama / No rekening / NIS / NISN"
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected student for detailed parent view
  const [selectedSantriId, setSelectedSantriId] = useState<string>('');

  const todayStr = getTodayDateString();

  // Check if parent has typed in the search field
  // Requirement: "tidak perlu ditampilkan nama seluruh santri, nama disini hanya muncul ketika diketik manual"
  const hasSearchQuery = Boolean(searchQuery.trim().length > 0);

  // Filter students based on single search query matching Name OR Account Number OR NIS/NISN
  const filteredSantri = useMemo(() => {
    if (!hasSearchQuery) return [];
    const q = searchQuery.trim().toLowerCase();

    return santriList.filter((s) => {
      const matchName = s.name.toLowerCase().includes(q);
      const matchAcc = s.accountNumber.toLowerCase().includes(q);
      const matchNis = s.nisn.toLowerCase().includes(q);
      return matchName || matchAcc || matchNis;
    });
  }, [santriList, searchQuery, hasSearchQuery]);

  // The active student being monitored: only when search query is active and matches exist
  const activeSantri = useMemo(() => {
    if (!hasSearchQuery || filteredSantri.length === 0) return null;
    if (selectedSantriId) {
      const found = filteredSantri.find((s) => s.id === selectedSantriId);
      if (found) return found;
    }
    return filteredSantri[0] || null;
  }, [hasSearchQuery, selectedSantriId, filteredSantri]);

  // Filter student transactions:
  // CRITICAL REQUIREMENT: "dana titipan tidak perlu ditampilkan", only show withdrawals/jajan and latest balance!
  const santriWithdrawals = useMemo(() => {
    if (!activeSantri) return [];
    return transactions
      .filter((t) => t.santriId === activeSantri.id && t.type === 'WITHDRAWAL_JAJAN')
      .sort((a, b) => {
        const dateComp = b.date.localeCompare(a.date);
        if (dateComp !== 0) return dateComp;
        return (b.time || '').localeCompare(a.time || '');
      });
  }, [activeSantri, transactions]);

  // Today's allowance status for this child
  const dailyStatus = useMemo(() => {
    if (!activeSantri) return null;
    return checkDailyAllowanceEligibility(activeSantri, transactions, todayStr);
  }, [activeSantri, transactions, todayStr]);

  const handleSelectSantri = (santri: Santri) => {
    setSelectedSantriId(santri.id);
  };

  const handlePrintStatement = () => {
    window.print();
  };

  // Login submission handler as requested: username: bendahara@gmail.com, password: bendahara
  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanUser = loginUsername.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (cleanUser === 'bendahara@gmail.com' && cleanPass === 'bendahara') {
      setLoginSuccess(true);
      const bendaharaUser: AuthUser = {
        uid: 'bendahara-local-admin',
        email: 'bendahara@gmail.com',
        displayName: pesantrenProfile.headOfTreasury || 'Bendahara Pesantren',
        photoURL: null,
      };
      setTimeout(() => {
        if (onLoginBendahara) {
          onLoginBendahara(bendaharaUser);
        } else {
          onEnterDashboard();
        }
      }, 350);
    } else {
      setLoginError('Username atau password salah! Gunakan username: bendahara@gmail.com dan password: bendahara');
    }
  };

  const handleAutoFill = () => {
    setLoginUsername('bendahara@gmail.com');
    setLoginPassword('bendahara');
    setLoginError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            {pesantrenProfile.logoUrl ? (
              <img
                src={pesantrenProfile.logoUrl}
                alt={pesantrenProfile.name}
                className="w-10 h-10 object-contain rounded-xl bg-white p-1 border border-slate-700 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                <Landmark className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  SantriPay Syariah
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Wadiah Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-md">
                {pesantrenProfile.formalName}
              </p>
            </div>
          </div>

          {/* Right Status & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Realtime cloud status */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs">
              <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 text-[11px] font-mono">
                {isCloudConnected ? 'Cloud Realtime Aktif' : 'Menghubungkan...'}
              </span>
            </div>

            {/* Quick Go to Dashboard Button */}
            <button
              onClick={onEnterDashboard}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/40 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Dashboard Petugas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Welcome Banner */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 py-6 sm:py-8 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistem Kas Titipan Wadiah & Kontrol Uang Jajan Harian Santri</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Transparansi Uang Jajan Santri & Loket Kasir Syariah
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
            Orang tua dapat memantau penarikan jajan dan sisa saldo anak secara mandiri (Mode Baca). 
            Pengurus mengelola kasir loket dengan batasan disiplin maksimal Rp 10.000 / hari.
          </p>
        </div>
      </section>

      {/* Main Dual Grid: Left Side (Portal Orang Tua Read-Only) & Right Side (Portal Login Bendahara) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ======================================================== */}
          {/* SISI KIRI: PORTAL ORANG TUA (MODE READ-ONLY) (7 COLS) */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-slate-700/80 shadow-xl space-y-5">
              
              {/* Header Box: Mode Read-Only */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700/80 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Eye className="w-4 h-4" />
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-white">
                      Portal Pemantauan Orang Tua / Wali
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400">
                    Pantau arus penarikan uang jajan dan saldo titipan anak Anda di pesantren
                  </p>
                </div>

                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-950/80 text-sky-300 border border-sky-800 text-xs font-semibold self-start sm:self-auto">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Mode Read-Only (Hanya Baca)</span>
                </div>
              </div>

              {/* 1 Field Pencarian Santri (Tanpa Header Field) */}
              <div className="bg-slate-900/90 rounded-2xl p-3 sm:p-4 border border-slate-700/80 space-y-3 shadow-inner">
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                    <Search className="w-5 h-5 text-emerald-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ketik nama / No rekening / NIS / NISN"
                    className="w-full pl-11 pr-24 py-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedSantriId('');
                      }}
                      className="absolute right-3 px-2.5 py-1 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-slate-700/70 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Quick Selection Dropdown / Chips - HANYA muncul jika orang tua telah mengetik di salah satu field */}
                {hasSearchQuery && (
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    {filteredSantri.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Pilih santri yang ditemukan ({filteredSantri.length}):</span>
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {filteredSantri.length === 1 ? '1 Santri cocok' : 'Klik untuk memilih santri'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                          {filteredSantri.map((s) => {
                            const isSelected = activeSantri?.id === s.id;
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => handleSelectSantri(s)}
                                className={`px-3 py-2 rounded-xl text-left transition-all cursor-pointer border ${
                                  isSelected
                                    ? 'bg-emerald-600/30 border-emerald-500 text-white ring-1 ring-emerald-500 shadow-md'
                                    : 'bg-slate-800/90 hover:bg-slate-750 text-slate-300 border-slate-700 hover:border-slate-600 hover:text-white'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-xs truncate text-white">{s.name}</span>
                                  {isSelected && (
                                    <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">
                                      Terpilih
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1 font-mono">
                                  <span>NIS: <strong className="text-slate-300">{s.nisn}</strong></span>
                                  <span>•</span>
                                  <span>Rek: <strong className="text-emerald-300">{s.accountNumber}</strong></span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="py-2.5 px-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center space-x-2 text-amber-300 text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Tidak ditemukan santri dengan kriteria tersebut. Mohon periksa kembali ejaan Nama, No. Rekening, atau NIS.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Santri Card & Balance Overview */}
              {activeSantri ? (
                <div className="space-y-4">
                  {/* Santri Bio Card */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-850 rounded-xl p-4 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-lg font-mono">
                        {activeSantri.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-black text-white">
                            {activeSantri.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {activeSantri.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                          <span>NIS: <strong className="text-slate-200 font-mono">{activeSantri.nisn}</strong></span>
                          <span>•</span>
                          <span>No. Rek: <strong className="text-emerald-300 font-mono">{activeSantri.accountNumber}</strong></span>
                          <span>•</span>
                          <span>{activeSantri.dormitory}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Wali: {activeSantri.guardianName}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handlePrintStatement}
                      className="no-print self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Bukti</span>
                    </button>
                  </div>

                  {/* Highlight: Saldo Terakhir Santri & Status Hari Ini */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Saldo Terakhir Card */}
                    <div className="bg-gradient-to-br from-emerald-950/80 to-slate-900 rounded-xl p-4 border border-emerald-800/60 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                          Saldo Terakhir Santri
                        </span>
                        <Wallet className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono-numbers mt-2">
                        {formatRupiah(activeSantri.balance)}
                      </p>
                      <p className="text-[11px] text-emerald-200/80 mt-1">
                        Sisa saldo uang jajan yang siap dicairkan santri di loket
                      </p>
                    </div>

                    {/* Status Penarikan Hari Ini */}
                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-700/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Status Jajan Hari Ini
                        </span>
                        <Clock className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="mt-2">
                        {dailyStatus?.status === 'ALREADY_TAKEN' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Sudah Mengambil Jajan Hari Ini</span>
                            </span>
                            <p className="text-[11px] text-slate-400">
                              Batas disiplin 1x sehari (Rp 10.000) terpenuhi. Dapat mengambil kembali besok.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Belum Mengambil Jajan Hari Ini</span>
                            </span>
                            <p className="text-[11px] text-slate-400">
                              Santri berhak mencairkan jajan maksimal Rp 10.000 di loket kasir.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tabel Riwayat Penarikan Jajan Santri */}
                  {/* CRITICAL NOTE: "dana titipan tidak perlu ditampilkan" -> Only show WITHDRAWAL_JAJAN */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Receipt className="w-4 h-4 text-rose-400" />
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          Riwayat Penarikan Uang Jajan
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 italic">
                        *Dana titipan wali disembunyikan sesuai pengaturan
                      </span>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900/60">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                            <tr>
                              <th className="py-2.5 px-3 font-semibold">Tanggal & Waktu</th>
                              <th className="py-2.5 px-3 font-semibold">No. Transaksi</th>
                              <th className="py-2.5 px-3 font-semibold text-right">Jumlah Penarikan</th>
                              <th className="py-2.5 px-3 font-semibold text-right">Saldo Terakhir</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 text-slate-200">
                            {santriWithdrawals.length > 0 ? (
                              santriWithdrawals.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                                  <td className="py-2.5 px-3">
                                    <div className="font-semibold text-white">
                                      {formatDateIndo(t.date)}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono">
                                      {t.time || 'Waktu loket'}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="font-mono text-[11px] text-slate-300">
                                      {t.transactionNo}
                                    </span>
                                    <div className="text-[10px] text-slate-500">
                                      {t.notes || 'Penarikan Jajan Harian'}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <span className="font-black text-rose-400 font-mono-numbers">
                                      - {formatRupiah(t.amount)}
                                    </span>
                                    <div className="text-[9px] text-rose-400/80">Jajan Harian</div>
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <span className="font-bold text-emerald-300 font-mono-numbers">
                                      {formatRupiah(t.balanceAfter)}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="py-6 text-center text-slate-500 text-xs">
                                  Belum ada riwayat penarikan jajan untuk santri ini.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                </div>
              ) : hasSearchQuery ? (
                <div className="p-8 text-center bg-slate-900/90 rounded-2xl border border-slate-700/80 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">
                      Santri Tidak Ditemukan
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Tidak ada santri yang sesuai dengan kriteria yang dimasukkan. Pastikan ejaan Nama, No. Rekening, atau NIS sudah benar.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSantriId('');
                    }}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                  >
                    Reset & Coba Lagi
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-700/80 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">
                      Cari Data Santri / Anak Anda
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Silakan ketik <strong className="text-emerald-400">nama / No rekening / NIS / NISN</strong> pada kolom pencarian di atas untuk memantau saldo dan riwayat uang jajan santri.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap justify-center items-center gap-2 text-[11px] text-slate-400">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-sky-400" />
                      <span>Mode Read-Only (Aman & Privat)</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Terhubung Cloud Realtime</span>
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ======================================================== */}
          {/* SISI KANAN: PORTAL LOGIN PENGURUS & BENDAHARA (5 COLS) */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-b from-slate-800/90 to-slate-850/90 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-slate-700/80 shadow-2xl space-y-6">
              
              {/* Header Box */}
              <div className="space-y-1 pb-4 border-b border-slate-700/80">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold tracking-wider uppercase">
                  <span>🏛️ Back-Office Pesantren</span>
                </div>
                <h2 className="text-lg font-black text-white">
                  Akses Pengurus & Bendahara
                </h2>
                <p className="text-xs text-slate-400">
                  Masuk ke dashboard pembukuan syariah, kasir loket santri, dan laporan keuangan
                </p>
              </div>

              {/* Login State / Google Button */}
              {currentUser ? (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 space-y-4">
                  <div className="flex items-center space-x-3">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'Petugas'}
                        className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-lg font-mono">
                        {(currentUser.displayName || currentUser.email || 'B')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-300">
                          Terautentikasi Resmi
                        </span>
                      </div>
                      <p className="text-sm font-black text-white truncate">
                        {currentUser.displayName || 'Bendahara Pesantren'}
                      </p>
                      <p className="text-xs text-slate-300 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={onEnterDashboard}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>Buka Dashboard Bendahara</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onSignOut}
                      className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar dari Akun</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormLogin} className="space-y-4">
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span>Form Login Kredensial Bendahara</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoFill}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                        title="Klik untuk mengisi username & password otomatis"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Isi Cepat</span>
                      </button>
                    </div>

                    {/* Field 1: Username / Email */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-300">
                        Username
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                          <Mail className="w-4 h-4 text-emerald-400" />
                        </div>
                        <input
                          type="text"
                          value={loginUsername}
                          onChange={(e) => {
                            setLoginUsername(e.target.value);
                            if (loginError) setLoginError('');
                          }}
                          placeholder="bendahara@gmail.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-medium transition-all"
                          autoComplete="username"
                          required
                        />
                      </div>
                    </div>

                    {/* Field 2: Password */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-300">
                        Password
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                          <KeyRound className="w-4 h-4 text-amber-400" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            if (loginError) setLoginError('');
                          }}
                          placeholder="Masukkan password bendahara..."
                          className="w-full pl-9 pr-10 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-medium transition-all"
                          autoComplete="current-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Error Box */}
                    {loginError && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2 text-rose-300 text-xs">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-semibold">{loginError}</p>
                        </div>
                      </div>
                    )}

                    {/* Success Box */}
                    {loginSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-300 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-bold">Login Berhasil! Membuka Dashboard Bendahara...</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loginSuccess}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center space-x-2 cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Masuk sebagai Bendahara</span>
                    </button>

                    {/* Info Kredensial Akses */}
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Kredensial Akses:</span>
                        <div className="font-mono text-[11px] text-slate-300">
                          Username: <strong className="text-emerald-400 font-semibold">bendahara@gmail.com</strong>
                          <br />
                          Password: <strong className="text-amber-400 font-semibold">bendahara</strong>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoFill}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-650 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer shrink-0 border border-slate-600"
                      >
                        Isi Otomatis
                      </button>
                    </div>
                  </div>

                  {/* Option: Login with Google */}
                  <div className="pt-1">
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-800"></div>
                      <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Atau masuk dengan</span>
                      <div className="flex-grow border-t border-slate-800"></div>
                    </div>
                    <button
                      type="button"
                      onClick={onSignInGoogle}
                      className="w-full mt-2 py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>Login dengan Akun Google</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Sharia Principles & Feature Highlights */}
              <div className="pt-4 border-t border-slate-700/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Fitur Inti Aplikasi Keuangan
                </h4>

                <div className="space-y-2">
                  <div className="flex items-start space-x-2 text-xs text-slate-300">
                    <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                      <HandCoins className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-white">Loket Jajan Rp 10.000 / Hari:</strong>
                      <p className="text-[11px] text-slate-400">
                        Disiplin santri dengan limitasi otomatis maksimal 1 kali penarikan per hari.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 text-xs text-slate-300">
                    <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-white">Akad Wadiah Yad Dhamanah:</strong>
                      <p className="text-[11px] text-slate-400">
                        Dana titipan orang tua 100% hak santri, dijamin aman dan utuh oleh bendahara.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 text-xs text-slate-300">
                    <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                      <Receipt className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-white">Neraca & Rekening Koran:</strong>
                      <p className="text-[11px] text-slate-400">
                        Laporan neraca bentuk Skontro & Staffel, Rekap Tanggal, dan Jurnal Umum.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-emerald-500" />
            <p className="text-slate-400">
              <strong>{pesantrenProfile.formalName}</strong> • {pesantrenProfile.address}
            </p>
          </div>
          <p className="text-[11px] text-slate-500">
            Sistem Informasi Keuangan Pesantren Syariah & Kas Titipan Santri
          </p>
        </div>
      </footer>
    </div>
  );
};
