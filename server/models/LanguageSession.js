import mongoose from 'mongoose';

const languageSessionSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    durationSeconds: { type: Number, default: 0 },
    savedPhrases: [
      {
        text: { type: String, trim: true },
        note: { type: String, trim: true, default: '' },
      },
    ],
  },
  { timestamps: true }
);

export const LanguageSession = mongoose.model('LanguageSession', languageSessionSchema);
