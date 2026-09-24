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
const envCorsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = [
  ...envCorsOrigins,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
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
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        (process.env.VERCEL_URL && origin === `https://${process.env.VERCEL_URL}`) ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL && origin === `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
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
app.use('/api/auth', otpRouter);

// Data Export Queue Endpoint
app.post('/api/user/data-export', (_req, res) => {
  res.json({
    success: true,
    message: 'Request submitted - we will email you within 30 days',
  });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err?.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      code: 'CORS_REJECTED',
    });
  }

  console.error('[Server Error]', err?.message, err?.stack);
  res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    error: 'An unexpected server error occurred.',
  });
});

if (!process.env.VERCEL) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[QPay Auth Server] Running on http://localhost:${PORT}`);
  });

  process.on('SIGTERM', () => {
    console.log('[QPay Auth Server] Shutting down gracefully...');
    server.close(() => process.exit(0));
  });
}

export default app;
