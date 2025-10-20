/**
 * Express Server
 *
 * Main server entry point. Sets up Express, middleware, routes, and starts the server.
 */

// Load environment variables first
import 'dotenv/config';

import express, { Express } from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { requestLogger, errorHandler } from './middleware';

// Route imports
import authRoutes from './routes/auth';
import leadsRoutes from './routes/leads';
import analyticsRoutes from './routes/analytics';
import appointmentsRoutes from './routes/appointments';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV === 'development';

// ===== Middleware Setup =====

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development only)
if (isDevelopment) {
  app.use(requestLogger);
}

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: !isDevelopment, // HTTPS only in production
      httpOnly: true, // Prevent JS access
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    },
  })
);

// ===== API Routes =====

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/appointments', appointmentsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ===== Static File Serving & SPA Support =====

if (!isDevelopment) {
  // Serve static files from dist/public in production
  const publicPath = path.join(__dirname, 'public');
  app.use(express.static(publicPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// ===== Error Handling =====

app.use(errorHandler);

// ===== Start Server =====

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);

  if (isDevelopment) {
    console.log(`🎨 Frontend dev server: http://localhost:5173 (Vite)`);
    console.log(`\n💡 Admin phone number: ${process.env.ADMIN_PHONE_NUMBER || '+14034783995'}`);
  }

  console.log('\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
