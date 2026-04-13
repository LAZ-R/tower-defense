import { roundToDecimals } from "./math.utils.js";

/**
 * Ajoute des zéros en préfixe d'une valeur pour atteindre une longueur donnée.
 *
 * Cette fonction convertit la valeur en chaîne puis la complète à gauche avec des zéros.
 * Elle est utile, par exemple, pour formater des nombres comme des horodatages (ex. : 03, 007).
 *
 * @param {string|number} val - La valeur à formater (convertie en chaîne).
 * @param {number|string} length - Longueur totale souhaitée de la chaîne.
 * @returns {string} La chaîne complétée à gauche par des zéros si nécessaire.
 *
 * @throws {Error} Si `length` est invalide (non entier ou négatif).
 *
 * @example
 * padBeforeWithZero(5, 2);      // "05"
 * padBeforeWithZero("9", 3);    // "009"
 * padBeforeWithZero("42", 1);   // "42" (pas tronqué)
 */
export const padBeforeWithZero = (val, length) => {
  const strVal = String(val);
  const len = Number(length);

  if (
    Number.isNaN(len) ||
    !Number.isFinite(len) ||
    len < 0 ||
    !Number.isInteger(len)
  ) {
    throw new Error(`Paramètre "length" invalide : "${length}". Il doit s'agir d'un entier positif ou nul.`);
  }

  return strVal.padStart(len, '0');
};


///////////////////////////////////////////////////////////////////////////////////////////////////
// TIME
///////////////////////////////////////////////////////////////////////////////////////////////////



// CONVERSION #################################################################
/**
 * Convertit une durée exprimée en heures, minutes, secondes et millisecondes en millisecondes totales.
 *
 * Les arguments peuvent être des `number` ou des chaînes convertibles en nombre.
 * Tous les composants doivent être positifs ou nuls.
 *
 * @param {number|string} [hours=0] - Nombre d'heures.
 * @param {number|string} [minutes=0] - Nombre de minutes.
 * @param {number|string} [seconds=0] - Nombre de secondes.
 * @param {number|string} [milliseconds=0] - Nombre de millisecondes.
 * @returns {number} La durée totale en millisecondes.
 *
 * @throws {Error} Si un des arguments n'est pas un nombre valide ou est négatif.
 *
 * @example
 * convertTimeValuesToMilliseconds(1, 30);            // 5400000 ms (1h30min)
 * convertTimeValuesToMilliseconds("0", "1", 2, 500);  // 62500 ms
 * convertTimeValuesToMilliseconds(0, 0, 0, 100);      // 100 ms
 */
export const convertTimeValuesToMilliseconds = (
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0
) => {
  const nH = Number(hours);
  const nM = Number(minutes);
  const nS = Number(seconds);
  const nMs = Number(milliseconds);

  if (
    [nH, nM, nS, nMs].some(v => Number.isNaN(v))
  ) {
    throw new Error(`Argument(s) invalide(s) : hours="${hours}", minutes="${minutes}", seconds="${seconds}", milliseconds="${milliseconds}"`);
  }

  if (
    [nH, nM, nS, nMs].some(v => v < 0)
  ) {
    throw new Error(`Les valeurs de temps ne peuvent pas être négatives : hours="${hours}", minutes="${minutes}", seconds="${seconds}", milliseconds="${milliseconds}"`);
  }

  return (
    (nH * 60 * 60 * 1000) +
    (nM * 60 * 1000) +
    (nS * 1000) +
    nMs
  );
};

/**
 * Convertit une durée exprimée en millisecondes en un objet contenant les heures, minutes, secondes et millisecondes.
 *
 * @param {number|string} milliseconds - La durée totale en millisecondes (doit être un nombre positif ou nul).
 * @returns {{ hours: number, minutes: number, seconds: number, milliseconds: number }} Un objet décomposé.
 *
 * @throws {Error} Si l'argument n'est pas un nombre valide ou est négatif.
 *
 * @example
 * convertMillisecondsToTimeObject(7261500);
 * // { hours: 2, minutes: 1, seconds: 1, milliseconds: 500 }
 *
 * convertMillisecondsToTimeObject("3600000");
 * // { hours: 1, minutes: 0, seconds: 0, milliseconds: 0 }
 */
export const convertMillisecondsToTimeObject = (milliseconds) => {
  let nMs = Number(milliseconds);

  if (Number.isNaN(nMs)) {
    throw new Error(`Argument invalide : milliseconds="${milliseconds}"`);
  }

  if (nMs < 0) {
    throw new Error(`La durée ne peut pas être négative : milliseconds="${milliseconds}"`);
  }

  const hours = Math.floor(nMs / (60 * 60 * 1000));
  nMs %= (60 * 60 * 1000);

  const minutes = Math.floor(nMs / (60 * 1000));
  nMs %= (60 * 1000);

  const seconds = Math.floor(nMs / 1000);
  nMs %= 1000;

  return {
    hours,
    minutes,
    seconds,
    milliseconds: nMs
  };
};


