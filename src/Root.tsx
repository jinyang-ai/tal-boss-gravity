import { Composition } from "remotion";
import { Gravity, GRAVITY_TOTAL, GRAVITY_FPS } from "./Gravity";
import { COHORTS } from "./cohorts";
import { REEL_W, REEL_H } from "./brand";

// One composition per cohort, all driven from cohorts.ts. Adding a cut means
// adding an entry there, not touching this file.
export const RemotionRoot: React.FC = () => (
  <>
    {COHORTS.map((c) => (
      <Composition
        key={c.id}
        id={`Gravity-${c.id}`}
        component={Gravity}
        durationInFrames={GRAVITY_TOTAL}
        fps={GRAVITY_FPS}
        width={REEL_W}
        height={REEL_H}
        defaultProps={{ cohort: c }}
      />
    ))}
  </>
);
