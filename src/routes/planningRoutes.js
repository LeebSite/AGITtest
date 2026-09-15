import { Router } from 'express';
import planningController from '../controllers/planningController.js';

const router = Router();

// Endpoint utama alur Planning
router.post('/plannings', planningController.create);
router.get('/plannings', planningController.getAll);
router.get('/plannings/:id', planningController.getById);

export default router;
