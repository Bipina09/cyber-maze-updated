// Game State
const gameState = {
    isRunning: false,
    score: 0,
    health: 100,
    questionsAnswered: 0,
    currentQuestion: null,
    selectedOption: null
};

// Canvas and Context
let canvas, ctx;

// Player
const player = {
    x: 22,  // Better aligned with maze grid (centered in cell)
    y: 22,  // Better aligned with maze grid (centered in cell)
    width: 15,
    height: 15,
    speed: 3,
    color: '#00ff88'
};

// Maze dimensions
const MAZE_WIDTH = 800;
const MAZE_HEIGHT = 600;
const CELL_SIZE = 20;
const COLS = MAZE_WIDTH / CELL_SIZE;
const ROWS = MAZE_HEIGHT / CELL_SIZE;

// Maze array (0 = path, 1 = wall)
let maze = [];

// Solution path tracking
let solutionPath = [];

// Checkpoints where questions appear
let checkpoints = [];
let completedCheckpoints = new Set();

// Exit
let exit = { x: 750, y: 550, width: 30, height: 30 };

// Input handling - Simple & clean key handling
const keys = {};

document.addEventListener('keydown', (e) => {
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d"].includes(e.key)) {
        e.preventDefault();
    }
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d"].includes(e.key)) {
        e.preventDefault();
    }
    keys[e.key.toLowerCase()] = false;
});

// Cybersecurity Questions Database
const questionsDatabase = [
    {
        question: "You get a text message saying: 'Your bank account has been locked. Click here to verify your identity: bit.ly/xK9mQ'. What should you do?",
        options: [
            "Click the link quickly before your account gets deleted",
            "Reply to the text with your account number to verify",
            "Ignore the link and contact your bank directly using their official website or phone number",
            "Forward the message to your friends so they can check their accounts too"
        ],
        correct: 2,
        points: 20
    },
    {
        question: "You're signing up for a new app and it asks to 'Log in with Google' instead of creating a new account. A friend says this is dangerous. What's the real risk?",
        options: [
            "Google will steal all your data from the new app",
            "If your Google account is compromised, the attacker also gains access to every app linked to it",
            "There is no risk — it's always safer than creating a new password",
            "The app will be able to read all your Gmail emails automatically"
        ],
        correct: 1,
        points: 20
    },
    {
        question: "You're at a coffee shop and connect to 'CoffeeShop_Free_WiFi'. You notice there's also 'CoffeeShop_Guest' which the barista confirms is official. What could the first network be?",
        options: [
            "A backup network the shop set up for overflow traffic",
            "A rogue hotspot set up by an attacker to intercept your traffic",
            "A government-monitored network for public safety",
            "A faster premium network the shop forgot to password-protect"
        ],
        correct: 1,
        points: 20
    },
    {
        question: "Your friend emails you a Google Docs link to a shared project. When you click it, the page asks you to re-enter your Google username and password. What's likely happening?",
        options: [
            "Google requires re-authentication for shared documents",
            "Your session expired and this is a normal security measure",
            "This is likely a phishing page designed to steal your Google credentials",
            "Your friend's document has extra security enabled"
        ],
        correct: 2,
        points: 20
    },
    {
        question: "You download a free PDF converter from a website. After installing it, your browser homepage changes and new toolbars appear. What most likely happened?",
        options: [
            "The PDF converter updated your browser for better compatibility",
            "The installer bundled adware or a potentially unwanted program (PUP) with the software",
            "Your browser automatically customized itself to work with the new software",
            "This is normal behavior for all free software downloads"
        ],
        correct: 1,
        points: 20
    },
    {
        question: "You receive an urgent email from your 'boss' asking you to buy gift cards and send the codes immediately. The email address looks slightly off: boss.name@company-hr.com instead of boss.name@company.com. What is this?",
        options: [
            "A legitimate request — your boss probably just used a different email",
            "A social engineering attack using impersonation and urgency to trick you",
            "An automated email from the company's HR system",
            "A test email sent by your company's IT department"
        ],
        correct: 1,
        points: 20
    },
    {
        question: "You plug a USB drive you found in the parking lot into your computer to see who it belongs to. What's the worst that could happen?",
        options: [
            "Nothing — USB drives are just storage devices and can't run code",
            "The drive could auto-execute malware that installs a backdoor or ransomware on your system",
            "It will just show you the owner's files so you can return it",
            "Your antivirus will always catch anything harmful on the drive"
        ],
        correct: 1,
        points: 20
    },
    {
        question: "You've almost reached the exit! What's the flag format for this CTF?",
        options: [
            "FLAG{format}",
            "CTF{format}",
            "MAZE{format}",
            "WIN{format}"
        ],
        correct: 0,
        points: 20
    }
];

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    generateMaze();
    generateCheckpoints();
    
    gameState.isRunning = true;
    console.log('Game initialized. Running:', gameState.isRunning);
    gameLoop();
}