// STRING FORMATTING ################################################

// COMPACT ================================================
/**
 * Génère une chaîne compacte représentant une durée sous forme "HH:MM:SS.mmm", avec élimination des composantes inutiles (valeurs initiales et finales à 0).
 *
 * Cette fonction supprime automatiquement les champs en tête ou en queue qui valent zéro (heures, minutes, secondes, millisecondes),
 * afin de produire un format minimal, adapté aux cas courts ou partiels.
 *
 * Règles de format :
 * - Tous les champs à zéro → retourne `"0"`.
 * - Si seuls les millisecondes sont conservées → retourne `"mmm"` (sans `.` ni `:`).
 * - Si des heures/minutes/secondes sont conservées **et** que les millisecondes sont présentes en dernier → retourne `"HH:MM:SS.mmm"`.
 * - Sinon, assemble les valeurs retenues par `":"`.
 *
 * Aucun arrondi ou padding autre que les trois chiffres des millisecondes n'est effectué.
 *
 * @param {number} [hours=0] - Heures (entier ≥ 0).
 * @param {number} [minutes=0] - Minutes (entier ≥ 0).
 * @param {number} [seconds=0] - Secondes (entier ≥ 0).
 * @param {number} [milliseconds=0] - Millisecondes (entier ≥ 0).
 * @returns {string} Chaîne compacte représentant le temps, sans champs superflus.
 *
 * @example
 * getCompactColonTimeStringByTimeValues(0, 0, 0, 0);         // "0"
 * getCompactColonTimeStringByTimeValues(0, 0, 0, 42);        // "42"
 * getCompactColonTimeStringByTimeValues(0, 1, 2, 345);       // "1:2.345"
 * getCompactColonTimeStringByTimeValues(2, 0, 0, 0);         // "2"
 * getCompactColonTimeStringByTimeValues(0, 3, 4, 0);         // "3:4"
 */
export const getCompactColonTimeStringByTimeValues = (
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0
) => {
  const parts = [hours, minutes, seconds, milliseconds];
  const isZero = (val) => val === 0;

  // Trouver les bornes utiles
  let first = 0;
  while (first < parts.length && isZero(parts[first])) first++;

  let last = parts.length - 1;
  while (last > first && isZero(parts[last])) last--;

  const trimmed = parts.slice(first, last + 1);

  // Format final
  if (trimmed.length === 0) return "0";

  const ms = trimmed.length === 1 && first === 3
    ? `${parts[3]}`
    : trimmed.length > 0 && last === 3
      ? trimmed.slice(0, -1).join(":") + "." + parts[3].toString().padStart(3, "0")
      : trimmed.join(":");

  return ms;
};

/**
 * Génère une chaîne verbale compacte représentant une durée, en supprimant les composantes en tête ou en queue qui valent zéro.
 *
 * Chaque unité de temps (heures, minutes, secondes, millisecondes) est suffixée par son abréviation (`"h"`, `"min"`, `"sec"`, `"ms"`),
 * et seules les valeurs significatives sont conservées. La sortie est réduite à l'essentiel pour un affichage lisible et concis.
 *
 * Règles de format :
 * - Les unités avec une valeur à zéro **au début** ou **à la fin** sont ignorées.
 * - Les unités internes valant zéro sont conservées si elles sont encadrées par des valeurs significatives.
 * - Si toutes les valeurs sont nulles → retourne une chaîne vide (`""`).
 *
 * Aucun arrondi ni padding n'est appliqué.
 *
 * @param {number} [hours=0] - Heures (entier ≥ 0).
 * @param {number} [minutes=0] - Minutes (entier ≥ 0).
 * @param {number} [seconds=0] - Secondes (entier ≥ 0).
 * @param {number} [milliseconds=0] - Millisecondes (entier ≥ 0).
 * @returns {string} Une chaîne de type `"1min 3sec"` ou `"2h 45min 5sec 123ms"`, selon les composantes significatives.
 *
 * @example
 * getCompactVerboseTimeStringByTimeValues(0, 0, 0, 0);         // ""
 * getCompactVerboseTimeStringByTimeValues(0, 0, 0, 42);        // "42ms"
 * getCompactVerboseTimeStringByTimeValues(0, 1, 2, 345);       // "1min 2sec 345ms"
 * getCompactVerboseTimeStringByTimeValues(2, 0, 0, 0);         // "2h"
 * getCompactVerboseTimeStringByTimeValues(0, 3, 4, 0);         // "3min 4sec"
 */
