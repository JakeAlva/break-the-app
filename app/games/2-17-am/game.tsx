"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useGameAudio } from "../../useGameAudio";
import styles from "./game.module.css";

type UnitKind = "medical" | "fire" | "police" | "rescue";
type GamePhase = "briefing" | "active" | "complete";

type ResponseUnit = {
  id: string;
  name: string;
  shortName: string;
  kind: UnitKind;
  crew: string;
  busy: number;
};

type Incident = {
  id: string;
  code: string;
  title: string;
  district: string;
  transcript: string;
  clue: string;
  best: UnitKind;
  duration: number;
  ttl: number;
  people: number;
  value: number;
  x: number;
  y: number;
};

type RadioEntry = {
  id: number;
  time: string;
  title: string;
  detail: string;
  tone: "neutral" | "good" | "bad";
};

type ShiftSummary = {
  score: number;
  trust: number;
  protected: number;
  resolved: number;
  missed: number;
};

const INITIAL_UNITS: ResponseUnit[] = [
  { id: "medic-3", name: "Medic 3", shortName: "M-3", kind: "medical", crew: "ADVANCED LIFE SUPPORT", busy: 0 },
  { id: "ladder-2", name: "Ladder 2", shortName: "L-2", kind: "fire", crew: "FIRE + EXTRACTION", busy: 0 },
  { id: "patrol-7", name: "Patrol 7", shortName: "P-7", kind: "police", crew: "PUBLIC SAFETY", busy: 0 },
  { id: "rescue-1", name: "Rescue 1", shortName: "R-1", kind: "rescue", crew: "MULTI-ROLE RESPONSE", busy: 0 },
];

const INCIDENTS: Incident[] = [
  {
    id: "river-fire",
    code: "F-208",
    title: "Apartment smoke",
    district: "River Market",
    transcript: "Third-floor caller reports smoke under the hallway door. Two neighbors may still be inside.",
    clue: "Fire is spreading upward through a shared stairwell.",
    best: "fire",
    duration: 2,
    ttl: 2,
    people: 3,
    value: 180,
    x: 64,
    y: 24,
  },
  {
    id: "east-breathing",
    code: "M-114",
    title: "Breathing difficulty",
    district: "East Loop",
    transcript: "Caller can only speak a few words at a time. No smoke, injury, or threat reported.",
    clue: "The patient needs advanced medical support quickly.",
    best: "medical",
    duration: 2,
    ttl: 2,
    people: 1,
    value: 150,
    x: 79,
    y: 57,
  },
  {
    id: "rail-breakin",
    code: "P-091",
    title: "Warehouse break-in",
    district: "Rail Yard",
    transcript: "Security guard sees a cut fence and flashlight movement between parked freight cars.",
    clue: "No fire or injuries are reported. The suspect may still be present.",
    best: "police",
    duration: 1,
    ttl: 3,
    people: 0,
    value: 110,
    x: 29,
    y: 70,
  },
  {
    id: "west-pileup",
    code: "R-442",
    title: "Highway pileup",
    district: "Westbank",
    transcript: "Three vehicles, one overturned. Fuel is leaking and a driver may be trapped.",
    clue: "This scene combines extraction, hazard control, and first aid.",
    best: "rescue",
    duration: 3,
    ttl: 2,
    people: 4,
    value: 230,
    x: 17,
    y: 48,
  },
  {
    id: "midtown-elevator",
    code: "F-317",
    title: "Elevator stalled",
    district: "Midtown",
    transcript: "Five passengers are trapped between floors. One reports a burning smell near the control panel.",
    clue: "The car needs technical extraction and electrical isolation.",
    best: "fire",
    duration: 2,
    ttl: 3,
    people: 5,
    value: 190,
    x: 49,
    y: 45,
  },
  {
    id: "lakeside-missing",
    code: "P-224",
    title: "Missing child",
    district: "Lakeside",
    transcript: "A nine-year-old was last seen leaving a playground ten minutes ago in a blue raincoat.",
    clue: "A coordinated area search must begin before the trail goes cold.",
    best: "police",
    duration: 2,
    ttl: 2,
    people: 1,
    value: 180,
    x: 82,
    y: 79,
  },
  {
    id: "oldport-gas",
    code: "F-610",
    title: "Gas alarm",
    district: "Old Port",
    transcript: "Restaurant staff feel dizzy. A detector is sounding near the basement utility room.",
    clue: "The building must be evacuated and the suspected leak isolated.",
    best: "fire",
    duration: 2,
    ttl: 2,
    people: 6,
    value: 220,
    x: 38,
    y: 84,
  },
  {
    id: "hillcrest-fall",
    code: "M-388",
    title: "Rooftop fall",
    district: "Hillcrest",
    transcript: "Worker fell approximately twelve feet. Conscious, severe leg pain, no continuing hazard.",
    clue: "The scene is stable, but the patient requires medical stabilization.",
    best: "medical",
    duration: 2,
    ttl: 3,
    people: 1,
    value: 140,
    x: 25,
    y: 19,
  },
  {
    id: "south-disturbance",
    code: "P-535",
    title: "Domestic disturbance",
    district: "Southside",
    transcript: "Neighbor hears glass breaking and a person shouting for someone to leave the apartment.",
    clue: "The caller reports a potential threat, but no fire or injury is confirmed.",
    best: "police",
    duration: 2,
    ttl: 2,
    people: 2,
    value: 170,
    x: 58,
    y: 76,
  },
  {
    id: "university-lab",
    code: "R-703",
    title: "Laboratory odor",
    district: "University",
    transcript: "Students report a sharp chemical odor after a dropped container. The label is unreadable.",
    clue: "Unknown material, uncertain exposure, and an evacuation in progress.",
    best: "rescue",
    duration: 3,
    ttl: 3,
    people: 8,
    value: 240,
    x: 67,
    y: 39,
  },
  {
    id: "north-transformer",
    code: "F-829",
    title: "Transformer sparks",
    district: "North End",
    transcript: "Power equipment is arcing beside a residential building. Rainwater is pooling nearby.",
    clue: "A live electrical fire threatens the surrounding structure.",
    best: "fire",
    duration: 2,
    ttl: 2,
    people: 4,
    value: 190,
    x: 46,
    y: 11,
  },
  {
    id: "harbor-collapse",
    code: "M-941",
    title: "Passenger collapsed",
    district: "Harbor Terminal",
    transcript: "Adult passenger collapsed while boarding. Not responding normally; breathing status uncertain.",
    clue: "No environmental danger is reported. Immediate patient care is the priority.",
    best: "medical",
    duration: 2,
    ttl: 2,
    people: 1,
    value: 170,
    x: 12,
    y: 84,
  },
];