// Generate maze using recursive backtracking with path tracking
function generateMaze() {
    maze = Array(ROWS).fill(null).map(() => Array(COLS).fill(1));
    solutionPath = [];

    const carve = (x, y) => {
        maze[y][x] = 0;
        solutionPath.push({ x, y });

        const directions = [
            [0, -2], [2, 0], [0, 2], [-2, 0]
        ].sort(() => Math.random() - 0.5);

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx > 0 && nx < COLS - 1 && ny > 0 && ny < ROWS - 1 && maze[ny][nx] === 1) {
                // Carve passage
                maze[y + dy / 2][x + dx / 2] = 0;
                solutionPath.push({ x: x + dx / 2, y: y + dy / 2 });
                carve(nx, ny);
            }
        }
    };

    carve(1, 1);

    // Ensure starting area is clear
    maze[0][1] = 0;
    maze[1][0] = 0;
    maze[2][1] = 0;
    maze[1][2] = 0;

    // Create exit area and add to solution path
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            maze[ROWS - 2 - i][COLS - 2 - j] = 0;
            solutionPath.push({ x: COLS - 2 - j, y: ROWS - 2 - i });
        }
    }
}

// ============================================================
// LOOPHOLE FIX: guaranteed-checkpoint pathfinding
// ------------------------------------------------------------
// The old checkpoint placement picked points from the raw DFS
// carving order (solutionPath). That list includes every dead-end
// side-branch the maze generator explored while building the
// maze — not just the route a player actually has to walk to
// reach the exit. So a checkpoint could end up stuck in a branch
// the player never needed to enter, letting them reach the exit
// without hitting every question.
//
// The fix: find cells that are "mandatory" — cells where, if you
// wall them off, the exit becomes unreachable from the entrance.
// A checkpoint is only ever placed on a mandatory cell, so there
// is no possible route from start to exit that skips it, no
// matter how the maze is shaped.
// ============================================================

function cellKey(x, y) {
    return y * COLS + x;
}

// BFS over open maze cells. Returns the path (array of {x,y}) from
// start to target, or null if unreachable.
function bfsPath(start, target) {
    const visited = new Set([cellKey(start.x, start.y)]);
    const prev = new Map();
    const queue = [start];
    let head = 0;

    while (head < queue.length) {
        const cur = queue[head++];
        if (cur.x === target.x && cur.y === target.y) {
            const path = [cur];
            let key = cellKey(cur.x, cur.y);
            while (prev.has(key)) {
                const p = prev.get(key);
                path.push(p);
                key = cellKey(p.x, p.y);
            }
            return path.reverse();
        }

        const neighbors = [
            { x: cur.x + 1, y: cur.y }, { x: cur.x - 1, y: cur.y },
            { x: cur.x, y: cur.y + 1 }, { x: cur.x, y: cur.y - 1 }
        ];

        for (const n of neighbors) {
            if (n.x < 0 || n.x >= COLS || n.y < 0 || n.y >= ROWS) continue;
            if (maze[n.y][n.x] !== 0) continue;
            const key = cellKey(n.x, n.y);
            if (visited.has(key)) continue;
            visited.add(key);
            prev.set(key, cur);
            queue.push(n);
        }
    }
    return null;
}

// Quick reachability check (no path reconstruction needed)
function bfsReachable(start, target) {
    const visited = new Set([cellKey(start.x, start.y)]);
    const queue = [start];
    let head = 0;

    while (head < queue.length) {
        const cur = queue[head++];
        if (cur.x === target.x && cur.y === target.y) return true;

        const neighbors = [
            { x: cur.x + 1, y: cur.y }, { x: cur.x - 1, y: cur.y },
            { x: cur.x, y: cur.y + 1 }, { x: cur.x, y: cur.y - 1 }
        ];

        for (const n of neighbors) {
            if (n.x < 0 || n.x >= COLS || n.y < 0 || n.y >= ROWS) continue;
            if (maze[n.y][n.x] !== 0) continue;
            const key = cellKey(n.x, n.y);
            if (visited.has(key)) continue;
            visited.add(key);
            queue.push(n);
        }
    }
    return false;
}

