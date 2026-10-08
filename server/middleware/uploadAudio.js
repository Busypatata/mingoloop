import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
export const AUDIO_DIR = path.join(UPLOADS_DIR, 'audio');
export const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
export const MAX_AUDIO_SECONDS = 120;

fs.mkdirSync(AUDIO_DIR, { recursive: true });

// What browsers' MediaRecorder produces: Chrome/Edge -> webm, Firefox -> ogg,
// Safari -> mp4. The stored extension comes from this table, never from the
// client-supplied filename.
const EXTENSION_BY_TYPE = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/aac': 'aac',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
};

// Express's static handler labels .webm as video/webm; these are audio-only.
const MIME_BY_EXTENSION = {
  webm: 'audio/webm',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
};

// Used as express.static's setHeaders for /uploads.
export function setAudioHeaders(res, filePath) {
  const type = MIME_BY_EXTENSION[path.extname(filePath).slice(1).toLowerCase()];
  if (type) res.setHeader('Content-Type', type);
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

function baseType(mimetype = '') {
  return mimetype.split(';')[0].trim().toLowerCase();
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AUDIO_DIR),
  filename: (req, file, cb) => {
    const ext = EXTENSION_BY_TYPE[baseType(file.mimetype)];
    // Random name: audio files are served statically, so the URL itself is the
    // access token and has to be unguessable.
    cb(null, `${Date.now()}-${crypto.randomBytes(12).toString('hex')}.${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_AUDIO_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (EXTENSION_BY_TYPE[baseType(file.mimetype)]) return cb(null, true);
    cb(new Error('UNSUPPORTED_AUDIO'));
  },
});

// Wraps multer so upload problems come back as friendly JSON, not a stack trace.
export function uploadAudio(req, res, next) {
  upload.single('audio')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'That voice message is too large.' });
    }
    if (err.message === 'UNSUPPORTED_AUDIO') {
      return res.status(400).json({ message: "That audio format isn't supported." });
    }
    return res.status(400).json({ message: 'Could not upload that voice message.' });
  });
}
