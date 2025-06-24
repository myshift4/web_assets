document.addEventListener('DOMContentLoaded', () => {
    // 游戏常量
    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 30;
    const COLORS = [
        'cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'
    ];
    
    // 方块形状定义
    const SHAPES = [
        [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
        [[1, 0, 0], [1, 1, 1], [0, 0, 0]],                         // J
        [[0, 0, 1], [1, 1, 1], [0, 0, 0]],                         // L
        [[1, 1], [1, 1]],                                          // O
        [[0, 1, 1], [1, 1, 0], [0, 0, 0]],                         // S
        [[0, 1, 0], [1, 1, 1], [0, 0, 0]],                         // T
        [[1, 1, 0], [0, 1, 1], [0, 0, 0]]                          // Z
    ];
    
    // 游戏状态
    let canvas = document.getElementById('tetris');
    let ctx = canvas.getContext('2d');
    let nextCanvas = document.getElementById('next-piece');
    let nextCtx = nextCanvas.getContext('2d');
    let scoreElement = document.getElementById('score');
    let levelElement = document.getElementById('level');
    let linesElement = document.getElementById('lines');
    
    let score = 0;
    let level = 1;
    let lines = 0;
    let gameOver = false;
    let isPaused = false;
    let dropCounter = 0;
    let dropInterval = 1000; // 初始下落速度 (毫秒)
    let lastTime = 0;
    
    // 游戏板
    const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    
    // 当前方块
    let piece = {
        pos: { x: 0, y: 0 },
        shape: null,
        color: null
    };
    
    // 下一个方块
    let nextPiece = {
        shape: null,
        color: null
    };
    
    // 粒子效果系统
    let particles = [];
    
    // 粒子类
    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.size = Math.random() * 6 + 2;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * -15 - 5; // 向上喷射
            this.gravity = 0.2;
            this.life = 100;
            this.decay = Math.random() * 0.5 + 0.5;
        }
        
        update() {
            this.speedY += this.gravity;
            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= this.decay;
        }
        
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.life / 100;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.size, this.size);
            ctx.restore();
        }
    }
    
    // 初始化游戏
    function init() {
        resetGame();
        generateNextPiece();
        spawnPiece();
        
        // 事件监听
        document.addEventListener('keydown', handleKeyPress);
        document.getElementById('start-btn').addEventListener('click', startGame);
        document.getElementById('pause-btn').addEventListener('click', togglePause);
        document.getElementById('reset-btn').addEventListener('click', resetGame);
    }
    
    // 重置游戏
    function resetGame() {
        // 清空游戏板
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                board[y][x] = 0;
            }
        }
        
        // 重置分数和等级
        score = 0;
        level = 1;
        lines = 0;
        dropInterval = 1000;
        gameOver = false;
        isPaused = false;
        particles = [];
        
        // 更新UI
        updateScore();
        
        // 生成新方块
        generateNextPiece();
        spawnPiece();
        
        // 重绘
        draw();
        drawNext();
    }
    
    // 开始游戏
    function startGame() {
        if (gameOver) {
            resetGame();
        }
        isPaused = false;
        lastTime = 0;
        requestAnimationFrame(gameLoop);
    }
    
    // 暂停/继续游戏
    function togglePause() {
        if (gameOver) return;
        isPaused = !isPaused;
        if (!isPaused) {
            lastTime = 0;
            requestAnimationFrame(gameLoop);
        }
    }
    
    // 游戏主循环
    function gameLoop(time = 0) {
        if (isPaused || gameOver) return;
        
        const deltaTime = time - lastTime;
        lastTime = time;
        
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            moveDown();
            dropCounter = 0;
        }
        
        // 更新粒子
        updateParticles();
        
        draw();
        requestAnimationFrame(gameLoop);
    }
    
    // 更新粒子系统
    function updateParticles() {
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
                i--;
            }
        }
    }
    
    // 生成下一个方块
    function generateNextPiece() {
        const shapeId = Math.floor(Math.random() * SHAPES.length);
        nextPiece.shape = SHAPES[shapeId];
        nextPiece.color = COLORS[shapeId];
    }
    
    // 生成当前方块
    function spawnPiece() {
        piece.shape = nextPiece.shape;
        piece.color = nextPiece.color;
        piece.pos.x = Math.floor(COLS / 2) - Math.floor(piece.shape[0].length / 2);
        piece.pos.y = 0;
        
        generateNextPiece();
        drawNext();
        
        // 检查游戏结束
        if (isCollision()) {
            gameOver = true;
            alert('游戏结束! 你的分数: ' + score);
        }
    }
    
    // 绘制游戏板
    function draw() {
        // 清空画布
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制已固定的方块
        drawMatrix(board, { x: 0, y: 0 });
        
        // 绘制当前方块
        drawMatrix(piece.shape, piece.pos, piece.color);
        
        // 绘制粒子
        drawParticles();
        
        // 绘制网格线
        drawGrid();
    }
    
    // 绘制粒子
    function drawParticles() {
        particles.forEach(particle => {
            particle.draw(ctx);
        });
    }
    
    // 绘制下一个方块预览
    function drawNext() {
        // 清空画布
        nextCtx.fillStyle = '#111';
        nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
        
        // 计算居中位置
        const offsetX = (nextCanvas.width / BLOCK_SIZE - nextPiece.shape[0].length) / 2;
        const offsetY = (nextCanvas.height / BLOCK_SIZE - nextPiece.shape.length) / 2;
        
        // 绘制下一个方块
        drawMatrix(nextPiece.shape, { x: offsetX, y: offsetY }, nextPiece.color, nextCtx);
    }
    
    // 绘制网格线
    function drawGrid() {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        
        // 垂直线
        for (let i = 0; i <= COLS; i++) {
            ctx.beginPath();
            ctx.moveTo(i * BLOCK_SIZE, 0);
            ctx.lineTo(i * BLOCK_SIZE, ROWS * BLOCK_SIZE);
            ctx.stroke();
        }
        
        // 水平线
        for (let i = 0; i <= ROWS; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * BLOCK_SIZE);
            ctx.lineTo(COLS * BLOCK_SIZE, i * BLOCK_SIZE);
            ctx.stroke();
        }
    }
    
    // 绘制矩阵
    function drawMatrix(matrix, offset, color = null, context = ctx) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const fillColor = color || COLORS[value - 1];
                    
                    // 绘制方块
                    context.fillStyle = fillColor;
                    context.fillRect(
                        (x + offset.x) * BLOCK_SIZE,
                        (y + offset.y) * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );
                    
                    // 绘制方块边框
                    context.strokeStyle = '#000';
                    context.lineWidth = 2;
                    context.strokeRect(
                        (x + offset.x) * BLOCK_SIZE,
                        (y + offset.y) * BLOCK_SIZE,
                        BLOCK_SIZE,
                        BLOCK_SIZE
                    );
                }
            });
        });
    }
    
    // 检查碰撞
    function isCollision(pos = piece.pos, shape = piece.shape) {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] !== 0) {
                    const boardX = pos.x + x;
                    const boardY = pos.y + y;
                    
                    // 检查边界
                    if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
                        return true;
                    }
                    
                    // 检查底部
                    if (boardY < 0) {
                        continue;
                    }
                    
                    // 检查已有方块
                    if (board[boardY] && board[boardY][boardX] !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    // 合并方块到游戏板
    function merge() {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const boardY = piece.pos.y + y;
                    const boardX = piece.pos.x + x;
                    
                    if (boardY >= 0) { // 确保不会在顶部之外绘制
                        board[boardY][boardX] = COLORS.indexOf(piece.color) + 1;
                    }
                }
            });
        });
    }
    
    // 旋转方块
    function rotate() {
        if (isPaused || gameOver) return;
        
        const originalShape = piece.shape;
        const rows = piece.shape.length;
        const cols = piece.shape[0].length;
        
        // 创建新的旋转后的形状
        const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                rotated[x][rows - 1 - y] = piece.shape[y][x];
            }
        }
        
        // 检查旋转后是否碰撞
        piece.shape = rotated;
        if (isCollision()) {
            // 如果碰撞，尝试左右移动
            const originalX = piece.pos.x;
            let offset = 1;
            
            while (offset <= 2) { // 尝试左右各移动2格
                piece.pos.x += offset;
                if (!isCollision()) break;
                
                piece.pos.x = originalX - offset;
                if (!isCollision()) break;
                
                piece.pos.x = originalX;
                offset++;
            }
            
            // 如果还是碰撞，恢复原状
            if (isCollision()) {
                piece.shape = originalShape;
            }
        }
        
        draw();
    }
    
    // 移动方块
    function movePiece(direction) {
        if (isPaused || gameOver) return;
        
        piece.pos.x += direction;
        if (isCollision()) {
            piece.pos.x -= direction;
        }
        draw();
    }
    
    // 快速下落
    function hardDrop() {
        if (isPaused || gameOver) return;
        
        while (!isCollision()) {
            piece.pos.y++;
        }
        piece.pos.y--;
        merge();
        clearLines();
        spawnPiece();
        dropCounter = 0;
    }
    
    // 下落一格
    function moveDown() {
        if (isPaused || gameOver) return;
        
        piece.pos.y++;
        if (isCollision()) {
            piece.pos.y--;
            merge();
            clearLines();
            spawnPiece();
        }
        dropCounter = 0;
    }
    
    // 创建粉碎效果
    function createExplosion(row) {
        for (let x = 0; x < COLS; x++) {
            if (board[row][x] !== 0) {
                const color = COLORS[board[row][x] - 1];
                // 为每个方块创建多个粒子
                for (let i = 0; i < 10; i++) {
                    particles.push(new Particle(
                        x * BLOCK_SIZE + BLOCK_SIZE / 2,
                        row * BLOCK_SIZE + BLOCK_SIZE / 2,
                        color
                    ));
                }
            }
        }
    }
    
    // 清除已填满的行
    function clearLines() {
        let linesCleared = 0;
        let clearedRows = [];
        
        outer: for (let y = ROWS - 1; y >= 0; y--) {
            for (let x = 0; x < COLS; x++) {
                if (board[y][x] === 0) {
                    continue outer;
                }
            }
            
            // 记录被清除的行
            clearedRows.push(y);
            
            // 移除该行
            const row = board.splice(y, 1)[0].fill(0);
            board.unshift(row);
            y++; // 检查同一行（现在是新行）
            linesCleared++;
        }
        
        if (linesCleared > 0) {
            // 为每个被清除的行创建粉碎效果
            clearedRows.forEach(row => {
                createExplosion(row);
            });
            
            // 更新分数
            updateScore(linesCleared);
        }
    }
    
    // 更新分数
    function updateScore(linesCleared = 0) {
        // 计分规则
        const linePoints = [0, 40, 100, 300, 1200]; // 0, 1, 2, 3, 4行
        
        if (linesCleared > 0) {
            score += linePoints[linesCleared] * level;
            lines += linesCleared;
            
            // 每消除10行升一级
            const newLevel = Math.floor(lines / 10) + 1;
            if (newLevel > level) {
                level = newLevel;
                // 加快下落速度 (最多到100ms)
                dropInterval = Math.max(100, 1000 - (level - 1) * 100);
            }
        }
        
        // 更新UI
        scoreElement.textContent = score;
        levelElement.textContent = level;
        linesElement.textContent = lines;

        //刷新排名
        document.getElementById('score').textContent = score;
        updateRankings(score);
    }
    
    // 键盘控制
    function handleKeyPress(e) {
        if (gameOver) return;
        
        switch (e.keyCode) {
            case 37: // 左箭头
                movePiece(-1);
                break;
            case 39: // 右箭头
                movePiece(1);
                break;
            case 40: // 下箭头
                moveDown();
                break;
            case 38: // 上箭头
                rotate();
                break;
            case 32: // 空格
                hardDrop();
                break;
            case 80: // P键
                togglePause();
                break;
        }
    }
    
    // 初始化游戏
    init();
});

