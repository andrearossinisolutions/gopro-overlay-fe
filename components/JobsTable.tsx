import Link from 'next/link';
import { Job } from '@/lib/api';
import { formatBytes, formatSeconds } from '@/lib/format';

function statusClass(status: string): string {
  return `badge ${status}`;
}

export function JobsTable({ jobs }: { jobs: Job[] }) {
  return (
    <div className="card">
      <div className="row-between">
        <h2>Job recenti</h2>
        <span className="muted small">{jobs.length} elementi</span>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>File</th>
            <th>Stato</th>
            <th>Durata</th>
            <th>Dimensione</th>
            <th>GPS</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={6} className="muted">Nessun job ancora creato.</td>
            </tr>
          ) : jobs.map((job) => (
            <tr key={job.id}>
              <td>
                <div><strong>{job.original_filename}</strong></div>
                <div className="small muted">{job.id}</div>
              </td>
              <td><span className={statusClass(job.status)}>{job.status}</span></td>
              <td>{formatSeconds(job.video.duration_seconds)}</td>
              <td>{formatBytes(job.uploaded_size_bytes)}</td>
              <td>{job.telemetry.has_gps ? 'Sì' : 'No / mock'}</td>
              <td><Link className="btn secondary" href={`/jobs/${job.id}`}>Apri</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