const KIND_LABELS: Record<UnitKind, string> = {
  medical: "MEDICAL",
  fire: "FIRE",
  police: "POLICE",
  rescue: "RESCUE",
};

const SCENE_ART: Record<UnitKind, string> = {
  medical: "/arcade/scene-medical.jpg",
  fire: "/arcade/scene-fire.jpg",
  police: "/arcade/scene-police.jpg",
  rescue: "/arcade/scene-rescue.jpg",
};

const formatClock = (elapsed: number) => {
  const total = 137 + elapsed;
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const rotateDeck = (offset: number) => {
  const shift = offset % INCIDENTS.length;
  return [...INCIDENTS.slice(shift), ...INCIDENTS.slice(0, shift)];
};

export default function DispatchGame() {
  const audio = useGameAudio();
  const [phase, setPhase] = useState<GamePhase>("briefing");
  const [run, setRun] = useState(0);
  const deck = useMemo(() => rotateDeck(run * 3), [run]);
  const [minute, setMinute] = useState(0);
  const [nextCall, setNextCall] = useState(3);
  const [active, setActive] = useState<Incident[]>(deck.slice(0, 3));
  const [units, setUnits] = useState<ResponseUnit[]>(INITIAL_UNITS);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(deck[0].id);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [trust, setTrust] = useState(100);
  const [protectedCount, setProtectedCount] = useState(0);
  const [resolved, setResolved] = useState(0);
  const [missed, setMissed] = useState(0);
  const [summary, setSummary] = useState<ShiftSummary | null>(null);
  const [radio, setRadio] = useState<RadioEntry[]>([]);

  const selectedCall = active.find((incident) => incident.id === selectedIncident) ?? null;
  const selectedResponse = units.find((unit) => unit.id === selectedUnit) ?? null;
  const readyUnits = units.filter((unit) => unit.busy === 0).length;

  const addRadio = (title: string, detail: string, tone: RadioEntry["tone"] = "neutral", atMinute = minute) => {
    setRadio((entries) => [
      { id: Date.now() + entries.length, time: formatClock(atMinute), title, detail, tone },
      ...entries,
    ].slice(0, 8));
  };

  const beginShift = () => {
    audio.play("navigate");
    setMinute(0);
    setNextCall(3);
    setActive(deck.slice(0, 3));
    setUnits(INITIAL_UNITS.map((unit) => ({ ...unit, busy: 0 })));
    setSelectedIncident(deck[0].id);
    setSelectedUnit(null);
    setScore(0);
    setTrust(100);
    setProtectedCount(0);
    setResolved(0);
    setMissed(0);
    setSummary(null);
    setRadio([
      {
        id: Date.now(),
        time: "02:17",
        title: "Night desk transferred",
        detail: "Four response units available. Three calls waiting.",
        tone: "neutral",
      },
    ]);
    setPhase("active");
  };

  const selectCall = (id: string) => {
    audio.play("tap");
    setSelectedIncident(id);
  };

  const selectResponse = (id: string) => {
    const unit = units.find((candidate) => candidate.id === id);
    if (!unit || unit.busy > 0) return;
    audio.play("tap");
    setSelectedUnit(id);
  };

  const dispatch = () => {
    if (!selectedCall || !selectedResponse || selectedResponse.busy > 0) {
      audio.play("error");
      addRadio("Dispatch incomplete", "Select one active call and one available unit.", "bad");
      return;
    }

    const directMatch = selectedResponse.kind === selectedCall.best;
    const rescueBackup = selectedResponse.kind === "rescue" && selectedCall.best !== "rescue";

    if (directMatch || rescueBackup) {
      const responseValue = rescueBackup ? Math.round(selectedCall.value * 0.7) : selectedCall.value;
      const returnTime = selectedCall.duration + (rescueBackup ? 1 : 0);
      audio.play(directMatch ? "good" : "navigate");
      setScore((value) => value + responseValue + selectedCall.ttl * 10);
      setProtectedCount((value) => value + selectedCall.people);
      setResolved((value) => value + 1);
      setTrust((value) => Math.min(100, value + 2));
      setUnits((items) => items.map((unit) => (
        unit.id === selectedResponse.id ? { ...unit, busy: returnTime } : unit
      )));
      setActive((items) => items.filter((incident) => incident.id !== selectedCall.id));
      addRadio(
        `${selectedResponse.name} dispatched`,
        rescueBackup
          ? `${selectedCall.code} resolved with a slower multi-role response.`
          : `${selectedCall.code} resolved. ${selectedCall.people || "No"} civilian${selectedCall.people === 1 ? "" : "s"} protected.`,
        "good",
      );
      setSelectedIncident(null);
      setSelectedUnit(null);
      return;
    }

    audio.play("error");
    setScore((value) => Math.max(0, value - 30));
    setTrust((value) => Math.max(0, value - 6));
    setUnits((items) => items.map((unit) => (
      unit.id === selectedResponse.id ? { ...unit, busy: 1 } : unit
    )));
    addRadio(
      "Unit redirected",
      `${selectedResponse.name} could not handle ${selectedCall.code}. Read the caller details and try another service.`,
      "bad",
    );
    setSelectedUnit(null);
  };

  const finishShift = (final: ShiftSummary) => {
    audio.play("complete");
    setSummary(final);
    setPhase("complete");
    try {
      const previous = Number(window.localStorage.getItem("fairbyte:217am:high-score") ?? 0);
      if (final.score > previous) {
        window.localStorage.setItem("fairbyte:217am:high-score", String(final.score));
      }
      window.localStorage.setItem("fairbyte:217am:last-rating", getRating(final).label);
    } catch {
      // A blocked storage policy should not interrupt the shift report.
    }
  };

  const advanceMinute = () => {
    if (phase !== "active") return;
    audio.play("navigate");
    const nextMinute = minute + 1;
    const expired = active.filter((incident) => incident.ttl <= 1);
    const survivors = active
      .filter((incident) => incident.ttl > 1)
      .map((incident) => ({ ...incident, ttl: incident.ttl - 1 }));
    const trustLoss = expired.reduce((loss, incident) => loss + 5 + incident.people * 2, 0);
    const nextTrust = Math.max(0, trust - trustLoss);
    const nextMissed = missed + expired.length;
    const returningUnits = units.map((unit) => ({ ...unit, busy: Math.max(0, unit.busy - 1) }));

    expired.forEach((incident) => {
      addRadio(
        `${incident.code} timed out`,
        `${incident.title} was not reached before the situation escalated.`,
        "bad",
        nextMinute,
      );
    });

    let nextActive = survivors;
    let updatedNextCall = nextCall;
    if (nextMinute < 8 && nextCall < deck.length) {
      const incoming = deck[nextCall];
      nextActive = [...nextActive, { ...incoming }];
      updatedNextCall += 1;
      addRadio("New call received", `${incoming.code} · ${incoming.district} · ${incoming.title}`, "neutral", nextMinute);
    }

    setMinute(nextMinute);
    setUnits(returningUnits);
    setTrust(nextTrust);
    setMissed(nextMissed);
    setNextCall(updatedNextCall);
    setActive(nextActive);
    setSelectedIncident(nextActive[0]?.id ?? null);
    setSelectedUnit(null);

    if (nextMinute >= 8 || nextTrust <= 0) {
      const finalUnresolved = nextActive.length;
      const finalTrust = Math.max(
        0,
        nextTrust - nextActive.reduce((loss, incident) => loss + 3 + incident.people, 0),
      );
      finishShift({
        score,
        trust: finalTrust,
        protected: protectedCount,
        resolved,
        missed: nextMissed + finalUnresolved,
      });
    }
  };

  const replay = () => {
    const nextRun = run + 1;
    const nextDeck = rotateDeck(nextRun * 3);
    audio.play("reset");
    setRun(nextRun);
    setMinute(0);
    setNextCall(3);
    setActive(nextDeck.slice(0, 3));
    setUnits(INITIAL_UNITS.map((unit) => ({ ...unit, busy: 0 })));
    setSelectedIncident(nextDeck[0].id);
    setSelectedUnit(null);
    setScore(0);
    setTrust(100);
    setProtectedCount(0);
    setResolved(0);
    setMissed(0);
    setSummary(null);
    setRadio([]);
    setPhase("briefing");
  };

  if (phase === "briefing") {
    return (
      <main className={styles.briefing}>
        <div className={styles.briefingBackdrop} />
        <nav className={styles.briefingNav}>
          <Link href="/arcade/">← FAIRBYTE ARCADE</Link>
          <SoundButton enabled={audio.enabled} onToggle={audio.toggle} />
        </nav>
        <section className={styles.briefingCard}>
          <div className={styles.briefingTime}>02:17:00</div>
          <span className={styles.eyebrow}>NIGHT OPERATIONS · GREYBRIDGE</span>
          <h1><em>2:17</em> AM</h1>
          <p className={styles.briefingLead}>
            Four response units. Eight minutes. More calls than the city can comfortably handle.
          </p>
          <div className={styles.briefingRules}>
            <article><strong>01</strong><div><b>Read the call</b><span>Small details reveal which service can actually help.</span></div></article>
            <article><strong>02</strong><div><b>Choose a unit</b><span>Busy crews need time to return. Rescue 1 can substitute, slowly.</span></div></article>
            <article><strong>03</strong><div><b>Advance the clock</b><span>Every unresolved call loses one minute of response time.</span></div></article>
          </div>
          <button type="button" className={styles.startButton} onClick={beginShift}>
            <span>TAKE THE NIGHT DESK</span><i>→</i>
          </button>
          <small>Fictional emergency-management strategy game. Not operational guidance.</small>
        </section>
      </main>
    );
  }

  if (phase === "complete" && summary) {
    const rating = getRating(summary);
    return (
      <main className={styles.reportScreen}>
        <nav className={styles.reportNav}>
          <Link href="/arcade/">← FAIRBYTE ARCADE</Link>
          <SoundButton enabled={audio.enabled} onToggle={audio.toggle} />
        </nav>
        <section className={styles.reportCard}>
          <span className={styles.eyebrow}>SHIFT REPORT · 02:25</span>
          <div className={styles.reportGrade}>{rating.grade}</div>
          <h1>{rating.label}</h1>
          <p>{rating.copy}</p>
          <div className={styles.reportStats}>
            <article><strong>{summary.score.toLocaleString()}</strong><span>DISPATCH SCORE</span></article>
            <article><strong>{summary.resolved}</strong><span>CALLS RESOLVED</span></article>
            <article><strong>{summary.protected}</strong><span>PEOPLE PROTECTED</span></article>
            <article><strong>{summary.trust}%</strong><span>PUBLIC TRUST</span></article>
          </div>
          <div className={styles.reportActions}>
            <button type="button" onClick={replay}>Run another shift</button>
            <Link href="/arcade/">Return to arcade</Link>
          </div>
          <small>{summary.missed} call{summary.missed === 1 ? "" : "s"} unresolved · Every replay starts with a different call order.</small>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.console}>
      <header className={styles.topbar}>
        <Link href="/arcade/" className={styles.arcadeLink}><span className={styles.gridMark}>▦</span> FAIRBYTE ARCADE</Link>
        <div className={styles.shiftTitle}><b>GREYBRIDGE</b><span>NIGHT OPERATIONS</span></div>
        <div className={styles.clock}><span>LOCAL TIME</span><strong>{formatClock(minute)}</strong><i>AM</i></div>
        <SoundButton enabled={audio.enabled} onToggle={audio.toggle} compact />
      </header>

      <section className={styles.statusStrip}>
        <div><span className={styles.liveDot} /> SHIFT ACTIVE</div>
        <div><span>MINUTE</span><strong>{minute + 1}/8</strong></div>
        <div><span>UNITS READY</span><strong>{readyUnits}/{units.length}</strong></div>
        <div><span>PUBLIC TRUST</span><strong className={trust < 45 ? styles.dangerText : ""}>{trust}%</strong></div>
        <div><span>SCORE</span><strong>{score.toLocaleString()}</strong></div>
      </section>

      <div className={styles.consoleGrid}>
        <section className={styles.mapPanel}>
          <div className={styles.panelHeading}><span>LIVE INCIDENT MAP</span><i>{active.length} ACTIVE</i></div>
          <div className={styles.cityMap}>
            <div className={styles.river} />
            <div className={`${styles.road} ${styles.roadOne}`} />
            <div className={`${styles.road} ${styles.roadTwo}`} />
            <div className={`${styles.road} ${styles.roadThree}`} />
            <span className={`${styles.district} ${styles.northLabel}`}>NORTH END</span>
            <span className={`${styles.district} ${styles.midLabel}`}>MIDTOWN</span>
            <span className={`${styles.district} ${styles.portLabel}`}>OLD PORT</span>
            {active.map((incident) => (
              <button
                key={incident.id}
                type="button"
                className={`${styles.mapPin} ${styles[incident.best]} ${selectedIncident === incident.id ? styles.selected : ""}`}
                style={{ left: `${incident.x}%`, top: `${incident.y}%` }}
                onClick={() => selectCall(incident.id)}
                aria-label={`Select ${incident.code}: ${incident.title}`}
                data-testid={`map-${incident.id}`}
              >
                <span>{incident.ttl}</span><b>{incident.code}</b>
              </button>
            ))}
            <div className={styles.mapLegend}><span>● CALL</span><span>NUMBER = MINUTES LEFT</span></div>
          </div>
          <div className={styles.callQueue}>
            {active.length === 0 ? (
              <div className={styles.queueEmpty}>No active calls. Advance the clock for incoming traffic.</div>
            ) : active.map((incident) => (
              <button
                type="button"
                key={incident.id}
                className={`${styles.callCard} ${selectedIncident === incident.id ? styles.selected : ""}`}
                onClick={() => selectCall(incident.id)}
                data-testid={`call-${incident.id}`}
              >
                <span className={`${styles.serviceBar} ${styles[incident.best]}`} />
                <div><b>{incident.code}</b><small>{incident.district}</small></div>
                <strong>{incident.title}</strong>
                <i>{incident.ttl} MIN</i>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.callPanel}>
          <div className={styles.panelHeading}><span>CALL DETAILS</span><i>{selectedCall ? selectedCall.code : "STANDBY"}</i></div>
          {selectedCall ? (
            <div className={styles.callDetail}>
              <div className={styles.callMeta}>
                <span className={`${styles.callType} ${styles[selectedCall.best]}`}>{KIND_LABELS[selectedCall.best]} SIGNAL</span>
                <span>{selectedCall.district}</span>
              </div>
              <div
                className={styles.sceneArt}
                style={{ backgroundImage: `url(${SCENE_ART[selectedCall.best]})` }}
                role="img"
                aria-label={`${KIND_LABELS[selectedCall.best].toLowerCase()} response scene`}
              />
              <h1>{selectedCall.title}</h1>
              <blockquote>“{selectedCall.transcript}”</blockquote>
              <div className={styles.dispatchNote}><span>DISPATCH NOTE</span><p>{selectedCall.clue}</p></div>
              <div className={styles.urgencyRow}>
                <div><span>RESPONSE WINDOW</span><strong>{selectedCall.ttl}:00</strong></div>
                <div><span>PEOPLE AT RISK</span><strong>{selectedCall.people || "—"}</strong></div>
              </div>
            </div>
          ) : (
            <div className={styles.noSelection}><span>⌖</span><b>Select an incident</b><p>Choose a call from the city map or active queue.</p></div>
          )}
        </section>

        <aside className={styles.unitsPanel}>
          <div className={styles.panelHeading}><span>AVAILABLE RESPONSE</span><i>{readyUnits} READY</i></div>
          <div className={styles.unitList}>
            {units.map((unit) => (
              <button
                type="button"
                key={unit.id}
                disabled={unit.busy > 0}
                className={`${styles.unitCard} ${styles[unit.kind]} ${selectedUnit === unit.id ? styles.selected : ""}`}
                onClick={() => selectResponse(unit.id)}
                aria-label={`${unit.name}, ${unit.busy > 0 ? `returns in ${unit.busy} minute${unit.busy === 1 ? "" : "s"}` : "ready"}`}
                data-testid={`unit-${unit.id}`}
              >
                <span className={styles.unitBadge}>{unit.shortName}</span>
                <div><b>{unit.name}</b><small>{unit.crew}</small></div>
                <i>{unit.busy > 0 ? `RETURN ${unit.busy}` : "READY"}</i>
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.dispatchButton}
            disabled={!selectedCall || !selectedResponse}
            onClick={dispatch}
          >
            <span>DISPATCH SELECTED UNIT</span><i>↗</i>
          </button>
          <p className={styles.rescueNote}><b>R-1</b> can back up any service, but stays unavailable longer and awards fewer points.</p>
        </aside>

        <aside className={styles.radioPanel}>
          <div className={styles.panelHeading}><span>RADIO LOG</span><i>CH 04</i></div>
          <div className={styles.waveform}><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
          <div className={styles.radioList} aria-live="polite">
            {radio.map((entry) => (
              <article key={entry.id} className={styles[entry.tone]}>
                <time>{entry.time}</time><div><b>{entry.title}</b><span>{entry.detail}</span></div>
              </article>
            ))}
          </div>
        </aside>
      </div>

      <footer className={styles.commandBar}>
        <details>
          <summary>HOW TO OPERATE</summary>
          <p>Select a call, choose the most appropriate ready unit, and dispatch. Advance the minute when your assignments are complete.</p>
        </details>
        <div className={styles.commandMessage}>
          {selectedCall && selectedResponse
            ? `${selectedResponse.name.toUpperCase()} → ${selectedCall.code}`
            : "SELECT A CALL AND RESPONSE UNIT"}
        </div>
        <button type="button" onClick={advanceMinute}><span>ADVANCE ONE MINUTE</span><i>+01:00</i></button>
      </footer>
    </main>
  );
}

function SoundButton({ enabled, onToggle, compact = false }: { enabled: boolean; onToggle: () => void; compact?: boolean }) {
  return (
    <button
      type="button"
      className={`${styles.soundButton} ${compact ? styles.compactSound : ""}`}
      onClick={onToggle}
      aria-label={enabled ? "Mute game sounds" : "Turn on game sounds"}
      aria-pressed={!enabled}
    >
      <span aria-hidden="true">{enabled ? "◖))" : "◖×"}</span>
      {!compact && <b>{enabled ? "SOUND ON" : "MUTED"}</b>}
    </button>
  );
}

function getRating(summary: ShiftSummary) {
  if (summary.score >= 1050 && summary.trust >= 75) {
    return {
      grade: "A",
      label: "Steady hand",
      copy: "The city stayed ahead of the night. Your crews moved with purpose, and the radio never controlled you.",
    };
  }
  if (summary.score >= 700 && summary.trust >= 50) {
    return {
      grade: "B",
      label: "Night operator",
      copy: "Not every call went cleanly, but the system held. Greybridge will remember the units that arrived.",
    };
  }
  if (summary.score >= 400) {
    return {
      grade: "C",
      label: "Rough shift",
      copy: "The board got away from you more than once. Read the call details and protect specialist units on the next run.",
    };
  }
  return {
    grade: "D",
    label: "Overwhelmed",
    copy: "The night desk collapsed under the call volume. Slow down, identify the right service, and accept the hard tradeoffs.",
  };
}
