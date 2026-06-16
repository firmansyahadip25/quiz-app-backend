import mongoose from 'mongoose'

// Skema untuk Mongoose Score
const scoreSchema = new mongoose.Schema({
  playerId: { type: String, required: true },
  quizId: { type: String, default: null },
  playerName: { type: String, required: true },
  playerPicture: { type: String, default: null },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  percentage: { type: Number, required: true },
  playedAt: { type: Date, default: Date.now }
})

const Score = mongoose.model('Score', scoreSchema)

/**
 * Tambah skor baru ke MongoDB.
 */
export async function addScore({ playerId, playerName, playerPicture, quizId, score, total, percentage }) {
  const newScore = new Score({
    playerId: playerId || playerName,
    playerName,
    playerPicture: playerPicture || null,
    quizId,
    score,
    total,
    percentage
  })
  return await newScore.save()
}

/**
 * Ambil top scores — diurutkan berdasarkan skor terbaik per player.
 * Hanya tampilkan 1 skor terbaik per player di leaderboard.
 */
export async function getTopScores(limit = 20) {
  return await Score.aggregate([
    {
      $sort: { percentage: -1, playedAt: 1 }
    },
    {
      $group: {
        _id: '$playerId',
        playerId: { $first: '$playerId' },
        playerName: { $first: '$playerName' },
        playerPicture: { $first: '$playerPicture' },
        score: { $first: '$score' },
        total: { $first: '$total' },
        percentage: { $first: '$percentage' },
        playedAt: { $first: '$playedAt' }
      }
    },
    {
      $sort: { percentage: -1, playedAt: 1 }
    },
    {
      $limit: limit
    }
  ])
}

/**
 * Ambil skor berdasarkan ID dokumen
 */
export async function getScoreById(id) {
  return await Score.findById(id)
}

/**
 * Ambil semua riwayat skor seorang player
 */
export async function getPlayerHistory(playerId) {
  return await Score.find({ playerId })
    .sort({ playedAt: -1 })
}
