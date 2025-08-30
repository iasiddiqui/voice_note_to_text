import React, { useRef, useState } from 'react'

export default function Recorder({ onUpload }) {
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const [recording, setRecording] = useState(false)
  const [title, setTitle] = useState('')

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    chunksRef.current = []
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      await onUpload(blob, title)
      setTitle('')
    }
    mr.start()
    mediaRecorderRef.current = mr
    setRecording(true)
  }

  const stop = () => {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop())
    setRecording(false)
  }

  return (
    <div className="flex items-center gap-3 mb-4">
      <input
        type="text"
        placeholder="Note title (optional)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {!recording ? (
        <button
          onClick={start}
          className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium shadow-md hover:bg-green-600 transition"
        >
          🎤 Start
        </button>
      ) : (
        <button
          onClick={stop}
          className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium shadow-md hover:bg-red-600 transition"
        >
          ⏹ Stop
        </button>
      )}
    </div>
  )
}
