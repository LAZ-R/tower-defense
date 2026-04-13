import { getHexFromHsl, parseHSL } from './colors.js';
import './filterMagic.js';
import { hexToRgb, Color, Solver } from './filterMagic.js';

export const getFilterStringForHexValue = (hexValue) => {
  const rgb = hexToRgb(hexValue);
  if (rgb.length !== 3) {
    return;
  }
  const color = new Color(rgb[0], rgb[1], rgb[2]);
  const solver = new Solver(color);
  let result = solver.solve();
  let isUnacceptable = result.loss > 10 ? true : false;
  while (isUnacceptable) {
    result = solver.solve();
    isUnacceptable = result.loss > 10 ? true : false;
  }
  const completeFilter = result.filter;
  return `brightness(0) saturate(100%) ${completeFilter.split(': ')[1]}`;
}

export const getFilterStringForHslString = (hslString) => {
  const hslObject = parseHSL(hslString);
  const hex = getHexFromHsl(hslObject).replace(/^#/, "");
  return getFilterStringForHexValue(hex);
}