"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type LogEntry = {
  id: number;
  text: string;
  detail?: string;
  tone?: "good" | "bad" | "neutral";
};

type LevelMeta = {
  id: string;
  number: string;
  appName: string;
  kicker: string;
  title: string;
  objective: string;
  rule: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  maxMoves: number;
  par: number;
  hint: string;
  lesson: string;
};

const LEVELS: LevelMeta[] = [
  {
    id: "cart-collapse",
    number: "01",
    appName: "NOVA MARKET",
    kicker: "CHECKOUT TEST",
    title: "Cart Collapse",
    objective: "Place the headphones order for less than $5.00",
    rule: "Keep at least one pair in your cart. Use only the controls you can see.",
    difficulty: "EASY",
    maxMoves: 8,
    par: 5,
    hint: "Some discounts are calculated only when you apply them. What happens if the cart changes afterward?",
    lesson:
      "The bundle discount was saved as a dollar amount and never revalidated when the quantity changed.",
  },
  {
    id: "time-shift",
    number: "02",
    appName: "MINUTEBOOK",
    kicker: "SCHEDULER TEST",
    title: "Time Shift",
    objective: "Book Tuesday at exactly 4:30 PM Central",
    rule: "The 4:30 PM slot appears unavailable. Do not change the date or your device clock.",
    difficulty: "MEDIUM",
    maxMoves: 6,
    par: 3,
    hint: "Availability is being checked against the time printed on the button—not the actual moment it represents.",
    lesson:
      "The scheduler compared displayed clock labels instead of one consistent underlying timestamp.",
  },
  {
    id: "reward-relay",
    number: "03",
    appName: "LOOP REWARDS",
    kicker: "LOYALTY TEST",
    title: "Reward Relay",
    objective: "Claim the 1,000-point VIP pass without spending money",
    rule: "You begin with 600 points. Account connections and redemptions are allowed.",
    difficulty: "MEDIUM",
    maxMoves: 6,
    par: 4,
    hint: "A first-time bonus should remember the account—not merely whether it is connected right now.",
    lesson:
      "Disconnecting erased the eligibility flag, allowing the same first-time reward to be collected repeatedly.",
  },
  {
    id: "light-packing",
    number: "04",
    appName: "NORTHSTAR AIR",
    kicker: "CHECK-IN TEST",
    title: "Light Packing",
    objective: "Check in the declared 28 kg bag under the 20 kg limit",
    rule: "Keep the displayed weight at 28 kg. Do not remove anything from the bag.",
    difficulty: "HARD",
    maxMoves: 6,
    par: 4,
    hint: "The scale validates a converted weight once. Does changing the display unit force it to weigh again?",
    lesson:
      "The approved weight remained trusted after the display unit changed, leaving the validation stale.",
  },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.max(0, value));

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function TinyIcon({ children }: { children: React.ReactNode }) {
  return <span className="tiny-icon" aria-hidden="true">{children}</span>;
}

type GameFrameProps = {
  level: LevelMeta;
  levelIndex: number;
  completed: string[];
  unlockedIndex: number;
  movesUsed: number;
  logs: LogEntry[];
  solved: boolean;
  onSelectLevel: (index: number) => void;
  onRestart: () => void;
  onAdvance: () => void;
  onShare: () => void;
  children: React.ReactNode;
};

