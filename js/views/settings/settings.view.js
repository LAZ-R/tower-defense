import { APP_NAME, APP_VERSION } from "../../../app-properties.js";
import { CREDITS } from "../../data/credits.data.js";
import { toExternalPath } from "../../router.js";
import { getSvgIcon } from "../../services/icons.service.js";
import { updateMenuDom } from "../../services/menu.service.js";
import * as settingsService from "../../services/settings-service.js"; // pour les onClick
import { getUser } from "../../services/storage.service.js";
import { isLaptopOrUp, isPhone, isTablet } from "../../utils/breakpoints.js";

// VARIABLES //////////////////////////////////////////////////////////////////////////////////////
const HEADER_ICON_CONTAINER = document.getElementById('headerIconContainer');
const HEADER_TITLE = document.getElementById('headerTitle');
const MAIN = document.getElementById('main');
const FOOTER = document.getElementById('footer');

// FUNCTIONS //////////////////////////////////////////////////////////////////////////////////////

export function render() {
  let user = getUser();

  // Set HEADER layout
    if (isPhone || isTablet) {
      HEADER_TITLE.innerHTML = 'Paramètres';
    }
    if (isLaptopOrUp) {
      HEADER_TITLE.innerHTML = APP_NAME;
    }

  // Set MAIN layout
  MAIN.innerHTML = `
  <div class="page-container">
    ${ isLaptopOrUp ? `<h1>Paramètres</h1>` : '' }

    <h2>Accessibilité</h2>

    <div class="settings-group">
      <div class="setting-block">
        <span>Garder l'écran allumé</span>
        <label class="lzr-switch">
          <input type="checkbox" onclick="onKeepScreenAwakeClick(event)" ${user.KEEP_SCREEN_AWAKE ? 'checked' : ''} />
          <span class="slider"></span>
        </label>
      </div>
      <div class="setting-block">
        <span>Police "Open-Dyslexic"</span>
        <label class="lzr-switch">
          <input type="checkbox" onclick="onOpenDyslexicClick(event)" ${user.IS_ACCESSIBLE_FONT ? 'checked' : ''} />
          <span class="slider"></span>
        </label>
      </div>
    </div>
      
    <hr> <!-- ------------------------------------------------------------- -->

    <h2>Thème</h2>

    <div class="settings-group">
      <div id="themesContainer" class="themes-container">
        <div class="lzr-radio-group">
          <div class="lzr-radio-raw" onclick="onThemeClick('dark')">
            <label for="dark">Sombre</label>
            <input type="radio" class="lzr-radio" id="dark" name="theme" value="dark" ${user.PREFERED_THEME == 'dark' ? 'checked' : ''} />
          </div>

          <div class="lzr-radio-raw" onclick="onThemeClick('light')">
            <label for="light">Clair</label>
            <input type="radio" class="lzr-radio" id="light" name="theme" value="light" ${user.PREFERED_THEME == 'light' ? 'checked' : ''} />
          </div>

          <div class="lzr-radio-raw" onclick="onThemeClick('alternative')">
            <label for="alternative">Alternatif</label>
            <input type="radio" class="lzr-radio" id="alternative" name="theme" value="alternative" ${user.PREFERED_THEME == 'alternative' ? 'checked' : ''} />
          </div>
        </div>
      </div>
    </div>

    <hr> <!-- ------------------------------------------------------------- -->

    <h2>Stockage</h2>
    ${getStorageDom()}

    <hr> <!-- ------------------------------------------------------------- -->

    <h2>Crédits</h2>
    ${getCreditsDom()}

    <hr> <!-- ------------------------------------------------------------- -->
    
    <div class="bottom-block">
        <span>${APP_NAME} - v ${APP_VERSION}</span>
        <div style="display: flex; justify-content: center; align-items: center; gap: 8px;">
          <span>Copyright ©2025-${new Date().getFullYear()}</span>
          <a class="lzr-button lzr-flat lzr-primary lzr-store-link" href="https://laz-r.github.io/store/" target="_blank">LAZ-R</a>
        </div>
    </div>
  </div>
  `;

  // Set FOOTER layout
  FOOTER.innerHTML = ``;

  updateMenuDom('settings');
}

export function getPageState() {
  return {
    scrollTop: MAIN.scrollTop,
  };
}

export function restorePageState(state) {
  if (typeof state?.scrollTop === 'number') {
    MAIN.scrollTop = state.scrollTop;
  }
}

export function getStorageDom() {

  function getExportStorageDom() {
    return `
      <div class="storage-option-container">
        <h2>Exportation des données</h2>
        <p>Génère un fichier de sauvegarde des données du stockage local au format .txt.</p>
        <button class="lzr-button lzr-solid lzr-primary" onclick="onExportUserDataClick()">Exporter les données</button>
      </div>
    `;
  }
  
  function getImportStorageDom() {
    return `
      <div class="storage-option-container">
        <h2>Importation de données</h2>
        <p>Importe un fichier de sauvegarde pour remplacer les données du stockage local.</p>
        <p class="txt-error">Attention, il est important de n'utiliser qu'un fichier de sauvegarde au format .txt généré par cette application et non altéré. Sinon, ça VA planter.</p>
        <p class="txt-error">Attention, le fichier de sauvegarde importé écrasera la sauvegarde actuelle.</p>
        <input type="file" class="lzr-button lzr-solid lzr-error" onchange="onImportUserDataClick(event)" accept=".txt" />
      </div>
    `;
  }

  return `
    <div class="settings-group">
      <div class="drawers-container">
        <div class="lzr-drawer">
          <div class="tile-header">
            <div>
              <span class="header-title">Exportation</span>
            </div>
            <div class="tile-caret">
              ${getSvgIcon('chevron-right', 'm', null)}
            </div>
            <input type="checkbox">
          </div>
          <div class="expandable-wrapper">
            <div class="expandable-inner">
              <div class="inner-body">
                ${getExportStorageDom()}
              </div>
            </div>
          </div>
        </div>

        <div class="lzr-drawer">
          <div class="tile-header">
            <div>
              <span class="header-title">Importation</span>
            </div>
            <div class="tile-caret">
              ${getSvgIcon('chevron-right', 'm', null)}
            </div>
            <input type="checkbox">
          </div>
          <div class="expandable-wrapper">
            <div class="expandable-inner">
              <div class="inner-body">
                ${getImportStorageDom()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}


export function getCreditsDom() {
  function getCreditDom(credit) {
    return `
      <div class="credit-block">
        <b>${credit.name}</b>
        <span>by ${credit.creator}</span>
        <a href="${toExternalPath(credit.link)}" class="lzr-button lzr-flat" style="margin: 0 auto;">${credit.link}</a>
      </div>
    `;
  }

  function getCreditCategoryDom(category) {
    let str = `
      <div class="lzr-drawer">
        <div class="tile-header">
          <div>
            <span class="header-title">${category.name}</span>
          </div>
          <div class="tile-caret">
            ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
    `;

    for (let credit of category.list) {
      let isLast = category.list.indexOf(credit) == category.list.length - 1;
      str += `
        ${getCreditDom(credit)}
        ${isLast ? '' : `<hr>`}
      `;
    }

    str += `
            </div>
          </div>
        </div>
      </div>
    `;
    return str;
  }

  let str = '<div class="drawers-container">';
  for (let category of CREDITS) {
    str += getCreditCategoryDom(category);
  }
  str += '</div>'
  return str;
}