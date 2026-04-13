import { APP_NAME, APP_VERSION } from "../app-properties.js";
import * as Router from "./router.js";
import { getSvgIcon } from "./services/icons.service.js";
import { setMenuDom } from "./services/menu.service.js";
import { getUser, setStorage } from "./services/storage.service.js";
import { installPwa, setAndShowInstallPwaMessage } from "./utils/install-pwa.js";
import { setHTMLTitle, logAppInfos } from "./utils/misc.js";
import { requestWakeLock } from "./utils/wakelock.js";

// INITIALIZATION /////////////////////////////////////////////////////////////////////////////////

logAppInfos(APP_NAME, APP_VERSION);
setHTMLTitle(APP_NAME);
setStorage();

// Set user preferences
let user = getUser();
if (user.KEEP_SCREEN_AWAKE) {
  requestWakeLock();
}
document.getElementsByClassName('lzr')[0].style = `--theme: '${user.PREFERED_THEME}';`;

setMenuDom();
document.getElementById('headerIconContainer').innerHTML = `<a href="${Router.toExternalPath('/')}" class="centered-link">${getSvgIcon('lzr', 'xl', 'var(--color--primary)')}</a>`;

// Log path related infos
console.groupCollapsed('Path informations');
console.log(`location.href: ${location.href}`);
console.log(`location.origin: ${location.origin}`);
const url = new URL(location.href);
console.log(`url.pathname: ${url.pathname}`);
console.log(`Router.APP_BASE_PATH: ${Router.APP_BASE_PATH}`);
console.groupEnd();


// EXECUTION //////////////////////////////////////////////////////////////////////////////////////
const redirected = sessionStorage.getItem('spa:redirect');

if (redirected) {
  sessionStorage.removeItem('spa:redirect');
  
  // redirected est un chemin du style "/mon-repo/settings?x=1#y"
  // on en fait une URL absolue
  const targetUrl = new URL(redirected, location.origin);
  
  // 1er rendu = la page demandée initialement
  // Ici, on veut exactement l'URL externe demandée initialement.
  // 1) on corrige l'URL affichée, sans créer une nouvelle entrée d'historique
  history.replaceState(null, '', targetUrl.pathname + targetUrl.search + targetUrl.hash);
  // 2) on rend la vue demandée
  Router.renderURL(targetUrl.href).catch(console.error);
} else {
  // 1er rendu normal
  Router.renderURL(location.href).catch(console.error);
}

installPwa();
/* setTimeout(() => {
  setAndShowInstallPwaMessage();
}, 2000); */