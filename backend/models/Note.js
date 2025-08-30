import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled Note' },
  audioPath: { type: String }, // local file path under /uploads
  transcript: { type: String, default: '' },
  summary: { type: String, default: null }, // null means not generated yet
}, { timestamps: true });

export default mongoose.model('Note', NoteSchema);
