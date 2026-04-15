import { APP_NAME, APP_VERSION } from "../../../app-properties.js";
import { APP_ORIGIN } from "../../router.js";
import { updateMenuDom } from "../../services/menu.service.js";
import { isLaptopOrUp, isPhone, isTablet } from "../../utils/breakpoints.js";
import { getAdaptiveVerboseTimeStringByMilliseconds } from "../../utils/dateAndTime.utils.js";
import { getRandomIntegerBetween } from "../../utils/math.utils.js";

const HEADER_TITLE = document.getElementById('headerTitle');
const MAIN = document.getElementById('main');
const FOOTER = document.getElementById('footer');

// Global parameters //////////////////////////////////////////////////////////////////////////////
// Grid -----------------------------------------------------------------------
const GRID_SIZE = 33;
const MIDDLE_GRID_VALUE = Math.floor(GRID_SIZE / 2);
// Gameplay -------------------------------------------------------------------
const STARTING_TICK_DURATION = 700;
const MINIMAL_TICK_DURATION = 250;
const TICK_DURATION_UPDATE_DELAY = 30000; // 30s
const BORDER_MAX_HP = 6;
const STARTING_ZOMBIE_SPAWN_PROBABILITY = 50;
const ZOMBIE_SPAWN_PROBABILITY_UPDATE_DELAY = 30000; // 30s
const STARTING_ZOMBIE_DAMAGES = 1;
const SHOCKWAVE_COOLDOWN = 5000; // 5s
const HEAL_COOLDOWN = 7000; // 7s
// Heat -----------------------------------------------------------------------
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

// Current game ///////////////////////////////////////////////////////////////////////////////////
// Grid -----------------------------------------------------------------------
let gridState = [];
// Game -----------------------------------------------------------------------
let currentStartingTime = 0;
let currentTickDuration = STARTING_TICK_DURATION;
let currentDifficulty = 0;
let currentZombieDamages = STARTING_ZOMBIE_DAMAGES;
let currentKillScore = 0;
let currentZombieSpawnProbability = STARTING_ZOMBIE_SPAWN_PROBABILITY;
let currentGameTimeout = null;
let currentTimeTimeout = null;
let isPlaying = false;
// User actions ---------------------------------------------------------------
let lastShockwaveUse = 0;
let lastHealUse = 0;
// Heat -----------------------------------------------------------------------
let currentHeat = {
  electricity: 0,
  laser: 0,
  shockwave: 0,
  heal: 0
};


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
      <div id="screenArea" class="screen-area" style="background-image: url('${APP_ORIGIN}assets/medias/images/bg3.png');">Click the Start button.</div>
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
    setBorderCell(neighbourCell.x_coord, neighbourCell.y_coord, BORDER_MAX_HP);
  }
    
}

/**
 * Render DOM initial de la grille
 */
