'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { defaultRenderConfig, RenderConfig, TelemetryPayload, backendFileUrl, getPreview, Job } from '@/lib/api';
import { formatAltitudeMeters, formatCoordinates, formatSeconds, formatSpeedKmh } from '@/lib/format';

function nearestSample(payload: TelemetryPayload | null, t: number) {
  if (!payload || payload.samples.length === 0) return null;
  let best = payload.samples[0];
  let bestDist = Math.abs(best.t - t);
  for (const sample of payload.samples) {
    const dist = Math.abs(sample.t - t);
    if (dist < bestDist) {
      best = sample;
      bestDist = dist;
    }
  }
  return best;
}

export function VideoOverlayPlayer({ job, telemetry }: { job: Job; telemetry: TelemetryPayload | null }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [renderConfig, setRenderConfig] = useState<RenderConfig>(defaultRenderConfig);
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const fileUrl = useMemo(() => backendFileUrl(job.uploaded_path), [job.uploaded_path]);
  const sample = useMemo(() => nearestSample(telemetry, currentTime), [telemetry, currentTime]);

  useEffect(() => {
    if (!previewEnabled || !job.id) return;
    let active = true;
    const id = window.setInterval(async () => {
      try {
        const video = videoRef.current;
        if (!video) return;
        await getPreview(job.id, video.currentTime);
        if (active) setPreviewError(null);
      } catch (err) {
        if (active) setPreviewError(err instanceof Error ? err.message : 'Preview endpoint non disponibile');
      }
    }, 1500);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [job.id, previewEnabled]);

  return (
    <div className="card stack">
      <div className="row-between">
        <div>
          <h3>Player + overlay preview</h3>
          <p className="muted">L’overlay qui è renderizzato dal frontend. È la base giusta per la preview interattiva prima del render finale lato backend.</p>
        </div>
        <label className="row small">
          <input type="checkbox" checked={previewEnabled} onChange={(e) => setPreviewEnabled(e.target.checked)} /> ping /preview
        </label>
      </div>

      <div className="row" style={{ flexWrap: 'wrap' }}>
        <label className="stack small">
          Posizione
          <select className="select" value={renderConfig.position} onChange={(e) => setRenderConfig((p) => ({ ...p, position: e.target.value as RenderConfig['position'] }))}>
            <option value="top-left">top-left</option>
            <option value="top-right">top-right</option>
            <option value="bottom-left">bottom-left</option>
            <option value="bottom-right">bottom-right</option>
          </select>
        </label>
        <label className="stack small">
          Unità
          <select className="select" value={renderConfig.units} onChange={(e) => setRenderConfig((p) => ({ ...p, units: e.target.value as RenderConfig['units'] }))}>
            <option value="metric">metric</option>
            <option value="imperial">imperial</option>
          </select>
        </label>
        <label className="row small"><input type="checkbox" checked={renderConfig.showCoordinates} onChange={(e) => setRenderConfig((p) => ({ ...p, showCoordinates: e.target.checked }))} /> Coordinate</label>
        <label className="row small"><input type="checkbox" checked={renderConfig.showMiniMap} onChange={(e) => setRenderConfig((p) => ({ ...p, showMiniMap: e.target.checked }))} /> Mini mappa</label>
        <label className="row small"><input type="checkbox" checked={renderConfig.showTimestamp} onChange={(e) => setRenderConfig((p) => ({ ...p, showTimestamp: e.target.checked }))} /> Timestamp</label>
      </div>

      <div className="player-shell">
        {fileUrl ? (
          <video
            ref={videoRef}
            className="player-video"
            controls
            src={fileUrl}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          />
        ) : (
          <div style={{ padding: 32 }} className="muted">Nessun file video disponibile.</div>
        )}

        {sample ? (
          <div className="overlay">
            <div className={`overlay-box ${renderConfig.position}`} style={{ transform: `scale(${renderConfig.fontScale})`, transformOrigin: renderConfig.position.includes('right') ? 'bottom right' : 'bottom left' }}>
              <div className="overlay-title">Telemetry preview</div>
              <div className="overlay-grid">
                <div className="overlay-metric">
                  <div className="label">Velocità</div>
                  <div className="value">{formatSpeedKmh(sample.speed_kmh, renderConfig.units)}</div>
                </div>
                <div className="overlay-metric">
                  <div className="label">Altitudine</div>
                  <div className="value">{formatAltitudeMeters(sample.alt, renderConfig.units)}</div>
                </div>
              </div>
              <div className="overlay-meta">Tempo video: {formatSeconds(currentTime)}</div>
              {renderConfig.showCoordinates ? <div className="overlay-meta">GPS: {formatCoordinates(sample.lat, sample.lon)}</div> : null}
              {renderConfig.showTimestamp ? <div className="overlay-meta">Campione t={sample.t.toFixed(2)}s · heading {sample.heading.toFixed(0)}°</div> : null}
              {renderConfig.showMiniMap ? <div className="overlay-meta">Mini mappa: placeholder frontend pronto per componente Leaflet/Canvas.</div> : null}
            </div>
          </div>
        ) : null}
      </div>

      {previewError ? <div className="small" style={{ color: 'var(--danger)' }}>{previewError}</div> : null}
      <div className="small muted">Tempo corrente: {currentTime.toFixed(2)}s</div>
    </div>
  );
}
