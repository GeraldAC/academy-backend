// src/routes/schedules.routes.ts
import { Router } from 'express';
import { 
  getSchedules, 
  createSchedule, 
  updateSchedule, 
  deleteSchedule,
  getScheduleById,
  toggleScheduleStatus 
} from '../controllers/schedules.controller';
import { authMiddleware } from '../middlewares/auth.middleware'; // ✅ Cambiar a authMiddleware

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware); // ✅ Usar authMiddleware

router.get('/', getSchedules);
router.get('/:id', getScheduleById);
router.post('/', createSchedule);
router.put('/:id', updateSchedule);
router.put('/:id/toggle-status', toggleScheduleStatus);
router.delete('/:id', deleteSchedule);

export default router;