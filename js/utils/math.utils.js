///////////////////////////////////////////////////////////////////////////////////////////////////
// ROUNDING VALUES
///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Arrondit un nombre à un nombre donné de décimales.
 *
 * Les arguments peuvent être des `number` ou des chaînes représentant des nombres.
 * Une erreur est levée si les entrées sont invalides.
 *
 * @param {number|string} num - Le nombre à arrondir.
 * @param {number|string} [decimals=0] - Le nombre de décimales à conserver (défaut : 0).
 * @returns {number} Le nombre arrondi au nombre de décimales spécifié.
 *
 * @throws {Error} Si `num` ou `decimals` est invalide,
 *                 ou si `decimals` est négatif ou non entier.
 *
 * @example
 * roundToDecimals(3.14159, 2);    // 3.14
 * roundToDecimals("2.71828", "3"); // 2.718
 * roundToDecimals(10);            // 10
 */
export const roundToDecimals = (num, decimals = 0) => {
  const nNum = Number(num);
  const nDecimals = Number(decimals);

  if (Number.isNaN(nNum)) {
    throw new Error(`Argument "num" invalide : "${num}"`);
  }

  if (
    Number.isNaN(nDecimals) ||
    !Number.isFinite(nDecimals) ||
    nDecimals < 0 ||
    !Number.isInteger(nDecimals)
  ) {
    throw new Error(`Paramètre "decimals" invalide : "${decimals}". Il doit s'agir d'un entier positif ou nul.`);
  }

  const factor = Math.pow(10, nDecimals);
  return Math.round((nNum + Number.EPSILON) * factor) / factor;
};


/* export const roundToDecimals = (num, decimals = 0) => {
  var p = Math.pow(10, Number(decimals));
  var n = (Number(num) * p) * (1 + Number.EPSILON);
  return Math.round(n) / p;
} */

///////////////////////////////////////////////////////////////////////////////////////////////////
// GETTING RANDOM VALUES
///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Retourne un entier aléatoire compris entre deux bornes incluses.
 *
 * Les bornes peuvent être des nombres ou des chaînes représentant des nombres.
 * Une erreur est levée si les arguments ne peuvent pas être convertis en nombres valides.
 *
 * @param {number|string} min - La borne minimale (incluse).
 * @param {number|string} max - La borne maximale (incluse).
 * @returns {number} Un entier aléatoire entre `min` et `max`, bornes incluses.
 *
 * @throws {Error} Si l'un des deux arguments n'est pas convertible en nombre valide,
 *                 ou si `min` est supérieur à `max`.
 *
 * @example
 * getRandomIntegerBetween(1, 5);       // Peut retourner 1, 2, 3, 4 ou 5
 * getRandomIntegerBetween("10", "12") // Peut retourner 10, 11 ou 12
 */
export const getRandomIntegerBetween = (min, max) => {
  const nMin = Number(min);
  const nMax = Number(max);

  if (Number.isNaN(nMin) || Number.isNaN(nMax)) {
    throw new Error(`Arguments invalides : min="${min}", max="${max}"`);
  }

  if (nMin > nMax) {
    throw new Error(`La borne minimale (${nMin}) ne peut pas être supérieure à la borne maximale (${nMax}).`);
  }

  return Math.floor(Math.random() * (nMax - nMin + 1)) + nMin;
};

/**
 * Retourne un nombre aléatoire à virgule flottante compris entre deux bornes incluses.
 *
 * Cette version permet de spécifier un nombre de décimales pour le résultat retourné.
 * Les bornes peuvent être des nombres ou des chaînes représentant des nombres.
 * Une erreur est levée si les arguments ne peuvent pas être convertis en nombres valides.
 *
 * @param {number|string} min - La borne minimale (incluse).
 * @param {number|string} max - La borne maximale (incluse).
 * @param {number} [decimals=2] - Le nombre de décimales à conserver dans le résultat.
 * @returns {number} Un nombre flottant aléatoire entre `min` et `max`, bornes incluses, avec le nombre de décimales spécifié.
 *
 * @throws {Error} Si l'un des deux arguments n'est pas convertible en nombre valide,
 *                 si `min` est supérieur à `max`, ou si `decimals` est un nombre non entier ou négatif.
 *
 * @example
 * getRandomFloatBetween(1, 5, 2);       // Peut retourner un nombre comme 3.14
 * getRandomFloatBetween("10", "12", 3); // Peut retourner un nombre comme 10.732
 * getRandomFloatBetween(0, 1, 5);       // Peut retourner un nombre comme 0.12345
 */
export const getRandomFloatBetween = (min, max, decimals = 2) => {
  const nMin = Number(min);
  const nMax = Number(max);
  const nDecimals = Number(decimals);

  if (Number.isNaN(nMin) || Number.isNaN(nMax)) {
    throw new Error(`Arguments invalides : min="${min}", max="${max}"`);
  }

  if (nMin > nMax) {
    throw new Error(`La borne minimale (${nMin}) ne peut pas être supérieure à la borne maximale (${nMax}).`);
  }

  if (Number.isNaN(nDecimals) || !Number.isInteger(nDecimals) || nDecimals < 0) {
    throw new Error(`Le paramètre "decimals" doit être un entier positif ou nul.`);
  }

  const random = Math.random() * (nMax - nMin) + nMin;
  const factor = Math.pow(10, nDecimals);
  return Math.round(random * factor) / factor;
};

