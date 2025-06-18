import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- TU CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDFn4Dntx2GbWTL9r6S0AlKDYCNfs8x22s",
  authDomain: "loteria-digital.firebaseapp.com",
  projectId: "loteria-digital",
  storageBucket: "loteria-digital.appspot.com",
  messagingSenderId: "274858696939",
  appId: "1:274858696939:web:39925a407bd7aa54665eae",
  measurementId: "G-790JYFXNQ2",
};
// ------------------------------------

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para configurar el enlace de juego dinámico
async function setupPlayLink() {
  const playLink = document.getElementById("play-link");
  if (!playLink) return;

  const defaultUrl = playLink.href; // Guarda la URL por defecto: "./juego.html"
  let targetUrl = defaultUrl;

  try {
    const settingsRef = doc(db, "app_config", "settings");
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists() && settingsSnap.data().mainGameId) {
      const mainGameId = settingsSnap.data().mainGameId;
      // Si existe un juego principal, construye la URL completa
      targetUrl = `./juego.html?id=${mainGameId}`;
    }
    // Si no existe, targetUrl permanece como la URL por defecto
  } catch (error) {
    console.error(
      "Error al obtener la partida principal, se usará el enlace por defecto.",
      error
    );
    targetUrl = defaultUrl;
  } finally {
    // Asigna la URL final al enlace y añade un listener para asegurar la navegación
    playLink.href = targetUrl;
    playLink.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = playLink.href; // Usa el href ya actualizado
    });
  }
}

// Lógica del Carrusel (sin cambios)
function setupCarousel() {
  // ... (todo el código del carrusel va aquí, no necesita cambios)
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
    if (slides.length === 0) return;
    let nextIndex = (currentIndex + 1) % slides.length;
    moveToSlide(nextIndex);
  }

  function startAutoPlay() {
    stopAutoPlay();
    intervalId = setInterval(autoPlay, 3000);
  }

  function stopAutoPlay() {
    clearInterval(intervalId);
  }

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

  window.addEventListener("resize", () => {
    track.style.transition = "none";
    moveToSlide(currentIndex);
    track.offsetHeight;
    track.style.transition = "transform 0.8s ease-in-out";
  });

  if (carousel) {
    carousel.addEventListener("mouseenter", stopAutoPlay);
    carousel.addEventListener("mouseleave", startAutoPlay);
    carousel.addEventListener("focusin", stopAutoPlay);
    carousel.addEventListener("focusout", startAutoPlay);
  }

  if (slides.length > 0) {
    moveToSlide(0);
    startAutoPlay();
  }
}

// Ejecutar todo cuando la página cargue
document.addEventListener("DOMContentLoaded", function () {
  setupPlayLink();
  setupCarousel();
});
