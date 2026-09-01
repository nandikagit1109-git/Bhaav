import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAnalysis, submitFeedback } from "./api.js";

const EASE = [0.6, 0.05, -0.01, 0.9];

function formatDuration(seconds = 0) {
  const total = Math.max(0, Math.round(seconds));

  const minutes = Math.floor(total / 60);
  const secs = total % 60;

  if (minutes === 0) {
    return `${secs}s`;
  }

  return `${minutes}m ${secs}s`;
}

function formatNumber(value, digits = 1) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toFixed(digits);
}

function changeDirection(current, baseline) {
  const c = Number(current || 0);
  const b = Number(baseline || 0);

  if (!b) {
    return {
      arrow: "—",
      label: "learning"
    };
  }

  const difference = c - b;

  if (Math.abs(difference) < 0.01) {
    return {
      arrow: "→",
      label: "similar"
    };
  }

  if (difference > 0) {
    return {
      arrow: "↑",
      label: "higher"
    };
  }

  return {
    arrow: "↓",
    label: "lower"
  };
}

function Dashboard({
  onWrite,
  onAdmin,
  intervention,
  onBackToRoom
}) {

  const [analysis, setAnalysis] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [supportVisible, setSupportVisible] =
    useState(Boolean(intervention));

  const [breathing, setBreathing] =
    useState(false);

  const [feedbackSent, setFeedbackSent] =
    useState(false);

  const [showAdvice, setShowAdvice] =
    useState(false);

  const [adviceText, setAdviceText] =
    useState("");

  const userId =
    localStorage.getItem(
      "bhaav_user_id"
    );


  // =========================================
  // LOAD FULL ANALYSIS
  // =========================================

  useEffect(() => {

    async function loadAnalysis() {

      if (!userId) {
        setError(
          "No Bhaav user found."
        );

        setLoading(false);

        return;
      }

      try {
        const data = await getAnalysis(userId);
        console.log("Bhaav full analysis:", data);
        setAnalysis(data);
      } catch (error) {

        console.error(
          "Analysis error:",
          error
        );

        setError(
          error.message
        );

      } finally {

        setLoading(false);

      }

    }


    loadAnalysis();

  }, [userId]);


  // =========================================
  // FEEDBACK
  // =========================================

  async function sendFeedback(feedback) {

    if (
      !analysis?.latest_session
    ) {
      return;
    }

    /*
      We keep feedback optional here.

      Your existing insight endpoint remains
      responsible for generated reflections.
    */

    try {
      await submitFeedback(userId, null, feedback);
      setFeedbackSent(true);
    } catch (error) {

      console.error(
        "Feedback error:",
        error
      );

    }

  }


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <motion.main
        className="dashboard cinematic-dashboard"

        initial={{
          opacity: 0
        }}

        animate={{
          opacity: 1
        }}

        transition={{
          duration: 1.4,
          ease: EASE
        }}
      >

        <div className="dashboard-header">

          <div className="logo">
            bhaav
          </div>

        </div>


        <div className="dashboard-loading">

          <p className="eyebrow">
            YOUR WEEK
          </p>

          <h1>
            Gathering your rhythm.
          </h1>

        </div>

      </motion.main>

    );

  }


  // =========================================
  // ERROR
  // =========================================

  if (error || !analysis) {

    return (

      <main className="dashboard cinematic-dashboard">

        <header className="dashboard-header">

          <div className="logo">
            bhaav
          </div>

          <div className="dashboard-actions">

            <button
              className="secondary-button"
              onClick={onWrite}
            >
              Write
            </button>

            <button
              className="secondary-button"
              onClick={onAdmin}
            >
              Counseling Cell
            </button>

          </div>

        </header>


        <section className="dashboard-empty">

          <p className="eyebrow">
            YOUR WEEK
          </p>

          <h1>
            Your rhythm is still arriving.
          </h1>

          <p>
            {error ||
              "Write a little more and Bhaav will begin learning your pattern."}
          </p>

          <button
            className="write-button"
            onClick={onWrite}
          >
            Write in your journal →
          </button>

        </section>

      </main>

    );

  }


  // =========================================
  // DATA
  // =========================================

  const latest =
    analysis.latest_session;

  const baseline =
    analysis.baseline;

  const comparison =
    analysis.comparison;

  const sessions =
    analysis.sessions || [];

  const trend =
    analysis.trend || {};


  const wpm =
    Number(latest?.wpm || 0);

  const pauseFrequency =
    Number(
      latest?.pause_frequency || 0
    );

  const backspaceRate =
    Number(
      latest?.backspace_rate || 0
    );

  const deviation =
    Number(
      latest?.combined_z || 0
    );


  const duration =
    latest
      ? (
          Number(latest.end_ts) -
          Number(latest.start_ts)
        ) / 1000
      : 0;


  const averagePause =
    latest
      ? Number(
          latest.avg_inter_keystroke_interval ||
          0
        ) / 1000
      : 0;


  const wpmChange =
    changeDirection(
      wpm,
      baseline?.wpm_mean
    );


  const pauseChange =
    changeDirection(
      pauseFrequency,
      baseline?.pause_frequency_mean
    );


  const revisionChange =
    changeDirection(
      backspaceRate,
      baseline?.backspace_rate_mean
    );


  // =========================================
  // RENDER
  // =========================================

  return (

    <motion.main
      className="dashboard cinematic-dashboard"

      initial={{
        opacity: 0
      }}

      animate={{
        opacity: 1
      }}

      transition={{
        duration: 1.4,
        ease: EASE
      }}
    >

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="dashboard-header">

        <motion.div
          className="logo"
          layoutId="bhaav-title"

          transition={{
            duration: 1.4,
            ease: EASE
          }}
        >
          bhaav
        </motion.div>


        <div className="dashboard-actions">

          <motion.button
            className="secondary-button"
            onClick={onWrite}

            whileHover={{
              scale: 1.02,
              letterSpacing: "0.08em"
            }}

            transition={{
              duration: 1.2,
              ease: EASE
            }}
          >
            Write
          </motion.button>


          <motion.button
            className="secondary-button"
            onClick={onAdmin}

            whileHover={{
              scale: 1.02,
              letterSpacing: "0.08em"
            }}

            transition={{
              duration: 1.2,
              ease: EASE
            }}
          >
            Counseling Cell
          </motion.button>

          {onBackToRoom && (
            <motion.button
              className="secondary-button"
              onClick={onBackToRoom}
              whileHover={{
                scale: 1.02,
                letterSpacing: "0.08em"
              }}
              transition={{
                duration: 1.2,
                ease: EASE
              }}
            >
              Room
            </motion.button>
          )}

        </div>

      </header>


      {/* =====================================
          INTRO
      ===================================== */}

      <section className="welcome">

        <p className="eyebrow">
          YOUR WEEK
        </p>


        <motion.h1

          initial={{
            opacity: 0,
            filter: "blur(10px)"
          }}

          animate={{
            opacity: 1,
            filter: "blur(0px)"
          }}

          transition={{
            duration: 2,
            ease: EASE
          }}

        >
          A little space to notice yourself.
        </motion.h1>


        <p>
          Bhaav looks at changes in your
          writing rhythm over time—not what
          you write.
        </p>

      </section>


      {/* =====================================
          YOUR RHYTHM
      ===================================== */}

      <section className="analysis-section">

        <div className="card-label">
          YOUR RHYTHM
        </div>


        <div className="rhythm-grid">

          <div className="rhythm-stat">

            <span>
              TYPING SPEED
            </span>

            <strong>
              {formatNumber(wpm, 1)}
              <small> WPM</small>
            </strong>

          </div>


          <div className="rhythm-stat">

            <span>
              AVERAGE PAUSE
            </span>

            <strong>
              {formatNumber(
                averagePause,
                1
              )}
              <small> sec</small>
            </strong>

          </div>


          <div className="rhythm-stat">

            <span>
              PAUSES / MIN
            </span>

            <strong>
              {formatNumber(
                pauseFrequency,
                1
              )}
            </strong>

          </div>


          <div className="rhythm-stat">

            <span>
              REVISING
            </span>

            <strong>
              {formatNumber(
                backspaceRate * 100,
                1
              )}
              <small>%</small>
            </strong>

          </div>


          <div className="rhythm-stat">

            <span>
              SESSION
            </span>

            <strong>
              {formatDuration(
                duration
              )}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================
          YOUR CHANGE
      ===================================== */}

      <section className="analysis-section">

        <div className="card-label">
          YOUR CHANGE
        </div>


        <div className="change-list">

          <div className="change-row">

            <span>
              Typing speed
            </span>

            <strong>
              {wpmChange.arrow}{" "}
              {wpmChange.label}
            </strong>

          </div>


          <div className="change-row">

            <span>
              Pausing
            </span>

            <strong>
              {pauseChange.arrow}{" "}
              {pauseChange.label}
            </strong>

          </div>


          <div className="change-row">

            <span>
              Revising
            </span>

            <strong>
              {revisionChange.arrow}{" "}
              {revisionChange.label}
            </strong>

          </div>


          <div className="change-row">

            <span>
              Overall deviation
            </span>

            <strong>
              {formatNumber(
                deviation,
                2
              )}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================
          SESSION EVOLUTION
      ===================================== */}

      <section className="analysis-section">

        <div className="card-label">
          SESSION EVOLUTION
        </div>


        {sessions.length <= 1 ? (

          <div className="learning-state">

            <h2>
              Bhaav is learning your rhythm.
            </h2>

            <p>
              Your personal comparison becomes
              more meaningful after a few writing
              sessions.
            </p>

            <div className="session-count">
              {sessions.length} / 5 sessions
            </div>

          </div>

        ) : (

          <div className="timeline">

            {sessions
              .slice()
              .reverse()
              .map((session, index) => (

                <motion.div
                  className="timeline-row"
                  key={session.id}

                  initial={{
                    opacity: 0,
                    x: -20
                  }}

                  animate={{
                    opacity: 1,
                    x: 0
                  }}

                  transition={{
                    duration: 1.2,
                    delay: index * 0.08,
                    ease: EASE
                  }}
                >

                  <span>
                    Session {index + 1}
                  </span>

                  <div className="timeline-line">

                    <span
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            4,
                            Number(
                              session.wpm || 0
                            ) * 2
                          )
                        )}%`
                      }}
                    />

                  </div>

                  <strong>
                    {formatNumber(
                      session.wpm,
                      1
                    )} WPM
                  </strong>

                </motion.div>

              ))}

          </div>

        )}

      </section>


      {/* =====================================
          BASELINE
      ===================================== */}

      <section className="analysis-section">

        <div className="card-label">
          YOUR BASELINE
        </div>


        {baseline ? (

          <div className="baseline-grid">

            <div>

              <span>
                USUAL TYPING SPEED
              </span>

              <strong>
                {formatNumber(
                  baseline.wpm_mean,
                  1
                )} WPM
              </strong>

            </div>


            <div>

              <span>
                USUAL PAUSE FREQUENCY
              </span>

              <strong>
                {formatNumber(
                  baseline.pause_frequency_mean,
                  1
                )} / min
              </strong>

            </div>


            <div>

              <span>
                USUAL REVISION RATE
              </span>

              <strong>
                {formatNumber(
                  baseline.backspace_rate_mean * 100,
                  1
                )}%
              </strong>

            </div>


            <div>

              <span>
                SESSIONS LEARNED
              </span>

              <strong>
                {baseline.session_count}
              </strong>

            </div>

          </div>

        ) : (

          <div className="learning-state">

            <h2>
              Still getting to know you.
            </h2>

            <p>
              Bhaav needs a few more sessions
              before it can establish your
              personal rhythm.
            </p>

            <div className="session-count">
              {analysis.session_count} / 5 sessions
            </div>

          </div>

        )}

      </section>


      {/* =====================================
          SUPPORT
      ===================================== */}

      {supportVisible && !breathing && (

        <section className="support-card">

          <div className="support-content">

            <p className="support-label">
              A SMALL PAUSE
            </p>

            <h2>
              {intervention?.title ||
                "Your rhythm seems a little different today."}
            </h2>

            <p>
              {intervention?.message ||
                "You don't need to figure anything out right now. A short pause might help."}
            </p>


            <div className="support-actions">

              <button
                className="support-primary"
                onClick={() =>
                  setBreathing(true)
                }
              >
                {intervention?.action ||
                  "Take a breathing pause"}
              </button>


              <button
                className="support-secondary"
                onClick={() =>
                  setSupportVisible(false)
                }
              >
                Maybe later
              </button>

            </div>

          </div>

        </section>

      )}


      {/* =====================================
          BREATHING
      ===================================== */}

      {breathing && (

        <section className="breathing-card">

          <p className="support-label">
            A QUIET MOMENT
          </p>


          <div className="breathing-circle">
            <span>
              pause
            </span>
          </div>


          <h2>
            Take a slow breath.
          </h2>


          <p>
            There's nothing you need to solve
            right now. Just give yourself a moment.
          </p>


          <button
            className="support-primary"

            onClick={() => {

              setBreathing(false);

              setSupportVisible(false);

            }}
          >
            I'm ready
          </button>

        </section>

      )}


      {/* =====================================
          WEEKLY REFLECTION
      ===================================== */}

      {(analysis?.reflection || insight?.reflection) && (
        <section className="analysis-section reflection-section">

          <div className="card-label">
            WEEKLY REFLECTION
          </div>

          <div className="reflection-body">
            <p className="reflection-text">
              {analysis?.reflection || insight?.reflection ||
                "Your writing rhythm has been gentle this week. Take a moment to notice how your fingers move across the keys — there's no rush."}
            </p>
          </div>

        </section>
      )}


      {/* =====================================
          SUGGESTION
      ===================================== */}

      {(analysis?.suggestion || insight?.suggestion) && (
        <section className="analysis-section suggestion-section">

          <div className="card-label">
            A SMALL GENTLE NOTE
          </div>

          <div className="suggestion-body">
            <p className="suggestion-text">
              {analysis?.suggestion || insight?.suggestion ||
                "Try giving yourself a little more room before revising. Let your thoughts flow first, then return to polish."}
            </p>
          </div>

        </section>
      )}


      {/* =====================================
          NEED ADVICE?
      ===================================== */}

      <section className="analysis-section advice-section">

        <div className="card-label">
          SOMETHING ON YOUR MIND?
        </div>

        <div className="advice-body">
          <p className="advice-intro">
            Sometimes it helps to put a question into words.
            Bhaav can offer a gentle reflection based on your
            writing rhythm — not a diagnosis, just an observation.
          </p>

          {!showAdvice ? (
            <button
              className="advice-trigger"
              onClick={() => setShowAdvice(true)}
            >
              ask about something →
            </button>
          ) : (
            <div className="advice-prompt">
              <textarea
                className="advice-input"
                placeholder="what's on your mind?"
                value={adviceText}
                onChange={(e) => setAdviceText(e.target.value)}
                rows={3}
              />
              <div className="advice-actions">
                <button
                  className="support-primary"
                  onClick={() => {
                    /* Placeholder — connects to AI insight */
                    setAdviceText("");
                    setShowAdvice(false);
                  }}
                >
                  reflect
                </button>
                <button
                  className="support-secondary"
                  onClick={() => { setShowAdvice(false); setAdviceText(""); }}
                >
                  not now
                </button>
              </div>
            </div>
          )}
        </div>

      </section>


      {/* =====================================
          PRIVACY
      ===================================== */}

      <section className="privacy-note">

        <span>🔒</span>

        <div>
          <strong>Your words stay yours.</strong>
          <p>Bhaav only observes your typing rhythm — never your content.</p>
        </div>

      </section>


      {/* =====================================
          WRITE
      ===================================== */}

      <motion.button
        className="write-button"

        onClick={onWrite}

        whileHover={{
          scale: 1.02
        }}

        transition={{
          duration: 1.2,
          ease: EASE
        }}
      >
        Write in your journal →
      </motion.button>

      <div style={{ height: '10vh' }} />

    </motion.main>
  );
}

export default Dashboard;