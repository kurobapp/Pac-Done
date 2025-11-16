/**
 * パックマンゲームのロジックを初期化します。
 * @param {object} sharedState - 共有状態オブジェクト
 */
function initializePacmanGame(sharedState) {

    // (DOM要素)
    const mazeContainer = document.getElementById('pacman-maze');
    const pacDoneIcon = document.getElementById('pac-done-icon');
    const pacDotsContainer = document.getElementById('pac-dots-container');
    const taskList = document.getElementById('task-list');

    // (迷路レイアウト)
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

    // (ゲーム状態, コールバック)
    let currentDirection = null;
    let requestedDirection = null;
    let gameInterval = null;
    const gameSpeed = 150; 
    let isMouthOpen = true;
    let onTaskCollision = (row, col) => {}; 
    let onDotCollision = () => {}; 
    let onClearScreen = () => {}; 
    let onGhostEaten = (ghost) => {}; 

    // (ゴースト関連)
    let ghosts = {}; // pacman.js 内部で管理するゴーストのフルオブジェクト
    const ghostStartPositions = [
        { type: 'blinky', row: 7, col: 15 },
        { type: 'pinky',  row: 7, col: 14 },
        { type: 'inky',   row: 7, col: 16 },
        { type: 'clyde',  row: 7, col: 13 }
    ];

    // (createMaze, createDots, updateGhostPosition, updatePacmanPosition, initializeGamePositions は変更なし)
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
    const initializeGamePositions = () => {
        updatePacmanPosition(sharedState.pacmanPosition.row, sharedState.pacmanPosition.col, 'right');
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

    // (キー入力リスナー, startGameLoop, stopPacman, isWall, handleDirectionChange は変更なし)
    // ...
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
    
    // (checkDotCollision, checkGhostCollision, gameLoop は変更なし)
    // ...
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
                } 
            }
        }
    };
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
            else if (newRow >= mazeLayout.length) newCol = 0;
        }
        if (isWall(newRow, newCol)) {
            currentDirection = null;
            stopPacman();
            return;
        }
        updatePacmanPosition(newRow, newCol, currentDirection);
        onTaskCollision(newRow, newCol);
        checkDotCollision(newRow, newCol);
        checkGhostCollision();
    };

    /**
     * ★★★ 変更箇所 ★★★
     * ゴーストを食べる処理
     * (状態を EATEN にせず、データごと削除する)
     */
    const eatGhost = (ghost) => {
        // ghost.state = 'EATEN'; // ← 削除
        
        // 1. DOM要素を画面から完全に削除
        if (ghost.element) {
            ghost.element.remove();
        }

        // 2. 内部の管理リストからゴーストを削除
        const ghostId = ghost.id;
        if (ghosts[ghostId]) {
            delete ghosts[ghostId];
        }
        
        onGhostEaten(ghost); // app.js に通知 (saveDataトリガー)
    };
    // ★★★ 変更ここまで ★★★


    // --- 初期化実行 ---
    createMaze();
    initializeGamePositions();
    
    // --- 外部公開用 ---
    window.pacmanGame = {
        setTaskCollisionCallback: (callback) => { onTaskCollision = callback; },
        setDotCollisionCallback: (callback) => { onDotCollision = callback; },
        setClearScreenCallback: (callback) => { onClearScreen = callback; },
        setGhostEatenCallback: (callback) => { onGhostEaten = callback; },

        /**
         * ★変更: initialState を受け取り、ロードに対応
         */
        spawnGhost: (taskId, ghostType, initialState = 'NORMAL') => {
            if (!ghostType) {
                console.error("無効なゴーストタイプ:", ghostType);
                return;
            }
            // 既に内部リストに存在する場合は生成しない (ロード時の重複防止)
            if (ghosts[taskId]) {
                return ghosts[taskId]; // 既存のゴーストを返す
            }
            
            const startPos = ghostStartPositions.find(p => p.type === ghostType);
            if (!startPos) return; 

            // 1. DOM要素の動的生成
            const ghostElement = document.createElement('div');
            ghostElement.classList.add('ghost', ghostType);
            // (目の生成)
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

            // 3. 迷路コンテナに追加
            mazeContainer.appendChild(ghostElement);

            // 4. 内部状態の作成
            const newGhost = {
                id: taskId,
                type: ghostType,
                element: ghostElement,
                row: startPos.row,
                col: startPos.col,
                state: initialState // ★引数で受け取った状態を設定
            };
            ghosts[taskId] = newGhost;

            // 5. ★ロードされた状態に基づいてDOMを調整
            if (initialState === 'FRIGHTENED') {
                ghostElement.classList.add('frightened');
            } else if (initialState === 'EATEN') {
                ghostElement.style.display = 'none'; // 食べられていたら非表示
            }
            
            // EATEN 状態でなければ初期位置に配置
            if (initialState !== 'EATEN') {
                updateGhostPosition(newGhost);
            }

            return newGhost;
        },

        setGhostFrightened: (taskId) => {
            const ghost = ghosts[taskId];
            if (!ghost || ghost.state === 'EATEN') return; 
            
            // 状態が既に FRIGHTENED でなければ更新
            if (ghost.state !== 'FRIGHTENED') {
                ghost.state = 'FRIGHTENED';
                ghost.element.classList.add('frightened');
                ghost.element.classList.remove('blinking');
                // (app.js側が saveData を呼ぶ)
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

        /**
         * ★変更: 状態を NORMAL に戻す
         */
        resetEatenGhost: (ghost) => {
             const startPos = ghostStartPositions.find(p => p.type === ghost.type);
             // ★ghost.id で内部リスト(ghosts)を再検索
             const internalGhost = ghosts[ghost.id];

             if (startPos && internalGhost) { // 削除されてないか確認
                internalGhost.row = startPos.row;
                internalGhost.col = startPos.col;
                internalGhost.state = 'NORMAL'; // ★状態を NORMAL に
                internalGhost.element.classList.remove('frightened');
                internalGhost.element.style.display = 'block'; // 再表示
                updateGhostPosition(internalGhost); // 位置をリセット
                
                // (app.js 側が saveData を呼ぶ)
             }
        },

        /**
         * ★追加: 現在のゴースト状態(ID, Type, State)を保存用に返す
         */
        getGhostsState: () => {
            return Object.values(ghosts).map(ghost => ({
                id: ghost.id,
                type: ghost.type,
                state: ghost.state
            }));
        }
    };
}