/* ######################################################################### */
/* -------------------------------- STRINGS -------------------------------- */
/* ######################################################################### */

export const formatNumberWithSpaces = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/* ######################################################################### */
/* ---------------------------------- DOM ---------------------------------- */
/* ######################################################################### */

export const setHTMLTitle = (pageTitle) => {
  document.getElementById('title').innerHTML = pageTitle;
  document.getElementById('appleTitle').setAttribute('content', pageTitle);
}

export const setFavicon = (iconSrc) => {
  document.getElementById('favicon').setAttribute('href', `${iconSrc}`);
}

/* ######################################################################### */
/* -------------------------------- COLORS --------------------------------- */
/* ######################################################################### */

export const getRandomHexColor = () => {
  // Génère un nombre aléatoire entre 0 et 16777215 (0xFFFFFF en hexadécimal)
  let randomColor = Math.floor(Math.random() * 16777215);
  
  // Convertit le nombre en une chaîne hexadécimale, et y ajoute un #
  return `#${randomColor.toString(16).padStart(6, '0')}`;
}

export const bpmToMillisecondsPerBeat = (bpm) => {
  // Convertir le BPM en millisecondes par battement
  let millisecondsPerBeat = (60 * 1000) / bpm;
  return millisecondsPerBeat;
}




export const getCurrentEnv = () => {
  const hostname = new URL(window.location.href).hostname;
  if (hostname.includes('localhost') || hostname.includes('127') || hostname.includes('192')) {
    return 'LOCAL'
  } else {
    return 'PROD'
  }
}

export const logAppInfos = (appName, appVersion) => {
  const baseColor = 'color: #FFFFFF;';
  const basicValueStyle = 'color: #5CD2F8;';
  const positiveValueStyle = 'color: #00FF00;';
  const mediumValueStyle = 'color: #FF9900;';
  const negativeValueStyle = 'color: #FF7777;';
  const neutralValueStyle = 'color: #BBBBBB;';


  const unavailable = '%cunavailable';
  const available = '%cavailable';

  const appNameStyle = `
    font-size: 24px;
    font-weight: 500;
    padding: 4px 16px;
    border-radius: 4px;
    background-color: #1A1A1A;
    border: 1px solid #6f6f6f;
  `;

  console.log(`%c${appName}`, appNameStyle);
  console.log(`Version: %c${appVersion}`, `font-size: 16px; ${basicValueStyle}`);
  console.log(`Environment: %c${getCurrentEnv()}`, `font-size: 16px; ${basicValueStyle}`);

  /* console.groupCollapsed('App status');
    console.log(`Storage: ${available}`, positiveValueStyle);
  console.groupEnd(); */
}



