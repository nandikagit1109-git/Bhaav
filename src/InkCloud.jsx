import {
  motion,
  useMotionValue,
  useSpring,
  useTransform
} from "framer-motion";

function InkCloud({ active = false }) {

  // =========================================
  // MOUSE
  // =========================================

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

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
  // SMALL MOUSE REACTION
  // =========================================

  const moveX = useTransform(
    springX,
    [-500, 500],
    [-15, 15]
  );

  const moveY = useTransform(
    springY,
    [-500, 500],
    [-8, 8]
  );


  // =========================================
  // POINTER
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

    mouseX.set(x);
    mouseY.set(y);
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
      className="ink-cloud"

      onPointerMove={
        handlePointerMove
      }

      onPointerLeave={
        resetPointer
      }

      animate={{
        opacity: active
          ? [0.55, 0.85, 0.55]
          : [0.4, 0.65, 0.4],

        scaleY: [
          1,
          1.02,
          1
        ]
      }}

      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >

      <svg
        viewBox="0 0 1000 300"
        preserveAspectRatio="none"
        aria-hidden="true"
      >

        <motion.path
          d="M 0 150 C 120 110 180 190 300 150 C 420 110 480 190 600 150 C 720 110 820 190 1000 150"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"

          style={{
            x: moveX,
            y: moveY
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
                0.01,
                0.9
              ]
            },

            opacity: {
              duration: 1.5,
              ease: [
                0.6,
                0.05,
                0.01,
                0.9
              ]
            }
          }}
        />

      </svg>

    </motion.div>

  );
}

export default InkCloud;
