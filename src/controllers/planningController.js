import planningService from '../services/planningService.js';

/**
 * Controller layer untuk endpoint Planning
 */
export class PlanningController {
  constructor(service = planningService) {
    this.service = service;
  }

  /**
   * POST /api/plannings - Buat dan proses planning baru
   */
  create = async (req, res, next) => {
    try {
      const result = await this.service.createPlanning(req.body);
      const httpStatus = result.isDuplicate ? 200 : 201;

      return res.status(httpStatus).json({
        success: true,
        isDuplicate: result.isDuplicate,
        data: result.data,
      });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * GET /api/plannings/:id - Ambil detail planning berdasarkan ID
   */
  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await this.service.getPlanningById(id);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * GET /api/plannings - Ambil daftar riwayat planning
   */
  getAll = async (req, res, next) => {
    try {
      const { limit, offset } = req.query;
      const data = await this.service.getPlanningHistory({ limit, offset });

      return res.status(200).json({
        success: true,
        count: data.length,
        data,
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new PlanningController();
