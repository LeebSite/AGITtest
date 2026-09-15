-- AGIT Software Engineer Assessment — Case 3: Database & SQL
-- File: database/assessment.sql
-- Token Kandidat: VEH-GHALIBCANDIDATE


-- ==========================================
-- Task 1: Skema & Constraint (DDL)
-- ==========================================

CREATE TABLE IF NOT EXISTS plannings (
    planning_id     SERIAL PRIMARY KEY,
    request_code    VARCHAR(100) NOT NULL UNIQUE,
    candidate_token VARCHAR(100) NOT NULL,
    created_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status          VARCHAR(50)  NOT NULL DEFAULT 'SUCCESS',
    original_total  INTEGER      NOT NULL DEFAULT 0 CHECK (original_total >= 0),
    balanced_total  INTEGER      NOT NULL DEFAULT 0 CHECK (balanced_total >= 0)
);

CREATE TABLE IF NOT EXISTS planning_slots (
    id                SERIAL PRIMARY KEY,
    planning_id       INTEGER      NOT NULL REFERENCES plannings(planning_id) ON DELETE CASCADE,
    slot_order        INTEGER      NOT NULL CHECK (slot_order > 0),
    slot_name         VARCHAR(150) NOT NULL,
    original_quantity INTEGER      NOT NULL CHECK (original_quantity >= 0),
    balanced_quantity INTEGER      NOT NULL CHECK (balanced_quantity >= 0),
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,

    CONSTRAINT uq_planning_slots_order UNIQUE (planning_id, slot_order)
);


-- ==========================================
-- Task 2: Data Awal (Seed Data)
-- ==========================================

DO $$
DECLARE
    v_id INTEGER;
