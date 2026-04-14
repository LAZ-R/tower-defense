import { APP_NAME, APP_VERSION } from "../../../app-properties.js";
import { ICONS } from "../../data/svgIcons.data.js";
import { toExternalPath } from "../../router.js";
import { getSvgIcon } from "../../services/icons.service.js";
import { updateMenuDom } from "../../services/menu.service.js";
import { showToast } from "../../services/toast.service.js";
import { isLaptopOrUp, isPhone, isTablet } from "../../utils/breakpoints.js";
import { getAdaptiveVerboseTimeStringByMilliseconds, getFullVerboseTimeStringByMilliseconds } from "../../utils/dateAndTime.utils.js";
import { getRandomIntegerBetween } from "../../utils/math.utils.js";

const HEADER_ICON_CONTAINER = document.getElementById('headerIconContainer');
const HEADER_TITLE = document.getElementById('headerTitle');
const MAIN = document.getElementById('main');
const FOOTER = document.getElementById('footer');



const GRID_SIZE = 33;
const MIDDLE_GRID_VALUE = Math.floor(GRID_SIZE / 2);
let activeTime = 700;
let currentKillScore = 0;

let currentStartingTime = 0;
let currentGameTimeout = null;
let currentTimeTimeout = null;

const startingSpawnProbability = 50;
let spawnProbability = 50;

let isPlaying = false;

let gridState = [];

let lastShockwaveUse = 0;
const SHOCKWAVE_COOLDOWN = 6000; // 6s

let lastHealUse = 0;
const HEAL_COOLDOWN = 4000; // 4s

let heat = {
  electricity: 0,
  laser: 0,
  shockwave: 0,
  heal: 0
};

const HEAT_MAX = 100;

const HEAT_COST = {
  electricity: 15,
  laser: 25,
  shockwave: 40,
  heal: 30
};

const HEAT_COOLDOWN = {
  electricity: 2,
  laser: 6,
  shockwave: 12,
  heal: 12
};

const HEAT_COLORS = {
  color1: 'hsl(180, 100%, 50%)', // 0 ; 25
  color2: 'hsl(120, 100%, 50%)', // 25 ; 50
  color3: 'hsl(60, 100%, 50%)', // 50 ; 75
  color4: 'hsl(30, 100%, 50%)', // 75 ; 99
  color5: 'hsl(0, 100%, 50%)', // 99 ; 100
}

let difficulty = 0;
let currentDamages = 1;

// VIEW RENDER ////////////////////////////////////////////////////////////////////////////////////

export function render() {
  // Set HEADER layout
  if (isPhone || isTablet) {
    HEADER_TITLE.innerHTML = APP_NAME;
  }
  if (isLaptopOrUp) {
    HEADER_TITLE.innerHTML = APP_NAME;
  }

  // Set MAIN layout
  MAIN.innerHTML = `
    <div id="gameArea" class="game-area">
      <div id="screenArea" class="screen-area">Click the Start button.</div>
    </div>

    <div class="page-container homepage">
      <div id="buttonsContainerA">
        <button id="startButton" onclick="startGame()" class="lzr-button">Start</button>
      </div>
      <div class="input-container">
        <div><span id="killScore">0</span><span id="duration">Game duration</span></div>
      </div>
      
      
      <div id="buttonsContainerB">v${APP_VERSION}</div>
    </div>
  `;

  // Set FOOTER layout
  FOOTER.innerHTML = ``;

  updateMenuDom('homepage');

  setupGridObject();
  renderGrid();
}

// GRID ///////////////////////////////////////////////////////////////////////////////////////////

/**
 * Mise en place de l'objet gridState
 */