// A cell is "mandatory" if temporarily walling it off disconnects
// the entrance from the exit — i.e. every possible route has to
// cross it.
function isMandatoryCell(cell, start, exitCell) {
    if ((cell.x === start.x && cell.y === start.y) ||
        (cell.x === exitCell.x && cell.y === exitCell.y)) {
        return false; // don't put a checkpoint exactly on start/exit
    }
    const original = maze[cell.y][cell.x];
    maze[cell.y][cell.x] = 1; // temporarily wall it
    const stillReachable = bfsReachable(start, exitCell);
    maze[cell.y][cell.x] = original; // restore
    return !stillReachable;
}

// Finds all cells on the start->exit route that are mandatory,
// in path order (closest to start first).
function findMandatoryCells(start, exitCell) {
    const path = bfsPath(start, exitCell);
    if (!path) return [];
    return path.filter(cell => isMandatoryCell(cell, start, exitCell));
}

// Places 4 question checkpoints + 1 flag checkpoint spread evenly
// across a list of mandatory cells (flag checkpoint gets the one
// closest to the exit).
function placeCheckpointsFromMandatory(mandatory) {
    const flagCell = mandatory[mandatory.length - 1];
    const questionCells = mandatory.slice(0, mandatory.length - 1);
    const count = Math.min(4, questionCells.length);

    for (let i = 0; i < count; i++) {
        const idx = Math.floor(((i + 1) / (count + 1)) * questionCells.length);
        const cell = questionCells[Math.min(idx, questionCells.length - 1)];
        checkpoints.push({
            x: cell.x * CELL_SIZE + CELL_SIZE / 2 - 15,
            y: cell.y * CELL_SIZE + CELL_SIZE / 2 - 15,
            width: 30,
            height: 30,
            questionIndex: i,
            active: true
        });
    }

    checkpoints.push({
        x: flagCell.x * CELL_SIZE + CELL_SIZE / 2 - 15,
        y: flagCell.y * CELL_SIZE + CELL_SIZE / 2 - 15,
        width: 30,
        height: 30,
        questionIndex: 4,
        active: true
    });
}

// Generate checkpoint positions ONLY on mandatory (unavoidable) cells
function generateCheckpoints(attempt = 0) {
    checkpoints = [];
    completedCheckpoints.clear();

    const start = { x: 1, y: 1 };
    const exitCell = {
        x: Math.floor((exit.x + exit.width / 2) / CELL_SIZE),
        y: Math.floor((exit.y + exit.height / 2) / CELL_SIZE)
    };

    const mandatory = findMandatoryCells(start, exitCell);

    if (mandatory.length < 5) {
        // Extremely unlikely with this maze algorithm, but if a
        // generated maze somehow doesn't produce enough mandatory
        // cells, regenerate a fresh maze and try again.
        if (attempt < 15) {
            generateMaze();
            generateCheckpoints(attempt + 1);
        } else {
            placeCheckpointsFromMandatory(mandatory.length ? mandatory : [start, exitCell]);
        }
        return;
    }

    placeCheckpointsFromMandatory(mandatory);
}

// Main game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    if (!gameState.isRunning) return;

    console.log(keys);

    const oldX = player.x;
    const oldY = player.y;

    // Handle movement - check multiple key combinations
    if (keys['arrowup'] || keys['w'] || keys['up']) {
        player.y -= player.speed;
    }
    if (keys['arrowdown'] || keys['s'] || keys['down']) {
        player.y += player.speed;
    }
    if (keys['arrowleft'] || keys['a'] || keys['left']) {
        player.x -= player.speed;
    }
    if (keys['arrowright'] || keys['d'] || keys['right']) {
        player.x += player.speed;
    }

    // Keep player in bounds
    player.x = Math.max(0, Math.min(MAZE_WIDTH - player.width, player.x));
    player.y = Math.max(0, Math.min(MAZE_HEIGHT - player.height, player.y));

    // Collision detection with walls
    if (isCollidingWithWall(player.x, player.y)) {
        player.x = oldX;
        player.y = oldY;
    }

    // Check checkpoint collision
    checkpointCollision();

    // Check exit collision - only allow exit if flag has been captured
    if (isColliding(player, exit) && completedCheckpoints.has(4)) {
        gameState.isRunning = false;
        showFlagScreen();
    }
}

