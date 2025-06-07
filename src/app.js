import express from 'express';
import cors from 'cors';
import { initRateLimiter } from './middlewares/rateLimiter.middleware.js';
import schoolRoutes from './routes/school.route.js';
import logsRoutes from './routes/logs.route.js';

const app = express();

app.set('trust proxy', 1); // This is crucial for getting real IP addresses
// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
// Route registrations
app.use('/api/school', schoolRoutes);
app.use('/api/logs', logsRoutes); 

export { app };
