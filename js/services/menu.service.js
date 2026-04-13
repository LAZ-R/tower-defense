import { normalizePath, toExternalPath } from "../router.js";
import { getSvgIcon } from "./icons.service.js";

export const ENTRIES = [
  // PRIMARY
  { id: 'homepage' ,route: '/', label: 'Accueil', iconName: 'home', primary: true, },
  { id: 'css-components' ,route: '/css-components', label: 'Style', iconName: 'palette', primary: true, },
  { id: 'demo1' ,route: '/demo1', label: 'Demo 1', iconName: 'circle-check', primary: true, },
  // SECONDARY
  { id: 'demo2' ,route: '/demo2', label: 'Demo 2', iconName: 'circle-info', primary: false, },
  // SETTINGS
  { id: 'settings' ,route: '/settings', label: 'Paramètres', iconName: 'gear', primary: 'NA', },
];
const TAB_BAR = document.getElementById('tabBar');
const SIDE_BAR = document.getElementById('sideBar');

const HEADER_MENU = document.getElementById('headerMenu');
const HEADER_SETTINGS_NAV = document.getElementById('headerSettingsNav');

let IS_SIDE_BAR_OPENED = false;

export function setMenuDom() {
  // Mobile
  let tabBarButtonsCount = 0;
  let tabBarStr = '';
  let sideBarStr = '';

  // Laptop or up
  let headerMenuStr = '';

  for (let entry of ENTRIES) {
    if (entry.primary == true) {
      tabBarStr += `
      <a id="${entry.id}TabBarLink" href="${toExternalPath(entry.route)}" class="tab-bar-button">
        ${getSvgIcon(entry.iconName, 'l', 'var(--color--fg-default)')}
        <label>${entry.label}</label>
      </a>`;
      tabBarButtonsCount += 1;
    } else if (entry.primary == false) {
      sideBarStr += `
      <a href="${toExternalPath(entry.route)}" class="side-bar-button">
        ${getSvgIcon(entry.iconName, 'l', 'var(--color--fg-default)')}
        <label>${entry.label}</label>
      </a>`;
    }
  
    headerMenuStr += `
    <a id="${entry.id}HeaderMenuLink" href="${toExternalPath(entry.route)}" class="header-menu-button lzr-button lzr-flat">
      ${getSvgIcon(entry.iconName, 'm', 'var(--color--fg-default)')}
      <span>${entry.label}</span>
    </a>
    `;
  }

  if (sideBarStr != '') {
    tabBarStr += `
    <button id="tabBarPlusButton" class="tab-bar-button" onclick="onPlusButtonClick()">
      ${getSvgIcon('ellipsis-vertical', 'l', 'var(--color--fg-default)')}
      <label>Plus</label>
    </button>`;
    tabBarButtonsCount += 1;
  }

  TAB_BAR.setAttribute('style', `--buttons-count: ${tabBarButtonsCount/*  + 1 */};`)
  TAB_BAR.innerHTML = tabBarStr;
  SIDE_BAR.innerHTML = sideBarStr;
  HEADER_MENU.innerHTML = headerMenuStr;

  HEADER_SETTINGS_NAV.setAttribute('href', toExternalPath('/settings'))
  HEADER_SETTINGS_NAV.innerHTML = `${getSvgIcon('gear', 'm')}`;
}

export function updateMenuDom(entryId = null) {
  let entryObj = null;
  // unselect all
  for (let entry of ENTRIES) {
    if (entry.id == entryId) entryObj = entry;
    if (entry.primary == true) {
      let tabBarButton = document.getElementById(`${entry.id}TabBarLink`);
      tabBarButton.classList.remove('selected');
    }
    let tabBarSelectedButton = document.getElementById(`tabBarPlusButton`);
    tabBarSelectedButton.classList.remove('selected');
    let headerMenuButton = document.getElementById(`${entry.id}HeaderMenuLink`);
    headerMenuButton.classList.remove('selected');
    if (entry.id == 'settings') {
      HEADER_SETTINGS_NAV.classList.remove('selected');
    }
  }
  // add css class to selected
  if (entryId) {
    if (entryObj.primary == true) {
      let tabBarSelectedButton = document.getElementById(`${entryId}TabBarLink`);
      tabBarSelectedButton.classList.add('selected');
    } else if (entryObj.primary == false) {
      let tabBarSelectedButton = document.getElementById(`tabBarPlusButton`);
      tabBarSelectedButton.classList.add('selected');
    }

    let headerMenuSelectedButton = document.getElementById(`${entryId}HeaderMenuLink`);
    headerMenuSelectedButton.classList.add('selected');

    if (entryId == 'settings') {
      HEADER_SETTINGS_NAV.classList.add('selected');
    }
  }
}

export function hideSideBar() {
  let sideBarcontainer = document.getElementById('sideBarContainer');
  let sideBarVoid = document.getElementById('sideBarVoid');
  let sideBar = document.getElementById('sideBar');

  sideBar.classList.add('hidden');
  sideBarVoid.classList.add('hidden');
  setTimeout(() => {
    sideBarcontainer.classList.add('hidden');
    IS_SIDE_BAR_OPENED = false;
  }, 200);
}

export function showSideBar() {
  let sideBarcontainer = document.getElementById('sideBarContainer');
  let sideBarVoid = document.getElementById('sideBarVoid');
  let sideBar = document.getElementById('sideBar');

  sideBarcontainer.classList.remove('hidden');
  setTimeout(() => {
    sideBarVoid.classList.remove('hidden');
    sideBar.classList.remove('hidden');
    IS_SIDE_BAR_OPENED = true;
  }, 20);

}

export function onSideBarVoidClick() {
  hideSideBar();
}
window.onSideBarVoidClick = onSideBarVoidClick;

export function onPlusButtonClick() {
  if (IS_SIDE_BAR_OPENED) {
    hideSideBar();
  } else {
    showSideBar();
  }
  IS_SIDE_BAR_OPENED = !IS_SIDE_BAR_OPENED;
}
window.onPlusButtonClick = onPlusButtonClick;