export const getCompactVerboseTimeStringByTimeValues = (
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0
) => {
  const labels = ["h", "min", "sec", "ms"];
  const values = [hours, minutes, seconds, milliseconds];
  const result = [];

  let first = 0;
  while (first < values.length && values[first] === 0) first++;

  let last = values.length - 1;
  while (last > first && values[last] === 0) last--;

  for (let i = first; i <= last; i++) {
    result.push(`${values[i]}${labels[i]}`);
  }

  return result.join(" ");
};

// Full ===================================================
/**
 * Formate des valeurs de temps (heures, minutes, secondes, millisecondes) en une chaîne de type "HH:MM:SS.mmm".
 *
 * Toutes les valeurs sont converties en nombres, validées, puis normalisées avec des zéros en préfixe.
 * 
 * Utilise `padBeforeWithZero` pour le formatage.
 *
 * @param {number|string} [hours=0] - Nombre d'heures (≥ 0).
 * @param {number|string} [minutes=0] - Nombre de minutes (≥ 0).
 * @param {number|string} [seconds=0] - Nombre de secondes (≥ 0).
 * @param {number|string} [milliseconds=0] - Nombre de millisecondes (≥ 0).
 * @returns {string} Une chaîne formatée du type "HH:MM:SS.mmm".
 *
 * @throws {Error} Si un des arguments est invalide ou négatif.
 *
 * @example
 * getFullColonTimeStringByTimeValues(3, 7, 42, 5); // "03:07:42.005"
 * getFullColonTimeStringByTimeValues("1", "2", "3", "45"); // "01:02:03.045"
 */
export const getFullColonTimeStringByTimeValues = (
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0
) => {
  const nH = Number(hours);
  const nM = Number(minutes);
  const nS = Number(seconds);
  const nMs = Number(milliseconds);

  if ([nH, nM, nS, nMs].some(n => Number.isNaN(n))) {
    throw new Error(`Argument(s) invalide(s) : hours="${hours}", minutes="${minutes}", seconds="${seconds}", milliseconds="${milliseconds}"`);
  }

  if ([nH, nM, nS, nMs].some(n => n < 0)) {
    throw new Error(`Les valeurs de temps ne peuvent pas être négatives : hours="${hours}", minutes="${minutes}", seconds="${seconds}", milliseconds="${milliseconds}"`);
  }

  return `${padBeforeWithZero(nH, 2)}:${padBeforeWithZero(nM, 2)}:${padBeforeWithZero(nS, 2)}.${padBeforeWithZero(nMs, 3)}`;
};

/**
 * Convertit une durée exprimée en millisecondes en une chaîne formatée "HH:MM:SS.mmm".
 *
 * Utilise `convertMillisecondsToTimeObject` pour la conversion et `getFullColonTimeStringByTimeValues` pour le formatage.
 *
 * @param {number|string} [milliseconds=0] - Durée en millisecondes (doit être un nombre positif ou nul).
 * @returns {string} Une chaîne de type "HH:MM:SS.mmm".
 *
 * @throws {Error} Si l'argument est invalide ou négatif.
 *
 * @example
 * getFullColonTimeStringByMilliseconds(3723004); // "01:02:03.004"
 * getFullColonTimeStringByMilliseconds("90061000"); // "25:01:01.000"
 */
export const getFullColonTimeStringByMilliseconds = (milliseconds = 0) => {
  const nMs = Number(milliseconds);

  if (Number.isNaN(nMs)) {
    throw new Error(`Argument invalide : milliseconds="${milliseconds}"`);
  }

  if (nMs < 0) {
    throw new Error(`La durée ne peut pas être négative : milliseconds="${milliseconds}"`);
  }

  const timeObject = convertMillisecondsToTimeObject(nMs);

  return getFullColonTimeStringByTimeValues(
    timeObject.hours,
    timeObject.minutes,
    timeObject.seconds,
    timeObject.milliseconds
  );
};


/**
 * Formate des valeurs de temps (heures, minutes, secondes, millisecondes) en une chaîne lisible du type "HHh MMm SSs MMMms".
 *
 * Toutes les valeurs sont converties en nombres, validées, puis formatées avec des zéros en préfixe si nécessaire.
 *
 * Utilise `padBeforeWithZero` pour le formatage.
 *
 * @param {number|string} [hours=0] - Nombre d'heures (≥ 0).
 * @param {number|string} [minutes=0] - Nombre de minutes (≥ 0).
 * @param {number|string} [seconds=0] - Nombre de secondes (≥ 0).
 * @param {number|string} [milliseconds=0] - Nombre de millisecondes (≥ 0).
 * @returns {string} Une chaîne formatée du type "HHh MMm SSs MMMms".
 *
 * @throws {Error} Si un des arguments est invalide ou négatif.
 *
 * @example
 * getFullVerboseTimeStringByTimeValues(3, 7, 42, 5); // "03h 07m 42s 005ms"
 * getFullVerboseTimeStringByTimeValues("1", "2", "3", "45"); // "01h 02m 03s 045ms"
 */
