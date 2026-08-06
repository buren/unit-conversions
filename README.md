# Pace Kit

A collection of running-related calculators. Installable as a PWA for offline use.

## Features

### Pace to time
Enter a pace (min/km, min/mile, or km/h) and see projected finish times for standard race distances (5k, 10k, 15k, half marathon, marathon, 50k, 100k, 100 miles). Supports adding custom distances.

Once a pace is entered, a slider shifts the assumed pace up or down (in s/km, or s/mile when the input is per mile) and every row shows the resulting time alongside the difference from the original pace. Clicking a row expands it to show that distance at a ladder of nearby paces, centred on the currently assumed one.

### Time to pace
Enter a total time and optionally a race distance to calculate required paces. Without a distance, shows the pace needed for each standard distance to finish in the given time.

### Training paces
Embedded VDOT (Jack Daniels) and Tinman (Tom Schwartz) calculators for deriving training paces from race results.

### Treadmill incline calculator
Calculate total elevation gain for multi-step treadmill workouts. Each step supports duration (with speed) or distance mode, incline %, and repetitions.

## Development

Built with React, TypeScript, Tailwind CSS, and Vite.

### Prerequisites

- Node.js

### Setup

```
pnpm install
```

### Dev server

```
pnpm run dev
```

### Run tests

```
pnpm test
```

### Build for production

```
pnpm run build
pnpm run preview  # preview the production build locally
```

## URL state

All calculator inputs are persisted in the URL query string, making workouts and pace calculations shareable via link.