BEGIN
    -- 1. Contoh standar asesmen [4, 5, 1, 7, 6, 4, 0] -> [4, 5, 4, 5, 5, 4, 0]
    INSERT INTO plannings (request_code, candidate_token, status, original_total, balanced_total)
    VALUES ('SEED-REQ-001', 'VEH-GHALIBCANDIDATE', 'SUCCESS', 27, 27)
    ON CONFLICT (request_code) DO NOTHING
    RETURNING planning_id INTO v_id;

    IF v_id IS NOT NULL THEN
        INSERT INTO planning_slots (planning_id, slot_order, slot_name, original_quantity, balanced_quantity, is_active) VALUES
        (v_id, 1, 'Slot A', 4, 4, TRUE),
        (v_id, 2, 'Slot B', 5, 5, TRUE),
        (v_id, 3, 'Slot C', 1, 4, TRUE),
        (v_id, 4, 'Slot D', 7, 5, TRUE),
        (v_id, 5, 'Slot E', 6, 5, TRUE),
        (v_id, 6, 'Slot F', 4, 4, TRUE),
        (v_id, 7, 'Slot G', 0, 0, FALSE);
    END IF;

    -- 2. Habis dibagi rata [6, 6, 6, 6] -> [6, 6, 6, 6]
    INSERT INTO plannings (request_code, candidate_token, status, original_total, balanced_total)
    VALUES ('SEED-REQ-002', 'VEH-GHALIBCANDIDATE', 'SUCCESS', 24, 24)
    ON CONFLICT (request_code) DO NOTHING
    RETURNING planning_id INTO v_id;

    IF v_id IS NOT NULL THEN
        INSERT INTO planning_slots (planning_id, slot_order, slot_name, original_quantity, balanced_quantity, is_active) VALUES
        (v_id, 1, 'Gudang 1', 6, 6, TRUE),
        (v_id, 2, 'Gudang 2', 6, 6, TRUE),
        (v_id, 3, 'Gudang 3', 6, 6, TRUE),
        (v_id, 4, 'Gudang 4', 6, 6, TRUE);
    END IF;

    -- 3. Total dengan sisa [10, 5, 4] -> [7, 6, 6]
    INSERT INTO plannings (request_code, candidate_token, status, original_total, balanced_total)
    VALUES ('SEED-REQ-003', 'VEH-GHALIBCANDIDATE', 'SUCCESS', 19, 19)
    ON CONFLICT (request_code) DO NOTHING
    RETURNING planning_id INTO v_id;

    IF v_id IS NOT NULL THEN
        INSERT INTO planning_slots (planning_id, slot_order, slot_name, original_quantity, balanced_quantity, is_active) VALUES
        (v_id, 1, 'Rak 1', 10, 7, TRUE),
        (v_id, 2, 'Rak 2', 5, 6, TRUE),
        (v_id, 3, 'Rak 3', 4, 6, TRUE);
    END IF;

    -- 4. Semua slot nol [0, 0, 0, 0] -> [0, 0, 0, 0]
    INSERT INTO plannings (request_code, candidate_token, status, original_total, balanced_total)
    VALUES ('SEED-REQ-004', 'VEH-GHALIBCANDIDATE', 'SUCCESS', 0, 0)
    ON CONFLICT (request_code) DO NOTHING
    RETURNING planning_id INTO v_id;

    IF v_id IS NOT NULL THEN
        INSERT INTO planning_slots (planning_id, slot_order, slot_name, original_quantity, balanced_quantity, is_active) VALUES
        (v_id, 1, 'Zona A', 0, 0, FALSE),
        (v_id, 2, 'Zona B', 0, 0, FALSE),
        (v_id, 3, 'Zona C', 0, 0, FALSE),
        (v_id, 4, 'Zona D', 0, 0, FALSE);
    END IF;

    -- 5. Hanya 1 slot aktif [0, 25, 0] -> [0, 25, 0]
    INSERT INTO plannings (request_code, candidate_token, status, original_total, balanced_total)
    VALUES ('SEED-REQ-005', 'VEH-GHALIBCANDIDATE', 'SUCCESS', 25, 25)
    ON CONFLICT (request_code) DO NOTHING
    RETURNING planning_id INTO v_id;

    IF v_id IS NOT NULL THEN
        INSERT INTO planning_slots (planning_id, slot_order, slot_name, original_quantity, balanced_quantity, is_active) VALUES
        (v_id, 1, 'Silo 1', 0, 0, FALSE),
        (v_id, 2, 'Silo 2', 25, 25, TRUE),
        (v_id, 3, 'Silo 3', 0, 0, FALSE);
    END IF;

    -- 6. Kasus tie breaker [7, 5, 5] -> [6, 6, 5]
    INSERT INTO plannings (request_code, candidate_token, status, original_total, balanced_total)
    VALUES ('SEED-REQ-006', 'VEH-GHALIBCANDIDATE', 'SUCCESS', 17, 17)
    ON CONFLICT (request_code) DO NOTHING
    RETURNING planning_id INTO v_id;

    IF v_id IS NOT NULL THEN
        INSERT INTO planning_slots (planning_id, slot_order, slot_name, original_quantity, balanced_quantity, is_active) VALUES
        (v_id, 1, 'Pos 1', 7, 6, TRUE),
        (v_id, 2, 'Pos 2', 5, 6, TRUE),
        (v_id, 3, 'Pos 3', 5, 5, TRUE);
    END IF;

    -- 7. Kuantitas besar [500, 200, 300, 0] -> [334, 333, 333, 0]
    INSERT INTO plannings (request_code, candidate_token, status, original_total, balanced_total)
    VALUES ('SEED-REQ-007', 'VEH-GHALIBCANDIDATE', 'SUCCESS', 1000, 1000)
    ON CONFLICT (request_code) DO NOTHING
    RETURNING planning_id INTO v_id;

    IF v_id IS NOT NULL THEN
        INSERT INTO planning_slots (planning_id, slot_order, slot_name, original_quantity, balanced_quantity, is_active) VALUES
        (v_id, 1, 'Hub 1', 500, 334, TRUE),
        (v_id, 2, 'Hub 2', 200, 333, TRUE),
        (v_id, 3, 'Hub 3', 300, 333, TRUE),
        (v_id, 4, 'Hub 4', 0, 0, FALSE);
    END IF;

    -- 8. Multi tie [10, 10, 10, 10] + sisa 1 -> [11, 10, 10, 10]
    INSERT INTO plannings (request_code, candidate_token, status, original_total, balanced_total)
    VALUES ('SEED-REQ-008', 'VEH-GHALIBCANDIDATE', 'SUCCESS', 41, 41)
    ON CONFLICT (request_code) DO NOTHING
    RETURNING planning_id INTO v_id;

    IF v_id IS NOT NULL THEN
        INSERT INTO planning_slots (planning_id, slot_order, slot_name, original_quantity, balanced_quantity, is_active) VALUES
        (v_id, 1, 'Depot 1', 10, 11, TRUE),
        (v_id, 2, 'Depot 2', 10, 10, TRUE),
        (v_id, 3, 'Depot 3', 10, 10, TRUE),
        (v_id, 4, 'Depot 4', 11, 10, TRUE);
    END IF;

    -- 9. Selisih awal besar [100, 1, 1, 0] -> [34, 34, 34, 0]
    INSERT INTO plannings (request_code, candidate_token, status, original_total, balanced_total)
    VALUES ('SEED-REQ-009', 'VEH-GHALIBCANDIDATE', 'SUCCESS', 102, 102)
    ON CONFLICT (request_code) DO NOTHING
    RETURNING planning_id INTO v_id;

    IF v_id IS NOT NULL THEN
        INSERT INTO planning_slots (planning_id, slot_order, slot_name, original_quantity, balanced_quantity, is_active) VALUES
        (v_id, 1, 'Pusat', 100, 34, TRUE),
        (v_id, 2, 'Cabang A', 1, 34, TRUE),
        (v_id, 3, 'Cabang B', 1, 34, TRUE),
        (v_id, 4, 'Cabang C', 0, 0, FALSE);
    END IF;

    -- 10. Multi-tier 7 slot [12, 10, 8, 0, 4, 2, 0] -> [8, 7, 7, 0, 7, 7, 0]
    INSERT INTO plannings (request_code, candidate_token, status, original_total, balanced_total)
    VALUES ('SEED-REQ-010', 'VEH-GHALIBCANDIDATE', 'SUCCESS', 36, 36)
    ON CONFLICT (request_code) DO NOTHING
    RETURNING planning_id INTO v_id;

    IF v_id IS NOT NULL THEN
        INSERT INTO planning_slots (planning_id, slot_order, slot_name, original_quantity, balanced_quantity, is_active) VALUES
        (v_id, 1, 'Slot 1', 12, 8, TRUE),
        (v_id, 2, 'Slot 2', 10, 7, TRUE),
        (v_id, 3, 'Slot 3', 8, 7, TRUE),
        (v_id, 4, 'Slot 4', 0, 0, FALSE),
        (v_id, 5, 'Slot 5', 4, 7, TRUE),
        (v_id, 6, 'Slot 6', 2, 7, TRUE),
        (v_id, 7, 'Slot 7', 0, 0, FALSE);
    END IF;
