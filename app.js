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
        ghosts: [] // ロード/保存専用のデータとして使う
    };

    // --- 保存・読み込み機能 ---
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

    const loadData = () => {
        const loadedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { tasks: [], mazeFeeds: [], score: 0, ghosts: [] };
        sharedState.tasks = loadedData.tasks;
        sharedState.mazeFeeds = loadedData.mazeFeeds;
        sharedState.score = loadedData.score || 0;
        sharedState.ghosts = loadedData.ghosts || []; 
    };

    // --- スコア管理機能 ---
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

    // --- コールバック定義 ---
    const handleDotCollision = () => { addScore(10); };
    const handleClearScreen = () => { addScore(350); };
    const handleTaskDataChange = () => { saveData(); };

    const handleTaskAdded = (newTask) => {
        const GHOST_TYPES = ['blinky', 'pinky', 'inky', 'clyde'];
        
        const activeGhostCount = (window.pacmanGame && window.pacmanGame.getGhostsState) 
                                 ? window.pacmanGame.getGhostsState().length : 0;

        if (activeGhostCount >= GHOST_TYPES.length) {
            alert("ゴーストの最大数(4体)に達しています。");
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
        
        if (window.pacmanGame && window.pacmanGame.spawnGhost) {
            window.pacmanGame.spawnGhost(newTask.id, newGhostType);
        }
        
        return true; 
    };

    const handleGhostEaten = (ghost) => {
        addScore(10000); 
    };

    const handleTaskDeleted = (taskId) => {
        if (window.pacmanGame && window.pacmanGame.removeGhost) {
            window.pacmanGame.removeGhost(taskId);
        }
        saveData();
    };


    // --- ロジックの初期化 ---
    initializePacmanGame(sharedState);
    initializeTaskLogic(sharedState, handleTaskDataChange, handleTaskAdded, handleTaskDeleted);


    // --- ロジックの連携とデータロード ---
    if (window.pacmanGame && window.taskLogic) {
        
        loadData();
        updateScoreUI();
        
        // ★★★ 修正箇所 ★★★
        // データの整合性チェック (filter処理を削除)
        // 
        // 削除理由: 
        // saveData() の時点で、削除すべきゴーストは既に除外されたリストが保存されているため、
        // loadData() で読み込んだ sharedState.ghosts は、フィルタリングせずに
        // すべて復元するのが正しい。
        //
        // (旧コード: sharedState.ghosts = sharedState.ghosts.filter(...);)
        // ★★★ 修正ここまで ★★★
        
        // (タスクDOMの描画)
        window.taskLogic.renderAll(); 
        
        const occupiedPositions = new Set();
        sharedState.mazeFeeds.forEach(feed => {
            occupiedPositions.add(`${feed.row},${feed.col}`);
        });

        // ロードしたゴーストを 'state' 付きで再配置
        // (フィルタリングされなくなったため、イジケ/食べられ状態でも復元される)
        sharedState.ghosts.forEach(ghost => {
            if (window.pacmanGame.spawnGhost) {
                window.pacmanGame.spawnGhost(ghost.id, ghost.type, ghost.state);
            }
        });

        sharedState.availableDots = sharedState.availableDots.filter(pos => {
            const posKey = `${pos.row},${pos.col}`;
            return !occupiedPositions.has(posKey);
        });

        // --- コールバック設定 ---
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

    } else {
        console.error("ロジックファイルの読み込みに失敗しました。");
    }
});