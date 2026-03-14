# Running Pace Calculator

A collection of running-related calculators. Installable as a PWA for offline use.

## Features

### Pace to time
Enter a pace (min/km, min/mile, or km/h) and see projected finish times for standard race distances (5k, 10k, half marathon, marathon, 100k, 100 miles). Supports adding custom distances.

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