END $$;


-- ==========================================
-- Task 3: Validasi Total Kuantitas
-- ==========================================

SELECT 
    p.planning_id,
    p.request_code,
    COALESCE(SUM(ps.original_quantity), 0) AS original_total,
    COALESCE(SUM(ps.balanced_quantity), 0) AS balanced_total,
    (
        COALESCE(SUM(ps.original_quantity), 0) = 
        COALESCE(SUM(ps.balanced_quantity), 0)
    ) AS is_total_valid
FROM plannings p
LEFT JOIN planning_slots ps ON p.planning_id = ps.planning_id
GROUP BY p.planning_id, p.request_code
ORDER BY p.planning_id ASC;


-- ==========================================
-- Task 4: Riwayat Planning
-- ==========================================

SELECT 
    p.request_code,
    p.created_at,
    COUNT(ps.id) FILTER (WHERE ps.is_active = TRUE) AS active_slot_count,
    COUNT(ps.id) AS total_slot_count,
    p.original_total,
    p.balanced_total,
    p.status
FROM plannings p
LEFT JOIN planning_slots ps ON p.planning_id = ps.planning_id
GROUP BY p.planning_id, p.request_code, p.created_at, p.original_total, p.balanced_total, p.status
ORDER BY p.created_at DESC;


-- ==========================================
-- Task 5: Deteksi Anomali
-- ==========================================