/**
 * Retourne une variation aléatoire d'un nombre dans une fourchette de ±`percentage`%.
 *
 * Les arguments peuvent être de type `number` ou `string` convertible en nombre.
 * Une erreur est levée si les valeurs ne peuvent pas être convertis en nombres valides.
 *
 * @param {number|string} num - Le nombre de base à faire varier.
 * @param {number|string} [percentage=10] - Le pourcentage de variation maximale (défaut : 10).
 * @returns {number} Un nombre variant aléatoirement autour de `num` dans ±`percentage`%.
 *
 * @throws {Error} Si `num` ou `percentage` ne peuvent pas être convertis en nombres valides,
 *                 ou si `percentage` est négatif.
 *
 * @example
 * getRandomNumberVariation(100);        // Un nombre entre 90 et 110 (±10%)
 * getRandomNumberVariation(200, 25);    // Entre 150 et 250
 * getRandomNumberVariation("50", "5");  // Entre 47.5 et 52.5
 */
export const getRandomNumberVariation = (num, percentage = 10) => {
  const nNum = Number(num);
  const nPct = Number(percentage);

  if (Number.isNaN(nNum)) {
    throw new Error(`Argument "num" invalide : "${num}"`);
  }

  if (
    Number.isNaN(nPct) ||
    !Number.isFinite(nPct) ||
    nPct < 0
  ) {
    throw new Error(`Paramètre "percentage" invalide : "${percentage}". Il doit s'agir d'un nombre positif.`);
  }

  const variabilityFactor = nPct / 100;
  const factor = (Math.random() * (2 * variabilityFactor)) - variabilityFactor;

  return nNum + (nNum * factor);
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// PERCENTAGES
///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Calcule le pourcentage de `part` par rapport à `total`, arrondi à un nombre donné de décimales.
 *
 * Les arguments `part`, `total` et `decimals` peuvent être de type `number` ou `string`.
 * Une erreur est levée si les valeurs ne peuvent pas être convertis en nombres valides ou si le total est nul.
 *
 * @param {number|string} part - La valeur partielle, ou numérateur.
 * @param {number|string} total - Le total, ou dénominateur (doit être non nul).
 * @param {number|string} [decimals=2] - Le nombre de décimales à conserver (par défaut : 2).
 * @returns {number} Le pourcentage arrondi au nombre de décimales spécifié.
 *
 * @throws {Error} Si `part`, `total` ou `decimals` ne peuvent pas être convertis en nombres valides,
 *                 ou si `total` vaut 0 (division par zéro),
 *                 ou si `decimals` est négatif ou non entier.
 *
 * @example
 * getRoundedPercentage(2, 5);        // 40
 * getRoundedPercentage(1, 3, 4);     // 33.3333
 * getRoundedPercentage("3", "4", 0); // 75
 */
export const getRoundedPercentage = (part, total, decimals = 2) => {
  const nPart = Number(part);
  const nTotal = Number(total);
  const nDecimals = Number(decimals);

  if (Number.isNaN(nPart) || Number.isNaN(nTotal)) {
    throw new Error(`Arguments invalides : part="${part}", total="${total}"`);
  }

  if (nTotal === 0) {
    throw new Error(`Division par zéro : total ne peut pas être égal à 0.`);
  }

  if (
    Number.isNaN(nDecimals) ||
    !Number.isFinite(nDecimals) ||
    nDecimals < 0 ||
    !Number.isInteger(nDecimals)
  ) {
    throw new Error(`Paramètre "decimals" invalide : "${decimals}". Il doit s'agir d'un entier positif ou nul.`);
  }

  const raw = (nPart / nTotal) * 100;
  const factor = Math.pow(10, nDecimals);
  return Math.round((raw + Number.EPSILON) * factor) / factor;
};

/**
 * Calcule le pourcentage brut d'une part par rapport à un total, sans arrondi.
 *
 * Les arguments peuvent être de type `number` ou des chaînes numériques.
 * Une erreur est levée si les entrées ne peuvent pas être convertis en nombres valides.
 *
 * @param {number|string} part - La valeur partielle, ou numérateur.
 * @param {number|string} total - Le total, ou dénominateur (doit être non nul).
 * @returns {number} Le pourcentage brut, non arrondi (peut inclure des décimales).
 *
 * @throws {Error} Si `part` ou `total` ne peuvent pas être convertis en nombres valides,
 *                 ou si `total` vaut 0 (division par zéro)
 *
 * @example
 * getRawPercentage(25, 100);      // 25
 * getRawPercentage(1, 3);         // 33.333333...
 * getRawPercentage("50", "200");  // 25
 */
export const getRawPercentage = (part, total) => {
  const nPart = Number(part);
  const nTotal = Number(total);

  if (Number.isNaN(nPart) || Number.isNaN(nTotal)) {
    throw new Error(`Arguments invalides : part="${part}", total="${total}"`);
  }

  if (nTotal === 0) {
    throw new Error(`Division par zéro : total ne peut pas être égal à 0.`);
  }

  return (nPart / nTotal) * 100;
};

export const clamp = (x, min, max) => {
  return Math.max(min, Math.min(max, x));
}

export const getCommaFormatedString = (number, decimals = 2) => {
  return Number(number)
    .toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
