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
const ZOMBIE_DAMAGES_UPDATE_DELAY = 30000; // 30s
const STARTING_ELECTRICITY_LOOP_DURATION = 400;
const LASERS_UPGRADE_STEP = 5; // 1m 30s
const DIAGONAL_UNLOCK_STEP = 3; // 1m 00s
const DIAGONAL_UPGRADE_STEP = 9; // 2m 30s
const STRIPES_UNLOCK_STEP = 7; // 2m 00s
const STRIPES_UPGRADE_STEP = 11; // 3m 30s
const SHOCKWAVE_COOLDOWN = 5000; // 5s
const HEAL_COOLDOWN = 7000; // 7s
// Heat -----------------------------------------------------------------------
const HEAT_MAX = 100;
const HEAT_COST = {
  lasers: 15,
  diagonal: 18,
  stripes: 27,
};
const HEAT_COOLDOWN = {
  lasers: 3,
  diagonal: 6,
  stripes: 9,
};
const HEAT_COLORS = {
  color1: 'hsl(180, 100%, 50%)', // 0 ; 25
  color2: 'hsl(120, 100%, 50%)', // 25 ; 50
  color3: 'hsl(60, 100%, 50%)', // 50 ; 75
  color4: 'hsl(30, 100%, 50%)', // 75 ; 90
  color5: 'hsl(0, 100%, 50%)', // 90 ; 100
}

// Current game ///////////////////////////////////////////////////////////////////////////////////
// Grid -----------------------------------------------------------------------
let gridState = [];
// Game -----------------------------------------------------------------------
let currentStartingTime = 0;
let currentTickDuration = STARTING_TICK_DURATION;
let currentStep = 0;
let currentDifficulty = 0;
let currentZombieDamages = STARTING_ZOMBIE_DAMAGES;
let currentKillScore = 0;
let currentZombieSpawnProbability = STARTING_ZOMBIE_SPAWN_PROBABILITY;
let currentGameTimeout = null;
let currentTimeTimeout = null;
let currentElectricityTimeout = null;
let isPlaying = false;
// User actions ---------------------------------------------------------------
let currentLasersLevel = 1;
let currentDiagonalLevel = 1;
let currentStripesLevel = 1;
let lastShockwaveUse = 0;
let lastHealUse = 0;
let isLasersOverheated = false;
let isDiagonalOverheated = false;
let isStripesOverheated = false;
let stripesType = 0;
// Heat -----------------------------------------------------------------------
let currentHeat = {
  lasers: 0,
  diagonal: 0,
  stripes: 0,
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
      <div class="top-container">
        <span id="killScore">0 kills</span>
        <span id="step">Step 0</span>
        <span id="duration">00s</span>
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
  clearTimeout(currentElectricityTimeout);
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
    lasers: 0,
    diagonal: 0,
    stripes: 0,
  };
  currentStep = 0;
  currentLasersLevel = 1;
  currentDiagonalLevel = 1;
  currentStripesLevel = 1;
  lastShockwaveUse = 0;
  lastHealUse = 0;
  isLasersOverheated = false;
  isDiagonalOverheated = false;
  isStripesOverheated = false;
  stripesType = 0;
  
  isPlaying = true;

  document.getElementById('duration').innerHTML = `${ getAdaptiveVerboseTimeStringByMilliseconds(Date.now() - currentStartingTime) }`;
  document.getElementById('killScore').innerHTML = `${currentKillScore} kills`;
  document.getElementById('buttonsContainerA').innerHTML = '';
  document.getElementById('buttonsContainerB').innerHTML = `
    <div class="action-block third">
      <div class="heat-level" id="heatLasers" style="--heat: ${currentHeat.lasers}%;"></div>
      <button ontouchstart="killLasers()" class="lzr-button">Lasers</button>
    </div>

    <div id="diagonalActionBlock" class="action-block third disabled">
      <div class="heat-level" id="heatDiagonal" style="--heat: ${currentHeat.diagonal}%;"></div>
      <button ontouchstart="killDiagonal()" class="lzr-button">Diagonal</button>
    </div>

    <div id="stripesActionBlock" class="action-block third disabled">
      <div class="heat-level" id="heatStripes" style="--heat: ${currentHeat.stripes}%;"></div>
      <button ontouchstart="killStripes()" class="lzr-button">Stripes</button>
    </div>
    
    <div class="action-block">
      <button ontouchstart="controlShockwave()" class="lzr-button" id="shockwaveButton">Shockwave</button>
    </div>

    <div class="action-block">
      <button ontouchstart="healBorder()" class="lzr-button" id="healButton">Heal border</button>
    </div>
  `;

  gameLoop();
  electricityLoop();
  updateTime();
}
window.startGame = startGame;

