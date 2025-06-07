import express from 'express';
import {
  createSchoolHandler,
  listSchoolsHandler,
} from '../controllers/school.controller.js';
import { initRateLimiter } from '../middlewares/rateLimiter.middleware.js';
import { connectRedis } from '../config/redis.js';

connectRedis();
const router = express.Router();

router.use(initRateLimiter);
router.post('/addSchool', createSchoolHandler);
router.get('/listSchools', listSchoolsHandler);

export default router;