function GameFrame({
  level,
  levelIndex,
  completed,
  unlockedIndex,
  movesUsed,
  logs,
  solved,
  onSelectLevel,
  onRestart,
  onAdvance,
  onShare,
  children,
}: GameFrameProps) {
  const [hintOpen, setHintOpen] = useState(false);
  const movesLeft = Math.max(0, level.maxMoves - movesUsed);
  const failed = movesLeft === 0 && !solved;
  const hintReady = movesUsed >= 2 || failed || solved;
  const rating = movesUsed <= level.par ? "CLEAN BREAK" : "BRUTE FORCE";

  return (
    <main className="game-shell">
      <header className="topbar">
        <div className="fairbyte-lockup" aria-label="Fairbyte Labs">
          <BrandMark />
          <span>FAIRBYTE LABS</span>
        </div>
        <div className="game-title" aria-label="Break the App">
          BREAK <em>THE</em> APP
        </div>
        <div className="case-status">
          <span>CASE #{level.number}</span>
          <span className="solved-count">
            <span className="pulse-dot" /> {completed.length}/{LEVELS.length} SOLVED
          </span>
        </div>
      </header>

      <nav className="level-rail" aria-label="Cases">
        <span className="rail-label">FIELD TESTS</span>
        <div className="level-buttons">
          {LEVELS.map((item, index) => {
            const isCompleted = completed.includes(item.id);
            const isLocked = index > unlockedIndex;
            return (
              <button
                key={item.id}
                type="button"
                className={`level-button ${index === levelIndex ? "active" : ""} ${
                  isCompleted ? "complete" : ""
                }`}
                disabled={isLocked}
                onClick={() => onSelectLevel(index)}
                aria-current={index === levelIndex ? "step" : undefined}
                aria-label={`${isLocked ? "Locked: " : ""}Case ${item.number}, ${item.title}`}
              >
                <span>{item.number}</span>
                <b>{item.title}</b>
                <i>{isLocked ? "LOCKED" : isCompleted ? "SOLVED" : item.difficulty}</i>
              </button>
            );
          })}
        </div>
      </nav>

      <section className="play-grid">
        <aside className="mission-panel panel">
          <div className="panel-heading">
            <span>YOUR MISSION</span>
            <span className="crosshair" aria-hidden="true">+</span>
          </div>
          <div className="mission-kicker">{level.kicker}</div>
          <h1>{level.objective}</h1>
          <div className="mission-divider" />
          <p>{level.rule}</p>

          <div className="mission-stats">
            <div className="stat-box">
              <strong>{movesLeft}</strong>
              <span>MOVES LEFT</span>
            </div>
            <div className="stat-box">
              <strong>{String(levelIndex + 1).padStart(2, "0")}</strong>
              <span>CASE FILE</span>
            </div>
            <div className={`stat-box difficulty ${level.difficulty.toLowerCase()}`}>
              <strong>≋</strong>
              <span>{level.difficulty}</span>
            </div>
          </div>

          <details className="how-to-play">
            <summary><span>How to play</span><i>+</i></summary>
            <ol>
              <li>Read the mission, then use the fake app like a normal customer.</li>
              <li>Try unusual sequences before your move counter reaches zero.</li>
              <li>Watch the attempt log for clues about what the system remembered.</li>
              <li>Complete the objective to unlock the next case.</li>
            </ol>
          </details>

          <div className="rule-card">
            <TinyIcon>◎</TinyIcon>
            <div>
              <b>Fair play</b>
              <span>No developer tools, page editing, or outside scripts.</span>
            </div>
          </div>
        </aside>

        <section className={`simulator-panel panel ${failed ? "is-failed" : ""}`}>
          <div className="simulator-chrome">
            <div>
              <span className="app-glyph" aria-hidden="true">✳</span>
              <span className="simulator-name">{level.appName}</span>
            </div>
            <div className="secure-pill"><span /> SANDBOXED</div>
          </div>

          {solved && (
            <div className="result-banner success-banner" role="status">
              <div className="result-symbol">✓</div>
              <div className="result-copy">
                <span>{rating}</span>
                <h2>System broken.</h2>
                <p>{level.lesson}</p>
              </div>
              <div className="result-actions">
                <button type="button" className="button ghost" onClick={onShare}>Share result</button>
                <button type="button" className="button primary" onClick={onAdvance}>
                  {levelIndex === LEVELS.length - 1 ? "View campaign" : "Next case"}
                </button>
              </div>
            </div>
          )}

          {failed && (
            <div className="result-banner fail-banner" role="status">
              <div className="result-symbol">×</div>
              <div className="result-copy">
                <span>TEST RUN EXHAUSTED</span>
                <h2>The app held—for now.</h2>
                <p>Reset the case and try a different sequence.</p>
              </div>
              <button type="button" className="button primary" onClick={onRestart}>Retry case</button>
            </div>
          )}

          <div className={`app-stage ${solved || failed ? "has-result" : ""}`}>{children}</div>
        </section>

        <aside className="attempt-panel panel">
          <div className="panel-heading">
            <span>ATTEMPT LOG</span>
            <span aria-hidden="true">↶</span>
          </div>

          <div className="log-list" aria-live="polite">
            {logs.length === 0 ? (
              <div className="empty-log">
                <span>01</span>
                <p>Your interactions will appear here. Start testing the interface.</p>
              </div>
            ) : (
              [...logs].reverse().map((log, index) => (
                <article className={`log-entry ${log.tone ?? "neutral"}`} key={log.id}>
                  <span>{String(logs.length - index).padStart(2, "0")}</span>
                  <div>
                    <b>{log.text}</b>
                    {log.detail && <small>{log.detail}</small>}
                  </div>
                </article>
              ))
            )}
          </div>

          <div className={`hint-card ${hintReady ? "ready" : ""} ${hintOpen ? "open" : ""}`}>
            <div className="hint-lock" aria-hidden="true">{hintReady ? "?" : "⌁"}</div>
            {hintOpen ? (
              <>
                <span>FIELD NOTE</span>
                <p>{level.hint}</p>
              </>
            ) : (
              <>
                <span>{hintReady ? "HINT READY" : "HINT LOCKED"}</span>
                <p>{hintReady ? "Reveal a nudge without exposing the full solution." : "Available after two moves."}</p>
                <button type="button" disabled={!hintReady} onClick={() => setHintOpen(true)}>
                  {hintReady ? "Reveal hint" : `${Math.max(0, 2 - movesUsed)} moves to unlock`}
                </button>
              </>
            )}
          </div>
        </aside>
      </section>

      <footer className="game-footer">
        <div><span className="footer-target">⊙</span> Find the loophole. The interface is the puzzle.</div>
        <button type="button" onClick={onRestart}>↻&nbsp;&nbsp; Restart case</button>
      </footer>
    </main>
  );
}

