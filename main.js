// main.js - El Orquestador de la Aplicación

//============================================
// CORE LOGIC (La lógica pura del juego)
//============================================
const gameLogic = {
  fullDeck: [
    { id: 1, name: "El Gallo", img: "El Gallo.jpg" },
    { id: 2, name: "El Diablito", img: "El Diablito.jpg" },
    { id: 3, name: "La Dama", img: "La Dama.jpg" },
    { id: 4, name: "El Catrin", img: "El Catrin.jpg" },
    { id: 5, name: "El Paraguas", img: "El Paraguas.jpg" },
    { id: 6, name: "La Sirena", img: "La Sirena.jpg" },
    { id: 7, name: "La Escalera", img: "La Escalera.jpg" },
    { id: 8, name: "La Botella", img: "La Botella.jpg" },
    { id: 9, name: "El Barril", img: "El Barril.jpg" },
    { id: 10, name: "El Arbol", img: "El Arbol.jpg" },
    { id: 11, name: "El Melon", img: "El Melon.jpg" },
    { id: 12, name: "El Valiente", img: "El Valiente.jpg" },
    { id: 13, name: "El Gorrito", img: "El Gorrito.jpg" },
    { id: 14, name: "La Muerte", img: "La Muerte.jpg" },
    { id: 15, name: "La Pera", img: "La Pera.jpg" },
    { id: 16, name: "La Bandera", img: "La Bandera.jpg" },
    { id: 17, name: "El Bandolon", img: "El Bandolon.jpg" },
    { id: 18, name: "El Violoncello", img: "El Violoncello.jpg" },
    { id: 19, name: "La Garza", img: "La Garza.jpg" },
    { id: 20, name: "El Pajaro", img: "El Pajaro.jpg" },
    { id: 21, name: "La Mano", img: "La Mano.jpg" },
    { id: 22, name: "La Bota", img: "La Bota.jpg" },
    { id: 23, name: "La Luna", img: "La Luna.jpg" },
    { id: 24, name: "El Cotorro", img: "El Cotorro.jpg" },
    { id: 25, name: "El Borracho", img: "El Borracho.jpg" },
    { id: 26, name: "El Negrito", img: "El Negrito.jpg" },
    { id: 27, name: "El Corazon", img: "El Corazon.jpg" },
    { id: 28, name: "La Sandia", img: "La Sandia.jpg" },
    { id: 29, name: "El Tambor", img: "El Tambor.jpg" },
    { id: 30, name: "El Camaron", img: "El Camaron.jpg" },
    { id: 31, name: "Las Jaras", img: "Las Jaras.jpg" },
    { id: 32, name: "El Musico", img: "El Musico.jpg" },
    { id: 33, name: "La Araña", img: "La Arana.jpg" },
    { id: 34, name: "El Soldado", img: "El Soldado.jpg" },
    { id: 35, name: "La Estrella", img: "La Estrella.jpg" },
    { id: 36, name: "El Cazo", img: "El Cazo.jpg" },
    { id: 37, name: "El Mundo", img: "El Mundo.jpg" },
    { id: 38, name: "El Apache", img: "El Apache.jpg" },
    { id: 39, name: "El Nopal", img: "El Nopal.jpg" },
    { id: 40, name: "El Alacran", img: "El Alacran.jpg" },
    { id: 41, name: "La Rosa", img: "La Rosa.jpg" },
    { id: 42, name: "La Calavera", img: "La Calavera.jpg" },
    { id: 43, name: "La Campana", img: "La Campana.jpg" },
    { id: 44, name: "El Cantarito", img: "El Cantarito.jpg" },
    { id: 45, name: "El Venado", img: "El Venado.jpg" },
    { id: 46, name: "El Sol", img: "El Sol.jpg" },
    { id: 47, name: "La Corona", img: "La Corona.jpg" },
    { id: 48, name: "La Chalupa", img: "La Chalupa.jpg" },
    { id: 49, name: "El Pino", img: "El Pino.jpg" },
    { id: 50, name: "El Pescado", img: "El Pescado.jpg" },
    { id: 51, name: "La Palma", img: "La Palma.jpg" },
    { id: 52, name: "La Maceta", img: "La Maceta.jpg" },
    { id: 53, name: "El Arpa", img: "El Arpa.jpg" },
    { id: 54, name: "La Rana", img: "La Rana.jpg" },
  ],

  shuffleDeck(deck) {
    let shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  generateUniqueBoard(shuffledDeck) {
    return shuffledDeck.slice(0, 4);
  },

  generatePlayerBoards(playerCount) {
    const boards = [];
    const usedBoardSignatures = new Set();
    while (boards.length < playerCount) {
      const deckCopy = this.shuffleDeck([...this.fullDeck]);
      const newBoardCards = this.generateUniqueBoard(deckCopy);
      const signature = newBoardCards
        .map((c) => c.id)
        .sort((a, b) => a - b)
        .join(",");
      if (!usedBoardSignatures.has(signature)) {
        usedBoardSignatures.add(signature);
        boards.push({ cards: newBoardCards, marked: new Set() });
      }
    }
    return boards;
  },

  checkForWinner(board) {
    return board.marked.size === 4;
  },
};

//============================================
// UI LOGIC (Manejo del DOM)
//============================================
const ui = {
  // Selectores de elementos
  setupView: document.getElementById("setup-view"),
  gameView: document.getElementById("game-view"),
  winnerModal: document.getElementById("winner-modal"),
  winnerModalContent: document.getElementById("winner-modal-content"),
  singleBoardModal: document.getElementById("single-board-modal"),
  singleBoardModalContent: document.getElementById(
    "single-board-modal-content"
  ),
  playerCountInput: document.getElementById("player-count"),
  generateNamesBtn: document.getElementById("generate-names-btn"),
  playerNamesContainer: document.getElementById("player-names-container"),
  startGameBtn: document.getElementById("start-game-btn"),
  boardsContainer: document.getElementById("boards-container"),
  currentCardContainer: document.getElementById("current-card-container"),
  deckCountSpan: document.getElementById("deck-count"),
  callCardBtn: document.getElementById("call-card-btn"),
  winnerName: document.getElementById("winner-name"),
  winningBoardContainer: document.getElementById("winning-board"),
  restartGameBtn: document.getElementById("restart-game-btn"),
  singleBoardPlayerName: document.getElementById("single-board-player-name"),
  singleBoardDisplay: document.getElementById("single-board-display"),
  closeSingleBoardBtn: document.getElementById("close-single-board-btn"),

  // Métodos para manipular la UI
  renderPlayerNameInputs(count) {
    this.playerNamesContainer.innerHTML = "";
    let inputsHTML =
      '<h3 class="text-lg font-semibold mb-3 text-gray-700">Nombres de los Jugadores:</h3>';
    for (let i = 0; i < count; i++) {
      inputsHTML += `
                <div class="mb-3">
                    <label for="player-name-${i}" class="sr-only">Nombre Jugador ${
        i + 1
      }</label>
                    <input type="text" id="player-name-${i}" class="w-full p-3 border border-gray-300 rounded-lg" placeholder="Nombre Jugador ${
        i + 1
      }" value="Jugador ${i + 1}">
                </div>`;
    }
    this.playerNamesContainer.innerHTML = inputsHTML;
    this.startGameBtn.classList.remove("hidden");
  },

  renderBoard(player, index) {
    const boardElement = document.createElement("div");
    boardElement.className =
      "bg-white p-4 rounded-xl shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl hover:border-amber-500 transition";
    boardElement.dataset.playerIndex = index;
    boardElement.innerHTML = `<h3 class="text-xl font-bold text-center mb-4 text-amber-700 pointer-events-none">${player.name}</h3>`;

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-2 gap-2 pointer-events-none";

    player.board.cards.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.className = "aspect-w-1 aspect-h-1 relative";
      cardElement.innerHTML = `
                <div id="card-${index}-${card.id}" class="relative w-full h-full rounded-lg bg-gray-200">
                   <img src="assets/images/${card.img}" alt="${card.name}" class="card-image">
                </div>`;
      grid.appendChild(cardElement);
    });

    boardElement.appendChild(grid);
    this.boardsContainer.appendChild(boardElement);
  },

  renderCurrentCard(card) {
    if (card) {
      this.currentCardContainer.innerHTML = `
            <div class="w-full h-full p-2 relative card">
                <img src="assets/images/${card.img}" alt="${card.name}" class="card-image">
                <p class="absolute bottom-2 left-2 right-2 text-center bg-black bg-opacity-50 text-white text-sm font-bold p-1 rounded-b-lg">${card.name}</p>
            </div>`;
    } else {
      this.currentCardContainer.innerHTML = `<span class="text-gray-500">¡Se acabó el mazo!</span>`;
    }
  },

  updateDeckCount(count) {
    this.deckCountSpan.textContent = count;
  },

  markCardOnBoard(boardIndex, cardId) {
    const cardCell = document.getElementById(`card-${boardIndex}-${cardId}`);
    if (cardCell) cardCell.classList.add("marked");
  },

  toggleModal(modal, content, show) {
    if (show) {
      modal.classList.remove("hidden");
      setTimeout(() => {
        content.classList.remove("scale-95", "opacity-0");
        content.classList.add("scale-100", "opacity-100");
      }, 10);
    } else {
      content.classList.remove("scale-100", "opacity-100");
      content.classList.add("scale-95", "opacity-0");
      setTimeout(() => modal.classList.add("hidden"), 200);
    }
  },

  showWinner(player) {
    this.winnerName.textContent = player.name;
    this.winningBoardContainer.innerHTML = "";
    player.board.cards.forEach((card) => {
      this.winningBoardContainer.innerHTML += `
                <div class="aspect-w-1 aspect-h-1 relative">
                    <img src="assets/images/${card.img}" alt="${card.name}" class="card-image marked">
                </div>`;
    });
    this.toggleModal(this.winnerModal, this.winnerModalContent, true);
  },

  showSingleBoard(player) {
    this.singleBoardPlayerName.textContent = player.name;
    this.singleBoardDisplay.innerHTML = "";
    player.board.cards.forEach((card) => {
      const isMarked = player.board.marked.has(card.id);
      this.singleBoardDisplay.innerHTML += `
                <div class="aspect-w-1 aspect-h-1 relative">
                     <div class="relative w-full h-full rounded-lg bg-gray-200 ${
                       isMarked ? "marked" : ""
                     }">
                        <img src="assets/images/${card.img}" alt="${
        card.name
      }" class="card-image">
                    </div>
                </div>`;
    });
    this.toggleModal(this.singleBoardModal, this.singleBoardModalContent, true);
  },

  resetUI() {
    this.boardsContainer.innerHTML = "";
    this.renderCurrentCard(null);
    this.currentCardContainer.innerHTML = `<span class="text-gray-500">Esperando para empezar...</span>`;
    this.toggleModal(this.winnerModal, this.winnerModalContent, false);
    this.toggleModal(
      this.singleBoardModal,
      this.singleBoardModalContent,
      false
    );
    this.callCardBtn.disabled = false;
    this.callCardBtn.classList.remove("opacity-50", "cursor-not-allowed");
    this.setupView.classList.remove("hidden");
    this.gameView.classList.add("hidden");
  },
};