// 在游戏初始化时调用
document.addEventListener('DOMContentLoaded', () => {
    updateRankings();
    
    // 监听分数变化来更新排名
    // 这里需要与你的游戏分数更新逻辑结合
    // 例如在更新分数时调用 updateRankings(score)
});


// 模拟排名数据
const generateMockRankings = () => {
    const rankings = [];
    for (let i = 1; i <= 100; i++) {
        rankings.push({
            rank: i,
            name: `玩家${i}`,
            score: Math.floor(Math.random() * 100000)
        });
    }
    return rankings;
};

// 更新排名显示
const updateRankings = (currentScore = 0) => {
    const rankings = generateMockRankings();
    const rankingList = document.getElementById('ranking-list');
    const currentRanking = document.getElementById('current-ranking');
    
    // 清空现有排名
    while (rankingList.children.length > 1) {
        rankingList.removeChild(rankingList.lastChild);
    }
    
    // 更新当前玩家信息
    const currentPlayer = currentRanking.querySelector('.ranking-item');
    currentPlayer.querySelector('.score').textContent = currentScore;
    
    // 计算当前玩家排名
    let currentRank = rankings.findIndex(r => r.score <= currentScore) + 1;
    if (currentRank === 0 && currentScore > 0) currentRank = 1;
    currentPlayer.querySelector('.rank').textContent = currentRank > 0 ? currentRank : '-';
    
    // 添加排名条目
    rankings.forEach(player => {
        const item = document.createElement('div');
        item.className = 'ranking-item';
        item.innerHTML = `
            <div class="rank">${player.rank}</div>
            <div class="name">${player.name}</div>
            <div class="score">${player.score}</div>
        `;
        rankingList.appendChild(item);
    });
    
    // 添加搜索功能
    document.getElementById('ranking-search').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const items = rankingList.querySelectorAll('.ranking-item');
        
        items.forEach(item => {
            if (item.classList.contains('ranking-header')) return;
            
            const name = item.querySelector('.name').textContent.toLowerCase();
            if (name.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
};
