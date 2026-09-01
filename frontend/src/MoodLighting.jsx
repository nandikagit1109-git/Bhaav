/**
 * Warm, home-like mood lighting.
 * Amber overhead, soft warm fill, gentle cool accent.
 * All static — zero per-frame cost.
 */
export default function MoodLighting() {
  return (
    <>
      {/* Ambient — warm base fill */}
      <ambientLight color="#2a1f14" intensity={0.18} />

      {/* Main overhead — warm amber desk lamp glow */}
      <pointLight
        position={[0.3, 2.6, 0.2]}
        color="#e8b060"
        intensity={0.5}
        distance={8}
        decay={2}
      />

      {/* Secondary warm — from the wall light strip */}
      <pointLight
        position={[-2.5, 0.5, 0]}
        color="#c8956c"
        intensity={0.2}
        distance={5}
        decay={2}
      />

      {/* Fill — subtle cool from the window side */}
      <pointLight
        position={[3, 1.2, -0.5]}
        color="#3a4a6a"
        intensity={0.12}
        distance={5}
        decay={2}
      />

      {/* Soft back fill — prevents total darkness */}
      <pointLight
        position={[0, 1.5, -2]}
        color="#4a3a2a"
        intensity={0.08}
        distance={4}
        decay={2}
      />
    </>
  );
}
