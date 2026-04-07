import { Job, TelemetryPayload } from '@/lib/api';

export function TelemetryStats({ job, telemetry }: { job: Job; telemetry: TelemetryPayload | null }) {
  return (
    <div className="card stack">
      <h3>Statistiche telemetria</h3>
      <div className="stat-grid">
        <div className="stat-box">
          <div className="label">Punti</div>
          <div className="value">{job.telemetry.points}</div>
        </div>
        <div className="stat-box">
          <div className="label">Distanza</div>
          <div className="value">{job.telemetry.distance_km.toFixed(2)} km</div>
        </div>
        <div className="stat-box">
          <div className="label">Velocità max</div>
          <div className="value">{job.telemetry.max_speed_kmh.toFixed(1)} km/h</div>
        </div>
        <div className="stat-box">
          <div className="label">Dislivello</div>
          <div className="value">{job.telemetry.elevation_gain_m.toFixed(0)} m</div>
        </div>
      </div>

      <div>
        <div className="small muted" style={{ marginBottom: 8 }}>Estratto samples</div>
        <div className="map-box">{JSON.stringify(telemetry?.samples.slice(0, 10) ?? [], null, 2)}</div>
      </div>
    </div>
  );
}
