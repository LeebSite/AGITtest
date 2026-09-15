-- CreateTable
CREATE TABLE "plannings" (
    "planning_id" SERIAL NOT NULL,
    "request_code" TEXT NOT NULL,
    "candidate_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "original_total" INTEGER NOT NULL DEFAULT 0,
    "balanced_total" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "plannings_pkey" PRIMARY KEY ("planning_id")
);

-- CreateTable
CREATE TABLE "planning_slots" (
    "id" SERIAL NOT NULL,
    "planning_id" INTEGER NOT NULL,
    "slot_order" INTEGER NOT NULL,
    "slot_name" TEXT NOT NULL,
    "original_quantity" INTEGER NOT NULL,
    "balanced_quantity" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "planning_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plannings_request_code_key" ON "plannings"("request_code");

-- CreateIndex
CREATE INDEX "plannings_request_code_idx" ON "plannings"("request_code");

-- CreateIndex
CREATE INDEX "plannings_created_at_idx" ON "plannings"("created_at");

-- CreateIndex
CREATE INDEX "plannings_status_idx" ON "plannings"("status");

-- CreateIndex
CREATE INDEX "planning_slots_planning_id_idx" ON "planning_slots"("planning_id");

-- CreateIndex
CREATE UNIQUE INDEX "planning_slots_planning_id_slot_order_key" ON "planning_slots"("planning_id", "slot_order");

-- AddForeignKey
ALTER TABLE "planning_slots" ADD CONSTRAINT "planning_slots_planning_id_fkey" FOREIGN KEY ("planning_id") REFERENCES "plannings"("planning_id") ON DELETE CASCADE ON UPDATE CASCADE;
