import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
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

const uiAvailable = {
  loadingView: document.getElementById("loading-view"),
  container: document.getElementById("available-boards-container"),

  async init() {
    const params = new URLSearchParams(window.location.search);
    const draftId = params.get("draftId");

    if (!draftId) {
      this.container.innerHTML =
        '<p class="text-center text-red-500 col-span-full">No se ha especificado un borrador.</p>';
      this.loadingView.classList.add("hidden");
      return;
    }

    this.loadAvailableBoards(draftId);
  },

  async loadAvailableBoards(draftId) {
    const draftRef = doc(db, "draft_games", draftId);
    const docSnap = await getDoc(draftRef);

    if (docSnap.exists()) {
      const draftData = docSnap.data();
      const availableBoards = draftData.boards.filter(
        (board) => !board.name || board.name.trim() === ""
      );

      this.loadingView.classList.add("hidden");

      if (availableBoards.length === 0) {
        this.container.innerHTML =
          '<p class="text-center text-gray-500 col-span-full">Todas las cartillas tienen un nombre asignado.</p>';
        return;
      }

      this.displayBoards(availableBoards, draftData.config);
    } else {
      this.loadingView.classList.add("hidden");
      this.container.innerHTML =
        '<p class="text-center text-red-500 col-span-full">El borrador no fue encontrado.</p>';
    }
  },

  displayBoards(boards, config) {
    this.container.innerHTML = "";
    boards.forEach((boardData) => {
      const boardWrapper = document.createElement("div");
      boardWrapper.className =
        "bg-white p-4 rounded-xl shadow-lg border border-gray-200";

      let cardsHtml = "";
      boardData.cards.forEach((card) => {
        cardsHtml += `<div class="relative"><img src="assets/images/${card.img}" class="card-image"></div>`;
      });

      boardWrapper.innerHTML = `
                <p class="text-center font-bold text-gray-700 mb-2">Cartilla #${boardData.id}</p>
                <div class="grid gap-2" style="grid-template-columns: repeat(${config.cols}, 1fr)">${cardsHtml}</div>
            `;
      this.container.appendChild(boardWrapper);
    });
  },
};

uiAvailable.init();