function setupGridObject() {
  gridState = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    gridState[x] = [];
  }

  for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
    for (let index_X = 0; index_X < GRID_SIZE; index_X++) {
      gridState[index_X][index_Y] = {
        type: 'empty', // 'empty' | 'center' | 'border' | 'zombie'
        hp: 0, // number
      };
    }
  }

  // Center ===================================================================

  // Central point ----------------------------------------
  setCellType(MIDDLE_GRID_VALUE, MIDDLE_GRID_VALUE, 'center');

  // Surroundings -----------------------------------------

  let centerCells = [
    { x_coord: MIDDLE_GRID_VALUE, y_coord: MIDDLE_GRID_VALUE - 1, }, // top
    { x_coord: MIDDLE_GRID_VALUE - 1, y_coord: MIDDLE_GRID_VALUE, }, // left
    { x_coord: MIDDLE_GRID_VALUE + 1, y_coord: MIDDLE_GRID_VALUE, }, // right
    { x_coord: MIDDLE_GRID_VALUE, y_coord: MIDDLE_GRID_VALUE + 1, }, // bottom

    { x_coord: MIDDLE_GRID_VALUE - 1, y_coord: MIDDLE_GRID_VALUE - 1, }, // top left
    { x_coord: MIDDLE_GRID_VALUE + 1, y_coord: MIDDLE_GRID_VALUE - 1, }, // top right
    { x_coord: MIDDLE_GRID_VALUE - 1, y_coord: MIDDLE_GRID_VALUE + 1, }, // bottom left
    { x_coord: MIDDLE_GRID_VALUE + 1, y_coord: MIDDLE_GRID_VALUE + 1, }, // bottom right
  ];

  for (let neighbourCell of centerCells) {
    if (!isInsideGrid(neighbourCell.x_coord, neighbourCell.y_coord)) continue;
    setCellType(neighbourCell.x_coord, neighbourCell.y_coord, 'center');
  }

  // Border ===================================================================

  let borderCells = [
    { x_coord: MIDDLE_GRID_VALUE - 1, y_coord: MIDDLE_GRID_VALUE - 2, }, // top left
    { x_coord: MIDDLE_GRID_VALUE, y_coord: MIDDLE_GRID_VALUE - 2, }, // top +
    { x_coord: MIDDLE_GRID_VALUE + 1, y_coord: MIDDLE_GRID_VALUE - 2, }, // top right

    { x_coord: MIDDLE_GRID_VALUE - 1, y_coord: MIDDLE_GRID_VALUE - 3, }, // top left
    { x_coord: MIDDLE_GRID_VALUE, y_coord: MIDDLE_GRID_VALUE - 3, }, // top ++
    { x_coord: MIDDLE_GRID_VALUE + 1, y_coord: MIDDLE_GRID_VALUE - 3, }, // top right

    { x_coord: MIDDLE_GRID_VALUE - 2, y_coord: MIDDLE_GRID_VALUE + 1, }, // left bottom
    { x_coord: MIDDLE_GRID_VALUE - 2, y_coord: MIDDLE_GRID_VALUE, }, // left +
    { x_coord: MIDDLE_GRID_VALUE - 2, y_coord: MIDDLE_GRID_VALUE - 1, }, // left top

    { x_coord: MIDDLE_GRID_VALUE - 3, y_coord: MIDDLE_GRID_VALUE + 1, }, // left bottom
    { x_coord: MIDDLE_GRID_VALUE - 3, y_coord: MIDDLE_GRID_VALUE, }, // left ++
    { x_coord: MIDDLE_GRID_VALUE - 3, y_coord: MIDDLE_GRID_VALUE - 1, }, // left top
    
    { x_coord: MIDDLE_GRID_VALUE + 2, y_coord: MIDDLE_GRID_VALUE + 1, }, // right bottom
    { x_coord: MIDDLE_GRID_VALUE + 2, y_coord: MIDDLE_GRID_VALUE, }, // right +
    { x_coord: MIDDLE_GRID_VALUE + 2, y_coord: MIDDLE_GRID_VALUE - 1, }, // right top

    { x_coord: MIDDLE_GRID_VALUE + 3, y_coord: MIDDLE_GRID_VALUE + 1, }, // right bottom
    { x_coord: MIDDLE_GRID_VALUE + 3, y_coord: MIDDLE_GRID_VALUE, }, // right ++
    { x_coord: MIDDLE_GRID_VALUE + 3, y_coord: MIDDLE_GRID_VALUE - 1, }, // right top

    { x_coord: MIDDLE_GRID_VALUE - 1, y_coord: MIDDLE_GRID_VALUE + 2, }, // top left
    { x_coord: MIDDLE_GRID_VALUE, y_coord: MIDDLE_GRID_VALUE + 2, }, // top +
    { x_coord: MIDDLE_GRID_VALUE + 1, y_coord: MIDDLE_GRID_VALUE + 2, }, // top right

    { x_coord: MIDDLE_GRID_VALUE - 1, y_coord: MIDDLE_GRID_VALUE + 3, }, // top left
    { x_coord: MIDDLE_GRID_VALUE, y_coord: MIDDLE_GRID_VALUE + 3, }, // top ++
    { x_coord: MIDDLE_GRID_VALUE + 1, y_coord: MIDDLE_GRID_VALUE + 3, }, // top right

    { x_coord: MIDDLE_GRID_VALUE - 2, y_coord: MIDDLE_GRID_VALUE - 2, }, // top left
    { x_coord: MIDDLE_GRID_VALUE + 2, y_coord: MIDDLE_GRID_VALUE - 2, }, // top right
    { x_coord: MIDDLE_GRID_VALUE - 2, y_coord: MIDDLE_GRID_VALUE + 2, }, // bottom left
    { x_coord: MIDDLE_GRID_VALUE + 2, y_coord: MIDDLE_GRID_VALUE + 2, }, // bottom right
  ];

  for (let neighbourCell of borderCells) {
    if (!isInsideGrid(neighbourCell.x_coord, neighbourCell.y_coord)) continue;
    setBorderCell(neighbourCell.x_coord, neighbourCell.y_coord, 5);
  }
    
}