WITH slot_summary AS (
    SELECT 
        planning_id,
        SUM(original_quantity) AS sum_original,
        SUM(balanced_quantity) AS sum_balanced,
        COUNT(*) FILTER (WHERE (is_active = FALSE OR original_quantity = 0) AND balanced_quantity > 0) AS invalid_inactive,
        COUNT(*) FILTER (WHERE original_quantity < 0 OR balanced_quantity < 0) AS invalid_negative
    FROM planning_slots
    GROUP BY planning_id
),
duplicate_check AS (
    SELECT request_code, COUNT(*) AS cnt
    FROM plannings
    GROUP BY request_code
    HAVING COUNT(*) > 1
)
SELECT 
    p.planning_id,
    p.request_code,
    p.status,
    CASE 
        WHEN s.planning_id IS NULL THEN 'ANOMALY: Header tanpa data slot'
        WHEN s.invalid_inactive > 0 THEN 'ANOMALY: Slot inaktif bernilai seimbang > 0'
        WHEN s.sum_original != s.sum_balanced THEN 'ANOMALY: Total awal != total seimbang'
        WHEN s.invalid_negative > 0 THEN 'ANOMALY: Kuantitas negatif terdeteksi'
        WHEN d.request_code IS NOT NULL THEN 'ANOMALY: Duplikasi request code'
        ELSE 'NORMAL'
    END AS anomaly_reason
FROM plannings p
LEFT JOIN slot_summary s ON p.planning_id = s.planning_id
LEFT JOIN duplicate_check d ON p.request_code = d.request_code
WHERE 
    s.planning_id IS NULL
    OR s.invalid_inactive > 0
    OR s.sum_original != s.sum_balanced
    OR s.invalid_negative > 0
    OR d.request_code IS NOT NULL;


-- ==========================================
-- Task 6: Top 3 Penyesuaian Terbesar
-- ==========================================

SELECT 
    p.planning_id,
    p.request_code,
    ps.slot_order,
    ps.slot_name,
    ps.original_quantity,
    ps.balanced_quantity,
    ABS(ps.balanced_quantity - ps.original_quantity) AS adjustment
FROM planning_slots ps
JOIN plannings p ON ps.planning_id = p.planning_id
ORDER BY 
    adjustment DESC,
    ps.slot_order ASC,
    p.planning_id ASC
LIMIT 3;


-- ==========================================
-- Task 7: Transaksi Atomik (Atomic Save)
-- ==========================================

BEGIN;

INSERT INTO plannings (request_code, candidate_token, status, original_total, balanced_total)
VALUES ('TX-SAMPLE-001', 'VEH-GHALIBCANDIDATE', 'SUCCESS', 15, 15)
ON CONFLICT (request_code) DO NOTHING;

INSERT INTO planning_slots (planning_id, slot_order, slot_name, original_quantity, balanced_quantity, is_active)
SELECT p.planning_id, v.slot_order, v.slot_name, v.orig_qty, v.bal_qty, v.is_active
FROM plannings p
CROSS JOIN (
    VALUES 
        (1, 'Slot A', 10, 8, TRUE),
        (2, 'Slot B', 5, 7, TRUE),
        (3, 'Slot C', 0, 0, FALSE)
) AS v(slot_order, slot_name, orig_qty, bal_qty, is_active)
WHERE p.request_code = 'TX-SAMPLE-001'
ON CONFLICT (planning_id, slot_order) DO NOTHING;

COMMIT;


-- ==========================================
-- Task 8: Desain RebalanceRun & Versi Terakhir
-- ==========================================

CREATE TABLE IF NOT EXISTS rebalance_runs (
    run_id         SERIAL PRIMARY KEY,
    planning_id    INTEGER NOT NULL REFERENCES plannings(planning_id) ON DELETE CASCADE,
    run_number     INTEGER NOT NULL,
    balanced_total INTEGER NOT NULL,
    processed_by   VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    created_at     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_rebalance_runs_version UNIQUE (planning_id, run_number)
);

