import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

/* ---------------------- viewport (for Confetti sizing) ---------------------- */
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const onResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

/* ---------------------------- audio fade helpers ---------------------------- */
function fadeOutAudio(audioRef, duration = 1000) {
  const a = audioRef.current;
  if (!a) return;
  const startVol = a.volume ?? 1;
  const step = 50;
  let t = 0;
  const id = setInterval(() => {
    t += step;
    const frac = Math.max(0, 1 - t / duration);
    a.volume = startVol * frac;
    if (t >= duration) {
      clearInterval(id);
      a.pause();
      a.currentTime = 0;
      a.volume = startVol;
    }
  }, step);
}
function fadeAudio(audioRef, targetVol = 0, duration = 500, onDone) {
  const a = audioRef.current;
  if (!a) return;
  const startVol = a.volume ?? 1;
  const diff = targetVol - startVol;
  const step = 50;
  let t = 0;
  const id = setInterval(() => {
    t += step;
    const frac = Math.min(1, t / duration);
    a.volume = Math.max(0, Math.min(1, startVol + diff * frac));
    if (frac >= 1) {
      clearInterval(id);
      if (onDone) onDone();
    }
  }, step);
}
function pauseBGM(audioRef) {
  const a = audioRef.current;
  if (!a) return;
  fadeAudio(audioRef, 0, 400, () => a.pause());
}
function resumeBGM(audioRef) {
  const a = audioRef.current;
  if (!a) return;
  a.play().catch(() => {});
  fadeAudio(audioRef, 1, 500);
}

/* ================================ REVEAL ==================================== */
/**
 * Sequence after Intro click:
 * - 6.5s WHITE loader (kitty_running.gif)
 * - Reveal birthday hero (fade-in) + confetti
 * - After ~2.6s, scrollable content appears (gallery → friends → popup → slideshow)
 */
