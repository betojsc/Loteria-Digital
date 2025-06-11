// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getFirestore,
  doc,
  onSnapshot,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

let currentGameData = null;

const uiGame = {
  placeholderView: document.getElementById("placeholder-view"),
  gameState: document.getElementById("game-state"),
  currentCardContainer: document.getElementById("current-card-container"),
  deckCountSpan: document.getElementById("deck-count"),
  boardsContainer: document.getElementById("boards-container"),
  callCardBtn: document.getElementById("call-card-btn"),
  winnerModal: document.getElementById("winner-modal"),
  winnerName: document.getElementById("winner-name"),
  winningBoard: document.getElementById("winning-board"),

  renderGame(gameData) {
    this.placeholderView.classList.add("hidden");
    this.gameState.classList.remove("hidden");

    const calledCards = gameData.calledCards || [];
    const currentCard =
      calledCards.length > 0 ? calledCards[calledCards.length - 1] : null;
    if (currentCard) {
      this.currentCardContainer.innerHTML = `<img src="assets/images/${currentCard.img}" alt="${currentCard.name}" class="card-image">`;
    } else {
      this.currentCardContainer.innerHTML = `<span class="text-gray-500">Esperando...</span>`;
    }
    this.deckCountSpan.textContent = gameData.deck.length;

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

    this.callCardBtn.disabled = gameData.winner || gameData.deck.length === 0;

    if (gameData.winner) {
      this.winnerName.textContent = gameData.winner.name;
      this.winningBoard.innerHTML = "";
      this.winningBoard.style.gridTemplateColumns = `repeat(${gameData.config.cols}, 1fr)`;
      gameData.winner.board.cards.forEach((card) => {
        this.winningBoard.innerHTML += `<img src="assets/images/${card.img}" class="card-image marked">`;
      });
      this.winnerModal.classList.remove("hidden");
    } else {
      this.winnerModal.classList.add("hidden");
    }
  },

  showPlaceholder() {
    this.placeholderView.classList.remove("hidden");
    this.gameState.classList.add("hidden");
  },

  initAdminControls(gameId) {
    this.callCardBtn.classList.remove("hidden");
    this.callCardBtn.addEventListener("click", async () => {
      if (
        !currentGameData ||
        currentGameData.deck.length === 0 ||
        currentGameData.winner
      )
        return;

      const updatedDeck = [...currentGameData.deck];
      const nextCard = updatedDeck.pop();
      const updatedCalledCards = [...currentGameData.calledCards, nextCard];

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

const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");
const isAdmin = params.get("admin") === "true";

if (!gameId) {
  uiGame.showPlaceholder();
} else {
  if (isAdmin) {
    uiGame.initAdminControls(gameId);
  }
  const gameRef = doc(db, "games", gameId);
  onSnapshot(
    gameRef,
    (doc) => {
      if (doc.exists()) {
        currentGameData = doc.data();
        uiGame.renderGame(currentGameData);
      } else {
        uiGame.showPlaceholder();
      }
    },
    (error) => {
      console.error("Error al obtener la partida:", error);
      uiGame.showPlaceholder();
    }
  );
}
