import express from 'express'
import {
  addScore,
  getTopScores,
  getPlayerHistory,
  getScoreById
} from '../store/scores.js'

const router = express.Router()

/**
 * GET /api/scores
 * Ambil leaderboard
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const scores = await getTopScores(limit)

    res.json({ scores })
  } catch (err) {
    console.error('Failed to fetch scoreboard:', err)

    res.status(500).json({
      error: 'Gagal mengambil data scoreboard.'
    })
  }
})

/**
 * GET /api/scores/history/:playerId
 * Ambil seluruh history milik user tertentu
 */
router.get('/history/:playerId', async (req, res) => {
  try {
    const history = await getPlayerHistory(
      req.params.playerId
    )

    res.json({
      history
    })
  } catch (err) {
    console.error('Failed to fetch history:', err)

    res.status(500).json({
      error: 'Gagal mengambil riwayat permainan.'
    })
  }
})

/**
 * GET /api/scores/:id
 * Ambil skor berdasarkan ID dokumen
 */
router.get('/:id', async (req, res) => {
  try {
    const score = await getScoreById(req.params.id)

    if (!score) {
      return res.status(404).json({
        error: 'Skor tidak ditemukan.'
      })
    }

    res.json(score)
  } catch (err) {
    console.error('Failed to fetch score by id:', err)

    res.status(500).json({
      error: 'Gagal mengambil skor.'
    })
  }
})

/**
 * POST /api/scores
 * Simpan skor baru
 */
router.post('/', async (req, res) => {
  const {
    playerId,
    playerName,
    playerPicture,
    quizId,
    score,
    total,
    percentage
  } = req.body

  if (
    !playerName ||
    score === undefined ||
    !total ||
    percentage === undefined
  ) {
    return res.status(400).json({
      error: 'Data skor tidak lengkap.'
    })
  }

  try {
    await addScore({
      playerId,
      playerName,
      playerPicture,
      quizId,
      score,
      total,
      percentage
    })

    res.status(201).json({
      message: 'Skor berhasil disimpan.'
    })
  } catch (err) {
    console.error('Failed to save score:', err)

    res.status(500).json({
      error: 'Gagal menyimpan skor.'
    })
  }
})

export default router
