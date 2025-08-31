import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getFirestore,
  doc,
  onSnapshot,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDFn4Dntx2GbWTL9r6S0AlKDYCNfs8x22s",
  authDomain: "loteria-digital.firebaseapp.com",
  projectId: "loteria-digital",
  storageBucket: "loteria-digital.appspot.com",
  messagingSenderId: "274858696939",
  appId: "1:274858696939:web:39925a407bd7aa54665eae",
  measurementId: "G-790JYFXNQ2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentGameData = null;
let focusedPlayerIndex = null;
let isAdmin = false;

const uiGame = {
  loadingView: document.getElementById("loading-view"),
  placeholderView: document.getElementById("placeholder-view"),
  mainContent: document.getElementById("main-content"),
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
  winnersPodium: document.getElementById("winners-podium"),
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
    this.gameContainer.classList.remove("hidden");
    this.cantorSection.classList.remove("hidden");
    this.boardsOverview.classList.remove("hidden");
    this.placeholderView.classList.add("hidden");

    // --- CAMBIO: Se eliminan las clases de centrado cuando se muestra el juego ---
    this.mainContent.classList.remove(
      "flex",
      "flex-col",
      "justify-center",
      "items-center"
    );

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

    const maxWinners = gameData.config.winnerCount || 1;
    const isGameOver =
      gameData.winners.length >= maxWinners || gameData.deck.length === 0;

    if (isAdmin) {
      this.callCardBtn.disabled = isGameOver;
    }

    if (focusedPlayerIndex !== null) {
      this.boardsOverview.classList.add("hidden");
      this.mobileFocusView.classList.remove("hidden");
      this.renderFocusedBoard(gameData.players[focusedPlayerIndex], gameData);
    } else {
      this.boardsOverview.classList.remove("hidden");
      this.mobileFocusView.classList.add("hidden");
      this.renderAllBoards(gameData);
    }

    if (isGameOver && !this.winnerModal.classList.contains("active")) {
      this.showWinnersPodium(gameData);
    }
  },

  getPlaceSuffix(place) {
    const suffixes = ["er", "do", "er"];
    return `${place}${suffixes[place - 1] || "to"}`;
  },

  createBoardElement(player, config, calledCards, winners) {
    const boardEl = document.createElement("div");
    const winnerInfo = winners.find((w) => w.name === player.name);

    boardEl.className =
      "bg-white p-4 rounded-xl shadow-lg border border-gray-200 mx-auto max-w-xs relative";
    let cardsHtml = "";
    player.board.cards.forEach((card) => {
      const isMarked = calledCards.some((cc) => cc.id === card.id);
      cardsHtml += `<div class="relative ${
        isMarked ? "marked" : ""
      }"><img src="assets/images/${card.img}" alt="${
        card.name
      }" class="card-image"></div>`;
    });

    let winnerBadge = "";
    if (winnerInfo) {
      const placeText = this.getPlaceSuffix(winnerInfo.place);
      winnerBadge = `<div class="absolute -top-3 -right-3 bg-amber-400 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg transform rotate-12">${placeText} Lugar</div>`;
    }

    boardEl.innerHTML = `
      ${winnerBadge}
      <h3 class="text-xl font-bold text-center mb-4 text-amber-700">${player.name}</h3>
      <div class="grid gap-2" style="grid-template-columns: repeat(${config.cols}, 1fr)">
        ${cardsHtml}
      </div>`;
    return boardEl;
  },

  renderAllBoards(gameData) {
    this.boardsContainer.innerHTML = "";
    gameData.players.forEach((player, index) => {
      const boardEl = this.createBoardElement(
        player,
        gameData.config,
        gameData.calledCards,
        gameData.winners
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
      gameData.calledCards,
      gameData.winners
    );
    this.focusedBoardContainer.appendChild(boardEl);
  },

  focusOnBoard(index) {
    focusedPlayerIndex = index;
    this.renderGame(currentGameData);
  },

  showAllBoards() {
    focusedPlayerIndex = null;
    this.renderGame(currentGameData);
  },

  showWinnersPodium(gameData) {
    this.winnersPodium.innerHTML = "";
    const medalColors = { 1: "#D4AF37", 2: "#A7A7AD", 3: "#A0522D" };
    gameData.winners.forEach((winner) => {
      const placeText = this.getPlaceSuffix(winner.place);
      const placeColor = medalColors[winner.place] || "#6b7280";
      const podiumEntry = document.createElement("div");
      podiumEntry.className =
        "flex flex-col items-center flex-shrink-0 w-[240px] md:w-auto";
      let cardsHtml = "";
      winner.board.cards.forEach((card) => {
        cardsHtml += `<div class="relative marked"><img src="assets/images/${card.img}" class="card-image"></div>`;
      });
      podiumEntry.innerHTML = `
        <p class="text-xl font-bold" style="color: ${placeColor}">${placeText} Lugar</p>
        <p class="text-2xl font-extrabold my-1" style="color: ${placeColor}">${winner.name}</p>
        <div class="grid gap-1 w-full p-1 bg-amber-50 border-2 rounded-lg" 
             style="grid-template-columns: repeat(${gameData.config.cols}, 1fr); border-color: ${placeColor}">
          ${cardsHtml}
        </div>`;
      this.winnersPodium.appendChild(podiumEntry);
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
    this.gameContainer.classList.remove("hidden");
    this.placeholderView.classList.remove("hidden");
    this.cantorSection.classList.add("hidden");
    this.boardsOverview.classList.add("hidden");

    // --- CAMBIO: Se añaden clases para centrar el contenido ---
    this.mainContent.classList.add(
      "flex",
      "flex-col",
      "justify-center",
      "items-center"
    );
  },

  initAdminControls(gameId) {
    isAdmin = true;
    this.cantorSection.classList.remove("hidden");
    this.callCardBtn.classList.remove("hidden");
    this.callCardBtn.addEventListener("click", async () => {
      if (!currentGameData) return;
      const maxWinners = currentGameData.config.winnerCount || 1;
      const isGameOver =
        currentGameData.winners.length >= maxWinners ||
        currentGameData.deck.length === 0;
      if (isGameOver) return;
      this.callCardBtn.disabled = true;
      const updatedDeck = [...currentGameData.deck];
      const nextCard = updatedDeck.pop();
      const updatedCalledCards = [...currentGameData.calledCards, nextCard];
      let updatedWinners = [...currentGameData.winners];
      for (const player of currentGameData.players) {
        const isAlreadyWinner = updatedWinners.some(
          (w) => w.name === player.name
        );
        if (isAlreadyWinner) continue;
        const markedCount = player.board.cards.filter((c) =>
          updatedCalledCards.some((cc) => cc.id === c.id)
        ).length;
        if (markedCount === player.board.cards.length) {
          updatedWinners.push({ ...player, place: updatedWinners.length + 1 });
        }
      }
      const gameRef = doc(db, "games", gameId);
      await updateDoc(gameRef, {
        deck: updatedDeck,
        calledCards: updatedCalledCards,
        winners: updatedWinners,
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

  uiGame.init();
  const gameRef = doc(db, "games", gameId);

  onSnapshot(
    gameRef,
    (doc) => {
      if (doc.exists()) {
        currentGameData = doc.data();
        if (
          token &&
          currentGameData.config &&
          token === currentGameData.config.adminToken &&
          !isAdmin
        ) {
          uiGame.initAdminControls(gameId);
        }
        uiGame.renderGame(currentGameData);
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

main();
