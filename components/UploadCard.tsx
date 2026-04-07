'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadVideo } from '@/lib/api';

export function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const result = await uploadVideo(file);
      router.push(`/jobs/${result.jobId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fallito.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card stack">
      <div>
        <h2>Carica un video GoPro</h2>
        <p className="muted">Questa UI è già pronta per testare upload, anteprima overlay e richiesta di render al backend.</p>
      </div>

      <input
        className="file-input"
        type="file"
        accept="video/mp4,video/quicktime,video/x-m4v"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      {file ? <div className="small">Selezionato: <strong>{file.name}</strong></div> : null}
      {error ? <div className="small" style={{ color: 'var(--danger)' }}>{error}</div> : null}

      <div className="row">
        <button className="btn" onClick={handleUpload} disabled={!file || loading}>
          {loading ? 'Caricamento...' : 'Upload e analisi'}
        </button>
      </div>
    </div>
  );
}
