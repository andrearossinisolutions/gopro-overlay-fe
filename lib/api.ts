export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
export const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://127.0.0.1:8000';

export type JobStatus = 'uploaded' | 'parsing' | 'ready' | 'rendering' | 'done' | 'error';

export type Job = {
  id: string;
  original_filename: string;
  uploaded_path?: string | null;
  uploaded_size_bytes: number;
  status: JobStatus;
  progress: number;
  step: string;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  video: {
    duration_seconds: number;
    fps: number;
    width: number;
    height: number;
    codec: string;
  };
  telemetry: {
    has_gps: boolean;
    points: number;
    distance_km: number;
    max_speed_kmh: number;
    elevation_gain_m: number;
  };
  telemetry_path?: string | null;
  render_output_path?: string | null;
  render_config_path?: string | null;
};

export type RenderConfig = {
  theme: 'minimal-dark' | 'minimal-light';
  units: 'metric' | 'imperial';
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showSpeed: boolean;
  showAltitude: boolean;
  showCoordinates: boolean;
  showMiniMap: boolean;
  showTimestamp: boolean;
  fontScale: number;
  margin: number;
};

export type TelemetrySample = {
  t: number;
  lat: number;
  lon: number;
  alt: number;
  speed_kmh: number;
  heading: number;
};

export type TelemetryPayload = {
  video: {
    duration_seconds?: number;
    duration?: number;
    fps: number;
    width: number;
    height: number;
  };
  samples: TelemetrySample[];
};

export type PreviewPayload = {
  jobId: string;
  time: number;
  sample: TelemetrySample;
  overlay: {
    speedLabel: string;
    altitudeLabel: string;
    coordinatesLabel: string;
    timestampLabel: string;
  };
};

export type RenderResponse = {
  jobId: string;
  status: string;
  message?: string;
  telemetryMode?: 'mock' | 'real';
  renderedVideoUrl?: string;
  renderConfigUrl?: string;
  renderManifestUrl?: string;
  config?: RenderConfig;
};

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function listJobs(): Promise<Job[]> {
  const response = await fetch(`${API_BASE_URL}/jobs`, { cache: 'no-store' });
  const data = await parseJson<{ items: Job[] }>(response);
  return data.items;
}

export async function getJob(jobId: string): Promise<Job> {
  return parseJson<Job>(await fetch(`${API_BASE_URL}/jobs/${jobId}`, { cache: 'no-store' }));
}

export async function getTelemetry(jobId: string): Promise<TelemetryPayload> {
  return parseJson<TelemetryPayload>(await fetch(`${API_BASE_URL}/jobs/${jobId}/telemetry`, { cache: 'no-store' }));
}

export async function getPreview(jobId: string, t: number): Promise<PreviewPayload> {
  return parseJson<PreviewPayload>(await fetch(`${API_BASE_URL}/jobs/${jobId}/preview?t=${encodeURIComponent(String(t))}`, { cache: 'no-store' }));
}

export function uploadVideoWithProgress(
  file: File,
  onProgress: (percent: number) => void
): Promise<{ jobId: string; status: string; fileUrl: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/uploads`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(percent);
    };

    xhr.onload = () => {
      const responseText = xhr.responseText || '';

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(responseText));
        } catch {
          reject(new Error('Risposta non valida dal server.'));
        }
        return;
      }

      reject(new Error(responseText || `HTTP ${xhr.status}`));
    };

    xhr.onerror = () => {
      reject(new Error('Errore di rete durante l’upload.'));
    };

    xhr.onabort = () => {
      reject(new Error('Upload annullato.'));
    };

    xhr.send(formData);
  });
}

export async function createRender(jobId: string, config: RenderConfig): Promise<RenderResponse> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return parseJson<RenderResponse>(response);
}

export function backendFileUrl(relativePath?: string | null): string | null {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  return `${BACKEND_BASE_URL}/${relativePath.replace(/^\/+/, '')}`;
}

export const defaultRenderConfig: RenderConfig = {
  theme: 'minimal-dark',
  units: 'metric',
  position: 'bottom-left',
  showSpeed: true,
  showAltitude: true,
  showCoordinates: false,
  showMiniMap: true,
  showTimestamp: true,
  fontScale: 1,
  margin: 24,
};
