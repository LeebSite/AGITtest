/**
 * Integration Test: Alur lengkap API → Service → Database (Case 2)
 *
 * Syarat:
 * - PostgreSQL harus berjalan dan DATABASE_URL di .env harus valid
 * - Jalankan: npm run test:integration
 *
 * Setiap test case membersihkan data yang dibuat sendiri agar idempoten.
 */

import 'dotenv/config';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../../src/app.js';
import prisma from '../../src/db/prisma.js';

// Prefix unik per sesi test agar tidak tabrakan
const RUN_ID = Date.now();
const makeCode = (label) => `INT-TEST-${RUN_ID}-${label}`;

// Bersihkan data test setelah semua selesai
afterAll(async () => {
  await prisma.planning.deleteMany({
    where: { requestCode: { startsWith: `INT-TEST-${RUN_ID}` } },
  });
  await prisma.$disconnect();
});

describe('Integration Test — POST /api/plannings', () => {
  it('harus menerima planning valid, menjalankan balancing, dan menyimpan ke database', async () => {
    const payload = {
      requestCode: makeCode('CREATE'),
      candidateToken: 'GHALIBCANDIDATE',
      slots: [
        { slotName: 'Gudang Utara', originalQuantity: 10 },
        { slotName: 'Gudang Selatan', originalQuantity: 0 },
        { slotName: 'Gudang Timur', originalQuantity: 5 },
      ],
    };

    const res = await request(app).post('/api/plannings').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.isDuplicate).toBe(false);

    const { data } = res.body;

    // Header Planning harus tersimpan lengkap
    expect(data.requestCode).toBe(payload.requestCode);
    expect(data.candidateToken).toBe('GHALIBCANDIDATE');
    expect(data.status).toBe('SUCCESS');
    expect(typeof data.planningId).toBe('number');
    expect(data.createdAt).toBeTruthy();

    // Total harus konsisten (15 original = 15 balanced)
    expect(data.originalTotal).toBe(15);
    expect(data.balancedTotal).toBe(15);

    // Slot harus tersimpan dan sesuai aturan balancing
    expect(data.slots).toHaveLength(3);

    const [s1, s2, s3] = data.slots;

    // Slot tidak aktif tetap 0
    expect(s2.isActive).toBe(false);
    expect(s2.balancedQuantity).toBe(0);

    // Max - Min slot aktif harus <= 1
    const activeBalanced = [s1, s3].map((s) => s.balancedQuantity);
    expect(Math.max(...activeBalanced) - Math.min(...activeBalanced)).toBeLessThanOrEqual(1);

    // Total balanced = total original
    const sumBalanced = data.slots.reduce((a, s) => a + s.balancedQuantity, 0);
    expect(sumBalanced).toBe(15);

    // Verifikasi data benar-benar tersimpan di database
    const dbRecord = await prisma.planning.findUnique({
      where: { planningId: data.planningId },
      include: { slots: { orderBy: { slotOrder: 'asc' } } },
    });
    expect(dbRecord).not.toBeNull();
    expect(dbRecord.originalTotal).toBe(15);
    expect(dbRecord.balancedTotal).toBe(15);
    expect(dbRecord.slots).toHaveLength(3);
  });

  it('harus menolak kuantitas negatif dengan status 400', async () => {
    const res = await request(app).post('/api/plannings').send({
      requestCode: makeCode('NEG'),
      slots: [{ slotName: 'A', originalQuantity: -5 }],
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/negatif/i);
  });

  it('harus menolak kuantitas desimal/pecahan dengan status 400', async () => {
    const res = await request(app).post('/api/plannings').send({
      requestCode: makeCode('DEC'),
      slots: [{ slotName: 'A', originalQuantity: 3.7 }],
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/desimal|pecahan/i);
  });

  it('harus menolak jika field slots kosong', async () => {
    const res = await request(app).post('/api/plannings').send({
      requestCode: makeCode('EMPTY'),
      slots: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('harus menolak jika field slots tidak ada', async () => {
    const res = await request(app).post('/api/plannings').send({
      requestCode: makeCode('NOSLOTS'),
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Integration Test — Idempotensi RequestCode', () => {
  it('permintaan ulang dengan RequestCode yang sama harus mengembalikan data yang sama tanpa duplikasi', async () => {
    const payload = {
      requestCode: makeCode('IDEM'),
      candidateToken: 'GHALIBCANDIDATE',
      slots: [
        { slotName: 'Alpha', originalQuantity: 6 },
        { slotName: 'Beta', originalQuantity: 3 },
      ],
    };

    // Permintaan pertama — harus dibuat baru (201)
    const first = await request(app).post('/api/plannings').send(payload);
    expect(first.status).toBe(201);
    expect(first.body.isDuplicate).toBe(false);

    // Permintaan kedua dengan RequestCode identik — harus mengembalikan data lama (200)
    const second = await request(app).post('/api/plannings').send(payload);
    expect(second.status).toBe(200);
    expect(second.body.isDuplicate).toBe(true);

    // Pastikan ID-nya sama (bukan record baru)
    expect(second.body.data.planningId).toBe(first.body.data.planningId);

    // Pastikan hanya ada satu record di database
    const count = await prisma.planning.count({
      where: { requestCode: payload.requestCode },
    });
    expect(count).toBe(1);
  });
});

describe('Integration Test — GET /api/plannings', () => {
  it('harus mengembalikan riwayat planning terbaru terlebih dahulu', async () => {
    const res = await request(app).get('/api/plannings');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    // Validasi urutan: createdAt DESC
    const dates = res.body.data.map((p) => new Date(p.createdAt).getTime());
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
    }
  });
});

describe('Integration Test — GET /api/plannings/:id', () => {
  it('harus mengembalikan detail planning beserta slot, total, dan status', async () => {
    // Buat dulu planning baru
    const createRes = await request(app).post('/api/plannings').send({
      requestCode: makeCode('DETAIL'),
      candidateToken: 'GHALIBCANDIDATE',
      slots: [
        { slotName: 'Slot A', originalQuantity: 8 },
        { slotName: 'Slot B', originalQuantity: 4 },
        { slotName: 'Slot C', originalQuantity: 0 },
      ],
    });

    const id = createRes.body.data.planningId;

    const res = await request(app).get(`/api/plannings/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { data } = res.body;
    expect(data.planningId).toBe(id);
    expect(data.requestCode).toMatch(/DETAIL/);
    expect(data.status).toBe('SUCCESS');
    expect(typeof data.originalTotal).toBe('number');
    expect(typeof data.balancedTotal).toBe('number');
    expect(data.originalTotal).toBe(data.balancedTotal); // jumlah harus tetap sama
    expect(Array.isArray(data.slots)).toBe(true);
    expect(data.slots).toHaveLength(3);
  });

  it('harus mengembalikan 404 untuk ID yang tidak ada', async () => {
    const res = await request(app).get('/api/plannings/99999999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
