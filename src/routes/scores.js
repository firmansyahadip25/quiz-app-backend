import express from 'express'
import { addScore, getTopScores } from '../store/scores.js'

const router = express.Router()

/**
 * GET /api/scores
 * Ambil leaderboard top scores
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const scores = await getTopScores(limit)
    res.json({ scores })
  } catch (err) {
    console.error('Failed to fetch scoreboard:', err)
    res.status(500).json({ error: 'Gagal mengambil data scoreboard.' })
  }
})

/**
 * POST /api/scores
 * Submit skor baru setelah kuis selesai
 * Body: { playerId, playerName, playerPicture?, score, total, percentage }
 */
router.post('/', async (req, res) => {
  const { playerId, playerName, playerPicture, score, total, percentage } = req.body

  if (!playerName || score === undefined || !total || percentage === undefined) {
    return res.status(400).json({ error: 'Data skor tidak lengkap.' })
  }

  try {
    await addScore({ playerId, playerName, playerPicture, score, total, percentage })
    res.status(201).json({ message: 'Skor berhasil disimpan.' })
  } catch (err) {
    console.error('Failed to save score:', err)
    res.status(500).json({ error: 'Gagal menyimpan skor ke database.' })
  }
})

export default router
