import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getFirestore,
  doc,
  onSnapshot,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- PEGA AQUÍ TU MISMA CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
};
// -----------------------------------------

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentGameData = null; // Variable para mantener el estado actual

const uiGame = {
  loadingState: document.getElementById("loading-state"),
  gameState: document.getElementById("game-state"),
  currentCardContainer: document.getElementById("current-card-container"),
  deckCountSpan: document.getElementById("deck-count"),
  boardsContainer: document.getElementById("boards-container"),
  callCardBtn: document.getElementById("call-card-btn"),
  winnerModal: document.getElementById("winner-modal"),
  winnerName: document.getElementById("winner-name"),
  winningBoard: document.getElementById("winning-board"),

  renderGame(gameData) {
    this.loadingState.classList.add("hidden");
    this.gameState.classList.remove("hidden");

    // Renderizar carta actual
    const calledCards = gameData.calledCards || [];
    const currentCard =
      calledCards.length > 0 ? calledCards[calledCards.length - 1] : null;
    if (currentCard) {
      this.currentCardContainer.innerHTML = `<img src="assets/images/${currentCard.img}" alt="${currentCard.name}" class="card-image">`;
    }
    this.deckCountSpan.textContent = gameData.deck.length;

    // Renderizar cartillas
    this.boardsContainer.innerHTML = "";
    gameData.players.forEach((player) => {
      const boardEl = document.createElement("div");
      boardEl.className =
        "bg-white p-4 rounded-xl shadow-lg border border-gray-200";
      let cardsHtml = "";
      player.board.cards.forEach((card) => {
        const isMarked = calledCards.some((cc) => cc.id === card.id);
        cardsHtml += `<div class="relative"><img src="assets/images/${
          card.img
        }" class="card-image ${isMarked ? "marked" : ""}"></div>`;
      });
      boardEl.innerHTML = `
                <h3 class="text-xl font-bold text-center mb-4 text-amber-700">${player.name}</h3>
                <div class="grid gap-2" style="grid-template-columns: repeat(${gameData.config.cols}, 1fr)">
                    ${cardsHtml}
                </div>`;
      this.boardsContainer.appendChild(boardEl);
    });

    // Controlar botón de admin
    this.callCardBtn.disabled = gameData.winner || gameData.deck.length === 0;

    // Mostrar ganador si existe
    if (gameData.winner) {
      this.winnerName.textContent = gameData.winner.name;
      this.winningBoard.innerHTML = "";
      this.winningBoard.style.gridTemplateColumns = `repeat(${gameData.config.cols}, 1fr)`;
      gameData.winner.board.cards.forEach((card) => {
        this.winningBoard.innerHTML += `<img src="assets/images/${card.img}" class="card-image marked">`;
      });
      this.winnerModal.classList.remove("hidden");
    }
  },

  initAdminControls(gameId) {
    this.callCardBtn.classList.remove("hidden");
    this.callCardBtn.addEventListener("click", async () => {
      if (!currentGameData || currentGameData.deck.length === 0) return;

      const updatedDeck = [...currentGameData.deck];
      const nextCard = updatedDeck.pop();
      const updatedCalledCards = [...currentGameData.calledCards, nextCard];

      // Chequear si hay ganador
      let winner = null;
      for (const player of currentGameData.players) {
        const markedCount = player.board.cards.filter((c) =>
          updatedCalledCards.some((cc) => cc.id === c.id)
        ).length;
        if (markedCount === player.board.cards.length) {
          winner = player;
          break;
        }
      }

      const gameRef = doc(db, "games", gameId);
      await updateDoc(gameRef, {
        deck: updatedDeck,
        calledCards: updatedCalledCards,
        winner: winner,
      });
    });
  },
};

// Punto de entrada
const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");
const isAdmin = params.get("admin") === "true";

if (!gameId) {
  document.body.innerHTML =
    '<h1 class="title text-center mt-10">Error: No se encontró el ID de la partida.</h1>';
} else {
  if (isAdmin) {
    uiGame.initAdminControls(gameId);
  }
  const gameRef = doc(db, "games", gameId);
  onSnapshot(gameRef, (doc) => {
    if (doc.exists()) {
      currentGameData = doc.data();
      uiGame.renderGame(currentGameData);
    } else {
      document.body.innerHTML =
        '<h1 class="title text-center mt-10">Error: La partida no existe.</h1>';
    }
  });
}
