import React from 'react';
import { Printer, CheckCircle, X, ShieldCheck } from 'lucide-react';
import { Transaction, Santri, PesantrenProfile } from '../types/finance';
import { formatRupiah, formatDateIndo, formatPaymentMethodLabel } from '../utils/accounting';

interface ReceiptModalProps {
  transaction: Transaction;
  santri: Santri;
  pesantrenProfile: PesantrenProfile;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  santri,
  pesantrenProfile,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Bukti Transaksi Syariah</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Container */}
        <div className="p-6 overflow-y-auto flex-1 bg-amber-50/30 print:p-0 print:bg-white print:overflow-visible">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm print-card print:border-none print:shadow-none text-slate-800 font-mono-numbers">
            {/* Receipt Header */}
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <p className="font-arabic text-xs text-emerald-800 font-semibold mb-1">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              {pesantrenProfile.logoUrl && (
                <div className="flex justify-center mb-1.5">
                  <img
                    src={pesantrenProfile.logoUrl}
                    alt="Logo"
                    className="w-10 h-10 object-contain"
                  />
                </div>
              )}
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                {pesantrenProfile.name}
              </h2>
              <p className="text-[11px] text-slate-600 font-sans">
                {pesantrenProfile.subtitle}
              </p>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                {pesantrenProfile.address}, {pesantrenProfile.district}
              </p>
              <p className="text-[10px] text-slate-500 font-sans">
                Telp: {pesantrenProfile.phone}
              </p>
            </div>

            {/* Title & Badge */}
            <div className="py-3 text-center border-b border-dashed border-slate-300">
              <span className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                {transaction.type === 'DEPOSIT_WADIAH' ? 'SLIP SETORAN TITIPAN WALI' : 'STRUK PENARIKAN JAJAN HARIAN'}
              </span>
              <p className="text-[11px] text-slate-500 font-sans mt-1">
                Akad: Wadiah Yad Dhamanah
              </p>
            </div>

            {/* Details */}
            <div className="py-3 text-xs space-y-1.5 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">No. Transaksi</span>
                <span className="font-semibold text-slate-800 font-mono text-[11px]">{transaction.transactionNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Waktu / Tanggal</span>
                <span className="font-medium">{formatDateIndo(transaction.date)} {transaction.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Nama Santri</span>
                <span className="font-bold text-slate-900 font-sans">{santri.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">NISN / No. Rek</span>
                <span className="font-medium">{santri.nisn} / {santri.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Asrama & Kelas</span>
                <span className="font-medium text-right text-[11px] font-sans">{santri.dormitory}</span>
              </div>
              {transaction.guardianSenderName && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Penyetor (Wali)</span>
                  <span className="font-medium font-sans">{transaction.guardianSenderName}</span>
                </div>
              )}
              {transaction.type === 'DEPOSIT_WADIAH' && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Metode Penyetoran</span>
                  <span className="font-medium font-sans text-emerald-800 font-semibold">
                    {formatPaymentMethodLabel(transaction.method)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Teller / Kasir</span>
                <span className="font-medium font-sans">{transaction.tellerName}</span>
              </div>
            </div>

            {/* Financial Numbers */}
            <div className="py-3.5 space-y-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-sans">Saldo Sebelum</span>
                <span className="font-medium">{formatRupiah(transaction.balanceBefore)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-slate-700 font-sans">
                  {transaction.type === 'DEPOSIT_WADIAH' ? 'Jumlah Setoran' : 'Jumlah Penarikan (Jajan)'}
                </span>
                <span className={transaction.type === 'DEPOSIT_WADIAH' ? 'text-emerald-700 text-base' : 'text-blue-700 text-base'}>
                  {formatRupiah(transaction.amount)}
                </span>
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-700 font-bold font-sans">Sisa Saldo Titipan</span>
                <span className="font-black text-slate-900">{formatRupiah(transaction.balanceAfter)}</span>
              </div>
            </div>

            {/* Rule Enforcement Statement */}
            {transaction.type === 'WITHDRAWAL_JAJAN' && (
              <div className="py-2.5 px-3 my-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-900 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Ketentuan 1x / Hari Terpenuhi:</p>
                  <p className="text-[10px] leading-tight text-emerald-800">
                    Santri telah mengambil hak jajan harian hari ini (Rp 10.000). Sistem otomatis mengunci penarikan kedua untuk hari ini.
                  </p>
                </div>
              </div>
            )}

            {/* Footer Signatures & Dua */}
            <div className="pt-3 text-center text-[10px] text-slate-500 font-sans">
              <p className="italic">
                "Semoga membawa berkah, barokah bagi santri dan keluarga."
              </p>
              <div className="mt-4 flex justify-between text-center text-[11px] text-slate-700 px-4">
                <div>
                  <p className="text-[10px] text-slate-400">Penerima (Santri)</p>
                  <div className="h-8"></div>
                  <p className="font-semibold underline">{santri.name.split(' ').slice(0, 2).join(' ')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Bendahara Pesantren</p>
                  <div className="h-8"></div>
                  <p className="font-semibold underline">Ust. H. Ahmad Fauzi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between no-print">
          <p className="text-xs text-slate-500">
            Klik Cetak untuk mencetak ke printer struk atau kertas A4.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white rounded-lg shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Struk</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
