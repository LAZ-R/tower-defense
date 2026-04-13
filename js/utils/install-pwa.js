import { APP_LOCAL_STORAGE_ID, APP_NAME } from "../../app-properties.js";

const PWA_DISMISS_KEY = `${APP_LOCAL_STORAGE_ID}pwaInstallDismissedAt`;
const PWA_DISMISS_COOLDOWN_DAYS = 14;
const installContainer = document.getElementById('pwaInstallContainer');
let deferredInstallPrompt = null;

function isPromptDismissedRecently() {
  const raw = localStorage.getItem(PWA_DISMISS_KEY);
  if (!raw) return false;

  const dismissedAt = Number(raw);
  if (!Number.isFinite(dismissedAt)) return false;

  const msCooldown = PWA_DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  return (Date.now() - dismissedAt) < msCooldown;
}

function setPromptDismissed() {
  localStorage.setItem(PWA_DISMISS_KEY, String(Date.now()));
}

function setContainerDom() {
  installContainer.innerHTML = `
  <div id="pwaInstallBox" class="pwa-install-box">
    <span class="title">Installer l'application</span>
    <p>
      ${APP_NAME} peut être installé comme une application pour une expérience plus fluide.
    </p>
    <ul>
      <li>Lancement rapide depuis l'écran d'accueil</li>
      <li>Utilisable même hors connexion</li>
    </ul>
    <div>
      <button id="pwaNoInstallButton" class="lzr-button lzr-solid">Non merci</button>
      <button id="pwaInstallButton" class="lzr-button lzr-solid lzr-primary">Installer</button>
    </div>
  </div>
  `;
}

export function setAndShowInstallPwaMessage() {
  setContainerDom();
  const installBtn = document.getElementById('pwaInstallButton'); // bouton pour installer
  const noInstallBtn = document.getElementById('pwaNoInstallButton'); // bouton pour ne pas installer
  installBtn.addEventListener('click', async () => {
    console.log('Tentative d\'installation');
    if (!deferredInstallPrompt) return;

    // Ouvre le prompt natif
    deferredInstallPrompt.prompt();

    // Attends la réponse user
    const { outcome } = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    hideInstallPwaMessage();

    // outcome: "accepted" ou "dismissed"
    console.log('Install outcome:', outcome);
  });

  noInstallBtn.addEventListener('click', async () => {
    setPromptDismissed();
    hideInstallPwaMessage();
  });

  installContainer.classList.add('exist');
  setTimeout(() => {
    installContainer.classList.add('visible');
  }, 10);
}

function hideInstallPwaMessage() {
  installContainer.classList.remove('visible');
  setTimeout(() => {
    installContainer.classList.remove('exist');
  }, 200);
}

export function installPwa() {

  window.addEventListener('beforeinstallprompt', (event) => {
    // Le navigateur dit : "cette app est installable"
    console.log('installable event');
    event.preventDefault();                 // on garde la main
    deferredInstallPrompt = event;          // on stocke l'événement

    if (isPromptDismissedRecently()) return;

    setTimeout(() => {
      setAndShowInstallPwaMessage(); // on montre l'UI
    }, 8000);
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA installed');
    hideInstallPwaMessage();
    localStorage.removeItem(PWA_DISMISS_KEY);
  });
}