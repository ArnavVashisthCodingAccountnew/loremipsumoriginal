const tl = gsap.timeline({ defaults: { duration: 1 } });

document.addEventListener("DOMContentLoaded", () => {
    tl.from('.container', { opacity: 0, y: 50 })
      .from('.tool-title', { y: -50, opacity: 0 }, '-=0.5')
      .from('.wireframe', { x: -100, scale: 0.5, ease: "bounce.out" })
      .to('.wireframe', { display: 'none' }) // Hide wireframe after morph
      .to('.code-snippet', { display: 'block', opacity: 1 }, '-=0.5')
      .from('.device-icons', { scale: 0, stagger: 0.2, opacity: 0 })
      .to('.focus-text', { duration: 1, opacity: 1 })
      .to('.cta-button', { display: 'inline-block', opacity: 1, scale: 1.1, repeat: -1, yoyo: true, duration: 0.5 });
});
