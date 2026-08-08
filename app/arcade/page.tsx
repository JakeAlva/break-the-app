import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./arcade.module.css";

export const metadata: Metadata = {
  title: "Fairbyte Arcade — Play instantly",
  description: "Original browser games from Fairbyte. No downloads, no accounts—pick a game and play.",
  openGraph: {
    title: "Fairbyte Arcade",
    description: "Original browser games. Pick something and play instantly.",
    type: "website",
    url: "/arcade/",
    siteName: "Fairbyte Arcade",
    images: [{ url: "/arcade/2-17-am-cover.jpg", width: 1672, height: 941, alt: "Fairbyte Arcade" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080c11",
  colorScheme: "dark",
};

const games = [
  {
    number: "002",
    title: "2:17 AM",
    genre: "STRATEGY · MANAGEMENT",
    description: "Take the night desk. Match limited response units to a city full of calls before the clock wins.",
    href: "/games/2-17-am/",
    image: "/arcade/2-17-am-cover.jpg",
    alt: "Nighttime emergency dispatch operations center",
    accent: "red",
    detail: "8–15 MIN",
  },
  {
    number: "001",
    title: "Break the App",
    genre: "PUZZLE · LOGIC",
    description: "Four normal-looking apps. Four hidden logic bugs. Find the loophole using only the controls on screen.",
    href: "/",
    image: "/og.png",
    alt: "Break the App puzzle game",
    accent: "lime",
    detail: "15–25 MIN",
  },
];

export default function ArcadePage() {
  return (
    <main className={styles.arcade}>
      <header className={styles.topbar}>
        <Link href="/arcade/" className={styles.brand}>
          <span className={styles.brandMark}><i /><i /><i /></span>
          <div><b>FAIRBYTE</b><span>ARCADE</span></div>
        </Link>
        <nav aria-label="Arcade sections">
          <a href="#featured">Featured</a>
          <a href="#library">Library</a>
          <a href="#project">100 Game Project</a>
        </nav>
        <div className={styles.releaseCount}><span>LIVE LIBRARY</span><strong>02</strong></div>
      </header>

      <section className={styles.hero} id="featured">
        <Image
          src="/arcade/2-17-am-cover.jpg"
          alt="A nighttime emergency dispatch center overlooking Greybridge"
          fill
          loading="eager"
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <span className={styles.heroKicker}><i /> NEW RELEASE · GAME 002</span>
          <h1><em>2:17</em> AM</h1>
          <p>Four response units. Eight minutes. More calls than the city can comfortably handle.</p>
          <div className={styles.heroMeta}><span>STRATEGY</span><span>8–15 MIN</span><span>MOUSE + TOUCH</span></div>
          <div className={styles.heroActions}>
            <Link href="/games/2-17-am/" className={styles.playButton}><span>▶</span> Play now</Link>
            <a href="#library" className={styles.libraryButton}>View library</a>
          </div>
        </div>
        <div className={styles.heroIndex}><span>FEATURED</span><strong>02</strong><i>/ 100</i></div>
      </section>

      <section className={styles.library} id="library">
        <div className={styles.sectionHeading}>
          <div><span>READY TO PLAY</span><h2>Fairbyte Originals</h2></div>
          <p>No installers. No accounts. Progress stays on your device.</p>
        </div>
        <div className={styles.gameRail}>
          {games.map((game) => (
            <Link href={game.href} className={`${styles.gameCard} ${styles[game.accent]}`} key={game.number}>
              <div className={styles.cardArt}>
                <Image
                  src={game.image}
                  alt={game.alt}
                  fill
                  sizes="(max-width: 720px) 86vw, 480px"
                  loading={game.number === "002" ? "eager" : "lazy"}
                />
                <div className={styles.cardShade} />
                <span className={styles.gameNumber}>GAME {game.number}</span>
                <span className={styles.cardPlay}>▶</span>
              </div>
              <div className={styles.cardCopy}>
                <span>{game.genre}</span>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <div><b>PLAY NOW</b><i>{game.detail}</i></div>
              </div>
            </Link>
          ))}
          <article className={styles.nextCard}>
            <div className={styles.nextSignal}><i /><i /><i /><i /></div>
            <span>GAME 003</span>
            <h3>Signal incoming</h3>
            <p>The next Fairbyte experiment is already on the board.</p>
            <b>IN DEVELOPMENT</b>
          </article>
        </div>
      </section>

      <section className={styles.project} id="project">
        <div className={styles.projectNumber}><strong>02</strong><span>/ 100</span></div>
        <div className={styles.projectCopy}>
          <span>THE 100 GAME PROJECT</span>
          <h2>One library. A hundred original games.</h2>
          <p>
            Fairbyte Arcade is an ongoing experiment: release quickly, measure honestly, and expand the games players cannot stop replaying.
          </p>
        </div>
        <div className={styles.progressBlock}>
          <div><span>RELEASED</span><b>2%</b></div>
          <div className={styles.progressTrack}><i /></div>
          <small>98 games remaining · Target: December 2026</small>
        </div>
      </section>

      <footer className={styles.footer}>
        <div><span className={styles.brandMark}><i /><i /><i /></span> FAIRBYTE ARCADE</div>
        <span>ORIGINAL BROWSER GAMES · BUILT IN CHICAGO</span>
        <a href="https://fairbyte.us/">FAIRBYTE.US ↗</a>
      </footer>
    </main>
  );
}
