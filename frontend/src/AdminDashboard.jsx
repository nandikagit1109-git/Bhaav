import { useEffect, useState } from "react";
import { getAdminTrends } from "./api.js";

function AdminDashboard({ onExit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTrends() {
      try {
        const result = await getAdminTrends();
        setData(result);
      } catch (error) {
        console.error(
          "Admin trends error:",
          error
        );

        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadTrends();
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="admin-page">

        <header className="admin-header">

          <div className="logo">
            bhaav
          </div>

          <span className="admin-label">
            COUNSELING CELL
          </span>

        </header>

        <main className="admin-content">

          <p className="admin-loading">
            Gathering campus patterns...
          </p>

        </main>

      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !data) {
    return (
      <div className="admin-page">

        <header className="admin-header">

          <div className="logo">
            bhaav
          </div>

          <div className="admin-header-actions">

            <span className="admin-label">
              COUNSELING CELL
            </span>

            <button
              className="secondary-button"
              onClick={onExit}
            >
              Exit
            </button>

          </div>

        </header>

        <main className="admin-content">

          <p className="eyebrow">
            CAMPUS PULSE
          </p>

          <h1>
            Campus data is unavailable right now.
          </h1>

          <p className="admin-description">
            {error ||
              "Please check that the Bhaav backend is running."}
          </p>

          <button
            className="secondary-button"
            onClick={onExit}
          >
            Back
          </button>

        </main>

      </div>
    );
  }

  // =========================
  // PRIVACY FLOOR
  // =========================

  if (data.privacy_limited) {
    return (
      <div className="admin-page">

        <header className="admin-header">

          <div className="logo">
            bhaav
          </div>

          <div className="admin-header-actions">

            <span className="admin-label">
              COUNSELING CELL
            </span>

            <button
              className="secondary-button"
              onClick={onExit}
            >
              Exit
            </button>

          </div>

        </header>

        <main className="admin-content">

          <p className="eyebrow">
            CAMPUS PULSE
          </p>

          <h1>
            A quieter view of
            student wellbeing.
          </h1>

          <div className="privacy-card">

            <div className="privacy-icon">
              🔒
            </div>

            <div>

              <h2>
                Campus trends are currently private.
              </h2>

              <p>
                Bhaav only displays aggregated
                patterns when there are enough
                participants to protect individual
                privacy.
              </p>

              <span>
                {data.participant_count} participant
                {data.participant_count === 1
                  ? ""
                  : "s"} currently represented.
              </span>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // =========================
  // CAMPUS DATA
  // =========================

  const last7Days = data.last_7_days || {};

  const averageDeviation = Number(
    last7Days.average_combined_z ?? 0
  );

  const trendWidth = Math.min(
    Math.max(averageDeviation * 25, 0),
    100
  );

  // =========================
  // CAMPUS DASHBOARD
  // =========================

  return (
    <div className="admin-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="admin-header">

        <div className="logo">
          bhaav
        </div>

        <div className="admin-header-actions">

          <span className="admin-label">
            COUNSELING CELL
          </span>

          <button
            className="secondary-button"
            onClick={onExit}
          >
            Exit
          </button>

        </div>

      </header>


      <main className="admin-content">

        {/* =========================
            INTRO
        ========================= */}

        <p className="eyebrow">
          CAMPUS PULSE
        </p>

        <h1>
          A quieter view of
          student wellbeing.
        </h1>

        <p className="admin-description">
          Aggregated behavioral patterns from
          the campus population. Individual
          students remain anonymous.
        </p>


        {/* =========================
            STATUS
        ========================= */}

        <div className="admin-status">

          <span className="status-dot"></span>

          <span>
            CAMPUS SIGNALS ACTIVE
          </span>

          <span className="status-date">
            LAST 7 DAYS
          </span>

        </div>


        {/* =========================
            TOP STATISTICS
        ========================= */}

        <section className="admin-stats">

          <div className="admin-stat">

            <span>
              PARTICIPANTS
            </span>

            <strong>
              {data.participant_count}
            </strong>

          </div>


          <div className="admin-stat">

            <span>
              WRITING SESSIONS
            </span>

            <strong>
              {data.total_sessions}
            </strong>

          </div>


          <div className="admin-stat">

            <span>
              HIGH-DEVIATION SESSIONS
            </span>

            <strong>
              {data.high_deviation_sessions}
            </strong>

          </div>

        </section>


        {/* =========================
            LAST 7 DAYS
        ========================= */}

        <section className="campus-card">

          <div className="card-label">
            LAST 7 DAYS
          </div>

          <div className="campus-grid">

            <div>

              <span>
                SESSIONS
              </span>

              <strong>
                {last7Days.session_count ?? 0}
              </strong>

            </div>


            <div>

              <span>
                AVG. TYPING SPEED
              </span>

              <strong>
                {Number(
                  last7Days.average_wpm ?? 0
                ).toFixed(1)}
              </strong>

            </div>


            <div>

              <span>
                AVG. DEVIATION
              </span>

              <strong>
                {averageDeviation.toFixed(2)}
              </strong>

            </div>

          </div>

        </section>


        {/* =========================
            CAMPUS RHYTHM
        ========================= */}

        <section className="trend-card">

          <div className="card-label">
            CAMPUS RHYTHM
          </div>


          <div className="trend-header">

            <div>

              <h2>
                A snapshot of collective patterns.
              </h2>

              <p>
                These signals describe the campus
                as a whole, not individual students.
              </p>

            </div>


            <div className="trend-value">
              {averageDeviation.toFixed(2)}
            </div>

          </div>


          <div className="trend-bar">

            <div
              className="trend-fill"
              style={{
                width: `${trendWidth}%`
              }}
            />

          </div>


          <div className="trend-scale">

            <span>
              LOWER DEVIATION
            </span>

            <span>
              HIGHER DEVIATION
            </span>

          </div>

        </section>


        {/* =========================
            PRIVACY
        ========================= */}

        <div className="admin-privacy-footer">

          <span>
            🔒
          </span>

          <p>
            No journal content, names, user IDs,
            or individual behavioral profiles are
            shown in this view.
          </p>

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;