export const getFullVerboseTimeStringByTimeValues = (
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0
) => {
  const nH = Number(hours);
  const nM = Number(minutes);
  const nS = Number(seconds);
  const nMs = Number(milliseconds);

  if ([nH, nM, nS, nMs].some(n => Number.isNaN(n))) {
    throw new Error(`Argument(s) invalide(s) : hours="${hours}", minutes="${minutes}", seconds="${seconds}", milliseconds="${milliseconds}"`);
  }

  if ([nH, nM, nS, nMs].some(n => n < 0)) {
    throw new Error(`Les valeurs de temps ne peuvent pas être négatives : hours="${hours}", minutes="${minutes}", seconds="${seconds}", milliseconds="${milliseconds}"`);
  }

  return `${padBeforeWithZero(nH, 2)}h ${padBeforeWithZero(nM, 2)}m ${padBeforeWithZero(nS, 2)}s ${padBeforeWithZero(nMs, 3)}ms`;
};

/**
 * Convertit une durée en millisecondes en une chaîne lisible du type "HHh MMm SSs MMMms".
 *
 * Utilise `convertMillisecondsToTimeObject` pour extraire les composantes, puis
 * `getFullVerboseTimeStringByTimeValues` pour formater la chaîne finale avec du padding.
 *
 * @param {number|string} [milliseconds=0] - Durée en millisecondes (≥ 0).
 * @returns {string} Une chaîne formatée du type "HHh MMm SSs MMMms".
 *
 * @throws {Error} Si l'argument est invalide ou négatif.
 *
 * @example
 * getFullVerboseTimeStringByMilliseconds(3723004); // "01h 02m 03s 004ms"
 * getFullVerboseTimeStringByMilliseconds("90061000"); // "25h 01m 01s 000ms"
 */
/* export const getFullVerboseTimeStringByMilliseconds = (milliseconds = 0) => {
  const nMs = Number(milliseconds);

  if (Number.isNaN(nMs)) {
    throw new Error(`Argument invalide : milliseconds="${milliseconds}"`);
  }

  if (nMs < 0) {
    throw new Error(`Les valeurs de temps ne peuvent pas être négatives : milliseconds="${milliseconds}"`);
  }

  const timeObject = convertMillisecondsToTimeObject(nMs);

  return getFullVerboseTimeStringByTimeValues(
    timeObject.hours,
    timeObject.minutes,
    timeObject.seconds,
    timeObject.milliseconds
  );
}; */

const getElapsedMilliseconds = (sourceTimestamp, currentTimestamp) => {
  return currentTimestamp - sourceTimestamp;
}

export const getFullVerboseTimeStringByMilliseconds = (
  milliseconds = 0,
  showMilliseconds = false
) => {
  const nMs = Number(milliseconds);

  if (Number.isNaN(nMs)) {
    throw new Error(`Argument invalide : milliseconds="${milliseconds}"`);
  }

  if (nMs < 0) {
    throw new Error(`Les valeurs de temps ne peuvent pas être négatives : milliseconds="${milliseconds}"`);
  }

  const { hours, minutes, seconds, milliseconds: ms } =
    convertMillisecondsToTimeObject(nMs);

  // Si on ne veut pas afficher les ms → on les force à 0
  return showMilliseconds
    ? getFullVerboseTimeStringByTimeValues(hours, minutes, seconds, ms)
    : `${padBeforeWithZero(hours, 2)}h ${padBeforeWithZero(minutes, 2)}m ${padBeforeWithZero(seconds, 2)}s`;
};

export const getAdaptiveVerboseTimeStringByMilliseconds = (
  milliseconds = 0,
  showMilliseconds = false
) => {
  const nMs = Number(milliseconds);

  if (Number.isNaN(nMs)) {
    throw new Error(`Argument invalide : milliseconds="${milliseconds}"`);
  }

  if (nMs < 0) {
    throw new Error(`Les valeurs de temps ne peuvent pas être négatives : milliseconds="${milliseconds}"`);
  }

  const { hours, minutes, seconds, milliseconds: ms } =
    convertMillisecondsToTimeObject(nMs);

  const parts = [];

  if (hours > 0) {
    parts.push(`${padBeforeWithZero(hours, 2)}h`);
  }

  if (minutes > 0 || hours > 0) {
    parts.push(`${padBeforeWithZero(minutes, 2)}m`);
  }

  // secondes toujours affichées
  parts.push(`${padBeforeWithZero(seconds, 2)}s`);

  if (showMilliseconds) {
    parts.push(`${padBeforeWithZero(ms, 3)}ms`);
  }

  return parts.join(" ");
};