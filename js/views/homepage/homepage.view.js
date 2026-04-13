import { APP_NAME, APP_VERSION } from "../../../app-properties.js";
import { ICONS } from "../../data/svgIcons.data.js";
import { toExternalPath } from "../../router.js";
import { getSvgIcon } from "../../services/icons.service.js";
import { updateMenuDom } from "../../services/menu.service.js";
import { showToast } from "../../services/toast.service.js";
import { isLaptopOrUp, isPhone, isTablet } from "../../utils/breakpoints.js";
import { getAdaptiveVerboseTimeStringByMilliseconds, getFullVerboseTimeStringByMilliseconds } from "../../utils/dateAndTime.utils.js";
import { getRandomIntegerBetween } from "../../utils/math.utils.js";

// VARIABLES //////////////////////////////////////////////////////////////////////////////////////
const HEADER_ICON_CONTAINER = document.getElementById('headerIconContainer');
const HEADER_TITLE = document.getElementById('headerTitle');
const MAIN = document.getElementById('main');
const FOOTER = document.getElementById('footer');

const GRID_SIZE = 33;
const MIDDLE_GRID_VALUE = Math.floor(GRID_SIZE / 2);
const activeTime = 500;
let currentKillScore = 0;

let currentStartingTime = 0;
let currentGameTimeout = null;
let currentTimeTimeout = null;

const startingSpawnProbability = 50;
let spawnProbability = 50;

let isPlaying = false;