export default function Reveal() {
  const [phase, setPhase] = useState("loading"); // loading | birthday | content
  const [confetti, setConfetti] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const audioRef = useRef(null);
  const titleRef = useRef(null);
  const { width, height } = useWindowSize();

  const BASE = process.env.PUBLIC_URL || "";

  /* ================================ TIMELINE ================================ */
  useEffect(() => {
    // Start bgm when Reveal mounts (assumes user gesture already happened in Intro)
    audioRef.current?.play().catch(() => {});

    const timers = [];
    // 6.5s WHITE loader, then show birthday hero + confetti
    timers.push(
      setTimeout(() => {
        setPhase("birthday");
        setConfetti(true);
      }, 6500)
    );
    // After ~2.6s of confetti, go to content
    timers.push(
      setTimeout(() => {
        setConfetti(false);
        setPhase("content");
      }, 6500 + 2600)
    );

    return () => timers.forEach(clearTimeout);
  }, []);


  /* ========================== SILLY DROP (ACCENT) ========================== */
  // NOTE: kept the measure logic in case you want to re-enable the drop later.
  const [dropReady, setDropReady] = useState(false);
  const [landing, setLanding] = useState(null); // {centerX, topY}
  const [dropSize, setDropSize] = useState(80);

  const recalcLanding = () => {
    const r = titleRef.current?.getBoundingClientRect();
    if (!r) return;
    const sz = Math.round(Math.min(96, Math.max(56, window.innerWidth * 0.18)));
    setDropSize(sz);
    setLanding({
      centerX: r.left + window.scrollX + r.width / 2,
      topY: r.top + window.scrollY,
    });
  };

  useEffect(() => {
    if (phase !== "birthday" && phase !== "content") {
      setDropReady(false);
      return;
    }

    recalcLanding();
    const onR = () => recalcLanding();
    window.addEventListener("resize", onR, { passive: true });
    window.addEventListener("orientationchange", onR, { passive: true });

    const t = setTimeout(() => setDropReady(true), 200);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onR);
      window.removeEventListener("orientationchange", onR);
      setDropReady(false);
    };
  }, [phase]);

  /* ================================ GALLERY ================================ */
  const gallerySources = [
    `${BASE}/img/01_image.jpeg`,
    `${BASE}/img/02_image.jpeg`,
    `${BASE}/img/meNbae.gif`,
    `${BASE}/img/04_image.jpeg`,
    `${BASE}/img/03_image.jpeg`,
    `${BASE}/img/06_image.jpeg`,
    `${BASE}/img/07_image.jpeg`,
    `${BASE}/img/pimple.jpg`,
    `${BASE}/img/08_image.jpeg`,
    `${BASE}/img/05_image.jpeg`,
  ];

  /* ============================ FRIENDS (VIDEOS) ============================ */
  const friends = [
    { key: "hannah",  name: "Hannah",       thumb: `${BASE}/friends/hannah.jpeg`,  video: `${BASE}/friends/hannah.mp4` },
    { key: "emily",   name: "Emily",        thumb: `${BASE}/friends/emily.jpeg`,   video: `${BASE}/friends/emily.mp4` },
    { key: "andreia", name: "Andreia",      thumb: `${BASE}/friends/andreia.jpeg`, video: `${BASE}/friends/andreia.mp4` },
    { key: "rhylee",  name: "Rhylee",       thumb: `${BASE}/friends/rhylee.jpeg`,  video: `${BASE}/friends/rhylee.mov` },
    { key: "jason",   name: "Jason",        thumb: `${BASE}/friends/jason.jpeg`,   video: `${BASE}/friends/jason.mp4` },
    { key: "andrew",  name: "Andrew",       thumb: `${BASE}/friends/andrew.jpeg`,  video: `${BASE}/friends/andrew.mp4` },
    { key: "nate",    name: "Nate",         thumb: `${BASE}/friends/nate.jpeg`,    video: `${BASE}/friends/nate.mp4` },
    { key: "adam",    name: "Adam",         thumb: `${BASE}/friends/adam.jpeg`,    video: `${BASE}/friends/adam.mp4` },
    { key: "melody",  name: "Melody",       thumb: `${BASE}/friends/melody.jpeg`,  video: `${BASE}/friends/melody.mp4` },
    { key: "noah",    name: "Noah!",        thumb: `${BASE}/friends/noah.jpeg`,    video: `${BASE}/friends/noah.mp4` },
    { key: "ryan",    name: "Ryan",         thumb: `${BASE}/friends/ryan.jpeg`,    video: `${BASE}/friends/ryan.mp4` },
    { key: "sam",     name: "Sam",          thumb: `${BASE}/friends/sam.jpeg`,     video: `${BASE}/friends/sam.mp4` },
    { key: "mom",     name: "Mom",          thumb: `${BASE}/friends/mom.jpeg`,     video: `${BASE}/friends/mom.mp4` },
    { key: "dad",     name: "Dad",          thumb: `${BASE}/friends/dad.jpg`,      video: `${BASE}/friends/dad.mp4` },
    { key: "ita",     name: "Papa & Ita",   thumb: `${BASE}/friends/ita.jpeg`,     video: `${BASE}/friends/ita.mp4` },
    { key: "lolo",    name: "Lolo",         thumb: `${BASE}/friends/lolo.jpeg`,    video: `${BASE}/friends/lolo.mp4` },
    // FIX: these two entries had likely typos in the original
    { key: "uncle",   name: "Auntie & Uncle John", thumb: `${BASE}/friends/uncle.jpg`,    video: `${BASE}/friends/uncle.mp4` },
    { key: "pastor",  name: "Pastor Ruckins & Roslyn McKinley", thumb: `${BASE}/friends/pastor.jpg`,  video: `${BASE}/friends/pastor.mp4` },
    { key: "bermundo", name: "The Bermundo Family", thumb: `${BASE}/friends/bermundo.jpeg`, video: `${BASE}/friends/bermundo.mp4` },
  ];

  const [friendOpenIdx, setFriendOpenIdx] = useState(null);
  const [watched, setWatched] = useState({});
  const openFriend = (idx) => {
    setFriendOpenIdx(idx);
    document.body.style.overflow = "hidden"; // lock scroll
    pauseBGM(audioRef);
  };
  const closeFriend = () => {
    setFriendOpenIdx(null);
    document.body.style.overflow = ""; // unlock scroll
    resumeBGM(audioRef);
  };
  const markWatched = (idx) => setWatched((w) => ({ ...w, [friends[idx].key]: true }));

  /* ================================ SLIDESHOW ================================ */
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [whiteFade, setWhiteFade] = useState(false);
  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const startSlideshow = () => {
    document.body.style.overflow = "hidden";
    setShowSlideshow(true);
    setWhiteFade(true);
    fadeAudio(audioRef, 0.6, 400); // dim to 60%
    setTimeout(() => {
      setWhiteFade(false);
      setSlideIdx(0);
    }, 650);
  };
  const endSlideshow = () => {
    setShowSlideshow(false);
    fadeAudio(audioRef, 1, 400);
    document.body.style.overflow = "";
    const el = document.getElementById("gallery");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  useEffect(() => {
    if (!showSlideshow) return;
    const DISPLAY_MS = 4000;
    const id = setInterval(() => {
      setSlideIdx((i) => {
        const next = i + 1;
        if (next >= gallerySources.length) {
          clearInterval(id);
          setTimeout(endSlideshow, 400);
          return i;
        }
        return next;
      });
    }, DISPLAY_MS);
    return () => clearInterval(id);
  }, [showSlideshow, gallerySources.length]);

  /* ============================== ACCESSIBILITY ============================== */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (showPopup) setShowPopup(false);
        if (friendOpenIdx !== null) closeFriend();
        if (showSlideshow) endSlideshow();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPopup, showSlideshow, friendOpenIdx]);

  /* ---------- Auto-unmute YouTube Short after popup opens ---------- */
  useEffect(() => {
    if (!showPopup) return;
    const iframe = document.getElementById("saraVideo");
    if (!iframe || !iframe.contentWindow) return;
    const t = setTimeout(() => {
      iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
      iframe.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[100]}', '*');
    }, 800);
    return () => clearTimeout(t);
  }, [showPopup]);

  /* --------------------------------- assets --------------------------------- */
  const KITTY_BIG = `${BASE}/img/kitty_running.gif`;

  /* --------------------------------- render --------------------------------- */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff", // keep page WHITE; sections below add color
        color: "#111",
        fontFamily: "system-ui, Arial",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Background music */}
      <audio ref={audioRef} src={`${BASE}/audio/mjrt_bgm.mp3`} preload="auto" />

      {/* Confetti (fade in/out) */}
      <AnimatePresence>
        {confetti && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Confetti width={width} height={height} numberOfPieces={320} recycle={false} gravity={0.25} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------ LOADING (WHITE) ------------------------------ */}
      {phase === "loading" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#fff",
            display: "grid",
            placeItems: "center",
            zIndex: 50,
          }}
        >
          <img src={KITTY_BIG} alt="loading" style={{ width: "min(600px, 70vw)", height: "auto" }} />
        </div>
      )}

      {/* ----------------------------- BIRTHDAY HERO ----------------------------- */}
      {(phase === "birthday" || phase === "content") && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            textAlign: "center",
            padding: "24px 16px",
            minHeight: "100vh", // cover the whole screen
            display: "grid",
            placeItems: "center",
            background: "#fff",
          }}
        >
          <div>
            <h1
              ref={titleRef}
              className="font-feilla"
              style={{
                fontSize: "clamp(28px, 6.5vw, 48px)",
                margin: 0,
                fontWeight: 800,
                lineHeight: 1.15,
              }}
            >
              HAPPY BIRTHDAY,
              <br />
              MY LOVE!
              <br />
              🎂
            </h1>
            <p
              className="font-ink"
              style={{
                marginTop: 12,
                fontSize: "clamp(14px, 3.8vw, 16px)",
                lineHeight: 1.55,
                maxWidth: 640,
                marginInline: "auto",
                paddingInline: "clamp(8px, 3vw, 16px)",
              }}
            >
              From every text to every late-night FaceTime, you’ve filled my days with laughter and love.
              <br />You are my best friend, and I love you deeply.
              <br />Scroll down for our moments and something special 💘💖
            </p>
            <button
              style={{
                ...btnStyle,
                marginTop: 16,
                fontSize: "clamp(14px, 3.6vw, 18px)",
                padding: "clamp(10px, 2.8vw, 14px) clamp(16px, 5.5vw, 24px)",
                borderRadius: "clamp(12px, 3.8vw, 16px)",
              }}
              onClick={startSlideshow}
              aria-label="Play our memories slideshow"
            >
              See our memories :D
            </button>
          </div>
        </motion.section>
      )}

      {/* ------------------------------ GALLERY ------------------------------ */}
      <section id="gallery" style={{ background: "#fbcfe8" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 16px" }}>
          <div style={{ textAlign: "center", position: "relative" }}>
            <div style={{ display: "inline-block", position: "relative" }}>
              <h2 className="font-feilla" style={{ fontSize: 32, textAlign: "center", marginBottom: 16, fontWeight: 700 }}>
                Our little collage 💞
              </h2>
              {/* top-left GIF */}
              <img
                src={`${BASE}/img/our_corner.gif`}
                alt="corner accent"
                className="gifFloat"
                style={{ position: "absolute", top: -20, left: -40, width: 60, height: "auto", pointerEvents: "none" }}
                loading="lazy"
              />
              {/* bottom-right GIF */}
              <img
                src={`${BASE}/img/collage_corner.gif`}
                alt="corner accent"
                className="gifFloat"
                style={{ position: "absolute", bottom: -25, right: -45, width: 60, height: "auto", pointerEvents: "none" }}
                loading="lazy"
              />
            </div>
          </div>

          <p className="font-ink" style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 24px" }}>
            A mix of our fav pics together :P
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            {gallerySources.map((src, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 6px 16px rgba(0,0,0,.15)" }}>
                <img
                  src={src}
                  alt={`memory ${i + 1}`}
                  style={{ width: "100%", height: 200, objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------- FRIENDS (VIDEOS) --------------------------- */}
      <section id="friends" style={{ background: "#f9a8d4" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 16px" }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <h2 className="font-feilla" style={{ fontSize: 30, margin: 0, fontWeight: 800 }}>
              Messages from your friends and family! ❤️
            </h2>
            <img
              src={`${BASE}/img/friends_center.png`}
              alt="friends accent"
              className="gifFloat"
              style={{ display: "block", margin: "10px auto 0", width: 70, height: "auto", pointerEvents: "none" }}
              loading="lazy"
            />
            <p className="font-ink" style={{ marginTop: 6, opacity: 0.8 }}>Tap any box to play their video message</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 18 }}>
            {friends.map((f, idx) => {
              const tilt = width < 520 ? 0 : idx % 2 === 0 ? -2 : 2;
              return (
                <div
                  key={f.key}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open video message from ${f.name}`}
                  onClick={() => openFriend(idx)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openFriend(idx)}
                  style={{ position: "relative", background: "transparent", cursor: "pointer" }}
                >
                  {/* polaroid wrapper */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "3 / 4",
                      transform: `rotate(${tilt}deg)`,
                      transition: "transform .2s ease, box-shadow .2s ease",
                      filter: "drop-shadow(0 10px 20px rgba(0,0,0,.12))",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = `rotate(0deg) scale(1.02)`)}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = `rotate(${tilt}deg)`)}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "#fff",
                        border: "2px solid #fde2f3",
                        borderRadius: 18,
                        padding: 12,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          borderRadius: 12,
                          overflow: "hidden",
                          background: "#f8fafc",
                          width: "100%",
                          aspectRatio: "1 / 1",
                        }}
                      >
                        <img src={f.thumb} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
                      </div>

                      <div style={{ textAlign: "center", fontWeight: 700, marginTop: 10, lineHeight: 1.15, minHeight: 28 }}>{f.name}</div>

                      {/* play overlay */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          pointerEvents: "none",
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: "rgba(236,72,153,.9)",
                            display: "grid",
                            placeItems: "center",
                            boxShadow: "0 8px 20px rgba(236,72,153,.35)",
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>

                      {watched[f.key] && (
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            background: "#ec4899",
                            color: "#fff",
                            fontSize: 11,
                            padding: "4px 8px",
                            borderRadius: 999,
                          }}
                        >
                          Watched
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <img
            src={`${BASE}/img/peggy.png`}
            alt="bottom accent"
            className="gifFloat"
            style={{ display: "block", margin: "24px auto 0", width: 100, height: "auto", pointerEvents: "none" }}
            loading="lazy"
          />
        </div>
      </section>

      {/* ------------------------------ Friend Modal ------------------------------ */}
      {friendOpenIdx !== null && (
        <div style={modalBackdrop}>
          <div style={storyCard} role="dialog" aria-modal="true" aria-label={`${friends[friendOpenIdx].name}'s message`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong>{friends[friendOpenIdx].name}</strong>
              <button onClick={closeFriend} style={smallBtnStyle} aria-label="Close">✕</button>
            </div>
            <div style={storyFrame}>
              <video
                key={friends[friendOpenIdx].key}
                src={friends[friendOpenIdx].video}
                controls
                autoPlay
                playsInline
                onEnded={() => markWatched(friendOpenIdx)}
                onError={(e) => {
                  // Graceful handling if a file path is wrong or missing
                  e.currentTarget.replaceWith(Object.assign(document.createElement("div"), { style: "color:#fff;padding:12px;", innerText: "Video not available. We'll add it soon ❤️" }));
                }}
                style={storyVideo}
              />
            </div>
          </div>
        </div>
      )}

      {/* -------------------------- Surprise Popup (YouTube) -------------------------- */}
      <section style={{ background: "#fbcfe8", paddingBottom: 40 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <button
            style={{ ...btnStyle, fontSize: 18, padding: "14px 24px" }}
            onClick={() => {
              fadeOutAudio(audioRef);
              setShowPopup(true);
              document.body.style.overflow = "hidden"; // lock scroll while popup is open
            }}
          >
            Click me for a surprise 🎁
          </button>
          <p className="font-ink" style={{ opacity: 0.7, fontSize: 12, margin: 0 }}>Turn up your volume 🔊</p>
        </div>
      </section>

      {showPopup && (
        <div style={modalBackdrop}>
          <div style={modalCard} role="dialog" aria-modal="true" aria-label="Happy Birthday popup">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong>Happy Birthday 💝</strong>
              <button
                onClick={() => {
                  setShowPopup(false);
                  document.body.style.overflow = "";
                }}
                style={smallBtnStyle}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="vertical-video-wrapper" style={{ width: "min(520px, 96vw)" }}>
              <iframe
                id="saraVideo"
                src="https://www.youtube.com/embed/aoG7TCcWIWs?playsinline=1&modestbranding=1&autoplay=1&mute=1&enablejsapi=1"
                title="Sara's Surprise Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ width: "100%", aspectRatio: "9 / 16", borderRadius: 18 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* --------------------------- Slideshow Overlay --------------------------- */}
      {showSlideshow && (
        <div style={ssBackdrop}>
          {/* White flash layer */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#fff",
              opacity: whiteFade ? 1 : 0,
              transition: "opacity 650ms ease",
              pointerEvents: "none",
            }}
          />

          {/* Slides */}
          <div style={ssStage} className={prefersReducedMotion ? "no-motion" : undefined}>
            {gallerySources.map((src, i) => {
              const isActive = i === slideIdx;
              const even = i % 2 === 0;
              const anim = prefersReducedMotion
                ? "none"
                : isActive
                ? even
                  ? "kenBurnsIn 4000ms ease forwards"
                  : "kenBurnsOut 4000ms ease forwards"
                : "none";
              return (
                <div
                  key={src + i}
                  style={{ ...ssSlide, opacity: isActive ? 1 : 0, transition: "opacity 1000ms ease", transform: "translateZ(0)" }}
                >
                  <div style={{ ...ssImageWrap, animation: anim }}>
                    <img src={src} alt={`slide ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </div>
              );
            })}
          </div>

          <button style={ssSkipBtn} onClick={endSlideshow} aria-label="Skip slideshow">Skip</button>

          {/* Ken Burns keyframes */}
          <style>{`
            @keyframes kenBurnsIn { 0% { transform: scale(1.05) translate(0,0) } 100% { transform: scale(1.12) translate(1.2%,1.2%) } }
            @keyframes kenBurnsOut { 0% { transform: scale(1.12) translate(-1.2%,-1.2%) } 100% { transform: scale(1.05) translate(0,0) } }
            @keyframes float { 0% { transform: translateY(0) } 50% { transform: translateY(-6px) } 100% { transform: translateY(0) } }
            .gifFloat { animation: float 3.2s ease-in-out infinite }
            @media (prefers-reduced-motion: reduce) { .no-motion { animation: none !important; transition: none !important } .gifFloat { animation: none !important } }
          `}</style>
        </div>
      )}

      {/* ------------------------------ Footer ------------------------------ */}
      <footer style={{ background: "#fbcfe8" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "24px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <p className="font-ink" style={{ margin: 0, fontSize: 14 }}>Made with love 💗</p>
          <p className="font-ink" style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>Scan the QR to open this page</p>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------- inline styles ------------------------------- */
const btnStyle = {
  background: "#ec4899",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: 16,
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(0,0,0,.15)",
};
const smallBtnStyle = {
  background: "#f1f5f9",
  border: "1px solid #e2e8f0",
  padding: "6px 10px",
  borderRadius: 10,
  cursor: "pointer",
};
const modalBackdrop = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};
const modalCard = {
  background: "white",
  borderRadius: 16,
  padding: 16,
  width: "auto",
  maxWidth: 480,
  height: "auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
};

/* Story-style friend video */
const storyCard = {
  background: "white",
  borderRadius: 16,
  padding: 12,
  width: "min(520px, 96vw)",
  boxShadow: "0 10px 30px rgba(0,0,0,.25)",
};
const storyFrame = {
  width: "100%",
  aspectRatio: "9 / 16",
  background: "#000",
  borderRadius: 20,
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const storyVideo = {
  height: "100%",
  width: "auto",
  objectFit: "cover",
};

/* Slideshow overlay */
const ssBackdrop = {
  position: "fixed",
  inset: 0,
  background: "#000",
  zIndex: 80,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const ssStage = {
  position: "relative",
  width: "min(1200px, 100vw)",
  height: "min(80vh, 720px)",
  overflow: "hidden",
  borderRadius: 16,
  boxShadow: "0 12px 32px rgba(0,0,0,.35)",
  background: "#000",
};
const ssSlide = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const ssImageWrap = {
  position: "absolute",
  inset: 0,
  transformOrigin: "center center",
  willChange: "transform",
};
const ssSkipBtn = {
  position: "absolute",
  top: 18,
  right: 18,
  padding: "8px 14px",
  fontSize: 14,
  background: "rgba(255,255,255,.9)",
  border: "1px solid rgba(0,0,0,.08)",
  borderRadius: 999,
  cursor: "pointer",
};
