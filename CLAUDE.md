# tal BOSS - Gravity

A single Remotion film with one idea: the companies where Bangalore actually
works spiral inward and dissolve into the tal BOSS lockup. Nothing on screen
moves except the field. The message and the call to action are dead still.

There are six cuts of it today (engineers, AI engineers, PMs, designers,
growth, builders). They are the same film with a different claim and a
different set of company names.

## Run it

```bash
npm install
npm run dev          # Remotion Studio, pick a Gravity-* composition
```

**One-time setup.** The display face is a licensed commercial typeface and is
not committed to this repo. Put `ObviouslyNarrowBold.otf` in `public/fonts/`
before rendering - `public/fonts/README.md` says where to get it. Without it
every headline silently falls back to a system sans and the film looks wrong
but not obviously broken, which is why `npm run render` refuses to start until
the file is there. Remotion Studio will not refuse; it just renders the
fallback, so check the headline looks like the poster in `docs/`.

## The 90% task: add a variation

Everything that makes a cut different lives in `src/cohorts.ts`. Add an entry
to `COHORTS` and a new composition appears automatically - `src/Root.tsx` maps
over the array, so there is nothing else to register.

```ts
{
  id: "data",                                        // becomes Gravity-data
  head: ["The coolest data scientists", "of Bangalore are on"],
  lead: [ /* 17 companies specific to this craft */ ],
}
```

- `head` is the two display lines. The third line of the sentence is the
  lockup itself, so line two should always end on a word that runs into it
  ("...are on").
- `lead` must be exactly **17** names. They get woven one-for-two through the
  shared `CORE` list to fill the field, so cohort-specific names spread the
  length of the spiral instead of bunching at one end.
- `npm run typecheck` will not catch a wrong count. Check it:
  `npx tsx -e "import {COHORTS,weave} from './src/cohorts'; COHORTS.forEach(c=>console.log(c.id, weave(c).length))"`
  Every cohort must print **48**.

## Things that will silently break

These are not style preferences. Each one produces a broken render that looks
almost right.

**The display face is subset.** `ObviouslyNarrowBold.otf` (see setup above)
contains `A-Za-z0-9`,
space, comma and period. That is the whole character set - 66 glyphs. No
apostrophe, no hyphen, no question mark, no colon, no ampersand, no digits with
punctuation. "Bangalore's best" renders with a fallback glyph and looks like a
bug. Write headline copy around it: "The coolest engineers of Bangalore are on"
needs no punctuation at all, which is why it is phrased that way.

**No `Math.random`, ever.** Remotion renders frames across separate worker
processes. A random call returns a different value on different frames of the
same video and the field visibly jitters. Anything that needs to vary per tile
must derive from the tile index.

**The loop has to stay periodic.** `GRAVITY_TOTAL` is both the composition
length and the time it takes one tile to fall from the rim to the core. Tiles
are spaced evenly in that cycle, so as one dissolves another enters and frame
`TOTAL` is identical to frame `0`. Change the duration and the motion rescales
with it and stays seamless. Add anything that is *not* periodic over
`GRAVITY_TOTAL` - a spring, an entrance, a one-shot - and the GIF gets a visible
seam at the loop point.

**Frame zero is the ad.** On a muted autoplay feed most people never see frame
two. Frame zero is fully composed and completely still: no fade in, no
entrance. Keep it that way. `scripts/render.sh` exports it as a PNG for exactly
this reason.

**Company names must not collide with logo tiles.** Eight companies have real
logo marks (Swiggy, CRED, Razorpay, PhonePe, Groww, Zerodha, Meesho, ShareChat).
If one of those names also appears in `CORE` or a `lead` list you get the mark
and the wordmark on screen at the same time. Keep names to nine characters or
fewer too, or they stop reading on a small tile.

## Render

```bash
npm run render engineers        # -> out/Gravity-engineers-v1.{mp4,720.gif,frame1.png}
npm run render engineers v2     # a new version, side by side
npm run render all v2           # every cohort
```

Output is 1080x1350 at 25fps, plus a 720x900 GIF and a 1440x1800 poster still.

**Never overwrite a render.** Bump the version tag. Cuts get shared around and
you need to be able to point at exactly one file. The script refuses to
clobber an existing mp4.

**GIFs go through the ffmpeg palette path**, never Remotion's gif codec, which
bands badly on flat colour. The recipe is in `scripts/render.sh`. They land
around 19 MB because the whole frame is in motion and there is nothing for
interframe compression to hold onto - the 5 MB mp4 is the asset for any
placement that takes video.

## How the film is built

`src/Gravity.tsx`, top to bottom:

- **`at(p, arm)`** is the path. `p` is how far along the inward run a tile is:
  `0` at the rim, `1` at the core. Radius eases in with `RAD_EXP = 0.5`, which
  is the exponent that keeps the field evenly dense at every radius while still
  making the fall accelerate. The orbit tightens slightly on the way in
  (`THETA_EXP`). The same function draws the faint tracks, which is what makes
  the spiral legible in a still frame.
- **The horizon** is a squircle (`VOID_A`, `VOID_B`, `VOID_N = 4`), not a
  circle. It is shaped like the message it protects - wide and shallow - which
  leaves three quarters of the frame to the field. A disc here ate half the
  frame and pushed every tile to the edges.
- **`FADE`** precomputes a per-arm dissolve curve over `p` and forces it
  non-increasing. A tile can skim the horizon at a shallow angle and briefly
  read as further out again; without this it blinks. Tiles shrink as well as
  fade, so they read as falling away rather than dimming in place.
- **`ARMS = 5`** with 13 tiles each. Three arms put same-arm neighbours about
  100px apart and they collided.

Tuning knobs, in the order you will want them: `SWEEP` (how much spiral),
`GRAVITY_TOTAL` (speed - the whole film scales with it), `PER_ARM` (density),
`VOID_A`/`VOID_B` (how much room the message takes).

## Layout, in 720x900 frame coordinates

| | |
|---|---|
| spiral centre | `(360, 435)` - the lockup is the centre of gravity |
| headline | bottom-aligned to `y = 404`, auto-sized to fit `HEAD_MAX_W` |
| lockup | `y = 428`, 150px tall |
| store badges | white card, 56px off the bottom |

The headline auto-sizes off a measured `0.473em` per character, which is why
"product managers" fits on one line without anyone retuning the layout. If you
add a much longer cohort name, check it renders inside the frame rather than
trusting the estimate.

## Brand

Black `#0B0B0D` and white. The lockup is the cream wordmark. Do not introduce
the purple from the older tal reels into this film - the whole point of this
one is that it is monochrome and still.
