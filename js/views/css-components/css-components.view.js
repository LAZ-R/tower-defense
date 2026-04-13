import { APP_NAME, APP_VERSION } from "../../../app-properties.js";
import { ICONS } from "../../data/svgIcons.data.js";
import { toExternalPath } from "../../router.js";
import { getSvgIcon } from "../../services/icons.service.js";
import { updateMenuDom } from "../../services/menu.service.js";
import { showToast } from "../../services/toast.service.js";
import { isLaptopOrUp, isPhone, isTablet } from "../../utils/breakpoints.js";

// VARIABLES //////////////////////////////////////////////////////////////////////////////////////
const HEADER_ICON_CONTAINER = document.getElementById('headerIconContainer');
const HEADER_TITLE = document.getElementById('headerTitle');
const MAIN = document.getElementById('main');
const FOOTER = document.getElementById('footer');
let scrollController = null;

const loremIpsum = `
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vitae imperdiet est, nec fringilla sem. Donec lectus ex, dignissim non vestibulum et, consectetur vitae erat. Phasellus et tortor nec risus semper rutrum porta vitae odio. Sed at mollis turpis. Integer pulvinar lobortis mi, lobortis dictum mi commodo in. Fusce augue metus, scelerisque ac molestie et, ultricies vitae purus. Sed at pharetra augue, at eleifend metus.
    <br>
    Aenean lorem odio, fringilla et hendrerit nec, hendrerit et felis. Maecenas interdum porta tellus, nec ultrices lectus commodo sit amet. Vivamus a turpis metus. Nunc mattis velit non enim aliquam volutpat. Aenean eleifend risus sed augue facilisis, congue pretium ipsum consequat. Suspendisse eu nulla placerat, mattis nisl eu, feugiat nisl. Nulla felis risus, aliquet eu posuere eu, imperdiet sed velit. Sed ac tellus cursus, mollis sapien id, dapibus nisl. Proin mauris nisi, blandit quis efficitur vulputate, venenatis ut nisl. Phasellus viverra quis nunc iaculis rutrum. Duis at tortor convallis, eleifend nunc venenatis, dapibus neque. Duis imperdiet mollis lacus mattis bibendum. Curabitur sit amet tellus gravida, viverra libero id, tincidunt orci.
  </p>
`;      
const options = `
  <option value="option 1" selected>option 1</option>
  <option value="option 2">option 2</option>
`;

// FUNCTIONS //////////////////////////////////////////////////////////////////////////////////////

