import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  updateDoc,
  deleteDoc,
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
    { id: 33, name: "La Arana", img: "La Arana.jpg" },
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
  shuffleDeck() {
    let shuffled = [...this.fullDeck];
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
        boards.push({ cards: newBoardCards, name: "" });
      }
    }
    return boards;
  },
};

const customGameUI = {
  initialSetup: document.getElementById("initial-setup"),
  rowsInput: document.getElementById("rows"),
  colsInput: document.getElementById("cols"),
  boardCountInput: document.getElementById("board-count"),
  generateBoardsBtn: document.getElementById("generate-boards-btn"),
  assignNamesSection: document.getElementById("assign-names-section"),
  boardsContainer: document.getElementById("generated-boards-container"),
  saveDraftBtn: document.getElementById("save-draft-btn"),
  startGameBtn: document.getElementById("start-game-btn"),
  saveFeedback: document.getElementById("save-feedback"),
  deleteDraftBtn: document.getElementById("delete-draft-btn"),
  addBoardCountInput: document.getElementById("add-board-count"),
  addBoardsBtn: document.getElementById("add-boards-btn"),
  viewAvailableBtn: document.getElementById("view-available-btn"),
  gameLinkContainer: document.getElementById("game-link-container"),

  draftData: null,
  draftId: null,
  nextBoardId: 1,

  init() {
    const params = new URLSearchParams(window.location.search);
    this.draftId = params.get("draftId");

    if (this.draftId) {
      this.loadDraft(this.draftId);
    }

    this.generateBoardsBtn.addEventListener("click", () =>
      this.generateBoards()
    );
    this.saveDraftBtn.addEventListener("click", () => this.saveDraft());
    this.startGameBtn.addEventListener("click", () =>
      this.createGameFromDraft()
    );
    this.deleteDraftBtn.addEventListener("click", () => this.deleteDraft());
    this.addBoardsBtn.addEventListener("click", () => this.addMoreBoards());
  },

  async loadDraft(draftId) {
    this.initialSetup.classList.add("hidden");
    this.assignNamesSection.classList.remove("hidden");

    const draftRef = doc(db, "draft_games", draftId);
    const docSnap = await getDoc(draftRef);
    if (docSnap.exists()) {
      this.draftData = docSnap.data();
      if (this.draftData.boards && this.draftData.boards.length > 0) {
        const maxId = Math.max(...this.draftData.boards.map((b) => b.id || 0));
        this.nextBoardId = maxId + 1;
      } else {
        this.nextBoardId = 1;
      }
      this.displayBoardsForNaming();
      this.viewAvailableBtn.href = `disponibles.html?draftId=${this.draftId}`;
    } else {
      alert("Borrador no encontrado.");
      window.location.href = "admin.html";
    }
  },

  generateBoards() {
    const rows = parseInt(this.rowsInput.value, 10);
    const cols = parseInt(this.colsInput.value, 10);
    const boardCount = parseInt(this.boardCountInput.value, 10);

    if (isNaN(rows) || isNaN(cols) || isNaN(boardCount)) {
      alert("Por favor, introduce valores numéricos válidos.");
      return;
    }

    if (rows < 2 || rows > 4 || cols < 2 || cols > 3 || rows * cols > 12) {
      alert(
        "El tamaño de la cartilla no es válido. Filas debe ser entre 2 y 4. Columnas debe ser entre 2 y 3."
      );
      return;
    }

    this.nextBoardId = 1;
    const generatedBoards = gameLogic.generatePlayerBoards(
      boardCount,
      rows,
      cols
    );
    this.draftData = {
      boards: generatedBoards.map((board) => ({
        ...board,
        id: this.nextBoardId++,
      })),
      config: { rows, cols },
    };

    this.initialSetup.classList.add("hidden");
    this.assignNamesSection.classList.remove("hidden");
    this.displayBoardsForNaming();
  },

  addMoreBoards() {
    const count = parseInt(this.addBoardCountInput.value, 10);
    if (isNaN(count) || count < 1) {
      alert("Por favor, introduce un número válido de cartillas para añadir.");
      return;
    }

    const { rows, cols } = this.draftData.config;
    const newBoardsData = gameLogic.generatePlayerBoards(count, rows, cols);

    const newBoardsWithId = newBoardsData.map((board) => ({
      ...board,
      id: this.nextBoardId++,
    }));

    this.draftData.boards.push(...newBoardsWithId);
    this.displayBoardsForNaming();

    this.saveFeedback.textContent = `¡Se añadieron ${count} cartillas!`;
    setTimeout(() => {
      this.saveFeedback.textContent = "";
    }, 2500);
  },

  displayBoardsForNaming() {
    this.boardsContainer.innerHTML = "";
    this.draftData.boards.forEach((boardData, index) => {
      const boardWrapper = document.createElement("div");
      boardWrapper.className =
        "bg-white p-4 rounded-xl shadow-lg border border-gray-200";
      let cardsHtml = "";
      boardData.cards.forEach((card) => {
        cardsHtml += `<div class="relative"><img src="assets/images/${card.img}" class="card-image"></div>`;
      });
      boardWrapper.innerHTML = `
                <p class="text-center font-bold text-gray-700 mb-2">Cartilla #${
                  boardData.id
                }</p>
                <div class="grid gap-2 mb-4" style="grid-template-columns: repeat(${
                  this.draftData.config.cols
                }, 1fr)">${cardsHtml}</div>
                <input type="text" class="w-full p-2 border rounded-lg player-name-input" placeholder="Nombre del Jugador (opcional)" value="${
                  boardData.name || ""
                }" data-board-index="${index}">
            `;
      this.boardsContainer.appendChild(boardWrapper);
    });
  },

  async saveDraft() {
    this.saveDraftBtn.disabled = true;
    this.saveDraftBtn.textContent = "Guardando...";

    const nameInputs = document.querySelectorAll(".player-name-input");
    nameInputs.forEach((input) => {
      const boardIndex = parseInt(input.dataset.boardIndex, 10);
      this.draftData.boards[boardIndex].name = input.value.trim();
    });

    if (!this.draftId) {
      this.draftId = doc(collection(db, "draft_games")).id;
      this.draftData.createdAt = new Date();
      this.draftData.config.adminToken = crypto.randomUUID();
    }

    try {
      await setDoc(doc(db, "draft_games", this.draftId), this.draftData);
      this.saveFeedback.textContent = "¡Borrador guardado!";
      window.history.replaceState({}, "", `?draftId=${this.draftId}`);
      this.viewAvailableBtn.href = `disponibles.html?draftId=${this.draftId}`;
    } catch (error) {
      console.error("Error saving draft:", error);
      this.saveFeedback.textContent = "Error al guardar.";
    } finally {
      this.saveDraftBtn.disabled = false;
      this.saveDraftBtn.textContent = "Guardar Borrador";
      setTimeout(() => {
        this.saveFeedback.textContent = "";
      }, 2500);
    }
  },

  async createGameFromDraft() {
    this.startGameBtn.disabled = true;
    this.startGameBtn.textContent = "Iniciando...";

    const players = this.draftData.boards
      .filter((board) => board.name && board.name.trim() !== "")
      .map((board) => ({
        name: board.name.trim(),
        board: { cards: board.cards, marked: [] },
      }));

    if (players.length < 2) {
      alert(
        "Se necesitan al menos 2 jugadores con nombre para iniciar la partida."
      );
      this.startGameBtn.disabled = false;
      this.startGameBtn.textContent = "Iniciar Juego";
      return;
    }

    const gameId = doc(collection(db, "games")).id;
    const gameData = {
      config: this.draftData.config,
      players,
      deck: gameLogic.shuffleDeck(),
      calledCards: [],
      winner: null,
      createdAt: new Date(),
    };

    try {
      await setDoc(doc(db, "games", gameId), gameData);
      if (this.draftId) {
        await deleteDoc(doc(db, "draft_games", this.draftId));
      }
      this.displayGameLink(gameId, this.draftData.config.adminToken);
    } catch (error) {
      console.error("Error al crear la partida:", error);
      alert("No se pudo crear la partida.");
      this.startGameBtn.disabled = false;
      this.startGameBtn.textContent = "Iniciar Juego";
    }
  },

  async deleteDraft() {
    if (
      confirm(
        "¿Estás seguro de que quieres eliminar este borrador? Esta acción no se puede deshacer."
      )
    ) {
      try {
        if (this.draftId) {
          await deleteDoc(doc(db, "draft_games", this.draftId));
        }
        window.location.href = "admin.html";
      } catch (error) {
        console.error("Error deleting draft:", error);
        alert("No se pudo eliminar el borrador.");
      }
    }
  },

  displayGameLink(gameId, adminToken) {
    this.initialSetup.classList.add("hidden");
    this.assignNamesSection.classList.add("hidden");
    const path = window.location.pathname;
    const basePath = path.substring(0, path.lastIndexOf("/") + 1);
    const baseUrl = window.location.origin + basePath;
    const adminUrl = `${baseUrl}juego.html?id=${gameId}&token=${adminToken}`;
    const playerUrl = `${baseUrl}juego.html?id=${gameId}`;

    this.gameLinkContainer.innerHTML = `
            <h3 class="font-bold text-2xl text-green-600">¡Partida Creada con Éxito!</h3>
            <div class="flex justify-center items-center gap-4 mt-4">
                <a href="${adminUrl}" target="_blank" class="bg-amber-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-amber-700">Ir a mi Partida</a>
                <div class="relative">
                    <button id="final-copy-btn" title="Copiar enlace para jugadores" class="p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <p id="final-copy-feedback" class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-green-600 h-4 w-28"></p>
                </div>
            </div>
        `;
    this.gameLinkContainer.classList.remove("hidden");

    document.getElementById("final-copy-btn").addEventListener("click", (e) => {
      navigator.clipboard.writeText(playerUrl).then(() => {
        const feedback = document.getElementById("final-copy-feedback");
        feedback.textContent = "¡Copiado!";
        setTimeout(() => {
          feedback.textContent = "";
        }, 2500);
      });
    });
  },
};
customGameUI.init();
