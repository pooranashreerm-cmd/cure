import React, { useState } from 'react';
import {
  Store,
  FileText,
  RefreshCw,
  CheckCircle2,
  Clock,
  Pill,
  Search,
  Package,
  Truck,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PharmacyDashboard: React.FC = () => {
  const {
    currentUser,
    pharmacyOrders,
    updatePharmacyOrderStatus,
    medicines,
    t,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOrders = pharmacyOrders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Pharmacy Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl text-white shadow-xl space-y-2 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-white/20 text-[10px] font-bold uppercase tracking-wider rounded-md">
                Certified Dispensary
              </span>
              <span className="text-xs text-amber-100 font-mono">Lic: TN-PH-84210</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display mt-1">
              Apex Care Pharmacy & Surgical Dispensary
            </h1>
            <p className="text-xs text-amber-100">
              Auto-linked with Apollo Hospital EHR & Community Worker Network
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-white/20 text-white rounded-2xl text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-time Rx Dispatch Stream Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Orders in Queue</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            {pharmacyOrders.length}
          </div>
          <span className="text-[11px] text-amber-600 font-medium">Digital Rx auto-synced</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Pending Dispense</span>
          <div className="text-3xl font-extrabold text-amber-500 font-display">
            {pharmacyOrders.filter((o) => o.status === 'pending' || o.status === 'new').length}
          </div>
          <span className="text-[11px] text-slate-400">Ready for packaging</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Refill Alerts (3 Days Left)</span>
          <div className="text-3xl font-extrabold text-sky-600 font-display">
            2
          </div>
          <span className="text-[11px] text-sky-500 font-medium">Refill notifications sent</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Dispensed Today</span>
          <div className="text-3xl font-extrabold text-emerald-600 font-display">
            {pharmacyOrders.filter((o) => o.status === 'dispensed').length + 18}
          </div>
          <span className="text-[11px] text-emerald-500 font-medium">100% accuracy verified</span>
        </div>
      </div>

      {/* Orders List & Status Controller */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
            Prescription Orders & Refill Dispensary Queue
          </h3>

          <div className="flex gap-2">
            {['all', 'new', 'pending', 'ready', 'dispensed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition cursor-pointer ${
                  filterStatus === st
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold font-mono rounded-md">
                    {ord.prescriptionNumber}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {ord.patientName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    ID: {ord.patientId} • Prescribed by {ord.doctorName}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
                    ord.status === 'dispensed'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : ord.status === 'ready'
                      ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {ord.status}
                </span>
              </div>

              {/* Items in this order */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs space-y-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Prescription Items:
                </span>
                {ord.medicines.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-slate-600 dark:text-slate-400"
                  >
                    <span className="flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-amber-600" />
                      <strong>{it.name}</strong> ({it.dosage})
                    </span>
                    <span className="font-mono">Qty: {it.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons for Pharmacist */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <a
                  href={`tel:${ord.patientPhone}`}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Patient</span>
                </a>

                <div className="flex items-center gap-2">
                  {(ord.status === 'pending' || ord.status === 'new') && (
                    <button
                      onClick={() => updatePharmacyOrderStatus(ord.id, 'ready')}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Mark Ready for Pickup
                    </button>
                  )}
                  {ord.status === 'ready' && (
                    <button
                      onClick={() => updatePharmacyOrderStatus(ord.id, 'dispensed')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Dispense & Handover</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
