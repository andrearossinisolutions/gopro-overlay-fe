import { JobsTable } from '@/components/JobsTable';
import { UploadCard } from '@/components/UploadCard';
import { listJobs } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const jobs = await listJobs().catch(() => []);

  return (
    <main className="container grid">
      <section className="hero card">
        <h1>GoPro Overlay Frontend MVP</h1>
        <p>
          Upload, lista job, preview overlay nel browser e invio della richiesta di render al backend FastAPI.
          È pensato per lavorare subito con il backend MVP che hai già generato.
        </p>
      </section>

      <div className="grid-2">
        <UploadCard />
        <div className="card stack">
          <h2>Come testarlo</h2>
          <div className="small muted">
            1. avvia il backend su porta 8000<br />
            2. avvia questo frontend su porta 3000<br />
            3. carica un MP4 GoPro<br />
            4. apri il job e usa il player per provare l&apos;overlay<br />
            5. invia la richiesta render dal pannello laterale
          </div>
        </div>
      </div>

      <JobsTable jobs={jobs} />

      <div className="footer-note">Nota: il render finale del video continuerà a essere responsabilità del backend. Il frontend qui fa preview e orchestration.</div>
    </main>
  );
}
