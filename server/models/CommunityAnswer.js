import mongoose from 'mongoose';

const communityAnswerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityQuestion', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true, maxlength: 3000 },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

communityAnswerSchema.index({ question: 1, createdAt: 1 });

export const CommunityAnswer = mongoose.model('CommunityAnswer', communityAnswerSchema);