function endGame() {
  isPlaying = false;
  clearTimeout(currentElectricityTimeout);
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
        <div><span>Step</span><strong>${currentStep}</strong></div>
      </div>
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

    if (elapsed >= ZOMBIE_DAMAGES_UPDATE_DELAY) {
      const timeFactor = Math.floor(elapsed / 4500);
      const killFactor = Math.floor(currentKillScore / 80);
      currentDifficulty = timeFactor + killFactor;
      // Update zombie damages
      currentZombieDamages = 1 + Math.floor(currentDifficulty / 12);
      if (currentZombieDamages > BORDER_MAX_HP) currentZombieDamages = BORDER_MAX_HP;
    }

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
      if (elapsed >= ZOMBIE_SPAWN_PROBABILITY_UPDATE_DELAY) {
        if (currentZombieSpawnProbability < 100) {
          currentZombieSpawnProbability += (100 - currentZombieSpawnProbability) * 0.01;
        }
      }

      let spawnAdditionalZombiesValue = getRandomIntegerBetween(1, 100);
      if (spawnAdditionalZombiesValue <= Math.min(50, currentDifficulty * 3)) {
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

    // Réduction de la durée du tick : palier de -10% toutes les 15sec
    
    if (elapsed >= TICK_DURATION_UPDATE_DELAY) {
      const adjustedElapsed = elapsed - TICK_DURATION_UPDATE_DELAY;
      currentStep = 1 + Math.floor(adjustedElapsed / 15000);
      currentTickDuration = Math.max(
        MINIMAL_TICK_DURATION,
        Math.round(STARTING_TICK_DURATION * Math.pow(0.93, currentStep))
      );
    }

    

    // Unlock actions
    if (currentStep == DIAGONAL_UNLOCK_STEP && document.getElementById('diagonalActionBlock').classList.contains('disabled')) {
      document.getElementById('diagonalActionBlock').classList.remove('disabled');
    }

    if (currentStep == STRIPES_UNLOCK_STEP && document.getElementById('stripesActionBlock').classList.contains('disabled')) {
      document.getElementById('stripesActionBlock').classList.remove('disabled');
    }

    // Upgrade lasers
    if (currentStep == LASERS_UPGRADE_STEP && currentLasersLevel < 2) currentLasersLevel = 2;

    // Upgrade diagonal
    if (currentStep == DIAGONAL_UPGRADE_STEP && currentDiagonalLevel < 2) currentDiagonalLevel = 2;

    // Upgrade stripes
    //if (currentStep == STRIPES_UPGRADE_STEP && currentDiagonalLevel < 2) currentDiagonalLevel = 2;

    updateGrid();
    gameLoop();
  }, currentTickDuration);
}

function electricityLoop() {
  if (!isPlaying) return;
  currentElectricityTimeout = setTimeout(() => {
    if (!isPlaying) return;
    killBorder();
    electricityLoop();
  }, STARTING_ELECTRICITY_LOOP_DURATION);
}

// AUTOMATIC ACTIONS //////////////////////////////////////////////////////////////////////////////

function killBorder() {
  if (!isPlaying) return;
  
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
  updateGrid();
}

// USER ACTIONS ///////////////////////////////////////////////////////////////////////////////////

