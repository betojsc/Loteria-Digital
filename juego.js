import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getFirestore,
  doc,
  onSnapshot,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDFn4Dntx2GbWTL9r6S0AlKDYCNfs8x22s",
  authDomain: "loteria-digital.firebaseapp.com",
  projectId: "loteria-digital",
  storageBucket: "loteria-digital.appspot.com",
  messagingSenderId: "274858696939",
  appId: "1:274858696939:web:39925a407bd7aa54665eae",
  measurementId: "G-790JYFXNQ2",
};
// -----------------------------------------

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentGameData = null;
let focusedPlayerIndex = null;

const uiGame = {
  loadingView: document.getElementById("loading-view"),
  placeholderView: document.getElementById("placeholder-view"),
  gameContainer: document.getElementById("game-container"),
  boardsOverview: document.getElementById("boards-overview"),
  boardsContainer: document.getElementById("boards-container"),
  mobileFocusView: document.getElementById("mobile-focus-view"),
  focusedBoardContainer: document.getElementById("focused-board-container"),
  showAllBoardsBtn: document.getElementById("show-all-boards-btn"),
  currentCardContainer: document.getElementById("current-card-container"),
  currentCardName: document.getElementById("card-title"),
  deckCountSpan: document.getElementById("deck-count"),
  callCardBtn: document.getElementById("call-card-btn"),
  winnerModal: document.getElementById("winner-modal"),
  winnerName: document.getElementById("winner-name"),
  winningBoard: document.getElementById("winning-board"),
  cantorSection: document.getElementById("cantor-section"),

  init() {
    this.showAllBoardsBtn.addEventListener("click", () => this.showAllBoards());
    this.boardsContainer.addEventListener("click", (e) => {
      const boardEl = e.target.closest("[data-player-index]");
      if (boardEl) {
        this.focusOnBoard(parseInt(boardEl.dataset.playerIndex, 10));
      }
    });
  },

  renderGame(gameData) {
    this.loadingView.classList.add("hidden");
    this.placeholderView.classList.add("hidden");
    this.gameContainer.classList.remove("hidden");

    const calledCards = gameData.calledCards || [];
    const currentCard =
      calledCards.length > 0 ? calledCards[calledCards.length - 1] : null;
    if (currentCard) {
      this.currentCardContainer.innerHTML = `<img src="assets/images/${currentCard.img}" alt="${currentCard.name}" class="card-image">`;
      this.currentCardName.textContent = currentCard.name;
    } else {
      this.currentCardContainer.innerHTML = `<span class="text-xs md:text-base text-gray-500 text-center">Esperando...</span>`;
    }
    this.deckCountSpan.textContent = gameData.deck.length;
    this.callCardBtn.disabled = gameData.winner || gameData.deck.length === 0;

    if (focusedPlayerIndex !== null) {
      this.boardsOverview.classList.add("hidden");
      this.mobileFocusView.classList.remove("hidden");
      this.renderFocusedBoard(gameData.players[focusedPlayerIndex], gameData);
    } else {
      this.boardsOverview.classList.remove("hidden");
      this.mobileFocusView.classList.add("hidden");
      this.renderAllBoards(gameData);
    }

    if (gameData.winner && !this.winnerModal.classList.contains("active")) {
      this.showWinner(gameData);
    } else if (!gameData.winner) {
      this.winnerModal.classList.add("hidden");
      this.winnerModal.classList.remove("active");
    }
  },

  renderAllBoards(gameData) {
    this.boardsContainer.innerHTML = "";
    gameData.players.forEach((player, index) => {
      const boardEl = this.createBoardElement(
        player,
        gameData.config,
        gameData.calledCards
      );
      boardEl.dataset.playerIndex = index;
      boardEl.classList.add("cursor-pointer");
      this.boardsContainer.appendChild(boardEl);
    });
  },

  renderFocusedBoard(player, gameData) {
    this.focusedBoardContainer.innerHTML = "";
    const boardEl = this.createBoardElement(
      player,
      gameData.config,
      gameData.calledCards
    );
    this.focusedBoardContainer.appendChild(boardEl);
  },

  createBoardElement(player, config, calledCards) {
    const boardEl = document.createElement("div");
    boardEl.className =
      "bg-white p-4 rounded-xl shadow-lg border border-gray-200 mx-auto max-w-xs";
    let cardsHtml = "";
    player.board.cards.forEach((card) => {
      const isMarked = calledCards.some((cc) => cc.id === card.id);
      cardsHtml += `<div class="relative ${
        isMarked ? "marked" : ""
      }"><img src="assets/images/${card.img}" alt="${
        card.name
      }" class="card-image"></div>`;
    });
    boardEl.innerHTML = `
      <h3 class="text-xl font-bold text-center mb-4 text-amber-700">${player.name}</h3>
      <div class="grid gap-2" style="grid-template-columns: repeat(${config.cols}, 1fr)">
        ${cardsHtml}
      </div>`;
    return boardEl;
  },

  focusOnBoard(index) {
    focusedPlayerIndex = index;
    this.renderGame(currentGameData);
  },

  showAllBoards() {
    focusedPlayerIndex = null;
    this.renderGame(currentGameData);
  },

  showWinner(gameData) {
    this.winnerName.textContent = gameData.winner.name;
    this.winningBoard.innerHTML = "";
    this.winningBoard.style.gridTemplateColumns = `repeat(${gameData.config.cols}, 1fr)`;
    gameData.winner.board.cards.forEach((card) => {
      this.winningBoard.innerHTML += `<div class="relative marked"><img src="assets/images/${card.img}" class="card-image"></div>`;
    });
    this.winnerModal.classList.remove("hidden");
    this.winnerModal.classList.add("active");
    this.cantorSection.classList.add("hidden");
    this.launchConfetti();
  },

  launchConfetti() {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  },

  showPlaceholder() {
    this.loadingView.classList.add("hidden");
    this.placeholderView.classList.remove("hidden");
    this.gameContainer.classList.add("hidden");
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

function main() {
  const params = new URLSearchParams(window.location.search);
  const gameId = params.get("id");
  const token = params.get("token");

  if (!gameId) {
    uiGame.showPlaceholder();
    return;
  }

  const gameRef = doc(db, "games", gameId);

  onSnapshot(
    gameRef,
    (doc) => {
      if (doc.exists()) {
        currentGameData = doc.data();
        if (
          token &&
          currentGameData.config &&
          token === currentGameData.config.adminToken
        ) {
          uiGame.initAdminControls(gameId);
        }
        uiGame.renderGame(currentGameData);
        uiGame.init();
      } else {
        uiGame.showPlaceholder();
      }
    },
    (error) => {
      console.error("Error al obtener datos de la partida:", error);
      uiGame.showPlaceholder();
    }
  );
}

uiGame.init();
main();
