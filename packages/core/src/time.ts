/** Event time in minutes since midnight; fractions are allowed (e.g. 615.5 = 10:15:30). */
export type EventTime = number;

/** Parses `"HH:MM"` into minutes since midnight. */
export const toMin = (hhmm: string): EventTime => {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Formats minutes since midnight as `"HH:MM"`, or `"HH:MM:SS"` when `seconds` is true. */
export const fmtClock = (min: EventTime, seconds = false) => {
  const total = Math.floor(min * 60 + 1e-6);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const hm = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return seconds ? `${hm}:${String(sec).padStart(2, "0")}` : hm;
};
