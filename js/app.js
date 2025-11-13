// DOM読み込み完了時に実行
document.addEventListener('DOMContentLoaded', () => {
    
    // DOM要素の取得
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskDeadlineInput = document.getElementById('task-deadline');
    const taskList = document.getElementById('task-list'); 
    const mazeContainer = document.getElementById('pacman-maze');

    // --- 迷路レイアウト定義 (14行 x 28列) ---
    // (image_d1e786.jpg をトレースした配列です)
    const mazeLayout = [
        //   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1], // 1
        [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1], // 2
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1],
        [1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1], // 3
        [1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 4
        [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 2, 2, 2, 2, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0], // 5
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 2, 0, 0, 2, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0], // 6
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1], // 7
        [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 8
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1], // 9
        [1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1], // 10
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1], // 11
        [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1], // 12
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 13
    ];

    /**
     * 二次元配列を基に迷路（壁）を動的に生成する
     */
    const createMaze = () => {
        mazeContainer.innerHTML = ''; 

        mazeLayout.forEach((rowArray, rowIndex) => {
            rowArray.forEach((cellValue, colIndex) => {
                
                // もしセルが 1 (壁) または 2 (巣の壁) なら
                if (cellValue === 1 || cellValue === 2) {
                    const wallElement = document.createElement('div');
                    wallElement.classList.add('maze-wall');
                    
                    // 巣の壁 (2) だったら特別なクラスを付与
                    if (cellValue === 2) {
                        wallElement.classList.add('ghost-nest-wall');
                    }
                    
                    wallElement.style.gridRowStart = rowIndex + 1;
                    wallElement.style.gridColumnStart = colIndex + 1;
                    
                    mazeContainer.appendChild(wallElement);
                }
            });
        });

        // HTMLに残した要素（Pac-Doneアイコンやタスクリスト）を再度追加
        if (document.getElementById('pac-done-icon')) {
             mazeContainer.appendChild(document.getElementById('pac-done-icon'));
        }
        mazeContainer.appendChild(taskList);
    };

    /**
     * タスク追加フォームの送信処理
     */
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const text = taskInput.value.trim();
        const deadline = taskDeadlineInput.value;

        if (text === '') return; 

        const taskElement = document.createElement('div');
        taskElement.classList.add('task-item');
        
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

    // --- 初期化 ---
    createMaze(); // 迷路を生成

});