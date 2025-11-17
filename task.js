/**
 * ToDoタスク関連ロジック初期化
 * @param {object} sharedState 共有状態
 * @param {function} onDataChange データ変更時コールバック
 * @param {function} onTaskAdded タスク追加時コールバック
 * @param {function} onTaskDeleted タスク削除時コールバック
 * @param {function} onTaskCompleted タスク完了時コールバック
 */
function initializeTaskLogic(sharedState, onDataChange, onTaskAdded, onTaskDeleted, onTaskCompleted) {

    // --- DOM要素 ---
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskDeadlineInput = document.getElementById('task-deadline');
    const taskListMaze = document.getElementById('task-list'); 
    const todoListUl = document.getElementById('todo-list-ul'); 

    // カレンダーピッカー表示
    taskDeadlineInput.addEventListener('click', (e) => {
        e.preventDefault(); 
        try {
            taskDeadlineInput.showPicker();
        } catch (error) {
            console.error("カレンダーピッカーを開けませんでした:", error);
        }
    });

    // --- ユーティリティ・描画関数 ---
    
    // タスクを日付でソート
    const sortTasks = () => {
        sharedState.tasks.sort((a, b) => {
            const dateA = a.deadline ? new Date(a.deadline) : null;
            const dateB = b.deadline ? new Date(b.deadline) : null;
            if (dateA && dateB) { return dateA - dateB; }
            else if (dateA) { return -1; }
            else if (dateB) { return 1; }
            else { return 0; }
        });
    };
    
    // ToDoリストDOM再描画
    const renderTaskList = () => {
        todoListUl.innerHTML = '';
        sharedState.tasks.forEach(task => {
            drawTaskToList(task);
        });
    };
    
    // 迷路上の餌DOM再描画
    const renderMazeFeeds = () => {
        taskListMaze.innerHTML = '';
        sharedState.mazeFeeds.forEach(feed => {
            drawTaskToMaze(feed);
        });
    };
    
    // 締切ステータス判定
    const getDeadlineStatus = (deadlineString) => {
        if (!deadlineString) return 'none';
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const deadline = new Date(deadlineString + 'T00:00:00+09:00');
        if (isNaN(deadline.getTime())) return 'none';
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0 || diffDays === 1) return 'danger';
        if (diffDays === 2) return 'near';
        if (diffDays < 0) return 'overdue';
        return 'none';
    };
    
    // ToDoリストにタスクを描画
    const drawTaskToList = (task) => {
        const li = document.createElement('li');
        li.dataset.id = task.id;
        const status = getDeadlineStatus(task.deadline);
        if (status === 'danger' || status === 'overdue') {
            li.classList.add('deadline-danger');
        } else if (status === 'near') {
            li.classList.add('deadline-near');
        }
        const taskInfo = document.createElement('div');
        taskInfo.classList.add('task-info');
        const taskName = document.createElement('span');
        taskName.classList.add('task-name');
        taskName.textContent = task.text;
        taskInfo.appendChild(taskName);
        if (task.deadline) {
            const deadlineText = document.createElement('span');
            deadlineText.classList.add('task-deadline-text');
            deadlineText.textContent = `締切: ${task.deadline}`;
            taskInfo.appendChild(deadlineText);
        }
        li.appendChild(taskInfo);
        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add('task-actions');
        const completeBtn = document.createElement('button');
        completeBtn.classList.add('complete-btn');
        completeBtn.textContent = '完了 (餌にする)';
        completeBtn.addEventListener('click', () => {
            completeTask(task.id);
        });
        actionsContainer.appendChild(completeBtn);
        const menuContainer = document.createElement('div');
        menuContainer.classList.add('menu-container');
        const menuBtn = document.createElement('button');
        menuBtn.classList.add('menu-btn');
        menuBtn.innerHTML = '&#8942;'; 
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            document.querySelectorAll('.menu-dropdown.show').forEach(menu => {
                if (menu !== dropdownMenu) {
                    menu.classList.remove('show');
                }
            });
            dropdownMenu.classList.toggle('show');
        });
        menuContainer.appendChild(menuBtn);
        const dropdownMenu = document.createElement('div');
        dropdownMenu.classList.add('menu-dropdown');
        const editNameBtn = document.createElement('button');
        editNameBtn.classList.add('menu-dropdown-btn');
        editNameBtn.textContent = '名称変更';
        editNameBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleChangeName(task.id); 
            dropdownMenu.classList.remove('show'); 
        });
        dropdownMenu.appendChild(editNameBtn);
        const editDeadlineBtn = document.createElement('button');
        editDeadlineBtn.classList.add('menu-dropdown-btn');
        editDeadlineBtn.textContent = '期限変更';
        editDeadlineBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleChangeDeadline(task.id);
            dropdownMenu.classList.remove('show'); 
        });
        dropdownMenu.appendChild(editDeadlineBtn);
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('menu-dropdown-btn', 'delete-btn');
        deleteBtn.textContent = '削除';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleDeleteTask(task.id); 
        });
        dropdownMenu.appendChild(deleteBtn);
        menuContainer.appendChild(dropdownMenu);
        actionsContainer.appendChild(menuContainer);
        li.appendChild(actionsContainer);
        todoListUl.appendChild(li);
    };
    
    // 迷路にタスク（餌）を描画
    const drawTaskToMaze = (feed) => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task-item');
        taskElement.style.gridRowStart = feed.row + 1;
        taskElement.style.gridColumnStart = feed.col + 1;
        taskElement.dataset.row = feed.row;
        taskElement.dataset.col = feed.col;
        taskElement.dataset.id = feed.id;
        if (feed.text) {
            const taskTextElement = document.createElement('div');
            taskTextElement.classList.add('task-text');
            const taskNameSpan = document.createElement('span');
            taskNameSpan.textContent = `完了済: ${feed.text}`;
            taskTextElement.appendChild(taskNameSpan);
            taskElement.appendChild(taskTextElement);
        }
        taskListMaze.appendChild(taskElement);
    };

    // --- タスク操作 ---

    /**
     * タスク完了（餌化）処理
     */
    const completeTask = (taskId) => {
        if (sharedState.availableDots.length === 0) {
            alert('迷路上に餌を置くスペースがありません！');
            return;
        }
        const taskIndex = sharedState.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return; 

        const taskToComplete = sharedState.tasks[taskIndex];
        const position = sharedState.availableDots.shift(); 
        
        const newFeed = {
            id: taskToComplete.id,
            text: taskToComplete.text, 
            row: position.row,
            col: position.col
        };
        sharedState.mazeFeeds.push(newFeed);
        drawTaskToMaze(newFeed); 
        
        sharedState.tasks.splice(taskIndex, 1); 
        
        const liToRemove = todoListUl.querySelector(`li[data-id="${taskId}"]`);
        if (liToRemove) {
            liToRemove.remove();
        }

        // 完了コールバック呼び出し (app.js)
        if (onTaskCompleted) onTaskCompleted(taskId);
    };

    // タスク名変更
    const handleChangeName = (taskId) => {
        const task = sharedState.tasks.find(t => t.id === taskId);
        if (!task) return;
        const newName = prompt("新しいタスク名を入力してください。", task.text);
        if (newName && newName.trim() !== '') {
            task.text = newName.trim();
            if (onDataChange) onDataChange();
            renderTaskList(); 
        } else if (newName !== null) {
             alert("タスク名は空にできません。");
        }
    };
    
    // 期限変更
    const handleChangeDeadline = (taskId) => {
        const task = sharedState.tasks.find(t => t.id === taskId);
        if (!task) return;
        const currentDeadline = task.deadline || ''; 
        const newDeadline = prompt("新しい締切日を入力してください (YYYY-MM-DD)\n空欄にすると締切なしになります。", currentDeadline);
        if (newDeadline === null) return;
        if (newDeadline === '' || /^\d{4}-\d{2}-\d{2}$/.test(newDeadline)) {
            task.deadline = newDeadline === '' ? null : newDeadline; 
            sortTasks();
            if (onDataChange) onDataChange();
            renderTaskList();
        } else {
            alert("無効な日付形式です。YYYY-MM-DD で入力してください。");
        }
    };

    /**
     * タスク手動削除処理 (餌にしない)
     */
    const handleDeleteTask = (taskId) => {
        if (!confirm("このタスクを完全に削除しますか？ (餌になりません)")) {
            return;
        }
        
        // 状態(tasks)から削除
        sharedState.tasks = sharedState.tasks.filter(t => t.id !== taskId);
        
        // app.js にゴースト削除と保存を依頼
        if (onTaskDeleted) onTaskDeleted(taskId); 
        
        // DOM(リスト)から削除
        const liToRemove = todoListUl.querySelector(`li[data-id="${taskId}"]`);
        if (liToRemove) {
            liToRemove.remove();
        }
    };


    // タスク追加フォーム
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        const deadline = taskDeadlineInput.value; 
        if (text === '') return;
        const newTask = { id: Date.now(), text: text, deadline: deadline };
        if (onTaskAdded) {
            if (onTaskAdded(newTask) === false) { 
                return; 
            }
        }
        sharedState.tasks.push(newTask);
        sortTasks();
        if (onDataChange) onDataChange();
        renderTaskList();
        taskInput.value = '';
        taskDeadlineInput.value = ''; 
    });

    // --- 外部公開用 (pacman.js / app.js から利用) ---
    window.taskLogic = {
        // パックマンが餌（タスク）を食べたかチェック
        checkTaskCollision: (row, col) => {
            const taskToEat = taskListMaze.querySelector(`.task-item[data-row="${row}"][data-col="${col}"]`);
            if (taskToEat) {
                const taskId = Number(taskToEat.dataset.id);
                taskToEat.remove();
                sharedState.availableDots.push({ row: row, col: col });
                sharedState.availableDots.sort(() => Math.random() - 0.5);
                sharedState.mazeFeeds = sharedState.mazeFeeds.filter(feed => feed.id !== taskId);
                return taskId;
            }
            return null;
        },
        // 全描画（ロード時などに使用）
        renderAll: () => {
            renderMazeFeeds();
            sortTasks();
            renderTaskList();
        }
    };
} 

// メニュー外クリックでドロップダウンを閉じる
window.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-container')) {
        document.querySelectorAll('.menu-dropdown.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});