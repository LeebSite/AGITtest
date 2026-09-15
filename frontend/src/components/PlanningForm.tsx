import React from 'react';
import type { SlotInput } from '../types/planning';

interface PlanningFormProps {
  requestCode: string;
  onRequestCodeChange: (value: string) => void;
  slots: SlotInput[];
  onSlotChange: (index: number, field: keyof SlotInput, value: string | number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

/**
 * Formulir Pembuatan Planning Baru (Internal Enterprise View)
 */
export const PlanningForm: React.FC<PlanningFormProps> = ({
  requestCode,
  onRequestCodeChange,
  slots,
  onSlotChange,
  onSubmit,
  isSubmitting,
  errorMessage,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
        New Planning
      </h2>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {errorMessage}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="mb-5">
          <label
            htmlFor="requestCode"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Request Code
          </label>
          <input
            id="requestCode"
            type="text"
            value={requestCode}
            onChange={(e) => onRequestCodeChange(e.target.value)}
            placeholder="e.g. REQ-2026-001"
            required
            className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Slot Quantities
          </label>
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-600 font-medium">
                <tr>
                  <th className="px-4 py-2.5 text-left w-16">Slot</th>
                  <th className="px-4 py-2.5 text-left">Slot Name</th>
                  <th className="px-4 py-2.5 text-right w-44">Original Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {slots.map((slot, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-500 font-mono text-center">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={slot.slotName}
                        onChange={(e) => onSlotChange(idx, 'slotName', e.target.value)}
                        placeholder={`Slot ${idx + 1}`}
                        required
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={slot.originalQuantity}
                        onChange={(e) => onSlotChange(idx, 'originalQuantity', e.target.value)}
                        placeholder="0"
                        required
                        className="w-full text-right px-2.5 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Process Planning'}
          </button>
        </div>
      </form>
    </div>
  );
};
