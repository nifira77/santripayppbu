import { 
  Menu, 
  Clock, 
  ShieldCheck, 
  Wallet,
  ChevronRight,
  Eye
} from 'lucide-react';
import { PesantrenProfile } from '../types/finance';
import { formatRupiah } from '../utils/accounting';

import { User } from 'firebase/auth';

interface TopHeaderProps {
  activeTab: string;
  onOpenMobileMenu: () => void;
  pesantrenProfile: PesantrenProfile;
  totalWadiah: number;
  santriAlreadyTakenCount: number;
  totalActiveSantri: number;
  currentUser: User | null;
  isCloudConnected: boolean;
  onSignInGoogle: () => void;
  onSignOut: () => void;
  onGoToLanding: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  pesantrenProfile,
  totalWadiah,
  santriAlreadyTakenCount,
  totalActiveSantri,
  currentUser,
  isCloudConnected,
  onSignInGoogle,
  onSignOut,
  onGoToLanding,
}) => {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'loket-jajan':
        return { parent: 'Loket Bendahara', title: 'Penarikan Jajan', badge: 'Maks Rp 10.000 / Hari' };
      case 'setor-titipan':
        return { parent: 'Loket Bendahara', title: 'Setor Titipan Wali', badge: 'Top Up Wadiah' };
      case 'santri':
        return { parent: 'Menu Utama', title: 'Data Santri & Rekening Wadiah', badge: `${totalActiveSantri} Santri Terdaftar` };
      case 'neraca':
        return { parent: 'Laporan Keuangan', title: 'Neraca (Skontro & Staffel)', badge: 'PSAK Syariah 101' };
      case 'rekening-koran':
        return { parent: 'Laporan Keuangan', title: 'Rekening Koran Wadiah', badge: 'Bank Statement' };
      case 'rekap-tanggal':
        return { parent: 'Laporan Keuangan', title: 'Rekap Rentang Tanggal', badge: 'Arus Kas' };
      case 'jurnal':
        return { parent: 'Laporan Keuangan', title: 'Jurnal Umum Syariah', badge: 'Double-entry' };
      case 'profil':
        return { parent: 'Pengaturan', title: 'Profil Lembaga & Logo', badge: 'Identitas Resmi' };
      default:
        return { parent: 'Loket Bendahara', title: 'Penarikan Jajan', badge: 'Syariah' };
    }
  };

  const page = getPageInfo();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      {/* Top Banner on Mobile / Micro bar */}
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white px-4 py-1.5 text-[11px] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-arabic text-amber-300 font-semibold text-xs">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-emerald-200">
            {pesantrenProfile.formalName}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-slate-300">
          {/* Cloud Sync Status Badge */}
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[10px]">
            <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-mono text-slate-200">
              {isCloudConnected ? 'Cloud Realtime Aktif' : 'Cloud Menghubungkan...'}
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-1">
            <Clock className="w-3 h-3 text-amber-300" />
            <span className="font-mono text-[10px]">{currentDate}</span>
          </div>
          <span className="hidden md:flex items-center space-x-1 text-emerald-300 font-mono text-[10px]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Maks 1x / Santri / Hari</span>
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger & Breadcrumbs */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-medium">
              <span>{page.parent}</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-700 font-bold">{page.title}</span>
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {page.title}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                {page.badge}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Total Wadiah Metric & Google Auth */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden xs:flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <div className="p-1 bg-emerald-100 text-emerald-800 rounded-lg">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                Total Titipan Wadiah
              </p>
              <p className="text-xs font-black text-slate-900 font-mono-numbers">
                {formatRupiah(totalWadiah)}
              </p>
            </div>
          </div>

          {/* Button to Parent Portal / Landing Page */}
          <button
            onClick={onGoToLanding}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
            title="Buka Portal Pemantauan Orang Tua"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Portal Wali Santri</span>
          </button>

          {/* User Profile / Google Sign-in */}
          {currentUser ? (
            <div className="flex items-center space-x-2 bg-emerald-50/70 border border-emerald-200 px-2.5 py-1 rounded-xl">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Petugas'}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-300"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold font-mono">
                  {(currentUser.displayName || currentUser.email || 'B')[0].toUpperCase()}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                  {currentUser.displayName || 'Petugas Bendahara'}
                </p>
                <p className="text-[10px] text-emerald-700 font-medium">Petugas Terautentikasi</p>
              </div>
              <button
                onClick={onSignOut}
                className="text-[11px] px-2 py-1 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer font-medium ml-1"
                title="Keluar"
              >
                Keluar
              </button>
            </div>
          ) : (
            <button
              onClick={onSignInGoogle}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 15.6 15.64 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.47 0 2.815.54 3.86 1.425l2.43-2.43C16.88 3.525 14.71 2.7 12.24 2.7 7.07 2.7 2.9 6.87 2.9 12.04s4.17 9.34 9.34 9.34c5.385 0 8.97-3.79 8.97-9.14 0-.615-.06-1.215-.17-1.8H12.24z" />
              </svg>
              <span>Login Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
