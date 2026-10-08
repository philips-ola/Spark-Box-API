import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import ideaRouter from './routes/ideaRoutes.js'
import authRouter from './routes/authRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import connectDb from './config/db.js'
import cookieParser from 'cookie-parser'


// Fixes MongoDB Atlas ECONNREFUSED/SRV lookup issues by forcing public DNS resolution
import dns from 'node:dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// MongoDB connection
connectDb();

// CORS config
const allowedOrigins = ['http://localhost:3000'];

// Middlewares
app.use(
    cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/ideas', ideaRouter);
app.use('/api/auth', authRouter);

// 404 fall back
app.use((req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})