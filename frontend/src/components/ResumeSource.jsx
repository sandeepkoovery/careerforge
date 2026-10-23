import { useEffect, useRef, useState } from 'react'
import { UploadCloud, FileText, X } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../auth'

/**
 * Lets the user choose where resume text comes from: upload, paste, or a saved resume.
 * Exposes a `source` object upward; call `toFormData(source, extra)` to submit.
 */
export function toFormData(source, extra = {}) {
  const fd = new FormData()
  if (source.mode === 'upload' && source.file) fd.append('file', source.file)
  if (source.mode === 'paste') fd.append('text', source.text)
  if (source.mode === 'saved') fd.append('resume_id', source.resumeId)
  Object.entries(extra).forEach(([k, v]) => v && fd.append(k, v))
  return fd
}

export function sourceReady(s) {
  return (s.mode === 'upload' && s.file) || (s.mode === 'paste' && s.text.trim().length > 30) || (s.mode === 'saved' && s.resumeId)
}

export default function ResumeSource({ value, onChange }) {
  const { user } = useAuth()
  const [resumes, setResumes] = useState([])
  const [drag, setDrag] = useState(false)
  const input = useRef()

  useEffect(() => {
    if (user) api.get('/resumes').then((r) => setResumes(r.resumes)).catch(() => {})
  }, [user])

  const set = (patch) => onChange({ ...value, ...patch })
  const pick = (f) => f && set({ file: f })

  return (
    <div>
      <div className="tabs" style={{ marginBottom: 14 }}>
        {[['upload', 'Upload'], ['paste', 'Paste text'], ...(user ? [['saved', 'My resumes']] : [])].map(([m, label]) => (
          <button key={m} className={`tab ${value.mode === m ? 'active' : ''}`} onClick={() => set({ mode: m })}>{label}</button>
        ))}
      </div>

      {value.mode === 'upload' && (
        <div
          className={`dropzone ${drag ? 'drag' : ''}`}
          onClick={() => input.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }}
        >
          <input ref={input} type="file" hidden accept=".pdf,.docx,.txt" onChange={(e) => pick(e.target.files[0])} />
          {value.file ? (
            <div className="row" style={{ justifyContent: 'center' }}>
              <FileText color="#a78bfa" />
              <strong>{value.file.name}</strong>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); set({ file: null }) }}><X size={16} /></button>
            </div>
          ) : (
            <>
              <UploadCloud size={38} color="#a78bfa" />
              <p style={{ fontWeight: 600, marginTop: 8 }}>Drop your resume here or click to browse</p>
              <p className="muted small">PDF, DOCX or TXT · up to 5 MB</p>
            </>
          )}
        </div>
      )}

      {value.mode === 'paste' && (
        <textarea className="textarea" style={{ minHeight: 220 }} placeholder="Paste your full resume text here…" value={value.text} onChange={(e) => set({ text: e.target.value })} />
      )}

      {value.mode === 'saved' && (
        <select className="select" value={value.resumeId} onChange={(e) => set({ resumeId: e.target.value })}>
          <option value="">Select a resume…</option>
          {resumes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
        </select>
      )}
    </div>
  )
}

export const emptySource = { mode: 'upload', file: null, text: '', resumeId: '' }
