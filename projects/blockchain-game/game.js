(() => {
  const elements = {
    form: document.querySelector("[data-guess-form]"),
    input: document.querySelector("[data-guess-input]"),
    range: document.querySelector("[data-guess-range]"),
    launch: document.querySelector("[data-launch]"),
    picks: [...document.querySelectorAll("[data-pick]")],
    odds: document.querySelector("[data-odds]"),
    highScore: document.querySelector("[data-high-score]"),
    boardGuess: document.querySelector("[data-board-guess]"),
    clock: document.querySelector("[data-clock]"),
    roundState: document.querySelector("[data-round-state]"),
    progress: document.querySelector("[data-progress]"),
    blockNode: document.querySelector("[data-block-node]"),
    roundCount: document.querySelector("[data-round-count]"),
    streak: document.querySelector("[data-streak]"),
    chart: document.querySelector("[data-chart]"),
    result: document.querySelector("[data-result]"),
    resultKicker: document.querySelector("[data-result-kicker]"),
    score: document.querySelector("[data-score]"),
    resultCopy: document.querySelector("[data-result-copy]"),
    resultGuess: document.querySelector("[data-result-guess]"),
    resultActual: document.querySelector("[data-result-actual]"),
    resultDifference: document.querySelector("[data-result-difference]"),
    again: document.querySelector("[data-again]"),
    liveStatus: document.querySelector("[data-live-status]"),
    network: document.querySelector("[data-network]"),
    networkLabel: document.querySelector("[data-network-label]"),
  };

  if (!elements.form || !(elements.chart instanceof HTMLCanvasElement)) return;

  const STORAGE_KEY = "nf-block-time-stats-v1";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const context = elements.chart.getContext("2d");
  const state = {
    phase: "ready",
    guess: 10,
    actual: null,
    elapsed: 0,
    animationFrame: null,
    startedAt: 0,
    roundDuration: reducedMotion ? 1200 : 6800,
    stats: loadStats(),
  };

  function loadStats() {
    const fallback = { rounds: 0, highScore: 0, streak: 0, bestStreak: 0 };
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (!stored || typeof stored !== "object") return fallback;
      return {
        rounds: Math.max(0, Number(stored.rounds) || 0),
        highScore: Math.max(0, Number(stored.highScore) || 0),
        streak: Math.max(0, Number(stored.streak) || 0),
        bestStreak: Math.max(0, Number(stored.bestStreak) || 0),
      };
    } catch {
      return fallback;
    }
  }

  function saveStats() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.stats));
    } catch {
      // The game still works when storage is unavailable.
    }
  }

  function clampGuess(value) {
    return Math.min(30, Math.max(1, Math.round(Number(value) || 10)));
  }

  function randomUnit() {
    if (window.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return (values[0] + 1) / 4294967297;
    }
    return Math.max(Number.EPSILON, Math.random());
  }

  function sampleBlockTime() {
    return Math.min(59.9, Math.max(0.2, -Math.log(randomUnit()) * 10));
  }

  function formatClock(minutes) {
    const totalSeconds = Math.max(0, minutes * 60);
    const wholeMinutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(wholeMinutes).padStart(2, "0")}:${seconds.toFixed(1).padStart(4, "0")}`;
  }

  function formatScore(score) {
    return String(score).padStart(4, "0");
  }

  function setGuess(value) {
    state.guess = clampGuess(value);
    elements.input.value = String(state.guess);
    elements.range.value = String(state.guess);
    elements.range.style.setProperty("--range-fill", `${((state.guess - 1) / 29) * 100}%`);
    elements.boardGuess.textContent = String(state.guess);
    elements.odds.textContent = `${((1 - Math.exp(-state.guess / 10)) * 100).toFixed(1)}%`;
    elements.picks.forEach((button) => {
      button.setAttribute("aria-pressed", String(Number(button.dataset.pick) === state.guess));
    });
    drawChart();
  }

  function setControlsDisabled(disabled) {
    elements.input.disabled = disabled;
    elements.range.disabled = disabled;
    elements.picks.forEach((button) => {
      button.disabled = disabled;
    });
    elements.launch.disabled = disabled;
  }

  function setRoundState(label, running = false) {
    elements.roundState.lastChild.textContent = label;
    elements.roundState.classList.toggle("is-running", running);
  }

  function drawChart() {
    const bounds = elements.chart.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(280, bounds.width);
    const height = Math.max(180, bounds.height);
    elements.chart.width = Math.round(width * ratio);
    elements.chart.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const padding = { top: 26, right: 12, bottom: 31, left: 12 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const maxMinutes = state.phase === "result" ? Math.max(30, Math.ceil((state.actual || 0) / 10) * 10) : 30;
    const density = (minutes) => 0.1 * Math.exp(-minutes / 10);
    const xFor = (minutes) => padding.left + (minutes / maxMinutes) * plotWidth;
    const yFor = (minutes) => padding.top + plotHeight - (density(minutes) / 0.1) * plotHeight;

    context.strokeStyle = "rgba(224,245,233,0.07)";
    context.lineWidth = 1;
    for (let step = 0; step <= 3; step += 1) {
      const y = padding.top + (plotHeight / 3) * step;
      context.beginPath();
      context.moveTo(padding.left, y);
      context.lineTo(width - padding.right, y);
      context.stroke();
    }

    context.beginPath();
    context.moveTo(xFor(0), padding.top + plotHeight);
    for (let minute = 0; minute <= maxMinutes; minute += maxMinutes / 120) {
      context.lineTo(xFor(minute), yFor(minute));
    }
    context.lineTo(xFor(maxMinutes), padding.top + plotHeight);
    context.closePath();
    const fill = context.createLinearGradient(0, padding.top, 0, padding.top + plotHeight);
    fill.addColorStop(0, "rgba(57,255,157,0.17)");
    fill.addColorStop(1, "rgba(57,255,157,0.005)");
    context.fillStyle = fill;
    context.fill();

    context.beginPath();
    for (let minute = 0; minute <= maxMinutes; minute += maxMinutes / 120) {
      const x = xFor(minute);
      const y = yFor(minute);
      if (minute === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.strokeStyle = "#39ff9d";
    context.lineWidth = 1.5;
    context.shadowColor = "rgba(57,255,157,0.5)";
    context.shadowBlur = 10;
    context.stroke();
    context.shadowBlur = 0;

    const drawMarker = (minutes, color, label, dash = []) => {
      const x = xFor(Math.min(minutes, maxMinutes));
      context.save();
      context.setLineDash(dash);
      context.strokeStyle = color;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(x, padding.top);
      context.lineTo(x, padding.top + plotHeight);
      context.stroke();
      context.fillStyle = color;
      context.font = '8px "DM Mono", monospace';
      context.textAlign = x > width - 62 ? "right" : "left";
      context.fillText(label, x + (x > width - 62 ? -5 : 5), padding.top + 10);
      context.restore();
    };

    drawMarker(state.guess, "rgba(87,213,255,0.82)", `GUESS ${state.guess}M`, [4, 4]);
    if (state.phase === "running") {
      drawMarker(state.elapsed, "rgba(244,255,249,0.46)", "NOW");
    } else if (state.phase === "result" && state.actual !== null) {
      drawMarker(state.actual, "rgba(255,255,255,0.88)", `BLOCK ${state.actual.toFixed(1)}M`);
    }

    context.fillStyle = "rgba(222,245,233,0.32)";
    context.font = '8px "DM Mono", monospace';
    context.textAlign = "center";
    for (let step = 0; step <= 3; step += 1) {
      const minute = (maxMinutes / 3) * step;
      context.fillText(String(Math.round(minute)), xFor(minute), height - 14);
    }
  }

  function finishRound() {
    state.phase = "result";
    state.elapsed = state.actual;
    window.cancelAnimationFrame(state.animationFrame);
    elements.clock.textContent = formatClock(state.actual);
    elements.progress.style.width = "100%";
    elements.blockNode.style.left = "100%";
    elements.blockNode.classList.remove("is-mining");
    setRoundState("Block confirmed");
    drawChart();

    const difference = Math.abs(state.actual - state.guess);
    const score = Math.max(0, Math.round(1000 * Math.exp(-difference / 7)));
    const close = difference <= 3;
    state.stats.rounds += 1;
    state.stats.streak = close ? state.stats.streak + 1 : 0;
    state.stats.bestStreak = Math.max(state.stats.bestStreak, state.stats.streak);
    state.stats.highScore = Math.max(state.stats.highScore, score);
    saveStats();

    let kicker = "Block found";
    let copy = "The network kept you guessing. Another round gives you a fresh, independent wait.";
    if (difference <= 0.5) {
      kicker = "Mining oracle";
      copy = "An exceptional call. You landed within thirty seconds of the simulated block.";
    } else if (difference <= 1.5) {
      kicker = "Near perfect";
      copy = "You read the probability curve beautifully. That prediction was extremely close.";
    } else if (difference <= 3) {
      kicker = "Strong signal";
      copy = "Inside three minutes. Your streak is alive—can you repeat it on an independent round?";
    } else if (state.actual < 3) {
      copy = "A fast block beat the average. Memorylessness means the network can surprise you immediately.";
    } else if (state.actual > 20) {
      copy = "A long tail round. Ten minutes is an average, not a deadline.";
    }

    elements.resultKicker.textContent = kicker;
    elements.score.textContent = formatScore(score);
    elements.resultCopy.textContent = copy;
    elements.resultGuess.textContent = `${state.guess.toFixed(1)} min`;
    elements.resultActual.textContent = `${state.actual.toFixed(1)} min`;
    elements.resultDifference.textContent = `${difference.toFixed(1)} min`;
    elements.highScore.textContent = formatScore(state.stats.highScore);
    elements.streak.textContent = String(state.stats.streak);
    elements.result.hidden = false;
    elements.liveStatus.textContent = `Block found after ${state.actual.toFixed(1)} simulated minutes. You scored ${score} points.`;
    window.setTimeout(() => elements.again.focus(), reducedMotion ? 0 : 430);
  }

  function animateRound(timestamp) {
    const progress = Math.min(1, (timestamp - state.startedAt) / state.roundDuration);
    state.elapsed = state.actual * progress;
    elements.clock.textContent = formatClock(state.elapsed);
    elements.progress.style.width = `${progress * 100}%`;
    elements.blockNode.style.left = `${progress * 100}%`;
    drawChart();

    if (progress >= 1) {
      finishRound();
      return;
    }
    state.animationFrame = window.requestAnimationFrame(animateRound);
  }

  function startRound(event) {
    event.preventDefault();
    if (state.phase === "running") return;
    setGuess(elements.input.value);
    state.actual = sampleBlockTime();
    state.elapsed = 0;
    state.phase = "running";
    state.startedAt = performance.now();
    elements.result.hidden = true;
    elements.clock.textContent = "00:00.0";
    elements.progress.style.width = "0%";
    elements.blockNode.style.left = "0%";
    elements.blockNode.classList.add("is-mining");
    elements.launch.querySelector("span").textContent = "Mining in progress";
    setRoundState("Searching for nonce", true);
    setControlsDisabled(true);
    elements.liveStatus.textContent = `Prediction locked at ${state.guess} minutes. Mining simulation started.`;
    state.animationFrame = window.requestAnimationFrame(animateRound);
  }

  function resetRound() {
    state.phase = "ready";
    state.actual = null;
    state.elapsed = 0;
    elements.result.hidden = true;
    elements.clock.textContent = "00:00.0";
    elements.progress.style.width = "0%";
    elements.blockNode.style.left = "0%";
    elements.launch.querySelector("span").textContent = "Lock prediction";
    setRoundState("Ready for prediction");
    setControlsDisabled(false);
    elements.roundCount.textContent = String(state.stats.rounds + 1).padStart(2, "0");
    drawChart();
    elements.input.focus();
  }

  async function fetchBlockHeight() {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4500);
    try {
      const response = await fetch("https://mempool.space/api/blocks/tip/height", {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Network unavailable");
      const height = Number(await response.text());
      if (!Number.isInteger(height) || height < 1) throw new Error("Invalid height");
      elements.network.classList.add("is-live");
      elements.networkLabel.textContent = `Live block height #${height.toLocaleString("en-US")}`;
    } catch {
      elements.network.classList.add("is-offline");
      elements.networkLabel.textContent = "Simulation mode ready";
    } finally {
      window.clearTimeout(timeout);
    }
  }

  elements.range.addEventListener("input", () => setGuess(elements.range.value));
  elements.input.addEventListener("input", () => {
    if (elements.input.value !== "") setGuess(elements.input.value);
  });
  elements.input.addEventListener("blur", () => setGuess(elements.input.value));
  elements.picks.forEach((button) => {
    button.addEventListener("click", () => setGuess(button.dataset.pick));
  });
  elements.form.addEventListener("submit", startRound);
  elements.again.addEventListener("click", resetRound);
  window.addEventListener("resize", drawChart);

  elements.highScore.textContent = formatScore(state.stats.highScore);
  elements.roundCount.textContent = String(state.stats.rounds + 1).padStart(2, "0");
  elements.streak.textContent = String(state.stats.streak);
  setGuess(10);
  fetchBlockHeight();
})();
