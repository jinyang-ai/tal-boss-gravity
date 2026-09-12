// ============================================================
// Brand furniture: the two typefaces and the stage every cut sits on.
//
// ObviouslyNarrowBold is the display face and it is SUBSET. It contains
// A-Za-z0-9, space, comma and period. Nothing else. No apostrophe, no
// hyphen, no question mark, no colon, no ampersand. Anything outside that
// set renders as a fallback glyph and looks broken, so headline copy has to
// be written around it. See CLAUDE.md.
// ============================================================
import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont } from "@remotion/fonts";

export const REEL_W = 720;
export const REEL_H = 900;

export const OBVIOUSLY = "ObviouslyNarrowBold";

// loadFont registers its own delayRender, so the render waits for the file
// to decode before drawing a frame.
export const obviouslyReady = loadFont({
  family: OBVIOUSLY,
  url: staticFile("fonts/ObviouslyNarrowBold.otf"),
  weight: "700",
  format: "opentype",
});

const inter = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  ignoreTooManyRequestsWarning: true,
});

// display type - the headline face
export const disp = (size: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: `${OBVIOUSLY}, sans-serif`,
  fontWeight: 700,
  textTransform: "uppercase",
  fontSize: size,
  lineHeight: 0.98,
  letterSpacing: "-0.01em",
  textAlign: "center",
  ...extra,
});

export const Stage: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = "#fff" }) => (
  <AbsoluteFill
    style={{
      fontFamily: inter.fontFamily,
      background: bg,
      letterSpacing: "-0.01em",
      WebkitFontSmoothing: "antialiased",
      overflow: "hidden",
    }}
  >
    {children}
  </AbsoluteFill>
);
