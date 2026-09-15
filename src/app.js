import express from 'express';
import cors from 'cors';
import planningRoutes from './routes/planningRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AGIT Slot Balancing Service',
  });
});

// API Routes
app.use('/api', planningRoutes);

// 404 Not Found Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint tidak ditemukan',
  });
});

// Global Central Error Handler
app.use(errorHandler);

export default app;
