import express from 'express';

import { analyzeLogs } from '../controllers/logsAnalyzer.controller.js';

const router = express.Router();

//log analysis endpoint
router.get('/analyze-logs', analyzeLogs);

export default router;
