(() => {
  const trainer = document.querySelector("[data-poker-trainer]");
  if (!trainer) return;

  const profiles = {
    tight: {
      note: "Tight opponents enter fewer pots and continue with stronger ranges.",
      equityShift: -2.2,
      foldShift: 8,
    },
    loose: {
      note: "Loose opponents continue wider, increasing your equity but reducing fold equity.",
      equityShift: 2.4,
      foldShift: -9,
    },
    maniac: {
      note: "Maniac opponents apply pressure with wide ranges and rarely surrender to one raise.",
      equityShift: 5.1,
      foldShift: -17,
    },
  };

  const spots = [
    {
      handNumber: "#8",
      stackLine: "Hero(BU)D: 2000 | Villain 1(SB): 1990 | Villain 2(BB): 1980 | Villain 3(UTG): 1940",
      pot: 150,
      board: "--",
      hand: [{ card: "Q♣", suit: "club" }, { card: "J♣", suit: "club" }],
      baseEquity: 15.5,
      tie: 0.8,
      actionCopy: "Action on Hero (BU) · Stack: 2000 · To Call: 60",
      actions: [
        { id: "fold", label: "Fold", detail: "f", quality: "best", vpip: false, pfr: false },
        { id: "call", label: "Call 60", detail: "Odds: 29%", quality: "poor", vpip: true, pfr: false },
        { id: "raise-half", label: "Raise 195", detail: "½ pot · FE 40%", quality: "risky", vpip: true, pfr: true },
        { id: "raise-pot", label: "Raise 310", detail: "pot · FE 60%", quality: "poor", vpip: true, pfr: true },
      ],
      feedback: {
        fold: "Best decision. Against an UTG opening range, Q♣ J♣ has insufficient equity for the 29% price and can be dominated by stronger broadways.",
        call: "Too loose. The suited connectivity is attractive, but 15–21% estimated equity remains below the 29% required by the pot odds.",
        "raise-half": "Creative but high variance. The hand lacks an ace or king blocker, and this bluff performs poorly when a tight UTG range continues.",
        "raise-pot": "Over-aggressive. The larger size risks too much against a range weighted toward strong pairs and premium broadways.",
      },
    },
    {
      handNumber: "#19",
      stackLine: "Hero(BB): 1840 | Villain 1(UTG): 2150 | Villain 2(BU)D: 1760 | Villain 3(SB): 2050",
      pot: 220,
      board: '<b class="club">K♣</b> <b class="heart">7♥</b> <b class="spade">2♠</b>',
      hand: [{ card: "A♠", suit: "spade" }, { card: "K♦", suit: "diamond" }],
      baseEquity: 78.2,
      tie: 1.1,
      actionCopy: "Action on Hero (BB) · Stack: 1,840 · To Call: 110",
      actions: [
        { id: "fold", label: "Fold", detail: "f", quality: "poor", vpip: false, pfr: false },
        { id: "call", label: "Call 110", detail: "Odds: 25%", quality: "best", vpip: true, pfr: false },
        { id: "raise-half", label: "Raise 330", detail: "½ pot · FE 31%", quality: "risky", vpip: true, pfr: true },
        { id: "all-in", label: "All-in 1,840", detail: "FE 71%", quality: "poor", vpip: true, pfr: true },
      ],
      feedback: {
        fold: "Far too tight. Top pair, top kicker has a large equity advantage and only needs 25% to continue.",
        call: "Best decision. Calling keeps weaker kings and bluffs in the range while controlling the pot on a dry board.",
        "raise-half": "Reasonable in some games, but it folds out bluffs and isolates you against stronger continuing hands more often than necessary.",
        "all-in": "Unnecessary overplay. The shove sacrifices value from weaker hands and is mainly called by sets or strong kings.",
      },
    },
    {
      handNumber: "#27",
      stackLine: "Hero(BU)D: 2280 | Villain 1(SB): 1630 | Villain 2(BB): 2070 | Villain 3(UTG): 2020",
      pot: 180,
      board: '<b class="heart">T♥</b> <b class="club">7♣</b> <b class="heart">2♥</b>',
      hand: [{ card: "9♥", suit: "heart" }, { card: "8♥", suit: "heart" }],
      baseEquity: 51.4,
      tie: 0.6,
      actionCopy: "Action on Hero (BU) · Stack: 2,280 · Checked to you",
      actions: [
        { id: "check", label: "Check", detail: "x", quality: "risky", vpip: false, pfr: false },
        { id: "bet-half", label: "Bet 90", detail: "½ pot · FE 29%", quality: "good", vpip: true, pfr: true },
        { id: "bet-three", label: "Bet 135", detail: "¾ pot · FE 43%", quality: "best", vpip: true, pfr: true },
        { id: "bet-pot", label: "Bet 180", detail: "pot · FE 55%", quality: "risky", vpip: true, pfr: true },
      ],
      feedback: {
        check: "Playable, but passive. The open-ended straight flush draw benefits from building the pot and can win immediately through fold equity.",
        "bet-half": "Good decision. The semi-bluff has strong equity when called and can fold out many ace-high and weak-pair combinations.",
        "bet-three": "Best decision. The larger pressure combines substantial draw equity with enough fold equity to make the semi-bluff especially effective.",
        "bet-pot": "Defensible but slightly inefficient. The hand achieves similar strategic goals at three-quarter pot while risking fewer chips.",
      },
    },
  ];

  let profile = "tight";
  let spotIndex = 0;
  let decisions = 0;
  let correct = 0;
  let vpipActions = 0;
  let pfrActions = 0;
  let answered = false;

  const selectors = {
    current: trainer.querySelector("[data-decision-current]"),
    progress: trainer.querySelector("[data-progress-bar]"),
    decisions: trainer.querySelector("[data-stat-decisions]"),
    accuracy: trainer.querySelector("[data-stat-accuracy]"),
    vpip: trainer.querySelector("[data-stat-vpip]"),
    pfr: trainer.querySelector("[data-stat-pfr]"),
    profileNote: trainer.querySelector("[data-profile-note]"),
    handNumber: trainer.querySelector("[data-hand-number]"),
    stackLine: trainer.querySelector("[data-stack-line]"),
    pot: trainer.querySelector("[data-pot]"),
    board: trainer.querySelector("[data-board]"),
    cards: trainer.querySelector("[data-hole-cards]"),
    equity: trainer.querySelector("[data-equity]"),
    actionCopy: trainer.querySelector("[data-action-copy]"),
    options: trainer.querySelector("[data-action-options]"),
    feedback: trainer.querySelector("[data-feedback]"),
    next: trainer.querySelector("[data-next-spot]"),
    status: trainer.querySelector("[data-terminal-status]"),
  };

  const renderSpot = () => {
    const spot = spots[spotIndex];
    answered = false;
    selectors.current.textContent = String(spotIndex + 1).padStart(2, "0");
    selectors.progress.style.width = `${((spotIndex + 1) / spots.length) * 100}%`;
    selectors.handNumber.textContent = spot.handNumber;
    selectors.stackLine.textContent = spot.stackLine;
    selectors.pot.textContent = spot.pot;
    selectors.board.innerHTML = spot.board;
    selectors.cards.innerHTML = spot.hand.map(({ card, suit }) => `<b class="${suit}">${card}</b>`).join(" ");
    const win = Math.max(1, Math.min(98, spot.baseEquity + profiles[profile].equityShift));
    const lose = Math.max(0, 100 - win - spot.tie);
    selectors.equity.textContent = `${win.toFixed(1)}% Win / ${spot.tie.toFixed(1)}% Tie / ${lose.toFixed(1)}% Lose`;
    selectors.actionCopy.textContent = spot.actionCopy;
    selectors.options.replaceChildren();

    spot.actions.forEach((action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.action = action.id;
      const adjustedDetail = action.detail.replace(/FE (\d+)%/, (_, value) => {
        const adjusted = Math.max(5, Math.min(98, Number(value) + profiles[profile].foldShift));
        return `FE ${adjusted}%`;
      });
      button.innerHTML = `<strong>${action.label}</strong><span>${adjustedDetail}</span>`;
      button.addEventListener("click", () => answerSpot(action));
      selectors.options.appendChild(button);
    });

    selectors.feedback.className = "trainer-feedback";
    selectors.feedback.innerHTML = "<span>&gt;</span><p>Choose an action to receive strategic feedback.</p>";
    selectors.next.hidden = true;
    selectors.status.textContent = "AWAITING ACTION";
  };

  const answerSpot = (action) => {
    if (answered) return;
    answered = true;
    decisions += 1;
    if (action.quality === "best") correct += 1;
    if (action.vpip) vpipActions += 1;
    if (action.pfr) pfrActions += 1;

    selectors.options.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
      if (button.dataset.action === action.id) button.classList.add("is-selected");
      const source = spots[spotIndex].actions.find((item) => item.id === button.dataset.action);
      if (source?.quality === "best") button.classList.add("is-best");
    });

    const tone = action.quality === "best" ? "is-positive" : action.quality === "good" ? "is-positive" : "is-caution";
    selectors.feedback.className = `trainer-feedback ${tone}`;
    selectors.feedback.innerHTML = `<span>&gt;</span><p><strong>${action.quality === "best" ? "Strong decision." : action.quality === "good" ? "Good decision." : "Review this spot."}</strong> ${spots[spotIndex].feedback[action.id]}</p>`;
    selectors.status.textContent = action.quality === "best" || action.quality === "good" ? "DECISION LOGGED ✓" : "REVIEW REQUIRED";
    selectors.decisions.textContent = decisions;
    selectors.accuracy.textContent = `${Math.round((correct / decisions) * 100)}%`;
    selectors.vpip.textContent = `${Math.round((vpipActions / decisions) * 100)}%`;
    selectors.pfr.textContent = `${Math.round((pfrActions / decisions) * 100)}%`;
    selectors.next.hidden = false;
    selectors.next.innerHTML = spotIndex === spots.length - 1
      ? 'Restart session <span aria-hidden="true">↻</span>'
      : 'Next spot <span aria-hidden="true">→</span>';
  };

  trainer.querySelectorAll("[data-profile]").forEach((button) => {
    button.addEventListener("click", () => {
      profile = button.dataset.profile;
      trainer.querySelectorAll("[data-profile]").forEach((item) => item.classList.toggle("is-active", item === button));
      selectors.profileNote.textContent = profiles[profile].note;
      if (!answered) renderSpot();
    });
  });

  selectors.next.addEventListener("click", () => {
    if (spotIndex === spots.length - 1) {
      spotIndex = 0;
      decisions = 0;
      correct = 0;
      vpipActions = 0;
      pfrActions = 0;
      selectors.decisions.textContent = "0";
      selectors.accuracy.textContent = "—";
      selectors.vpip.textContent = "0%";
      selectors.pfr.textContent = "0%";
    } else {
      spotIndex += 1;
    }
    renderSpot();
  });

  renderSpot();
})();