// FUNCTIONS //////////////////////////////////////////////////////////////////////////////////////

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

    <div class="page-container homepage" style="margin-top: 48px; margin-bottom: auto;">
      <div class="input-container">
        <div><span id="killScore">0</span><span id="duration">Game duration</span></div>
      </div>
      
      
      <div id="buttonsContainer">
        <button id="startButton" onclick="startGame()" class="lzr-button">Start</button>
      </div>
    </div>
  `;

  // Set FOOTER layout
  FOOTER.innerHTML = ``;

  updateMenuDom('homepage');

  setupGrid();
}

function setupGrid() {
  const screenArea = document.getElementById('screenArea');
  screenArea.style = `--grid-size: ${GRID_SIZE};`;

  let gridHtmlString = '';
  for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
    for (let index_X = 0; index_X < GRID_SIZE; index_X++) {
      //const hslString = `hsl(${getRandomIntegerBetween(80, 180)}, ${getRandomIntegerBetween(10, 30)}%, ${getRandomIntegerBetween(15, 25)}%)`;
      //const styleString = `style="background-color: ${hslString};"`;
      const styleString = '';
      gridHtmlString += `<div id="${index_X}-${index_Y}" class="grid-cell" ${styleString}>${index_X}-${index_Y}</div>`;
    }
  }

  screenArea.innerHTML = gridHtmlString;

  // Center
  const midPointCell = document.getElementById(`${MIDDLE_GRID_VALUE}-${MIDDLE_GRID_VALUE}`);
  midPointCell.classList.add('center');

  let centerCells = [
    { x_coord: MIDDLE_GRID_VALUE, y_coord: MIDDLE_GRID_VALUE - 1, }, // top +
    { x_coord: MIDDLE_GRID_VALUE - 1, y_coord: MIDDLE_GRID_VALUE, }, // left +
    { x_coord: MIDDLE_GRID_VALUE + 1, y_coord: MIDDLE_GRID_VALUE, }, // right +
    { x_coord: MIDDLE_GRID_VALUE, y_coord: MIDDLE_GRID_VALUE + 1, }, // top +
    { x_coord: MIDDLE_GRID_VALUE - 1, y_coord: MIDDLE_GRID_VALUE - 1, }, // top left
    { x_coord: MIDDLE_GRID_VALUE + 1, y_coord: MIDDLE_GRID_VALUE - 1, }, // top right
    { x_coord: MIDDLE_GRID_VALUE - 1, y_coord: MIDDLE_GRID_VALUE + 1, }, // bottom left
    { x_coord: MIDDLE_GRID_VALUE + 1, y_coord: MIDDLE_GRID_VALUE + 1, }, // bottom right
  ];

  for (let neighbourCell of centerCells) {
    if (neighbourCell == null) continue;
    
    const cellId = `${neighbourCell.x_coord}-${neighbourCell.y_coord}`;
    const neighbourCellDom = document.getElementById(cellId);
    if (neighbourCellDom == null) continue;
    
    neighbourCellDom.classList.add('center');
  }

  // Border

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
    if (neighbourCell == null) continue;
    
    const cellId = `${neighbourCell.x_coord}-${neighbourCell.y_coord}`;
    const neighbourCellDom = document.getElementById(cellId);
    if (neighbourCellDom == null) continue;
    
    neighbourCellDom.classList.add('border');
  }
    
}

function gameLoop() {
  if (!isPlaying) return;
  currentGameTimeout = setTimeout(() => {
    if (!isPlaying) return;

    // Already present zombie cells ===========================================
    let zombieCells = [];
    for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
      for (let index_X = 0; index_X < GRID_SIZE; index_X++) {
        const cellId = `${index_X}-${index_Y}`;
        const cell = document.getElementById(cellId);
        if (cell.classList.contains('zombie')) zombieCells.push(cellId);
      }
    }

    // Movement -------------------------------------------
    for (let zombieCellId of zombieCells) {
      const initialZombieCellDom = document.getElementById(zombieCellId);

      let zombieCell = {
        x_coord: Number(zombieCellId.split('-')[0]),
        y_coord: Number(zombieCellId.split('-')[1]),
      }

      if (zombieCell.x_coord > MIDDLE_GRID_VALUE) {
        if (getRandomIntegerBetween(1, 100) <= 50) {
          zombieCell.x_coord -= 1;
        }
      } else if (zombieCell.x_coord < MIDDLE_GRID_VALUE) {
        if (getRandomIntegerBetween(1, 100) <= 50) {
          zombieCell.x_coord += 1;
        }
      } else {
        if (getRandomIntegerBetween(1, 100) <= 50) {
          if (getRandomIntegerBetween(1, 100) <= 50) {
            zombieCell.x_coord -= 1;
          } else {
            zombieCell.x_coord += 1;
          }
        }
      }

      if (zombieCell.y_coord > MIDDLE_GRID_VALUE) {
        if (getRandomIntegerBetween(1, 100) <= 50) {
          zombieCell.y_coord -= 1;
        }
      } else if (zombieCell.y_coord < MIDDLE_GRID_VALUE) {
        if (getRandomIntegerBetween(1, 100) <= 50) {
          zombieCell.y_coord += 1;
        }
      } else {
        if (getRandomIntegerBetween(1, 100) <= 50) {
          if (getRandomIntegerBetween(1, 100) <= 50) {
            zombieCell.y_coord -= 1;
          } else {
            zombieCell.y_coord += 1;
          }
        }
      }

      const updatedZombieCellDom = document.getElementById(`${zombieCell.x_coord}-${zombieCell.y_coord}`);

      if (updatedZombieCellDom.classList.contains('center')) {
        // stop moving
      } else if (updatedZombieCellDom.classList.contains('border')) {
        // stop moving
      } else if (updatedZombieCellDom.classList.contains('zombie')) {
        // stop moving
      } else {
        initialZombieCellDom.classList.remove('zombie');
        updatedZombieCellDom.classList.add('zombie');
      }
    }

    // Center neighbour -----------------------------------
    let centerNeighbourZombieCells = [];
    for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
      for (let index_X = 0; index_X < GRID_SIZE; index_X++) {
        const cellId = `${index_X}-${index_Y}`;
        const cellDom = document.getElementById(cellId);
        if (!cellDom.classList.contains('zombie')) continue;

        let neighbourCells = [
          { x_coord: index_X, y_coord: index_Y - 1, }, // top
          { x_coord: index_X - 1, y_coord: index_Y, }, // left
          { x_coord: index_X + 1, y_coord: index_Y, }, // right
          { x_coord: index_X, y_coord: index_Y + 1, }, // bottom
        ];

        for (let neighbourCell of neighbourCells) {
          if (neighbourCell == null) continue;
          const cellId = `${neighbourCell.x_coord}-${neighbourCell.y_coord}`;
          const neighbourCellDom = document.getElementById(cellId);
          if (neighbourCellDom == null) continue;
          if (!neighbourCellDom.classList.contains('center')) continue;

          centerNeighbourZombieCells.push(neighbourCellDom.id);
        }
      }
    }

    if (centerNeighbourZombieCells.length != 0) {
      endGame();
      return;
    }

    // Border attack --------------------------------------
    for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
      for (let index_X = 0; index_X < GRID_SIZE; index_X++) {
        const cellId = `${index_X}-${index_Y}`;
        const cellDom = document.getElementById(cellId);
        if (!cellDom.classList.contains('zombie')) continue;

        let neighbourCells = [
          { x_coord: index_X, y_coord: index_Y - 1, }, // top
          { x_coord: index_X - 1, y_coord: index_Y, }, // left
          { x_coord: index_X + 1, y_coord: index_Y, }, // right
          { x_coord: index_X, y_coord: index_Y + 1, }, // bottom
        ];

        for (let neighbourCell of neighbourCells) {
          if (neighbourCell == null) continue;
          const cellId = `${neighbourCell.x_coord}-${neighbourCell.y_coord}`;
          const neighbourCellDom = document.getElementById(cellId);
          if (neighbourCellDom == null) continue;
          if (!neighbourCellDom.classList.contains('border')) continue;

          let value = getRandomIntegerBetween(1, 100);
          if (value <= 33) {
            if (neighbourCellDom.classList.contains('damaged')) {
              neighbourCellDom.classList.remove('damaged');
              neighbourCellDom.classList.remove('border');
            } else {
              neighbourCellDom.classList.add('damaged');
            }
          }

        }
      }
    }

    // New zombie cell spawn ==================================================

    let availableCells = [];
    for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
      for (let index_X = 0; index_X < GRID_SIZE; index_X++) {
        if ((index_X != 0 && index_X != GRID_SIZE - 1) && (index_Y != 0 && index_Y != GRID_SIZE - 1)) continue;
        const cellId = `${index_X}-${index_Y}`;
        const cell = document.getElementById(cellId);
        if (!cell.classList.contains('center') && !cell.classList.contains('border') && !cell.classList.contains('zombie')) {
          availableCells.push(cellId);
        }
      }
    }

    if (availableCells.length == 0) {
      const screenArea = document.getElementById('screenArea');
      screenArea.innerHTML = 'You LOOSE :(';
      endGame();
      return;
    } else {
      const randomId = availableCells[getRandomIntegerBetween(0, availableCells.length - 1)];
      const cellDom = document.getElementById(randomId);
      
      let value = getRandomIntegerBetween(1, 100);
      if (value <= spawnProbability) {
        cellDom.classList.add('zombie');
      }

      if (spawnProbability < 100) {
        let value = getRandomIntegerBetween(1, 100);
        if (value <= 66) {
          spawnProbability += 1;
          console.log(spawnProbability);
        }
      }

      let value2 = getRandomIntegerBetween(1, 100);
      if (value2 <= currentKillScore) {
        for (let index = 0; index < 2; index++) {
          const randomId = availableCells[getRandomIntegerBetween(0, availableCells.length - 1)];
          const cellDom = document.getElementById(randomId);
          
          let value = getRandomIntegerBetween(1, 100);
          if (value <= spawnProbability) {
            cellDom.classList.add('zombie');
          }
        }
      }

    }

    gameLoop();
  }, activeTime);
}

function startGame() {
  clearTimeout(currentGameTimeout);
  clearTimeout(currentTimeTimeout);
  setupGrid();
  spawnProbability = startingSpawnProbability;
  currentKillScore = 0;
  document.getElementById('killScore').innerHTML = `${currentKillScore} kills`;
  document.getElementById('buttonsContainer').innerHTML = `
    <button ontouchstart="killBorder()" class="lzr-button">Electrified fortification</button>
    <button ontouchstart="killLaser()" class="lzr-button">Lasers</button>
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
  document.getElementById('buttonsContainer').innerHTML = `
    <button id="startButton" onclick="startGame()" class="lzr-button">Start</button>
  `;
}

