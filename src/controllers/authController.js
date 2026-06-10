import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

/**
 * Handler untuk POST /api/auth/google
 * Dipisah ke sini agar bisa ditest langsung dengan Jest (tanpa HTTP request)
 */
export async function googleLogin(req, res) {
  const { credential } = req.body

  if (!credential) {
    return res.status(400).json({
      error: 'Credential tidak ditemukan.'
    })
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    const user = {
      googleId: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    }

    return res.status(200).json({
      success: true,
      user,
    })
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Token Google tidak valid.',
      details: err.message,
    })
  }
}
