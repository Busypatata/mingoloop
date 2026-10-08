import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // A message is either text or a voice message (audioUrl). Text is only
    // required when there's no audio attached.
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
      required: function () {
        return !this.audioUrl;
      },
    },
    audioUrl: { type: String },
    audioDuration: { type: Number, min: 0 },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);
