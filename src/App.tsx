import React, { useState, useEffect } from 'react';
import { 
  Santri, 
  Transaction, 
  PesantrenProfile, 
  PaymentMethod 
} from './types/finance';
import { 
  initialSantriList, 
  initialTransactions, 
  defaultPesantrenProfile 
} from './data/initialData';
import { 
  checkDailyAllowanceEligibility, 
  getTodayDateString, 
  getCurrentTimeString 
} from './utils/accounting';

import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardTellerView } from './components/DashboardTellerView';
import { SetorTitipanView } from './components/SetorTitipanView';
import { NeracaView } from './components/NeracaView';
import { RekeningKoranView } from './components/RekeningKoranView';
import { LaporanRekapView } from './components/LaporanRekapView';
import { SantriManagementView } from './components/SantriManagementView';
import { JurnalUmumView } from './components/JurnalUmumView';
import { QuickTellerModal } from './components/QuickTellerModal';
import { DepositModal } from './components/DepositModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ShieldCheck, RotateCcw } from 'lucide-react';

const STORAGE_KEY_SANTRI = 'santripay_santri_v1';
const STORAGE_KEY_TRX = 'santripay_transactions_v1';

export default function App() {
  // Load state from localStorage or initial seeds
  const [santriList, setSantriList] = useState<Santri[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SANTRI);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load santri data from storage', e);
    }
    return initialSantriList;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRX);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load transactions data from storage', e);
    }
    return initialTransactions;
  });

  const [pesantrenProfile] = useState<PesantrenProfile>(defaultPesantrenProfile);
  // Default to 'dashboard' which is Loket Jajan (Rp 10.000)
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  // Modals state (triggered when needed)
  const [isTellerModalOpen, setIsTellerModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  
  // Selected santri for modals or views
  const [selectedSantriId, setSelectedSantriId] = useState<string>(santriList[0]?.id || '');

  // Receipt popup state
  const [receiptTrx, setReceiptTrx] = useState<Transaction | null>(null);
  const [receiptSantri, setReceiptSantri] = useState<Santri | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SANTRI, JSON.stringify(santriList));
    } catch (e) {
      console.error('Error saving santri data', e);
    }
  }, [santriList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRX, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions data', e);
    }
  }, [transactions]);

  // Derived metrics
  const totalWadiah = santriList.reduce((acc, curr) => acc + curr.balance, 0);
  const todayStr = getTodayDateString();
  const santriAlreadyTakenCount = santriList.filter((s) => {
    const el = checkDailyAllowanceEligibility(s, transactions, todayStr);
    return el.status === 'ALREADY_TAKEN';
  }).length;

  // Process Withdrawal (Jajan 10.000 max, 1x a day)
  const handleProcessWithdrawal = (santriId: string, amount: number, notes: string) => {
    const santri = santriList.find((s) => s.id === santriId);
    if (!santri) return;

    // Strict validation
    const eligibility = checkDailyAllowanceEligibility(santri, transactions, todayStr);
    if (!eligibility.canWithdraw) {
      alert(`Pencairan Ditolak: ${eligibility.reason}`);
      return;
    }

    const withdrawAmount = Math.min(amount, eligibility.maxAllowed, santri.dailyAllowanceLimit || 10000);
    const balanceBefore = santri.balance;
    const balanceAfter = balanceBefore - withdrawAmount;

    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      transactionNo: `TRX-JJN-${todayStr.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      date: todayStr,
      time: getCurrentTimeString(),
      santriId: santri.id,
      santriName: santri.name,
      accountNumber: santri.accountNumber,
      type: 'WITHDRAWAL_JAJAN',
      amount: withdrawAmount,
      balanceBefore,
      balanceAfter,
      method: 'CASH',
      tellerName: 'Ust. M. Ridwan (Teller Loket)',
      notes: notes || 'Uang Jajan Harian (Batas Rp 10.000 / Hari)',
      category: 'Uang Jajan Harian',
    };

    // Update santri balance
    setSantriList((prev) =>
      prev.map((s) => (s.id === santriId ? { ...s, balance: balanceAfter } : s))
    );

    // Append transaction
    setTransactions((prev) => [newTrx, ...prev]);

    // Close teller modal and show receipt
    setIsTellerModalOpen(false);
    setReceiptTrx(newTrx);
    setReceiptSantri({ ...santri, balance: balanceAfter });
  };

  // Quick dispense from cards (1 click)
  const handleQuickDispense = (santriId: string) => {
    handleProcessWithdrawal(santriId, 10000, 'Pencairan Jajan Harian');
  };

  // Process Deposit (Top Up Titipan Orang Tua)
  const handleProcessDeposit = (
    santriId: string,
    amount: number,
    method: PaymentMethod,
    guardianName: string,
    notes: string
  ) => {
    const santri = santriList.find((s) => s.id === santriId);
    if (!santri || amount <= 0) return;

    const balanceBefore = santri.balance;
    const balanceAfter = balanceBefore + amount;

    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      transactionNo: `TRX-WDH-${todayStr.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      date: todayStr,
      time: getCurrentTimeString(),
      santriId: santri.id,
      santriName: santri.name,
      accountNumber: santri.accountNumber,
      type: 'DEPOSIT_WADIAH',
      amount,
      balanceBefore,
      balanceAfter,
      method,
      tellerName: method.includes('BANK') ? 'Sistem Otomatis (BSI VA)' : 'Ust. H. Ahmad Fauzi (Kasir Loket)',
      guardianSenderName: guardianName || santri.guardianName,
      notes: notes || 'Setoran Titipan Uang Saku Santri',
      category: 'Setoran Titipan Wali',
    };

    setSantriList((prev) =>
      prev.map((s) => (s.id === santriId ? { ...s, balance: balanceAfter } : s))
    );

    setTransactions((prev) => [newTrx, ...prev]);

    setIsDepositModalOpen(false);
    setReceiptTrx(newTrx);
    setReceiptSantri({ ...santri, balance: balanceAfter });
  };

  // Add Santri Handler
  const handleAddSantri = (
    newSantriData: Omit<Santri, 'id' | 'accountNumber' | 'createdAt'>,
    initialDeposit: number
  ) => {
    const nextIndex = santriList.length + 1;
    const id = `snt-${String(nextIndex).padStart(3, '0')}`;
    const accountNumber = `501.2024.${String(nextIndex).padStart(3, '0')}`;

    const newSantri: Santri = {
      ...newSantriData,
      id,
      accountNumber,
      balance: initialDeposit > 0 ? initialDeposit : 0,
      createdAt: todayStr,
    };

    setSantriList((prev) => [...prev, newSantri]);

    if (initialDeposit > 0) {
      const depositTrx: Transaction = {
        id: `trx-${Date.now()}`,
        transactionNo: `TRX-WDH-${todayStr.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
        date: todayStr,
        time: getCurrentTimeString(),
        santriId: newSantri.id,
        santriName: newSantri.name,
        accountNumber: newSantri.accountNumber,
        type: 'DEPOSIT_WADIAH',
        amount: initialDeposit,
        balanceBefore: 0,
        balanceAfter: initialDeposit,
        method: 'CASH',
        tellerName: 'Ust. H. Ahmad Fauzi (Kasir Loket)',
        guardianSenderName: newSantri.guardianName,
        notes: 'Setoran Awal Buka Rekening Wadiah Santri',
        category: 'Setoran Titipan Wali',
      };
      setTransactions((prev) => [depositTrx, ...prev]);
    }
  };

  // Reset to initial seeds
  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang data ke simulasi awal? Semua transaksi baru akan dikembalikan ke data default.')) {
      localStorage.removeItem(STORAGE_KEY_SANTRI);
      localStorage.removeItem(STORAGE_KEY_TRX);
      setSantriList(initialSantriList);
      setTransactions(initialTransactions);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex font-sans">
      {/* Sidebar: Loket Bendahara with sub-menus & Laporan Keuangan with sub-menus */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pesantrenProfile={pesantrenProfile}
        totalWadiah={totalWadiah}
        santriAlreadyTakenCount={santriAlreadyTakenCount}
        totalActiveSantri={santriList.length}
        onResetData={handleResetData}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Content Area (Offset by Sidebar width on desktop md:pl-72) */}
      <div className="flex-1 md:pl-72 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Navigation Bar */}
        <TopHeader
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          pesantrenProfile={pesantrenProfile}
          totalWadiah={totalWadiah}
          santriAlreadyTakenCount={santriAlreadyTakenCount}
          totalActiveSantri={santriList.length}
        />

        {/* View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* LOKET BENDAHARA - Sub-menu 1: Loket Jajan (Rp 10.000) */}
          {(activeTab === 'dashboard' || activeTab === 'loket-jajan') && (
            <DashboardTellerView
              santriList={santriList}
              transactions={transactions}
              pesantrenProfile={pesantrenProfile}
              totalWadiah={totalWadiah}
              onOpenTellerForSantri={(id) => {
                setSelectedSantriId(id);
                setIsTellerModalOpen(true);
              }}
              onOpenDeposit={() => setActiveTab('setor-titipan')}
              onQuickDispense={handleQuickDispense}
              onViewStatement={(id) => {
                setSelectedSantriId(id);
                setActiveTab('rekening-koran');
              }}
            />
          )}

          {/* LOKET BENDAHARA - Sub-menu 2: Setor Titipan */}
          {activeTab === 'setor-titipan' && (
            <SetorTitipanView
              santriList={santriList}
              transactions={transactions}
              pesantrenProfile={pesantrenProfile}
              onProcessDeposit={handleProcessDeposit}
              onViewReceipt={(trx, santri) => {
                setReceiptTrx(trx);
                setReceiptSantri(santri);
              }}
            />
          )}

          {/* MENU UTAMA: Data Santri & Rekening */}
          {activeTab === 'santri' && (
            <SantriManagementView
              santriList={santriList}
              transactions={transactions}
              pesantrenProfile={pesantrenProfile}
              onAddSantri={handleAddSantri}
              onOpenTellerForSantri={(id) => {
                setSelectedSantriId(id);
                setIsTellerModalOpen(true);
              }}
              onOpenDepositForSantri={(id) => {
                setSelectedSantriId(id);
                setActiveTab('setor-titipan');
              }}
              onViewStatementForSantri={(id) => {
                setSelectedSantriId(id);
                setActiveTab('rekening-koran');
              }}
            />
          )}

          {/* LAPORAN KEUANGAN - Sub-menu 1: Neraca (Skontro & Staffel) */}
          {activeTab === 'neraca' && (
            <NeracaView
              santriList={santriList}
              transactions={transactions}
              pesantrenProfile={pesantrenProfile}
            />
          )}

          {/* LAPORAN KEUANGAN - Sub-menu 2: Rekening Koran */}
          {activeTab === 'rekening-koran' && (
            <RekeningKoranView
              santriList={santriList}
              transactions={transactions}
              pesantrenProfile={pesantrenProfile}
            />
          )}

          {/* LAPORAN KEUANGAN - Sub-menu 3: Rekap Rentang Tanggal */}
          {activeTab === 'rekap-tanggal' && (
            <LaporanRekapView
              transactions={transactions}
              santriList={santriList}
              pesantrenProfile={pesantrenProfile}
            />
          )}

          {/* LAPORAN KEUANGAN - Sub-menu 4: Jurnal Umum Syariah */}
          {activeTab === 'jurnal' && (
            <JurnalUmumView
              transactions={transactions}
              pesantrenProfile={pesantrenProfile}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 text-xs py-5 px-6 border-t border-slate-800 no-print mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <p>
                <strong>{pesantrenProfile.formalName}</strong> • Rekening Wadiah Titipan Santri
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-slate-500 hidden sm:inline">
                Kaidah Disiplin: Maksimal Jajan Rp 10.000 / Hari (1x Penarikan)
              </span>
              <button
                onClick={handleResetData}
                className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] transition-colors cursor-pointer border border-slate-700"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals for Quick Actions if invoked from santri row */}
      <QuickTellerModal
        isOpen={isTellerModalOpen}
        onClose={() => setIsTellerModalOpen(false)}
        santriList={santriList}
        transactions={transactions}
        pesantrenProfile={pesantrenProfile}
        onProcessWithdrawal={handleProcessWithdrawal}
      />

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        santriList={santriList}
        onProcessDeposit={handleProcessDeposit}
      />

      {receiptTrx && receiptSantri && (
        <ReceiptModal
          transaction={receiptTrx}
          santri={receiptSantri}
          pesantrenProfile={pesantrenProfile}
          onClose={() => {
            setReceiptTrx(null);
            setReceiptSantri(null);
          }}
        />
      )}
    </div>
  );
}