function updateTime() {
  let currentTime = Date.now();
  //document.getElementById('time').innerHTML = `${((currentEndingingTime - currentTime) / 1000).toFixed(1)}s`;
  document.getElementById('duration').innerHTML = `${ getAdaptiveVerboseTimeStringByMilliseconds(currentTime - currentStartingTime) }`;
  currentTimeTimeout = setTimeout(() => {
    updateTime()
  }, 100);
}

function killBorder() {
    if (!isPlaying) return;
  for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
    for (let index_X = 0; index_X < GRID_SIZE; index_X++) {
      const cellDom = document.getElementById(`${index_X}-${index_Y}`);
      if (!cellDom.classList.contains('border')) continue;

      let neighbourCells = [
        { x_coord: index_X, y_coord: index_Y - 1, }, // top
        { x_coord: index_X - 1, y_coord: index_Y, }, // left
        { x_coord: index_X + 1, y_coord: index_Y, }, // right
        { x_coord: index_X, y_coord: index_Y + 1, }, // bottom
      ];

      for (const neighbourCell of neighbourCells) {
        const neighbourCellDom = document.getElementById(`${neighbourCell.x_coord}-${neighbourCell.y_coord}`);
        if (neighbourCellDom.classList.contains('border') || neighbourCellDom.classList.contains('center')) continue;
        
        if (neighbourCellDom.classList.contains('zombie')) {
          neighbourCellDom.classList.remove('zombie');
          currentKillScore += 1;
          document.getElementById('killScore').innerHTML = currentKillScore;
        }
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
window.killBorder = killBorder;

function killLaser() {
  if (!isPlaying) return;

  for (let index_Y = 0; index_Y < GRID_SIZE; index_Y++) {
    for (let index_X = 0; index_X < GRID_SIZE; index_X++) {
      if (index_X != MIDDLE_GRID_VALUE && index_Y != MIDDLE_GRID_VALUE) continue;

      const cellDom = document.getElementById(`${index_X}-${index_Y}`);
      if (cellDom.classList.contains('border') || cellDom.classList.contains('center')) continue;

      if (cellDom.classList.contains('zombie')) {
        cellDom.classList.remove('zombie');
        currentKillScore += 1;
        document.getElementById('killScore').innerHTML = `${currentKillScore} kills`;
      }
      cellDom.classList.add('wiped');
      cellDom.classList.add('lasers');

      setTimeout(() => {
        cellDom.classList.remove('wiped');
        cellDom.classList.remove('lasers');
      }, 200);
    }
  }
}
window.killLaser = killLaser;