document.addEventListener('DOMContentLoaded', () => {
    

    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskDeadlineInput = document.getElementById('task-deadline');
    const taskList = document.getElementById('task-list'); 
    const mazeContainer = document.getElementById('pacman-maze');
    const pacDoneIcon = document.getElementById('pac-done-icon'); 

    // 迷路レイアウト定義 (16行 x 31列) ---
    const mazeLayout = [
    //   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1
        [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1], // 2
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], // 3
        [1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1], // 4
        [1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1], // 5
        [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1], // 6
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], // 7
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], // 8
        [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1], // 9
        [1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1], // 10
        [1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1], // 11
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], // 12
        [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1], // 13 
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 14
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 15
    ];
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