/**
 * Render DOM initial de la grille
 */
function renderGrid() {
  const screenArea = document.getElementById('screenArea');
  screenArea.style = `--grid-size: ${GRID_SIZE};`;

  let gridHtmlString = '';
  for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
    for (let index_X = 0; index_X < GRID_SIZE; index_X++) {
      const state = gridState[index_X][index_Y];
      gridHtmlString += `
        <div
          id="${index_X}-${index_Y}"
          class="grid-cell ${state.type}"
          data-type="${state.type}"
          data-hp="${state.hp}">
            ${index_X}-${index_Y}
        </div>`;
    }
  }

  screenArea.innerHTML = gridHtmlString;
}

/**
 * Update du DOM de la grille
 */
function updateGrid() {
  for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
    for (let index_X = 0; index_X < GRID_SIZE; index_X++) {
      const cellDom = document.getElementById(`${index_X}-${index_Y}`);
      const state = gridState[index_X][index_Y];

      if (cellDom.dataset.type !== state.type || Number(cellDom.dataset.hp) !== state.hp) {
        cellDom.classList.remove(
          'center',
          'border',
          'zombie',
          'damaged',
          'critical'
        );
        cellDom.classList.add(state.type);

        if (state.type === 'border') {
          if (state.hp <= 3) cellDom.classList.add('damaged');
          if (state.hp <= 1) cellDom.classList.add('critical');
        }

        cellDom.dataset.type = state.type;
        cellDom.dataset.hp = state.hp;
      }
    }
  }
}

// GAME ///////////////////////////////////////////////////////////////////////////////////////////

/**
 * 
 */
