import Link from 'next/link';
import { JobSummary } from '@/components/JobSummary';
import { RenderConfigPanel } from '@/components/RenderConfigPanel';
import { TelemetryStats } from '@/components/TelemetryStats';
import { VideoOverlayPlayer } from '@/components/VideoOverlayPlayer';
import { backendFileUrl, getJob, getTelemetry } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function JobPage({ params }: { params: { id: string } }) {
  const job = await getJob(params.id);
  const telemetry = await getTelemetry(params.id).catch(() => null);
  const renderedVideoUrl = backendFileUrl(job.render_output_path);

  return (
    <main className="container grid">
      <div className="row-between">
        <Link href="/" className="btn secondary">← Torna alla home</Link>
        <div className="small muted">Dettaglio job</div>
      </div>

      <div className="grid-2">
        <div className="stack">
          <JobSummary job={job} />
          <VideoOverlayPlayer job={job} telemetry={telemetry} />
          <TelemetryStats job={job} telemetry={telemetry} />

          {renderedVideoUrl ? (
            <div className="card stack">
              <h3>Video renderizzato</h3>
              <video className="player-video" controls src={renderedVideoUrl} />
              <a className="btn secondary" href={renderedVideoUrl} target="_blank" rel="noreferrer">
                Apri / scarica MP4 finale
              </a>
            </div>
          ) : null}
        </div>

        <div className="stack">
          <RenderConfigPanel
            jobId={job.id}
            initialJobStatus={job.status}
            initialProgress={job.progress}
            initialStep={job.step}
            existingRenderUrl={renderedVideoUrl}
          />
          <div className="card stack">
            <h3>Stato attuale</h3>
            <div className="small muted">
              Il render finale viene eseguito dal backend con ffmpeg.<br />
              La preview nel player qui sopra resta invece lato frontend.<br />
              In questa versione l’overlay usa ancora telemetria mock.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}