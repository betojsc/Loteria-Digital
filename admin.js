import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  deleteField, // Importante: Se necesita para borrar un campo
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- TU CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDFn4Dntx2GbWTL9r6S0AlKDYCNfs8x22s",
  authDomain: "loteria-digital.firebaseapp.com",
  projectId: "loteria-digital",
  storageBucket: "loteria-digital.appspot.com",
  messagingSenderId: "274858696939",
  appId: "1:274858696939:web:39925a407bd7aa54665eae",
  measurementId: "G-790JYFXNQ2",
};
// ------------------------------------

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const uiAdmin = {
  // ... (propiedades de UI sin cambios)
  loginSection: document.getElementById("login-section"),
  configSection: document.getElementById("config-section"),
  passwordInput: document.getElementById("password"),
  loginBtn: document.getElementById("login-btn"),
  logoutBtn: document.getElementById("logout-btn"),
  errorMessage: document.getElementById("error-message"),
  subtitle: document.getElementById("subtitle"),
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
  activeGamesList: document.getElementById("active-games-list"),
  draftGamesList: document.getElementById("draft-games-list"),

  init() {
    this.loginBtn.addEventListener("click", () => this.handleLogin());
    this.passwordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleLogin();
    });
    this.checkSession();
  },

  async checkSession() {
    // ... (sin cambios)
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
    // ... (sin cambios)
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

  handleLogout() {
    // ... (sin cambios)
    localStorage.removeItem("loteriaAdminSession");
    window.location.reload();
  },

  initPanel() {
    this.showPasswordModalBtn.addEventListener("click", () =>
      this.passwordModal.classList.remove("hidden")
    );
    this.cancelPasswordChangeBtn.addEventListener("click", () =>
      this.passwordModal.classList.add("hidden")
    );
    this.confirmPasswordChangeBtn.addEventListener("click", () =>
      this.handleChangePassword()
    );
    this.logoutBtn.addEventListener("click", () => this.handleLogout());

    // El listener se añade dinámicamente en displayActiveGames
    this.loadGames();
  },

  async handleMainGameChange(event) {
    const clickedCheckbox = event.target;
    const gameId = clickedCheckbox.value;

    // Desmarca todos los demás checkboxes
    this.activeGamesList
      .querySelectorAll(".main-game-checkbox")
      .forEach((checkbox) => {
        if (checkbox !== clickedCheckbox) {
          checkbox.checked = false;
        }
      });

    if (clickedCheckbox.checked) {
      // Si el usuario marcó esta casilla, se establece como juego principal
      await this.setMainGame(gameId);
    } else {
      // Si el usuario desmarcó la casilla, se elimina la configuración del juego principal
      await this.clearMainGame();
    }
  },

  async loadGames() {
    // ... (sin cambios, la versión robusta anterior es correcta)
    this.activeGamesList.innerHTML =
      '<p class="text-center text-gray-500">Cargando...</p>';
    this.winnersList.innerHTML =
      '<p class="text-center text-gray-500">Cargando...</p>';
    this.draftGamesList.innerHTML =
      '<p class="text-center text-gray-500">Cargando...</p>';

    try {
      const [gamesSnapshot, draftsSnapshot] = await Promise.all([
        getDocs(collection(db, "games")),
        getDocs(collection(db, "draft_games")),
      ]);

      const allGames = [];
      gamesSnapshot.forEach((doc) => {
        try {
          const data = doc.data();
          if (
            data &&
            data.createdAt &&
            typeof data.createdAt.toDate === "function"
          ) {
            allGames.push({ id: doc.id, ...data });
          } else {
            console.warn(
              `Skipping game document ${doc.id} due to missing or invalid createdAt field.`
            );
          }
        } catch (e) {
          console.error(`Failed to process game document ${doc.id}:`, e);
        }
      });

      const allDrafts = [];
      draftsSnapshot.forEach((doc) => {
        try {
          const data = doc.data();
          if (
            data &&
            data.createdAt &&
            typeof data.createdAt.toDate === "function"
          ) {
            allDrafts.push({ id: doc.id, ...data });
          } else {
            console.warn(
              `Skipping draft document ${doc.id} due to missing or invalid createdAt field.`
            );
          }
        } catch (e) {
          console.error(`Failed to process draft document ${doc.id}:`, e);
        }
      });

      const activeGames = allGames.filter((game) => !game.winner);
      const winners = allGames.filter((game) => game.winner);

      this.displayActiveGames(activeGames, null);
      this.displayWinners(winners);
      this.displayDraftGames(allDrafts);

      const settingsDoc = await getDoc(doc(db, "app_config", "settings"));
      if (settingsDoc.exists()) {
        const mainGameId = settingsDoc.data().mainGameId;
        if (mainGameId) {
          const checkboxToCheck = this.activeGamesList.querySelector(
            `input[value="${mainGameId}"]`
          );
          if (checkboxToCheck) {
            checkboxToCheck.checked = true;
          }
        }
      }
    } catch (error) {
      console.error("Major error fetching collections:", error);
      this.activeGamesList.innerHTML =
        '<p class="text-center text-red-500">Error al consultar partidas.</p>';
      this.winnersList.innerHTML =
        '<p class="text-center text-red-500">Error al consultar historial.</p>';
      this.draftGamesList.innerHTML =
        '<p class="text-center text-red-500">Error al consultar borradores.</p>';
    }
  },

  displayActiveGames(games) {
    if (games.length === 0) {
      this.activeGamesList.innerHTML =
        '<p class="text-center text-gray-500">No hay partidas activas.</p>';
      return;
    }
    games.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
    let html = "";
    // --- CORRECCIÓN ---
    // Se usa un método más robusto para obtener la ruta base que funciona en local y en GitHub Pages.
    const path = window.location.pathname;
    const basePath = path.substring(0, path.lastIndexOf("/") + 1);
    const baseUrl = window.location.origin + basePath;
    // --- FIN DE LA CORRECCIÓN ---

    games.forEach((game) => {
      const date = game.createdAt.toDate().toLocaleString("es-MX");
      const adminUrl = `${baseUrl}juego.html?id=${game.id}&token=${game.config.adminToken}`;
      const playerUrl = `${baseUrl}juego.html?id=${game.id}`;
      html += `
            <div class="bg-blue-50 p-4 rounded-lg space-y-3">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="font-bold text-blue-800">Partida de ${game.players.length} jugador(es)</p>
                        <p class="text-xs text-gray-500">Fecha: ${date}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <a href="${adminUrl}" target="_blank" class="text-sky-600 hover:underline text-sm font-semibold">Continuar</a>
                        <button class="copy-active-link-btn p-2 hover:bg-gray-200 rounded-full" title="Copiar enlace para jugadores" data-player-url="${playerUrl}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                    </div>
                </div>
                <div class="pt-3 border-t border-blue-200">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" class="main-game-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 rounded" value="${game.id}">
                        <span class="text-sm font-medium text-blue-700">Marcar como juego principal</span>
                    </label>
                </div>
            </div>`;
    });
    this.activeGamesList.innerHTML = html;

    // Añade listeners a los nuevos checkboxes
    this.activeGamesList
      .querySelectorAll(".main-game-checkbox")
      .forEach((checkbox) => {
        checkbox.addEventListener("click", (e) => this.handleMainGameChange(e));
      });

    this.activeGamesList
      .querySelectorAll(".copy-active-link-btn")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          this.copyToClipboard(
            e.currentTarget.dataset.playerUrl,
            e.currentTarget
          );
        });
      });
  },

  async setMainGame(gameId) {
    const settingsRef = doc(db, "app_config", "settings");
    try {
      await setDoc(settingsRef, { mainGameId: gameId }, { merge: true });
      this.showFeedback("Juego principal establecido.");
    } catch (error) {
      console.error("Error setting main game:", error);
      alert("No se pudo guardar la selección.");
    }
  },

  async clearMainGame() {
    const settingsRef = doc(db, "app_config", "settings");
    try {
      await updateDoc(settingsRef, {
        mainGameId: deleteField(),
      });
      this.showFeedback("Se ha quitado el juego principal.");
    } catch (error) {
      console.error("Error clearing main game:", error);
      alert("No se pudo quitar la selección.");
    }
  },

  showFeedback(message) {
    const feedback = document.createElement("div");
    feedback.textContent = message;
    feedback.className =
      "fixed bottom-4 right-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg animate-pulse";
    document.body.appendChild(feedback);
    setTimeout(() => {
      if (document.body.contains(feedback)) {
        document.body.removeChild(feedback);
      }
    }, 3000);
  },

  displayWinners(games) {
    // ... (sin cambios)
    if (games.length === 0) {
      this.winnersList.innerHTML =
        '<p class="text-center text-gray-500">No hay ganadores registrados.</p>';
      return;
    }
    games.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
    let html = "";
    // --- CORRECCIÓN ---
    // Se usa un método más robusto para obtener la ruta base que funciona en local y en GitHub Pages.
    const path = window.location.pathname;
    const basePath = path.substring(0, path.lastIndexOf("/") + 1);
    const baseUrl = window.location.origin + basePath;
    // --- FIN DE LA CORRECCIÓN ---

    games.forEach((game) => {
      const date = game.createdAt.toDate().toLocaleString("es-MX");
      const gameUrl = `${baseUrl}juego.html?id=${game.id}`;
      html += `
        <div class="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
            <div>
                <p class="font-bold text-emerald-600">${game.winner.name}</p>
                <p class="text-xs text-gray-500">Fecha: ${date}</p>
            </div>
            <a href="${gameUrl}" target="_blank" class="text-sky-600 hover:underline text-sm font-semibold">Ver Partida</a>
        </div>
      `;
    });
    this.winnersList.innerHTML = html;
  },

  displayDraftGames(drafts) {
    // ... (sin cambios)
    if (drafts.length === 0) {
      this.draftGamesList.innerHTML =
        '<p class="text-center text-gray-500">No hay borradores.</p>';
      return;
    }
    drafts.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
    let html = "";
    drafts.forEach((draft) => {
      const date = draft.createdAt.toDate().toLocaleString("es-MX");
      html += `
            <div class="bg-yellow-50 p-3 rounded-lg flex justify-between items-center">
                <div>
                    <p class="font-bold text-yellow-800">Borrador (${draft.boards.length} cartillas)</p>
                    <p class="text-xs text-gray-500">Fecha: ${date}</p>
                </div>
                <a href="crear-partida.html?draftId=${draft.id}" class="text-sky-600 hover:underline text-sm font-semibold">Editar</a>
            </div>
        `;
    });
    this.draftGamesList.innerHTML = html;
  },

  copyToClipboard(text, buttonElement) {
    // ... (sin cambios)
    if (!text || !buttonElement) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        const originalIcon = buttonElement.innerHTML;
        buttonElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`;
        setTimeout(() => {
          buttonElement.innerHTML = originalIcon;
        }, 2000);
      })
      .catch((err) => {
        console.error("Error al copiar el enlace: ", err);
        alert("No se pudo copiar el enlace.");
      });
  },

  async handleChangePassword() {
    // ... (sin cambios)
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
        this.handleLogout();
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
};

uiAdmin.init();
