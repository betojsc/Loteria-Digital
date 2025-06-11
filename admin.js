// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
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
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

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
        boards.push({ cards: newBoardCards, marked: [] });
      }
    }
    return boards;
  },
};

const uiAdmin = {
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
  copyLinkBtn: document.getElementById("copy-link-btn"),
  goToGameBtn: document.getElementById("go-to-game-btn"),
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
  winnersList: document.getElementById("winners-list"),

  init() {
    this.loginBtn.addEventListener("click", () => this.handleLogin());
    this.passwordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleLogin();
    });
    this.checkSession();
  },

  async checkSession() {
    const sessionString = localStorage.getItem("loteriaAdminSession");
    if (!sessionString) return;

    const session = JSON.parse(sessionString);
    if (new Date().getTime() > session.expires) {
      localStorage.removeItem("loteriaAdminSession");
      return;
    }

    try {
      const securityRef = doc(db, "app_config", "security");
      const docSnap = await getDoc(securityRef);
      if (
        docSnap.exists() &&
        docSnap.data().admin_password_hash === session.token
      ) {
        this.loginSection.classList.add("hidden");
        this.configSection.classList.remove("hidden");
        this.subtitle.textContent =
          "Configura o revisa el historial de partidas.";
        this.initPanel();
      } else {
        localStorage.removeItem("loteriaAdminSession");
      }
    } catch (error) {
      console.error("Error checking session:", error);
    }
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
          const sevenDays = 7 * 24 * 60 * 60 * 1000;
          const session = {
            token: storedHash,
            expires: new Date().getTime() + sevenDays,
          };
          localStorage.setItem("loteriaAdminSession", JSON.stringify(session));

          this.loginSection.classList.add("hidden");
          this.configSection.classList.remove("hidden");
          this.subtitle.textContent =
            "Configura o revisa el historial de partidas.";
          this.initPanel();
        } else {
          this.errorMessage.classList.remove("hidden");
        }
      } else {
        this.errorMessage.textContent = "Error de configuración.";
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
    this.rowsInput.addEventListener("input", () => this.updateTotal());
    this.colsInput.addEventListener("input", () => this.updateTotal());
    this.playerCountInput.addEventListener("input", () =>
      this.renderPlayerNameInputs()
    );
    this.createGameBtn.addEventListener("click", () => this.createGame());
    this.copyLinkBtn.addEventListener("click", () => this.copyGameLink());
    this.showPasswordModalBtn.addEventListener("click", () =>
      this.passwordModal.classList.remove("hidden")
    );
    this.cancelPasswordChangeBtn.addEventListener("click", () =>
      this.passwordModal.classList.add("hidden")
    );
    this.confirmPasswordChangeBtn.addEventListener("click", () =>
      this.handleChangePassword()
    );

    this.renderPlayerNameInputs();
    this.updateTotal();
    this.fetchAndDisplayWinners();
  },

  copyGameLink() {
    this.gameLinkInput.select();
    document.execCommand("copy");
    this.copyLinkBtn.textContent = "Copiado!";
    setTimeout(() => {
      this.copyLinkBtn.textContent = "Copiar";
    }, 2000);
  },

  async fetchAndDisplayWinners() {
    this.winnersList.innerHTML =
      '<p class="text-center text-gray-500">Cargando historial...</p>';
    try {
      const gamesCollectionRef = collection(db, "games");
      const querySnapshot = await getDocs(gamesCollectionRef);

      const winners = [];
      querySnapshot.forEach((doc) => {
        const gameData = doc.data();
        if (gameData.winner && gameData.winner.name) {
          winners.push({ id: doc.id, ...gameData });
        }
      });

      if (winners.length === 0) {
        this.winnersList.innerHTML =
          '<p class="text-center text-gray-500">Aún no hay ganadores registrados.</p>';
        return;
      }

      winners.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

      let html = "";
      winners.forEach((game) => {
        const date = game.createdAt.toDate().toLocaleString("es-MX");
        html += `
                    <div class="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                        <div>
                            <p class="font-bold text-emerald-600">${game.winner.name}</p>
                            <p class="text-xs text-gray-500">Fecha: ${date}</p>
                        </div>
                        <a href="juego.html?id=${game.id}" target="_blank" class="text-sky-600 hover:underline text-sm font-semibold">Ver Partida</a>
                    </div>
                `;
      });
      this.winnersList.innerHTML = html;
    } catch (error) {
      console.error("Error fetching winners:", error);
      this.winnersList.innerHTML =
        '<p class="text-center text-red-500">No se pudo cargar el historial.</p>';
    }
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

      this.passwordChangeStatus.textContent = "Contraseña actualizada.";
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
    const rows = parseInt(this.rowsInput.value, 10) || 1;
    const cols = parseInt(this.colsInput.value, 10) || 1;
    this.totalImagesSpan.textContent = rows * cols;
  },

  renderPlayerNameInputs() {
    const count = parseInt(this.playerCountInput.value, 10) || 1;
    let html =
      '<label class="block text-sm font-semibold text-gray-800 mb-2">Nombres de Jugadores</label>';
    for (let i = 0; i < count; i++) {
      html += `<input type="text" class="player-name-input w-full p-2 border rounded-lg mt-2" placeholder="Nombre Jugador ${
        i + 1
      }" value="Jugador ${i + 1}">`;
    }
    this.playerNamesContainer.innerHTML = html;
  },

  async createGame() {
    this.createGameBtn.disabled = true;
    this.createGameBtn.textContent = "Creando...";

    const gameId = doc(collection(db, "games")).id;
    const adminToken = crypto.randomUUID();
    const rows = parseInt(this.rowsInput.value, 10);
    const cols = parseInt(this.colsInput.value, 10);
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
        adminToken,
      },
      players,
      deck: gameLogic.shuffleDeck(),
      calledCards: [],
      winner: null,
      createdAt: new Date(),
    };

    try {
      await setDoc(doc(db, "games", gameId), gameData);
      const path = window.location.pathname;
      const basePath = path.substring(0, path.lastIndexOf("/") + 1);
      const baseUrl = window.location.origin + basePath;
      const gameUrl = `${baseUrl}juego.html?id=${gameId}`;
      const adminUrl = `${gameUrl}&token=${adminToken}`;

      this.gameLinkInput.value = gameUrl;
      this.goToGameBtn.href = adminUrl;
      this.gameLinkContainer.classList.remove("hidden");
      this.fetchAndDisplayWinners();
    } catch (error) {
      console.error("Error al crear la partida:", error);
      alert("No se pudo crear la partida. Revisa la consola.");
    } finally {
      this.createGameBtn.disabled = false;
      this.createGameBtn.textContent = "Crear Partida";
    }
  },
};

uiAdmin.init();
