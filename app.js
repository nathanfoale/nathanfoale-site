document.addEventListener("DOMContentLoaded", () => {
  if (!window.particlesJS) {
    console.error("particlesJS not loaded");
    return;
  }

  particlesJS("particles-js", {
    particles: {
      number: { value: 70, density: { enable: true, value_area: 800 } },
      color: { value: "#ffffff" },
      shape: { type: "circle" },
      opacity: { value: 0.5 },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, opacity: 0.3 },
      move: { enable: true, speed: 1.2 }
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } },
      modes: { repulse: { distance: 120 }, push: { particles_nb: 2 } }
    },
    retina_detect: true
  });
});