function killLasers() {
  if (!isPlaying) return;
  if (isLasersOverheated) return;

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

      if (currentLasersLevel > 1) {
        let neighbourCellsCoords = [];
        if (index_X == MIDDLE_GRID_VALUE) {
          neighbourCellsCoords = [
            { x: index_X - 1, y: index_Y, }, // left
            { x: index_X + 1, y: index_Y, }, // right
          ];
        }
        if (index_Y == MIDDLE_GRID_VALUE) {
          neighbourCellsCoords = [
            { x: index_X, y: index_Y - 1, }, // top
            { x: index_X, y: index_Y + 1, }, // bottom
          ];
        }

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
            neighbourCellDom.classList.add('lasers');
    
            setTimeout(() => {
              neighbourCellDom.classList.remove('wiped');
              neighbourCellDom.classList.remove('lasers');
            }, 200);
          }
        }
      }

      setTimeout(() => {
        cellDom.classList.remove('wiped');
        cellDom.classList.remove('lasers');
      }, 200);
    }
  }

  currentHeat.lasers += Math.floor(HEAT_COST.lasers * (1 + currentLasersLevel * 0.2));
  if (currentHeat.lasers >= HEAT_MAX) {
    currentHeat.lasers = HEAT_MAX;
    isLasersOverheated = true;
  }
  document.getElementById('heatLasers').style = `--heat: ${currentHeat.lasers}%; --heat-color: ${getColorFromHeat(currentHeat.lasers)};`;
  updateGrid();
}
window.killLasers = killLasers;

function killDiagonal() {
  if (!isPlaying) return;
  if (currentStep < DIAGONAL_UNLOCK_STEP) return;
  if (isDiagonalOverheated) return;
  

  for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
    for (let index_X = 0; index_X < GRID_SIZE; index_X++) {
      if (Math.abs(index_X - MIDDLE_GRID_VALUE) !== Math.abs(index_Y - MIDDLE_GRID_VALUE)) continue;

      const cellState = getCellState(index_X, index_Y);
      if (cellState.type == 'border' || cellState.type == 'center') continue;

      if (isCellType(index_X, index_Y, 'zombie')) {
        setCellType(index_X, index_Y, 'empty');
        currentKillScore += 1;
        document.getElementById('killScore').innerHTML = `${currentKillScore} kills`;
      }

      const cellDom = document.getElementById(`${index_X}-${index_Y}`);
      cellDom.classList.add('wiped');
      cellDom.classList.add('diagonal');

      if (currentDiagonalLevel > 1) {
        let neighbourCellsCoords = [];
        
        neighbourCellsCoords = [
          { x: index_X, y: index_Y - 1, }, // top
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
            neighbourCellDom.classList.add('diagonal');
    
            setTimeout(() => {
              neighbourCellDom.classList.remove('wiped');
              neighbourCellDom.classList.remove('diagonal');
            }, 200);
          }
        }
      }

      setTimeout(() => {
        cellDom.classList.remove('wiped');
        cellDom.classList.remove('diagonal');
      }, 200);
    }
  }

  currentHeat.diagonal += Math.floor(HEAT_COST.diagonal * (1 + currentDiagonalLevel * 0.2));
  if (currentHeat.diagonal >= HEAT_MAX) {
    currentHeat.diagonal = HEAT_MAX;
    isDiagonalOverheated = true;
  }
  document.getElementById('heatDiagonal').style = `--heat: ${currentHeat.diagonal}%; --heat-color: ${getColorFromHeat(currentHeat.diagonal)};`;
  updateGrid();
}
window.killDiagonal = killDiagonal;