function startGame() {
  clearTimeout(currentGameTimeout);
  clearTimeout(currentTimeTimeout);
  setupGridObject();
  spawnProbability = startingSpawnProbability;
  currentKillScore = 0;
  heat = {
    laser: 0,
    electricity: 0,
    shockwave: 0,
    heal: 0
  };
  document.getElementById('killScore').innerHTML = `${currentKillScore} kills`;
  document.getElementById('buttonsContainerA').innerHTML = '';
  document.getElementById('buttonsContainerB').innerHTML = `
    <div class="action-block">
    <button ontouchstart="killBorder()" class="lzr-button">Electrified fortification</button>
    <div class="heat-level" id="heatElectricity" style="--heat: ${heat.electricity}%;"></div>
    </div>
    <div class="action-block">
      <div class="heat-level" id="heatLaser" style="--heat: ${heat.laser}%;"></div>
      <button ontouchstart="killLaser()" class="lzr-button">Lasers</button>
    </div>
    <div class="action-block">
      <div class="heat-level" id="heatShockwave" style="--heat: ${heat.shockwave}%;"></div>
      <button ontouchstart="controlShockwave()" class="lzr-button" id="shockwaveButton">Shockwave</button>
    </div>
    <div class="action-block">
      <div class="heat-level" id="heatHeal" style="--heat: ${heat.heal}%;"></div>
      <button ontouchstart="healBorder()" class="lzr-button" id="healButton">Heal border</button>
    </div>
  `;
  isPlaying = true;
  gameLoop();
  currentStartingTime = Date.now();
  document.getElementById('duration').innerHTML = `${ getAdaptiveVerboseTimeStringByMilliseconds(Date.now() - currentStartingTime) }`;
  updateTime();
}
window.startGame = startGame;

function endGame() {
  isPlaying = false;
  clearTimeout(currentGameTimeout);
  clearTimeout(currentTimeTimeout);
  document.getElementById('buttonsContainerA').innerHTML = `
    <button id="startButton" onclick="startGame()" class="lzr-button">Start</button>
  `;
  document.getElementById('buttonsContainerB').innerHTML = `
    <p style="text-wrap: nowrap;">
      tick duration : ${activeTime}ms<br>
      difficulty : ${difficulty}<br>
      spawn probability : ${spawnProbability}%<br>
      current damages : ${currentDamages}<br>
      <br>
      v${APP_VERSION}
    </p>
  `;
}

/**
 * Gameplay loop
 */
