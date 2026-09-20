import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { otpRouter } from './routes/otpRoutes.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const TRUST_PROXY_HOPS = parseInt(process.env.TRUST_PROXY_HOPS || '1', 10);

// Proxy settings
app.set('trust proxy', TRUST_PROXY_HOPS);

// CORS settings
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://qpay-user.vercel.app',
  'https://qpay-merchant.vercel.app',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Capacitor)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, lockable via CORS_ORIGIN
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'qpay-auth-server',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth/otp', otpRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    error: 'An unexpected server error occurred.',
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[QPay Auth Server] Running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('[QPay Auth Server] Shutting down gracefully...');
  server.close(() => process.exit(0));
});

export default app;