function killStripes() {
  if (!isPlaying) return;
  if (currentStep < STRIPES_UNLOCK_STEP) return;
  if (isStripesOverheated) return;

  let type = '';

  stripesType += 1;
  if (stripesType > 3) stripesType = 0;

  if (stripesType == 0) type = 'vertical-odd';
  else if (stripesType == 1) type = 'horizontal-odd';
  else if (stripesType == 2) type = 'vertical-even';
  else if (stripesType == 3) type = 'horizontal-even';

  function isOdd(num) { return num % 2;}
  
  for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
    for (let index_X = 0; index_X < GRID_SIZE; index_X++) {

      let shouldSkip = false;

      switch (type) {
        case 'vertical-odd':
          if (!isOdd(index_X)) shouldSkip = true;
          break;

        case 'vertical-even':
          if (isOdd(index_X)) shouldSkip = true;
          break;

        case 'horizontal-odd':
          if (!isOdd(index_Y)) shouldSkip = true;
          break;

        case 'horizontal-even':
          if (isOdd(index_Y)) shouldSkip = true;
          break;
      }

      if (shouldSkip) continue;

      const cellState = getCellState(index_X, index_Y);
      if (cellState.type == 'border' || cellState.type == 'center') continue;

      if (isCellType(index_X, index_Y, 'zombie')) {
        setCellType(index_X, index_Y, 'empty');
        currentKillScore += 1;
        document.getElementById('killScore').innerHTML = `${currentKillScore} kills`;
      }

      const cellDom = document.getElementById(`${index_X}-${index_Y}`);
      cellDom.classList.add('wiped');
      cellDom.classList.add('stripes');

      if (currentStripesLevel > 1) {
        // 
      }

      setTimeout(() => {
        cellDom.classList.remove('wiped');
        cellDom.classList.remove('stripes');
      }, 200);
    }
  }

  currentHeat.stripes += Math.floor(HEAT_COST.stripes * (1 + currentStripesLevel * 0.2));
  if (currentHeat.stripes >= HEAT_MAX) {
    currentHeat.stripes = HEAT_MAX;
    isStripesOverheated = true;
  }
  document.getElementById('heatStripes').style = `--heat: ${currentHeat.stripes}%; --heat-color: ${getColorFromHeat(currentHeat.stripes)};`;
  updateGrid();
}
window.killStripes = killStripes;

function controlShockwave() {
  if (!isPlaying) return;

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

  updateGrid();
  const shockwaveButton = document.getElementById('shockwaveButton');
  shockwaveButton.classList.add('cooldown');
}
window.controlShockwave = controlShockwave;

function healBorder() {
  if (!isPlaying) return;

  const now = Date.now();
  if (now - lastHealUse < HEAL_COOLDOWN) return;

  lastHealUse = now;

  for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
    for (let index_X = 0; index_X < GRID_SIZE; index_X++) {

      const cellState = getCellState(index_X, index_Y);
      if (cellState.type != 'border') continue;
      if (cellState.hp >= 5) continue; // Max heal = 4

      const healAmount = Math.max(1, Math.ceil(currentZombieDamages / 2));
      cellState.hp = Math.min(BORDER_MAX_HP, cellState.hp + healAmount);
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

  document.getElementById('step').innerHTML = `Step ${currentStep}`;

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

    let decay = Math.floor(HEAT_COST[key] / HEAT_COOLDOWN[key]);

    // si overheated → refroidissement ULTRA lent
    if (
      (key === 'lasers' && isLasersOverheated) ||
      (key === 'diagonal' && isDiagonalOverheated) ||
      (key === 'stripes' && isStripesOverheated)
    ) {
      decay = 1; // très lent
    }

    currentHeat[key] -= decay;
    if (currentHeat[key] < 0) currentHeat[key] = 0;
  }

  // sortie d'overheat
  if (currentHeat.lasers <= HEAT_MAX * 0.9) {
    isLasersOverheated = false;
  }

  if (currentHeat.diagonal <= HEAT_MAX * 0.9) {
    isDiagonalOverheated = false;
  }

  if (currentHeat.stripes <= HEAT_MAX * 0.9) {
    isStripesOverheated = false;
  }

  // update UI
  document.getElementById('heatLasers').style = `--heat: ${currentHeat.lasers}%; --heat-color: ${getColorFromHeat(currentHeat.lasers)};`;
  document.getElementById('heatDiagonal').style = `--heat: ${currentHeat.diagonal}%; --heat-color: ${getColorFromHeat(currentHeat.diagonal)};`;
  document.getElementById('heatStripes').style = `--heat: ${currentHeat.stripes}%; --heat-color: ${getColorFromHeat(currentHeat.stripes)};`;
}

function getColorFromHeat(heat) {
  if (heat < 25) return HEAT_COLORS.color1;
  if (heat < 50) return HEAT_COLORS.color2;
  if (heat < 75) return HEAT_COLORS.color3;
  if (heat < (HEAT_MAX * 0.9)) return HEAT_COLORS.color4;
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

function setBorderCell(x, y, hp = BORDER_MAX_HP) {
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