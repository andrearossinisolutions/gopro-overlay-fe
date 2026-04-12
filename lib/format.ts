export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const whole = Math.round(seconds);
  const hrs = Math.floor(whole / 3600);
  const mins = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;
  if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function formatSpeedKmh(speed: number, units: 'metric' | 'imperial' | 'hybrid'): string {
  if (!Number.isFinite(speed)) return '-';
  if (units === 'imperial') return `${(speed * 0.621371).toFixed(1)} mph`;
  return `${speed.toFixed(1)} km/h`;
}

export function formatAltitudeMeters(alt: number, units: 'metric' | 'imperial' | 'hybrid'): string {
  if (!Number.isFinite(alt)) return '-';
  if (units !== 'metric') return `${(alt * 3.28084).toFixed(0)} ft`;
  return `${alt.toFixed(0)} m`;
}

export function formatCoordinates(lat: number, lon: number): string {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return '-';
  return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}
