// ============================================
// MASTERMIND GAME - FULL IMPLEMENTATION
// Mastermind is a code-breaking game invented in 1970
// Reference: Wikipedia - Mastermind (board game)
// ============================================

// Game state management

let ourCode = "";                          // Secret code to guess
let currentGuess = [];                     // Current guess (dynamic length)
let attemptsRemaining = 10;                // Attempts left
let attemptCounter = 0;                     // Current attempt number
let guessHistory = [];                      // All guesses with feedback
let gamesPlayed = 0;                       // Total games played
let highestScore = null;                   // Best score (lowest attempts)
let recentScores = [];                     // Last 5 game results
let accessibilityMode = false;             // Show numbers on colors
let darkMode = true;                       // Current theme
let currentDifficulty = "easy";           // Current difficulty: "easy", "hard", "impossible"
let codeLength = 4;                        // Code length based on difficulty

// Color mapping: ID to hex color (matching CSS)
const colorMap = {
    0: "#374151",  // Gray
    1: "#ef4444",  // Red
    2: "#f59e0b",  // Orange
    3: "#facc15",  // Yellow
    4: "#10b981",  // Green
    5: "#14b8a6",  // Teal
    6: "#3b82f6",  // Blue
    7: "#8b5cf6",  // Purple
    8: "#ec4899",  // Pink
    9: "#4c2103"   // Brown
};

// ============================================
// INITIALIZATION
// ============================================

// Initialize game when DOM is ready
// Reference: MDN Web Docs - DOMContentLoaded event
window.addEventListener("DOMContentLoaded", function() {
    document.getElementById("darkModeBtn").textContent = "Light Mode";
    initializeGame();
    setupEventListeners();
    updateAccessibilityDisplay();
});

// Initialize new game with difficulty-based settings
// Sets code length and attempts based on selected difficulty
// Reference: MDN Web Docs - Array.fill()
function initializeGame() {
    if (currentDifficulty === "easy") {
        codeLength = 4;
        attemptsRemaining = 10;
    } else if (currentDifficulty === "hard") {
        codeLength = 6;
        attemptsRemaining = 12;
    } else if (currentDifficulty === "impossible") {
        codeLength = 8;
        attemptsRemaining = 15;
    }
    
    ourCode = makeRandomArray(codeLength);
    
    // Create array filled with null values for current guess
    currentGuess = new Array(codeLength).fill(null);
    attemptCounter = 0;
    guessHistory = [];
    
    createGuessSlots();
    updateGuessSlots();
    updateAttemptsDisplay();
    updateGameStatus(`Select ${codeLength} colors to make your guess!`, "info");
    clearHistoryDisplay();
    updateSubmitButton();
    
    console.log("New game! Difficulty: " + currentDifficulty + ", Code length: " + codeLength);
    console.log("Secret code: " + ourCode);
}

// Generate random code of specified length
// Each digit is 0-9, joined into string format
// Reference: MDN Web Docs - Math.random(), Array.join()
function makeRandomArray(length = codeLength) {
    const code = [];
    for (let i = 0; i < length; i++) {
        code.push(Math.floor(Math.random() * 10));
    }
    return code.join('');
}

// Convert string to array of numbers
// Reference: StackOverflow - "convert string to number array javascript"
function toArrays(string) {
    return string.split('').map(Number);
}

// UI update functions
// Create guess slots dynamically based on code length
function createGuessSlots() {
    const guessSlotsContainer = document.getElementById("guessSlots");
    guessSlotsContainer.innerHTML = ""; // Clear existing slots
    
    for (let i = 0; i < codeLength; i++) {
        const slot = document.createElement("div");
        slot.className = "guess-slot";
        slot.id = "slot" + i;
        slot.textContent = "?";
        guessSlotsContainer.appendChild(slot);
    }
}

// Update guess slots display
function updateGuessSlots() {
    for (let i = 0; i < codeLength; i++) {
        const slot = document.getElementById("slot" + i);
        if (!slot) continue; // Skip if slot doesn't exist yet
        
        if (currentGuess[i] !== null) {
            // Show selected color
            const colorId = currentGuess[i];
            slot.style.backgroundColor = colorMap[colorId];
            slot.style.borderColor = colorMap[colorId];
            slot.textContent = accessibilityMode ? colorId : "";
            // Set text color for accessibility
            if (accessibilityMode) {
                slot.style.color = (colorId <= 2 || colorId === 8) ? "#fff" : "#000";
                slot.style.fontWeight = "bold";
                slot.style.fontSize = "1.2rem";
            } else {
                slot.style.color = "transparent";
            }
        } else {
            // Show empty slot
            slot.style.backgroundColor = "rgba(30, 41, 59, 0.6)";
            slot.style.borderColor = "rgba(0, 240, 255, 0.3)";
            slot.textContent = "?";
            slot.style.color = "var(--text-muted)";
        }
    }
}