INSERT INTO rebalance_runs (planning_id, run_number, balanced_total, processed_by, created_at)
SELECT p.planning_id, 1, p.balanced_total, 'ALGO-V1', p.created_at
FROM plannings p
WHERE p.request_code IN ('SEED-REQ-001', 'SEED-REQ-002')
ON CONFLICT (planning_id, run_number) DO NOTHING;

INSERT INTO rebalance_runs (planning_id, run_number, balanced_total, processed_by, created_at)
SELECT p.planning_id, 2, p.balanced_total, 'ALGO-V2', p.created_at + INTERVAL '5 minutes'
FROM plannings p
WHERE p.request_code = 'SEED-REQ-001'
ON CONFLICT (planning_id, run_number) DO NOTHING;

WITH ranked_runs AS (
    SELECT 
        r.run_id,
        r.planning_id,
        p.request_code,
        r.run_number AS latest_version,
        r.balanced_total,
        r.processed_by,
        r.created_at AS last_processed_at,
        ROW_NUMBER() OVER (
            PARTITION BY r.planning_id 
            ORDER BY r.run_number DESC, r.created_at DESC
        ) AS rn
    FROM rebalance_runs r
    JOIN plannings p ON r.planning_id = p.planning_id
)
SELECT 
    planning_id,
    request_code,
    run_id,
    latest_version,
    balanced_total,
    processed_by,
    last_processed_at
FROM ranked_runs
WHERE rn = 1
ORDER BY planning_id ASC;


-- ==========================================
-- Task 9: Usulan Indeks
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_plannings_created_at_desc 
ON plannings (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_plannings_status 
ON plannings (status);

CREATE INDEX IF NOT EXISTS idx_planning_slots_planning_id 
ON planning_slots (planning_id);


-- ==========================================
-- Task 10: Strategi Migrasi Aman
-- ==========================================

-- Langkah 1: Validasi data tabel lama
-- SELECT COUNT(*) FROM old_plannings WHERE slot1_qty < 0 OR slot2_qty < 0;

-- Langkah 2: Pastikan tabel tujuan (planning_slots) sudah siap

-- Langkah 3-6: Unpivot kolom lama menjadi baris di tabel baru
/*
INSERT INTO planning_slots (planning_id, slot_order, slot_name, original_quantity, balanced_quantity, is_active)
SELECT 
    p.planning_id,
    s.slot_order,
    'Slot ' || s.slot_order,
    s.qty,
    s.qty,
    (s.qty > 0)
FROM old_plannings p
CROSS JOIN LATERAL (
    VALUES 
        (1, p.slot1_qty),
        (2, p.slot2_qty),
        (3, p.slot3_qty),
        (4, p.slot4_qty),
        (5, p.slot5_qty),
        (6, p.slot6_qty),
        (7, p.slot7_qty)
) AS s(slot_order, qty)
WHERE s.qty IS NOT NULL;
*/

-- Langkah 7: Rekonsiliasi total kuantitas sebelum dan sesudah migrasi
/*
SELECT old_p.planning_id
FROM old_plannings old_p
JOIN (SELECT planning_id, SUM(original_quantity) AS new_sum FROM planning_slots GROUP BY planning_id) n 
  ON old_p.planning_id = n.planning_id
WHERE (old_p.slot1_qty + old_p.slot2_qty + old_p.slot3_qty + old_p.slot4_qty + old_p.slot5_qty + old_p.slot6_qty + old_p.slot7_qty) != n.new_sum;
*/

-- Langkah 8: Validasi jumlah baris (expected = old_count * 7)
-- SELECT COUNT(*) * 7 FROM old_plannings;
-- SELECT COUNT(*) FROM planning_slots;

-- Langkah 9: Verifikasi tidak ada slot yang hilang
/*
SELECT p.planning_id, gs.order_num
FROM old_plannings p
CROSS JOIN generate_series(1, 7) AS gs(order_num)
LEFT JOIN planning_slots ps ON p.planning_id = ps.planning_id AND gs.order_num = ps.slot_order
WHERE ps.id IS NULL;
*/

-- Langkah 10: Hapus kolom lama setelah verifikasi selesai
-- ALTER TABLE old_plannings DROP COLUMN slot1_qty, DROP COLUMN slot2_qty, ...;
