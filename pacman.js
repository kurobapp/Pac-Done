/**
 * パックマンゲームのロジックを初期化します。
 * @param {object} sharedState - 共有状態オブジェクト
 */
function initializePacmanGame(sharedState) {

    // (DOM要素, 迷路レイアウト, ゲーム状態, コールバック, ゴースト関連 は変更なし)
    // ...
    const mazeContainer = document.getElementById('pacman-maze');
    const pacDoneIcon = document.getElementById('pac-done-icon');
    const pacDotsContainer = document.getElementById('pac-dots-container');
    const taskList = document.getElementById('task-list');

    const mazeLayout = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
        [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], 
        [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1],
        [1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
        [1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];

    let currentDirection = null;
    let requestedDirection = null;
    let gameInterval = null;
    const gameSpeed = 150; 
    let isMouthOpen = true;
    let onTaskCollision = (row, col) => {}; 
    let onDotCollision = () => {}; 
    let onClearScreen = () => {}; 
    let onGhostEaten = (ghost) => {}; 
    let onCaught = () => {}; 

    let ghosts = {}; 
    const ghostStartPositions = [
        { type: 'blinky', row: 7, col: 15 },
        { type: 'pinky',  row: 1, col: 4 },
        { type: 'inky',   row: 3, col: 28 },
        { type: 'clyde',  row: 13, col: 29 },
        { type: 'sue',    row: 1, col: 10 }, 
        { type: 'funky',  row: 8, col: 21 },
        { type: 'spunky', row: 7, col: 3 },
        { type: 'tim',    row: 8, col: 15 }
    ];

    // (createMaze, createDots, updateGhostPosition, updatePacmanPosition は変更なし)
    // ...
    const createMaze = () => {
        mazeContainer.innerHTML = '';
        mazeLayout.forEach((rowArray, rowIndex) => {
            rowArray.forEach((cellValue, colIndex) => {
                if (cellValue === 1) {
                    const wallElement = document.createElement('div');
                    wallElement.classList.add('maze-wall');
                    wallElement.style.gridRowStart = rowIndex + 1;
                    wallElement.style.gridColumnStart = colIndex + 1;
                    mazeContainer.appendChild(wallElement);
                }
            });
        });
        if (pacDoneIcon) mazeContainer.appendChild(pacDoneIcon);
        mazeContainer.appendChild(pacDotsContainer);
        mazeContainer.appendChild(taskList);
    };
    const createDots = () => {
        pacDotsContainer.innerHTML = '';
        const pacPos = sharedState.pacmanPosition;
        mazeLayout.forEach((rowArray, rowIndex) => {
            rowArray.forEach((cellValue, colIndex) => {
                if (cellValue === 0) {
                    if (rowIndex !== pacPos.row || colIndex !== pacPos.col) {
                        const dotElement = document.createElement('div');
                        dotElement.classList.add('pac-dot');
                        dotElement.style.gridRowStart = rowIndex + 1;
                        dotElement.style.gridColumnStart = colIndex + 1;
                        dotElement.dataset.row = rowIndex;
                        dotElement.dataset.col = colIndex;
                        pacDotsContainer.appendChild(dotElement);
                    }
                }
            });
        });
    };
    const updateGhostPosition = (ghost) => {
        if (ghost && ghost.element) {
            ghost.element.style.gridRowStart = ghost.row + 1;
            ghost.element.style.gridColumnStart = ghost.col + 1;
            ghost.element.style.display = 'block'; 
        }
    };
    const updatePacmanPosition = (row, col, direction) => {
        sharedState.pacmanPosition.row = row;
        sharedState.pacmanPosition.col = col;
        pacDoneIcon.style.gridRowStart = row + 1;
        pacDoneIcon.style.gridColumnStart = col + 1;
        isMouthOpen = !isMouthOpen;
        pacDoneIcon.classList.toggle('mouth-closed', !isMouthOpen);
        let rotation = pacDoneIcon.style.transform;
        switch (direction) {
            case 'up': rotation = 'rotate(-90deg)'; break;
            case 'down': rotation = 'rotate(90deg)'; break;
            case 'left': rotation = 'rotate(180deg)'; break;
            case 'right': rotation = 'rotate(0deg)'; break;
        }
        pacDoneIcon.style.transform = rotation;
    };

    // (リセット用関数, initializeGamePositions, キー入力, ループ制御, 衝突判定 は変更なし)
    // ...
    const resetPacmanPosition = () => {
        const startRow = 12; 
        const startCol = 1;
        sharedState.pacmanPosition.row = startRow;
        sharedState.pacmanPosition.col = startCol;
        updatePacmanPosition(startRow, startCol, 'right');
        currentDirection = null;
        requestedDirection = null;
        stopPacman();
    };
    const resetAllGhostsPosition = () => {
        Object.values(ghosts).forEach(ghost => {
            const startPos = ghostStartPositions.find(p => p.type === ghost.type);
            if (startPos) {
                ghost.row = startPos.row;
                ghost.col = startPos.col;
                ghost.state = 'NORMAL';
                ghost.lastMove = null;
                ghost.element.classList.remove('frightened');
                ghost.element.style.display = 'block';
                updateGhostPosition(ghost);
            }
        });
    };
    const initializeGamePositions = () => {
        resetPacmanPosition();
        Object.values(ghosts).forEach(ghost => {
            updateGhostPosition(ghost);
        });
        createDots();
        sharedState.availableDots = [];
        mazeLayout.forEach((rowArray, rowIndex) => {
            rowArray.forEach((cellValue, colIndex) => {
                if (cellValue === 0) {
                    if (rowIndex !== sharedState.pacmanPosition.row || colIndex !== sharedState.pacmanPosition.col) {
                        sharedState.availableDots.push({ row: rowIndex, col: colIndex });
                    }
                }
            });
        });
        sharedState.availableDots.sort(() => Math.random() - 0.5);
    };
    document.addEventListener('keydown', (e) => {
        if (document.activeElement.id === 'task-input' || document.activeElement.id === 'task-deadline' || document.activeElement.tagName === 'INPUT') {
            return;
        }
        e.preventDefault();
        let newDirection = null;
        switch (e.key) {
            case 'ArrowUp': newDirection = 'up'; break;
            case 'ArrowDown': newDirection = 'down'; break;
            case 'ArrowLeft': newDirection = 'left'; break;
            case 'ArrowRight': newDirection = 'right'; break;
        }
        if (newDirection) {
            requestedDirection = newDirection;
            if (!gameInterval) {
                startGameLoop();
            }
        }
    });
    const startGameLoop = () => {
        if (gameInterval) return;
        gameLoop();
        gameInterval = setInterval(gameLoop, gameSpeed);
    };
    const stopPacman = () => {
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
    };
    const isWall = (row, col) => {
        if (row < 0 || row >= mazeLayout.length || col < 0 || col >= mazeLayout[0].length) {
            return true;
        }
        return mazeLayout[row][col] === 1;
    };
    const handleDirectionChange = () => {
        if (!requestedDirection) return;
        if ((currentDirection === 'up' && requestedDirection === 'down') ||
            (currentDirection === 'down' && requestedDirection === 'up') ||
            (currentDirection === 'left' && requestedDirection === 'right') ||
            (currentDirection === 'right' && requestedDirection === 'left')) {
            currentDirection = requestedDirection;
            requestedDirection = null;
            return;
        }
        let dx = 0, dy = 0;
        switch (requestedDirection) {
            case 'up': dy = -1; break;
            case 'down': dy = 1; break;
            case 'left': dx = -1; break;
            case 'right': dx = 1; break;
        }
        const nextRow = sharedState.pacmanPosition.row + dy;
        const nextCol = sharedState.pacmanPosition.col + dx;
        if (!isWall(nextRow, nextCol)) {
            currentDirection = requestedDirection;
            requestedDirection = null;
        }
    };
    const checkDotCollision = (row, col) => {
        const dotToEat = pacDotsContainer.querySelector(`.pac-dot[data-row="${row}"][data-col="${col}"]`);
        if (dotToEat) {
            dotToEat.remove();
            onDotCollision(); 
            if (pacDotsContainer.childElementCount === 0) {
                onClearScreen(); 
                createDots();
            }
        }
    };
    const checkGhostCollision = () => {
        const pacPos = sharedState.pacmanPosition;
        for (const ghostId in ghosts) {
            const ghost = ghosts[ghostId];
            if (ghost.row === pacPos.row && ghost.col === pacPos.col) {
                if (ghost.state === 'FRIGHTENED') {
                    eatGhost(ghost);
                    return true; 
                } else if (ghost.state === 'NORMAL') {
                    onCaught(); 
                    return true; 
                }
            }
        }
        return false; 
    };

    // (ゴーストAI関連: getDistance, findBestMove は変更なし)
    // ...
    const getDistance = (row1, col1, row2, col2) => {
        const mazeHeight = mazeLayout.length;
        const mazeWidth = mazeLayout[0].length;
        const dy = row2 - row1;
        const dx = col2 - col1;
        const distY = Math.abs(dy);
        const distX = Math.abs(dx);
        let effectiveDistY = distY;
        let effectiveDistX = distX;
        if (row1 === 7 || row1 === 8) {
            const warpDistX = mazeWidth - distX;
            effectiveDistX = Math.min(distX, warpDistX);
        }
        if (col1 === 10 || col1 === 11 || col1 === 19 || col1 === 20) {
            const warpDistY = mazeHeight - distY;
            effectiveDistY = Math.min(distY, warpDistY);
        }
        return (effectiveDistX * effectiveDistX) + (effectiveDistY * effectiveDistY);
    };
    const findBestMove = (ghost, targetRow, targetCol, flee = false) => {
        const directions = [
            { name: 'up',    dr: -1, dc:  0 },
            { name: 'down',  dr:  1, dc:  0 },
            { name: 'left',  dr:  0, dc: -1 },
            { name: 'right', dr:  0, dc:  1 }
        ];
        const oppositeMove = {
            'up': 'down', 'down': 'up', 'left': 'right', 'right': 'left'
        };
        const lastMove = ghost.lastMove;
        let bestMove = null;
        let bestDistance = flee ? -Infinity : Infinity; 
        const possibleMoves = directions.filter(dir => {
            if (dir.name === oppositeMove[lastMove]) {
                return false; 
            }
            let nextRow = ghost.row + dir.dr;
            let nextCol = ghost.col + dir.dc;
            if (nextRow === 7 || nextRow === 8) {
                if (nextCol < 0) nextCol = mazeLayout[0].length - 1;
                else if (nextCol >= mazeLayout[0].length) nextCol = 0;
            }
            if (nextCol === 10 || nextCol === 11 || nextCol === 19 || nextCol === 20) {
                if (nextRow < 0) nextRow = mazeLayout.length - 1;
                else if (nextRow >= mazeLayout.length) nextRow = 0;
            }
            return !isWall(nextRow, nextCol);
        });
        let movesToConsider = possibleMoves;
        if (possibleMoves.length === 0 && lastMove && oppositeMove[lastMove]) {
            const reverseDir = directions.find(d => d.name === oppositeMove[lastMove]);
            if (reverseDir) {
                let nextRow = ghost.row + reverseDir.dr;
                let nextCol = ghost.col + reverseDir.dc;
                if (nextRow === 7 || nextRow === 8) {
                    if (nextCol < 0) nextCol = mazeLayout[0].length - 1;
                    else if (nextCol >= mazeLayout[0].length) nextCol = 0;
                }
                if (nextCol === 10 || nextCol === 11 || nextCol === 19 || nextCol === 20) {
                    if (nextRow < 0) nextRow = mazeLayout.length - 1;
                    else if (nextRow >= mazeLayout.length) nextRow = 0;
                }
                if (!isWall(nextRow, nextCol)) {
                    movesToConsider = [reverseDir];
                }
            }
        }
        if (movesToConsider.length === 0) {
            return null;
        }
        movesToConsider.forEach(dir => {
            let nextRow = ghost.row + dir.dr;
            let nextCol = ghost.col + dir.dc;
            if (nextRow === 7 || nextRow === 8) {
                if (nextCol < 0) nextCol = mazeLayout[0].length - 1;
                else if (nextCol >= mazeLayout[0].length) nextCol = 0;
            }
            if (nextCol === 10 || nextCol === 11 || nextCol === 19 || nextCol === 20) {
                if (nextRow < 0) nextRow = mazeLayout.length - 1;
                else if (nextRow >= mazeLayout.length) nextRow = 0;
            }
            const distance = getDistance(nextRow, nextCol, targetRow, targetCol);
            if (flee) {
                if (distance > bestDistance) {
                    bestDistance = distance;
                    bestMove = { row: nextRow, col: nextCol, name: dir.name };
                }
            } else {
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMove = { row: nextRow, col: nextCol, name: dir.name };
                }
            }
        });
        return bestMove;
    };

    /**
     * ★★★ 2倍速処理を追加 ★★★
     */
    const moveGhosts = () => {
        const targetRow = sharedState.pacmanPosition.row;
        const targetCol = sharedState.pacmanPosition.col;

        Object.values(ghosts).forEach(ghost => {
            if (ghost.state === 'FRIGHTENED' || ghost.state === 'EATEN') {
                return; // このゴーストの移動処理をスキップ
            }

            // ★ 1回目の移動（全ゴースト共通）
            const bestMove1 = findBestMove(ghost, targetRow, targetCol, false);
            if (bestMove1) {
                ghost.row = bestMove1.row;
                ghost.col = bestMove1.col;
                ghost.lastMove = bestMove1.name; 
                updateGhostPosition(ghost); 
            }

            // ★ 2回目の移動（期限切れゴーストのみ）
            if (ghost.isOverdue) {
                // 1回目の移動後の現在地から、再度最適な移動先を計算
                const bestMove2 = findBestMove(ghost, targetRow, targetCol, false);
                if (bestMove2) {
                    ghost.row = bestMove2.row;
                    ghost.col = bestMove2.col;
                    ghost.lastMove = bestMove2.name; 
                    updateGhostPosition(ghost); 
                }
            }
        });
    };


    // (gameLoop, eatGhost, 初期化実行 は変更なし)
    // ...
    const gameLoop = () => {
        if (!currentDirection) {
            if (requestedDirection) {
                currentDirection = requestedDirection;
                requestedDirection = null;
            } else {
                stopPacman();
                return;
            }
        }
        handleDirectionChange();
        let dx = 0, dy = 0;
        switch (currentDirection) {
            case 'up': dy = -1; break;
            case 'down': dy = 1; break;
            case 'left': dx = -1; break;
            case 'right': dx = 1; break;
            default:
                stopPacman();
                return;
        }
        let newRow = sharedState.pacmanPosition.row + dy;
        let newCol = sharedState.pacmanPosition.col + dx;
        if ((newRow === 7 || newRow === 8)) {
            if (newCol < 0) newCol = mazeLayout[0].length - 1;
            else if (newCol >= mazeLayout[0].length) newCol = 0;
        }
        if ((newCol === 10 || newCol === 11 || newCol === 19 || newCol === 20)) {
            if (newRow < 0) newRow = mazeLayout.length - 1;
            else if (newRow >= mazeLayout.length) newRow = 0;
        }
        if (isWall(newRow, newCol)) {
            currentDirection = null;
            stopPacman();
            return;
        }
        updatePacmanPosition(newRow, newCol, currentDirection);
        onTaskCollision(newRow, newCol);
        checkDotCollision(newRow, newCol);
        if (checkGhostCollision()) {
            return; 
        }
        moveGhosts(); 
        checkGhostCollision();
    };
    const eatGhost = (ghost) => {
        if (ghost.element) {
            ghost.element.remove();
        }
        const ghostId = ghost.id;
        if (ghosts[ghostId]) {
            delete ghosts[ghostId];
        }
        onGhostEaten(ghost);
    };
    createMaze();
    initializeGamePositions();
    
    // --- 外部公開用 ---
    window.pacmanGame = {
        setTaskCollisionCallback: (callback) => { onTaskCollision = callback; },
        setDotCollisionCallback: (callback) => { onDotCollision = callback; },
        setClearScreenCallback: (callback) => { onClearScreen = callback; },
        setGhostEatenCallback: (callback) => { onGhostEaten = callback; },
        setCaughtCallback: (callback) => { onCaught = callback; }, 

        /**
         * ★★★ 引数に isOverdue を追加 ★★★
         * ゴーストを生成し、当たり判定リストに登録する
         */
        spawnGhost: (taskId, ghostType, initialState = 'NORMAL', isOverdue = false) => {
            if (!ghostType) {
                console.error("無効なゴーストタイプ:", ghostType);
                return;
            }
            if (ghosts[taskId]) {
                return ghosts[taskId]; 
            }
            const startPos = ghostStartPositions.find(p => p.type === ghostType);
            if (!startPos) return; 
            const ghostElement = document.createElement('div');
            ghostElement.classList.add('ghost', ghostType);
            const eyes = document.createElement('div');
            eyes.classList.add('eyes');
            const eye1 = document.createElement('div');
            eye1.classList.add('eye');
            const pupil1 = document.createElement('div');
            pupil1.classList.add('pupil');
            eye1.appendChild(pupil1);
            const eye2 = document.createElement('div');
            eye2.classList.add('eye');
            const pupil2 = document.createElement('div');
            pupil2.classList.add('pupil');
            eye2.appendChild(pupil2);
            eyes.appendChild(eye1);
            eyes.appendChild(eye2);
            ghostElement.appendChild(eyes);
            mazeContainer.appendChild(ghostElement);
            
            const newGhost = {
                id: taskId,
                type: ghostType,
                element: ghostElement,
                row: startPos.row,
                col: startPos.col,
                state: initialState,
                lastMove: null,
                isOverdue: isOverdue // ★★★ プロパティを追加 ★★★
            };
            
            ghosts[taskId] = newGhost;

            if (initialState === 'FRIGHTENED') {
                ghostElement.classList.add('frightened');
            } else if (initialState === 'EATEN') {
                ghostElement.style.display = 'none'; 
            }
            if (initialState !== 'EATEN') {
                updateGhostPosition(newGhost);
            }
            return newGhost;
        },

        // (setGhostFrightened, removeGhost, resetEatenGhost, resetGamePositions, getGhostsState は変更なし)
        // ...
        setGhostFrightened: (taskId) => {
            const ghost = ghosts[taskId];
            if (!ghost || ghost.state === 'EATEN') return; 
            if (ghost.state !== 'FRIGHTENED') {
                ghost.state = 'FRIGHTENED';
                ghost.element.classList.add('frightened');
                ghost.element.classList.remove('blinking');
            }
        },
        removeGhost: (taskId) => {
            const ghost = ghosts[taskId];
            if (ghost) {
                if (ghost.element) {
                    ghost.element.remove(); 
                }
                delete ghosts[taskId];
            }
        },
        resetEatenGhost: (ghost) => {
             const startPos = ghostStartPositions.find(p => p.type === ghost.type);
             const internalGhost = ghosts[ghost.id];
             if (startPos && internalGhost) { 
                internalGhost.row = startPos.row;
                internalGhost.col = startPos.col;
                internalGhost.state = 'NORMAL'; 
                internalGhost.element.classList.remove('frightened');
                internalGhost.element.style.display = 'block'; 
                updateGhostPosition(internalGhost); 
             }
        },
        resetGamePositions: () => {
            resetPacmanPosition();
            resetAllGhostsPosition();
        },
        getGhostsState: () => {
            return Object.values(ghosts).map(ghost => ({
                id: ghost.id,
                type: ghost.type,
                state: ghost.state
            }));
        }
    };
}