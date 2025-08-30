import fs from 'fs/promises';
import path from 'path';
import Note from '../models/Note.js';
import { transcribeAudio, summarizeText } from '../services/ai.js';

export async function createNote(req, res) {
  try {
    const file = req.file;
    const { title } = req.body;
    if (!file) return res.status(400).json({ error: 'audio file is required (field: audio)' });

    const audioPath = req.file.filename.replace(/\\/g, '/');
    let transcript = '';
    try {
      transcript = await transcribeAudio(audioPath);
    } catch (err) {
      console.error('Transcription error:', err);
      transcript = '[transcription failed—check logs/API key]';
    }

    const note = await Note.create({ title: title || 'Untitled Note', audioPath, transcript, summary: null });
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create note' });
  }
}

export async function listNotes(req, res) {
  try {
    const notes = await Note.find({}).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list notes' });
  }
}

export async function updateNote(req, res) {
  try {
    const { id } = req.params;
    const { title, transcript } = req.body;
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    let transcriptChanged = false;
    if (typeof title === 'string') note.title = title;
    if (typeof transcript === 'string' && transcript !== note.transcript) {
      note.transcript = transcript;
      transcriptChanged = true;
    }
    if (transcriptChanged) {
      note.summary = null; // Clear summary so button reappears
    }
    await note.save();
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update note' });
  }
}

export async function deleteNote(req, res) {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    // Try delete audio file (best-effort)
    if (note.audioPath) {
      try { await fs.unlink(note.audioPath); } catch {}
    }
    await note.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
}

export async function summarizeNote(req, res) {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    if (note.summary && note.summary.trim().length > 0) {
      return res.status(400).json({ error: 'Summary already exists. Edit transcript to regenerate.' });
    }

    const summary = await summarizeText(note.transcript || '');
    note.summary = summary;
    await note.save();
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to summarize note' });
  }
}
