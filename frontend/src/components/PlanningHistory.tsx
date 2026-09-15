import React from 'react';
import type { Planning } from '../types/planning';

interface PlanningHistoryProps {
  plannings: Planning[];
  isLoading: boolean;
  onViewPlanning: (id: number) => void;
  onRefresh: () => void;
}

/**
 * Tabel Riwayat Planning Historis dari Database
 */
export const PlanningHistory: React.FC<PlanningHistoryProps> = ({
  plannings,
  isLoading,
  onViewPlanning,
  onRefresh,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">History</h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh History'}
        </button>
      </div>

      {plannings.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          No planning data yet.
        </div>
      ) : (
        <div className="border border-slate-200 rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-4 py-2.5 text-left">Request Code</th>
                <th className="px-4 py-2.5 text-left">Created At</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-right">Original Total</th>
                <th className="px-4 py-2.5 text-right">Balanced Total</th>
                <th className="px-4 py-2.5 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {plannings.map((p) => (
                <tr key={p.planningId} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-800">
                    {p.requestCode}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">
                    {new Date(p.createdAt).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-600">
                    {p.originalTotal}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-800">
                    {p.balancedTotal}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => onViewPlanning(p.planningId)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
