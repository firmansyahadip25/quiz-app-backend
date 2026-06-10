/**
 * Unit Test untuk googleLogin handler
 *
 * Cara kerja:
 * - TIDAK pakai Supertest / HTTP request sama sekali
 * - Kita langsung panggil fungsi googleLogin(req, res)
 * - req dan res kita buat sendiri sebagai objek palsu (mock)
 */

import { googleLogin } from '../controllers/authController.js'

// ─── Mock google-auth-library ─────────────────────────────────────────────
const mockVerifyIdToken = jest.fn()

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: (...args) => mockVerifyIdToken(...args),
  })),
}))

// ─── Helper: Buat objek req dan res palsu ────────────────────────────────

/**
 * Buat objek request (req) palsu
 * req hanya butuh property 'body' untuk test ini
 */
function buatReq(body = {}) {
  return { body }
}

/**
 * Buat objek response (res) palsu
 * res.status() → return res sendiri (agar bisa di-chain: res.status(200).json(...))
 * res.json()   → simpan hasilnya agar bisa dicek nanti
 */
function buatRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res) // res.status(200) → return res
  res.json = jest.fn().mockReturnValue(res)   // res.json({...}) → return res
  return res
}

// ─── Setup ───────────────────────────────────────────────────────────────

beforeAll(() => {
  process.env.GOOGLE_CLIENT_ID = 'test-client-id'
})

afterEach(() => {
  mockVerifyIdToken.mockReset() // bersihkan mock setelah tiap test
})

// ─── Test Suite ──────────────────────────────────────────────────────────

describe('googleLogin handler', () => {

  // ── Skenario 1: Tidak ada credential ────────────────────────────────────
  describe('ketika credential tidak dikirim', () => {

    it('harus memanggil status 400', async () => {
      const req = buatReq({})   // body kosong
      const res = buatRes()

      await googleLogin(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('harus mengembalikan pesan error yang tepat', async () => {
      const req = buatReq({})
      const res = buatRes()

      await googleLogin(req, res)

      expect(res.json).toHaveBeenCalledWith({
        error: 'Credential tidak ditemukan.'
      })
    })

    it('harus tidak memanggil verifyIdToken sama sekali', async () => {
      const req = buatReq({})
      const res = buatRes()

      await googleLogin(req, res)

      expect(mockVerifyIdToken).not.toHaveBeenCalled()
    })

  })

  // ── Skenario 2: Credential valid ─────────────────────────────────────────
  describe('ketika credential valid', () => {

    const fakePayload = {
      sub: 'google-user-id-123',
      name: 'Budi Santoso',
      email: 'budi@example.com',
      picture: 'https://example.com/photo.jpg',
    }

    beforeEach(() => {
      // Atur mock: seolah-olah Google bilang "token ini valid"
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => fakePayload,
      })
    })

    it('harus memanggil status 200', async () => {
      const req = buatReq({ credential: 'token-valid-123' })
      const res = buatRes()

      await googleLogin(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('harus mengembalikan success: true', async () => {
      const req = buatReq({ credential: 'token-valid-123' })
      const res = buatRes()

      await googleLogin(req, res)

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      )
    })

    it('harus mengembalikan data user yang lengkap dan benar', async () => {
      const req = buatReq({ credential: 'token-valid-123' })
      const res = buatRes()

      await googleLogin(req, res)

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: {
          googleId: fakePayload.sub,
          name: fakePayload.name,
          email: fakePayload.email,
          picture: fakePayload.picture,
        }
      })
    })

    it('harus memanggil verifyIdToken dengan credential yang benar', async () => {
      const req = buatReq({ credential: 'token-valid-123' })
      const res = buatRes()

      await googleLogin(req, res)

      expect(mockVerifyIdToken).toHaveBeenCalledWith({
        idToken: 'token-valid-123',
        audience: 'test-client-id',
      })
    })

  })

  // ── Skenario 3: Credential tidak valid / expired ──────────────────────────
  describe('ketika credential tidak valid atau sudah expired', () => {

    beforeEach(() => {
      // Atur mock: seolah-olah Google bilang "token ini salah/kadaluarsa"
      mockVerifyIdToken.mockRejectedValue(
        new Error('Token has been expired or revoked.')
      )
    })

    it('harus memanggil status 401', async () => {
      const req = buatReq({ credential: 'token-salah-xyz' })
      const res = buatRes()

      await googleLogin(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('harus mengembalikan success: false', async () => {
      const req = buatReq({ credential: 'token-salah-xyz' })
      const res = buatRes()

      await googleLogin(req, res)

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      )
    })

    it('harus mengembalikan pesan error yang tepat', async () => {
      const req = buatReq({ credential: 'token-salah-xyz' })
      const res = buatRes()

      await googleLogin(req, res)

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Token Google tidak valid.' })
      )
    })

    it('harus menyertakan detail error dari Google', async () => {
      const req = buatReq({ credential: 'token-salah-xyz' })
      const res = buatRes()

      await googleLogin(req, res)

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ details: 'Token has been expired or revoked.' })
      )
    })

  })

})