function renderGrid() {
  const screenArea = document.getElementById('screenArea');
  screenArea.style = `--grid-size: ${GRID_SIZE}; background-image: url('${APP_ORIGIN}assets/medias/images/bg3.png');`;

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
          'hp-1',
          'hp-2',
          'hp-3',
          'hp-4',
          'hp-5',
        );
        cellDom.classList.add(state.type);

        if (state.type === 'border') {
          if (state.hp < BORDER_MAX_HP) {
            cellDom.classList.add(`hp-${state.hp}`);
          } 
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
  renderGrid();

  currentStartingTime = Date.now();
  currentTickDuration = STARTING_TICK_DURATION;
  currentDifficulty = 0;
  currentKillScore = 0;
  currentZombieDamages = STARTING_ZOMBIE_DAMAGES;
  currentZombieSpawnProbability = STARTING_ZOMBIE_SPAWN_PROBABILITY;
  currentHeat = {
    laser: 0,
    electricity: 0,
    shockwave: 0,
    heal: 0
  };
  lastShockwaveUse = 0;
  lastHealUse = 0;
  
  isPlaying = true;

  document.getElementById('duration').innerHTML = `${ getAdaptiveVerboseTimeStringByMilliseconds(Date.now() - currentStartingTime) }`;
  document.getElementById('killScore').innerHTML = `${currentKillScore} kills`;
  document.getElementById('buttonsContainerA').innerHTML = '';
  document.getElementById('buttonsContainerB').innerHTML = `
    <div class="action-block">
    <button ontouchstart="killBorder()" class="lzr-button">Electrified fortification</button>
    <div class="heat-level" id="heatElectricity" style="--heat: ${currentHeat.electricity}%;"></div>
    </div>
    <div class="action-block">
      <div class="heat-level" id="heatLaser" style="--heat: ${currentHeat.laser}%;"></div>
      <button ontouchstart="killLaser()" class="lzr-button">Lasers</button>
    </div>
    <div class="action-block">
      <div class="heat-level" id="heatShockwave" style="--heat: ${currentHeat.shockwave}%;"></div>
      <button ontouchstart="controlShockwave()" class="lzr-button" id="shockwaveButton">Shockwave</button>
    </div>
    <div class="action-block">
      <div class="heat-level" id="heatHeal" style="--heat: ${currentHeat.heal}%;"></div>
      <button ontouchstart="healBorder()" class="lzr-button" id="healButton">Heal border</button>
    </div>
  `;

  gameLoop();
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
    <div class="game-over-display">
      <strong style="color: var(--color--error);">Game over</strong>
      <hr>
      <div class="input-container">
        <div><span>Tick duration</span><strong>${currentTickDuration}ms</strong></div>
      </div>
      <div class="input-container">
        <div><span>Difficulty level</span><strong>${currentDifficulty}</strong></div>
      </div>
      <div class="input-container">
        <div><span>Zombie spawn probability</span><strong>${currentZombieSpawnProbability.toFixed(2)}%</strong></div>
      </div>
      <div class="input-container">
        <div><span>Zombie damages</span><strong>${currentZombieDamages}</strong></div>
      </div>
      <hr>
      <strong>v${APP_VERSION}</strong>
    </div>
  `;
}

/**
 * Gameplay loop
 */
function gameLoop() {
  if (!isPlaying) return;
  currentGameTimeout = setTimeout(() => {
    if (!isPlaying) return;

    const elapsed = Date.now() - currentStartingTime;
    const timeFactor = Math.floor(elapsed / 4500);
    const killFactor = Math.floor(currentKillScore / 120);

    currentDifficulty = timeFactor + killFactor;
    // Update zombie damages
    currentZombieDamages = 1 + Math.floor(currentDifficulty / 12);
    if (currentZombieDamages > BORDER_MAX_HP) currentZombieDamages = BORDER_MAX_HP;

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
      //let zombieCell = gridState[x][y];

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

      let neighbourCellsCoords = [
        { x: x, y: y - 1, }, // top
        { x: x - 1, y: y, }, // left
        { x: x + 1, y: y, }, // right
        { x: x, y: y + 1, }, // bottom
      ];

      for (let neighbourCellCoords of neighbourCellsCoords) {
        let neighbourCell = getCellState(neighbourCellCoords.x, neighbourCellCoords.y);
        if (!neighbourCell || neighbourCell.type != 'border') continue;
        damageCell(neighbourCellCoords.x, neighbourCellCoords.y, currentZombieDamages);
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

      // Zombie spawn
      let spawnValue = getRandomIntegerBetween(1, 100);
      if (spawnValue <= currentZombieSpawnProbability) {
        setCellType(randomCellCoords.x, randomCellCoords.y, 'zombie');
      }

      // Update probability
      if (elapsed > ZOMBIE_SPAWN_PROBABILITY_UPDATE_DELAY) {
        if (currentZombieSpawnProbability < 100) {
          currentZombieSpawnProbability += (100 - currentZombieSpawnProbability) * 0.01;
        }
      }

      let spawnAdditionalZombiesValue = getRandomIntegerBetween(1, 100);
      if (spawnAdditionalZombiesValue <= currentDifficulty * 2) {
        for (let index = 0; index < 2; index++) {
          const randomCellCoords = spawnableCellsCoords[getRandomIntegerBetween(0, spawnableCellsCoords.length - 1)];

          let spawnValue = getRandomIntegerBetween(1, 100);
          if (spawnValue <= currentZombieSpawnProbability) {
            setCellType(randomCellCoords.x, randomCellCoords.y, 'zombie');
          }
        }
      }
    }
    coolDownHeat();

    // Réduction de la durée du tick : palier de 500ms toutes les 15sec
    if (elapsed > TICK_DURATION_UPDATE_DELAY) {
      const step = Math.floor(elapsed / 15000);
      currentTickDuration = Math.max(MINIMAL_TICK_DURATION, STARTING_TICK_DURATION - step * 50);
    }

    updateGrid();
    gameLoop();
  }, currentTickDuration);
}

// USER ACTIONS ///////////////////////////////////////////////////////////////////////////////////

function killBorder() {
  if (!isPlaying) return;
  if (currentHeat.electricity >= HEAT_MAX) return;
  
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

  currentHeat.electricity += HEAT_COST.electricity;
  if (currentHeat.electricity > HEAT_MAX) currentHeat.electricity = HEAT_MAX;
  document.getElementById('heatElectricity').style = `--heat: ${currentHeat.electricity}%; --heat-color: ${getColorFromHeat(currentHeat.electricity)};`;
  updateGrid();
}
window.killBorder = killBorder;

function killLaser() {
  if (!isPlaying) return;
  if (currentHeat.laser >= HEAT_MAX) return;

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

  currentHeat.laser += HEAT_COST.laser;
  if (currentHeat.laser > HEAT_MAX) currentHeat.laser = HEAT_MAX;
  document.getElementById('heatLaser').style = `--heat: ${currentHeat.laser}%; --heat-color: ${getColorFromHeat(currentHeat.laser)};`;
  updateGrid();
}
window.killLaser = killLaser;

function controlShockwave() {
  if (!isPlaying) return;
  if (currentHeat.shockwave >= HEAT_MAX) return;

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

  currentHeat.shockwave += HEAT_COST.shockwave;
  if (currentHeat.shockwave > HEAT_MAX) currentHeat.shockwave = HEAT_MAX;
  document.getElementById('heatShockwave').style = `--heat: ${currentHeat.shockwave}%`;
  updateGrid();
  const shockwaveButton = document.getElementById('shockwaveButton');
  shockwaveButton.classList.add('cooldown');
}
window.controlShockwave = controlShockwave;

function healBorder() {
  if (!isPlaying) return;
  if (currentHeat.heal >= HEAT_MAX) return;

  const now = Date.now();
  if (now - lastHealUse < HEAL_COOLDOWN) return;

  lastHealUse = now;

  for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
    for (let index_X = 0; index_X < GRID_SIZE; index_X++) {

      const cellState = getCellState(index_X, index_Y);
      if (cellState.type != 'border') continue;
      if (cellState.hp >= 4) continue;

      const healAmount = Math.max(1, Math.ceil(currentZombieDamages / 2));
      cellState.hp = Math.min(4, cellState.hp + healAmount);
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

  currentHeat.heal += HEAT_COST.heal;
  if (currentHeat.heal > HEAT_MAX) currentHeat.heal = HEAT_MAX;
  document.getElementById('heatHeal').style = `--heat: ${currentHeat.heal}%`;
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
  for (let key in currentHeat) {
    currentHeat[key] -= Number(Math.floor(HEAT_COST[key] / HEAT_COOLDOWN[key]));
    if (currentHeat[key] < 0) currentHeat[key] = 0;
  }
  
  document.getElementById('heatElectricity').style = `--heat: ${currentHeat.electricity}%; --heat-color: ${getColorFromHeat(currentHeat.electricity)};`;
  document.getElementById('heatLaser').style = `--heat: ${currentHeat.laser}%; --heat-color: ${getColorFromHeat(currentHeat.laser)};`;
  document.getElementById('heatShockwave').style = `--heat: ${currentHeat.shockwave}%; --heat-color: ${getColorFromHeat(currentHeat.shockwave)};`;
  document.getElementById('heatHeal').style = `--heat: ${currentHeat.heal}%; --heat-color: ${getColorFromHeat(currentHeat.heal)};`;
}

function getColorFromHeat(heat) {
  if (heat < 25) return HEAT_COLORS.color1;
  if (heat < 50) return HEAT_COLORS.color2;
  if (heat < 75) return HEAT_COLORS.color3;
  if (heat < 99) return HEAT_COLORS.color4;
  return HEAT_COLORS.color5;
}

// GRID UTILS /////////////////////////////////////////////////////////////////////////////////////

function isInsideGrid(x, y) {
  return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
}

function getCellState(x, y) {
  if (!isInsideGrid(x, y)) return null;
  return gridState[x][y];
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

function isCellType(x, y, type) {
  if (!isInsideGrid(x, y)) return false;
  return gridState[x][y].type === type;
}