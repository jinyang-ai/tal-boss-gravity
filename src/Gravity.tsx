// ============================================================
// GRAVITY - "The coolest <cohort> of Bangalore are on tal BOSS."
//
// One idea, held completely still. The companies where the best people in
// Bangalore actually work spiral inward and fall into the tal BOSS lockup.
// Every word on screen is static: the only motion in the frame is the pull
// toward the centre.
//
// The field is periodic over the full duration, so the mp4 loops and the GIF
// has no seam. Frame zero is fully composed - no fade in, no entrance - so
// the still works as the ad on a muted feed.
//
// Driven by a cohort from cohorts.ts, so engineers, AI engineers, PMs,
// designers, growth and builders are all the same film with a different
// claim and a different set of names.
// ============================================================
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Stage, disp, REEL_W, REEL_H } from "./brand";
import { COHORTS, weave, type Cohort } from "./cohorts";

export const GRAVITY_FPS = 25;
export const GRAVITY_TOTAL = 12 * GRAVITY_FPS; // 12s, exactly one cycle of the spiral

const BLACK = "#0B0B0D";
const WHITE = "#FFFFFF";

// ---- the spiral, in frame coordinates (720x900) ----
const CX = 360;
const CY = 435; // the lockup is the centre of gravity
const R_OUT = 600; // enters just past the corners
const R_IN = 28; // by here it is inside the lockup plate and out of sight
const RAD_EXP = 0.5; // 0.5 is the value that keeps the field evenly dense
// at every radius, and it also makes the fall accelerate on the way in
// ---- the event horizon ----
// Shaped like the message it protects: a wide, shallow squircle rather than a
// disc, which is what keeps three quarters of the frame available to the
// field. VOID_N = 4 gives it soft shoulders instead of corners.
const VOID_A = 268;
const VOID_B = 172;
const VOID_N = 4;
const VOID_FEATHER = 0.26;
const SWEEP = 0.62; // turns travelled on the way in
const THETA_EXP = 1.15; // >1 so the orbit tightens as it closes on the core
// Five arms rather than three: same tile count, but each arm is sparser, so
// neighbours on the same track stop colliding as they come in.
const ARMS = 5;
const PER_ARM = 13;
const N = ARMS * PER_ARM; // 65 tiles in the field

// ---- headline metrics ----
// ObviouslyNarrowBold uppercase measures ~0.473em per character. Sizing off
// that keeps a long cohort ("product managers") on one line without anyone
// having to retune the layout.
const CHAR_EM = 0.473;
const HEAD_MAX_W = 560;
const HEAD_MAX_SIZE = 47;
const HEAD_BASELINE = 404; // the headline block always bottoms out here
const LINE = 1.04;

type Tile = { logo?: string; name?: string };

const LOGOS = [
  "logo-swiggy.png", "logo-cred.png", "logo-razorpay.png", "logo-phonepe.png",
  "logo-groww.png", "logo-kite.png", "logo-meesho.png", "logo-sharechat.png",
];

// Every fourth tile is a real logo, which lands them on all three arms and
// spreads them the length of the spiral. The eight marks go round twice; the
// two instances of any one are 32 tiles apart, so they sit on different arms
// at opposite ends of the run. Anything past the eighth wraps round again.
const LOGO_AT = new Set([0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64]);

