import { useEffect, useState } from "react";
import Intro from "./Intro";
import Reveal from "./Reveal";
import "./styles.css";

export default function App() {
  // route = "intro" (/) or "reveal" (/reveal)
  const [route, setRoute] = useState(
    window.location.pathname === "/reveal" ? "reveal" : "intro"
  );

  // simple client-side navigation
  const goTo = (page) => {
    const path = page === "reveal" ? "/reveal" : "/";
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
      setRoute(page);
      // ensure we start at the top of the new screen
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  };

  // back/forward buttons support
  useEffect(() => {
    const onPop = () =>
      setRoute(window.location.pathname === "/reveal" ? "reveal" : "intro");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return route === "intro" ? (
    <Intro onContinue={() => goTo("reveal")} />
  ) : (
    <Reveal onBack={() => goTo("intro")} />
  );
}
