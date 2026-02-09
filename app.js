document.addEventListener("DOMContentLoaded", () => {
  if (!window.particlesJS) {
    console.error("particlesJS not loaded");
    return;
  }

// Particles.js config
particlesJS("particles-js", {
  particles: {
    number: { value: 80, density: { enable: true, value_area: 900 } },
    color: { value: "#ffffff" },
    shape: { type: "circle" },
    opacity: { value: 0.35, random: true },
    size: { value: 2.5, random: true },
    line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.15, width: 1 },
    move: { enable: true, speed: 1.2, direction: "none", random: false, straight: false, out_mode: "out" }
  },

  interactivity: {
    // KEY: makes it work even if other elements sit above the canvas
    detect_on: "window",

    events: {
      onhover: { enable: true, mode: "repulse" },   // particles react to mouse move
      onclick: { enable: true, mode: "push" },      // click spawns more particles
      resize: true
    },
    modes: {
      repulse: { distance: 120, duration: 0.4 },
      push: { particles_nb: 6 }
    }
  },

  retina_detect: true
});

