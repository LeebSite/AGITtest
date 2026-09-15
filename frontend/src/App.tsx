import React, { useState, useEffect } from 'react';
import type { SlotInput, Planning, CreatePlanningPayload } from './types/planning';
import { getPlannings, getPlanningById, createPlanning } from './services/planningApi';
import { PlanningForm } from './components/PlanningForm';
import { PlanningResult } from './components/PlanningResult';
import { PlanningHistory } from './components/PlanningHistory';

// Default slot awal sesuai contoh soal assessment (7 slot)
const INITIAL_SLOTS: SlotInput[] = [
  { slotName: 'Slot 1', originalQuantity: 4 },
  { slotName: 'Slot 2', originalQuantity: 5 },
  { slotName: 'Slot 3', originalQuantity: 1 },
  { slotName: 'Slot 4', originalQuantity: 7 },
  { slotName: 'Slot 5', originalQuantity: 6 },
  { slotName: 'Slot 6', originalQuantity: 4 },
  { slotName: 'Slot 7', originalQuantity: 0 },
];

export default function App() {
  // State formulir
  const [requestCode, setRequestCode] = useState<string>('REQ-2026-001');
  const [slots, setSlots] = useState<SlotInput[]>(INITIAL_SLOTS);
  const candidateToken = 'GHALIBCANDIDATE';

  // State hasil pemrosesan dan riwayat
  const [currentResult, setCurrentResult] = useState<Planning | null>(null);
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mengambil daftar riwayat dari database
  const loadPlannings = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await getPlannings();
      setPlannings(data);
    } catch {
      // Abaikan error koneksi saat memuat awal
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Muat data riwayat saat aplikasi pertama kali dibuka
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const data = await getPlannings();
        if (isMounted) {
          setPlannings(data);
        }
      } catch {
        // Abaikan error koneksi saat memuat awal
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handler perubahan nilai slot
  const handleSlotChange = (index: number, field: keyof SlotInput, value: string | number) => {
    setSlots((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Submit form penyeimbangan ke backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validasi sederhana sebelum kirim
    for (let i = 0; i < slots.length; i++) {
      const q = Number(slots[i].originalQuantity);
      if (isNaN(q) || q < 0 || !Number.isInteger(q)) {
        setErrorMessage(`Slot ${i + 1} (${slots[i].slotName}) harus berisi bilangan bulat non-negatif.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload: CreatePlanningPayload = {
        requestCode: requestCode.trim(),
        candidateToken,
        slots: slots.map((s) => ({
          slotName: s.slotName.trim(),
          originalQuantity: Number(s.originalQuantity),
        })),
      };

      const result = await createPlanning(payload);
      setCurrentResult(result);

      // Muat ulang riwayat agar langsung terbarui
      loadPlannings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses planning.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler untuk melihat detail planning dari tabel riwayat
  const handleViewPlanning = async (id: number) => {
    setErrorMessage(null);
    try {
      const detail = await getPlanningById(id);
      setCurrentResult(detail);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat detail planning.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header Aplikasi Internal */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Slot Balancing System
            </h1>
            <p className="text-xs text-slate-500">
              Enterprise Planning &amp; Allocation Tool
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Token: <span className="font-mono text-slate-700">{candidateToken}</span>
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Section 1: Formulir Input Planning */}
        <PlanningForm
          requestCode={requestCode}
          onRequestCodeChange={setRequestCode}
          slots={slots}
          onSlotChange={handleSlotChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />

        {/* Section 2: Hasil Eksekusi Planning */}
        {currentResult && <PlanningResult planning={currentResult} />}

        {/* Section 3: Riwayat Planning */}
        <PlanningHistory
          plannings={plannings}
          isLoading={isLoadingHistory}
          onViewPlanning={handleViewPlanning}
          onRefresh={loadPlannings}
        />
      </main>
    </div>
  );
}
