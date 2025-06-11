// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
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
const db = getFirestore(app);

// --- Funciones de Criptografía ---
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

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

const uiAdmin = {
  // Selectores
  loginSection: document.getElementById("login-section"),
  configSection: document.getElementById("config-section"),
  passwordInput: document.getElementById("password"),
  loginBtn: document.getElementById("login-btn"),
  errorMessage: document.getElementById("error-message"),
  subtitle: document.getElementById("subtitle"),
  rowsInput: document.getElementById("rows"),
  colsInput: document.getElementById("cols"),
  totalImagesSpan: document.getElementById("total-images"),
  playerCountInput: document.getElementById("player-count"),
  playerNamesContainer: document.getElementById("player-names-container"),
  createGameBtn: document.getElementById("create-game-btn"),
  gameLinkContainer: document.getElementById("game-link-container"),
  gameLinkInput: document.getElementById("game-link"),
  goToGameBtn: document.getElementById("go-to-game-btn"),

  // Selectores del Modal de Contraseña
  passwordModal: document.getElementById("password-modal"),
  showPasswordModalBtn: document.getElementById("show-password-modal-btn"),
  cancelPasswordChangeBtn: document.getElementById(
    "cancel-password-change-btn"
  ),
  confirmPasswordChangeBtn: document.getElementById(
    "confirm-password-change-btn"
  ),
  newPasswordInput: document.getElementById("new-password"),
  confirmPasswordInput: document.getElementById("confirm-password"),
  passwordChangeStatus: document.getElementById("password-change-status"),

  init() {
    this.loginBtn.addEventListener("click", this.handleLogin.bind(this));
    this.passwordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleLogin();
    });
  },

  async handleLogin() {
    const inputPassword = this.passwordInput.value;
    if (!inputPassword) return;

    this.loginBtn.disabled = true;
    this.loginBtn.textContent = "Verificando...";
    this.errorMessage.classList.add("hidden");

    try {
      const securityRef = doc(db, "app_config", "security");
      const docSnap = await getDoc(securityRef);

      if (docSnap.exists()) {
        const storedHash = docSnap.data().admin_password_hash;
        const inputHash = await hashPassword(inputPassword);

        if (inputHash === storedHash) {
          this.loginSection.classList.add("hidden");
          this.configSection.classList.remove("hidden");
          this.subtitle.textContent = "Configura una nueva partida de Lotería";
          this.initPanel();
        } else {
          this.errorMessage.classList.remove("hidden");
        }
      } else {
        this.errorMessage.textContent =
          "Error de configuración. Contacta al soporte.";
        this.errorMessage.classList.remove("hidden");
      }
    } catch (error) {
      console.error("Login error:", error);
      this.errorMessage.textContent = "Error de conexión.";
      this.errorMessage.classList.remove("hidden");
    } finally {
      this.loginBtn.disabled = false;
      this.loginBtn.textContent = "Entrar";
    }
  },

  initPanel() {
    this.rowsInput.addEventListener("input", this.updateTotal);
    this.colsInput.addEventListener("input", this.updateTotal);
    this.playerCountInput.addEventListener(
      "input",
      this.renderPlayerNameInputs
    );
    this.createGameBtn.addEventListener("click", this.createGame);

    this.showPasswordModalBtn.addEventListener("click", () =>
      this.passwordModal.classList.remove("hidden")
    );
    this.cancelPasswordChangeBtn.addEventListener("click", () =>
      this.passwordModal.classList.add("hidden")
    );
    this.confirmPasswordChangeBtn.addEventListener(
      "click",
      this.handleChangePassword.bind(this)
    );

    this.renderPlayerNameInputs();
    this.updateTotal();
  },

  async handleChangePassword() {
    const newPass = this.newPasswordInput.value;
    const confirmPass = this.confirmPasswordInput.value;
    this.passwordChangeStatus.textContent = "";

    if (!newPass || newPass !== confirmPass) {
      this.passwordChangeStatus.textContent = "Las contraseñas no coinciden.";
      this.passwordChangeStatus.classList.add("text-red-500");
      return;
    }

    this.confirmPasswordChangeBtn.disabled = true;
    this.confirmPasswordChangeBtn.textContent = "Guardando...";

    try {
      const newHash = await hashPassword(newPass);
      const securityRef = doc(db, "app_config", "security");
      await setDoc(securityRef, { admin_password_hash: newHash });

      this.passwordChangeStatus.textContent =
        "Contraseña actualizada con éxito.";
      this.passwordChangeStatus.classList.remove("text-red-500");
      this.passwordChangeStatus.classList.add("text-green-500");

      setTimeout(() => {
        this.passwordModal.classList.add("hidden");
        this.passwordChangeStatus.textContent = "";
        this.newPasswordInput.value = "";
        this.confirmPasswordInput.value = "";
      }, 2000);
    } catch (error) {
      console.error("Password change error:", error);
      this.passwordChangeStatus.textContent = "Error al guardar.";
      this.passwordChangeStatus.classList.add("text-red-500");
    } finally {
      this.confirmPasswordChangeBtn.disabled = false;
      this.confirmPasswordChangeBtn.textContent = "Guardar";
    }
  },

  updateTotal() {
    const rows = parseInt(uiAdmin.rowsInput.value, 10) || 1;
    const cols = parseInt(uiAdmin.colsInput.value, 10) || 1;
    uiAdmin.totalImagesSpan.textContent = rows * cols;
  },

  renderPlayerNameInputs() {
    const count = parseInt(uiAdmin.playerCountInput.value, 10) || 1;
    let html =
      '<label class="block text-sm font-semibold text-gray-800 mb-2">Nombres de Jugadores</label>';
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

    const gameId = doc(collection(db, "games")).id;
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
      config: { rows, cols },
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