function gameLoop() {
  if (!isPlaying) return;
  currentGameTimeout = setTimeout(() => {
    if (!isPlaying) return;

    const timeFactor = Math.floor((Date.now() - currentStartingTime) / 4500);
    const killFactor = Math.floor(currentKillScore / 120);

    difficulty = timeFactor + killFactor;
    currentDamages = 1 + Math.floor(difficulty / 6);

    // Already present zombie cells ===========================================
    let zombieCellsCoords = [];

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (gridState[x][y].type === 'zombie') {
          zombieCellsCoords.push({ x, y });
        }
      }
    }

    // Center neighbour -----------------------------------
    for (let zombieCellCoords of zombieCellsCoords) {
      const x = zombieCellCoords.x;
      const y = zombieCellCoords.y;
      let zombieCell = gridState[x][y];

      let neighbourCellsCoords = [
        { x: x, y: y - 1, }, // top
        { x: x - 1, y: y, }, // left
        { x: x + 1, y: y, }, // right
        { x: x, y: y + 1, }, // bottom
      ];

      for (let neighbourCellCoords of neighbourCellsCoords) {
        let neighbourCell = getCellState(neighbourCellCoords.x, neighbourCellCoords.y);
        if (!neighbourCell || neighbourCell.type != 'center') continue;
        updateGrid();
        endGame();
        return;
      }
    }

    // Movement -------------------------------------------
    for (let zombieCellCoords of zombieCellsCoords) {

      let targetCellCoords = {
        x: zombieCellCoords.x,
        y: zombieCellCoords.y,
      }

      if (zombieCellCoords.x > MIDDLE_GRID_VALUE) {
        if (getRandomIntegerBetween(1, 100) <= 50) {
          targetCellCoords.x -= 1;
        }
      } else if (zombieCellCoords.x < MIDDLE_GRID_VALUE) {
        if (getRandomIntegerBetween(1, 100) <= 50) {
          targetCellCoords.x += 1;
        }
      } else {
        if (getRandomIntegerBetween(1, 100) <= 50) {
          if (getRandomIntegerBetween(1, 100) <= 50) {
            targetCellCoords.x -= 1;
          } else {
            targetCellCoords.x += 1;
          }
        }
      }

      if (zombieCellCoords.y > MIDDLE_GRID_VALUE) {
        if (getRandomIntegerBetween(1, 100) <= 50) {
          targetCellCoords.y -= 1;
        }
      } else if (zombieCellCoords.y < MIDDLE_GRID_VALUE) {
        if (getRandomIntegerBetween(1, 100) <= 50) {
          targetCellCoords.y += 1;
        }
      } else {
        if (getRandomIntegerBetween(1, 100) <= 50) {
          if (getRandomIntegerBetween(1, 100) <= 50) {
            targetCellCoords.y -= 1;
          } else {
            targetCellCoords.y += 1;
          }
        }
      }

      if (targetCellCoords.x != zombieCellCoords.x || targetCellCoords.y != zombieCellCoords.y) {
        const targetCell = getCellState(targetCellCoords.x, targetCellCoords.y);

        if (!targetCell) continue;
        if (targetCell.type === 'center') continue; // stop moving
        if (targetCell.type === 'border') continue; // stop moving
        if (targetCell.type === 'zombie') continue; // stop moving

        setCellType(zombieCellCoords.x, zombieCellCoords.y, 'empty');
        setCellType(targetCellCoords.x, targetCellCoords.y, 'zombie');
      }
    }

    // After moving already present zombies ===================================

    zombieCellsCoords = [];

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (gridState[x][y].type === 'zombie') {
          zombieCellsCoords.push({ x, y });
        }
      }
    }

    // Border attack --------------------------------------
    for (let zombieCellCoords of zombieCellsCoords) {
      const x = zombieCellCoords.x;
      const y = zombieCellCoords.y;
      let zombieCell = gridState[x][y];

      let neighbourCellsCoords = [
        { x: x, y: y - 1, }, // top
        { x: x - 1, y: y, }, // left
        { x: x + 1, y: y, }, // right
        { x: x, y: y + 1, }, // bottom
      ];

      for (let neighbourCellCoords of neighbourCellsCoords) {
        let neighbourCell = getCellState(neighbourCellCoords.x, neighbourCellCoords.y);
        if (!neighbourCell || neighbourCell.type != 'border') continue;
        damageCell(neighbourCellCoords.x, neighbourCellCoords.y, currentDamages);
      }
    }

    // New zombie cell spawn ==================================================

    let spawnableCellsCoords = [];
    for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
      for (let index_X = 0; index_X < GRID_SIZE; index_X++) {
        if ((index_X != 0 && index_X != GRID_SIZE - 1) && (index_Y != 0 && index_Y != GRID_SIZE - 1)) continue; // only spawn on grid extremity
        const cellState = getCellState(index_X, index_Y);
        if (cellState.type != 'empty') continue;
        spawnableCellsCoords.push({x: index_X, y: index_Y});
      }
    }

    if (spawnableCellsCoords.length == 0) {
      const screenArea = document.getElementById('screenArea');
      screenArea.innerHTML = 'You LOOSE :(';
      endGame();
      return;
    } else {
      const randomCellCoords = spawnableCellsCoords[getRandomIntegerBetween(0, spawnableCellsCoords.length - 1)];

      let spawnValue = getRandomIntegerBetween(1, 100);
      if (spawnValue <= spawnProbability) {
        setCellType(randomCellCoords.x, randomCellCoords.y, 'zombie');
      }

      if (spawnProbability < 100) {
        let increaseSpawnProbaValue = getRandomIntegerBetween(1, 100);
        if (increaseSpawnProbaValue <= 66) {
          spawnProbability += 1;
          //console.log(spawnProbability);
        }
      }

      let spawnAdditionalZombiesValue = getRandomIntegerBetween(1, 100);
      if (spawnAdditionalZombiesValue <= currentKillScore) {
        for (let index = 0; index < 2; index++) {
          const randomCellCoords = spawnableCellsCoords[getRandomIntegerBetween(0, spawnableCellsCoords.length - 1)];

          let spawnValue = getRandomIntegerBetween(1, 100);
          if (spawnValue <= spawnProbability) {
            setCellType(randomCellCoords.x, randomCellCoords.y, 'zombie');
          }
        }
      }
    }
    coolDownHeat();
    activeTime = Math.max(250, 700 - difficulty * 10);
    updateGrid();
    gameLoop();
  }, activeTime);
}

