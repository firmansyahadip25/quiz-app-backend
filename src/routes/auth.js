import { OAuth2Client } from 'google-auth-library'
import express from 'express'

const router = express.Router()
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

/**
 * POST /api/auth/google
 * Verifikasi Google ID Token dan kembalikan data user
 * Body: { credential: string }
 */
router.post('/google', async (req, res) => {
  const { credential } = req.body

  if (!credential) {
    return res.status(400).json({ error: 'Credential tidak ditemukan.' })
  }

  try {
    // Verifikasi token ke Google API
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    // Ekstrak data user dari payload Google
    const user = {
      googleId: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    }

    return res.json({ user })
  } catch (err) {
    console.error('Google token verification failed:', err.message)
    return res.status(401).json({ error: 'Token Google tidak valid.' })
  }
})

export default router
