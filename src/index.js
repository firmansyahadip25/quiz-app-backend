import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRouter from './routes/auth.js'
import scoresRouter from './routes/scores.js'

const app = express()
const PORT = process.env.PORT || 3000

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file!')
  process.exit(1)
}

if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn('⚠️ WARNING: GOOGLE_CLIENT_ID is not defined in .env file! Google authentication will fail.')
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  })

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (seperti mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    // Jika dideploy dan butuh fleksibilitas cepat, izinkan semua sub-domain vercel
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS'));
  },
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Quiz App Backend is running 🚀',
    version: '0.0.0',
  })
})

// === ROUTES ===
app.use('/api/auth', authRouter)
app.use('/api/scores', scoresRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal Server Error' })
})

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`)
})

export default app
