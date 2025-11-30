const board = document.getElementById('board');
const cells = document.querySelectorAll('[data-cell]');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const difficultySelect = document.getElementById('difficulty');
const chatBtn = document.getElementById('chatBtn');
const chatModal = document.getElementById('chatModal');
const closeChat = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendMessage = document.getElementById('sendMessage');

let currentPlayer = 'X';
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', ''];
let difficulty = 'hard';

// Performance optimizations
const memo = new Map();
let animationFrameId = null;

// Use requestAnimationFrame for smooth animations
function scheduleAnimationFrame(callback) {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = window.requestAnimationFrame(callback);
}

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function handleCellClick(event) {
    const cell = event.target;
    const cellIndex = Array.from(cells).indexOf(cell);

    if (gameState[cellIndex] !== '' || !gameActive || currentPlayer === 'O') {
        return;
    }

    makeMove(cellIndex, 'X');
    if (gameActive) {
        setTimeout(() => aiMove(), 500);
    }
}

function makeMove(index, player) {
    gameState[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());
    cells[index].classList.add('filled');

    // Check for game end conditions
    if (checkWin(player)) {
        statusText.textContent = player === 'X' ? '🎉 Вы победили!' : '🤖 ИИ победил!';
        gameActive = false;
        return;
    }

    if (checkTie()) {
        statusText.textContent = '🤝 Ничья!';
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

    if (currentPlayer === 'X') {
        statusText.textContent = 'Ваш ход (X)';
    } else {
        statusText.textContent = '🤔 ИИ думает...';
    }
}

function checkWin(player) {
    return winningConditions.some(condition => {
        return condition.every(index => gameState[index] === player);
    });
}

function checkTie() {
    return gameState.every(cell => cell !== '');
}

function aiMove() {
    let move;
    switch (difficulty) {
        case 'easy':
            move = getRandomMove();
            break;
        case 'medium':
            move = getMediumMove();
            break;
        case 'hard':
            move = getBestMove();
            break;
    }
    makeMove(move, 'O');
}

function getRandomMove() {
    const availableMoves = [];
    for (let i = 0; i < 9; i++) {
        if (gameState[i] === '') {
            availableMoves.push(i);
        }
    }
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function getMediumMove() {
    // 70% chance of optimal move, 30% chance of random move
    if (Math.random() < 0.7) {
        return getBestMove();
    } else {
        return getRandomMove();
    }
}

function getBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
        if (gameState[i] === '') {
            gameState[i] = 'O';
            let score = minimax(gameState, 0, false);
            gameState[i] = '';
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    // Terminal states - check the board parameter, not global gameState
    if (checkWinOnBoard(board, 'O')) {
        return 10 - depth;
    }
    if (checkWinOnBoard(board, 'X')) {
        return depth - 10;
    }
    if (checkTieOnBoard(board)) {
        return 0;
    }

    // Limit depth for performance (max 3 moves ahead)
    if (depth >= 3) {
        return 0;
    }

    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = isMaximizing ? 'O' : 'X';
            const score = minimax(board, depth + 1, !isMaximizing);
            board[i] = '';

            if (isMaximizing) {
                bestScore = Math.max(score, bestScore);
            } else {
                bestScore = Math.min(score, bestScore);
            }
        }
    }

    return bestScore;
}

function checkWinOnBoard(board, player) {
    return winningConditions.some(condition => {
        return condition.every(index => board[index] === player);
    });
}

function checkTieOnBoard(board) {
    return board.every(cell => cell !== '');
}

function resetGame() {
    currentPlayer = 'X';
    gameActive = true;
    gameState = ['', '', '', '', '', '', '', '', ''];
    statusText.textContent = 'Ваш ход (X)';

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'filled');
    });
}

function handleDifficultyChange() {
    difficulty = difficultySelect.value;
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick, { passive: true }));
resetBtn.addEventListener('click', resetGame, { passive: true });
difficultySelect.addEventListener('change', handleDifficultyChange, { passive: true });

// Performance: Pre-calculate winning conditions for faster checks
const winningPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
];

// Optimize win checking with pre-calculated patterns
function checkWinOnBoard(board, player) {
    return winningPatterns.some(pattern => {
        return pattern.every(index => board[index] === player);
    });
}

function checkTieOnBoard(board) {
    return board.every(cell => cell !== '');
}

// Memory management: Clear unused references
function cleanup() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// Chat functionality
function openChat() {
    chatModal.classList.add('show');
    chatInput.focus();
}

function closeChatModal() {
    chatModal.classList.remove('show');
}

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;

    messageDiv.innerHTML = `
        <div class="message-avatar">${isUser ? '👤' : '🤖'}</div>
        <div class="message-content">
            <p>${content}</p>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getAIResponse(userMessage) {
    const message = userMessage.toLowerCase();

    // Game-related responses
    if (message.includes('сложност') || message.includes('уров') || message.includes('difficult')) {
        return 'У игры есть три уровня сложности: Легкий (ИИ делает случайные ходы), Средний (ИИ иногда ошибается) и Сложный (ИИ играет оптимально и не проигрывает).';
    }

    if (message.includes('правил') || message.includes('как игра') || message.includes('rules')) {
        return 'Правила простые: вы играете крестиками (X), ИИ - ноликами (O). Цель - собрать три символа в ряд по горизонтали, вертикали или диагонали. ИИ всегда ходит вторым!';
    }

    if (message.includes('побед') || message.includes('выигра') || message.includes('win')) {
        return 'Чтобы победить, нужно собрать три крестика в ряд. ИИ на сложном уровне играет идеально, так что победить можно только на легком или среднем уровне сложности!';
    }

    if (message.includes('ничь') || message.includes('tie') || message.includes('draw')) {
        return 'Ничья происходит, когда все клетки заполнены, но никто не собрал три символа в ряд. Это возможно на любом уровне сложности.';
    }

    if (message.includes('совет') || message.includes('tip') || message.includes('помощ')) {
        return 'Совет: старайтесь занять центр и углы доски. Не давайте ИИ собрать два символа в ряд без блокировки!';
    }

    if (message.includes('привет') || message.includes('hello') || message.includes('здравствуй')) {
        return 'Привет! Я ИИ-помощник игры в крестики-нолики. Могу ответить на вопросы о правилах, стратегии и особенностях игры. Что вас интересует?';
    }

    if (message.includes('спасибо') || message.includes('thank')) {
        return 'Пожалуйста! Если есть еще вопросы об игре, спрашивайте. Удачи в игре! 🎮';
    }

    // Default responses
    const defaultResponses = [
        'Интересный вопрос! Могу рассказать подробнее о правилах игры.',
        'Я здесь, чтобы помочь с игрой в крестики-нолики. Что вас интересует?',
        'Попробуйте сыграть несколько партий на разных уровнях сложности!',
        'Крестики-нолики - это классическая игра, требующая стратегии и внимания.'
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

function handleSendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    chatInput.value = '';

    // Simulate AI thinking delay
    setTimeout(() => {
        const response = getAIResponse(message);
        addMessage(response, false);
    }, 500 + Math.random() * 1000);
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        handleSendMessage();
    }
}

// Chat event listeners
chatBtn.addEventListener('click', openChat, { passive: true });
closeChat.addEventListener('click', closeChatModal, { passive: true });
sendMessage.addEventListener('click', handleSendMessage, { passive: true });
chatInput.addEventListener('keypress', handleChatKeyPress, { passive: true });

// Close chat when clicking outside
chatModal.addEventListener('click', (event) => {
    if (event.target === chatModal) {
        closeChatModal();
    }
}, { passive: true });

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup, { passive: true });