export function render() {
  // Set MAIN layout
  MAIN.innerHTML = `
    <div class="page-container">
      ${ isLaptopOrUp ? `<h1>Composants CSS</h1>` : ''}
      <p class="lzr-margin-bottom">
        Ici, vous retrouverez la page de démo de mes composants en <span class="lzr-special-tag html"">HTML</span> <span class="lzr-special-tag css"">CSS</span> <span class="lzr-special-tag javascript"">JS</span>.
      </p>

      <nav class="lzr-list-menu">
        <span class="menu-title">Sections</span>
        <ul>
          <li><a class="lzr-button lzr-flat" href="${toExternalPath('/css-components#header_block')}">Header</a></li>
          <li><a class="lzr-button lzr-flat" href="${toExternalPath('/css-components#button_block')}">Button</a></li>
          <li><a class="lzr-button lzr-flat" href="${toExternalPath('/css-components#link_block')}">Link button</a></li>
          <li><a class="lzr-button lzr-flat" href="${toExternalPath('/css-components#file_input_block')}">File input button</a></li>
          <li><a class="lzr-button lzr-flat" href="${toExternalPath('/css-components#select_block')}">Select</a></li>
          <li><a class="lzr-button lzr-flat" href="${toExternalPath('/css-components#icon_block')}">Icône</a></li>
          <li><a class="lzr-button lzr-flat" href="${toExternalPath('/css-components#radio_block')}">Radio button</a></li>
          <li><a class="lzr-button lzr-flat" href="${toExternalPath('/css-components#checkbox_block')}">Checkbox</a></li>
          <li><a class="lzr-button lzr-flat" href="${toExternalPath('/css-components#drawer_block')}">Tiroir</a></li>
        </ul>
      </nav>

      <hr class="lzr-separator horizontal">  <!-- ##################################################################################### -->

      <h2 id="headers_block">Header</h2>
      <h1>Header h1</h1>
      <h2>Header h2</h2>
      <h3>Header h3</h3>
      <h4>Header h4</h4>
      <h5>Header h5</h5>
      <h6>Header h6</h6>

      <hr class="lzr-separator horizontal">  <!-- ##################################################################################### -->

      <h2 id="button_block">Button</h2>

      <code class="code lzr-margin-bottom width-100">
        <div class="code-header">HTML</div>
        <div class="code-body">
          <span class="comment">base</span><br>
          <span class="opening-tag">button <span class="tag-attribute">class=</span><span class="quotes">"lzr-button"</span></span>button<span class="closing-tag">button</span><br>
          <span class="opening-tag">button <span class="tag-attribute">class=</span><span class="quotes">"lzr-button lzr-pill"</span></span>button<span class="closing-tag">button</span><br>
          <br>
          <span class="comment">solid</span><br>
          <span class="opening-tag">button <span class="tag-attribute">class=</span><span class="quotes">"lzr-button lzr-solid"</span></span>lzr-solid<span class="closing-tag">button</span><br>
          <br>
          <span class="comment">outlined</span><br>
          <span class="opening-tag">button <span class="tag-attribute">class=</span><span class="quotes">"lzr-button lzr-outlined lzr-primary"</span></span>outlined lzr-primary<span class="closing-tag">button</span><br>
          <br>
          <span class="comment">flat</span><br>
          <span class="opening-tag">button <span class="tag-attribute">class=</span><span class="quotes">"lzr-button lzr-pill lzr-flat lzr-success"</span></span>pill lzr-flat lzr-success<span class="closing-tag">button</span>
        </div>
      </code>

      <h3>Base</h3>
      <h4>Default</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button">button</button>
      </div>
      <h4>pill</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button lzr-pill">button pill</button>
      </div>
      <h4>Round</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button lzr-round">${getSvgIcon('utensils')}</button>
      </div>
      <h4>Square</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button lzr-square">${getSvgIcon('utensils')}</button>
      </div>
      <div class="lzr-drawer lzr-solid lzr-error lzr-margin-bottom">
        <div class="tile-header">
          ${getSvgIcon('circle-exclamation')}
          <div>
            <span class="header-title">Problème connu avec les classes <span class="lzr-special-tag light">.lzr-round</span> et <span class="lzr-special-tag light">.lzr-square</span></span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox" checked>
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              <p class="lzr-margin-bottom">
                Ces classes utilisent la propriété CSS aspect-ratio.
              </p>
              <code class="code lzr-margin-bottom">
                <div class="code-header">CSS</div>
                <div class="code-body">aspect-ratio: 1;</div>
              </code>
              <p class="lzr-margin-bottom">
                Cette propriété CSS fonctionne très bien si 
                [longueur enfant(s)] >= [hauteur enfant(s)] 
                mais pas si 
                [longueur enfant(s)] < [hauteur enfant(s)]
              </p>
              <div class="lzr-row-wrap lzr-margin-bottom" style="align-items: center;">
                <button class="lzr-button lzr-round lzr-solid lzr-success"></button>
                <button class="lzr-button lzr-round lzr-solid lzr-success">${getSvgIcon('utensils')}</button>
                <button class="lzr-button lzr-round lzr-solid lzr-error">1</button>
                <button class="lzr-button lzr-round lzr-solid lzr-success">1234</button>
              </div>
              <div class="lzr-row-wrap" style="align-items: center;">
                <button class="lzr-button lzr-square lzr-solid lzr-success"></button>
                <button class="lzr-button lzr-square lzr-solid lzr-success">${getSvgIcon('utensils')}</button>
                <button class="lzr-button lzr-square lzr-solid lzr-error">1</button>
                <button class="lzr-button lzr-square lzr-solid lzr-success">1234</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <h3>Solid</h3>
      <h4>Default</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button lzr-solid" onclick="showToast('', 'Vous avez cliqué sur un élément interactif')">solid</button>
        <button class="lzr-button lzr-solid lzr-primary" onclick="showToast('lzr-primary', 'Vous avez cliqué sur un élément interactif')">solid primary</button>
        <button class="lzr-button lzr-solid lzr-success" onclick="showToast('lzr-success', 'Vous avez cliqué sur un élément interactif')">solid success</button>
        <button class="lzr-button lzr-solid lzr-info" onclick="showToast('lzr-info', 'Vous avez cliqué sur un élément interactif')">solid info</button>
        <button class="lzr-button lzr-solid lzr-error" onclick="showToast('lzr-error', 'Vous avez cliqué sur un élément interactif')">solid error</button>
      </div>
      <h4>pill</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button lzr-pill lzr-solid">pill solid</button>
        <button class="lzr-button lzr-pill lzr-solid lzr-primary">pill solid primary</button>
        <button class="lzr-button lzr-pill lzr-solid lzr-success">pill solid success</button>
        <button class="lzr-button lzr-pill lzr-solid lzr-info">pill solid info</button>
        <button class="lzr-button lzr-pill lzr-solid lzr-error">pill solid error</button>
      </div>
      <h4>Round</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button lzr-round lzr-solid">${getSvgIcon('clock')}</button>
        <button class="lzr-button lzr-round lzr-solid lzr-primary">${getSvgIcon('utensils')}</button>
        <button class="lzr-button lzr-round lzr-solid lzr-success">${getSvgIcon('circle-check')}</button>
        <button class="lzr-button lzr-round lzr-solid lzr-info">${getSvgIcon('circle-info')}</button>
        <button class="lzr-button lzr-round lzr-solid lzr-error">${getSvgIcon('circle-exclamation')}</button>
      </div>
      <h4>Square</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button lzr-square lzr-solid">${getSvgIcon('clock')}</button>
        <button class="lzr-button lzr-square lzr-solid lzr-primary">${getSvgIcon('utensils')}</button>
        <button class="lzr-button lzr-square lzr-solid lzr-success">${getSvgIcon('circle-check')}</button>
        <button class="lzr-button lzr-square lzr-solid lzr-info">${getSvgIcon('circle-info')}</button>
        <button class="lzr-button lzr-square lzr-solid lzr-error">${getSvgIcon('circle-exclamation')}</button>
      </div>
      <h3>Outlined</h3>
      <h4>Default</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button lzr-outlined">outlined</button>
        <button class="lzr-button lzr-outlined lzr-primary">outlined primary</button>
        <button class="lzr-button lzr-outlined lzr-success">outlined success</button>
        <button class="lzr-button lzr-outlined lzr-info">outlined info</button>
        <button class="lzr-button lzr-outlined lzr-error">outlined error</button>
      </div>
      <h4>pill</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button lzr-pill lzr-outlined">pill outlined</button>
        <button class="lzr-button lzr-pill lzr-outlined lzr-primary">pill outlined primary</button>
        <button class="lzr-button lzr-pill lzr-outlined lzr-success">pill outlined success</button>
        <button class="lzr-button lzr-pill lzr-outlined lzr-info">pill outlined info</button>
        <button class="lzr-button lzr-pill lzr-outlined lzr-error">pill outlined error</button>
      </div>
      <h4>Round</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button lzr-round lzr-outlined">${getSvgIcon('clock')}</button>
        <button class="lzr-button lzr-round lzr-outlined lzr-primary">${getSvgIcon('utensils')}</button>
        <button class="lzr-button lzr-round lzr-outlined lzr-success">${getSvgIcon('circle-check')}</button>
        <button class="lzr-button lzr-round lzr-outlined lzr-info">${getSvgIcon('circle-info')}</button>
        <button class="lzr-button lzr-round lzr-outlined lzr-error">${getSvgIcon('circle-exclamation')}</button>
      </div>
      <h4>Square</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button lzr-square lzr-outlined">${getSvgIcon('clock')}</button>
        <button class="lzr-button lzr-square lzr-outlined lzr-primary">${getSvgIcon('utensils')}</button>
        <button class="lzr-button lzr-square lzr-outlined lzr-success">${getSvgIcon('circle-check')}</button>
        <button class="lzr-button lzr-square lzr-outlined lzr-info">${getSvgIcon('circle-info')}</button>
        <button class="lzr-button lzr-square lzr-outlined lzr-error">${getSvgIcon('circle-exclamation')}</button>
      </div>
      <h3>Flat</h3>
      <h4>Default</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button lzr-flat">flat</button>
        <button class="lzr-button lzr-flat lzr-primary">flat primary</button>
        <button class="lzr-button lzr-flat lzr-success">flat success</button>
        <button class="lzr-button lzr-flat lzr-info">flat info</button>
        <button class="lzr-button lzr-flat lzr-error">flat error</button>
      </div>
      <h4>pill</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button lzr-pill lzr-flat">pill flat</button>
        <button class="lzr-button lzr-pill lzr-flat lzr-primary">pill flat primary</button>
        <button class="lzr-button lzr-pill lzr-flat lzr-success">pill flat success</button>
        <button class="lzr-button lzr-pill lzr-flat lzr-info">pill flat info</button>
        <button class="lzr-button lzr-pill lzr-flat lzr-error">pill flat error</button>
      </div>
      <h4>Round</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button lzr-round lzr-flat">${getSvgIcon('clock')}</button>
        <button class="lzr-button lzr-round lzr-flat lzr-primary">${getSvgIcon('utensils')}</button>
        <button class="lzr-button lzr-round lzr-flat lzr-success">${getSvgIcon('circle-check')}</button>
        <button class="lzr-button lzr-round lzr-flat lzr-info">${getSvgIcon('circle-info')}</button>
        <button class="lzr-button lzr-round lzr-flat lzr-error">${getSvgIcon('circle-exclamation')}</button>
      </div>
      <h4>Square</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button lzr-square lzr-flat">${getSvgIcon('clock')}</button>
        <button class="lzr-button lzr-square lzr-flat lzr-primary">${getSvgIcon('utensils')}</button>
        <button class="lzr-button lzr-square lzr-flat lzr-success">${getSvgIcon('circle-check')}</button>
        <button class="lzr-button lzr-square lzr-flat lzr-info">${getSvgIcon('circle-info')}</button>
        <button class="lzr-button lzr-square lzr-flat lzr-error">${getSvgIcon('circle-exclamation')}</button>
      </div>
      <h3>Exemples</h3>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button lzr-solid lzr-success">${getSvgIcon('circle-check')}Confirmer</button>
        <button class="lzr-button lzr-outlined lzr-error">${getSvgIcon('circle-exclamation')}STOP</button>
        <button class="lzr-button lzr-flat lzr-info">${getSvgIcon('circle-info')}Détails</button>
      </div>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button class="lzr-button lzr-pill lzr-flat">${getSvgIcon('shop')}Commerces</button>
        <button class="lzr-button lzr-pill lzr-flat">${getSvgIcon('bed')}Logements</button>
        <button class="lzr-button lzr-pill lzr-flat">${getSvgIcon('utensils')}Restauration</button>
      </div>

      <hr class="lzr-separator horizontal"> <!-- ##################################################################################### -->

      <h2 id="link_block">Link button</h2>

      <code class="code lzr-margin-bottom width-100">
        <div class="code-header">HTML</div>
        <div class="code-body">
          <span class="comment">base</span><br>
          <span class="opening-tag">a <span class="tag-attribute">href=</span><span class="quotes">"#"</span> <span class="tag-attribute">class=</span><span class="quotes">"lzr-button"</span></span>link button<span class="closing-tag">a</span><br>
          <br>
          <span class="comment">solid</span><br>
          <span class="opening-tag">a <span class="tag-attribute">href=</span><span class="quotes">"#"</span> <span class="tag-attribute">class=</span><span class="quotes">"lzr-button lzr-solid"</span></span>solid<span class="closing-tag">a</span><br>
          <br>
          <span class="comment">outlined</span><br>
          <span class="opening-tag">a <span class="tag-attribute">href=</span><span class="quotes">"#"</span> <span class="tag-attribute">class=</span><span class="quotes">"lzr-button lzr-outlined lzr-primary"</span></span>outlined primary<span class="closing-tag">a</span><br>
          <br>
          <span class="comment">flat</span><br>
          <span class="opening-tag">a <span class="tag-attribute">href=</span><span class="quotes">"#"</span> <span class="tag-attribute">class=</span><span class="quotes">"lzr-button lzr-flat lzr-pill lzr-success"</span></span>flat success<span class="closing-tag">a</span>
        </div>
      </code>

      <h3>Base</h3>
      <h4>Default</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <a href="#" class="lzr-button">link button</a>
      </div>
      <h4>pill</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <a href="#" class="lzr-button lzr-pill">link button</a>
      </div>
      <h3>Solid</h3>
      <h4>Default</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <a href="#" class="lzr-button lzr-solid">solid</a>
        <a href="#" class="lzr-button lzr-solid lzr-primary">solid primary</a>
        <a href="#" class="lzr-button lzr-solid lzr-success">solid success</a>
        <a href="#" class="lzr-button lzr-solid lzr-info">solid info</a>
        <a href="#" class="lzr-button lzr-solid lzr-error">solid error</a>
      </div>
      <h4>pill</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <a href="#" class="lzr-button lzr-pill lzr-solid">pill solid</a>
        <a href="#" class="lzr-button lzr-pill lzr-solid lzr-primary">pill solid primary</a>
        <a href="#" class="lzr-button lzr-pill lzr-solid lzr-success">pill solid success</a>
        <a href="#" class="lzr-button lzr-pill lzr-solid lzr-info">pill solid info</a>
        <a href="#" class="lzr-button lzr-pill lzr-solid lzr-error">pill solid error</a>
      </div>
      <h3>Outlined</h3>
      <h4>Default</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <a href="#" class="lzr-button lzr-outlined">outlined</a>
        <a href="#" class="lzr-button lzr-outlined lzr-primary">outlined primary</a>
        <a href="#" class="lzr-button lzr-outlined lzr-success">outlined success</a>
        <a href="#" class="lzr-button lzr-outlined lzr-info">outlined info</a>
        <a href="#" class="lzr-button lzr-outlined lzr-error">outlined error</a>
      </div>
      <h4>pill</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <a href="#" class="lzr-button lzr-pill lzr-outlined">pill outlined</a>
        <a href="#" class="lzr-button lzr-pill lzr-outlined lzr-primary">pill outlined primary</a>
        <a href="#" class="lzr-button lzr-pill lzr-outlined lzr-success">pill outlined success</a>
        <a href="#" class="lzr-button lzr-pill lzr-outlined lzr-info">pill outlined info</a>
        <a href="#" class="lzr-button lzr-pill lzr-outlined lzr-error">pill outlined error</a>
      </div>
      <h3>Flat</h3>
      <h4>Default</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <a href="#" class="lzr-button lzr-flat">flat</a>
        <a href="#" class="lzr-button lzr-flat lzr-primary">flat primary</a>
        <a href="#" class="lzr-button lzr-flat lzr-success">flat success</a>
        <a href="#" class="lzr-button lzr-flat lzr-info">flat info</a>
        <a href="#" class="lzr-button lzr-flat lzr-error">flat error</a>
      </div>
      <h4>pill</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <a href="#" class="lzr-button lzr-pill lzr-flat">pill flat</a>
        <a href="#" class="lzr-button lzr-pill lzr-flat lzr-primary">pill flat primary</a>
        <a href="#" class="lzr-button lzr-pill lzr-flat lzr-success">pill flat success</a>
        <a href="#" class="lzr-button lzr-pill lzr-flat lzr-info">pill flat info</a>
        <a href="#" class="lzr-button lzr-pill lzr-flat lzr-error">pill flat error</a>
      </div>

      <h3>Exemples</h3>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <a href="#" class="lzr-button lzr-solid">link button solid</a>
        <a href="#" class="lzr-button lzr-pill lzr-solid lzr-info">${getSvgIcon('circle-info')}link button pill solid info</a>
        <a href="#" class="lzr-button lzr-pill lzr-outlined lzr-error">${getSvgIcon('arrows-rotate')}link button pill outlined error</a>
        <a href="#" class="lzr-button lzr-flat lzr-primary">link button flat primary</a>
      </div>

      <hr class="lzr-separator horizontal">  <!-- ##################################################################################### -->

      <h2 id="file_input_block">File input button</h2>

      <code class="code lzr-margin-bottom width-100">
        <div class="code-header">HTML</div>
        <div class="code-body">
          <span class="comment">base</span><br>
          <span class="input-tag">input <span class="tag-attribute">type=</span><span class="quotes">"file"</span> <span class="tag-attribute">accept=</span><span class="quotes">".txt"</span> <span class="tag-attribute">class=</span><span class="quotes">"lzr-button"</span></span><br>
          <br>
          <span class="comment">solid</span><br>
          <span class="input-tag">input <span class="tag-attribute">type=</span><span class="quotes">"file"</span> <span class="tag-attribute">accept=</span><span class="quotes">".txt"</span> <span class="tag-attribute">class=</span><span class="quotes">"lzr-button lzr-solid"</span></span><br>
          <br>
          <span class="comment">outlined</span><br>
          <span class="input-tag">input <span class="tag-attribute">type=</span><span class="quotes">"file"</span> <span class="tag-attribute">accept=</span><span class="quotes">".txt"</span> <span class="tag-attribute">class=</span><span class="quotes">"lzr-button lzr-outlined"</span></span><br>
          <br>
          <span class="comment">flat</span><br>
          <span class="input-tag">input <span class="tag-attribute">type=</span><span class="quotes">"file"</span> <span class="tag-attribute">accept=</span><span class="quotes">".txt"</span> <span class="tag-attribute">class=</span><span class="quotes">"lzr-button lzr-flat"</span></span><br>
        </div>
      </code>

      <h3>Base</h3>
      <h4>Default</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <input type="file" class="lzr-button" accept=".txt" />
      </div>
      <h4>pill</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <input type="file" class="lzr-button lzr-pill" accept=".txt" />
      </div>

      <h3>Solid</h3>
      <h4>Default</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <input type="file" class="lzr-button lzr-solid" accept=".txt" />
        <input type="file" class="lzr-button lzr-solid lzr-primary" accept=".txt" />
        <input type="file" class="lzr-button lzr-solid lzr-success" accept=".txt" />
        <input type="file" class="lzr-button lzr-solid lzr-info" accept=".txt" />
        <input type="file" class="lzr-button lzr-solid lzr-error" accept=".txt" />
      </div>
      <h4>pill</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <input type="file" class="lzr-button lzr-pill lzr-solid" accept=".txt" />
        <input type="file" class="lzr-button lzr-pill lzr-solid lzr-primary" accept=".txt" />
        <input type="file" class="lzr-button lzr-pill lzr-solid lzr-success" accept=".txt" />
        <input type="file" class="lzr-button lzr-pill lzr-solid lzr-info" accept=".txt" />
        <input type="file" class="lzr-button lzr-pill lzr-solid lzr-error" accept=".txt" />
      </div>

      <h3>Outlined</h3>
      <h4>Default</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <input type="file" class="lzr-button lzr-outlined" accept=".txt" />
        <input type="file" class="lzr-button lzr-outlined lzr-primary" accept=".txt" />
        <input type="file" class="lzr-button lzr-outlined lzr-success" accept=".txt" />
        <input type="file" class="lzr-button lzr-outlined lzr-info" accept=".txt" />
        <input type="file" class="lzr-button lzr-outlined lzr-error" accept=".txt" />
      </div>
      <h4>pill</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <input type="file" class="lzr-button lzr-pill lzr-outlined" accept=".txt" />
        <input type="file" class="lzr-button lzr-pill lzr-outlined lzr-primary" accept=".txt" />
        <input type="file" class="lzr-button lzr-pill lzr-outlined lzr-success" accept=".txt" />
        <input type="file" class="lzr-button lzr-pill lzr-outlined lzr-info" accept=".txt" />
        <input type="file" class="lzr-button lzr-pill lzr-outlined lzr-error" accept=".txt" />
      </div>

      <h3>Flat</h3>
      <h4>Default</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <input type="file" class="lzr-button lzr-flat" accept=".txt" />
        <input type="file" class="lzr-button lzr-flat lzr-primary" accept=".txt" />
        <input type="file" class="lzr-button lzr-flat lzr-success" accept=".txt" />
        <input type="file" class="lzr-button lzr-flat lzr-info" accept=".txt" />
        <input type="file" class="lzr-button lzr-flat lzr-error" accept=".txt" />
      </div>
      <h4>pill</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <input type="file" class="lzr-button lzr-pill lzr-flat" accept=".txt" />
        <input type="file" class="lzr-button lzr-pill lzr-flat lzr-primary" accept=".txt" />
        <input type="file" class="lzr-button lzr-pill lzr-flat lzr-success" accept=".txt" />
        <input type="file" class="lzr-button lzr-pill lzr-flat lzr-info" accept=".txt" />
        <input type="file" class="lzr-button lzr-pill lzr-flat lzr-error" accept=".txt" />
      </div>

      <h3>Exemples</h3>



      <hr class="lzr-separator horizontal">  <!-- ##################################################################################### -->

      <h2 id="select_block">Select</h2>

      <code class="code lzr-margin-bottom width-100">
        <div class="code-header">HTML</div>
        <div class="code-body">
          <span class="comment">base</span><br>
          <span class="opening-tag">select <span class="tag-attribute">class=</span><span class="quotes">"lzr-select"</span></span><br>
          <span class="indent">00</span><span class="opening-tag">option <span class="tag-attribute">value=</span><span class="quotes">"option1"</span><span class="tag-attribute">selected</span></span>option 1<span class="closing-tag">option</span><br>
          <span class="indent">00</span><span class="opening-tag">option <span class="tag-attribute">value=</span><span class="quotes">"option2"</span></span>option 2<span class="closing-tag">option</span><br>
          <span class="closing-tag">select</span><br>
          <br>
          <span class="comment">solid</span><br>
          <span class="opening-tag">select <span class="tag-attribute">class=</span><span class="quotes">"lzr-select lzr-solid"</span></span><br>
          <span class="indent">00</span><span class="opening-tag">option <span class="tag-attribute">value=</span><span class="quotes">"option1"</span><span class="tag-attribute">selected</span></span>option 1<span class="closing-tag">option</span><br>
          <span class="indent">00</span><span class="opening-tag">option <span class="tag-attribute">value=</span><span class="quotes">"option2"</span></span>option 2<span class="closing-tag">option</span><br>
          <span class="closing-tag">select</span><br>
          <br>
          <span class="comment">outlined</span><br>
          <span class="opening-tag">select <span class="tag-attribute">class=</span><span class="quotes">"lzr-select lzr-pill lzr-outlined lzr-primary"</span></span><br>
          <span class="indent">00</span><span class="opening-tag">option <span class="tag-attribute">value=</span><span class="quotes">"option1"</span><span class="tag-attribute">selected</span></span>option 1<span class="closing-tag">option</span><br>
          <span class="indent">00</span><span class="opening-tag">option <span class="tag-attribute">value=</span><span class="quotes">"option2"</span></span>option 2<span class="closing-tag">option</span><br>
          <span class="closing-tag">select</span><br>
          <br>
          <span class="comment">flat</span><br>
          <span class="opening-tag">select <span class="tag-attribute">class=</span><span class="quotes">"lzr-select lzr-flat lzr-error"</span></span><br>
          <span class="indent">00</span><span class="opening-tag">option <span class="tag-attribute">value=</span><span class="quotes">"option1"</span><span class="tag-attribute">selected</span></span>option 1<span class="closing-tag">option</span><br>
          <span class="indent">00</span><span class="opening-tag">option <span class="tag-attribute">value=</span><span class="quotes">"option2"</span></span>option 2<span class="closing-tag">option</span><br>
          <span class="closing-tag">select</span><br>
        </div>
      </code>

      <h3>Base</h3>
      <h4>Default</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <select class="lzr-select">
          ${options}
        </select>
      </div>
      <h4>pill</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <select class="lzr-select lzr-pill">
          ${options}
        </select>
      </div>
      <h3>lzr-solid</h3>
      <h4>Default</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <select class="lzr-select lzr-solid">
          ${options}
        </select>
        <select class="lzr-select lzr-solid lzr-primary">
          ${options}
        </select>
        <select class="lzr-select lzr-solid lzr-success">
          ${options}
        </select>
        <select class="lzr-select lzr-solid lzr-info">
          ${options}
        </select>
        <select class="lzr-select lzr-solid lzr-error">
          ${options}
        </select>
      </div>
      <h4>pill</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <select class="lzr-select lzr-pill lzr-solid">
          ${options}
        </select>
        <select class="lzr-select lzr-pill lzr-solid lzr-primary">
          ${options}
        </select>
        <select class="lzr-select lzr-pill lzr-solid lzr-success">
          ${options}
        </select>
        <select class="lzr-select lzr-pill lzr-solid lzr-info">
          ${options}
        </select>
        <select class="lzr-select lzr-pill lzr-solid lzr-error">
          ${options}
        </select>
      </div>
      <h3>Oulined</h3>
      <h4>Default</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <select class="lzr-select lzr-outlined">
          ${options}
        </select>
        <select class="lzr-select lzr-outlined lzr-primary">
          ${options}
        </select>
        <select class="lzr-select lzr-outlined lzr-success">
          ${options}
        </select>
        <select class="lzr-select lzr-outlined lzr-info">
          ${options}
        </select>
        <select class="lzr-select lzr-outlined lzr-error">
          ${options}
        </select>
      </div>
      <h4>pill</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <select class="lzr-select lzr-pill lzr-outlined">
          ${options}
        </select>
        <select class="lzr-select lzr-pill lzr-outlined lzr-primary">
          ${options}
        </select>
        <select class="lzr-select lzr-pill lzr-outlined lzr-success">
          ${options}
        </select>
        <select class="lzr-select lzr-pill lzr-outlined lzr-info">
          ${options}
        </select>
        <select class="lzr-select lzr-pill lzr-outlined lzr-error">
          ${options}
        </select>
      </div>
      <h3>Flat</h3>
      <h4>Default</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <select class="lzr-select lzr-flat">
          ${options}
        </select>
        <select class="lzr-select lzr-flat lzr-primary">
          ${options}
        </select>
        <select class="lzr-select lzr-flat lzr-success">
          ${options}
        </select>
        <select class="lzr-select lzr-flat lzr-info">
          ${options}
        </select>
        <select class="lzr-select lzr-flat lzr-error">
          ${options}
        </select>
      </div>
      <h4>pill</h4>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <select class="lzr-select lzr-pill lzr-flat">
          ${options}
        </select>
        <select class="lzr-select lzr-pill lzr-flat lzr-primary">
          ${options}
        </select>
        <select class="lzr-select lzr-pill lzr-flat lzr-success">
          ${options}
        </select>
        <select class="lzr-select lzr-pill lzr-flat lzr-info">
          ${options}
        </select>
        <select class="lzr-select lzr-pill lzr-flat lzr-error">
          ${options}
        </select>
      </div>

      <hr class="lzr-separator horizontal"> <!-- ##################################################################################### -->

      <h2 id="icon_block">Icône</h2>

      <h3>Icônes disponibles</h3>
      <div class="lzr-row-wrap lzr-margin-bottom" style="align-items: flex-start;">
        ${getIconsDom()}
      </div>

      <h3>Tailles</h3>
      <div class="lzr-row-wrap lzr-margin-bottom" style="align-items: flex-end">
        <div class="lzr-icon-block">
          ${getSvgIcon('lzr', 'xxs')}
          <span>xxs</span>
          <span>8px x 8px</span>
        </div>
        <div class="lzr-icon-block">
          ${getSvgIcon('lzr', 'xs')}
          <span>xs</span>
          <span>12px x 12px</span>
        </div>
        <div class="lzr-icon-block">
          ${getSvgIcon('lzr', 's')}
          <span>s</span>
          <span>16px x 16px</span>
        </div>
        <div class="lzr-icon-block">
          ${getSvgIcon('lzr', 'm')}
          <span>m</span>
          <span>20px x 20px</span>
        </div>
        <div class="lzr-icon-block">
          ${getSvgIcon('lzr', 'l')}
          <span>l</span>
          <span>24px x 24px</span>
        </div>
        <div class="lzr-icon-block">
          ${getSvgIcon('lzr', 'xl')}
          <span>xl</span>
          <span>36px x 36px</span>
        </div>
        <div class="lzr-icon-block">
          ${getSvgIcon('lzr', 'xxl')}
          <span>xxl</span>
          <span>48px x 48px</span>
        </div>
      </div>
      <!-- <h3>Icône par défault</h3>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <button onclick="onButtonClick('lzr-info')" class="lzr-button lzr-flat">${getSvgIcon()}list | size: M</button>
        <button onclick="onButtonClick('lzr-primary')" class="lzr-button lzr-solid lzr-primary">${getSvgIcon()}list | size: M</button>
        <button onclick="onButtonClick('lzr-success')" class="lzr-button lzr-solid lzr-success">${getSvgIcon()}list | size: M</button>
        <button onclick="onButtonClick('lzr-info')" class="lzr-button lzr-solid lzr-info">${getSvgIcon()}list | size: M</button>
        <button onclick="onButtonClick('lzr-error')" class="lzr-button lzr-solid lzr-error">${getSvgIcon()}list | size: M</button>
      </div> -->
      <h3>Couleurs</h3>
      <div class="lzr-row-wrap lzr-margin-bottom">
        <div class="lzr-icon-block">
          ${getSvgIcon('lzr', 'xl'  , null)}
          <span>null</span>
        </div>
        <div class="lzr-icon-block">
          ${getSvgIcon('heart', 'xl'  , 'var(--color--primary)')}
          <span>primary</span>
        </div>
        <div class="lzr-icon-block">
          ${getSvgIcon('circle-check', 'xl'  , 'var(--color--success)')}
          <span>success</span>
        </div>
        <div class="lzr-icon-block">
          ${getSvgIcon('circle-info', 'xl'  , 'var(--color--info)')}
          <span>info</span>
        </div>
        <div class="lzr-icon-block">
          ${getSvgIcon('circle-exclamation', 'xl'  , 'var(--color--error)')}
          <span>error</span>
        </div>
      </div>

      <hr class="lzr-separator horizontal"> <!-- ##################################################################################### -->

      <h2 id="radio_block">Radio button</h2>

      <div class="lzr-radio-group">
        <div class="lzr-radio-raw">
          <input type="radio" class="lzr-radio" id="radioOption1" name="theme" value="radioOption1" checked />
          <label for="radioOption1">Option 1</label>
        </div>

        <div class="lzr-radio-raw">
          <input type="radio" class="lzr-radio" id="radioOption2" name="theme" value="radioOption2" />
          <label for="radioOption2">Option 2</label>
        </div>

        <div class="lzr-radio-raw">
          <input type="radio" class="lzr-radio" id="radioOption3" name="theme" value="radioOption3" />
          <label for="radioOption3">Option 3</label>
        </div>
      </div>

      <hr class="lzr-separator horizontal"> <!-- ##################################################################################### -->

      <h2 id="checkbox_block">Checkbox</h2>

      <div class="lzr-checkbox-group">
        <div class="lzr-checkbox-raw">
          <input type="checkbox" class="lzr-checkbox" id="checkboxOption1" name="theme" value="checkboxOption1" checked />
          <label for="checkboxOption1">Option 1</label>
        </div>

        <div class="lzr-checkbox-raw">
          <input type="checkbox" class="lzr-checkbox" id="checkboxOption2" name="theme" value="checkboxOption2" />
          <label for="checkboxOption2">Option 2</label>
        </div>

        <div class="lzr-checkbox-raw">
          <input type="checkbox" class="lzr-checkbox" id="checkboxOption3" name="theme" value="checkboxOption3" />
          <label for="checkboxOption3">Option 3</label>
        </div>
      </div>

      <hr class="lzr-separator horizontal">  <!-- ##################################################################################### -->

      <h2 id="drawer_block">Tiroir</h2>

      <h3>Base</h3>
      <div class="lzr-drawer lzr-margin-bottom">
        <div class="tile-header">
          <div>
            <span class="header-title">Title</span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              ${loremIpsum}
            </div>
          </div>
        </div>
      </div>

      <h3>Solid</h3>
      <div class="lzr-drawer lzr-solid lzr-margin-bottom">
        <div class="tile-header">
          <div>
            <span class="header-title">Title</span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              ${loremIpsum}
            </div>
          </div>
        </div>
      </div>

      <div class="lzr-drawer lzr-solid lzr-primary lzr-margin-bottom">
        <div class="tile-header">
          <div>
            <span class="header-title">Title</span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              ${loremIpsum}
            </div>
          </div>
        </div>
      </div>

      <div class="lzr-drawer lzr-solid lzr-success lzr-margin-bottom">
        <div class="tile-header">
          <div>
            <span class="header-title">Title</span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              ${loremIpsum}
            </div>
          </div>
        </div>
      </div>

      <div class="lzr-drawer lzr-solid lzr-info lzr-margin-bottom">
        <div class="tile-header">
          <div>
            <span class="header-title">Title</span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              ${loremIpsum}
            </div>
          </div>
        </div>
      </div>

      <div class="lzr-drawer lzr-solid lzr-error lzr-margin-bottom">
        <div class="tile-header">
          <div>
            <span class="header-title">Title</span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              ${loremIpsum}
            </div>
          </div>
        </div>
      </div>

      <h3>Outlined</h3>
      <div class="lzr-drawer lzr-outlined lzr-margin-bottom">
        <div class="tile-header">
          <div>
            <span class="header-title">Title</span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              ${loremIpsum}
            </div>
          </div>
        </div>
      </div>

      <div class="lzr-drawer lzr-outlined lzr-primary lzr-margin-bottom">
        <div class="tile-header">
          <div>
            <span class="header-title">Title</span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              ${loremIpsum}
            </div>
          </div>
        </div>
      </div>

      <div class="lzr-drawer lzr-outlined lzr-success lzr-margin-bottom">
        <div class="tile-header">
          <div>
            <span class="header-title">Title</span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              ${loremIpsum}
            </div>
          </div>
        </div>
      </div>

      <div class="lzr-drawer lzr-outlined lzr-info lzr-margin-bottom">
        <div class="tile-header">
          <div>
            <span class="header-title">Title</span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              ${loremIpsum}
            </div>
          </div>
        </div>
      </div>

      <div class="lzr-drawer lzr-outlined lzr-error lzr-margin-bottom">
        <div class="tile-header">
          <div>
            <span class="header-title">Title</span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              ${loremIpsum}
            </div>
          </div>
        </div>
      </div>

      <h3>Flat</h3>
      <div class="lzr-drawer lzr-flat lzr-margin-bottom">
        <div class="tile-header">
          <div>
            <span class="header-title">Title</span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              ${loremIpsum}
            </div>
          </div>
        </div>
      </div>

      <div class="lzr-drawer lzr-flat lzr-primary lzr-margin-bottom">
        <div class="tile-header">
          <div>
            <span class="header-title">Title</span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              ${loremIpsum}
            </div>
          </div>
        </div>
      </div>

      <div class="lzr-drawer lzr-flat lzr-success lzr-margin-bottom">
        <div class="tile-header">
          <div>
            <span class="header-title">Title</span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              ${loremIpsum}
            </div>
          </div>
        </div>
      </div>

      <div class="lzr-drawer lzr-flat lzr-info lzr-margin-bottom">
        <div class="tile-header">
          <div>
            <span class="header-title">Title</span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              ${loremIpsum}
            </div>
          </div>
        </div>
      </div>

      <div class="lzr-drawer lzr-flat lzr-error lzr-margin-bottom">
        <div class="tile-header">
          <div>
            <span class="header-title">Title</span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              ${loremIpsum}
            </div>
          </div>
        </div>
      </div>

      <h3>Exemples</h3>

      <div class="lzr-drawer lzr-flat lzr-info box-shadow lzr-margin-bottom" style="width: 50%;">
        <div class="tile-header">
          ${getSvgIcon('circle-info')}
          <div>
            <span class="header-title">Title</span>
            <span class="header-sub-title">Sub-title</span>
          </div>
          <div class="tile-caret">
          ${getSvgIcon('chevron-right', 'm', null)}
          </div>
          <input type="checkbox">
        </div>
        <div class="expandable-wrapper">
          <div class="expandable-inner">
            <div class="inner-body">
              ${loremIpsum}
            </div>
          </div>
        </div>
      </div>
    </div>
    <button id="scrollButton" class="lzr-button lzr-square" onclick="scrollToTop()">${getSvgIcon('angles-up')}</button>
  `;

  // Set FOOTER layout
  FOOTER.innerHTML = ``;

  updateMenuDom('css-components');

  const scrollButton = document.getElementById('scrollButton');

  // 1) Nettoie l'ancien listener si la view est re-render
  scrollController?.abort();

  // 2) Nouveau controller pour CE render
  scrollController = new AbortController();

  // 3) Ajout du listener avec signal
  MAIN.addEventListener('scroll', () => {
    if (MAIN.scrollTop > 100) {
      scrollButton.style.display = 'flex';
    } else {
      scrollButton.style.display = 'none';
    }
  }, {
    signal: scrollController.signal
  });

  // Set HEADER layout
  if (isPhone || isTablet) {
    HEADER_TITLE.innerHTML = 'Composants CSS';
  }
  if (isLaptopOrUp) {
    HEADER_TITLE.innerHTML = APP_NAME;
  }
}

export function getPageState() {
  return {
    scrollTop: MAIN.scrollTop,
  };
}

export function restorePageState(state) {
  if (typeof state?.scrollTop === 'number') {
    //MAIN.scrollTop = state.scrollTop;
    MAIN.style.scrollBehavior = 'auto';
    MAIN.scroll({
      top: state.scrollTop,
      left: 0,
      behavior: "auto",
    });
    setTimeout(() => {
      MAIN.style.scrollBehavior = 'smooth';
    }, 1000);
  }
}

///////////////////////////////////////////////////////////////////////////////

function scrollToTop() {
  MAIN.scroll({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
}
window.scrollToTop = scrollToTop;

function getIconsDom() {
  let str = '';
  for (let icon of ICONS) {
    str += `
      <div class="lzr-icon-block fixed">
        ${getSvgIcon(icon.name, 'l')}
        <span>${icon.name}</span>
      </div>
    `;
  }
  return str;
}