// Check collision with maze walls
function isCollidingWithWall(x, y) {
    // Check all four corners and center of the player rectangle
    const points = [
        { x: x + 2, y: y + 2 },                                    // Top-left corner (with small margin)
        { x: x + player.width - 2, y: y + 2 },                    // Top-right corner
        { x: x + 2, y: y + player.height - 2 },                   // Bottom-left corner
        { x: x + player.width - 2, y: y + player.height - 2 },    // Bottom-right corner
        { x: x + player.width / 2, y: y + player.height / 2 }     // Center
    ];
    
    for (const point of points) {
        const col = Math.floor(point.x / CELL_SIZE);
        const row = Math.floor(point.y / CELL_SIZE);
        
        if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return true;
        if (maze[row][col] === 1) return true;
    }
    
    return false;
}

// Check collision between two rectangles
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Check checkpoint collision
function checkpointCollision() {
    for (const checkpoint of checkpoints) {
        if (!completedCheckpoints.has(checkpoint.questionIndex) && 
            isColliding(player, checkpoint)) {
            showQuestion(checkpoint.questionIndex);
        }
    }
}

// Draw game
function draw() {
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, MAZE_WIDTH, MAZE_HEIGHT);

    // Draw maze
    drawMaze();

    // Draw checkpoints
    drawCheckpoints();

    // Draw exit
    drawExit();

    // Draw player
    drawPlayer();
}

// Draw maze walls
function drawMaze() {
    ctx.fillStyle = '#ff006e';
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 0.5;

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (maze[row][col] === 1) {
                const x = col * CELL_SIZE;
                const y = row * CELL_SIZE;
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

// Draw checkpoints
function drawCheckpoints() {
    for (const checkpoint of checkpoints) {
        if (completedCheckpoints.has(checkpoint.questionIndex)) {
            ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
        } else {
            ctx.fillStyle = '#00d4ff';
        }

        ctx.beginPath();
        ctx.arc(checkpoint.x + checkpoint.width / 2, 
                checkpoint.y + checkpoint.height / 2, 
                15, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw question mark or flag
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (!completedCheckpoints.has(checkpoint.questionIndex)) {
            // Show flag symbol for the last checkpoint (index 4), question mark for others
            const symbol = checkpoint.questionIndex === 4 ? '🚩' : '?';
            ctx.fillText(symbol, checkpoint.x + checkpoint.width / 2, checkpoint.y + checkpoint.height / 2);
        } else {
            ctx.fillText('✓', checkpoint.x + checkpoint.width / 2, checkpoint.y + checkpoint.height / 2);
        }
    }
}

// Draw exit
function drawExit() {
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(exit.x, exit.y, exit.width, exit.height);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT', exit.x + exit.width / 2, exit.y + exit.height / 2);
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw glow
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);
    
    // Debug info
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(`Pos: (${Math.floor(player.x)}, ${Math.floor(player.y)})`, 10, 15);
    ctx.fillText(`Running: ${gameState.isRunning}`, 10, 30);
}

// Question system
function showQuestion(questionIndex) {
    gameState.isRunning = false;
    gameState.currentQuestion = questionIndex;
    gameState.selectedOption = null;

    // Special case for the flag checkpoint (last one)
    if (questionIndex === 4) {
        showFlagCaptureMessage();
        return;
    }

    const question = questionsDatabase[questionIndex];
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('feedbackMessage').textContent = '';
    document.getElementById('feedbackMessage').className = '';

    // Make sure submit button is visible for regular questions
    const submitButton = document.getElementById('submitBtn');
    if (submitButton) {
        submitButton.style.display = 'block';
    }

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => selectOption(index, optionDiv);
        optionsContainer.appendChild(optionDiv);
    });

    document.getElementById('questionModal').classList.remove('hidden');
}

// Select answer option
function selectOption(index, element) {
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    gameState.selectedOption = index;
}