type LevelProps = {
  level: LevelMeta;
  onSolved: (moves: number) => void;
  frame: Omit<GameFrameProps, "movesUsed" | "logs" | "solved" | "onRestart" | "children">;
};

function CartLevel({ level, onSolved, frame }: LevelProps) {
  const [quantity, setQuantity] = useState(1);
  const [shipping, setShipping] = useState<"standard" | "pickup" | "express">("standard");
  const [code, setCode] = useState("WELCOME10");
  const [discount, setDiscount] = useState(0);
  const [applied, setApplied] = useState<string | null>(null);
  const [freeShipping, setFreeShipping] = useState(false);
  const [moves, setMoves] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [solved, setSolved] = useState(false);
  const price = 79;
  const shippingPrice = freeShipping ? 0 : shipping === "pickup" ? 0 : shipping === "express" ? 18 : 8;
  const subtotal = quantity * price;
  const total = Math.max(0, subtotal - discount + shippingPrice);
  const locked = solved || moves >= level.maxMoves;

  const log = (text: string, detail?: string, tone?: LogEntry["tone"]) => {
    setLogs((items) => [...items, { id: Date.now() + items.length, text, detail, tone }]);
  };

  const spendMove = () => setMoves((value) => value + 1);

  const changeQuantity = (next: number) => {
    if (locked || next < 1 || next > 3 || next === quantity) return;
    setQuantity(next);
    spendMove();
    log(`Quantity changed to ${next}`, applied ? `${applied} remained applied` : "Cart recalculated");
  };

  const changeShipping = (next: typeof shipping) => {
    if (locked || next === shipping) return;
    setShipping(next);
    spendMove();
    log(
      next === "pickup" ? "Switched to store pickup" : `Selected ${next} shipping`,
      next === "pickup" ? "Shipping is now free" : undefined,
    );
  };

  const applyCode = () => {
    if (locked) return;
    const normalized = code.trim().toUpperCase();
    spendMove();
    if (normalized === "BUNDLE50" && quantity >= 2) {
      const snapshot = subtotal * 0.5;
      setDiscount(snapshot);
      setApplied(normalized);
      setFreeShipping(false);
      log("Applied BUNDLE50", `${money(snapshot)} discount locked in`, "good");
    } else if (normalized === "WELCOME10") {
      const snapshot = subtotal * 0.1;
      setDiscount(snapshot);
      setApplied(normalized);
      setFreeShipping(false);
      log("Applied WELCOME10", `${money(snapshot)} off this cart`, "good");
    } else if (normalized === "FREESHIP") {
      setDiscount(0);
      setApplied(normalized);
      setFreeShipping(true);
      log("Applied FREESHIP", "Delivery charge removed", "good");
    } else {
      log("Promotion rejected", normalized === "BUNDLE50" ? "Requires two items" : "Unknown code", "bad");
    }
  };

  const placeOrder = () => {
    if (locked) return;
    spendMove();
    if (total < 5 && quantity >= 1) {
      setSolved(true);
      log("Order accepted", `${money(total)} charged`, "good");
      onSolved(moves + 1);
    } else {
      log("Order still too expensive", `${money(total)} is above the mission target`, "bad");
    }
  };

  const reset = () => {
    setQuantity(1);
    setShipping("standard");
    setCode("WELCOME10");
    setDiscount(0);
    setApplied(null);
    setFreeShipping(false);
    setMoves(0);
    setLogs([]);
    setSolved(false);
  };

  return (
    <GameFrame {...frame} level={level} movesUsed={moves} logs={logs} solved={solved} onRestart={reset}>
      <div className="shop-layout">
        <section className="product-side">
          <div className="product-card">
            <div className="headphones-art" aria-label="Black and lime headphones">
              <span className="headband" />
              <span className="ear left" />
              <span className="ear right" />
            </div>
            <div className="product-copy">
              <span className="product-label">WIRELESS AUDIO</span>
              <h2>Pulse X Headphones</h2>
              <strong>{money(price)}</strong>
              <div className="rating">★★★★★ <span>4.8</span></div>
            </div>
            <div className="quantity-control" aria-label="Quantity">
              <span>Quantity</span>
              <div>
                <button type="button" disabled={locked || quantity <= 1} onClick={() => changeQuantity(quantity - 1)} aria-label="Decrease quantity">−</button>
                <b>{quantity}</b>
                <button type="button" disabled={locked || quantity >= 3} onClick={() => changeQuantity(quantity + 1)} aria-label="Increase quantity">+</button>
              </div>
            </div>
          </div>

          <div className="checkout-field">
            <label htmlFor="shipping">Delivery method</label>
            <select
              id="shipping"
              value={shipping}
              disabled={locked}
              onChange={(event) => changeShipping(event.target.value as typeof shipping)}
            >
              <option value="standard">Standard shipping (5–7 days) · $8.00</option>
              <option value="pickup">Store pickup (today) · Free</option>
              <option value="express">Express shipping (tomorrow) · $18.00</option>
            </select>
          </div>

          <div className="promo-area">
            <label htmlFor="promo">Promo code</label>
            <div className="promo-input">
              <input
                id="promo"
                value={code}
                disabled={locked}
                onChange={(event) => setCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") applyCode();
                }}
                autoComplete="off"
                spellCheck={false}
              />
              <button type="button" disabled={locked} onClick={applyCode}>Apply</button>
            </div>
            <div className="offer-strip">
              <span><b>WELCOME10</b> · 10% off</span>
              <span><b>BUNDLE50</b> · Buy 2, save 50%</span>
              <span><b>FREESHIP</b> · Free delivery</span>
            </div>
          </div>
        </section>

        <aside className="order-card">
          <span className="card-eyebrow">ORDER SUMMARY</span>
          <div className="summary-row"><span>Subtotal</span><b>{money(subtotal)}</b></div>
          <div className={`summary-row ${discount > 0 ? "accent" : ""}`}><span>Discount</span><b>−{money(discount)}</b></div>
          <div className="summary-row"><span>Shipping</span><b>{money(shippingPrice)}</b></div>
          {applied && <div className="applied-code"><span>✓</span> {applied} applied</div>}
          <div className="total-row"><span>TOTAL</span><strong>{money(total)}</strong></div>
          <button type="button" className="place-order" disabled={locked} onClick={placeOrder}>Place order</button>
          <small>Demo checkout. No payment information is collected.</small>
        </aside>
      </div>
    </GameFrame>
  );
}

