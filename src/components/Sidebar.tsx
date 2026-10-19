import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  HandCoins, 
  Users, 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  Receipt, 
  CalendarRange, 
  BookOpen, 
  PlusCircle, 
  Wallet, 
  ShieldCheck, 
  RotateCcw,
  X,
  Scale,
  Landmark
} from 'lucide-react';
import { PesantrenProfile } from '../types/finance';
import { formatRupiah } from '../utils/accounting';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pesantrenProfile: PesantrenProfile;
  totalWadiah: number;
  santriAlreadyTakenCount: number;
  totalActiveSantri: number;
  onResetData: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pesantrenProfile,
  totalWadiah,
  santriAlreadyTakenCount,
  totalActiveSantri,
  onResetData,
  isOpenMobile,
  onCloseMobile,
}) => {
  // Loket Bendahara submenu keys: 'loket-jajan' (dashboard) and 'setor-titipan'
  const loketBendaharaTabs = ['dashboard', 'loket-jajan', 'setor-titipan'];
  const isLoketBendaharaActive = loketBendaharaTabs.includes(activeTab);

  // Financial reports submenu keys
  const financialReportTabs = ['neraca', 'rekening-koran', 'rekap-tanggal', 'jurnal'];
  const isFinancialTabActive = financialReportTabs.includes(activeTab);

  // Accordion state for both parent menus
  const [isLoketOpen, setIsLoketOpen] = useState(true);
  const [isLaporanOpen, setIsLaporanOpen] = useState(true);

  // Auto-expand if active tab changes
  useEffect(() => {
    if (isLoketBendaharaActive) {
      setIsLoketOpen(true);
    }
  }, [isLoketBendaharaActive]);

  useEffect(() => {
    if (isFinancialTabActive) {
      setIsLaporanOpen(true);
    }
  }, [isFinancialTabActive]);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  const loketSubMenuItems = [
    {
      id: 'dashboard',
      label: 'Penarikan Jajan',
      icon: HandCoins,
      desc: 'Penarikan uang jajan harian santri',
      badge: 'Rp 10k',
    },
    {
      id: 'setor-titipan',
      label: 'Setor Titipan',
      icon: PlusCircle,
      desc: 'Top up titipan orang tua',
      badge: 'Wadiah',
    },
  ];

  const laporanSubMenuItems = [
    {
      id: 'neraca',
      label: 'Neraca (Skontro & Staffel)',
      icon: Scale,
    },
    {
      id: 'rekening-koran',
      label: 'Rekening Koran',
      icon: Receipt,
    },
    {
      id: 'rekap-tanggal',
      label: 'Rekap Rentang Tanggal',
      icon: CalendarRange,
    },
    {
      id: 'jurnal',
      label: 'Jurnal Umum Syariah',
      icon: BookOpen,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-200 border-r border-emerald-950/80 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out md:translate-x-0 no-print ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Brand & Navigation */}
        <div>
          {/* Header Brand */}
          <div className="p-4 border-b border-slate-800 bg-gradient-to-b from-emerald-950 to-slate-900">
            <div className="flex items-center justify-between mb-2">
              <span className="font-arabic text-amber-300 text-xs font-semibold">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </span>
              <button
                onClick={onCloseMobile}
                className="md:hidden text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
                  <span>SantriPay Syariah</span>
                  <span className="text-[9px] uppercase font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    Wadiah
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 truncate">
                  {pesantrenProfile.name}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-220px)]">
            <p className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu Utama
            </p>

            {/* PARENT MENU 1: LOKET BENDAHARA (ACCORDION) */}
            <div>
              <button
                onClick={() => setIsLoketOpen(!isLoketOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLoketBendaharaActive
                    ? 'bg-slate-800 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Landmark className={`w-4 h-4 ${isLoketBendaharaActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>Loket Bendahara</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-400 rounded-md border border-emerald-800/60 font-mono">
                    2 Menu
                  </span>
                  {isLoketOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Sub-menu Loket Bendahara */}
              {isLoketOpen && (
                <div className="ml-3 pl-3 my-1.5 border-l-2 border-emerald-900/60 space-y-1">
                  {loketSubMenuItems.map((sub) => {
                    const Icon = sub.icon;
                    const isActive = activeTab === sub.id;

                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleNavClick(sub.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600/90 text-white font-bold shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white font-medium'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-400/90'}`} />
                          <span>{sub.label}</span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          isActive ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {sub.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Menu 2: Data Santri & Rekening */}
            <button
              onClick={() => handleNavClick('santri')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'santri'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Users className={`w-4 h-4 ${activeTab === 'santri' ? 'text-white' : 'text-emerald-400'}`} />
                <span>Data Santri & Rekening</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                activeTab === 'santri' ? 'bg-emerald-800/80 text-emerald-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {totalActiveSantri}
              </span>
            </button>

            {/* PARENT MENU 2: LAPORAN KEUANGAN (ACCORDION) */}
            <div className="pt-2">
              <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Laporan & Akuntansi
              </p>

              <button
                onClick={() => setIsLaporanOpen(!isLaporanOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isFinancialTabActive
                    ? 'bg-slate-800 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <FileText className={`w-4 h-4 ${isFinancialTabActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>Laporan Keuangan</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-400 rounded-md border border-emerald-800/60 font-mono">
                    4 Laporan
                  </span>
                  {isLaporanOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Sub-menu Laporan Keuangan */}
              {isLaporanOpen && (
                <div className="ml-3 pl-3 my-1.5 border-l-2 border-emerald-900/60 space-y-1">
                  {laporanSubMenuItems.map((sub) => {
                    const Icon = sub.icon;
                    const isActive = activeTab === sub.id;

                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleNavClick(sub.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600/90 text-white font-bold shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white font-medium'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-400/90'}`} />
                          <span>{sub.label}</span>
                        </div>
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-200"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Bottom Section: Total Wadiah Widget & Reset */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
          {/* Total Wadiah Indicator */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Total Saldo Wadiah
              </span>
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-sm font-black text-emerald-300 font-mono-numbers mt-0.5">
              {formatRupiah(totalWadiah)}
            </p>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-800/80">
              <span>Jajan Hari Ini:</span>
              <span className="font-semibold text-amber-300 font-mono-numbers">
                {santriAlreadyTakenCount}/{totalActiveSantri} Santri
              </span>
            </div>
          </div>

          {/* Reset & Rule Footer info */}
          <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Maks 1x Jajan / Hari</span>
            </span>

            <button
              onClick={onResetData}
              title="Reset data ke default simulasi"
              className="text-slate-400 hover:text-amber-400 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