const buildTiles = (cohort: Cohort): Tile[] => {
  const names = weave(cohort);
  const out: Tile[] = [];
  let li = 0;
  let ni = 0;
  for (let i = 0; i < N; i++) {
    out.push(LOGO_AT.has(i) ? { logo: `reel/${LOGOS[li++ % LOGOS.length]}` } : { name: names[ni++] });
  }
  return out;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// The path itself. `p` is how far along the inward run a tile is: 0 at the
// outer edge, 1 at the core. Radius eases in and the orbit tightens, so a
// tile drifts at the rim and accelerates as it falls - and the same function
// draws the track underneath, which is what makes the spiral legible.
const at = (p: number, arm: number) => {
  const r = R_IN + (R_OUT - R_IN) * Math.pow(1 - p, RAD_EXP);
  const theta = (arm * 2 * Math.PI) / ARMS + Math.pow(p, THETA_EXP) * SWEEP * 2 * Math.PI;
  return { r, x: CX + r * Math.cos(theta), y: CY + r * Math.sin(theta) };
};

// the track runs all the way to the core, but it is masked off before it
// reaches the type - so it reads as a path disappearing in, not a line
// crossing the headline
const TRACK_MASK = `radial-gradient(ellipse ${VOID_A}px ${VOID_B}px at ${CX}px ${CY}px, transparent 68%, #000 124%)`;

// How far outside the horizon a point is. 1 is the boundary itself.
const horizon = (x: number, y: number) =>
  Math.pow(
    Math.pow(Math.abs(x - CX) / VOID_A, VOID_N) + Math.pow(Math.abs(y - CY) / VOID_B, VOID_N),
    1 / VOID_N
  );

// A tile spiralling in can skim the horizon at a shallow angle and briefly
// read as further out again, which would show up as a blink. So each arm gets
// a fade curve precomputed over p and forced non-increasing: once a tile
// starts dissolving it never comes back.
const SAMPLES = 240;
const FADE = Array.from({ length: ARMS }, (_, arm) => {
  const curve = new Float64Array(SAMPLES + 1);
  let run = 1;
  for (let k = 0; k <= SAMPLES; k++) {
    const { x, y } = at(k / SAMPLES, arm);
    run = Math.min(run, Math.min(1, Math.max(0, (horizon(x, y) - 1) / VOID_FEATHER)));
    curve[k] = run;
  }
  return curve;
});

const fadeAt = (p: number, arm: number) => {
  const t = Math.min(SAMPLES, Math.max(0, p * SAMPLES));
  const i = Math.min(SAMPLES - 1, Math.floor(t));
  const f = t - i;
  return FADE[arm][i] * (1 - f) + FADE[arm][i + 1] * f;
};

// one faint stroke per arm, static, drawn behind the tiles
const TRACKS = Array.from({ length: ARMS }, (_, arm) => {
  const pts: string[] = [];
  for (let k = 0; k <= 160; k++) {
    const { x, y } = at(k / 160, arm);
    pts.push(`${k === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
});

// One tile, riding the track for its arm. Tiles are evenly spaced in p, so
// as one vanishes into the core another enters at the rim and the loop
// closes on itself. Nothing here fades near the type: the plates drawn on
// top do the occluding, which reads as passing behind rather than blinking.
const Node: React.FC<{ tile: Tile; index: number; frame: number }> = ({ tile, index, frame }) => {
  const arm = index % ARMS;
  const slot = Math.floor(index / ARMS);
  const p = (slot / PER_ARM + frame / GRAVITY_TOTAL) % 1;

  const { r, x, y } = at(p, arm);

  const size = (36 + 38 * (r / R_OUT)) * (tile.logo ? 1.1 : 1);
  // shrinks as well as fades, so it reads as falling away into the core
  // rather than just dimming in place
  const core = fadeAt(p, arm);
  const opacity = clamp01(p / 0.04) * core;
  if (opacity < 0.01) return null;

  const blur = Math.max(0, r / R_OUT - 0.85) * 9; // the nearest sit out of focus
  const wrap: React.CSSProperties = {
    position: "absolute",
    left: x,
    top: y,
    transform: `translate(-50%, -50%) scale(${(0.45 + 0.55 * core).toFixed(3)})`,
    opacity,
    filter: blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : undefined,
  };

  if (tile.logo) {
    return (
      <div style={wrap}>
        <div
          style={{
            width: size,
            height: size,
            borderRadius: size * 0.27,
            background: WHITE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Img src={staticFile(tile.logo)} style={{ width: size * 0.64, height: size * 0.64, objectFit: "contain" }} />
        </div>
      </div>
    );
  }

  const name = tile.name as string;
  const fit = name.length > 8 ? 0.76 : name.length > 6 ? 0.88 : 1;
  return (
    <div style={wrap}>
      <div
        style={{
          height: size * 0.68,
          borderRadius: 999,
          background: WHITE,
          color: BLACK,
          display: "flex",
          alignItems: "center",
          padding: `0 ${size * 0.3}px`,
          fontSize: size * 0.32 * fit,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </div>
    </div>
  );
};

// A soft-edged slab of the background colour, drawn over the field. Tiles
// slide behind it and get clipped rather than dimmed, which is why the frame
// no longer flickers. Invisible against the ground; it only shows as absence.
const Plate: React.FC<{ cx: number; cy: number; w: number; h: number; r: number }> = ({ cx, cy, w, h, r }) => (
  <div
    style={{
      position: "absolute",
      left: cx - w / 2,
      top: cy - h / 2,
      width: w,
      height: h,
      borderRadius: r,
      background: BLACK,
      filter: "blur(17px)",
    }}
  />
);

export const Gravity: React.FC<{ cohort?: Cohort }> = ({ cohort = COHORTS[0] }) => {
  const frame = useCurrentFrame();

  const chars = Math.max(cohort.head[0].length, cohort.head[1].length);
  const headSize = Math.min(HEAD_MAX_SIZE, Math.floor(HEAD_MAX_W / (chars * CHAR_EM)));
  const headW = chars * CHAR_EM * headSize;
  const headH = 2 * LINE * headSize;

  const tiles = React.useMemo(() => buildTiles(cohort), [cohort]);

  return (
    <Stage bg={BLACK}>
      {/* the track, so the path the field is on is legible even in a still */}
      <AbsoluteFill
        style={{
          maskImage: TRACK_MASK,
          WebkitMaskImage: TRACK_MASK,
        }}
      >
        <svg width={REEL_W} height={REEL_H} viewBox={`0 0 ${REEL_W} ${REEL_H}`}>
          {TRACKS.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={2.2} />
          ))}
        </svg>
      </AbsoluteFill>

      <AbsoluteFill>
        {tiles.map((t, i) => (
          <Node key={i} tile={t} index={i} frame={frame} />
        ))}
      </AbsoluteFill>

      {/* ---- static from here down ---- */}
      <Plate cx={CX} cy={784} w={540} h={168} r={60} />

      <div style={{ position: "absolute", left: 0, right: 0, top: HEAD_BASELINE - headH }}>
        <div style={disp(headSize, { color: WHITE, lineHeight: LINE })}>{cohort.head[0]}</div>
        <div style={disp(headSize, { color: WHITE, lineHeight: LINE })}>{cohort.head[1]}</div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 428, display: "flex", justifyContent: "center" }}>
        <Img src={staticFile("reel/tal-boss-wordmark-cream.png")} style={{ height: 150, width: "auto", display: "block" }} />
      </div>

      {/* the call to action: the store badges are drawn for a light ground,
          so they get one */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, display: "flex", justifyContent: "center" }}>
        <div style={{ background: WHITE, borderRadius: 30, padding: "26px 34px", display: "flex" }}>
          <Img src={staticFile("reel/badges-stores.png")} style={{ width: 412, height: "auto", display: "block" }} />
        </div>
      </div>
    </Stage>
  );
};
