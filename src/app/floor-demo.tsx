"use client";

import { useEffect, useState, type ReactNode } from "react";

const GREETING_LIMIT_S = 15;
const URGENT_AT_S = 5;
const TABLE_IDS = [1, 2, 3, 4, 5, 6];
const WAITERS = ["A", "B"] as const;

type WaiterId = (typeof WAITERS)[number];
type TableStatus = "available" | "needsGreeting" | "serving" | "needsCleaning";

type Table = {
  id: number;
  status: TableStatus;
  alertAt: number | null;
  servedBy: WaiterId | null;
  waitedMs: number | null;
};

type Notices = Record<WaiterId, string | null>;

function freshTables(): Table[] {
  return TABLE_IDS.map((id) => ({
    id,
    status: "available",
    alertAt: null,
    servedBy: null,
    waitedMs: null,
  }));
}

const NO_NOTICES: Notices = { A: null, B: null };

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

// Read the wall clock. Only called from click handlers and the ticking
// interval, never while rendering.
function readClock() {
  return Date.now();
}

function otherWaiter(w: WaiterId): WaiterId {
  return w === "A" ? "B" : "A";
}

export default function FloorDemo() {
  const [tables, setTables] = useState<Table[]>(freshTables);
  const [now, setNow] = useState(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [tablesTurned, setTablesTurned] = useState(0);
  const [notices, setNotices] = useState<Notices>(NO_NOTICES);

  useEffect(() => {
    const id = setInterval(() => setNow(readClock()), 250);
    return () => clearInterval(id);
  }, []);

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

  function attend(waiter: WaiterId, id: number) {
    const table = tables.find((t) => t.id === id);
    if (!table || table.status !== "needsGreeting" || table.alertAt === null) return;
    const waited = readClock() - table.alertAt;
    updateTable(id, { status: "serving", servedBy: waiter, waitedMs: waited });
    setResponseTimes((r) => [...r, waited]);
    setNotices({
      [waiter]: null,
      [otherWaiter(waiter)]: `Table ${id} taken by Waiter ${waiter}`,
    } as Notices);
  }

  function guestLeft(id: number) {
    const t = readClock();
    setNow(t);
    updateTable(id, { status: "needsCleaning", alertAt: t, servedBy: null });
  }

  function cleaned(waiter: WaiterId, id: number) {
    const table = tables.find((t) => t.id === id);
    if (!table || table.status !== "needsCleaning") return;
    updateTable(id, {
      status: "available",
      alertAt: null,
      servedBy: null,
      waitedMs: null,
    });
    setTablesTurned((n) => n + 1);
    setNotices({
      [waiter]: `Table ${id} cleaned · now Available`,
      [otherWaiter(waiter)]: `Table ${id} cleaned by Waiter ${waiter}`,
    } as Notices);
  }

  function resetDemo() {
    setTables(freshTables());
    setResponseTimes([]);
    setTablesTurned(0);
    setNotices(NO_NOTICES);
  }

  const avgResponse =
    responseTimes.length === 0
      ? "—"
      : `${(
          responseTimes.reduce((a, b) => a + b, 0) /
          responseTimes.length /
          1000
        ).toFixed(1)}s`;

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-8">
          <div className="mr-auto">
            <p className="text-xl font-bold tracking-tight">
              Seat<span className="text-emerald-400">Sense</span>
            </p>
            <p className="text-sm text-slate-400">
              Every guest greeted within {GREETING_LIMIT_S} seconds. No waving,
              no bells.
            </p>
          </div>
          <Metric label="Avg Response Time" value={avgResponse} />
          <Metric label="Tables Turned" value={String(tablesTurned)} />
          <button
            onClick={resetDemo}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800"
          >
            Reset demo
          </button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-4 py-6 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Floor map */}
        <section aria-labelledby="floor-heading" className="flex flex-col gap-4">
          <div>
            <h2 id="floor-heading" className="text-lg font-semibold">
              Restaurant floor
            </h2>
            <p className="text-sm text-slate-400">
              Each button stands in for a seat sensor.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {tables.map((t) => (
              <TableCard
                key={t.id}
                table={t}
                now={now}
                onGuestSat={() => guestSat(t.id)}
                onGuestLeft={() => guestLeft(t.id)}
              />
            ))}
          </div>
          <Legend />
        </section>

        {/* Smartwatches */}
        <section aria-labelledby="watch-heading" className="flex flex-col gap-4">
          <div>
            <h2 id="watch-heading" className="text-lg font-semibold">
              Waiter smartbands
            </h2>
            <p className="text-sm text-slate-400">
              Both waiters get the same alert at the same moment.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
            {WAITERS.map((w) => (
              <Watch
                key={w}
                waiter={w}
                tables={tables}
                now={now}
                notice={notices[w]}
                onAttend={(id) => attend(w, id)}
                onCleaned={(id) => cleaned(w, id)}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-right">
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <p className="font-mono text-2xl font-bold tabular-nums text-emerald-400">
        {value}
      </p>
    </div>
  );
}

function Legend() {
  const items = [
    ["bg-emerald-500", "Available / Serving"],
    ["bg-amber-400", "Needs greeting"],
    ["bg-red-500", "Under 5s left"],
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
  onGuestSat,
  onGuestLeft,
}: {
  table: Table;
  now: number;
  onGuestSat: () => void;
  onGuestLeft: () => void;
}) {
  const left = secondsLeft(table.alertAt, now);
  const urgent = table.status === "needsGreeting" && left <= URGENT_AT_S;

  let pill = "";
  let pillClass = "";
  let cardClass = "";
  let detail = "";

  switch (table.status) {
    case "available":
      pill = "Available";
      pillClass = "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40";
      cardClass = "border-slate-800";
      detail = "Waiting for guests";
      break;
    case "needsGreeting":
      pill = "Needs Greeting";
      pillClass = urgent
        ? "bg-red-500 text-white"
        : "bg-amber-400 text-amber-950";
      cardClass = urgent ? "border-red-500" : "border-amber-400";
      detail = left > 0 ? `${mmss(left)} left to greet` : "Overdue!";
      break;
    case "serving":
      pill = `Served by Waiter ${table.servedBy}`;
      pillClass = "bg-emerald-500 text-emerald-950";
      cardClass = "border-emerald-500";
      detail = `Greeted in ${mmss(Math.floor((table.waitedMs ?? 0) / 1000))}`;
      break;
    case "needsCleaning":
      pill = "Needs Cleaning";
      pillClass = "bg-blue-500 text-white";
      cardClass = "border-blue-500";
      detail = "Waiting for a waiter to clean";
      break;
  }

  return (
    <article
      aria-label={`Table ${table.id}`}
      className={`flex min-h-44 flex-col gap-3 rounded-2xl border-2 bg-slate-900 p-4 transition-colors ${cardClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold">Table {table.id}</h3>
        <span className="text-xl" aria-hidden>
          🍽️
        </span>
      </div>
      <span
        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${pillClass}`}
      >
        {pill}
      </span>
      <p className="text-sm text-slate-400">{detail}</p>
      <div className="mt-auto">
        {table.status === "available" && (
          <button
            onClick={onGuestSat}
            aria-label={`Guest Sat at Table ${table.id}`}
            className="w-full rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-white"
          >
            Guest Sat
          </button>
        )}
        {table.status === "serving" && (
          <button
            onClick={onGuestLeft}
            aria-label={`Guest Left Table ${table.id}`}
            className="w-full rounded-xl border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800"
          >
            Guest Left
          </button>
        )}
      </div>
    </article>
  );
}

function Watch({
  waiter,
  tables,
  now,
  notice,
  onAttend,
  onCleaned,
}: {
  waiter: WaiterId;
  tables: Table[];
  now: number;
  notice: string | null;
  onAttend: (id: number) => void;
  onCleaned: (id: number) => void;
}) {
  const byAlertTime = (a: Table, b: Table) => (a.alertAt ?? 0) - (b.alertAt ?? 0);
  const alerts = [
    ...tables.filter((t) => t.status === "needsGreeting").sort(byAlertTime),
    ...tables.filter((t) => t.status === "needsCleaning").sort(byAlertTime),
  ];
  const top = alerts[0];
  const serving = tables.filter(
    (t) => t.status === "serving" && t.servedBy === waiter
  );

  let faceClass = "bg-black";
  let body: ReactNode;

  if (top && top.status === "needsGreeting") {
    const left = secondsLeft(top.alertAt, now);
    faceClass = "alert-flash";
    body = (
      <>
        <p className="text-lg font-bold leading-tight">
          Table {top.id}: New Guest
        </p>
        <p className="font-mono text-4xl font-bold tabular-nums sm:text-5xl">
          {mmss(left)}
        </p>
        <p className="text-xs font-semibold uppercase tracking-wider text-red-100">
          {left > 0 ? "Greet now" : "Overdue!"}
        </p>
        <button
          onClick={() => onAttend(top.id)}
          aria-label={`Attending Table ${top.id} (Waiter ${waiter})`}
          className="mt-1 w-full rounded-full bg-white py-3 text-base font-extrabold text-red-700 shadow-lg active:scale-95"
        >
          Attending
        </button>
      </>
    );
  } else if (top && top.status === "needsCleaning") {
    faceClass = "bg-blue-700";
    body = (
      <>
        <p className="text-4xl" aria-hidden>
          🧽
        </p>
        <p className="text-lg font-bold leading-tight">
          Table {top.id}: Clean Table
        </p>
        <button
          onClick={() => onCleaned(top.id)}
          aria-label={`Cleaned Table ${top.id} (Waiter ${waiter})`}
          className="mt-1 w-full rounded-full bg-white py-3 text-base font-extrabold text-blue-700 shadow-lg active:scale-95"
        >
          Cleaned
        </button>
      </>
    );
  } else if (serving.length > 0) {
    faceClass = "bg-emerald-600";
    body = (
      <>
        <p className="text-4xl" aria-hidden>
          ✓
        </p>
        {serving.map((t) => (
          <p key={t.id} className="text-lg font-bold leading-tight">
            Serving Table {t.id} ({mmss(Math.floor((t.waitedMs ?? 0) / 1000))})
          </p>
        ))}
      </>
    );
  } else {
    body = (
      <>
        <p className="text-2xl font-bold text-slate-200">Idle / Ready</p>
        <p className="text-sm text-slate-500">Waiting for a table</p>
      </>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col items-center">
      {/* strap */}
      <div className="h-10 w-28 rounded-t-3xl bg-linear-to-b from-slate-800 to-slate-700" />
      <div className="relative w-full max-w-60 rounded-[3rem] border-[6px] border-slate-600 bg-slate-900 p-2 shadow-2xl shadow-black/60">
        {/* crown */}
        <div className="absolute -right-2.5 top-20 h-12 w-2 rounded-r-md bg-slate-500" />
        <div
          aria-label={`Waiter ${waiter} watch`}
          aria-live="polite"
          className={`flex h-80 flex-col items-center gap-2 rounded-[2.4rem] px-5 py-5 text-center text-white transition-colors ${faceClass}`}
        >
          <div className="flex w-full items-center justify-between gap-1 whitespace-nowrap text-[0.65rem] font-semibold uppercase tracking-wide">
            <span>Waiter {waiter}</span>
            <span className="flex items-center gap-1 text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              On Shift
            </span>
          </div>
          <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
            {body}
          </div>
          {alerts.length > 1 && (
            <p className="text-xs font-semibold text-white/90">
              +{alerts.length - 1} more alert{alerts.length > 2 ? "s" : ""}
            </p>
          )}
          {!top && notice && (
            <p className="w-full rounded-xl bg-white/10 px-2 py-1 text-xs text-white/90">
              {notice}
            </p>
          )}
        </div>
      </div>
      <div className="h-10 w-28 rounded-b-3xl bg-linear-to-t from-slate-800 to-slate-700" />
    </div>
  );
}
