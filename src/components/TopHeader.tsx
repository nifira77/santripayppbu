import React from 'react';
import { 
  Menu, 
  Clock, 
  ShieldCheck, 
  Wallet,
  ChevronRight
} from 'lucide-react';
import { PesantrenProfile } from '../types/finance';
import { formatRupiah } from '../utils/accounting';

interface TopHeaderProps {
  activeTab: string;
  onOpenMobileMenu: () => void;
  pesantrenProfile: PesantrenProfile;
  totalWadiah: number;
  santriAlreadyTakenCount: number;
  totalActiveSantri: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  pesantrenProfile,
  totalWadiah,
  santriAlreadyTakenCount,
  totalActiveSantri,
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
      default:
        return { parent: 'Loket Bendahara', title: 'Loket Jajan (Rp 10.000)', badge: 'Syariah' };
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
          <div className="flex items-center space-x-1">
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
      <div className="px-4 py-3 flex items-center justify-between gap-4">
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

        {/* Right: Total Wadiah Metric & Status Info (No action buttons cluttering the screen) */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl">
            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Total Titipan Wadiah
              </p>
              <p className="text-xs font-black text-slate-900 font-mono-numbers">
                {formatRupiah(totalWadiah)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
