import express from 'express';
import cors from 'cors';

import schoolRoutes from './routes/school.route.js';

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));

// Route registrations
app.use('/api/school', schoolRoutes);

export { app };
