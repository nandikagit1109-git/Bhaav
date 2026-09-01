/**
 * Bright, warm, home-like mood lighting.
 * The room should feel like a cozy study, not a dark cave.
 */
export default function MoodLighting() {
  return (
    <>
      {/* Strong ambient base — warm and bright */}
      <ambientLight color="#4a3828" intensity={0.6} />

      {/* Main overhead — warm chandelier feel */}
      <pointLight
        position={[0, 2.8, 0]}
        color="#f0c87a"
        intensity={2.0}
        distance={12}
        decay={1.5}
      />

      {/* Secondary warm — fills the left side */}
      <pointLight
        position={[-2, 1.8, 0.5]}
        color="#e8b060"
        intensity={1.0}
        distance={8}
        decay={2}
      />

      {/* Window side — soft daylight */}
      <pointLight
        position={[3, 1.8, -0.5]}
        color="#8ab4d0"
        intensity={0.8}
        distance={8}
        decay={2}
      />

      {/* Back fill — warm glow on back wall */}
      <pointLight
        position={[0, 1.8, -2.5]}
        color="#d4a870"
        intensity={0.7}
        distance={7}
        decay={2}
      />

      {/* Floor bounce — soft warmth from below */}
      <pointLight
        position={[0, 0.4, 1]}
        color="#c8956c"
        intensity={0.4}
        distance={5}
        decay={2}
      />

      {/* Desk lamp accent */}
      <pointLight
        position={[-0.5, 1.1, 0]}
        color="#f5d89a"
        intensity={1.2}
        distance={3}
        decay={2}
      />

      {/* Right wall warmth */}
      <pointLight
        position={[2.5, 1.5, 1]}
        color="#d4a870"
        intensity={0.5}
        distance={6}
        decay={2}
      />
    </>
  );
}
