import express from 'express';
import {
  createSchoolHandler,
  listSchoolsHandler,
} from '../controllers/school.controller.js';
import { initRateLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = express.Router();

router.post('/addSchool',initRateLimiter, createSchoolHandler);
router.get('/listSchools',initRateLimiter, listSchoolsHandler);

export default router;