// USER ACTIONS ///////////////////////////////////////////////////////////////////////////////////

function killBorder() {
  if (!isPlaying) return;
  if (heat.electricity >= HEAT_MAX) return;
  
  for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
    for (let index_X = 0; index_X < GRID_SIZE; index_X++) {
      const cellState = getCellState(index_X, index_Y);
      if (cellState.type != 'border') continue;

      let neighbourCellsCoords = [
        { x: index_X, y: index_Y - 1, }, // top
        { x: index_X - 1, y: index_Y, }, // left
        { x: index_X + 1, y: index_Y, }, // right
        { x: index_X, y: index_Y + 1, }, // bottom
      ];

      for (const neighbourCellCoords of neighbourCellsCoords) {
        const neighbourCellState = getCellState(neighbourCellCoords.x, neighbourCellCoords.y);
        if (!neighbourCellState) continue;

        const neighbourCellDom = document.getElementById(`${neighbourCellCoords.x}-${neighbourCellCoords.y}`);
        if (!neighbourCellDom) continue;
        
        if (neighbourCellState.type === 'zombie') {
          setCellType(neighbourCellCoords.x, neighbourCellCoords.y, 'empty')
          currentKillScore += 1;
          document.getElementById('killScore').innerHTML = `${currentKillScore} kills`;
        }

        if (neighbourCellState.type !== 'center' && neighbourCellState.type !== 'border') {
          neighbourCellDom.classList.add('wiped');
          neighbourCellDom.classList.add('electricity');
  
          setTimeout(() => {
            neighbourCellDom.classList.remove('wiped');
            neighbourCellDom.classList.remove('electricity');
          }, 200);
        }
      }
    }
  }

  heat.electricity += HEAT_COST.electricity;
  if (heat.electricity > HEAT_MAX) heat.electricity = HEAT_MAX;
  document.getElementById('heatElectricity').style = `--heat: ${heat.electricity}%; --heat-color: ${getColorFromHeat(heat.electricity)};`;
  updateGrid();
}
window.killBorder = killBorder;

function killLaser() {
  if (!isPlaying) return;
  if (heat.laser >= HEAT_MAX) return;

  for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
    for (let index_X = 0; index_X < GRID_SIZE; index_X++) {
      if (index_X != MIDDLE_GRID_VALUE && index_Y != MIDDLE_GRID_VALUE) continue;

      const cellState = getCellState(index_X, index_Y);
      if (cellState.type =='border' || cellState.type =='center') continue;

      if (isCellType(index_X, index_Y, 'zombie')) {
        setCellType(index_X, index_Y, 'empty');
        currentKillScore += 1;
        document.getElementById('killScore').innerHTML = `${currentKillScore} kills`;
      }

      const cellDom = document.getElementById(`${index_X}-${index_Y}`);
      cellDom.classList.add('wiped');
      cellDom.classList.add('lasers');

      setTimeout(() => {
        cellDom.classList.remove('wiped');
        cellDom.classList.remove('lasers');
      }, 200);
    }
  }

  heat.laser += HEAT_COST.laser;
  if (heat.laser > HEAT_MAX) heat.laser = HEAT_MAX;
  document.getElementById('heatLaser').style = `--heat: ${heat.laser}%; --heat-color: ${getColorFromHeat(heat.laser)};`;
  updateGrid();
}
window.killLaser = killLaser;

