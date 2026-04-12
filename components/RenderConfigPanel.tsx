'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BACKEND_BASE_URL,
  createRender,
  defaultRenderConfig,
  getJob,
  RenderConfig,
  RenderResponse,
  JobStatus,
} from '@/lib/api';

type Props = {
  jobId: string;
  initialJobStatus?: JobStatus;
  initialProgress?: number;
  initialStep?: string;
  existingRenderUrl?: string | null;
};

export function RenderConfigPanel({
  jobId,
  initialJobStatus,
  initialProgress = 0,
  initialStep = '',
  existingRenderUrl,
}: Props) {
  const router = useRouter();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [config, setConfig] = useState<RenderConfig>(defaultRenderConfig);
  const [loading, setLoading] = useState(initialJobStatus === 'rendering');
  const [isPolling, setIsPolling] = useState(initialJobStatus === 'rendering');
  const [renderProgress, setRenderProgress] = useState(initialProgress);
  const [renderStep, setRenderStep] = useState(initialStep || (initialJobStatus === 'rendering' ? 'Rendering in corso...' : ''));
  const [result, setResult] = useState<RenderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof RenderConfig>(key: K, value: RenderConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setIsPolling(false);
  }

  async function pollJobStatus() {
    try {
      const job = await getJob(jobId);

      setRenderProgress(job.progress ?? 0);
      setRenderStep(job.step ?? '');

      if (job.status === 'done') {
        stopPolling();
        setLoading(false);
        setResult((prev) => ({
          ...(prev ?? { jobId, status: 'done' }),
          jobId,
          status: 'done',
          message: 'Render completato',
          renderedVideoUrl: job.render_output_path
            ? `${BACKEND_BASE_URL}/${job.render_output_path.replace(/^\/+/, '')}`
            : prev?.renderedVideoUrl,
        }));
        router.refresh();
        return;
      }

      if (job.status === 'error') {
        stopPolling();
        setLoading(false);
        setError(job.error_message || 'Render fallito.');
        return;
      }

      if (job.status !== 'rendering') {
        stopPolling();
        setLoading(false);
      }
    } catch (err) {
      stopPolling();
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Errore durante il controllo dello stato render.');
    }
  }

  async function handleRender() {
    setLoading(true);
    setIsPolling(false);
    setRenderProgress(0);
    setRenderStep('Avvio render...');
    setError(null);
    setResult(null);

    try {
      const response = await createRender(jobId, config);
      setResult(response);

      setIsPolling(true);
      await pollJobStatus();

      pollRef.current = setInterval(() => {
        void pollJobStatus();
      }, 1500);
    } catch (err) {
      stopPolling();
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Render fallito');
    }
  }

  useEffect(() => {
    if (initialJobStatus === 'rendering' && !pollRef.current) {
      void pollJobStatus();
      pollRef.current = setInterval(() => {
        void pollJobStatus();
      }, 1500);
    }

    return () => {
      stopPolling();
    };
  }, [initialJobStatus, jobId]);

  const finalUrl =
    result?.renderedVideoUrl
      ? result.renderedVideoUrl.startsWith('http')
        ? result.renderedVideoUrl
        : `${BACKEND_BASE_URL}${result.renderedVideoUrl}`
      : existingRenderUrl || null;

  return (
    <div className="card stack">
      <div>
        <h3>Configurazione overlay</h3>
        <p className="muted">
          Questa azione chiama il backend e genera davvero un nuovo MP4 con overlay bruciato nel video.
        </p>
      </div>

      <label className="stack small">
        Tema
        <select
          className="select"
          value={config.theme}
          onChange={(e) => setField('theme', e.target.value as RenderConfig['theme'])}
        >
          <option value="minimal-dark">minimal-dark</option>
          <option value="minimal-light">minimal-light</option>
        </select>
      </label>

      <label className="stack small">
        Unità
        <select
          className="select"
          value={config.units}
          onChange={(e) => setField('units', e.target.value as RenderConfig['units'])}
        >
          <option value="metric">metric</option>
          <option value="imperial">imperial</option>
        </select>
      </label>

      <label className="stack small">
        Posizione
        <select
          className="select"
          value={config.position}
          onChange={(e) => setField('position', e.target.value as RenderConfig['position'])}
        >
          <option value="top-left">top-left</option>
          <option value="top-right">top-right</option>
          <option value="bottom-left">bottom-left</option>
          <option value="bottom-right">bottom-right</option>
        </select>
      </label>

      <label className="stack small">
        Font scale
        <input
          className="input"
          type="number"
          step="0.1"
          value={config.fontScale}
          onChange={(e) => setField('fontScale', Number(e.target.value))}
        />
      </label>

      <label className="stack small">
        Margine
        <input
          className="input"
          type="number"
          value={config.margin}
          onChange={(e) => setField('margin', Number(e.target.value))}
        />
      </label>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <label className="row small">
          <input type="checkbox" checked={config.showSpeed} onChange={(e) => setField('showSpeed', e.target.checked)} />
          Velocità
        </label>
        <label className="row small">
          <input type="checkbox" checked={config.showAltitude} onChange={(e) => setField('showAltitude', e.target.checked)} />
          Altitudine
        </label>
        <label className="row small">
          <input type="checkbox" checked={config.showCoordinates} onChange={(e) => setField('showCoordinates', e.target.checked)} />
          Coordinate
        </label>
        <label className="row small">
          <input type="checkbox" checked={config.showMiniMap} onChange={(e) => setField('showMiniMap', e.target.checked)} />
          Mini mappa
        </label>
        <label className="row small">
          <input type="checkbox" checked={config.showTimestamp} onChange={(e) => setField('showTimestamp', e.target.checked)} />
          Timestamp
        </label>
      </div>

      <button className="btn" onClick={handleRender} disabled={loading}>
        {loading ? `Rendering ${renderProgress}%` : 'Renderizza MP4'}
      </button>

      {(loading || isPolling) ? (
        <div className="stack">
          <div className="small muted">
            {renderStep || 'Rendering in corso...'} {renderProgress}%
          </div>
          <div
            style={{
              width: '100%',
              height: 10,
              background: '#e5e7eb',
              borderRadius: 9999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.max(0, Math.min(100, renderProgress))}%`,
                height: '100%',
                background: '#111827',
                transition: 'width 180ms linear',
              }}
            />
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="small" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="stack">
          <div className="small muted">{result.message || 'Render avviato'}</div>
          {result.telemetryMode === 'mock' ? (
            <div className="small" style={{ color: '#b45309' }}>
              Nota: il video finale è reale, ma la telemetria usata per l’overlay è ancora simulata.
            </div>
          ) : null}
          <pre className="map-box">{JSON.stringify(result, null, 2)}</pre>
        </div>
      ) : null}

      {finalUrl ? (
        <a className="btn secondary" href={finalUrl} target="_blank" rel="noreferrer">
          Apri / scarica video renderizzato
        </a>
      ) : null}
    </div>
  );
}