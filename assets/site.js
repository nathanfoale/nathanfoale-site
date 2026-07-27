(() => {
  const phrases = [
    "HELLO, I AM NATHAN",
    "こんにちは, I AM NATHAN",
    "HOLA, I AM NATHAN",
    "你好, I AM NATHAN",
    "BONJOUR, I AM NATHAN",
    "안녕하세요, I AM NATHAN",
    "CIAO, I AM NATHAN",
    "NAMASTE, I AM NATHAN",
    "G'DAY, I AM NATHAN",
  ];

  const typingTarget = document.querySelector("[data-typing]");
  if (typingTarget) {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let pause = 0;

    const type = () => {
      const phrase = phrases[phraseIndex];
      if (pause > 0) {
        pause -= 1;
      } else if (deleting) {
        charIndex -= 1;
        if (charIndex <= 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      } else {
        charIndex += 1;
        if (charIndex >= phrase.length) {
          deleting = true;
          pause = 12;
        }
      }
      typingTarget.textContent = phrase.slice(0, Math.max(0, charIndex));
      window.setTimeout(type, deleting ? 55 : 92);
    };
    type();
  }

  const canvas = document.querySelector("[data-particles]");
  if (canvas instanceof HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    const pointer = { x: -1000, y: -1000 };
    let width = 0;
    let height = 0;
    let ratio = 1;
    let points = [];

    const makePoint = (x, y) => ({
      x: x ?? Math.random() * width,
      y: y ?? Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.4 + 0.5,
      alpha: Math.random() * 0.5 + 0.22,
    });

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(96, Math.max(46, Math.floor((width * height) / 18000)));
      points = Array.from({ length: count }, () => makePoint());
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      points.forEach((point, index) => {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < -8) point.x = width + 8;
        if (point.x > width + 8) point.x = -8;
        if (point.y < -8) point.y = height + 8;
        if (point.y > height + 8) point.y = -8;

        context.beginPath();
        context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(220,255,238,${point.alpha})`;
        context.fill();

        for (let next = index + 1; next < points.length; next += 1) {
          const other = points[next];
          const distance = Math.hypot(point.x - other.x, point.y - other.y);
          if (distance < 122) {
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(other.x, other.y);
            context.strokeStyle = `rgba(73,255,164,${0.1 * (1 - distance / 122)})`;
            context.lineWidth = 0.65;
            context.stroke();
          }
        }

        const pointerDistance = Math.hypot(point.x - pointer.x, point.y - pointer.y);
        if (pointerDistance < 150) {
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(pointer.x, pointer.y);
          context.strokeStyle = `rgba(57,255,157,${0.24 * (1 - pointerDistance / 150)})`;
          context.stroke();
        }
      });
      window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
    });
    window.addEventListener("pointerdown", (event) => {
      points.push(
        ...Array.from({ length: 5 }, () =>
          makePoint(
            event.clientX + (Math.random() - 0.5) * 18,
            event.clientY + (Math.random() - 0.5) * 18,
          ),
        ),
      );
      if (points.length > 110) points = points.slice(-110);
    });
  }

  const codeRain = document.querySelector("[data-code-rain]");
  if (codeRain) {
    const lines = [
      'const engineer = new PromptDeveloper("Nathan");',
      'engineer.build("customGPTs");',
      'engineer.optimize("AI workflows");',
      'engineer.automate("tasks");',
      'engineer.analyze("text, sentiment, stats");',
      'engineer.deploy("OpenAI API solutions");',
    ];
    for (let column = 0; column < 9; column += 1) {
      const element = document.createElement("div");
      element.className = "code-column";
      element.style.left = `${column * 13 - 3}%`;
      element.style.animationDelay = `${(column % 4) * -2.1}s`;
      element.style.animationDuration = `${14 + (column % 3) * 3}s`;
      element.innerHTML = Array.from({ length: 4 }, () => lines)
        .flat()
        .map((line) => `<span>${line.replaceAll("<", "&lt;")}</span>`)
        .join("");
      codeRain.appendChild(element);
    }
  }

  let noticeTimer;
  const notice = document.querySelector("[data-notice]");
  const showNotice = (message) => {
    if (!notice) return;
    notice.textContent = message;
    notice.classList.add("is-visible");
    window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => notice.classList.remove("is-visible"), 2400);
  };

  document.querySelectorAll("[data-soon]").forEach((element) => {
    element.addEventListener("click", () => {
      showNotice(element.getAttribute("data-soon") || "This page is coming soon.");
    });
  });

  document.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
      const wasOpen = button.classList.contains("is-open");
      document.querySelectorAll("[data-service].is-open").forEach((openButton) => {
        openButton.classList.remove("is-open");
        openButton.setAttribute("aria-expanded", "false");
        const toggle = openButton.querySelector(".service-toggle");
        if (toggle) toggle.textContent = "+";
      });
      if (!wasOpen) {
        button.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
        const toggle = button.querySelector(".service-toggle");
        if (toggle) toggle.textContent = "−";
      }
    });
  });
})();
