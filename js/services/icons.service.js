import { ICONS } from "../data/svgIcons.data.js";

const getSvgObjectByIconName = (iconName) => {
  let icons = ICONS.filter((i) => i.name == iconName);
  let icon = '';
  if (icons.length != 0) {
    icon = icons[0];
  } else {
    icon = null;
  }
  return icon;
}

export const getSvgIcon = (iconName, size, color, id, additionalCssClasses) => {
  let str = '';
  let icon = getSvgObjectByIconName((iconName == '' || iconName == null || iconName == undefined) ? 'lzr' : iconName);
  if (icon != null) {
    str = `
      <svg id="${id}" style="${(color == '' || color == null || color == undefined) ? '' : `--color: ${color}`}" class="lzr-icon ${(size == '' || size == null || size == undefined) ? 'm' : size} ${(additionalCssClasses == '' || additionalCssClasses == null || additionalCssClasses == undefined) ? '' : additionalCssClasses}" viewBox="${icon.viewbox}" xmlns="http://www.w3.org/2000/svg">
        <path d="${icon.path_d}" />
      </svg>`;
  } else {
    str = '';
  }
  return str;
}