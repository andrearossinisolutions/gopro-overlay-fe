'use client';

import { useState } from 'react';
import { BACKEND_BASE_URL, createRender, defaultRenderConfig, RenderConfig, RenderResponse } from '@/lib/api';

export function RenderConfigPanel({ jobId, existingRenderUrl }: { jobId: string; existingRenderUrl?: string | null }) {
  const [config, setConfig] = useState<RenderConfig>(defaultRenderConfig);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RenderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof RenderConfig>(key: K, value: RenderConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRender() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await createRender(jobId, config);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Render fallito');
    } finally {
      setLoading(false);
    }
  }

  const finalUrl = result?.renderedVideoUrl ? `${BACKEND_BASE_URL}${result.renderedVideoUrl}` : existingRenderUrl || null;

  return (
    <div className="card stack">
      <div>
        <h3>Configurazione overlay</h3>
        <p className="muted">Questa azione chiama il backend e genera davvero un nuovo MP4 con overlay bruciato nel video.</p>
      </div>

      <label className="stack small">
        Tema
        <select className="select" value={config.theme} onChange={(e) => setField('theme', e.target.value as RenderConfig['theme'])}>
          <option value="minimal-dark">minimal-dark</option>
          <option value="minimal-light">minimal-light</option>
        </select>
      </label>

      <label className="stack small">
        Unità
        <select className="select" value={config.units} onChange={(e) => setField('units', e.target.value as RenderConfig['units'])}>
          <option value="metric">metric</option>
          <option value="imperial">imperial</option>
        </select>
      </label>

      <label className="stack small">
        Posizione
        <select className="select" value={config.position} onChange={(e) => setField('position', e.target.value as RenderConfig['position'])}>
          <option value="top-left">top-left</option>
          <option value="top-right">top-right</option>
          <option value="bottom-left">bottom-left</option>
          <option value="bottom-right">bottom-right</option>
        </select>
      </label>

      <label className="stack small">
        Font scale
        <input className="input" type="number" step="0.1" value={config.fontScale} onChange={(e) => setField('fontScale', Number(e.target.value))} />
      </label>

      <label className="stack small">
        Margine
        <input className="input" type="number" value={config.margin} onChange={(e) => setField('margin', Number(e.target.value))} />
      </label>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <label className="row small"><input type="checkbox" checked={config.showSpeed} onChange={(e) => setField('showSpeed', e.target.checked)} /> Velocità</label>
        <label className="row small"><input type="checkbox" checked={config.showAltitude} onChange={(e) => setField('showAltitude', e.target.checked)} /> Altitudine</label>
        <label className="row small"><input type="checkbox" checked={config.showCoordinates} onChange={(e) => setField('showCoordinates', e.target.checked)} /> Coordinate</label>
        <label className="row small"><input type="checkbox" checked={config.showMiniMap} onChange={(e) => setField('showMiniMap', e.target.checked)} /> Mini mappa</label>
        <label className="row small"><input type="checkbox" checked={config.showTimestamp} onChange={(e) => setField('showTimestamp', e.target.checked)} /> Timestamp</label>
      </div>

      <button className="btn" onClick={handleRender} disabled={loading}>{loading ? 'Rendering in corso...' : 'Renderizza MP4'}</button>

      {error ? <div className="small" style={{ color: 'var(--danger)' }}>{error}</div> : null}

      {result ? (
        <div className="stack">
          <div className="small muted">{result.message || 'Render completato'}</div>
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