const formatTime = (minutes: number) => {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(mins).padStart(2, "0")} ${suffix}`;
};

function TimeLevel({ level, onSolved, frame }: LevelProps) {
  const [zone, setZone] = useState<"CT" | "ET" | "PT">("CT");
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [solved, setSolved] = useState(false);
  const slots = [930, 960, 990, 1020];
  const offsets = { CT: 0, ET: 60, PT: -120 };
  const locked = solved || moves >= level.maxMoves;
  const displayed = (base: number) => base + offsets[zone];
  const isUnavailable = (base: number) => displayed(base) === 990;

  const log = (text: string, detail?: string, tone?: LogEntry["tone"]) =>
    setLogs((items) => [...items, { id: Date.now() + items.length, text, detail, tone }]);

  const changeZone = (next: typeof zone) => {
    if (locked || next === zone) return;
    setZone(next);
    setMoves((value) => value + 1);
    log(`Display changed to ${next}`, `Same appointments, ${next} clock labels`);
  };

  const chooseSlot = (base: number) => {
    if (locked || isUnavailable(base)) return;
    setSelected(base);
    setMoves((value) => value + 1);
    log(`Selected ${formatTime(displayed(base))} ${zone}`, `Converts to ${formatTime(base)} Central`);
  };

  const confirm = () => {
    if (locked || selected === null) return;
    setMoves((value) => value + 1);
    if (selected === 990) {
      setSolved(true);
      log("Appointment confirmed", "Tuesday · 4:30 PM Central", "good");
      onSolved(moves + 1);
    } else {
      log("Wrong appointment time", `${formatTime(selected)} Central does not match`, "bad");
    }
  };

  const reset = () => {
    setZone("CT");
    setSelected(null);
    setMoves(0);
    setLogs([]);
    setSolved(false);
  };

  return (
    <GameFrame {...frame} level={level} movesUsed={moves} logs={logs} solved={solved} onRestart={reset}>
      <div className="scheduler-layout">
        <section className="calendar-card">
          <div className="calendar-top">
            <div>
              <span className="card-eyebrow">SELECT A DATE</span>
              <h2>August 2026</h2>
            </div>
            <div className="month-arrows"><button type="button" disabled>‹</button><button type="button" disabled>›</button></div>
          </div>
          <div className="calendar-grid" aria-label="August 2026 calendar">
            {['S','M','T','W','T','F','S'].map((day, index) => <span className="weekday" key={`${day}-${index}`}>{day}</span>)}
            {[2,3,4,5,6,7,8,9,10,11,12,13,14,15].map((day) => (
              <button type="button" className={day === 11 ? "selected" : ""} disabled={day !== 11} key={day}>{day}</button>
            ))}
          </div>
          <div className="selected-date"><span>✓</span><div><b>Tuesday, August 11</b><small>30-minute consultation</small></div></div>
        </section>

        <section className="slots-card">
          <div className="zone-row">
            <div><span className="card-eyebrow">AVAILABLE TIMES</span><h2>Choose a time</h2></div>
            <label>
              Time zone
              <select value={zone} disabled={locked} onChange={(event) => changeZone(event.target.value as typeof zone)}>
                <option value="CT">Central (CT)</option>
                <option value="ET">Eastern (ET)</option>
                <option value="PT">Pacific (PT)</option>
              </select>
            </label>
          </div>
          <div className="timezone-note">Times are displayed in <b>{zone}</b>. Confirmations are saved in Central time.</div>
          <div className="time-slots">
            {slots.map((base) => {
              const unavailable = isUnavailable(base);
              return (
                <button
                  type="button"
                  key={base}
                  disabled={locked || unavailable}
                  className={selected === base ? "selected" : ""}
                  onClick={() => chooseSlot(base)}
                >
                  <span>{formatTime(displayed(base))}</span>
                  <small>{unavailable ? "Unavailable" : selected === base ? "Selected" : "Open"}</small>
                </button>
              );
            })}
          </div>
          <button type="button" className="confirm-button" disabled={locked || selected === null} onClick={confirm}>Confirm appointment</button>
        </section>
      </div>
    </GameFrame>
  );
}

function RewardsLevel({ level, onSolved, frame }: LevelProps) {
  const [points, setPoints] = useState(600);
  const [linked, setLinked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [solved, setSolved] = useState(false);
  const locked = solved || moves >= level.maxMoves;

  const log = (text: string, detail?: string, tone?: LogEntry["tone"]) =>
    setLogs((items) => [...items, { id: Date.now() + items.length, text, detail, tone }]);

  const toggleConnection = () => {
    if (locked) return;
    setMoves((value) => value + 1);
    if (linked) {
      setLinked(false);
      log("QuickBite disconnected", "Connection removed; points retained");
    } else {
      setLinked(true);
      setPoints((value) => value + 250);
      log("QuickBite connected", "+250 first-connection bonus", "good");
    }
  };

  const claim = () => {
    if (locked) return;
    setMoves((value) => value + 1);
    if (points >= 1000) {
      setPoints((value) => value - 1000);
      setSolved(true);
      log("VIP pass claimed", "1,000 points redeemed", "good");
      onSolved(moves + 1);
    } else {
      log("Not enough points", `${1000 - points} more required`, "bad");
    }
  };

  const reset = () => {
    setPoints(600);
    setLinked(false);
    setMoves(0);
    setLogs([]);
    setSolved(false);
  };

  return (
    <GameFrame {...frame} level={level} movesUsed={moves} logs={logs} solved={solved} onRestart={reset}>
      <div className="rewards-layout">
        <section className="wallet-card">
          <div className="wallet-glow" />
          <div className="wallet-heading"><BrandMark /><span>LOOP MEMBER</span></div>
          <span className="balance-label">AVAILABLE BALANCE</span>
          <strong className="points-balance">{points.toLocaleString()} <small>PTS</small></strong>
          <div className="member-row"><span>Member since 2026</span><b>CORE</b></div>
        </section>

        <section className="connections-card">
          <span className="card-eyebrow">CONNECTED SERVICES</span>
          <h2>Earn across your apps</h2>
          <p>Link a partner for the first time and collect an instant connection bonus.</p>
          <article className={`partner-card ${linked ? "linked" : ""}`}>
            <div className="partner-logo">Q</div>
            <div><b>QuickBite Delivery</b><small>{linked ? "Connected just now" : "+250 point first-connection bonus"}</small></div>
            <button type="button" disabled={locked} onClick={toggleConnection}>{linked ? "Disconnect" : "Connect"}</button>
          </article>
          <article className="partner-card disabled-partner">
            <div className="partner-logo">M</div>
            <div><b>MetroPass</b><small>Partner temporarily unavailable</small></div>
            <button type="button" disabled>Offline</button>
          </article>
          <div className="terms-line">Connection bonuses are intended for first-time links only.</div>
        </section>

        <aside className="reward-card">
          <div className="vip-art"><span>VIP</span><i /></div>
          <span className="card-eyebrow">LIMITED REWARD</span>
          <h2>Loop Black Pass</h2>
          <p>One year of priority support, surprise drops, and zero service fees.</p>
          <div className="reward-price"><strong>1,000</strong><span>POINTS</span></div>
          <button type="button" disabled={locked} onClick={claim}>Claim pass</button>
          <small>{points >= 1000 ? "You have enough points" : `${(1000 - points).toLocaleString()} points to go`}</small>
        </aside>
      </div>
    </GameFrame>
  );
}

function BaggageLevel({ level, onSolved, frame }: LevelProps) {
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [approvedKg, setApprovedKg] = useState<number | null>(null);
  const [approved, setApproved] = useState(false);
  const [moves, setMoves] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [solved, setSolved] = useState(false);
  const locked = solved || moves >= level.maxMoves;
  const displayedWeight = 28;

  const log = (text: string, detail?: string, tone?: LogEntry["tone"]) =>
    setLogs((items) => [...items, { id: Date.now() + items.length, text, detail, tone }]);

  const changeUnit = (next: typeof unit) => {
    if (locked || next === unit) return;
    setUnit(next);
    setMoves((value) => value + 1);
    log(`Display changed to ${next.toUpperCase()}`, approved ? "Previous scale result retained" : "Declared number unchanged");
  };

  const weigh = () => {
    if (locked) return;
    const kgValue = unit === "lb" ? displayedWeight * 0.453592 : displayedWeight;
    const passes = kgValue <= 20;
    setApprovedKg(kgValue);
    setApproved(passes);
    setMoves((value) => value + 1);
    log(
      passes ? "Bag approved by scale" : "Bag exceeds allowance",
      `${kgValue.toFixed(1)} kg recorded internally`,
      passes ? "good" : "bad",
    );
  };

  const checkIn = () => {
    if (locked) return;
    setMoves((value) => value + 1);
    if (approved && unit === "kg" && displayedWeight === 28) {
      setSolved(true);
      log("Bag checked in", "Tag NS 4821 issued for 28 kg", "good");
      onSolved(moves + 1);
    } else if (!approved) {
      log("Check-in blocked", "A passing scale result is required", "bad");
    } else {
      log("Declaration mismatch", "Final display must show 28 kg", "bad");
    }
  };

  const reset = () => {
    setUnit("kg");
    setApprovedKg(null);
    setApproved(false);
    setMoves(0);
    setLogs([]);
    setSolved(false);
  };

  return (
    <GameFrame {...frame} level={level} movesUsed={moves} logs={logs} solved={solved} onRestart={reset}>
      <div className="baggage-layout">
        <section className="flight-card">
          <div className="flight-route"><div><span>ORD</span><small>Chicago</small></div><div className="route-line"><i>✦</i></div><div><span>SEA</span><small>Seattle</small></div></div>
          <div className="flight-meta"><span><small>FLIGHT</small>NS 4821</span><span><small>DEPARTS</small>8:40 AM</span><span><small>GATE</small>C12</span></div>
          <div className="passenger-row"><div className="avatar">JA</div><div><small>PASSENGER</small><b>J. ALVAREZ</b></div><span>ECONOMY</span></div>
        </section>

        <section className="scale-card">
          <div className="scale-heading"><div><span className="card-eyebrow">CHECKED BAG 1</span><h2>Declare weight</h2></div><span className="limit-chip">LIMIT 20 KG</span></div>
          <div className="bag-visual"><div className="handle"/><div className="suitcase"><span/><i/></div></div>
          <div className="digital-scale">
            <span>DECLARED WEIGHT</span>
            <strong>{displayedWeight}<small>{unit}</small></strong>
            <div className="unit-toggle" role="group" aria-label="Weight unit">
              <button type="button" className={unit === "kg" ? "active" : ""} disabled={locked} onClick={() => changeUnit("kg")}>KG</button>
              <button type="button" className={unit === "lb" ? "active" : ""} disabled={locked} onClick={() => changeUnit("lb")}>LB</button>
            </div>
          </div>
          <button type="button" className="weigh-button" disabled={locked} onClick={weigh}>Run scale check</button>
        </section>

        <aside className="approval-card">
          <span className="card-eyebrow">BAGGAGE STATUS</span>
          <div className={`approval-orb ${approvedKg === null ? "idle" : approved ? "passed" : "failed"}`}>
            <span>{approvedKg === null ? "…" : approved ? "✓" : "!"}</span>
          </div>
          <h2>{approvedKg === null ? "Not weighed" : approved ? "Within allowance" : "Overweight"}</h2>
          <p>{approvedKg === null ? "Run the scale check before continuing." : `Scale record: ${approvedKg.toFixed(1)} kg`}</p>
          <div className="allowance-meter"><span style={{ width: approvedKg === null ? "0%" : `${Math.min(100, approvedKg / 20 * 100)}%` }} /></div>
          <div className="allowance-labels"><span>0 kg</span><span>20 kg limit</span></div>
          <button type="button" disabled={locked} onClick={checkIn}>Check in bag</button>
          {approved && <small className="status-note">✓ Previous scale approval active</small>}
        </aside>
      </div>
    </GameFrame>
  );
}

function CampaignComplete({ completed, onReplay }: { completed: string[]; onReplay: () => void }) {
  return (
    <main className="campaign-complete">
      <div className="complete-grid" />
      <div className="complete-card">
        <BrandMark />
        <span className="complete-kicker">FAIRBYTE LABS · FIELD REPORT</span>
        <h1>You broke every app.</h1>
        <p>
          Four systems trusted the wrong thing: a stale discount, a clock label, a connection flag, and an old scale result.
          That is the whole game—finding the assumption hiding inside the interface.
        </p>
        <div className="complete-score">
          <div><strong>{completed.length}/4</strong><span>CASES SOLVED</span></div>
          <div><strong>100%</strong><span>SYSTEMS BROKEN</span></div>
          <div><strong>NO CODE</strong><span>TOOLS USED</span></div>
        </div>
        <button type="button" onClick={onReplay}>Replay campaign</button>
        <small>Break the App · Field Test Build 0.1</small>
      </div>
    </main>
  );
}

export default function Home() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [campaignDone, setCampaignDone] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    const restoreProgress = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem("break-the-app:completed:v1");
        const storedLevel = window.localStorage.getItem("break-the-app:level:v1");
        if (stored) setCompleted(JSON.parse(stored));
        if (storedLevel) setLevelIndex(Math.min(LEVELS.length - 1, Math.max(0, Number(storedLevel))));
      } catch {
        // A blocked storage policy should never block the game itself.
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(restoreProgress);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem("break-the-app:completed:v1", JSON.stringify(completed));
      window.localStorage.setItem("break-the-app:level:v1", String(levelIndex));
    } catch {
      // Progress simply remains session-only when storage is unavailable.
    }
  }, [completed, levelIndex, hydrated]);

  const markSolved = useCallback((id: string) => {
    setCompleted((items) => (items.includes(id) ? items : [...items, id]));
  }, []);

  const unlockedIndex = useMemo(() => {
    let index = 0;
    while (index < LEVELS.length - 1 && completed.includes(LEVELS[index].id)) index += 1;
    return index;
  }, [completed]);

  const selectLevel = (index: number) => {
    if (index > unlockedIndex) return;
    setLevelIndex(index);
    setCampaignDone(false);
    setRunKey((value) => value + 1);
  };

  const advance = () => {
    if (levelIndex === LEVELS.length - 1) {
      setCampaignDone(true);
      return;
    }
    setLevelIndex((value) => value + 1);
    setRunKey((value) => value + 1);
  };

  const share = async () => {
    const level = LEVELS[levelIndex];
    const text = `I broke ${level.appName} in Break the App — Case #${level.number} cleared. Can you find the loophole?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Break the App", text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${text} ${window.location.href}`);
      }
    } catch {
      // Cancelled shares are intentionally silent.
    }
  };

  if (campaignDone) {
    return (
      <CampaignComplete
        completed={completed}
        onReplay={() => {
          setCampaignDone(false);
          setLevelIndex(0);
          setRunKey((value) => value + 1);
        }}
      />
    );
  }

  const level = LEVELS[levelIndex];
  const frame = {
    level,
    levelIndex,
    completed,
    unlockedIndex,
    onSelectLevel: selectLevel,
    onAdvance: advance,
    onShare: share,
  };

  const props = {
    level,
    onSolved: () => markSolved(level.id),
    frame,
  };

  const key = `${level.id}-${runKey}`;
  if (level.id === "cart-collapse") return <CartLevel key={key} {...props} />;
  if (level.id === "time-shift") return <TimeLevel key={key} {...props} />;
  if (level.id === "reward-relay") return <RewardsLevel key={key} {...props} />;
  return <BaggageLevel key={key} {...props} />;
}