function controlShockwave() {
  if (!isPlaying) return;
  if (heat.shockwave >= HEAT_MAX) return;

  const now = Date.now();
  if (now - lastShockwaveUse < SHOCKWAVE_COOLDOWN) return;

  lastShockwaveUse = now;

  let zombieCellsCoords = [];

  // 1. snapshot
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (gridState[x][y].type === 'zombie') {
        zombieCellsCoords.push({ x, y });
      }
    }
  }

  // 2. apply movement
  const pushBackStrength = 2;
  for (let { x, y } of zombieCellsCoords) {
    let target = { x, y };

    if (x > MIDDLE_GRID_VALUE) target.x += pushBackStrength;
    else if (x < MIDDLE_GRID_VALUE) target.x -= pushBackStrength;
    else target.x += (Math.random() < 0.5 ? -pushBackStrength : pushBackStrength);

    if (y > MIDDLE_GRID_VALUE) target.y += pushBackStrength;
    else if (y < MIDDLE_GRID_VALUE) target.y -= pushBackStrength;
    else target.y += (Math.random() < 0.5 ? -pushBackStrength : pushBackStrength);

    // sécurité grille
    if (!isInsideGrid(target.x, target.y)) continue;

    const targetCell = getCellState(target.x, target.y);
    if (!targetCell || targetCell.type !== 'empty') continue;

    setCellType(x, y, 'empty');
    setCellType(target.x, target.y, 'zombie');
  }

  for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
    for (let index_X = 0; index_X < GRID_SIZE; index_X++) {
      const cellState = getCellState(index_X, index_Y);
      if (cellState.type !='empty') continue;

      const cellDom = document.getElementById(`${index_X}-${index_Y}`);
      cellDom.classList.add('wiped');
      cellDom.classList.add('shockwave');

      setTimeout(() => {
        cellDom.classList.remove('wiped');
        cellDom.classList.remove('shockwave');
      }, 200);
    }
  }

  heat.shockwave += HEAT_COST.shockwave;
  if (heat.shockwave > HEAT_MAX) heat.shockwave = HEAT_MAX;
  document.getElementById('heatShockwave').style = `--heat: ${heat.shockwave}%`;
  updateGrid();
  const shockwaveButton = document.getElementById('shockwaveButton');
  shockwaveButton.classList.add('cooldown');
}
window.controlShockwave = controlShockwave;

function healBorder() {
  if (!isPlaying) return;
  if (heat.heal >= HEAT_MAX) return;

  const now = Date.now();
  if (now - lastHealUse < HEAL_COOLDOWN) return;

  lastHealUse = now;

  for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
    for (let index_X = 0; index_X < GRID_SIZE; index_X++) {

      const cellState = getCellState(index_X, index_Y);
      if (cellState.type != 'border') continue;
      if (cellState.hp >= 3) continue;

      cellState.hp += 1;
    }
  }

  for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
    for (let index_X = 0; index_X < GRID_SIZE; index_X++) {
      const cellState = getCellState(index_X, index_Y);
      if (cellState.type !='border') continue;

      const cellDom = document.getElementById(`${index_X}-${index_Y}`);
      cellDom.classList.add('wiped');
      cellDom.classList.add('heal');

      setTimeout(() => {
        cellDom.classList.remove('wiped');
        cellDom.classList.remove('heal');
      }, 200);
    }
  }

  heat.heal += HEAT_COST.heal;
  if (heat.heal > HEAT_MAX) heat.heal = HEAT_MAX;
  document.getElementById('heatHeal').style = `--heat: ${heat.heal}%`;
  updateGrid();
  const healButton = document.getElementById('healButton');
  healButton.classList.add('cooldown');
}
window.healBorder = healBorder;


// UTILS //////////////////////////////////////////////////////////////////////////////////////////

