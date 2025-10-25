import { useEffect, useState } from "react";

export default function Intro({ onContinue }) {
  const CURTAIN_SRC = process.env.PUBLIC_URL + "/assets/curtains-border.png";
  const GIF_SRC = process.env.PUBLIC_URL + "/assets/intro.gif";

  // staged intro sequence
  const [phase, setPhase] = useState({
    bg: false,
    gif: false,
    h1: false,
    h2: false,
    prompt: false,
    cta: false,
  });

  // exit animation (zoom + fade to black)
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const seq = [
      ["bg", 500],
      ["gif", 1200],
      ["h1", 1600],
      ["h2", 1900],
      ["prompt", 2200],
      ["cta", 2500],
    ];
    const timers = seq.map(([key, delay]) =>
      setTimeout(() => setPhase((p) => ({ ...p, [key]: true })), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleContinue = () => {
    if (leaving) return;
    setLeaving(true);                  // trigger zoom + blackout
    setTimeout(() => onContinue(), 900); // match CSS transition duration
  };

  return (
    <div className={`intro-wrapper ${leaving ? "leaving" : ""}`}>
      {/* stage background (black → white) */}
      <div className={`stage-bg ${phase.bg ? "to-white" : ""}`} />

      {/* fixed curtain frame */}
      <img
        src={CURTAIN_SRC}
        alt="curtain border"
        className="curtain-frame"
        loading="eager"
      />

      {/* centered content */}
      <div className="intro-content">
        <div className={`fade ${phase.gif ? "in" : ""}`}>
          <img src={GIF_SRC} alt="intro" className="intro-gif" />
        </div>

        <h1 className={`headline fade ${phase.h1 ? "in" : ""}`}>Hi SARA! :)</h1>
        <h2 className={`subhead fade ${phase.h2 ? "in" : ""}`}>I made you a surprise</h2>
        <p className={`prompt fade ${phase.prompt ? "in" : ""}`}>do you wanna see it?</p>

        <button
          className={`cta fade ${phase.cta ? "in" : ""}`}
          onClick={handleContinue}
          aria-label="Open the surprise"
        >
          <span className="heart">❤️</span>
          <span className="cta-text">click me!</span>
          <span className="heart">❤️</span>
        </button>
      </div>

      {/* full-screen black overlay for exit */}
      <div className={`blackout ${leaving ? "show" : ""}`} />
    </div>
  );
}
