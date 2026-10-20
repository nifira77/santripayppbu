import React, { useState, useEffect } from 'react';
import { 
  Santri, 
  Transaction, 
  PesantrenProfile, 
  PaymentMethod,
  AuthUser
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
import {
  auth,
  signInWithGoogle,
  logOut,
  testConnection,
  subscribeToSantri,
  subscribeToTransactions,
  subscribeToProfile,
  saveSantriToCloud,
  deleteSantriFromCloud,
  updateSantriBalanceInCloud,
  saveTransactionToCloud,
  saveProfileToCloud,
  seedInitialDataToCloud
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardTellerView } from './components/DashboardTellerView';
import { SetorTitipanView } from './components/SetorTitipanView';
import { NeracaView } from './components/NeracaView';
import { RekeningKoranView } from './components/RekeningKoranView';
import { LaporanRekapView } from './components/LaporanRekapView';
import { SantriManagementView } from './components/SantriManagementView';
import { JurnalUmumView } from './components/JurnalUmumView';
import { ProfilPesantrenView } from './components/ProfilPesantrenView';
import { LandingPage } from './components/LandingPage';
import { QuickTellerModal } from './components/QuickTellerModal';
import { DepositModal } from './components/DepositModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ShieldCheck, RotateCcw } from 'lucide-react';

const STORAGE_KEY_SANTRI = 'santripay_santri_v1';
const STORAGE_KEY_TRX = 'santripay_transactions_v1';
const STORAGE_KEY_PROFILE = 'santripay_profile_v1';
const STORAGE_KEY_AUTH = 'santripay_auth_bendahara_v1';

export default function App() {
  // Authentication & Cloud Realtime State
  const [currentUser, setCurrentUser] = useState<AuthUser | User | null>(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
      if (savedAuth) return JSON.parse(savedAuth);
    } catch (e) {
      console.error('Failed to parse saved auth', e);
    }
    return null;
  });
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(() => {
    return Boolean(localStorage.getItem(STORAGE_KEY_AUTH));
  });

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

  const [pesantrenProfile, setPesantrenProfile] = useState<PesantrenProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load profile from storage', e);
    }
    return defaultPesantrenProfile;
  });

  // View mode: 'landing' (Portal Orang Tua + Login Bendahara) or 'dashboard' (Back-office Bendahara)
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('landing');

  // Default to 'dashboard' which is Penarikan Jajan (Rp 10.000)
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

  // Initialize Firebase connection & Auth listener
  useEffect(() => {
    testConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsCloudConnected(true);
        // Seed initial data to cloud if collections are empty
        seedInitialDataToCloud(santriList, transactions, pesantrenProfile);
      } else {
        // If not Firebase Google user, check if local Bendahara auth exists
        try {
          const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
          if (savedAuth) {
            setCurrentUser(JSON.parse(savedAuth));
            setIsCloudConnected(true);
            return;
          }
        } catch (e) {
          console.error(e);
        }
        setCurrentUser(null);
        setIsCloudConnected(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Real-time Firestore synchronizer when user is logged in
  useEffect(() => {
    if (!currentUser) return;

    setIsCloudConnected(true);

    const unsubSantri = subscribeToSantri(
      (cloudSantri) => {
        if (cloudSantri && cloudSantri.length > 0) {
          setSantriList(cloudSantri);
        }
      },
      (err) => {
        console.warn('Realtime santri sync notice:', err);
      }
    );

    const unsubTrx = subscribeToTransactions(
      (cloudTrx) => {
        if (cloudTrx && cloudTrx.length > 0) {
          setTransactions(cloudTrx);
        }
      },
      (err) => {
        console.warn('Realtime transactions sync notice:', err);
      }
    );

    const unsubProfile = subscribeToProfile(
      (cloudProfile) => {
        if (cloudProfile && cloudProfile.name) {
          setPesantrenProfile(cloudProfile);
        }
      },
      (err) => {
        console.warn('Realtime profile sync notice:', err);
      }
    );

    return () => {
      unsubSantri();
      unsubTrx();
      unsubProfile();
    };
  }, [currentUser]);

  // Sync to localStorage as offline cache
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(pesantrenProfile));
    } catch (e) {
      console.error('Error saving profile data', e);
    }
  }, [pesantrenProfile]);

  // Derived metrics
  const totalWadiah = santriList.reduce((acc, curr) => acc + curr.balance, 0);
  const todayStr = getTodayDateString();
  const santriAlreadyTakenCount = santriList.filter((s) => {
    const el = checkDailyAllowanceEligibility(s, transactions, todayStr);
    return el.status === 'ALREADY_TAKEN';
  }).length;

  // Bendahara Credential & Google Login / Logout handlers
  const handleLoginBendahara = (user: AuthUser) => {
    setCurrentUser(user);
    setIsCloudConnected(true);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save auth to storage', e);
    }
    setViewMode('dashboard');
  };

  const handleSignInGoogle = async () => {
    try {
      await signInWithGoogle();
      setViewMode('dashboard');
    } catch (error) {
      console.error('Gagal login Google:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Gagal keluar:', error);
    }
    localStorage.removeItem(STORAGE_KEY_AUTH);
    setCurrentUser(null);
    setIsCloudConnected(false);
    setViewMode('landing');
  };

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
      tellerName: currentUser?.displayName ? `${currentUser.displayName} (Loket)` : 'Ust. M. Ridwan (Teller Loket)',
      notes: notes || 'Uang Jajan Harian (Batas Rp 10.000 / Hari)',
      category: 'Uang Jajan Harian',
    };

    // Update santri balance
    setSantriList((prev) =>
      prev.map((s) => (s.id === santriId ? { ...s, balance: balanceAfter } : s))
    );

    // Append transaction
    setTransactions((prev) => [newTrx, ...prev]);

    // Save to Cloud Firestore
    if (currentUser) {
      saveTransactionToCloud(newTrx).catch((e) => console.error('Cloud save trx error:', e));
      updateSantriBalanceInCloud(santri.id, balanceAfter).catch((e) => console.error('Cloud balance error:', e));
    }

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
      tellerName: method.includes('BANK') 
        ? 'Sistem Otomatis (Transfer Bank)' 
        : (currentUser?.displayName ? `${currentUser.displayName} (Kasir Loket)` : 'Ust. H. Ahmad Fauzi (Kasir Loket)'),
      guardianSenderName: guardianName || santri.guardianName,
      notes: notes || 'Setoran Titipan Uang Saku Santri',
      category: 'Setoran Titipan Wali',
    };

    setSantriList((prev) =>
      prev.map((s) => (s.id === santriId ? { ...s, balance: balanceAfter } : s))
    );

    setTransactions((prev) => [newTrx, ...prev]);

    // Save to Cloud Firestore
    if (currentUser) {
      saveTransactionToCloud(newTrx).catch((e) => console.error('Cloud save trx error:', e));
      updateSantriBalanceInCloud(santri.id, balanceAfter).catch((e) => console.error('Cloud balance error:', e));
    }

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

    // Save to Cloud Firestore
    if (currentUser) {
      saveSantriToCloud(newSantri).catch((e) => console.error('Cloud add santri error:', e));
    }

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
        tellerName: currentUser?.displayName ? `${currentUser.displayName} (Kasir Loket)` : 'Ust. H. Ahmad Fauzi (Kasir Loket)',
        guardianSenderName: newSantri.guardianName,
        notes: 'Setoran Awal Buka Rekening Wadiah Santri',
        category: 'Setoran Titipan Wali',
      };
      setTransactions((prev) => [depositTrx, ...prev]);

      if (currentUser) {
        saveTransactionToCloud(depositTrx).catch((e) => console.error('Cloud deposit trx error:', e));
      }
    }
  };

  // Update santri data handler (edit)
  const handleUpdateSantri = (updatedSantri: Santri) => {
    setSantriList((prev) => prev.map((s) => (s.id === updatedSantri.id ? updatedSantri : s)));
    if (currentUser) {
      saveSantriToCloud(updatedSantri).catch((e) => console.error('Cloud update santri error:', e));
    }
  };

  // Delete santri handler
  const handleDeleteSantri = (santriId: string) => {
    setSantriList((prev) => prev.filter((s) => s.id !== santriId));
    if (currentUser) {
      deleteSantriFromCloud(santriId).catch((e) => console.error('Cloud delete santri error:', e));
    }
  };

  // Toggle freeze / unfreeze account handler
  const handleToggleFreezeSantri = (santriId: string, freeze: boolean) => {
    setSantriList((prev) => {
      const nextList = prev.map((s) => {
        if (s.id === santriId) {
          const nextStatus = freeze ? ('DIBEKUKAN' as const) : ('AKTIF' as const);
          const updatedSantri: Santri = { ...s, status: nextStatus };
          if (currentUser) {
            saveSantriToCloud(updatedSantri).catch((e) => console.error('Cloud freeze toggle error:', e));
          }
          return updatedSantri;
        }
        return s;
      });
      return nextList;
    });
  };

  // Update profile handler (with cloud sync)
  const handleUpdateProfile = (newProfile: PesantrenProfile) => {
    setPesantrenProfile(newProfile);
    if (currentUser) {
      saveProfileToCloud(newProfile).catch((e) => console.error('Cloud profile error:', e));
    }
  };

  // Reset to initial seeds
  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang data ke simulasi awal? Semua transaksi baru akan dikembalikan ke data default.')) {
      localStorage.removeItem(STORAGE_KEY_SANTRI);
      localStorage.removeItem(STORAGE_KEY_TRX);
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      setSantriList(initialSantriList);
      setTransactions(initialTransactions);
      setPesantrenProfile(defaultPesantrenProfile);

      if (currentUser) {
        seedInitialDataToCloud(initialSantriList, initialTransactions, defaultPesantrenProfile);
      }
    }
  };

  // Render Landing Page (Portal Orang Tua Read-Only + Login Bendahara)
  // Strict Privacy: Hanya bendahara yang telah login melalui username & password yang dapat membuka dashboard
  if (viewMode === 'landing' || !currentUser) {
    return (
      <LandingPage
        santriList={santriList}
        transactions={transactions}
        pesantrenProfile={pesantrenProfile}
        currentUser={currentUser}
        isCloudConnected={isCloudConnected}
        onSignOut={handleSignOut}
        onEnterDashboard={() => {
          if (currentUser) {
            setViewMode('dashboard');
          }
        }}
        onLoginBendahara={handleLoginBendahara}
      />
    );
  }

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
        onGoToLanding={() => setViewMode('landing')}
      />

      {/* Main Content Area (Offset by Sidebar width on desktop md:pl-72) */}
      <div className="flex-1 md:pl-72 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Navigation Bar with Cloud Realtime status & Google Auth */}
        <TopHeader
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          pesantrenProfile={pesantrenProfile}
          totalWadiah={totalWadiah}
          santriAlreadyTakenCount={santriAlreadyTakenCount}
          totalActiveSantri={santriList.length}
          currentUser={currentUser}
          isCloudConnected={isCloudConnected}
          onSignInGoogle={handleSignInGoogle}
          onSignOut={handleSignOut}
          onGoToLanding={() => setViewMode('landing')}
        />

        {/* View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* LOKET BENDAHARA - Sub-menu 1: Penarikan Jajan (Rp 10.000) */}
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
              onUpdateSantri={handleUpdateSantri}
              onDeleteSantri={handleDeleteSantri}
              onToggleFreezeSantri={handleToggleFreezeSantri}
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

          {/* PENGATURAN - Profil Pesantren & Logo */}
          {activeTab === 'profil' && (
            <ProfilPesantrenView
              pesantrenProfile={pesantrenProfile}
              onUpdateProfile={handleUpdateProfile}
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
