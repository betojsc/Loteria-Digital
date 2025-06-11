// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFn4Dntx2GbWTL9r6S0AlKDYCNfs8x22s",
  authDomain: "loteria-digital.firebaseapp.com",
  projectId: "loteria-digital",
  storageBucket: "loteria-digital.firebasestorage.app",
  messagingSenderId: "274858696939",
  appId: "1:274858696939:web:39925a407bd7aa54665eae",
  measurementId: "G-790JYFXNQ2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Lógica del juego (adaptada para el admin)
const gameLogic = {
  fullDeck: Array.from({ length: 54 }, (_, i) => ({
    id: i + 1,
    name: `Carta ${i + 1}`,
    img: `${i + 1}.jpg`,
  })),
  shuffleDeck() {
    const shuffled = [...this.fullDeck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },
  generatePlayerBoards(playerCount, rows, cols) {
    const boards = [];
    const usedBoardSignatures = new Set();
    const boardSize = rows * cols;

    while (boards.length < playerCount) {
      const deckCopy = this.shuffleDeck();
      const newBoardCards = deckCopy.slice(0, boardSize);
      const signature = newBoardCards
        .map((c) => c.id)
        .sort((a, b) => a - b)
        .join(",");
      if (!usedBoardSignatures.has(signature)) {
        usedBoardSignatures.add(signature);
        boards.push({ cards: newBoardCards, marked: [] });
      }
    }
    return boards;
  },
};

// Lógica de la UI del admin
const uiAdmin = {
  rowsInput: document.getElementById("rows"),
  colsInput: document.getElementById("cols"),
  totalImagesSpan: document.getElementById("total-images"),
  playerCountInput: document.getElementById("player-count"),
  playerNamesContainer: document.getElementById("player-names-container"),
  createGameBtn: document.getElementById("create-game-btn"),
  gameLinkContainer: document.getElementById("game-link-container"),
  gameLinkInput: document.getElementById("game-link"),
  goToGameBtn: document.getElementById("go-to-game-btn"),

  init() {
    this.rowsInput.addEventListener("input", this.updateTotal);
    this.colsInput.addEventListener("input", this.updateTotal);
    this.playerCountInput.addEventListener(
      "input",
      this.renderPlayerNameInputs
    );
    this.createGameBtn.addEventListener("click", this.createGame);
    this.renderPlayerNameInputs();
  },

  updateTotal() {
    const rows = parseInt(uiAdmin.rowsInput.value, 10);
    const cols = parseInt(uiAdmin.colsInput.value, 10);
    uiAdmin.totalImagesSpan.textContent = rows * cols;
  },

  renderPlayerNameInputs() {
    const count = parseInt(uiAdmin.playerCountInput.value, 10);
    let html = "";
    for (let i = 0; i < count; i++) {
      html += `<input type="text" class="player-name-input w-full p-2 border rounded-lg mt-2" placeholder="Nombre Jugador ${
        i + 1
      }" value="Jugador ${i + 1}">`;
    }
    uiAdmin.playerNamesContainer.innerHTML = html;
  },

  async createGame() {
    uiAdmin.createGameBtn.disabled = true;
    uiAdmin.createGameBtn.textContent = "Creando...";

    const gameId = doc(collection(db, "games")).id; // Genera un ID único
    const rows = parseInt(uiAdmin.rowsInput.value, 10);
    const cols = parseInt(uiAdmin.colsInput.value, 10);
    const nameInputs = document.querySelectorAll(".player-name-input");
    const playerNames = Array.from(nameInputs).map((input) => input.value);

    const boards = gameLogic.generatePlayerBoards(
      playerNames.length,
      rows,
      cols
    );
    const players = playerNames.map((name, index) => ({
      name,
      board: boards[index],
    }));

    const gameData = {
      config: {
        rows,
        cols,
      },
      players,
      deck: gameLogic.shuffleDeck(),
      calledCards: [],
      winner: null,
      createdAt: new Date(),
    };

    try {
      await setDoc(doc(db, "games", gameId), gameData);
      const baseUrl =
        window.location.origin +
        window.location.pathname.replace("admin.html", "");
      const gameUrl = `${baseUrl}juego.html?id=${gameId}`;

      uiAdmin.gameLinkInput.value = gameUrl;
      uiAdmin.goToGameBtn.href = `${gameUrl}&admin=true`;
      uiAdmin.gameLinkContainer.classList.remove("hidden");
      uiAdmin.createGameBtn.textContent = "¡Partida Creada!";
    } catch (error) {
      console.error("Error al crear la partida:", error);
      alert("No se pudo crear la partida. Revisa la consola.");
      uiAdmin.createGameBtn.disabled = false;
      uiAdmin.createGameBtn.textContent = "Crear Partida y Obtener Enlace";
    }
  },
};

uiAdmin.init();
// Helper para Firestore 9+
function collection(db, path) {
  const { collection: col } = import(
    "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js"
  );
  return col(db, path);
}
