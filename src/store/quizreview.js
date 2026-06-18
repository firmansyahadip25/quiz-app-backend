import mongoose from 'mongoose'

const quizReviewSchema = new mongoose.Schema({
  playerId: { type: String, default: null },
  quizId: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  playedAt: { type: Date, default: Date.now }
})

const QuizReview = mongoose.model('QuizReview', quizReviewSchema)

//add quiz review
export async function addQuizReview({ playerId, quizId, question, answer, correctAnswer, isCorrect, playedAt }) {
  const newQuizReview = new QuizReview({
    playerId,
    quizId,
    question,
    answer,
    correctAnswer,
    isCorrect,
    playedAt
  })
  return await newQuizReview.save()
}

//get quiz reviews
export async function getPlayerReviews(playerId) {
  return await QuizReview.find({ playerId })
    .sort({ playedAt: -1 })
}

export async function getQuizReview({ playerId, quizId }) {
  return await QuizReview.find({ playerId, quizId })
    .sort({ playedAt: -1 })
}
