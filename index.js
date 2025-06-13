document.addEventListener("DOMContentLoaded", function () {
  const track = document.querySelector(".carousel-track");
  if (!track) return;

  const slides = Array.from(track.children);
  const dotsContainer = document.getElementById("dots-container");
  const carousel = document.getElementById("carousel");

  let currentIndex = 0;
  let intervalId = null;

  function moveToSlide(targetIndex) {
    if (slides.length === 0) return;
    const slideWidth = slides[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${slideWidth * targetIndex}px)`;
    currentIndex = targetIndex;
    updateDots();
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = Array.from(dotsContainer.children);
    if (dots.length === 0) return;
    dots.forEach((dot, index) => {
      dot.classList.toggle("bg-white", index === currentIndex);
      dot.classList.toggle("bg-white/50", index !== currentIndex);
    });
  }

  function autoPlay() {
    let nextIndex = (currentIndex + 1) % slides.length;
    moveToSlide(nextIndex);
  }

  function startAutoPlay() {
    stopAutoPlay(); // Evita múltiples intervalos
    intervalId = setInterval(autoPlay, 3000);
  }

  function stopAutoPlay() {
    clearInterval(intervalId);
  }

  // Crear puntos de navegación
  if (dotsContainer) {
    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", `Ir a la diapositiva ${index + 1}`);
      dot.classList.add(
        "w-3",
        "h-3",
        "rounded-full",
        "bg-white/50",
        "hover:bg-white",
        "transition"
      );
      dotsContainer.appendChild(dot);
      dot.addEventListener("click", () => {
        moveToSlide(index);
      });
    });
  }

  // Reajustar en cambio de tamaño de ventana
  window.addEventListener("resize", () => {
    track.style.transition = "none";
    moveToSlide(currentIndex);
    track.offsetHeight; // Forzar un reflow
    track.style.transition = "transform 0.8s ease-in-out";
  });

  // Pausar al pasar el mouse sobre el carrusel
  if (carousel) {
    carousel.addEventListener("mouseenter", stopAutoPlay);
    carousel.addEventListener("mouseleave", startAutoPlay);
    carousel.addEventListener("focusin", stopAutoPlay);
    carousel.addEventListener("focusout", startAutoPlay);
  }

  // Iniciar
  if (slides.length > 0) {
    moveToSlide(0);
    startAutoPlay();
  }
});
