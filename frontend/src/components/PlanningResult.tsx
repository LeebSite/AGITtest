import React from 'react';
import type { Planning } from '../types/planning';

interface PlanningResultProps {
  planning: Planning;
}

/**
 * Tampilan Hasil Penyeimbangan Planning (Hasil Respon Backend)
 */
export const PlanningResult: React.FC<PlanningResultProps> = ({ planning }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
        Planning Result
      </h2>

      {/* Ringkasan Metadata */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-md mb-5 text-sm">
        <div>
          <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
            Request Code
          </span>
          <span className="font-semibold text-slate-800">{planning.requestCode}</span>
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
            Status
          </span>
          <span className="font-semibold text-slate-800">{planning.status}</span>
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
            Original Total
          </span>
          <span className="font-semibold text-slate-800">{planning.originalTotal}</span>
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
            Balanced Total
          </span>
          <span className="font-semibold text-slate-800">{planning.balancedTotal}</span>
        </div>
      </div>

      {/* Tabel Detail Slot Hasil Balancing */}
      <div className="border border-slate-200 rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-600 font-medium">
            <tr>
              <th className="px-4 py-2.5 text-left w-24">Slot Order</th>
              <th className="px-4 py-2.5 text-left">Slot Name</th>
              <th className="px-4 py-2.5 text-right w-36">Original Quantity</th>
              <th className="px-4 py-2.5 text-right w-36">Balanced Quantity</th>
              <th className="px-4 py-2.5 text-center w-28">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {planning.slots.map((s) => (
              <tr key={s.slotOrder} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 text-slate-500 font-mono text-center">
                  #{s.slotOrder}
                </td>
                <td className="px-4 py-2.5 text-slate-800">{s.slotName}</td>
                <td className="px-4 py-2.5 text-right text-slate-600 font-mono">
                  {s.originalQuantity}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-900 font-bold font-mono">
                  {s.balancedQuantity}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                      s.isActive
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