// Update attempts remaining display
function updateAttemptsDisplay() {
    document.getElementById("attemptsCount").textContent = attemptsRemaining;
}

// Update game status message
function updateGameStatus(message, type = "info") {
    const status = document.getElementById("gameStatus");
    status.textContent = message;
    status.className = "game-status " + type;
}

// Update submit button state
function updateSubmitButton() {
    const submitBtn = document.getElementById("submitBtn");
    const allFilled = currentGuess.every(slot => slot !== null);
    submitBtn.disabled = !allFilled;
}

// Clear history display
function clearHistoryDisplay() {
    document.getElementById("historyContainer").innerHTML = "";
}

// Update all score-related UI elements
// Dynamically creates score badges for recent scores
function updateScoreDisplay() {
    const highestScoreEl = document.getElementById("highestScore");
    highestScoreEl.textContent = highestScore !== null ? highestScore : "-";
    
    document.getElementById("gamesPlayed").textContent = gamesPlayed;
    
    const recentScoresList = document.getElementById("recentScoresList");
    recentScoresList.innerHTML = "";
    
    recentScores.forEach(score => {
        const scoreBadge = document.createElement("span");
        scoreBadge.style.cssText = `
            padding: 4px 12px;
            background: rgba(0, 240, 255, 0.1);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 12px;
            font-size: 0.9rem;
            color: var(--accent-cyan);
        `;
        scoreBadge.textContent = score;
        recentScoresList.appendChild(scoreBadge);
    });
}

// Handle color selection - fills next available slot
// If all slots filled, replaces the last slot
function selectColor(colorId) {
    for (let i = 0; i < codeLength; i++) {
        if (currentGuess[i] === null) {
            currentGuess[i] = colorId;
            updateGuessSlots();
            updateSubmitButton();
            return;
        }
    }
    // All slots filled - replace last one
    currentGuess[codeLength - 1] = colorId;
    updateGuessSlots();
    updateSubmitButton();
}

// Clear current guess
function clearGuess() {
    currentGuess = new Array(codeLength).fill(null);
    updateGuessSlots();
    updateSubmitButton();
}

// Submit current guess and evaluate
function submitGuess() {
    // Check if all slots filled
    if (currentGuess.some(slot => slot === null)) {
        updateGameStatus("Please fill all 4 slots!", "info");
        return;
    }
    
    const guessString = currentGuess.join('');
    
    // Store copy before clearing (needed for status message display)
    const submittedGuess = [...currentGuess];
    
    const result = evaluateGuess(ourCode, guessString);
    
    // Store guess with feedback in history
    guessHistory.push({
        guess: guessString,
        guessArray: submittedGuess,
        blackPegs: result.blackPegs,
        whitePegs: result.whitePegs
    });
    
    attemptsRemaining--;
    attemptCounter++;
    
    updateAttemptsDisplay();
    displayGuessInHistory();
    clearGuess();
    
    // Win condition: all pegs are black (correct position)
    if (result.blackPegs === codeLength) {
        handleWin();
        return;
    }
    
    // Lose condition: no attempts remaining
    if (attemptsRemaining === 0) {
        handleLose();
        return;
    }
    
    // Status message adapts based on accessibility mode
    let statusMessage;
    if (accessibilityMode) {
        statusMessage = `Guess submitted! ${result.blackPegs} correct position, ${result.whitePegs} correct color.`;
    } else {
        // Convert color IDs to readable color names
        const colorNames = {
            0: "Gray", 1: "Red", 2: "Orange", 3: "Yellow", 4: "Green",
            5: "Teal", 6: "Blue", 7: "Purple", 8: "Pink", 9: "Brown"
        };
        const guessColors = submittedGuess.map(id => colorNames[id]).join(", ");
        statusMessage = `Guess submitted! Your guess: ${guessColors}. ${result.blackPegs} correct position, ${result.whitePegs} correct color.`;
    }
    updateGameStatus(statusMessage, "info");
}

