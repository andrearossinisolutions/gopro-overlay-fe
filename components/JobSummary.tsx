import { Job } from '@/lib/api';
import { formatBytes, formatSeconds } from '@/lib/format';

export function JobSummary({ job }: { job: Job }) {
  return (
    <div className="card stack">
      <div className="row-between">
        <div>
          <h3>{job.original_filename}</h3>
          <div className="small muted">Job ID: {job.id}</div>
        </div>
        <span className={`badge ${job.status}`}>{job.status}</span>
      </div>

      <div className="kv">
        <div>Durata</div><div>{formatSeconds(job.video.duration_seconds)}</div>
        <div>Risoluzione</div><div>{job.video.width} × {job.video.height}</div>
        <div>FPS</div><div>{job.video.fps || '-'}</div>
        <div>Codec</div><div>{job.video.codec}</div>
        <div>Dimensione</div><div>{formatBytes(job.uploaded_size_bytes)}</div>
        <div>Step</div><div>{job.step}</div>
      </div>
    </div>
  );
}