function updateTime() {
  let currentTime = Date.now();
  //document.getElementById('time').innerHTML = `${((currentEndingingTime - currentTime) / 1000).toFixed(1)}s`;
  document.getElementById('duration').innerHTML = `${ getAdaptiveVerboseTimeStringByMilliseconds(currentTime - currentStartingTime) }`;

  // update shockwave if cooldown
  const shockwaveButton = document.getElementById('shockwaveButton');
  if (shockwaveButton) {
    const remaining = SHOCKWAVE_COOLDOWN - (currentTime - lastShockwaveUse);
    if (remaining > 0) {
      shockwaveButton.innerHTML = `Shockwave<br>${Math.ceil(remaining / 1000)}s`;
    } else {
      shockwaveButton.innerHTML = 'Shockwave';
      shockwaveButton.classList.remove('cooldown');
    }
  }

  // update heal if cooldown
  const healButton = document.getElementById('healButton');
  if (healButton) {
    const remaining = HEAL_COOLDOWN - (currentTime - lastHealUse);
    if (remaining > 0) {
      healButton.innerHTML = `Heal borders<br>${Math.ceil(remaining / 1000)}s`;
    } else {
      healButton.innerHTML = 'Heal borders';
      healButton.classList.remove('cooldown');
    }
  }

  currentTimeTimeout = setTimeout(() => {
    updateTime();
  }, 100);
}

function coolDownHeat() {
  for (let key in heat) {
    heat[key] -= Number(Math.floor(HEAT_COST[key] / HEAT_COOLDOWN[key]));
    if (heat[key] < 0) heat[key] = 0;
  }
  
  document.getElementById('heatElectricity').style = `--heat: ${heat.electricity}%; --heat-color: ${getColorFromHeat(heat.electricity)};`;
  document.getElementById('heatLaser').style = `--heat: ${heat.laser}%; --heat-color: ${getColorFromHeat(heat.laser)};`;
  document.getElementById('heatShockwave').style = `--heat: ${heat.shockwave}%; --heat-color: ${getColorFromHeat(heat.shockwave)};`;
  document.getElementById('heatHeal').style = `--heat: ${heat.heal}%; --heat-color: ${getColorFromHeat(heat.heal)};`;
}

function getColorFromHeat(heat) {
  if (heat < 25) return HEAT_COLORS.color1;
  if (heat < 50) return HEAT_COLORS.color2;
  if (heat < 75) return HEAT_COLORS.color3;
  if (heat < 99) return HEAT_COLORS.color4;
  return HEAT_COLORS.color5;
}

function isInsideGrid(x, y) {
  return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
}

function getCellState(x, y) {
  if (!isInsideGrid(x, y)) return null;
  return gridState[x][y];
}

function setCellState(x, y, newState) {
  if (!isInsideGrid(x, y)) return;

  gridState[x][y] = {
    ...gridState[x][y],
    ...newState,
  };
}

function setCellType(x, y, type) {
  if (!isInsideGrid(x, y)) return;

  gridState[x][y].type = type;

  if (type !== 'border') {
    gridState[x][y].hp = 0;
  }
}

function setBorderCell(x, y, hp = 5) {
  if (!isInsideGrid(x, y)) return;

  gridState[x][y].type = 'border';
  gridState[x][y].hp = hp;
}

function damageCell(x, y, amount = 1) {
  if (!isInsideGrid(x, y)) return false;

  const cell = gridState[x][y];
  if (cell.type !== 'border') return false;

  cell.hp -= amount;

  if (cell.hp <= 0) {
    cell.type = 'empty';
    cell.hp = 0;
    return true;
  }

  return false;
}

function healCell(x, y, amount = 1, maxHp = 5) {
  if (!isInsideGrid(x, y)) return false;

  const cell = gridState[x][y];
  if (cell.type !== 'border') return false;

  cell.hp = Math.min(cell.hp + amount, maxHp);
  return true;
}

function isCellType(x, y, type) {
  if (!isInsideGrid(x, y)) return false;
  return gridState[x][y].type === type;
}