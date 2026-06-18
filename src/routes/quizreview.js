import express from 'express'
import {
  addQuizReview,
  getPlayerReviews,
  getQuizReview
} from '../store/quizreview.js'

const router = express.Router()

/**
 * GET /api/quizreview
 * Ambil review kuis berdasarkan playerId dan quizId (query params)
 */
router.get('/', async (req, res) => {
  const { playerId, quizId } = req.query

  if (!playerId || !quizId) {
    return res.status(400).json({
      error: 'playerId dan quizId diperlukan.'
    })
  }

  try {
    const reviews = await getQuizReview({ playerId, quizId })

    res.json({
      reviews
    })
  } catch (err) {
    console.error('Failed to fetch quiz review:', err)

    res.status(500).json({
      error: 'Gagal mengambil data review.'
    })
  }
})

/**
 * GET /api/quizreview/:playerId
 * Ambil semua review milik user tertentu, atau filter berdasarkan quizId jika ada
 */
router.get('/:playerId', async (req, res) => {
  // If query parameters exist, handle it as a query-based request
  const { quizId } = req.query
  if (quizId) {
    const playerId = req.params.playerId
    try {
      const reviews = await getQuizReview({ playerId, quizId })
      return res.json({ reviews })
    } catch (err) {
      console.error('Failed to fetch quiz review:', err)
      return res.status(500).json({
        error: 'Gagal mengambil data review.'
      })
    }
  }

  // Otherwise, fetch all reviews for the player
  try {
    const reviews = await getPlayerReviews(
      req.params.playerId
    )

    res.json({
      reviews
    })
  } catch (err) {
    console.error('Failed to fetch reviews:', err)

    res.status(500).json({
      error: 'Gagal mengambil data review.'
    })
  }
})

router.post('/', async (req, res) => {
  const {
    playerId,
    quizId,
    question,
    answer,
    correctAnswer,
    isCorrect,
    playedAt
  } = req.body

  if (
    !playerId ||
    !question ||
    !answer ||
    !correctAnswer ||
    isCorrect === undefined
  ) {
    return res.status(400).json({
      error: 'Data review tidak lengkap.'
    })
  }

  try {
    await addQuizReview({
      playerId,
      quizId,
      question,
      answer,
      correctAnswer,
      isCorrect,
      playedAt
    })

    res.status(201).json({
      message: 'Review berhasil disimpan.'
    })
  } catch (err) {
    console.error('Failed to save quiz review:', err)

    res.status(500).json({
      error: 'Gagal menyimpan review.'
    })
  }
})

export default router
