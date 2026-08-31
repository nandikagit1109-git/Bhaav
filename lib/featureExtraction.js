const PAUSE_THRESHOLD_MS =
  Number(process.env.PAUSE_THRESHOLD_MS) || 2000;

function mean(numbers) {
  if (!numbers.length) return 0;

  return (
    numbers.reduce(
      (sum, value) => sum + value,
      0
    ) / numbers.length
  );
}

function variance(numbers) {
  if (!numbers.length) return 0;

  const avg = mean(numbers);

  return mean(
    numbers.map(
      (value) =>
        Math.pow(value - avg, 2)
    )
  );
}

function median(numbers) {
  if (!numbers.length) return 0;

  const sorted = [...numbers].sort(
    (a, b) => a - b
  );

  const middle =
    Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (
      (sorted[middle - 1] +
        sorted[middle]) /
      2
    );
  }

  return sorted[middle];
}

function extractFeatures(
  events,
  startTs,
  endTs
) {
  // =========================================
  // EMPTY SESSION
  // =========================================

  if (
    !Array.isArray(events) ||
    events.length === 0
  ) {
    return {
      avg_inter_keystroke_interval: 0,
      median_inter_keystroke_interval: 0,

      pause_frequency: 0,
      pause_count: 0,
      average_pause_duration: 0,
      longest_pause: 0,

      backspace_rate: 0,
      backspace_count: 0,

      wpm: 0,
      typing_speed_variance: 0,

      total_keystrokes: 0,
      session_duration: Math.max(
        0,
        endTs - startTs
      ),

      active_typing_duration: 0
    };
  }

  // =========================================
  // SORT EVENTS
  // =========================================

  const sortedEvents =
    [...events].sort(
      (a, b) =>
        a.timestamp_ms -
        b.timestamp_ms
    );

  // =========================================
  // SESSION DURATION
  // =========================================

  const durationMs =
    Math.max(
      0,
      endTs - startTs
    );

  const durationMinutes =
    durationMs / 60000;

  // =========================================
  // TOTAL KEYSTROKES
  // =========================================

  const totalKeystrokes =
    sortedEvents.length;

  // =========================================
  // INTER-KEYSTROKE INTERVALS
  // =========================================

  const intervals = [];

  for (
    let i = 1;
    i < sortedEvents.length;
    i++
  ) {
    const gap =
      sortedEvents[i].timestamp_ms -
      sortedEvents[i - 1].timestamp_ms;

    if (gap >= 0) {
      intervals.push(gap);
    }
  }

  // =========================================
  // INTER-KEYSTROKE STATISTICS
  // =========================================

  const avgInterKeystrokeInterval =
    mean(intervals);

  const medianInterKeystrokeInterval =
    median(intervals);

  // =========================================
  // PAUSES
  // =========================================

  const pauseIntervals =
    intervals.filter(
      (gap) =>
        gap >= PAUSE_THRESHOLD_MS
    );

  const pauseCount =
    pauseIntervals.length;

  const pauseFrequency =
    durationMinutes > 0
      ? pauseCount /
        durationMinutes
      : 0;

  const averagePauseDuration =
    mean(pauseIntervals);

  const longestPause =
    pauseIntervals.length > 0
      ? Math.max(
          ...pauseIntervals
        )
      : 0;

  // =========================================
  // ACTIVE TYPING TIME
  // =========================================

  const activeIntervals =
    intervals.filter(
      (gap) =>
        gap <
        PAUSE_THRESHOLD_MS
    );

  const activeTypingDuration =
    activeIntervals.reduce(
      (sum, gap) =>
        sum + gap,
      0
    );

  // =========================================
  // BACKSPACES
  // =========================================

  const backspaceCount =
    sortedEvents.filter(
      (event) =>
        event.key_type ===
        "backspace"
    ).length;

  const backspaceRate =
    totalKeystrokes > 0
      ? backspaceCount /
        totalKeystrokes
      : 0;

  // =========================================
  // CHARACTER / WORD ESTIMATION
  // =========================================

  const characterCount =
    sortedEvents.filter(
      (event) =>
        event.key_type === "char" ||
        event.key_type === "space"
    ).length;

  const estimatedWords =
    characterCount / 5;

  // =========================================
  // WPM
  // =========================================

  const wpm =
    durationMinutes > 0
      ? estimatedWords /
        durationMinutes
      : 0;

  // =========================================
  // TYPING SPEED VARIANCE
  // =========================================

  const typingSpeedVariance =
    variance(intervals);

  // =========================================
  // TIME OF DAY
  // =========================================

  const firstEventTime =
    sortedEvents[0]?.timestamp_ms ||
    startTs;

  const eventDate =
    new Date(firstEventTime);

  const hour =
    eventDate.getHours();

  let timeOfDay = "night";

  if (
    hour >= 5 &&
    hour < 12
  ) {
    timeOfDay = "morning";
  } else if (
    hour >= 12 &&
    hour < 17
  ) {
    timeOfDay = "afternoon";
  } else if (
    hour >= 17 &&
    hour < 22
  ) {
    timeOfDay = "evening";
  }

  // =========================================
  // FINAL FEATURE SET
  // =========================================

  return {
    // Rhythm
    avg_inter_keystroke_interval:
      avgInterKeystrokeInterval,

    median_inter_keystroke_interval:
      medianInterKeystrokeInterval,

    typing_speed_variance:
      typingSpeedVariance,

    // Pauses
    pause_frequency:
      pauseFrequency,

    pause_count:
      pauseCount,

    average_pause_duration:
      averagePauseDuration,

    longest_pause:
      longestPause,

    // Editing
    backspace_rate:
      backspaceRate,

    backspace_count:
      backspaceCount,

    // Speed
    wpm,

    // Session
    total_keystrokes:
      totalKeystrokes,

    session_duration:
      durationMs,

    active_typing_duration:
      activeTypingDuration,

    // Context
    time_of_day:
      timeOfDay
  };
}

module.exports = {
  extractFeatures
};