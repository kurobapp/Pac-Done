document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM要素の取得 ---
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskDeadlineInput = document.getElementById('task-deadline');
    const taskList = document.getElementById('task-list'); 
    const mazeContainer = document.getElementById('pacman-maze');
    const pacDoneIcon = document.getElementById('pac-done-icon'); 

    // --- 迷路レイアウト定義 ---
    const mazeLayout = [
    //   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0 (ワープ)
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1
        [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1], // 2
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], // 3
        [1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1], // 4
        [1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1], // 5
        [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1], // 6
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], // 7 (ワープ)
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], // 8 (ワープ)
        [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1], // 9
        [1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1], // 10
        [1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1], // 11
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], // 12
        [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1], // 13 
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 14
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 15 (ワープ)
    ];

    // --- ゲームの状態 ---
    let pacmanPosition = { row: 12, col: 1 }; // パックマンの初期位置 (0-indexed)
    let currentDirection = null;
    let requestedDirection = null;
    let gameInterval = null;
    const gameSpeed = 150; // ms (150msごとに1マス進む)
    let isMouthOpen = true; 

    //迷路の壁を生成する
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
        if (pacDoneIcon) {
             mazeContainer.appendChild(pacDoneIcon);
        }
        mazeContainer.appendChild(taskList);
    };

    /**
     * パックマンの初期位置設定と、餌を置ける場所（道）のリストを作成 (変更なし)
     */
    const initializeGame = () => {
        updatePacmanPosition(pacmanPosition.row, pacmanPosition.col, 'right'); // 初期は右向き
        availableDots = [];
        mazeLayout.forEach((rowArray, rowIndex) => {
            rowArray.forEach((cellValue, colIndex) => {
                if (cellValue === 0) { 
                    if (rowIndex !== pacmanPosition.row || colIndex !== pacmanPosition.col) {
                        availableDots.push({ row: rowIndex, col: colIndex });
                    }
                }
            });
        });
        availableDots.sort(() => Math.random() - 0.5);
    };

    /**
     * タスク追加フォームの送信処理 (変更なし)
     */
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const text = taskInput.value.trim();
        const deadline = taskDeadlineInput.value;
        if (text === '') return; 
        if (availableDots.length === 0) {
            alert('迷路上に餌を置くスペースがありません！');
            return;
        }
        const position = availableDots.shift(); 
        const taskElement = document.createElement('div');
        taskElement.classList.add('task-item');
        taskElement.style.gridRowStart = position.row + 1;
        taskElement.style.gridColumnStart = position.col + 1;
        taskElement.dataset.row = position.row;
        taskElement.dataset.col = position.col;
        const taskTextElement = document.createElement('div');
        taskTextElement.classList.add('task-text');
        const taskName = document.createElement('span');
        taskName.textContent = text;
        taskTextElement.appendChild(taskName);
        if (deadline) {
            const deadlineText = document.createElement('span');
            deadlineText.classList.add('task-deadline');
            deadlineText.textContent = `締切: ${deadline}`;
            taskTextElement.appendChild(deadlineText);
        }
        taskElement.appendChild(taskTextElement);
        taskList.appendChild(taskElement); 
        taskInput.value = '';
        taskDeadlineInput.value = '';
    });

    // --- パックマン移動関連 ---
    document.addEventListener('keydown', (e) => {
        if (document.activeElement === taskInput || document.activeElement === taskDeadlineInput) {
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
        if ( (currentDirection === 'up' && requestedDirection === 'down') ||
             (currentDirection === 'down' && requestedDirection === 'up') ||
             (currentDirection === 'left' && requestedDirection === 'right') ||
             (currentDirection === 'right' && requestedDirection === 'left') ) {
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
        const nextRow = pacmanPosition.row + dy;
        const nextCol = pacmanPosition.col + dx;
        if (!isWall(nextRow, nextCol)) {
            currentDirection = requestedDirection;
            requestedDirection = null; 
        }
    };

    const gameLoop = () => {
        if (!currentDirection) {
            if (requestedDirection) {
                currentDirection = requestedDirection; 
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
        
        let newRow = pacmanPosition.row + dy;
        let newCol = pacmanPosition.col + dx;
        
        // ワープ処理 
        if ((newRow === 7 || newRow === 8)) {
            if (newCol < 0) newCol = mazeLayout[0].length - 1;
            else if (newCol >= mazeLayout[0].length) newCol = 0;
        }
        if ((newCol === 10 || newCol === 11 || newCol === 19 || newCol === 20)) {
            if (newRow < 0) newRow = mazeLayout.length - 1;
            else if (newRow >= mazeLayout.length) newRow = 0;
        }
        
        // 壁(1)かどうかの判定 (isWall)
        if (isWall(newRow, newCol)) {
            currentDirection = null; // 停止
            stopPacman();
            return; // 移動しない
        }

        // 6. 位置の更新 (壁ではない)
        updatePacmanPosition(newRow, newCol, currentDirection); // 向きも渡す

        // 7. 餌（タスク）との衝突判定
        checkTaskCollision(newRow, newCol);
    };


    /**
     * パックマンのDOM位置と内部状態を更新
     * (★修正: パクパクアニメーションの切り替えを追加)
     */
    const updatePacmanPosition = (row, col, direction) => {
        // 内部状態を更新
        pacmanPosition.row = row;
        pacmanPosition.col = col;

        // DOM (CSS Grid) の位置を更新
        pacDoneIcon.style.gridRowStart = row + 1;
        pacDoneIcon.style.gridColumnStart = col + 1;

        // 口の開閉を切り替える
        isMouthOpen = !isMouthOpen; // 状態を反転
        // isMouthOpen が false の時 (口を閉じる時) に 'mouth-closed' クラスを追加
        pacDoneIcon.classList.toggle('mouth-closed', !isMouthOpen); 

        // 向き (transform) を更新
        let rotation;
        switch (direction) {
            case 'up':
                rotation = 'rotate(-90deg)'; 
                break;
            case 'down':
                rotation = 'rotate(90deg)';
                break;
            case 'left':
                rotation = 'rotate(180deg)';
                break;
            case 'right':
                rotation = 'rotate(0deg)';
                break;
            default:
                // direction が null や 'stop' の場合、何もしない (現在の向きを維持)
                return; 
        }
        pacDoneIcon.style.transform = rotation;
    };

    /**
     * 指定した座標の餌（タスク）を食べる処理 (変更なし)
     */
    const checkTaskCollision = (row, col) => {
        const taskToEat = taskList.querySelector(`.task-item[data-row="${row}"][data-col="${col}"]`);
        if (taskToEat) {
            taskToEat.remove(); 
            availableDots.push({ row: row, col: col });
            availableDots.sort(() => Math.random() - 0.5);
        }
    };


    // --- 初期化処理の実行 ---
    createMaze(); // 1. 迷路の壁を生成
    initializeGame(); // 2. パックマンと餌の配置準備

});