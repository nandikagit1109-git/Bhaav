/**
 * Brighter, warm home-like mood lighting.
 * More ambient light + stronger point lights for visibility.
 */
export default function MoodLighting() {
  return (
    <>
      {/* Ambient — brighter warm base */}
      <ambientLight color="#3a2a1a" intensity={0.35} />

      {/* Main overhead — strong warm amber */}
      <pointLight
        position={[0.3, 2.6, 0.2]}
        color="#e8b060"
        intensity={1.2}
        distance={10}
        decay={2}
      />

      {/* Secondary warm — wall light strip side */}
      <pointLight
        position={[-2.5, 0.5, 0]}
        color="#c8956c"
        intensity={0.6}
        distance={6}
        decay={2}
      />

      {/* Window side — cool daylight feel */}
      <pointLight
        position={[3, 1.8, -0.5]}
        color="#6a8aaa"
        intensity={0.5}
        distance={7}
        decay={2}
      />

      {/* Back fill — prevents dark corners */}
      <pointLight
        position={[0, 1.5, -2]}
        color="#5a4a3a"
        intensity={0.3}
        distance={6}
        decay={2}
      />

      {/* Floor bounce — subtle upward warmth */}
      <pointLight
        position={[0, 0.3, 0.5]}
        color="#c8956c"
        intensity={0.15}
        distance={4}
        decay={2}
      />
    </>
  );
}
