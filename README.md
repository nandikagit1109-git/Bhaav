# Bhaav Frontend

An immersive 3D narrative journal — a quiet digital space that learns the rhythm of how you write.

## The Experience

Bhaav is NOT a conventional web app. It is an interactive digital art experience where:

- Your typing rhythm becomes the environment
- Pauses become stillness  
- Sessions become memory
- The data becomes the landscape

## Tech Stack

- React 19
- Vite
- React Three Fiber (3D)
- Three.js
- @react-three/drei
- Framer Motion
- Zustand

## Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` and connects to the backend on `http://localhost:4000`.

## Environment Variables

Copy `.env.example` to `.env`:

```bash
VITE_API_BASE_URL=http://localhost:4000
```

## Architecture

```
src/
├── App.jsx              # Root — game state machine
├── api.js               # Centralized API client
├── gameStore.js         # Zustand state
├── EntryExperience.jsx  # Original 2D landing
├── RoomEntry.jsx        # 3D cinematic entry
├── MoodRoom.jsx         # Main 3D environment
├── RoomJournal.jsx      # Writing mode
├── RoomObjects.jsx      # 3D furniture + interactables
├── RoomAreas.jsx        # Rhythm Wall, Reflection, Support, etc.
├── FirstPersonControls.jsx  # WASD + mouse look
├── Crosshair.jsx        # Raycast interaction system
├── MoodLighting.jsx     # Dynamic mood-reactive lighting
├── InkLine.jsx          # Live-reacting SVG ink line
├── InkCloud.jsx         # Entry scene ink cloud
├── Dashboard.jsx        # 2D analysis dashboard
└── AdminDashboard.jsx   # Campus Pulse admin view
```

## Privacy

Bhaav NEVER stores or transmits journal text. Only keystroke metadata is captured:

- Key type (char, space, backspace, enter)
- Timestamp

All analysis is performed on aggregated behavioral patterns, never content.

## License

MIT
