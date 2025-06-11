// main.js - El Orquestador de la Aplicación

//============================================
// CORE LOGIC (La lógica pura del juego)
//============================================
const gameLogic = {
  fullDeck: [
    { id: 1, name: "El Gallo" },
    { id: 2, name: "El Diablo" },
    { id: 3, name: "La Dama" },
    { id: 4, name: "El Catrín" },
    { id: 5, name: "El Paraguas" },
    { id: 6, name: "La Sirena" },
    { id: 7, name: "La Escalera" },
    { id: 8, name: "La Botella" },
    { id: 9, name: "El Barril" },
    { id: 10, name: "El Árbol" },
    { id: 11, name: "El Melón" },
    { id: 12, name: "El Valiente" },
    { id: 13, name: "El Gorrito" },
    { id: 14, name: "La Muerte" },
    { id: 15, name: "La Pera" },
    { id: 16, name: "La Bandera" },
    { id: 17, name: "El Bandolón" },
    { id: 18, name: "El Violoncello" },
    { id: 19, name: "La Garza" },
    { id: 20, name: "El Pájaro" },
    { id: 21, name: "La Mano" },
    { id: 22, name: "La Bota" },
    { id: 23, name: "La Luna" },
    { id: 24, name: "El Cotorro" },
    { id: 25, name: "El Borracho" },
    { id: 26, name: "El Negrito" },
    { id: 27, name: "El Corazón" },
    { id: 28, name: "La Sandía" },
    { id: 29, name: "El Tambor" },
    { id: 30, name: "El Camarón" },
    { id: 31, name: "Las Jaras" },
    { id: 32, name: "El Músico" },
    { id: 33, name: "La Araña" },
    { id: 34, name: "El Soldado" },
    { id: 35, name: "La Estrella" },
    { id: 36, name: "El Cazo" },
    { id: 37, name: "El Mundo" },
    { id: 38, name: "El Apache" },
    { id: 39, name: "El Nopal" },
    { id: 40, name: "El Alacrán" },
    { id: 41, name: "La Rosa" },
    { id: 42, name: "La Calavera" },
    { id: 43, name: "La Campana" },
    { id: 44, name: "El Cantarito" },
    { id: 45, name: "El Venado" },
    { id: 46, name: "El Sol" },
    { id: 47, name: "La Corona" },
    { id: 48, name: "La Chalupa" },
    { id: 49, name: "El Pino" },
    { id: 50, name: "El Pescado" },
    { id: 51, name: "La Palma" },
    { id: 52, name: "La Maceta" },
    { id: 53, name: "El Arpa" },
    { id: 54, name: "La Rana" },
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
                <div id="card-${index}-${
        card.id
      }" class="relative w-full h-full rounded-lg bg-gray-200">
                   <img src="https://placehold.co/150x200/fdfbf7/44403c?text=${card.name.replace(
                     " ",
                     "%0A"
                   )}" alt="${card.name}" class="card-image">
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
                <img src="https://placehold.co/200x280/fdfbf7/44403c?text=${card.name.replace(
                  " ",
                  "%0A"
                )}" alt="${card.name}" class="card-image">
                <p class="absolute bottom-2 left-2 right-2 text-center bg-black bg-opacity-50 text-white text-sm font-bold p-1 rounded-b-lg">${
                  card.name
                }</p>
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
                    <img src="https://placehold.co/150x200/fdfbf7/44403c?text=${card.name.replace(
                      " ",
                      "%0A"
                    )}" alt="${card.name}" class="card-image marked">
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
                        <img src="https://placehold.co/200x280/fdfbf7/44403c?text=${card.name.replace(
                          " ",
                          "%0A"
                        )}" alt="${card.name}" class="card-image">
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
