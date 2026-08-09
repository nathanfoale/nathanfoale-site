(function () {
  "use strict";

  if (/^(www\.)?nathanfoale\.com$/.test(window.location.hostname)) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", "G-P6E7QEZ6HX");

    var analyticsScript = document.createElement("script");
    analyticsScript.async = true;
    analyticsScript.src = "https://www.googletagmanager.com/gtag/js?id=G-P6E7QEZ6HX";
    document.head.appendChild(analyticsScript);
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var menuButton = document.querySelector(".menu-toggle");
  var mobileMenu = document.querySelector(".mobile-nav");

  if (document.body.classList.contains("essay-locked")) {
    var essayContent = document.querySelector(".article-shell");
    var essayGate = document.createElement("section");
    essayGate.className = "essay-gate";
    essayGate.setAttribute("data-essay-gate", "");
    essayGate.setAttribute("role", "dialog");
    essayGate.setAttribute("aria-modal", "true");
    essayGate.setAttribute("aria-labelledby", "essay-gate-title");
    essayGate.innerHTML = [
      '<div class="essay-gate-orbits" aria-hidden="true"><i></i><i></i><i></i></div>',
      '<div class="essay-gate-card">',
        '<div class="essay-gate-topline">',
          '<a href="/blog/"><span aria-hidden="true">←</span> All writing</a>',
          '<img src="/assets/nf-logo-mark-header.png" alt="" aria-hidden="true">',
        '</div>',
        '<p class="essay-gate-kicker"><span aria-hidden="true"></span> Protected writing</p>',
        '<h1 id="essay-gate-title">PASSCODE<br><em>REQUIRED.</em></h1>',
        '<p class="essay-gate-copy">Enter the four-digit passcode to read this essay.</p>',
        '<form class="essay-gate-form" data-essay-gate-form novalidate>',
          '<label for="essay-passcode">Passcode</label>',
          '<div class="essay-gate-controls">',
            '<input id="essay-passcode" data-essay-passcode type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" aria-describedby="essay-gate-message">',
            '<button type="submit">View essay <span aria-hidden="true">→</span></button>',
          '</div>',
          '<p class="essay-gate-message" id="essay-gate-message" data-essay-gate-message aria-live="polite">Four digits</p>',
        '</form>',
      '</div>'
    ].join("");
    document.body.insertBefore(essayGate, document.body.firstChild);

    var essayGateForm = essayGate.querySelector("[data-essay-gate-form]");
    var essayPasscode = essayGate.querySelector("[data-essay-passcode]");
    var essayGateMessage = essayGate.querySelector("[data-essay-gate-message]");
    var essayGateButton = essayGateForm.querySelector("button");
    var expectedPasscodeHash = "408311ba9b03d5d2d41463f1b49280625f826a70a7dc5ccd92d0b41b93b26be2";

    function hashEssayPasscode(value) {
      if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) return Promise.resolve("");
      return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)).then(function (buffer) {
        return Array.prototype.map.call(new Uint8Array(buffer), function (byte) {
          return byte.toString(16).padStart(2, "0");
        }).join("");
      });
    }

    essayPasscode.addEventListener("input", function () {
      essayPasscode.value = essayPasscode.value.replace(/\D/g, "").slice(0, 4);
      essayGateForm.classList.remove("is-error");
      essayPasscode.removeAttribute("aria-invalid");
      essayGateMessage.textContent = "Four digits";
    });

    essayGateForm.addEventListener("submit", function (event) {
      event.preventDefault();
      essayGateButton.disabled = true;
      essayGateButton.firstChild.nodeValue = "Checking ";

      hashEssayPasscode(essayPasscode.value).then(function (passcodeHash) {
        if (passcodeHash === expectedPasscodeHash) {
          essayGate.classList.add("is-unlocking");
          window.setTimeout(function () {
            document.body.classList.remove("essay-locked");
            document.body.classList.add("essay-unlocked");
            if (essayContent) {
              essayContent.removeAttribute("inert");
              essayContent.removeAttribute("aria-hidden");
            }
            essayGate.remove();
            var essayHeading = document.querySelector(".article-header h1");
            if (essayHeading) {
              essayHeading.setAttribute("tabindex", "-1");
              essayHeading.focus({ preventScroll: true });
            }
          }, reduceMotion ? 0 : 320);
          return;
        }

        essayGateForm.classList.remove("is-error");
        void essayGateForm.offsetWidth;
        essayGateForm.classList.add("is-error");
        essayPasscode.setAttribute("aria-invalid", "true");
        essayPasscode.value = "";
        essayGateMessage.textContent = "Incorrect passcode. Try again.";
        essayGateButton.disabled = false;
        essayGateButton.firstChild.nodeValue = "View essay ";
        essayPasscode.focus();
      });
    });

    window.setTimeout(function () { essayPasscode.focus(); }, 120);
  }

  function closeMenu() {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", "false");
    mobileMenu.hidden = true;
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      var isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      mobileMenu.hidden = isOpen;
    });

    mobileMenu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  var readingProgress = document.querySelector("[data-reading-progress]");
  if (readingProgress) {
    function updateReadingProgress() {
      var scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
      readingProgress.style.width = (progress * 100).toFixed(2) + "%";
    }
    updateReadingProgress();
    window.addEventListener("scroll", updateReadingProgress, { passive: true });
    window.addEventListener("resize", updateReadingProgress);
  }

  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (element) { element.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    reveals.forEach(function (element) { revealObserver.observe(element); });
  }

  function fitCanvas(canvas) {
    var rect = canvas.getBoundingClientRect();
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    var context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { context: context, width: rect.width, height: rect.height };
  }

  var usePageParticleField = !document.querySelector("[data-hero-particles]");
  var pageParticleCanvas = document.createElement("canvas");
  pageParticleCanvas.className = "page-particle-canvas";
  pageParticleCanvas.setAttribute("data-page-particles", "");
  pageParticleCanvas.setAttribute("aria-hidden", "true");
  var pageParticleHost = document.querySelector(".poker-shell") || document.body;
  if (usePageParticleField) pageParticleHost.insertBefore(pageParticleCanvas, pageParticleHost.firstChild);

  var pageParticleMetrics;
  var pageParticleNodes = [];
  var pageParticleSparks = [];
  var pageParticleRipples = [];
  var pageParticlePointer = { x: 0, y: 0, active: false };
  var pageParticleFrame = 0;
  var pageParticleTrailTime = 0;

  function seedPageParticleField() {
    pageParticleMetrics = fitCanvas(pageParticleCanvas);
    var compact = pageParticleMetrics.width < 720;
    var count = compact ? 24 : Math.max(34, Math.min(46, Math.round(pageParticleMetrics.width / 38)));
    var columns = compact ? 5 : 9;
    var rows = Math.ceil(count / columns);
    pageParticleNodes = [];

    for (var pageIndex = 0; pageIndex < count; pageIndex += 1) {
      var column = pageIndex % columns;
      var row = Math.floor(pageIndex / columns);
      var distributedX = (column + 0.16 + Math.random() * 0.68) / columns;
      var distributedY = (row + 0.14 + Math.random() * 0.72) / rows;
      pageParticleNodes.push({
        x: distributedX * pageParticleMetrics.width,
        y: distributedY * pageParticleMetrics.height,
        vx: (Math.random() - 0.5) * 0.11,
        vy: (Math.random() - 0.5) * 0.11,
        size: 0.48 + Math.random() * 0.72,
        alpha: 0.12 + Math.random() * 0.2
      });
    }
  }

  function addPageParticleBurst(x, y, count, strength) {
    for (var burstIndex = 0; burstIndex < count; burstIndex += 1) {
      var burstAngle = Math.PI * 2 * burstIndex / count + Math.random() * 0.35;
      var burstSpeed = strength * (0.5 + Math.random() * 0.9);
      pageParticleSparks.push({
        x: x,
        y: y,
        vx: Math.cos(burstAngle) * burstSpeed,
        vy: Math.sin(burstAngle) * burstSpeed,
        size: 0.65 + Math.random() * 1.05,
        life: 1
      });
    }
  }

  if (usePageParticleField && !reduceMotion) {
    window.addEventListener("pointermove", function (event) {
      pageParticlePointer.x = event.clientX;
      pageParticlePointer.y = event.clientY;
      pageParticlePointer.active = true;
      if (event.timeStamp - pageParticleTrailTime > 46) {
        pageParticleSparks.push({
          x: event.clientX + (Math.random() - 0.5) * 7,
          y: event.clientY + (Math.random() - 0.5) * 7,
          vx: (Math.random() - 0.5) * 0.34,
          vy: (Math.random() - 0.5) * 0.34,
          size: 0.7 + Math.random() * 0.9,
          life: 0.5
        });
        pageParticleTrailTime = event.timeStamp;
      }
    }, { passive: true });

    window.addEventListener("pointerdown", function (event) {
      pageParticlePointer.x = event.clientX;
      pageParticlePointer.y = event.clientY;
      pageParticlePointer.active = true;
      addPageParticleBurst(event.clientX, event.clientY, event.pointerType === "touch" ? 24 : 20, event.pointerType === "touch" ? 1.55 : 1.25);
      pageParticleRipples.push({ x: event.clientX, y: event.clientY, radius: 10, life: 1, speed: 2.5 });
      pageParticleRipples.push({ x: event.clientX, y: event.clientY, radius: 26, life: 0.78, speed: 1.8 });
    }, { passive: true });

    document.documentElement.addEventListener("mouseleave", function () {
      pageParticlePointer.active = false;
    });
  }

  function drawPageParticleField(time) {
    var pageContext = pageParticleMetrics.context;
    var pageWidth = pageParticleMetrics.width;
    var pageHeight = pageParticleMetrics.height;
    pageContext.clearRect(0, 0, pageWidth, pageHeight);

    for (var nodeIndex = 0; nodeIndex < pageParticleNodes.length; nodeIndex += 1) {
      var pageNode = pageParticleNodes[nodeIndex];
      if (pageParticlePointer.active) {
        var nodeDx = pageParticlePointer.x - pageNode.x;
        var nodeDy = pageParticlePointer.y - pageNode.y;
        var nodeDistance = Math.sqrt(nodeDx * nodeDx + nodeDy * nodeDy);
        if (nodeDistance > 3 && nodeDistance < 220) {
          var nodeInfluence = (1 - nodeDistance / 220) * 0.028;
          pageNode.vx += (-nodeDy / nodeDistance) * nodeInfluence;
          pageNode.vy += (nodeDx / nodeDistance) * nodeInfluence;
          pageNode.vx += (nodeDx / nodeDistance) * nodeInfluence * 0.2;
          pageNode.vy += (nodeDy / nodeDistance) * nodeInfluence * 0.2;
        }
      }

      pageNode.vx *= 0.994;
      pageNode.vy *= 0.994;
      pageNode.x += pageNode.vx;
      pageNode.y += pageNode.vy;
      if (pageNode.x < -10) pageNode.x = pageWidth + 10;
      if (pageNode.x > pageWidth + 10) pageNode.x = -10;
      if (pageNode.y < -10) pageNode.y = pageHeight + 10;
      if (pageNode.y > pageHeight + 10) pageNode.y = -10;
    }

    for (var firstNode = 0; firstNode < pageParticleNodes.length; firstNode += 1) {
      var pageConnections = 0;
      for (var secondNode = firstNode + 1; secondNode < pageParticleNodes.length; secondNode += 1) {
        var pageDx = pageParticleNodes[firstNode].x - pageParticleNodes[secondNode].x;
        var pageDy = pageParticleNodes[firstNode].y - pageParticleNodes[secondNode].y;
        var pageDistance = Math.sqrt(pageDx * pageDx + pageDy * pageDy);
        if (pageDistance > 155) continue;
        pageContext.beginPath();
        pageContext.moveTo(pageParticleNodes[firstNode].x, pageParticleNodes[firstNode].y);
        pageContext.lineTo(pageParticleNodes[secondNode].x, pageParticleNodes[secondNode].y);
        pageContext.strokeStyle = "rgba(61, 242, 160," + (0.052 * (1 - pageDistance / 155)) + ")";
        pageContext.lineWidth = 0.55;
        pageContext.stroke();
        pageConnections += 1;
        if (pageConnections >= 2) break;
      }
    }

    pageParticleNodes.forEach(function (node, index) {
      var pointerDistanceX = node.x - pageParticlePointer.x;
      var pointerDistanceY = node.y - pageParticlePointer.y;
      var pointerDistance = Math.sqrt(pointerDistanceX * pointerDistanceX + pointerDistanceY * pointerDistanceY);
      var pointerGlow = pageParticlePointer.active ? Math.max(0, 1 - pointerDistance / 155) : 0;
      pageContext.beginPath();
      pageContext.arc(node.x, node.y, node.size + pointerGlow * 0.45, 0, Math.PI * 2);
      pageContext.fillStyle = index % 7 === 0
        ? "rgba(61, 242, 160," + (node.alpha + pointerGlow * 0.24) + ")"
        : "rgba(191, 209, 203," + (node.alpha + pointerGlow * 0.18) + ")";
      pageContext.fill();
    });

    if (pageParticlePointer.active) {
      var pageOrbitPhase = time * 0.0015;
      for (var pageOrbit = 0; pageOrbit < 2; pageOrbit += 1) {
        pageContext.beginPath();
        pageContext.ellipse(
          pageParticlePointer.x,
          pageParticlePointer.y,
          25 + pageOrbit * 14 + Math.sin(pageOrbitPhase + pageOrbit) * 3,
          10 + pageOrbit * 6,
          pageOrbitPhase * 0.22 + pageOrbit * 0.7,
          0,
          Math.PI * 2
        );
        pageContext.strokeStyle = "rgba(61, 242, 160," + (0.13 - pageOrbit * 0.035) + ")";
        pageContext.lineWidth = 0.8;
        pageContext.stroke();
      }
    }

    pageParticleSparks = pageParticleSparks.filter(function (spark) {
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vx *= 0.982;
      spark.vy *= 0.982;
      spark.life -= 0.021;
      if (spark.life <= 0) return false;
      pageContext.beginPath();
      pageContext.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
      pageContext.fillStyle = "rgba(61, 242, 160," + (spark.life * 0.75) + ")";
      pageContext.fill();
      return true;
    });

    pageParticleRipples = pageParticleRipples.filter(function (ripple) {
      ripple.radius += ripple.speed;
      ripple.life -= 0.025;
      if (ripple.life <= 0) return false;
      pageContext.beginPath();
      pageContext.ellipse(ripple.x, ripple.y, ripple.radius, ripple.radius * 0.48, time * 0.0004, 0, Math.PI * 2);
      pageContext.strokeStyle = "rgba(61, 242, 160," + (ripple.life * 0.45) + ")";
      pageContext.lineWidth = 1;
      pageContext.stroke();
      return true;
    });

    if (!reduceMotion) pageParticleFrame = window.requestAnimationFrame(drawPageParticleField);
  }

  if (usePageParticleField) {
    seedPageParticleField();
    drawPageParticleField(0);
    window.addEventListener("resize", function () {
      seedPageParticleField();
      if (reduceMotion) drawPageParticleField(0);
    });
    window.addEventListener("pagehide", function () {
      if (pageParticleFrame) window.cancelAnimationFrame(pageParticleFrame);
    });
  }

  var hero = document.querySelector(".hero");
  var heroCanvas = document.querySelector("[data-hero-particles]");
  if (hero && heroCanvas) {
    var heroMetrics;
    var heroParticles = [];
    var burstParticles = [];
    var orbitRings = [];
    var heroPointer = { x: 0, y: 0, active: false };
    var heroAnimationFrame = 0;
    var lastTrailTime = 0;

    function seedHeroParticles() {
      heroMetrics = fitCanvas(heroCanvas);
      var count = Math.max(34, Math.min(62, Math.round(heroMetrics.width / 18)));
      heroParticles = [];
      for (var index = 0; index < count; index += 1) {
        heroParticles.push({
          x: Math.random() * heroMetrics.width,
          y: Math.random() * heroMetrics.height,
          vx: (Math.random() - 0.5) * 0.17,
          vy: (Math.random() - 0.5) * 0.17,
          size: 0.7 + Math.random() * 1.3,
          alpha: 0.12 + Math.random() * 0.3
        });
      }
    }

    function pointerPosition(event) {
      var rect = heroCanvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }

    function pointerInsideHeroField(event) {
      var rect = heroCanvas.getBoundingClientRect();
      return event.clientY >= rect.top && event.clientY <= rect.bottom;
    }

    function addBurst(x, y, count, strength) {
      for (var index = 0; index < count; index += 1) {
        var angle = Math.PI * 2 * index / count + Math.random() * 0.4;
        var speed = strength * (0.55 + Math.random() * 0.75);
        burstParticles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1 + Math.random() * 1.8,
          life: 1
        });
      }
    }

    function addOrbit(x, y, radius, speed) {
      orbitRings.push({ x: x, y: y, radius: radius, speed: speed, life: 1 });
    }

    if (!reduceMotion) {
      window.addEventListener("pointermove", function (event) {
        if (!pointerInsideHeroField(event)) {
          heroPointer.active = false;
          return;
        }
        var point = pointerPosition(event);
        heroPointer.x = point.x;
        heroPointer.y = point.y;
        heroPointer.active = true;
        if (event.timeStamp - lastTrailTime > 38) {
          burstParticles.push({
            x: point.x + (Math.random() - 0.5) * 8,
            y: point.y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            size: 0.8 + Math.random(),
            life: 0.54
          });
          lastTrailTime = event.timeStamp;
        }
      }, { passive: true });

      window.addEventListener("pointerdown", function (event) {
        if (!pointerInsideHeroField(event)) return;
        var point = pointerPosition(event);
        heroPointer.x = point.x;
        heroPointer.y = point.y;
        heroPointer.active = true;
        addBurst(point.x, point.y, 18, event.pointerType === "touch" ? 1.45 : 1.15);
        addOrbit(point.x, point.y, 8, 2.4);
        addOrbit(point.x, point.y, 22, 1.75);
      }, { passive: true });
    }

    function drawHeroParticles(time) {
      var ctx = heroMetrics.context;
      var width = heroMetrics.width;
      var height = heroMetrics.height;
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < heroParticles.length; i += 1) {
        var particle = heroParticles[i];
        if (heroPointer.active) {
          var pointerDx = heroPointer.x - particle.x;
          var pointerDy = heroPointer.y - particle.y;
          var pointerDistance = Math.sqrt(pointerDx * pointerDx + pointerDy * pointerDy);
          if (pointerDistance > 3 && pointerDistance < 185) {
            var influence = (1 - pointerDistance / 185) * 0.032;
            particle.vx += (-pointerDy / pointerDistance) * influence;
            particle.vy += (pointerDx / pointerDistance) * influence;
            particle.vx += (pointerDx / pointerDistance) * influence * 0.22;
            particle.vy += (pointerDy / pointerDistance) * influence * 0.22;
          }
        }

        particle.vx *= 0.992;
        particle.vy *= 0.992;
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < -8) particle.x = width + 8;
        if (particle.x > width + 8) particle.x = -8;
        if (particle.y < -8) particle.y = height + 8;
        if (particle.y > height + 8) particle.y = -8;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(157, 174, 174," + particle.alpha + ")";
        ctx.fill();
      }

      for (var first = 0; first < heroParticles.length; first += 1) {
        for (var second = first + 1; second < heroParticles.length; second += 1) {
          var lineDx = heroParticles[first].x - heroParticles[second].x;
          var lineDy = heroParticles[first].y - heroParticles[second].y;
          var lineDistance = Math.sqrt(lineDx * lineDx + lineDy * lineDy);
          if (lineDistance > 105) continue;
          ctx.beginPath();
          ctx.moveTo(heroParticles[first].x, heroParticles[first].y);
          ctx.lineTo(heroParticles[second].x, heroParticles[second].y);
          ctx.strokeStyle = "rgba(114, 147, 140," + (0.055 * (1 - lineDistance / 105)) + ")";
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      if (heroPointer.active) {
        var orbitPhase = time * 0.0018;
        for (var orbitIndex = 0; orbitIndex < 2; orbitIndex += 1) {
          ctx.beginPath();
          ctx.ellipse(
            heroPointer.x,
            heroPointer.y,
            24 + orbitIndex * 13 + Math.sin(orbitPhase + orbitIndex) * 3,
            10 + orbitIndex * 6,
            orbitPhase * 0.18 + orbitIndex * 0.7,
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = "rgba(61, 242, 160," + (0.11 - orbitIndex * 0.025) + ")";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      burstParticles = burstParticles.filter(function (particle) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.982;
        particle.vy *= 0.982;
        particle.life -= 0.018;
        if (particle.life <= 0) return false;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(61, 242, 160," + (particle.life * 0.72) + ")";
        ctx.fill();
        return true;
      });

      orbitRings = orbitRings.filter(function (ring) {
        ring.radius += ring.speed;
        ring.life -= 0.024;
        if (ring.life <= 0) return false;
        ctx.beginPath();
        ctx.ellipse(ring.x, ring.y, ring.radius, ring.radius * 0.46, time * 0.00035, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(61, 242, 160," + (ring.life * 0.42) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
        return true;
      });

      if (!reduceMotion) heroAnimationFrame = window.requestAnimationFrame(drawHeroParticles);
    }

    seedHeroParticles();
    drawHeroParticles(0);
    window.addEventListener("resize", function () {
      seedHeroParticles();
      if (reduceMotion) drawHeroParticles(0);
    });
    window.addEventListener("pagehide", function () {
      if (heroAnimationFrame) window.cancelAnimationFrame(heroAnimationFrame);
    });
  }

  var systemCanvas = document.querySelector("[data-system-canvas]");
  if (systemCanvas) {
    var fieldNodes = [
      [0.12, 0.28], [0.23, 0.62], [0.31, 0.19], [0.39, 0.76],
      [0.51, 0.34], [0.59, 0.64], [0.68, 0.18], [0.75, 0.47],
      [0.84, 0.72], [0.91, 0.29], [0.47, 0.11], [0.18, 0.83]
    ];
    var pointer = { x: 0.54, y: 0.5 };
    var animationFrame = 0;

    systemCanvas.parentElement.addEventListener("pointermove", function (event) {
      var rect = systemCanvas.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / Math.max(1, rect.width);
      pointer.y = (event.clientY - rect.top) / Math.max(1, rect.height);
    });

    function drawField(time) {
      var fitted = fitCanvas(systemCanvas);
      var ctx = fitted.context;
      var width = fitted.width;
      var height = fitted.height;
      var t = reduceMotion ? 0 : time * 0.00022;
      ctx.clearRect(0, 0, width, height);

      var points = fieldNodes.map(function (node, index) {
        var driftX = Math.sin(t * (index % 3 + 1) + index) * 5;
        var driftY = Math.cos(t * (index % 4 + 1) + index * 0.7) * 5;
        return { x: node[0] * width + driftX, y: node[1] * height + driftY };
      });

      for (var i = 0; i < points.length; i += 1) {
        for (var j = i + 1; j < points.length; j += 1) {
          var dx = points[i].x - points[j].x;
          var dy = points[i].y - points[j].y;
          var distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > width * 0.3) continue;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.strokeStyle = "rgba(155, 170, 180," + (0.13 * (1 - distance / (width * 0.3))) + ")";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      points.forEach(function (point, index) {
        var px = pointer.x * width;
        var py = pointer.y * height;
        var dpx = point.x - px;
        var dpy = point.y - py;
        var proximity = Math.max(0, 1 - Math.sqrt(dpx * dpx + dpy * dpy) / 150);
        ctx.beginPath();
        ctx.arc(point.x, point.y, index % 4 === 0 ? 3 : 1.8, 0, Math.PI * 2);
        ctx.fillStyle = proximity > 0.2 ? "rgba(61, 242, 160," + (0.42 + proximity * 0.5) + ")" : "rgba(192, 201, 209, 0.52)";
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(pointer.x * width, pointer.y * height, 26, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(61, 242, 160, 0.12)";
      ctx.stroke();

      if (!reduceMotion) animationFrame = window.requestAnimationFrame(drawField);
    }

    drawField(0);
    window.addEventListener("resize", function () {
      if (reduceMotion) drawField(0);
    });
    window.addEventListener("pagehide", function () {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    });
  }

  function drawMiniChart(canvas) {
    var type = canvas.getAttribute("data-mini-chart");
    var fitted = fitCanvas(canvas);
    var ctx = fitted.context;
    var width = fitted.width;
    var height = fitted.height;
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (type === "identity") {
      var identityCenterX = width * 0.58;
      var identityCenterY = height * 0.48;
      var identityRadius = Math.min(width, height) * 0.27;
      ctx.beginPath();
      ctx.moveTo(width * 0.12, identityCenterY);
      ctx.lineTo(width * 0.9, identityCenterY);
      ctx.moveTo(identityCenterX, height * 0.14);
      ctx.lineTo(identityCenterX, height * 0.82);
      ctx.strokeStyle = "rgba(188, 199, 205, 0.16)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(identityCenterX, identityCenterY, identityRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(61, 242, 160, 0.54)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      var identityAngle = -Math.PI * 0.28;
      var identityPointX = identityCenterX + Math.cos(identityAngle) * identityRadius;
      var identityPointY = identityCenterY + Math.sin(identityAngle) * identityRadius;
      ctx.beginPath();
      ctx.moveTo(identityCenterX, identityCenterY);
      ctx.lineTo(identityPointX, identityPointY);
      ctx.strokeStyle = "rgba(61, 242, 160, 0.72)";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(identityPointX, identityPointY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(61, 242, 160, 0.92)";
      ctx.fill();

      ctx.fillStyle = "rgba(221, 226, 227, 0.72)";
      ctx.font = Math.max(12, Math.round(width * 0.048)) + "px ui-monospace, monospace";
      ctx.fillText("e", width * 0.21, height * 0.31);
      ctx.fillStyle = "rgba(155, 164, 171, 0.58)";
      ctx.font = Math.max(9, Math.round(width * 0.028)) + "px ui-monospace, monospace";
      ctx.fillText("iπ  +  1  =  0", width * 0.18, height * 0.72);
    }

    if (type === "paths") {
      var paths = [
        [0.1, 0.7, 0.19, 0.54, 0.27, 0.62, 0.36, 0.38, 0.45, 0.48, 0.55, 0.24, 0.66, 0.34, 0.76, 0.18, 0.9, 0.26],
        [0.1, 0.58, 0.2, 0.64, 0.3, 0.45, 0.4, 0.55, 0.5, 0.42, 0.61, 0.52, 0.73, 0.31, 0.9, 0.39],
        [0.1, 0.76, 0.23, 0.72, 0.36, 0.58, 0.49, 0.67, 0.63, 0.49, 0.76, 0.61, 0.9, 0.46]
      ];
      paths.forEach(function (path, pathIndex) {
        ctx.beginPath();
        for (var i = 0; i < path.length; i += 2) {
          var x = path[i] * width;
          var y = path[i + 1] * height;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = pathIndex === 0 ? "rgba(61, 242, 160, 0.78)" : "rgba(126, 170, 153, 0.25)";
        ctx.lineWidth = pathIndex === 0 ? 1.5 : 1;
        ctx.stroke();
      });
    }

    if (type === "bars") {
      var values = [0.36, 0.54, 0.43, 0.71, 0.61, 0.83, 0.68];
      var barWidth = width * 0.065;
      values.forEach(function (value, index) {
        var x = width * 0.18 + index * width * 0.1;
        var barHeight = height * value * 0.58;
        var gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        gradient.addColorStop(0, "rgba(61, 242, 160, 0.68)");
        gradient.addColorStop(1, "rgba(61, 242, 160, 0.07)");
        ctx.fillStyle = gradient;
        ctx.fillRect(x, height * 0.79 - barHeight, barWidth, barHeight);
      });
      ctx.beginPath();
      ctx.moveTo(width * 0.12, height * 0.79);
      ctx.lineTo(width * 0.9, height * 0.79);
      ctx.strokeStyle = "rgba(201, 210, 216, 0.2)";
      ctx.stroke();
    }

    if (type === "network") {
      var cx = width * 0.55;
      var cy = height * 0.48;
      var radius = Math.min(width, height) * 0.29;
      var nodes = [];
      for (var n = 0; n < 8; n += 1) {
        var angle = Math.PI * 2 * n / 8 - Math.PI / 2;
        nodes.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
      }
      nodes.push({ x: cx, y: cy });
      var links = [[0, 2], [0, 4], [0, 8], [1, 4], [1, 6], [1, 8], [2, 5], [2, 8], [3, 6], [3, 8], [4, 7], [4, 8], [5, 0], [5, 8], [6, 2], [6, 8], [7, 3], [7, 8]];
      links.forEach(function (link) {
        ctx.beginPath();
        ctx.moveTo(nodes[link[0]].x, nodes[link[0]].y);
        ctx.lineTo(nodes[link[1]].x, nodes[link[1]].y);
        ctx.strokeStyle = "rgba(147, 166, 166, 0.24)";
        ctx.stroke();
      });
      nodes.forEach(function (node, index) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, index === 8 ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = index === 8 ? "rgba(61, 242, 160, 0.9)" : "rgba(9, 14, 16, 0.96)";
        ctx.fill();
        ctx.strokeStyle = "rgba(61, 242, 160, 0.55)";
        ctx.stroke();
      });
    }
  }

  var miniCharts = Array.prototype.slice.call(document.querySelectorAll("[data-mini-chart]"));
  miniCharts.forEach(drawMiniChart);
  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      miniCharts.forEach(drawMiniChart);
    }, 120);
  });
}());
