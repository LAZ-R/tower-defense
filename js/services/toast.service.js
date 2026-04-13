import { ICONS } from "../data/svgIcons.data.js";
import { getSvgIcon } from "./icons.service.js";

const toastContainerDom = document.getElementById('toastContainer');

export const showToast = (toastClass, message, duration = 2500) => {
  if (document.getElementById('toast') === null) {
    let toastStr = `
    <div id="toast" class="lzr-toast ${toastClass}">
    ${getSvgIcon(toastClass === 'lzr-success' ? 'circle-check' : toastClass === 'lzr-info' ? 'circle-info' : toastClass === 'lzr-error' ? 'circle-exclamation' : 'circle-info', 'm',  'var(--color--fg-0')}
      <span>${message}</span>
    </div>`;
    toastContainerDom.style.display = 'flex';
    toastContainerDom.innerHTML += toastStr;
    let toast = document.getElementById('toast');
    toast.classList.add('lzr-toast-in');
    setTimeout(() => {
      toast.classList.add('lzr-toast-out');
      setTimeout(() => {
        toast.remove();
      }, 250);
    }, duration);
  }
}
window.showToast = showToast;