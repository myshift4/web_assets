// 游戏配置
const config = {
    canvasSize: 600,
    gridSize: 20,
    initialSpeed: 500,   // 初始速度500ms(0.5秒)
    speedChange: 100,    // 每次加速减少100ms
    minSpeed: 100,       // 最低速度100ms(0.1秒)
    colors: [
        '#FF5733', '#33FF57', '#3357FF', '#F3FF33', 
        '#FF33F3', '#33FFF3', '#FF8C33', '#8C33FF'
    ],
    iconCount: 10, // 图标总数
    currentIconSet: [] // 当前使用的图标集合
};


// 游戏状态
const gameState = {
    snake: [],
    direction: 'right',
    nextDirection: 'right',
    food: null,
    foodColor: '',
    score: 0,
    highScore: 0,
    gameInterval: null,
    isPaused: false,
    isGameOver: false,
    totalFood: 0,  // 新增：总食物计数
    currentSpeed: config.initialSpeed,
    playerName: 'Player' + Math.floor(Math.random() * 1000),
    selectedIconIndex: 0, // 当前选中的图标索引
    availableIcons: Array.from({length: config.iconCount}, (_, i) => i + 1) // 1-100
};

// 历史得分数据
let highScores = JSON.parse(localStorage.getItem('snakeHighScores')) || [];

// DOM 元素
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const currentScoreEl = document.getElementById('current-score');
const playerHighScoreEl = document.getElementById('player-high-score');
const playerRankEl = document.getElementById('player-rank');
const highScoresEl = document.getElementById('high-scores');
const foodCountsEl = document.getElementById('food-counts');

// 开始游戏
function startGame() {
    if (gameState.gameInterval) {
        clearInterval(gameState.gameInterval);
    }
    
    initGame();
    
    gameState.gameInterval = setInterval(gameLoop, gameState.currentSpeed);
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    gameState.isPaused = false;
    pauseBtn.textContent = '暂停';
}

// 初始化游戏
function initGame() {
    const centerX = Math.floor((config.canvasSize / config.gridSize) / 2);
    const centerY = Math.floor((config.canvasSize / config.gridSize) / 2);
    gameState.snake = [
        {x: centerX, y: centerY},
        {x: centerX - 1, y: centerY}
    ];
    gameState.direction = 'right';
    gameState.nextDirection = 'right';
    gameState.score = 0;
    gameState.isGameOver = false;
    gameState.totalFood = 0;  // 重置食物计数
    gameState.currentSpeed = config.initialSpeed;
    
    currentScoreEl.textContent = '0';
    document.getElementById('total-food').textContent = '0';
    
    generateFood();
    draw();
}


// 游戏主循环
function gameLoop() {
    if (gameState.isPaused || gameState.isGameOver) return;
    
    moveSnake();
    
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    checkFood();
    draw();
}


// // 新增图标加载函数
// function loadIcons() {
//     // 加载所有图标到选择器
//     const iconContainer = document.getElementById('icon-options');
//     gameState.availableIcons.forEach(iconNum => {
//         const img = document.createElement('img');
//         img.src = `icons/icon${iconNum}.png`;
//         img.className = 'icon-option';
//         img.dataset.index = iconNum - 1;
//         img.addEventListener('click', () => selectIcon(iconNum - 1));
//         iconContainer.appendChild(img);
//     });
    
//     // 随机图标按钮
//     document.getElementById('random-icon-btn').addEventListener('click', () => {
//         const randomIndex = Math.floor(Math.random() * gameState.availableIcons.length);
//         selectIcon(randomIndex);
//     });
    
//     // 默认选择第一个图标
//     selectIcon(0);
// }
// function selectIcon(index) {
//     // 移除之前选中的样式
//     const prevSelected = document.querySelector('.icon-option.selected');
//     if (prevSelected) prevSelected.classList.remove('selected');
    
//     // 添加新选中样式
//     const icons = document.querySelectorAll('.icon-option');
//     icons[index].classList.add('selected');
    
//     gameState.selectedIconIndex = index;
// }


