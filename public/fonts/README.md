# Fonts

This directory is intentionally empty in git.

The display face, **Obviously Narrow Bold** (OH no Type Co), is a licensed
commercial typeface. It is not redistributed here. Renders will fail with a
clear message until you put it in place.

Drop the file here, named exactly:

```
public/fonts/ObviouslyNarrowBold.otf
```

Ask the design team for it, or pull it from the tal brand asset store. The
body face is Inter, which loads from Google Fonts at render time and needs no
setup.

## Why it matters which file

The copy of the face we use is **subset**: it contains `A-Za-z0-9`, space,
comma and period, and nothing else. Headline copy is written around that. A
fuller cut of Obviously will render the same words identically, so you are
safe either way, but do not assume punctuation works just because your copy
has more glyphs in it. See CLAUDE.md.
