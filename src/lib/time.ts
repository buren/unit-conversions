export function toSeconds(hours: number, minutes: number, seconds: number): number {
  return hours * 3600 + minutes * 60 + seconds;
}

export function fromSeconds(totalSeconds: number): { hours: number; minutes: number; seconds: number } {
  totalSeconds = Math.round(totalSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

export function formatTime(totalSeconds: number): string {
  const { hours, minutes, seconds } = fromSeconds(totalSeconds);
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (hours === 0) return `${mm}:${ss}`;
  const hh = String(hours).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function formatPace(minutes: number, seconds: number): string {
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
