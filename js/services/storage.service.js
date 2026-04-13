import { APP_LOCAL_STORAGE_ID } from "../../app-properties.js";

const STORAGE = localStorage;
const appLocalStorageId = APP_LOCAL_STORAGE_ID;

export const setStorage = () => {
  if (STORAGE.getItem(`${appLocalStorageId}FirstTime`) === null) {
    STORAGE.setItem(`${appLocalStorageId}FirstTime`, '0');
    
    let userTMP = {
      // SETTINGS
      KEEP_SCREEN_AWAKE: true,
      IS_ACCESSIBLE_FONT: false,
      PREFERED_THEME: 'dark',
    };
    STORAGE.setItem(`${appLocalStorageId}User`, JSON.stringify(userTMP));
  }
}

export function deleteStorage() {
  if (STORAGE.getItem(`${appLocalStorageId}FirstTime`) !== null) {
    STORAGE.removeItem(`${appLocalStorageId}FirstTime`);
  }
  if (STORAGE.getItem(`${appLocalStorageId}FirstTime`) !== null) {
    STORAGE.removeItem(`${appLocalStorageId}User`);
  }
}

export const getUser = () => {
  return JSON.parse(STORAGE.getItem(`${appLocalStorageId}User`));
}
export const setUser = (user) => {
  STORAGE.setItem(`${appLocalStorageId}User`, JSON.stringify(user));
}

// DATA #######################################################################
function onExportUserDataClick() {
  let user = getUser();
  let date = new Date();
  let dateStr = `${date.getFullYear()}_${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}_${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}-${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}H${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}M${date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()}S`;
  let userStr = JSON.stringify(user);
  const contenu = userStr; // ta variable string

  // Création d’un blob avec le contenu texte
  const blob = new Blob([contenu], { type: "text/plain" });

  // Création d’un lien de téléchargement
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(blob);
  lien.download = `tethys_savefile-${dateStr}.txt`; // nom du fichier

  // Ajout du lien au DOM et clic automatique
  document.body.appendChild(lien);
  lien.click();

  // Nettoyage
  document.body.removeChild(lien);
  URL.revokeObjectURL(lien.href);
}
window.onExportUserDataClick = onExportUserDataClick;

function onImportUserDataClick(event) {
  const input = event.target;
  if (!input.files?.length) return;

  console.log('Importing .txt file');
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = async () => {
    const text = reader.result;
    console.log(text);
    const jsonText = JSON.parse(text);
    console.log(jsonText);

    setUser(jsonText);

    input.value = ''; // Important : reset file value here, to be able to upload the same file and still trigger the onchange event

    window.location = './';
  };
  reader.readAsText(file);
}
window.onImportUserDataClick = onImportUserDataClick;