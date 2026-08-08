import type { WeekdayHours } from "@/lib/types";

const WEEKDAY_ORDER: WeekdayHours["weekday"][] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

const WEEKDAY_LABEL: Record<WeekdayHours["weekday"], string> = {
  monday: "Montag", tuesday: "Dienstag", wednesday: "Mittwoch", thursday: "Donnerstag",
  friday: "Freitag", saturday: "Samstag", sunday: "Sonntag",
};

const WEEKDAY_LABEL_SHORT: Record<WeekdayHours["weekday"], string> = {
  monday: "Mo", tuesday: "Di", wednesday: "Mi", thursday: "Do",
  friday: "Fr", saturday: "Sa", sunday: "So",
};

export interface OpeningHoursGroup {
  label: string;
  closed: boolean;
  timeText: string;
}

function sortByWeek(hours: WeekdayHours[]): WeekdayHours[] {
  return WEEKDAY_ORDER.map((day) => hours.find((h) => h.weekday === day)).filter(
    (h): h is WeekdayHours => Boolean(h)
  );
}

function sameHours(a: WeekdayHours, b: WeekdayHours): boolean {
  if (a.closed !== b.closed) return false;
  if (a.closed) return true;
  return a.opens === b.opens && a.closes === b.closes;
}

/**
 * Groups consecutive weekdays with identical hours into ranges, e.g.
 * "Mittwoch – Samstag: 11:30–21:30 Uhr" instead of listing every day, but
 * without ever claiming a day is open when it's separately marked closed.
 */
export function groupOpeningHours(hours: WeekdayHours[], short = false): OpeningHoursGroup[] {
  const sorted = sortByWeek(hours);
  const labels = short ? WEEKDAY_LABEL_SHORT : WEEKDAY_LABEL;
  const groups: OpeningHoursGroup[] = [];

  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sameHours(sorted[j + 1], sorted[i])) j++;

    const start = sorted[i];
    const end = sorted[j];
    const label = i === j ? labels[start.weekday] : `${labels[start.weekday]} – ${labels[end.weekday]}`;
    const timeText = start.closed ? "Ruhetag" : `${start.opens} – ${start.closes} Uhr`;

    groups.push({ label, closed: start.closed, timeText });
    i = j + 1;
  }

  return groups;
}

function berlinPartsNow(now: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const weekdayName = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";

  const weekdayMap: Record<string, WeekdayHours["weekday"]> = {
    Monday: "monday", Tuesday: "tuesday", Wednesday: "wednesday", Thursday: "thursday",
    Friday: "friday", Saturday: "saturday", Sunday: "sunday",
  };

  // Some ICU builds render 24:00 instead of 00:00 for midnight — normalize it.
  const hourNum = hour === "24" ? 0 : parseInt(hour, 10);

  return { weekday: weekdayMap[weekdayName], minutesSinceMidnight: hourNum * 60 + parseInt(minute, 10) };
}

function toMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

export type OpenStatus =
  | { known: false }
  | { known: true; state: "open" }
  | { known: true; state: "closed" }
  | { known: true; state: "opens-later"; opensAt: string };

/** Reliable only for same-day opening hours (no overnight spans) — which is what this business has. */
export function getOpenStatus(hours: WeekdayHours[], now: Date = new Date()): OpenStatus {
  const { weekday, minutesSinceMidnight } = berlinPartsNow(now);
  const today = hours.find((h) => h.weekday === weekday);
  if (!today) return { known: false };

  if (today.closed) return { known: true, state: "closed" };

  const opens = today.opens ? toMinutes(today.opens) : null;
  const closes = today.closes ? toMinutes(today.closes) : null;
  if (opens === null || closes === null) return { known: false };

  if (minutesSinceMidnight < opens) return { known: true, state: "opens-later", opensAt: today.opens! };
  if (minutesSinceMidnight >= closes) return { known: true, state: "closed" };
  return { known: true, state: "open" };
}
