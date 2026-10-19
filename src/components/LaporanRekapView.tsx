import React, { useState } from 'react';
import { 
  CalendarRange, 
  Printer, 
  Download, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Calendar,
  Filter,
  CheckCircle,
  Building2
} from 'lucide-react';
import { Transaction, Santri, PesantrenProfile } from '../types/finance';
import { 
  formatRupiah, 
  formatDateIndo, 
  getTodayDateString 
} from '../utils/accounting';

interface LaporanRekapViewProps {
  transactions: Transaction[];
  santriList: Santri[];
  pesantrenProfile: PesantrenProfile;
}

export const LaporanRekapView: React.FC<LaporanRekapViewProps> = ({
  transactions,
  santriList,
  pesantrenProfile,
}) => {
  const today = getTodayDateString();
  const past30 = new Date();
  past30.setDate(past30.getDate() - 30);
  const past30Str = past30.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(past30Str);
  const [endDate, setEndDate] = useState<string>(today);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'SUMMARY_DAILY' | 'ALL_DETAILS'>('SUMMARY_DAILY');

  // Filter transactions
  const filteredTrx = transactions.filter((t) => {
    const inDateRange = t.date >= startDate && t.date <= endDate;
    const matchesType =
      filterType === 'ALL' ||
      (filterType === 'DEPOSIT' && t.type === 'DEPOSIT_WADIAH') ||
      (filterType === 'WITHDRAWAL' && t.type === 'WITHDRAWAL_JAJAN');

    const matchesSearch =
      t.santriName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.transactionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.accountNumber.includes(searchTerm);

    return inDateRange && matchesType && matchesSearch;
  });

  // Calculate Aggregates
  let totalDeposits = 0;
  let totalWithdrawals = 0;
  let depositCount = 0;
  let withdrawalCount = 0;

  filteredTrx.forEach((t) => {
    if (t.type === 'DEPOSIT_WADIAH') {
      totalDeposits += t.amount;
      depositCount += 1;
    } else if (t.type === 'WITHDRAWAL_JAJAN') {
      totalWithdrawals += t.amount;
      withdrawalCount += 1;
    }
  });

  const netCashFlow = totalDeposits - totalWithdrawals;

  // Daily grouping for Tab 1
  const dailyGroups: Record<
    string,
    { date: string; depositTotal: number; withdrawalTotal: number; countWithdrawal: number; countDeposit: number }
  > = {};

  filteredTrx.forEach((t) => {
    if (!dailyGroups[t.date]) {
      dailyGroups[t.date] = {
        date: t.date,
        depositTotal: 0,
        withdrawalTotal: 0,
        countWithdrawal: 0,
        countDeposit: 0,
      };
    }
    if (t.type === 'DEPOSIT_WADIAH') {
      dailyGroups[t.date].depositTotal += t.amount;
      dailyGroups[t.date].countDeposit += 1;
    } else if (t.type === 'WITHDRAWAL_JAJAN') {
      dailyGroups[t.date].withdrawalTotal += t.amount;
      dailyGroups[t.date].countWithdrawal += 1;
    }
  });

  const sortedDailyList = Object.values(dailyGroups).sort((a, b) => b.date.localeCompare(a.date));

  // Quick preset dates
  const setPreset = (type: 'TODAY' | 'LAST_7' | 'THIS_MONTH' | 'ALL') => {
    const now = new Date();
    if (type === 'TODAY') {
      setStartDate(today);
      setEndDate(today);
    } else if (type === 'LAST_7') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(today);
    } else if (type === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(today);
    } else if (type === 'ALL') {
      setStartDate('2024-01-01');
      setEndDate(today);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['No', 'Tanggal', 'Jam', 'No_Transaksi', 'Nama_Santri', 'No_Rekening', 'Tipe_Transaksi', 'Kategori', 'Metode', 'Debit_Pengeluaran', 'Kredit_Pemasukan', 'Saldo_Sesudah', 'Teller', 'Catatan'];
    
    const rows = filteredTrx.map((t, idx) => [
      idx + 1,
      t.date,
      t.time,
      t.transactionNo,
      `"${t.santriName}"`,
      t.accountNumber,
      t.type,
      `"${t.category}"`,
      t.method,
      t.type === 'WITHDRAWAL_JAJAN' ? t.amount : 0,
      t.type === 'DEPOSIT_WADIAH' ? t.amount : 0,
      t.balanceAfter,
      `"${t.tellerName}"`,
      `"${t.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Keuangan_Santri_${startDate}_sd_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Filter and Configuration Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 no-print space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <CalendarRange className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-bold text-slate-900">
                Laporan Rekapitulasi Kas & Mutasi per Rentang Tanggal
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau arus keluar masuk uang saku titipan orang tua dan penarikan jajan harian santri
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV (Excel)</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Rekap</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          {/* Presets */}
          <div className="md:col-span-4 flex items-center space-x-1 text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1">Preset:</span>
            <button
              onClick={() => setPreset('TODAY')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Hari Ini
            </button>
            <button
              onClick={() => setPreset('LAST_7')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              7 Hari
            </button>
            <button
              onClick={() => setPreset('THIS_MONTH')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setPreset('ALL')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Semua
            </button>
          </div>

          {/* Date Range Inputs */}
          <div className="md:col-span-5 flex items-center space-x-2 text-xs">
            <div className="flex-1 flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 text-[11px]">Dari:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none w-full cursor-pointer"
              />
            </div>
            <div className="flex-1 flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400 text-[11px]">S/D:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="md:col-span-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Jenis Transaksi</option>
              <option value="DEPOSIT">Hanya Setoran Titipan (Masuk)</option>
              <option value="WITHDRAWAL">Hanya Penarikan Jajan (Keluar)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Setoran */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Total Titipan Masuk
            </p>
            <p className="text-lg font-black text-emerald-800 font-mono-numbers mt-0.5">
              {formatRupiah(totalDeposits)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {depositCount} kali setoran wali
            </p>
          </div>
        </div>

        {/* Total Penarikan Jajan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-rose-100 text-rose-800 rounded-xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Total Jajan Dicairkan
            </p>
            <p className="text-lg font-black text-rose-800 font-mono-numbers mt-0.5">
              {formatRupiah(totalWithdrawals)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {withdrawalCount} kali jajan (Maks Rp 10.000)
            </p>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${netCashFlow >= 0 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Arus Kas Bersih (Net)
            </p>
            <p className={`text-lg font-black font-mono-numbers mt-0.5 ${netCashFlow >= 0 ? 'text-blue-900' : 'text-amber-900'}`}>
              {formatRupiah(netCashFlow)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Selisih Titipan vs Pencairan
            </p>
          </div>
        </div>

        {/* Strict Rule Metric */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-emerald-300 tracking-wider">
              Kepatuhan Kuota Jajan
            </p>
            <p className="text-lg font-black text-white font-mono-numbers mt-0.5">
              100% Terkunci
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Maks 1x / Santri / Hari
            </p>
          </div>
        </div>
      </div>

      {/* Main Report Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print-card">
        {/* Formal Header for Print */}
        <div className="p-6 border-b border-slate-200 text-center print-only hidden">
          <h1 className="text-base font-black uppercase text-slate-900">
            {pesantrenProfile.formalName}
          </h1>
          <h2 className="text-sm font-bold uppercase text-slate-800 mt-1">
            REKAPITULASI LAPORAN KEUANGAN KAS TITIPAN SANTRI
          </h2>
          <p className="text-xs text-slate-500">
            Periode: {formatDateIndo(startDate)} s/d {formatDateIndo(endDate)}
          </p>
        </div>

        {/* View Tabs */}
        <div className="px-6 pt-4 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex space-x-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('SUMMARY_DAILY')}
              className={`pb-3 border-b-2 cursor-pointer transition-all ${
                activeTab === 'SUMMARY_DAILY'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Rekapitulasi Harian ({sortedDailyList.length} Hari Transaksi)
            </button>
            <button
              onClick={() => setActiveTab('ALL_DETAILS')}
              className={`pb-3 border-b-2 cursor-pointer transition-all ${
                activeTab === 'ALL_DETAILS'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Daftar Rincian Seluruh Transaksi ({filteredTrx.length} Catatan)
            </button>
          </div>

          <div className="pb-3 text-xs text-slate-500">
            Rentang: <strong>{startDate}</strong> s/d <strong>{endDate}</strong>
          </div>
        </div>

        {/* TAB 1: DAILY SUMMARY */}
        {activeTab === 'SUMMARY_DAILY' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[11px] tracking-wider">
                  <th className="px-4 py-3 text-left w-36">Tanggal</th>
                  <th className="px-4 py-3 text-center w-28">Frekuensi Jajan</th>
                  <th className="px-4 py-3 text-right">Total Jajan Keluar (Rp)</th>
                  <th className="px-4 py-3 text-center w-28">Frekuensi Setor</th>
                  <th className="px-4 py-3 text-right">Total Titipan Masuk (Rp)</th>
                  <th className="px-4 py-3 text-right w-44">Arus Bersih (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedDailyList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                      Tidak ada transaksi dalam rentang tanggal ini.
                    </td>
                  </tr>
                ) : (
                  sortedDailyList.map((day) => {
                    const netDay = day.depositTotal - day.withdrawalTotal;
                    return (
                      <tr key={day.date} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-bold text-slate-800 whitespace-nowrap">
                          {formatDateIndo(day.date)}
                        </td>
                        <td className="px-4 py-2.5 text-center font-mono-numbers">
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                            {day.countWithdrawal} santri
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono-numbers text-rose-700 font-semibold">
                          {formatRupiah(day.withdrawalTotal)}
                        </td>
                        <td className="px-4 py-2.5 text-center font-mono-numbers">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            {day.countDeposit} setoran
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono-numbers text-emerald-800 font-bold">
                          {formatRupiah(day.depositTotal)}
                        </td>
                        <td className={`px-4 py-2.5 text-right font-mono-numbers font-black ${netDay >= 0 ? 'text-blue-900' : 'text-amber-800'}`}>
                          {formatRupiah(netDay)}
                        </td>
                      </tr>
                    );
                  })
                )}

                {/* Grand Total Footer */}
                <tr className="bg-slate-100 font-black text-slate-900 text-xs border-t-2 border-slate-900">
                  <td className="px-4 py-3 uppercase tracking-wider">TOTAL KESELURUHAN</td>
                  <td className="px-4 py-3 text-center font-mono-numbers">{withdrawalCount} penarikan</td>
                  <td className="px-4 py-3 text-right font-mono-numbers text-rose-800 text-sm">
                    {formatRupiah(totalWithdrawals)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono-numbers">{depositCount} setoran</td>
                  <td className="px-4 py-3 text-right font-mono-numbers text-emerald-800 text-sm">
                    {formatRupiah(totalDeposits)}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono-numbers text-sm ${netCashFlow >= 0 ? 'text-blue-900' : 'text-amber-900'}`}>
                    {formatRupiah(netCashFlow)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: DETAILED TRANSACTIONS LIST */}
        {activeTab === 'ALL_DETAILS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[11px] tracking-wider">
                  <th className="px-3 py-3 text-left w-24">Tanggal</th>
                  <th className="px-3 py-3 text-left w-28">No. Ref</th>
                  <th className="px-3 py-3 text-left">Santri / Rekening</th>
                  <th className="px-3 py-3 text-left">Jenis & Keterangan</th>
                  <th className="px-3 py-3 text-left w-28">Metode</th>
                  <th className="px-3 py-3 text-right w-28">Nominal (Rp)</th>
                  <th className="px-3 py-3 text-right w-32">Saldo Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTrx.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                      Tidak ada data transaksi yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredTrx.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {t.date} <span className="text-slate-400 text-[10px]">{t.time.slice(0, 5)}</span>
                      </td>
                      <td className="px-3 py-2 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                        {t.transactionNo}
                      </td>
                      <td className="px-3 py-2 text-slate-800">
                        <p className="font-bold">{t.santriName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{t.accountNumber}</p>
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              t.type === 'DEPOSIT_WADIAH'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {t.type === 'DEPOSIT_WADIAH' ? 'Setoran Titipan' : 'Tarik Jajan (10rb)'}
                          </span>
                          <span className="text-[11px] font-medium">{t.notes}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-600 text-[11px] whitespace-nowrap">
                        {t.method.replace(/_/g, ' ')}
                      </td>
                      <td className={`px-3 py-2 text-right font-mono-numbers font-bold ${
                        t.type === 'DEPOSIT_WADIAH' ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {t.type === 'DEPOSIT_WADIAH' ? '+' : '-'}{formatRupiah(t.amount)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono-numbers font-bold text-slate-900">
                        {formatRupiah(t.balanceAfter)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