// Mastermind evaluation algorithm
// Implements standard Mastermind scoring: black pegs (exact match) and white pegs (color match, wrong position)
// Algorithm reference: StackOverflow - "mastermind game algorithm black white pegs"
// Two-pass approach prevents double-counting matches
// Reference: GitHub - mastermind-algorithm-implementations
// Implementation help: ChatGPT - "mastermind game evaluation algorithm javascript"
function evaluateGuess(secretCode, guess) {
    const codeArray = secretCode.split('').map(Number);
    const guessArray = guess.split('').map(Number);
    
    // Use spread operator to create copies (avoid mutating originals)
    // Reference: MDN Web Docs - Spread syntax
    let codeCopy = [...codeArray];
    let guessCopy = [...guessArray];
    
    let blackPegs = 0;
    let whitePegs = 0;
    
    // First pass: exact position matches (black pegs)
    for (let i = 0; i < codeLength; i++) {
        if (guessCopy[i] === codeCopy[i]) {
            blackPegs++;
            codeCopy[i] = null;
            guessCopy[i] = null;
        }
    }
    
    // Second pass: color matches in wrong positions (white pegs)
    for (let i = 0; i < codeLength; i++) {
        if (guessCopy[i] !== null) {
            const index = codeCopy.indexOf(guessCopy[i]);
            if (index !== -1) {
                whitePegs++;
                codeCopy[index] = null;
            }
        }
    }
    
    return { blackPegs, whitePegs };
}


// Handle win condition
function handleWin() {
    const attemptsUsed = attemptCounter;
    const difficultyText = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
    updateGameStatus(
        `Congratulations! You cracked the ${difficultyText} code in ${attemptsUsed} attempt${attemptsUsed !== 1 ? 's' : ''}!`, 
        "info"
    );
    
    // Update score tracking
    gamesPlayed++;
    if (highestScore === null || attemptsUsed < highestScore) {
        highestScore = attemptsUsed;
    }
    
    // Add to recent scores
    recentScores.unshift(attemptsUsed);
    if (recentScores.length > 5) {
        recentScores.pop(); // Keep only last 5
    }
    
    updateScoreDisplay();
    updateSubmitButton(); // Disable submit
}

// Handle lose condition
function handleLose() {
    // Show code as colors or numbers based on accessibility mode
    let codeDisplay;
    if (accessibilityMode) {
        codeDisplay = ourCode;
    } else {
        // Show colors instead of numbers
        const colorNames = {
            0: "Gray", 1: "Red", 2: "Orange", 3: "Yellow", 4: "Green",
            5: "Teal", 6: "Blue", 7: "Purple", 8: "Pink", 9: "Brown"
        };
        const codeArray = ourCode.split('').map(Number);
        codeDisplay = codeArray.map(id => colorNames[id]).join(", ");
    }
    updateGameStatus(`Game Over! The code was: ${codeDisplay}`, "info");
    
    // Update score tracking
    gamesPlayed++;
    recentScores.unshift("Lost");
    if (recentScores.length > 5) {
        recentScores.pop();
    }
    
    updateScoreDisplay();
    updateSubmitButton(); // Disable submit
}

// History display
// Dynamically creates DOM elements for each guess with feedback
// Reference: MDN Web Docs - createElement, insertBefore, StackOverflow - "prepend element javascript"
function displayGuessInHistory() {
    const historyContainer = document.getElementById("historyContainer");
    const lastGuess = guessHistory[guessHistory.length - 1];
    
    const row = document.createElement("div");
    row.className = "history-row";
    
    const guessPegs = document.createElement("div");
    guessPegs.className = "guess-pegs";
    
    // Create colored pegs for the guess
    lastGuess.guessArray.forEach(colorId => {
        const peg = document.createElement("div");
        peg.className = "guess-slot";
        peg.style.backgroundColor = colorMap[colorId];
        peg.style.borderColor = colorMap[colorId];
        if (accessibilityMode) {
            peg.textContent = colorId;
            peg.style.color = (colorId <= 2 || colorId === 8) ? "#fff" : "#000";
            peg.style.fontWeight = "bold";
            peg.style.fontSize = "1.2rem";
        } else {
            peg.textContent = "";
            peg.style.color = "transparent";
        }
        guessPegs.appendChild(peg);
    });
    
    // Create feedback pegs (black = correct position, white = correct color wrong position)
    const feedbackPegs = document.createElement("div");
    feedbackPegs.className = "feedback-pegs";
    
    // Black pegs: correct position
    for (let i = 0; i < lastGuess.blackPegs; i++) {
        const peg = document.createElement("div");
        peg.className = "guess-slot";
        peg.style.width = "20px";
        peg.style.height = "20px";
        peg.style.backgroundColor = "#111827";
        peg.style.borderColor = "#111827";
        feedbackPegs.appendChild(peg);
    }
    
    // White pegs: correct color, wrong position
    for (let i = 0; i < lastGuess.whitePegs; i++) {
        const peg = document.createElement("div");
        peg.className = "guess-slot";
        peg.style.width = "20px";
        peg.style.height = "20px";
        peg.style.backgroundColor = "#ffffff";
        peg.style.borderColor = "#ffffff";
        peg.style.boxShadow = "inset 0 0 0 1px #000";
        feedbackPegs.appendChild(peg);
    }
    
    row.appendChild(guessPegs);
    row.appendChild(feedbackPegs);
    
    // Insert at top (newest guesses appear first)
    historyContainer.insertBefore(row, historyContainer.firstChild);
}



