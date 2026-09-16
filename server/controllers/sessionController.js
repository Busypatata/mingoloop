import { LanguageSession } from '../models/LanguageSession.js';

export async function startSession(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'Missing session partner.' });

    const session = await LanguageSession.create({
      participants: [req.user.id, userId],
      startedAt: new Date(),
    });

    res.status(201).json({ id: session._id });
  } catch (error) {
    res.status(500).json({ message: 'Could not start the session. Please try again.' });
  }
}

export async function endSession(req, res) {
  try {
    const { sessionId } = req.params;
    const { savedPhrases = [] } = req.body;

    const session = await LanguageSession.findById(sessionId);
    if (!session || !session.participants.some((p) => p.toString() === req.user.id)) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    session.endedAt = new Date();
    session.durationSeconds = Math.round((session.endedAt - session.startedAt) / 1000);
    session.savedPhrases = Array.isArray(savedPhrases) ? savedPhrases.slice(0, 50) : [];
    await session.save();

    res.json({
      durationSeconds: session.durationSeconds,
      savedPhraseCount: session.savedPhrases.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not save the session summary. Please try again.' });
  }
}

export async function listSessions(req, res) {
  try {
    const sessions = await LanguageSession.find({ participants: req.user.id })
      .populate('participants', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(
      sessions.map((s) => ({
        id: s._id,
        participants: s.participants,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        durationSeconds: s.durationSeconds,
        savedPhraseCount: s.savedPhrases.length,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Could not load your sessions. Please try again.' });
  }
}
