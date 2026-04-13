// ================================
// Router minimal basé sur Navigation API
// + View Transitions (optionnel)
// ================================

import { hideSideBar } from './services/menu.service.js';

/**
 * Base path “serveur” sous lequel l’app est servie.
 * 
 * Objectif: récupère la base de l'URL à injecter dans les routes.
 * - En local : "/" (ex: http://localhost:5500/)
 * - Sur GitHub Pages : "/mon-repo/" (ex: https://user.github.io/mon-repo/)
 */
export const APP_BASE_PATH = new URL('../', import.meta.url).pathname;
export const APP_ORIGIN = `${location.origin}${APP_BASE_PATH}`;

let currentPageModule = null;

/**
 * Table de routes internes
 * 
 * Pour chaque chemin interne, on sait ainsi quel module ES charger.
 * 
 * Convention : chaque module exporte une fonction `render()` :
 *   export function render() { ... }
 */
const routes = {
  '/':               () => import('./views/homepage/homepage.view.js'),
  '/css-components': () => import('./views/css-components/css-components.view.js'),
  '/settings':       () => import('./views/settings/settings.view.js'),
  '/404':            () => import('./views/not-found/not-found.view.js'),
};

/**
 * Transforme une route interne (ex. "/settings") en URL réelle navigateur (ex. "/mon-repo/settings" sur GitHub Pages) : ajoute potentiellement le préfix du repo.
 * 
 * Objectif: lancer la navigation dans le browser et naviger vers la bonne url avant l'interception du navEvent.
 * @param {string} appPath Route interne (doit commencer par "/")
 * @returns {string} Chemin externe (pathname) incluant éventuellement APP_BASE_PATH
 */
export function toExternalPath(appPath) {
  if (APP_BASE_PATH === '/') return appPath;
  return APP_BASE_PATH.replace(/\/$/, '') + appPath; // "/mon-repo" + "/settings"
}

/**
 * Fait l’inverse de toExternalPath(appPath): prend le pathname réel (ex. "/mon-repo/settings") et le ramène à la route interne (ex. "/settings").
 * 
 * Objectif : garder `routes` propre et indépendant du mode de déploiement.
 * @param {string} pathname Pathname externe (ex: location.pathname ou new URL(...).pathname)
 * @returns {string} Route interne (commence par "/")
 */
export function normalizePath(pathname) {
  // Cas local: APP_BASE_PATH === '/'
  if (APP_BASE_PATH === '/') return pathname || '/';

  // Cas GH Pages: pathname = "/mon-repo/settings"
  // on veut => "/settings"
  if (pathname.startsWith(APP_BASE_PATH)) {
    // APP_BASE_PATH finit par '/', donc on retire tout sauf le '/' initial
    return '/' + pathname.slice(APP_BASE_PATH.length);
  }

  // Si ça ne matche pas, on renvoie tel quel (fallback)
  return pathname || '/';
}

/**
 * Charge et rend la “page” correspondant à une URL (ou pathname) donnée.
 *
 * Fonctionnement :
 * 1) Convertit l’entrée en URL et récupère son `pathname` externe.
 * 2) Normalise ce pathname externe vers une route interne via `normalizePath()`.
 * 3) Sélectionne le loader dans `routes` (fallback sur "/").
 * 4) Importe dynamiquement le module de page.
 * 5) Appel de `pageModule.render()`.
 * 
 * Si disponible, encapsule la mutation DOM dans `document.startViewTransition(...)`
 * pour laisser le navigateur animer l’état visuel avant/après.
 *
 * Remarques :
 * - Les erreurs de rendu sont loggées et relancées (throw) pour éviter qu’elles soient “avalées”
 *   dans le handler de `navigation.intercept()`.
 * - Le module de page est responsable de manipuler le DOM (ex: innerHTML sur main/footer).
 *
 * @param {string} urlString URL absolue ou relative (ex: navEvent.destination.url, location.href, "/settings")
 * @returns {Promise<void>} Résolue quand le module est chargé et que la mutation DOM a été déclenchée.
 */
export async function renderURL(urlString) {
  try {
    // Convertit l'entrée en URL. `location.href` sert de base pour les chemins relatifs.
    const url = new URL(urlString, location.href);

    // 1) pathname “réel” du navigateur (ex: "/mon-repo/settings")
    const rawPath = url.pathname;

    // 2) pathname “interne” de ton app (ex: "/settings")
    const appPath = normalizePath(rawPath);

    // 3) lookup route interne (fallback "/")
    const loadPageModule = routes[appPath] || routes['/404'];

    // 4) import dynamique du module de page
    const pageModule = await loadPageModule();

    // 5) Le module de page hydrate le DOM
    const applyDOMUpdates = async () => {
      try {
        // 1) La nouvelle page dessine son DOM
        await pageModule.render(); // peut throw (innerHTML d’une variable undef, etc.)

        currentPageModule = pageModule;

        // 2) On récupère l'état associé à l'entrée d'historique courante
        const entryState = navigation.currentEntry.getState();

        // 3) Si cette page sait restaurer un état, on lui donne
        if (pageModule.restorePageState) {
          pageModule.restorePageState(entryState);
        }

        document.getElementById('main')?.focus({ preventScroll: true });
      } catch (err) {
        console.error('[render() error]', err);
        throw err; // rethrow pour que l’échec remonte au handler de navigation
      }
    }

    // View Transition : on anime l’avant/après (si supportée)
    if (document.startViewTransition) {
      const vt = document.startViewTransition(applyDOMUpdates);
      /* await */ vt.finished; // si tu veux enchaîner; sinon omets l'await
    } else {
      applyDOMUpdates();
    }
  } catch (err) {
    console.error('[renderURL error]', err);
    throw err; // on relance pour que l’appelant sache que ça a échoué
  }
}

// Interception centralisée des navigations
navigation.addEventListener('navigate', (navEvent) => {
  hideSideBar();
  if (!navEvent.canIntercept) return;      // téléchargements, cross-origin…
  if (navEvent.hashChange) return;         // laisse #ancre au natif si tu veux
  if (navEvent.downloadRequest) return;    // on ne touche pas aux downloads

  const dest = new URL(navEvent.destination.url);

  // 1) si ce n’est pas le même origin → on laisse le navigateur faire
  if (dest.origin !== location.origin) return;

  // 2) si ça sort du base path de l’app → on laisse le navigateur faire
  //    (ex: /autre-repo/ sur GH Pages)
  if (APP_BASE_PATH !== '/' && !dest.pathname.startsWith(APP_BASE_PATH)) return;

  // ✅ OK: on est dans le périmètre de l’app

  // Sauvegarder l'état de la page qu'on quitte
  if (currentPageModule?.getPageState) {
    navigation.updateCurrentEntry({
      state: currentPageModule.getPageState()
    });
  }

  // on intercepte
  navEvent.intercept({
    handler: () => renderURL(dest.href),
  });
});

// Filets de sécurité pour voir les erreurs même si elles sont “avalées” ailleurs
window.addEventListener('error', (ev) => {
  console.error('[global error]', ev.error || ev.message, ev);
});
window.addEventListener('unhandledrejection', (ev) => {
  console.error('[unhandled rejection]', ev.reason);
});

// ================================
// Notes :
// - Back/forward restent natifs (historique géré par Navigation API).
// - Navigation programmée: navigation.navigate('/about').
// - Tu peux limiter les transitions à des zones via CSS (view-transition-name).
// ================================