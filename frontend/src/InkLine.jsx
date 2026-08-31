import {
  motion,
  useMotionValue,
  useSpring
} from "framer-motion";

function InkLine({ active = false }) {

  // =========================================
  // MOUSE POSITION
  // =========================================

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);


  // =========================================
  // SMOOTH SPRING
  // =========================================

  const springX = useSpring(mouseX, {
    stiffness: 22,
    damping: 32,
    mass: 1.5
  });

  const springY = useSpring(mouseY, {
    stiffness: 22,
    damping: 32,
    mass: 1.5
  });


  // =========================================
  // POINTER MOVEMENT
  // =========================================

  function handlePointerMove(event) {

    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      event.clientX -
      rect.left -
      rect.width / 2;

    const y =
      event.clientY -
      rect.top -
      rect.height / 2;


    // Keep movement subtle.
    mouseX.set(x * 0.08);
    mouseY.set(y * 0.05);
  }


  function resetPointer() {

    mouseX.set(0);
    mouseY.set(0);

  }


  // =========================================
  // RENDER
  // =========================================

  return (

    <motion.div
      className={
        active
          ? "ink-line-wrapper ink-line-active"
          : "ink-line-wrapper"
      }

      onPointerMove={
        handlePointerMove
      }

      onPointerLeave={
        resetPointer
      }

      animate={{
        opacity: active
          ? [0.55, 0.85, 0.55]
          : [0.5, 0.75, 0.5],

        scaleY: [
          1,
          1.025,
          1
        ]
      }}

      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >

      <svg
        viewBox="0 0 900 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >

        {/* =================================
            MAIN INK LINE
        ================================= */}

        <motion.path

          d="
            M 50 50

            C 150 25,
              220 75,
              320 50

            C 420 25,
              480 75,
              580 50

            C 680 25,
              750 75,
              850 50
          "

          fill="none"

          stroke="currentColor"

          strokeWidth="1"

          strokeLinecap="round"

          style={{
            x: springX,
            y: springY
          }}

          initial={{
            pathLength: 0,
            opacity: 0
          }}

          animate={{
            pathLength: 1,
            opacity: 1
          }}

          transition={{
            pathLength: {
              duration: 2.8,
              ease: [
                0.6,
                0.05,
                -0.01,
                0.9
              ]
            },

            opacity: {
              duration: 1.4,
              ease: [
                0.6,
                0.05,
                -0.01,
                0.9
              ]
            }
          }}

        />

      </svg>

    </motion.div>

  );
}

export default InkLine;