// 移动蛇
function moveSnake() {
    gameState.direction = gameState.nextDirection;
    
    const head = {...gameState.snake[0]};
    
    switch (gameState.direction) {
        case 'up': head.y -= 1; break;
        case 'down': head.y += 1; break;
        case 'left': head.x -= 1; break;
        case 'right': head.x += 1; break;
    }
    
    gameState.snake.unshift(head);
    
    if (!gameState.food || head.x !== gameState.food.x || head.y !== gameState.food.y) {
        gameState.snake.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = gameState.snake[0];
    const gridCount = config.canvasSize / config.gridSize;
    
    // 墙壁碰撞
    if (head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount) {
        return true;
    }
    
    // 自身碰撞
    for (let i = 1; i < gameState.snake.length; i++) {
        if (head.x === gameState.snake[i].x && head.y === gameState.snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 检查是否吃到食物
function checkFood() {
    const head = gameState.snake[0];
    
    if (gameState.food && head.x === gameState.food.x && head.y === gameState.food.y) {
        gameState.score += 10;
        gameState.totalFood += 1;  // 增加食物计数
        
        currentScoreEl.textContent = gameState.score;
        document.getElementById('total-food').textContent = gameState.totalFood;
        
        // 加速逻辑
        if (gameState.snake.length >= 6 && gameState.totalFood % 3 === 0) {
            if (gameState.currentSpeed > config.minSpeed) {
                gameState.currentSpeed -= config.speedChange;
                clearInterval(gameState.gameInterval);
                gameState.gameInterval = setInterval(gameLoop, gameState.currentSpeed);
            }
        }
        
        generateFood();
    }
}

// 生成食物
function generateFood() {
    const gridCount = config.canvasSize / config.gridSize;
    let food, isValidPosition;
    
    do {
        food = {
            x: Math.floor(Math.random() * gridCount),
            y: Math.floor(Math.random() * gridCount)
        };
        
        isValidPosition = true;
        for (const segment of gameState.snake) {
            if (segment.x === food.x && segment.y === food.y) {
                isValidPosition = false;
                break;
            }
        }
    } while (!isValidPosition);
    
    gameState.food = food;
    // 随机选择一个图标
    gameState.foodIconIndex = Math.floor(Math.random() * gameState.availableIcons.length);
}

// 绘制游戏
function draw() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, config.canvasSize, config.canvasSize);
    
    // 绘制蛇
    for (let i = 0; i < gameState.snake.length; i++) {
        const segment = gameState.snake[i];
        const colorIndex = i === 0 ? 0 : (i % (config.colors.length - 1)) + 1;
        ctx.fillStyle = config.colors[colorIndex];
        ctx.fillRect(
            segment.x * config.gridSize, 
            segment.y * config.gridSize, 
            config.gridSize - 1, 
            config.gridSize - 1
        );
    }

    // 绘制食物（图标）
    if (gameState.food) {
        const img = new Image();
        img.src = `icons/icon${gameState.availableIcons[gameState.foodIconIndex]}.png`;
        ctx.drawImage(
            img,
            gameState.food.x * config.gridSize,
            gameState.food.y * config.gridSize,
            config.gridSize,
            config.gridSize
        );
    }
}

// 游戏结束
function gameOver() {
    clearInterval(gameState.gameInterval);
    gameState.isGameOver = true;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        playerHighScoreEl.textContent = gameState.highScore;
    }
    
    saveScore();
    alert(`游戏结束! 你的得分: ${gameState.score}`);
}

// 保存得分
function saveScore() {
    const existingPlayerIndex = highScores.findIndex(item => item.name === gameState.playerName);
    
    if (existingPlayerIndex !== -1) {
        if (gameState.score > highScores[existingPlayerIndex].score) {
            highScores[existingPlayerIndex].score = gameState.score;
        }
    } else {
        highScores.push({
            name: gameState.playerName,
            score: gameState.score
        });
    }
    
    highScores.sort((a, b) => b.score - a.score);
    
    if (highScores.length > 10) {
        highScores = highScores.slice(0, 10);
    }
    
    localStorage.setItem('snakeHighScores', JSON.stringify(highScores));
    updateHighScoresDisplay();
}

// 更新高分显示
function updateHighScoresDisplay() {
    highScoresEl.innerHTML = '';
    
    if (highScores.length === 0) {
        highScoresEl.innerHTML = '<div class="score-item">暂无记录</div>';
        return;
    }
    
    highScores.forEach((player, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        
        const rankSpan = document.createElement('span');
        rankSpan.className = 'rank';
        rankSpan.textContent = `${index + 1}. ${player.name}`;
        
        const scoreSpan = document.createElement('span');
        scoreSpan.textContent = player.score;
        
        scoreItem.appendChild(rankSpan);
        scoreItem.appendChild(scoreSpan);
        highScoresEl.appendChild(scoreItem);
        
        if (player.name === gameState.playerName) {
            playerRankEl.textContent = index + 1;
            playerHighScoreEl.textContent = player.score;
            gameState.highScore = player.score;
        }
    });
}

// 更新食物计数显示
function updateFoodCountsDisplay() {
    //foodCountsEl.innerHTML = '<h3>吃到的方块:</h3>';
    
    for (const color in gameState.foodCounts) {
        const countItem = document.createElement('div');
        countItem.className = 'score-item';
        
        const colorBox = document.createElement('span');
        colorBox.style.display = 'inline-block';
        colorBox.style.width = '15px';
        colorBox.style.height = '15px';
        colorBox.style.backgroundColor = color;
        colorBox.style.marginRight = '10px';
        colorBox.style.verticalAlign = 'middle';
        
        const countText = document.createElement('span');
        countText.textContent = gameState.foodCounts[color];
        
        countItem.appendChild(colorBox);
        countItem.appendChild(countText);
        foodCountsEl.appendChild(countItem);
    }
    
    // if (Object.keys(gameState.foodCounts).length === 0) {
    //     foodCountsEl.innerHTML += '<div>暂无</div>';
    // }
}

// 暂停/继续游戏
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    pauseBtn.textContent = gameState.isPaused ? '继续' : '暂停';
}

// 键盘控制
function handleKeyDown(e) {
    if (gameState.isGameOver || gameState.isPaused) return;
    
    // 方向键控制
    if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        
        const keyToDirection = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
        };
        
        const newDirection = keyToDirection[e.key];
        const oppositeDirections = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        
        if (newDirection && gameState.direction !== oppositeDirections[newDirection]) {
            gameState.nextDirection = newDirection;
        }
    }
    
    // 空格键暂停
    if (e.key === ' ') {
        e.preventDefault();
        togglePause();
    }
}
// 事件监听
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', startGame);
document.addEventListener('keydown', handleKeyDown);

// 初始化显示
updateHighScoresDisplay();
playerHighScoreEl.textContent = gameState.highScore;
updateFoodCountsDisplay();

// 在游戏初始化时加载图标
window.addEventListener('load', () => {
    loadIcons();
    updateHighScoresDisplay();
    playerHighScoreEl.textContent = gameState.highScore;
});