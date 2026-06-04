import { OAuth2Client } from 'google-auth-library'
import express from 'express'

const router = express.Router()

console.log('GOOGLE_CLIENT_ID loaded:', process.env.GOOGLE_CLIENT_ID)

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

/**
 * POST /api/auth/google
 * Verifikasi Google ID Token dan kembalikan data user
 */
router.post('/google', async (req, res) => {
  console.log('====================================')
  console.log('=== GOOGLE LOGIN HIT ===')
  console.log('====================================')

  const { credential } = req.body

  console.log('credential exists:', !!credential)

  if (!credential) {
    console.log('Credential missing')
    return res.status(400).json({
      error: 'Credential tidak ditemukan.'
    })
  }

  try {
    console.log('before verifyIdToken')
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID)

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    console.log('after verifyIdToken')

    const payload = ticket.getPayload()

    console.log('Payload received:')
    console.log({
      email: payload.email,
      name: payload.name,
      sub: payload.sub,
    })

    const user = {
      googleId: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    }

    console.log('SUCCESS LOGIN:', user.email)

    return res.status(200).json({
      success: true,
      user,
    })
  } catch (err) {
    console.error('====================================')
    console.error('VERIFY ERROR')
    console.error('====================================')
    console.error(err)

    return res.status(401).json({
      success: false,
      error: 'Token Google tidak valid.',
      details: err.message,
    })
  }
})

export default router