// Toggle between dark and light mode
function toggleTheme() {
    const body = document.body;
    const darkModeBtn = document.getElementById("darkModeBtn");
    
    if (darkMode) {
        // Switch to dark mode
        body.classList.remove("light-mode");
        darkModeBtn.textContent = "Light Mode";
    } else {
        // Switch to light mode
        body.classList.add("light-mode");
        darkModeBtn.textContent = "Dark Mode";
    }
}

// Accessibility mode: show/hide number labels on all color elements
// Updates color pegs, guess slots, and history rows consistently
// Reference: StackOverflow - "querySelectorAll forEach", MDN Web Docs - querySelectorAll
function updateAccessibilityDisplay() {
    updateGuessSlots();
    
    // Update color selection pegs
    for (let i = 0; i <= 9; i++) {
        const colorPeg = document.getElementById("color-" + i);
        if (colorPeg) {
            if (accessibilityMode) {
                colorPeg.textContent = i;
                // Contrast adjustment: white text on dark colors, black on light
                colorPeg.style.color = (i <= 2 || i === 8) ? "#fff" : "#000";
                colorPeg.style.fontWeight = "bold";
                colorPeg.style.fontSize = "1.2rem";
                colorPeg.style.display = "flex";
                colorPeg.style.alignItems = "center";
                colorPeg.style.justifyContent = "center";
            } else {
                colorPeg.textContent = "";
                colorPeg.style.color = "transparent";
                colorPeg.style.fontSize = "0";
            }
        }
    }
    
    // Update history row pegs
    const historyRows = document.querySelectorAll(".history-row .guess-pegs .guess-slot");
    historyRows.forEach(peg => {
        const bgColor = peg.style.backgroundColor;
        // Reverse lookup: find color ID from background color value
        const colorId = Object.keys(colorMap).find(id => colorMap[id] === bgColor);
        if (colorId !== undefined) {
            if (accessibilityMode) {
                peg.textContent = colorId;
                peg.style.color = (parseInt(colorId) <= 2 || parseInt(colorId) === 8) ? "#fff" : "#000";
                peg.style.fontWeight = "bold";
                peg.style.fontSize = "1.2rem";
            } else {
                peg.textContent = "";
                peg.style.color = "transparent";
            }
        }
    });
}



// Set up all event listeners
function setupEventListeners() {
    // Attach click handlers to all color pegs (0-9)
    // Loop through all color selection elements
    for (let i = 0; i <= 9; i++) {
        const colorPeg = document.getElementById("color-" + i);
        if (colorPeg) {
            colorPeg.addEventListener("click", function() {
                selectColor(i);
            });
        }
    }
    
    // Submit button
    document.getElementById("submitBtn").addEventListener("click", submitGuess);
    
    // Clear button
    document.getElementById("clearBtn").addEventListener("click", clearGuess);
    
    // New game button
document.getElementById("newGameBtn").addEventListener("click", function() {
        initializeGame();
    });
    
    // Difficulty buttons
    document.getElementById("difficultyEasy").addEventListener("click", function() {
        setDifficulty("easy");
    });
    
    document.getElementById("difficultyHard").addEventListener("click", function() {
        setDifficulty("hard");
    });
    
    document.getElementById("difficultyImpossible").addEventListener("click", function() {
        setDifficulty("impossible");
    });
    
    // Dark/Light mode toggle
    document.getElementById("darkModeBtn").addEventListener("click", function() {
        darkMode = !darkMode;
        toggleTheme();
    });
    
    // Accessibility toggle
    document.getElementById("accessibilityBtn").addEventListener("click", function() {
        accessibilityMode = !accessibilityMode;
        updateAccessibilityDisplay();
    });
}

// Difficulty management
// Switches game difficulty and restarts with new settings
// Reference: StackOverflow - "toggle active class javascript"
function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    
    // Remove active class from all buttons, then add to selected
    document.querySelectorAll(".difficulty-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    const btnId = "difficulty" + difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    document.getElementById(btnId).classList.add("active");
    
    initializeGame();
}