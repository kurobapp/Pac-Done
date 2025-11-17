document.addEventListener('DOMContentLoaded', () => {

    const scoreValueElement = document.getElementById('score-value');
    const STORAGE_KEY = 'pacmanData';

    // --- 共有ステート ---
    const sharedState = {
        pacmanPosition: { row: 12, col: 1 }, 
        availableDots: [],
        tasks: [], 
        mazeFeeds: [],
        score: 0,
        ghosts: [] 
    };

    // --- データ保存・スコア・ユーティリティ ---
    
    // ローカルストレージに保存
    const saveData = () => {
        if (!window.pacmanGame || !window.pacmanGame.getGhostsState) {
            return;
        }
        const dataToSave = {
            tasks: sharedState.tasks,
            mazeFeeds: sharedState.mazeFeeds,
            score: sharedState.score,
            ghosts: window.pacmanGame.getGhostsState() 
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    };
    
    // ローカルストレージから読込
    const loadData = () => {
        const loadedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { tasks: [], mazeFeeds: [], score: 0, ghosts: [] };
        sharedState.tasks = loadedData.tasks;
        sharedState.mazeFeeds = loadedData.mazeFeeds;
        sharedState.score = loadedData.score || 0;
        sharedState.ghosts = loadedData.ghosts || []; 
    };
    
    // スコア関連
    const SCORE_LIMIT = 99999990; 
    const updateScoreUI = () => {
        if (scoreValueElement) {
            scoreValueElement.textContent = sharedState.score;
        }
    };
    const addScore = (points) => {
        sharedState.score += points;
        if (sharedState.score > SCORE_LIMIT) {
            alert("SCORE LIMIT! スコアが上限に達しました。リセットします。");
            sharedState.score = 0;
        }
        updateScoreUI();
        saveData(); 
    };
    
    // 期限切れ判定 (JST)
    const getDeadlineStatus = (deadlineString) => {
        if (!deadlineString) return 'none';
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const deadline = new Date(deadlineString + 'T00:00:00+09:00'); 
        if (isNaN(deadline.getTime())) return 'none';

        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'overdue'; // 期限切れ
        if (diffDays === 0 || diffDays === 1) return 'danger';
        if (diffDays === 2) return 'near';
        return 'none';
    };

    // --- コールバック定義 (各モジュールへ渡す) ---
    
    const handleDotCollision = () => { addScore(10); };
    const handleClearScreen = () => { addScore(350); };
    const handleTaskDataChange = () => { saveData(); };

    /**
     * タスク追加時 (task.js -> app.js)
     * ゴーストを生成する
     */
    const handleTaskAdded = (newTask) => {
        const GHOST_TYPES = ['blinky', 'pinky', 'inky', 'clyde', 'sue', 'funky', 'spunky', 'tim'];
        const activeGhostCount = (window.pacmanGame && window.pacmanGame.getGhostsState) 
                                 ? window.pacmanGame.getGhostsState().length : 0;
        if (activeGhostCount >= GHOST_TYPES.length) {
            alert("ゴーストの最大数(8体)に達しています。");
            return false;
        }
        const existingTypes = new Set(
            (window.pacmanGame && window.pacmanGame.getGhostsState) 
            ? window.pacmanGame.getGhostsState().map(g => g.type) 
            : []
        );
        let newGhostType = null;
        for (const type of GHOST_TYPES) {
            if (!existingTypes.has(type)) {
                newGhostType = type;
                break;
            }
        }
        if (!newGhostType) {
             alert("ゴーストの空きタイプが見つかりません。");
             return false;
        }

        const isOverdue = (getDeadlineStatus(newTask.deadline) === 'overdue');

        if (window.pacmanGame && window.pacmanGame.spawnGhost) {
            window.pacmanGame.spawnGhost(newTask.id, newGhostType, 'NORMAL', isOverdue);
        }
        return true; 
    };

    /**
     * イジケゴースト捕食時 (pacman.js -> app.js)
     */
    const handleGhostEaten = (ghost) => {
        addScore(10000); 
    };

    /**
     * ゴーストに捕まった時 (pacman.js -> app.js)
     * パックマン・ゴーストの「位置」とスコアをリセット（ゴーストの状態は維持）
     */
    const handleCaught = () => {
        alert("ゴーストに捕まった！");
        sharedState.score = 0;
        updateScoreUI();
        
        // 位置のみリセット (状態は維持)
        if (window.pacmanGame && window.pacmanGame.resetPacmanAndGhostPositions) {
            window.pacmanGame.resetPacmanAndGhostPositions();
        }
        saveData();
    };

    /**
     * タスク手動削除時 (task.js -> app.js)
     */
    const handleTaskDeleted = (taskId) => {
        if (window.pacmanGame && window.pacmanGame.removeGhost) {
            window.pacmanGame.removeGhost(taskId);
        }
        saveData();
    };

    /**
     * タスク完了＝餌化時 (task.js -> app.js)
     */
    const handleTaskCompleted = (taskId) => {
        // 該当ゴーストの 2倍速フラグ (isOverdue) を解除
        if (window.pacmanGame && window.pacmanGame.setGhostOverdueStatus) {
            window.pacmanGame.setGhostOverdueStatus(taskId, false);
        }
        saveData(); // 保存
    };


    // --- ロジックの初期化 ---
    
    initializePacmanGame(sharedState);
    
    initializeTaskLogic(
        sharedState, 
        handleTaskDataChange, 
        handleTaskAdded, 
        handleTaskDeleted,
        handleTaskCompleted 
    );


    // --- ロジックの連携とデータロード ---
    
    if (window.pacmanGame && window.taskLogic) {
        
        loadData();
        updateScoreUI();
        
        // DOM描画
        window.taskLogic.renderAll(); 
        
        // データ整合性チェック (餌の位置調整)
        const occupiedPositions = new Set();
        sharedState.mazeFeeds.forEach(feed => {
            occupiedPositions.add(`${feed.row},${feed.col}`);
        });

        // ゴースト再配置処理
        sharedState.ghosts.forEach(ghost => {
            if (window.pacmanGame.spawnGhost) {
                // 期限切れか判定
                const correspondingTask = sharedState.tasks.find(t => t.id === ghost.id);
                const deadline = correspondingTask ? correspondingTask.deadline : null;
                const isOverdue = (getDeadlineStatus(deadline) === 'overdue');
                
                window.pacmanGame.spawnGhost(ghost.id, ghost.type, ghost.state, isOverdue);
            }
        });

        // 餌と重ならないよう、配置可能なドット位置を調整
        sharedState.availableDots = sharedState.availableDots.filter(pos => {
            const posKey = `${pos.row},${pos.col}`;
            return !occupiedPositions.has(posKey);
        });

        // --- コールバック設定 ---
        
        // 餌（タスク）を食べた時
        window.pacmanGame.setTaskCollisionCallback((row, col) => {
            const eatenTaskId = window.taskLogic.checkTaskCollision(row, col);
            if (eatenTaskId) {
                window.pacmanGame.setGhostFrightened(eatenTaskId);
                saveData(); 
            }
        });
        
        window.pacmanGame.setDotCollisionCallback(handleDotCollision);
        window.pacmanGame.setClearScreenCallback(handleClearScreen);
        window.pacmanGame.setGhostEatenCallback(handleGhostEaten);
        window.pacmanGame.setCaughtCallback(handleCaught);

    } else {
        console.error("ロジックファイルの読み込みに失敗しました。");
    }
});