//============================================
// APP CONTROLLER (Estado y Eventos)
//============================================
const app = {
  state: {
    players: [],
    deck: [],
    calledCards: new Set(),
    winnerFound: false,
  },

  init() {
    // Event Listeners
    ui.generateNamesBtn.addEventListener("click", () => {
      const count = parseInt(ui.playerCountInput.value, 10);
      if (count > 0 && count <= 10) ui.renderPlayerNameInputs(count);
    });

    ui.startGameBtn.addEventListener("click", () => this.startGame());
    ui.callCardBtn.addEventListener("click", () => this.callNextCard());
    ui.restartGameBtn.addEventListener("click", () => this.resetGame());
    ui.closeSingleBoardBtn.addEventListener("click", () =>
      ui.toggleModal(ui.singleBoardModal, ui.singleBoardModalContent, false)
    );

    ui.boardsContainer.addEventListener("click", (e) => {
      const boardElement = e.target.closest("[data-player-index]");
      if (boardElement && !this.state.winnerFound) {
        const playerIndex = boardElement.dataset.playerIndex;
        const player = this.state.players[playerIndex];
        ui.showSingleBoard(player);
      }
    });
  },

  startGame() {
    const playerCount = parseInt(ui.playerCountInput.value, 10);
    const names = [];
    for (let i = 0; i < playerCount; i++) {
      names.push(
        document.getElementById(`player-name-${i}`).value || `Jugador ${i + 1}`
      );
    }

    const boards = gameLogic.generatePlayerBoards(playerCount);
    this.state.players = names.map((name, index) => ({
      name,
      board: boards[index],
    }));
    this.state.deck = gameLogic.shuffleDeck([...gameLogic.fullDeck]);
    this.state.calledCards = new Set();
    this.state.winnerFound = false;

    ui.boardsContainer.innerHTML = "";
    this.state.players.forEach((player, index) =>
      ui.renderBoard(player, index)
    );
    ui.setupView.classList.add("hidden");
    ui.gameView.classList.remove("hidden");
    ui.updateDeckCount(this.state.deck.length);
  },

  callNextCard() {
    if (this.state.winnerFound || this.state.deck.length === 0) return;

    const card = this.state.deck.pop();
    this.state.calledCards.add(card.id);

    ui.renderCurrentCard(card);
    ui.updateDeckCount(this.state.deck.length);
    this.updateBoards(card);
    this.checkAllForWinner();
  },

  updateBoards(calledCard) {
    this.state.players.forEach((player, playerIndex) => {
      player.board.cards.forEach((cardOnBoard) => {
        if (cardOnBoard.id === calledCard.id) {
          player.board.marked.add(calledCard.id);
          ui.markCardOnBoard(playerIndex, calledCard.id);
        }
      });
    });
  },

  checkAllForWinner() {
    if (this.state.winnerFound) return;
    for (const player of this.state.players) {
      if (gameLogic.checkForWinner(player.board)) {
        this.state.winnerFound = true;
        ui.showWinner(player);
        ui.callCardBtn.disabled = true;
        ui.callCardBtn.classList.add("opacity-50", "cursor-not-allowed");
        break;
      }
    }
  },

  resetGame() {
    this.state = {
      players: [],
      deck: [],
      calledCards: new Set(),
      winnerFound: false,
    };
    ui.resetUI();
  },
};

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  app.init();
});
