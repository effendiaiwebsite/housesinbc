/**
 * Express Server
 *
 * Main server entry point. Sets up Express, middleware, routes, and starts the server.
 */

// Load environment variables first
import 'dotenv/config';

import express, { Express } from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { requestLogger, errorHandler } from './middleware';

// Route imports
import authRoutes from './routes/auth';
import leadsRoutes from './routes/leads';
import analyticsRoutes from './routes/analytics';
import appointmentsRoutes from './routes/appointments';
import propertiesRoutes from './routes/properties';
import neighborhoodsRoutes from './routes/neighborhoods';
import savedPropertiesRoutes from './routes/savedProperties';
import chatbotRoutes from './routes/chatbot';
import quizRoutes from './routes/quiz';
import progressRoutes from './routes/progress';
import ratesRoutes from './routes/rates';
import offersRoutes from './routes/offers';
import uploadRoutes from './routes/upload';
import adminRoutes from './routes/admin';

// Services
import { knowledgeUpdateService } from './services/knowledgeUpdateService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV === 'development';

// ===== Middleware Setup =====

// Trust proxy (required for Render, Heroku, etc.)
app.set('trust proxy', 1);

// CORS configuration for Flutter web app
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Cache-Control'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development only)
if (isDevelopment) {
  app.use(requestLogger);
}

// Session debugging middleware (production only - to diagnose issues)
if (!isDevelopment) {
  app.use((req, res, next) => {
    console.log('📋 Request Debug:', {
      method: req.method,
      path: req.path,
      sessionID: req.sessionID,
      session: req.session,
      cookies: req.headers.cookie,
      isAuthenticated: req.session?.isAuthenticated,
    });
    next();
  });
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
      sameSite: isDevelopment ? 'lax' : 'none', // 'none' required for cross-site cookies in production
    },
    proxy: true, // Trust proxy (required for Render.com)
  })
);

// Debug session parsing
app.use((req, res, next) => {
  console.log('🔍 Session Debug:', {
    sessionID: req.sessionID,
    session: req.session,
    cookieHeader: req.headers.cookie,
    hasSession: !!req.session,
  });
  next();
});

// ===== API Routes =====

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes); // Admin routes must come before other routes to avoid conflicts
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/neighborhoods', neighborhoodsRoutes);
app.use('/api/saved-properties', savedPropertiesRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/upload', uploadRoutes);

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

  // Start chatbot knowledge update service
  try {
    knowledgeUpdateService.start();
  } catch (error) {
    console.error('⚠️ Failed to start knowledge update service:', error);
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