// Submit answer
function submitAnswer() {
    if (gameState.selectedOption === null) {
        alert('Please select an option!');
        return;
    }

    const question = questionsDatabase[gameState.currentQuestion];
    const feedback = document.getElementById('feedbackMessage');

    if (gameState.selectedOption === question.correct) {
        feedback.textContent = '✓ Correct! Well done!';
        feedback.className = 'correct';
        gameState.score += question.points;
        gameState.questionsAnswered++;
        completedCheckpoints.add(gameState.currentQuestion);

        document.getElementById('score').textContent = gameState.score;

        setTimeout(() => {
            document.getElementById('questionModal').classList.add('hidden');
            gameState.isRunning = true;
        }, 1500);
    } else {
        feedback.textContent = '✗ Incorrect! Try again.';
        feedback.className = 'incorrect';
        gameState.health -= 10;

        if (gameState.health <= 0) {
            gameState.health = 0;
            setTimeout(() => {
                alert('Game Over! Your health reached 0. Try again!');
                location.reload();
            }, 1000);
        }

        const healthFill = document.getElementById('healthFill');
        healthFill.style.width = gameState.health + '%';

        setTimeout(() => {
            document.getElementById('questionModal').classList.add('hidden');
            gameState.isRunning = true;
        }, 1500);
    }
}

// Screen management
function startGame() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    init();
}

function showInstructions() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('instructionsScreen').classList.remove('hidden');
}

function backToMenu() {
    location.reload();
}

function showFlagScreen() {
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('flagScreen').classList.remove('hidden');

    // Use captured flag if available, otherwise generate new one
    const flag = window.capturedFlag || generateFlag();
    document.getElementById('flagInput').dataset.correctFlag = flag;
}

// Generate flag (CTF flag format)
function generateFlag() {
    const flagParts = [
        'FLAG',
        Math.random().toString(36).substring(2, 8).toUpperCase(),
        'CTF',
        gameState.questionsAnswered,
        'MAZE'
    ];
    return flagParts.join('_') + '{' + Math.random().toString(36).substring(2, 12) + '}';
}

// Show flag capture congratulations message
function showFlagCaptureMessage() {
    const flag = generateFlag();
    
    document.getElementById('questionText').textContent = '🚩 Congratulations! You have captured the flag!';
    document.getElementById('feedbackMessage').textContent = `Your Flag: ${flag}`;
    document.getElementById('feedbackMessage').className = 'correct';

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = `<button onclick="copyFlag('${flag}')" style="background: #00ff88; color: #000; padding: 10px 20px; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">Copy the Flag</button>`;

    // Store flag for later use
    window.capturedFlag = flag;
    
    // Hide the submit answer button
    const submitButton = document.querySelector('button[onclick="submitAnswer()"]');
    if (submitButton) {
        submitButton.style.display = 'none';
    }
    
    document.getElementById('questionModal').classList.remove('hidden');
}

// Complete flag capture and mark checkpoint as completed
function completeFlagCapture() {
    gameState.score += 20;
    gameState.questionsAnswered++;
    completedCheckpoints.add(4);
    
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('questionModal').classList.add('hidden');
    gameState.isRunning = true;
}

// Copy flag to clipboard and complete flag capture
function copyFlag(flag) {
    navigator.clipboard.writeText(flag).then(() => {
        // Update button text to show success
        const button = document.querySelector('button[onclick*="copyFlag"]');
        if (button) {
            button.textContent = 'Flag Copied! ✓';
            button.style.background = '#00ff00';
        }
        
        // Complete the flag capture after a short delay
        setTimeout(() => {
            completeFlagCapture();
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy flag: ', err);
        // Fallback - just complete the capture
        completeFlagCapture();
    });
}

// Check submitted flag
function checkFlag() {
    const input = document.getElementById('flagInput').value.trim();
    const correct = document.getElementById('flagInput').dataset.correctFlag;
    const feedback = document.getElementById('flagFeedback');

    if (input === correct) {
        feedback.textContent = '✓ Correct Flag! You Saved the College!';
        feedback.className = 'correct';

        document.getElementById('finalScore').textContent = gameState.score;
        document.getElementById('questionsAnswered').textContent = gameState.questionsAnswered;

        setTimeout(() => {
            document.getElementById('flagScreen').classList.add('hidden');
            document.getElementById('winScreen').classList.remove('hidden');
        }, 2000);
    } else {
        feedback.textContent = '✗ Incorrect flag. Try again!';
        feedback.className = 'incorrect';
    }
}
