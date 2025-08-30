import React, { useEffect, useState } from 'react'
import { fetchNotes, createNote, updateNote, deleteNote, summarizeNote } from './api'
import Recorder from './components/Recorder'

function IconButton({ variant = 'default', children, ...props }) {
  const base =
    'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    default:
      'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm shadow-indigo-200',
    subtle:
      'bg-white/60 text-slate-700 hover:bg-white focus:ring-indigo-500 border border-slate-200 shadow-sm',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-indigo-500',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm shadow-rose-200',
  }
  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  )
}

function Field({ label, as = 'input', className = '', ...props }) {
  const Comp = as
  return (
    <label className="block text-sm">
      <span className="mb-1 inline-block text-slate-600">{label}</span>
      <Comp
        className={`w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 ${className}`}
        {...props}
      />
    </label>
  )
}

function NoteCard({ note, onUpdate, onDelete, onSummarize }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(note.title)
  const [transcript, setTranscript] = useState(note.transcript)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setTitle(note.title)
    setTranscript(note.transcript)
  }, [note._id])

  const save = async () => {
    const payload = {}
    if (title !== note.title) payload.title = title
    if (transcript !== note.transcript) payload.transcript = transcript
    if (Object.keys(payload).length === 0) return setEditing(false)
    setBusy(true)
    try {
      await onUpdate(note._id, payload)
      setEditing(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:shadow-md">
      {editing ? (
        <div className="space-y-3">
          <Field label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <Field
            label="Transcript"
            as="textarea"
            rows={6}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
          <div className="flex items-center gap-3 pt-1">
            <IconButton onClick={save} disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </IconButton>
            <IconButton
              variant="ghost"
              onClick={() => {
                setEditing(false)
                setTitle(note.title)
                setTranscript(note.transcript)
              }}
              disabled={busy}
            >
              Cancel
            </IconButton>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-800">{note.title}</h3>
            <div className="flex shrink-0 items-center gap-2">
              <IconButton variant="subtle" onClick={() => setEditing(true)}>Edit</IconButton>
              <IconButton variant="danger" onClick={() => onDelete(note._id)}>Delete</IconButton>
            </div>
          </div>

          {note.audioPath && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <audio
                controls
                className="w-full"
                src={`http://localhost:4000/uploads/${note.audioPath}`}
              />
            </div>
          )}

          <p className="whitespace-pre-wrap text-slate-700">
            <span className="font-medium text-slate-900">Transcript:</span> {note.transcript}
          </p>

          <div>
            {note.summary ? (
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/40 p-3">
                <div className="mb-1 font-medium text-slate-900">Summary</div>
                <div className="whitespace-pre-wrap text-slate-700">{note.summary}</div>
              </div>
            ) : (
              <IconButton onClick={() => onSummarize(note._id)} disabled={!!note.summary}>
                Generate Summary
              </IconButton>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchNotes()
      setNotes(data)
    } catch (e) {
      setError('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleUpload = async (blob, title) => {
    const fd = new FormData()
    fd.append('audio', blob, `recording_${Date.now()}.webm`)
    if (title) fd.append('title', title)
    const created = await createNote(fd)
    setNotes((prev) => [created, ...prev])
  }

  const onUpdate = async (id, payload) => {
    const updated = await updateNote(id, payload)
    setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)))
    return updated
  }

  const onDelete = async (id) => {
    await deleteNote(id)
    setNotes((prev) => prev.filter((n) => n._id !== id))
  }

  const onSummarize = async (id) => {
    const updated = await summarizeNote(id)
    setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Convert Voice Notes using AI</h1>
            <p className="text-sm text-slate-500">Record thoughts, transcribe, and auto‑summarize with one click.</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur">
          <div className="mb-2 text-sm font-medium text-slate-700">New recording</div>
          <Recorder onUpload={handleUpload} />
        </section>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            {error}
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-600">
            No notes yet. Record one above.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {notes.map((n) => (
              <NoteCard
                key={n._id}
                note={n}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onSummarize={onSummarize}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-slate-400 fixed inset-x-0 bottom-0">
        Built with <span className="text-blue-500">@ishan</span> using React, gemini ai & Tailwind CSS
      </footer>
    </div>
  )
}
