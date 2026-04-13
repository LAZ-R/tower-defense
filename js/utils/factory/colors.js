import { hexToRgb } from "./filterMagic.js";

/**
 * 
 * @param {string} hex 
 * @returns 
 */
export const getRgbFromHex = (hex) => {
  return hexToRgb(hex);
}

/**
 * 
 * @param {number[]} rgb 
 */
export const getHslFromRgb = (rgb) => {
  let r = rgb[0];
  let g = rgb[1];
  let b = rgb[2];
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  // Fix for h

  let r2 = rgb[0];
  let g2 = rgb[1];
  let b2 = rgb[2];
  r2 /= 255; g2 /= 255; b2 /= 255;

  const l2 = Math.max(r2, g2, b2);
  const s2 = l2 - Math.min(r2, g2, b2);
  const h2 = s2
    ? l2 === r2
      ? (g2 - b2) / s2
      : l2 === g2
        ? 2 + (b2 - r2) / s2
        : 4 + (r2 - g2) / s2
    : 0;

  return [
    Math.round(60 * h2 < 0 ? 60 * h2 + 360 : 60 * h2), 
    Math.round(s*100), 
    Math.round(l*100)
  ];
};

export const getHslFromHex = (hex) => {
  const rgb = getRgbFromHex(hex);
  return getHslFromRgb(rgb);
}

export const getHexFromHsl = (hsl) => {
  let h = hsl.h;
  let s = hsl.s;
  let l = hsl.l;
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export const getBestFontContrast = (hexColor, darkColor, lightColor) => {
  const rgb = getRgbFromHex(hexColor);
  let r = rgb[0];
  let g = rgb[1];
  let b = rgb[2];
  let uicolors = [r / 255, g / 255, b / 255];
  let c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  let L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
  return (L > 0.179) ? darkColor : lightColor;
}

export const parseHSL = (hslString) => {
  // Exemple d'entrée : "hsl(220deg, 25%, 66%)"
  const regex = /hsl\(\s*([\d.]+)(?:deg)?\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/i;
  const match = hslString.match(regex);

  if (!match) {
    throw new Error("Format HSL invalide : " + hslString);
  }

  return {
    h: Number(match[1]),
    s: Number(match[2]),
    l: Number(match[3])
  };
}