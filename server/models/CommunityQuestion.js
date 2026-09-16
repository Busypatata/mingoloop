import mongoose from 'mongoose';

const communityQuestionSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    language: { type: String, default: '' },
    category: { type: String, default: '' },
    tags: { type: [String], default: [] },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    answerCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CommunityQuestion = mongoose.model('CommunityQuestion', communityQuestionSchema);
