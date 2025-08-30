import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createNote, listNotes, updateNote, deleteNote, summarizeNote } from '../controllers/notes.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup for audio uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || '.webm');
    const fname = `audio_${Date.now()}${ext}`;
    cb(null, fname);
  }
});
const upload = multer({ storage });

router.get('/', listNotes);
router.post('/', upload.single('audio'), createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.post('/:id/summarize', summarizeNote);

export default router;
