import { requestWakeLock } from "../utils/wakelock.js";
import { getUser, setUser } from "./storage.service.js";

export function onThemeClick(theme) {
  let user = getUser();
  if (user.PREFERED_THEME != theme) {
    user.PREFERED_THEME = theme;
    setUser(user);
    document.getElementsByClassName('lzr')[0].style = `
      --theme: '${user.PREFERED_THEME}';
      --font-family--user: '${user.IS_ACCESSIBLE_FONT ? 'open-dyslexic' : 'inter-var'}';
    ';`;
  }
};
window.onThemeClick = onThemeClick;

export function onKeepScreenAwakeClick(event) {
  const isChecked = event.srcElement.checked;
  let user = getUser();
  user.KEEP_SCREEN_AWAKE = isChecked;
  setUser(user);
  if (isChecked) {
    requestWakeLock();
  }
}
window.onKeepScreenAwakeClick = onKeepScreenAwakeClick;

export function onOpenDyslexicClick(event) {
  const isChecked = event.srcElement.checked;
  let user = getUser();
  user.IS_ACCESSIBLE_FONT = isChecked;
  setUser(user);

  document.getElementsByClassName('lzr')[0].style = `
    --theme: '${user.PREFERED_THEME}';
    --font-family--user: '${user.IS_ACCESSIBLE_FONT ? 'open-dyslexic' : 'inter-var'}';
  `;
}
window.onOpenDyslexicClick = onOpenDyslexicClick;
