"use client";

import { useEffect, useState, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Demo rules
// ---------------------------------------------------------------------------

const GREETING_LIMIT_S = 15; // the promise: every guest greeted within 15s
const URGENT_AT_S = 5; // table card turns red in the last 5 seconds
const ESCALATE_AFTER_S = 8; // runners are alerted if nobody claims it by then
const BUSY_AFTER_ATTEND_S = 12; // staff are "Busy Serving" this long after attending

type ZoneId = "A" | "B" | "C";
type Role = ZoneId | "Runner";
type TableStatus = "available" | "needsGreeting" | "dining" | "needsCleaning";

type Table = {
  id: number;
  zone: ZoneId;
  status: TableStatus;
  alertAt: number | null;
  servedBy: number | null;
  waitedMs: number | null;
};

type Staff = { id: number; role: Role; onBreak: boolean };
type BusyInfo = { until: number; tableId: number; waitedMs: number };
type BusyMap = Record<number, BusyInfo>;
type Notices = Record<number, string | null>;

// ---------------------------------------------------------------------------
// Local sample data
// ---------------------------------------------------------------------------

const ZONES: { id: ZoneId; first: number; last: number }[] = [
  { id: "A", first: 1, last: 9 },
  { id: "B", first: 10, last: 17 },
  { id: "C", first: 18, last: 25 },
];
const TOTAL_TABLES = 25;

const STAFF: Staff[] = [
  { id: 1, role: "A", onBreak: false },
  { id: 2, role: "B", onBreak: false },
  { id: 3, role: "Runner", onBreak: false },
  { id: 4, role: "C", onBreak: false },
  { id: 5, role: "A", onBreak: false },
  { id: 6, role: "B", onBreak: false },
  { id: 7, role: "C", onBreak: false },
  { id: 8, role: "A", onBreak: false },
  { id: 9, role: "B", onBreak: false },
  { id: 10, role: "C", onBreak: false },
  { id: 11, role: "A", onBreak: false },
  { id: 12, role: "B", onBreak: true },
  { id: 13, role: "C", onBreak: true },
  { id: 14, role: "Runner", onBreak: false },
  { id: 15, role: "Runner", onBreak: false },
];

// The three watches shown on screen.
const FEATURED_STAFF = [1, 2, 3];

const ROSTER_GROUPS: { label: string; role: Role }[] = [
  { label: "Zone A", role: "A" },
  { label: "Zone B", role: "B" },
  { label: "Zone C", role: "C" },
  { label: "Runners", role: "Runner" },
];

// Tables already dining when the demo opens, and which waiter has them.
const DINING_AT_START: Record<number, number> = {
  2: 5,
  6: 8,
  11: 6,
  13: 9,
  16: 2,
  19: 7,
  21: 10,
  24: 4,
};

function zoneOf(tableId: number): ZoneId {
  const zone = ZONES.find((z) => tableId >= z.first && tableId <= z.last);
  return zone ? zone.id : "C";
}

function startingTables(): Table[] {
  return Array.from({ length: TOTAL_TABLES }, (_, i) => {
    const id = i + 1;
    const waiter = DINING_AT_START[id];
    return {
      id,
      zone: zoneOf(id),
      status: waiter ? "dining" : "available",
      alertAt: null,
      servedBy: waiter ?? null,
      waitedMs: null,
    };
  });
}

// ---------------------------------------------------------------------------
// Helpers. readClock and the random picks are only used from click handlers
// and the ticking interval, never while rendering.
// ---------------------------------------------------------------------------

function readClock() {
  return Date.now();
}

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// 4–5 random free tables, covering every zone that has a free table.
function pickRushTables(tables: Table[]): number[] {
  const free = shuffled(tables.filter((t) => t.status === "available"));
  const picked: Table[] = [];
  for (const z of ZONES) {
    const t = free.find((x) => x.zone === z.id);
    if (t) picked.push(t);
  }
  const target = 4 + Math.floor(Math.random() * 2);
  for (const t of free) {
    if (picked.length >= target) break;
    if (!picked.includes(t)) picked.push(t);
  }
  return picked.map((t) => t.id);
}

function mmss(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function secondsLeft(alertAt: number | null, now: number) {
  if (alertAt === null) return GREETING_LIMIT_S;
  const left = Math.ceil((GREETING_LIMIT_S * 1000 - (now - alertAt)) / 1000);
  return Math.min(GREETING_LIMIT_S, Math.max(0, left));
}

function isBusy(busy: BusyMap, staffId: number, now: number) {
  const b = busy[staffId];
  return !!b && b.until > now;
}

function isAvailable(s: Staff, busy: BusyMap, now: number) {
  return !s.onBreak && !isBusy(busy, s.id, now);
}

function isAlerting(t: Table) {
  return t.status === "needsGreeting" || t.status === "needsCleaning";
}

// Who gets this table's alert right now: the zone's free staff, plus free
// runners once 8 seconds pass unclaimed (or straight away if the zone has
// nobody free).
function recipientsFor(t: Table, busy: BusyMap, now: number): number[] {
  if (!isAlerting(t) || t.alertAt === null) return [];
  const zoneStaff = STAFF.filter(
    (s) => s.role === t.zone && isAvailable(s, busy, now)
  );
  const escalated =
    zoneStaff.length === 0 || now - t.alertAt >= ESCALATE_AFTER_S * 1000;
  const runners = escalated
    ? STAFF.filter((s) => s.role === "Runner" && isAvailable(s, busy, now))
    : [];
  return [...zoneStaff, ...runners].map((s) => s.id);
}

// New guests before cleaning; oldest first.
function alertOrder(a: Table, b: Table) {
  if (a.status !== b.status) return a.status === "needsGreeting" ? -1 : 1;
  return (a.alertAt ?? 0) - (b.alertAt ?? 0);
}

function roleLabel(role: Role) {
  return role === "Runner" ? "Runner · All zones" : `Zone ${role}`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FloorDemo() {
  const [tables, setTables] = useState<Table[]>(startingTables);
  const [busy, setBusy] = useState<BusyMap>({});
  const [now, setNow] = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [tablesTurned, setTablesTurned] = useState(0);
  const [notices, setNotices] = useState<Notices>({});

  useEffect(() => {
    const id = setInterval(() => setNow(readClock()), 250);
    return () => clearInterval(id);
  }, []);

  // ---- derived, live state ----
  const recipients = new Map<number, number[]>();
  for (const t of tables) recipients.set(t.id, recipientsFor(t, busy, now));
  const alertedStaff = new Set([...recipients.values()].flat());
  const alertsFor = (staffId: number) =>
    tables
      .filter((t) => recipients.get(t.id)?.includes(staffId))
      .sort(alertOrder);

  const activeTables = tables.filter((t) => t.status !== "available").length;
  const availableStaff = STAFF.filter((s) => isAvailable(s, busy, now)).length;
  const avgResponse =
    responseTimes.length === 0
      ? "—"
      : `${(
          responseTimes.reduce((a, b) => a + b, 0) /
          responseTimes.length /
          1000
        ).toFixed(1)}s`;
  const freeTables = TOTAL_TABLES - activeTables;

  // ---- actions ----
  function updateTable(id: number, patch: Partial<Table>) {
    setTables((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function guestSat(id: number) {
    const t = readClock();
    setNow(t);
    updateTable(id, {
      status: "needsGreeting",
      alertAt: t,
      servedBy: null,
      waitedMs: null,
    });
  }

  function guestLeft(id: number) {
    const t = readClock();
    setNow(t);
    updateTable(id, {
      status: "needsCleaning",
      alertAt: t,
      servedBy: null,
      waitedMs: null,
    });
  }

  function rushHour() {
    const t = readClock();
    const ids = new Set(pickRushTables(tables));
    setNow(t);
    setTables((ts) =>
      ts.map((x) =>
        ids.has(x.id) && x.status === "available"
          ? { ...x, status: "needsGreeting", alertAt: t, servedBy: null, waitedMs: null }
          : x
      )
    );
  }

  function attend(staffId: number, tableId: number) {
    const t = readClock();
    const table = tables.find((x) => x.id === tableId);
    if (!table || table.status !== "needsGreeting" || table.alertAt === null) return;
    const waited = t - table.alertAt;
    const others = recipientsFor(table, busy, t).filter((id) => id !== staffId);
    setNow(t);
    updateTable(tableId, { status: "dining", servedBy: staffId, waitedMs: waited });
    setBusy((b) => ({
      ...b,
      [staffId]: { until: t + BUSY_AFTER_ATTEND_S * 1000, tableId, waitedMs: waited },
    }));
    setResponseTimes((r) => [...r, waited]);
    setNotices((n) => {
      const next: Notices = { ...n, [staffId]: null };
      for (const id of others) next[id] = `Table ${tableId} taken by Waiter ${staffId}`;
      return next;
    });
  }

  function cleaned(staffId: number, tableId: number) {
    const t = readClock();
    const table = tables.find((x) => x.id === tableId);
    if (!table || table.status !== "needsCleaning") return;
    const others = recipientsFor(table, busy, t).filter((id) => id !== staffId);
    setNow(t);
    updateTable(tableId, {
      status: "available",
      alertAt: null,
      servedBy: null,
      waitedMs: null,
    });
    setTablesTurned((n) => n + 1);
    setNotices((n) => {
      const next: Notices = {
        ...n,
        [staffId]: `Table ${tableId} cleaned · now Available`,
      };
      for (const id of others) next[id] = `Table ${tableId} cleaned by Waiter ${staffId}`;
      return next;
    });
  }

  function resetDemo() {
    setTables(startingTables());
    setBusy({});
    setResponseTimes([]);
    setTablesTurned(0);
    setNotices({});
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="mr-auto">
              <p className="text-xl font-bold tracking-tight">
                Zero<span className="text-emerald-400">Bell</span>
              </p>
              <p className="text-sm text-slate-400">
                Every guest greeted within {GREETING_LIMIT_S} seconds. No waving,
                no bells.
              </p>
            </div>
            <button
              onClick={rushHour}
              disabled={freeTables === 0}
              className="rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-amber-950 shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-300 disabled:opacity-40"
            >
              ⚡ Simulate Rush Hour
            </button>
            <button
              onClick={resetDemo}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800"
            >
              Reset demo
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric label="Active Tables" value={`${activeTables}/${TOTAL_TABLES}`} />
            <Metric
              label="Available Staff"
              value={`${availableStaff}/${STAFF.length}`}
            />
            <Metric label="Avg Response Time" value={avgResponse} />
            <Metric label="Tables Turned Today" value={String(tablesTurned)} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1600px] flex-1 gap-8 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Floor map */}
        <section aria-labelledby="floor-heading" className="flex flex-col gap-3">
          <div>
            <h2 id="floor-heading" className="text-lg font-semibold">
              Restaurant floor
            </h2>
            <p className="text-sm text-slate-400">
              25 tables in 3 zones. Each button stands in for a seat sensor.
            </p>
          </div>
          {ZONES.map((z) => {
            const zoneStaff = STAFF.filter((s) => s.role === z.id);
            const free = zoneStaff.filter((s) => isAvailable(s, busy, now)).length;
            return (
              <div key={z.id} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold">
                    Zone {z.id}{" "}
                    <span className="text-sm font-normal text-slate-400">
                      · Tables {z.first}–{z.last}
                    </span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    {free}/{zoneStaff.length} staff free
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                  {tables
                    .filter((t) => t.zone === z.id)
                    .map((t) => (
                      <TableCard
                        key={t.id}
                        table={t}
                        now={now}
                        alerted={recipients.get(t.id) ?? []}
                        onGuestSat={() => guestSat(t.id)}
                        onGuestLeft={() => guestLeft(t.id)}
                      />
                    ))}
                </div>
              </div>
            );
          })}
          <Legend />
        </section>

        {/* Roster + smartwatches */}
        <section aria-labelledby="staff-heading" className="flex flex-col gap-6">
          <Roster busy={busy} now={now} alerted={alertedStaff} />
          <div>
            <h2 className="text-lg font-semibold">Live smartbands</h2>
            <p className="text-sm text-slate-400">
              Alerts go to the table&apos;s zone first, then to runners after{" "}
              {ESCALATE_AFTER_S}s.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-3">
            {FEATURED_STAFF.map((id) => {
              const staff = STAFF.find((s) => s.id === id);
              if (!staff) return null;
              return (
                <Watch
                  key={id}
                  staff={staff}
                  alerts={alertsFor(id)}
                  busyInfo={isBusy(busy, id, now) ? busy[id] : null}
                  now={now}
                  notice={notices[id] ?? null}
                  onAttend={(tableId) => attend(id, tableId)}
                  onCleaned={(tableId) => cleaned(id, tableId)}
                />
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2">
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <p className="font-mono text-2xl font-bold tabular-nums text-emerald-400">
        {value}
      </p>
    </div>
  );
}

function Legend() {
  const items = [
    ["bg-emerald-500", "Available"],
    ["bg-amber-400", "Needs greeting"],
    ["bg-red-500", "Under 5s left"],
    ["bg-teal-400", "Dining"],
    ["bg-blue-500", "Needs cleaning"],
  ];
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
      {items.map(([color, label]) => (
        <li key={label} className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${color}`} />
          {label}
        </li>
      ))}
    </ul>
  );
}

function TableCard({
  table,
  now,
  alerted,
  onGuestSat,
  onGuestLeft,
}: {
  table: Table;
  now: number;
  alerted: number[];
  onGuestSat: () => void;
  onGuestLeft: () => void;
}) {
  const left = secondsLeft(table.alertAt, now);
  const urgent = table.status === "needsGreeting" && left <= URGENT_AT_S;
  const runnersIn = alerted.some(
    (id) => STAFF.find((s) => s.id === id)?.role === "Runner"
  );
  const reach =
    alerted.length === 0
      ? "No staff free"
      : runnersIn
      ? `${alerted.length} alerted + runners`
      : `${alerted.length} alerted`;

  let cardClass = "";
  let status: ReactNode = null;

  switch (table.status) {
    case "available":
      cardClass = "border-emerald-500/40 bg-emerald-500/5";
      status = <p className="text-xs font-semibold text-emerald-300">Available</p>;
      break;
    case "needsGreeting":
      cardClass = urgent
        ? "border-red-500 bg-red-500/15"
        : "border-amber-400 bg-amber-400/10";
      status = (
        <>
          <p
            className={`font-mono text-lg font-bold leading-none tabular-nums ${
              urgent ? "text-red-400" : "text-amber-300"
            }`}
          >
            {left > 0 ? mmss(left) : "Overdue"}
          </p>
          <p className="text-[0.65rem] text-slate-300">{reach}</p>
        </>
      );
      break;
    case "dining":
      cardClass = "border-teal-400/70 bg-teal-400/10";
      status = (
        <>
          <p className="text-xs font-semibold text-teal-300">Dining</p>
          <p className="text-[0.65rem] text-slate-300">
            Waiter {table.servedBy}
            {table.waitedMs !== null &&
              ` · ${mmss(Math.floor(table.waitedMs / 1000))}`}
          </p>
        </>
      );
      break;
    case "needsCleaning":
      cardClass = "border-blue-500 bg-blue-500/15";
      status = (
        <>
          <p className="text-xs font-semibold text-blue-300">Needs Cleaning</p>
          <p className="text-[0.65rem] text-slate-300">{reach}</p>
        </>
      );
      break;
  }

  return (
    <article
      aria-label={`Table ${table.id}`}
      className={`flex min-h-24 flex-col gap-0.5 rounded-xl border-2 p-1.5 transition-colors ${cardClass}`}
    >
      <p className="text-sm font-bold">T{table.id}</p>
      <div className="flex flex-col gap-0.5">{status}</div>
      <div className="mt-auto">
        {table.status === "available" && (
          <button
            onClick={onGuestSat}
            aria-label={`Guest Sat at Table ${table.id}`}
            className="w-full rounded-lg bg-slate-100 px-1 py-1 text-xs font-semibold text-slate-950 transition-colors hover:bg-white"
          >
            Guest Sat
          </button>
        )}
        {table.status === "dining" && (
          <button
            onClick={onGuestLeft}
            aria-label={`Guest Left Table ${table.id}`}
            className="w-full rounded-lg border border-slate-600 px-1 py-1 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800"
          >
            Guest Left
          </button>
        )}
      </div>
    </article>
  );
}

function Roster({
  busy,
  now,
  alerted,
}: {
  busy: BusyMap;
  now: number;
  alerted: Set<number>;
}) {
  const onBreak = STAFF.filter((s) => s.onBreak).length;
  const busyCount = STAFF.filter((s) => !s.onBreak && isBusy(busy, s.id, now)).length;
  const available = STAFF.length - onBreak - busyCount;
  const pct = (n: number) => `${(n / STAFF.length) * 100}%`;

  return (
    <div
      aria-labelledby="staff-heading"
      className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="staff-heading" className="text-lg font-semibold">
          Shift roster · {STAFF.length} staff
        </h2>
        <p className="text-sm text-slate-300">
          <span className="text-emerald-300">{available} Available</span> ·{" "}
          <span className="text-teal-300">{busyCount} Busy Serving</span> ·{" "}
          <span className="text-slate-400">{onBreak} On Break</span>
        </p>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div className="bg-emerald-500 transition-all" style={{ width: pct(available) }} />
        <div className="bg-teal-400 transition-all" style={{ width: pct(busyCount) }} />
        <div className="bg-slate-600 transition-all" style={{ width: pct(onBreak) }} />
      </div>
      <ul className="flex flex-col gap-2">
        {ROSTER_GROUPS.map((g) => (
          <li key={g.role} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {g.label}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {STAFF.filter((s) => s.role === g.role).map((s) => {
                const isB = !s.onBreak && isBusy(busy, s.id, now);
                const isAlerted = alerted.has(s.id);
                const featured = FEATURED_STAFF.includes(s.id);
                const state = s.onBreak ? "On Break" : isB ? "Busy Serving" : "Available";
                const chipClass = s.onBreak
                  ? "bg-slate-800 text-slate-500"
                  : isB
                  ? "bg-teal-400 text-teal-950"
                  : "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/40";
                return (
                  <span
                    key={s.id}
                    title={`Waiter ${s.id} · ${roleLabel(s.role)} · ${state}${
                      isAlerted ? " · alerted" : ""
                    }`}
                    className={`rounded-md px-2 py-1 font-mono text-xs font-semibold ${chipClass} ${
                      isAlerted ? "animate-pulse ring-2 ring-red-500" : ""
                    }`}
                  >
                    {featured && <span aria-hidden>⌚</span>}W{s.id}
                    {s.onBreak && <span className="ml-1 font-sans font-normal">break</span>}
                  </span>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-500">
        ⌚ = shown as a live watch below. A red ring means that person is being
        alerted right now.
      </p>
    </div>
  );
}

function Watch({
  staff,
  alerts,
  busyInfo,
  now,
  notice,
  onAttend,
  onCleaned,
}: {
  staff: Staff;
  alerts: Table[];
  busyInfo: BusyInfo | null;
  now: number;
  notice: string | null;
  onAttend: (tableId: number) => void;
  onCleaned: (tableId: number) => void;
}) {
  const top = alerts[0];
  const isRunner = staff.role === "Runner";
  const zoneLine = (t: Table) => (isRunner ? `Backup · Zone ${t.zone}` : `Zone ${t.zone}`);

  let faceClass = "bg-black";
  let statusText = "On Shift";
  let body: ReactNode;

  if (top && top.status === "needsGreeting") {
    const left = secondsLeft(top.alertAt, now);
    faceClass = "alert-flash";
    body = (
      <>
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-red-100">
          {zoneLine(top)}
        </p>
        <p className="text-base font-bold leading-tight">Table {top.id}: New Guest</p>
        <p className="font-mono text-4xl font-bold tabular-nums">{mmss(left)}</p>
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-red-100">
          {left > 0 ? "Greet now" : "Overdue!"}
        </p>
        <button
          onClick={() => onAttend(top.id)}
          aria-label={`Attending Table ${top.id} (Waiter ${staff.id})`}
          className="mt-1 w-full rounded-full bg-white py-2.5 text-sm font-extrabold text-red-700 shadow-lg active:scale-95"
        >
          Attending
        </button>
      </>
    );
  } else if (top) {
    faceClass = "bg-blue-700";
    body = (
      <>
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-blue-100">
          {zoneLine(top)}
        </p>
        <p className="text-3xl" aria-hidden>
          🧽
        </p>
        <p className="text-base font-bold leading-tight">Table {top.id}: Clean Table</p>
        <button
          onClick={() => onCleaned(top.id)}
          aria-label={`Cleaned Table ${top.id} (Waiter ${staff.id})`}
          className="mt-1 w-full rounded-full bg-white py-2.5 text-sm font-extrabold text-blue-700 shadow-lg active:scale-95"
        >
          Cleaned
        </button>
      </>
    );
  } else if (busyInfo) {
    faceClass = "bg-emerald-600";
    statusText = "Busy";
    const freeIn = Math.max(0, Math.ceil((busyInfo.until - now) / 1000));
    body = (
      <>
        <p className="text-3xl" aria-hidden>
          ✓
        </p>
        <p className="text-base font-bold leading-tight">
          Serving Table {busyInfo.tableId} ({mmss(Math.floor(busyInfo.waitedMs / 1000))})
        </p>
        <p className="text-xs text-emerald-100">Free again in {freeIn}s</p>
      </>
    );
  } else {
    body = (
      <>
        <p className="text-xl font-bold text-slate-200">Idle / Ready</p>
        <p className="text-xs text-slate-500">Waiting for a table</p>
      </>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col items-center">
      <p className="mb-2 text-center text-xs font-semibold text-slate-300">
        Waiter {staff.id} · {roleLabel(staff.role)}
      </p>
      {/* strap */}
      <div className="h-8 w-24 rounded-t-3xl bg-linear-to-b from-slate-800 to-slate-700" />
      <div className="relative w-full max-w-52 rounded-[2.6rem] border-[5px] border-slate-600 bg-slate-900 p-1.5 shadow-2xl shadow-black/60">
        {/* crown */}
        <div className="absolute -right-2.5 top-16 h-10 w-2 rounded-r-md bg-slate-500" />
        <div
          aria-label={`Waiter ${staff.id} watch`}
          aria-live="polite"
          className={`flex h-72 flex-col items-center gap-1.5 rounded-[2.1rem] px-4 py-4 text-center text-white transition-colors ${faceClass}`}
        >
          <div className="flex w-full items-center justify-between gap-1 whitespace-nowrap text-[0.6rem] font-semibold uppercase tracking-wide">
            <span>W{staff.id} · {isRunner ? "Runner" : `Zone ${staff.role}`}</span>
            <span className="flex items-center gap-1 text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {statusText}
            </span>
          </div>
          <div className="flex w-full flex-1 flex-col items-center justify-center gap-1.5">
            {body}
          </div>
          {alerts.length > 1 && (
            <p className="text-[0.65rem] font-semibold text-white/90">
              +{alerts.length - 1} more alert{alerts.length > 2 ? "s" : ""}
            </p>
          )}
          {!top && !busyInfo && notice && (
            <p className="w-full rounded-xl bg-white/10 px-2 py-1 text-[0.65rem] text-white/90">
              {notice}
            </p>
          )}
        </div>
      </div>
      <div className="h-8 w-24 rounded-b-3xl bg-linear-to-t from-slate-800 to-slate-700" />
    </div>
  );
}
