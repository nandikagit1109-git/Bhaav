import { motion } from "framer-motion";
import InkCloud from "./InkCloud";

function EntryExperience({ onBegin }) {
  return (
    <motion.main
      className="anti-web-entry"

      initial={{
        opacity: 0
      }}

      animate={{
        opacity: 1
      }}

      transition={{
        duration: 1.4,
        ease: [0.6, 0.05, -0.01, 0.9]
      }}
    >

      {/* =====================================
          TITLE
      ===================================== */}

      <motion.h1
        className="anti-web-title"

        layoutId="bhaav-title"

        initial={{
          opacity: 0,
          filter: "blur(10px)"
        }}

        animate={{
          opacity: 1,
          filter: "blur(0px)"
        }}

        transition={{
          opacity: {
            duration: 2,
            ease: [0.6, 0.05, -0.01, 0.9]
          },

          filter: {
            duration: 2,
            ease: [0.6, 0.05, -0.01, 0.9]
          },

          layout: {
            duration: 1.4,
            ease: [0.6, 0.05, -0.01, 0.9]
          }
        }}
      >
        Bhaav
      </motion.h1>


      {/* =====================================
          INK CLOUD
      ===================================== */}

      <motion.div
        className="anti-web-ink"

        initial={{
          opacity: 0
        }}

        animate={{
          opacity: 1
        }}

        transition={{
          duration: 2.5,
          delay: 0.5,
          ease: [0.6, 0.05, -0.01, 0.9]
        }}
      >
        <InkCloud
          typingSpeed={0.5}
          backspaceRate={0.1}
          pauseFrequency={0.3}
          active={false}
        />
      </motion.div>


      {/* =====================================
          BEGIN
      ===================================== */}

      <motion.button
        className="anti-web-begin"

        type="button"

        onClick={onBegin}

        initial={{
          opacity: 0,
          filter: "blur(8px)"
        }}

        animate={{
          opacity: 1,
          filter: "blur(0px)"
        }}

        whileHover={{
          scale: 1.02,
          letterSpacing: "0.28em",
          opacity: 0.55
        }}

        whileTap={{
          scale: 0.98
        }}

        transition={{
          opacity: {
            duration: 2,
            delay: 1.5,
            ease: [0.6, 0.05, -0.01, 0.9]
          },

          filter: {
            duration: 2,
            delay: 1.5,
            ease: [0.6, 0.05, -0.01, 0.9]
          },

          scale: {
            duration: 1.2,
            ease: [0.6, 0.05, -0.01, 0.9]
          },

          letterSpacing: {
            duration: 1.2,
            ease: [0.6, 0.05, -0.01, 0.9]
          }
        }}
      >
        [ Begin ]
      </motion.button>


      {/* =====================================
          SUBTITLE
      ===================================== */}

      <motion.p
        className="anti-web-subtitle"

        initial={{
          opacity: 0,
          filter: "blur(8px)"
        }}

        animate={{
          opacity: 1,
          filter: "blur(0px)"
        }}

        transition={{
          duration: 3,
          delay: 0.8,
          ease: [0.6, 0.05, -0.01, 0.9]
        }}
      >
        A quiet space to notice
      </motion.p>

    </motion.main>
  );
}

export default EntryExperience;