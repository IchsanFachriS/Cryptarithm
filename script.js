const problems = [
    { problem: 'SEND + MORE = MONEY', solution: { S: 9, E: 5, N: 6, D: 7, M: 1, O: 0, R: 8, Y: 2 } },
    { problem: 'BASE + BALL = GAMES', solution: { B: 7, A: 4, S: 8, E: 3, L: 5, G: 1, M: 9 } },
    { problem: 'EAT + THAT = APPLE', solution: { E: 8, A: 1, T: 9, H: 2, P: 0, L: 3 } },
    { problem: 'AIR + AR = IRA', solution: { A: 6, I: 7, R: 3 } },
    { problem: 'AA + BB = CBC', solution: { A: 9, B: 2, C: 1 } },
    { problem: 'A + A = 2', solution: { A: 1 } },
    { problem: 'AB + CD = CFG', solution: { A: 8, B: 3, C: 1, D: 9, F: 0, G: 2 } },
    { problem: 'II + II = HIU', solution: { I: 9, H: 1, U: 8 } },
    { problem: 'TWO + TWO = FOUR', solution: { T: 5, W: 2, O: 3, F: 1, U: 4, R: 6 } },
    { problem: 'CROSS + ROADS = DANGER', solution: { C: 9, R: 6, O: 2, S: 3, A: 5, D: 1, N: 8, G: 7, E: 4 } },
    { problem: 'AB + AB = BCC', solution: { A: 6, B: 1, C: 2 } },
    { problem: 'AB + BA = DAD', solution: { A: 2, B: 9, D: 1 } },
    { problem: 'ADA + DI = DIA', solution: { A: 4, D: 5, I: 0 } },
    { problem: 'MATH + ATH + TH + H = 2022', solution: { M: 1, A: 4, T: 7, H: 3 } },
    { problem: 'ARA + ABA = BAR', solution: { A: 3, R: 6, B: 7 } },
    // Add more problems as needed
];

// Game state variables
let currentProblemIndex = 0;
let score = 0;
let startTime;
let timer;
let usedDigits = new Set();

// Function to shuffle the problems array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initialize the game
function initGame() {
    // Shuffle problems array
    shuffle(problems);
    currentProblemIndex = 0;
    score = 0;
    
    // Add score and timer display to HTML
    if (!document.getElementById('score-display')) {
        const container = document.querySelector('.container');
        const scoreDiv = document.createElement('div');
        scoreDiv.id = 'score-display';
        scoreDiv.innerHTML = 'Score: 0';
        
        const timerDiv = document.createElement('div');
        timerDiv.id = 'timer';
        timerDiv.innerHTML = 'Time: 0s';
        
        container.insertBefore(scoreDiv, document.getElementById('puzzle'));
        container.insertBefore(timerDiv, document.getElementById('puzzle'));
    }
    
    // Add hint button
    if (!document.getElementById('hint')) {
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'button-group';
        buttonDiv.innerHTML = `
            <button id="hint">Get Hint</button>
            <button id="skip">Skip Puzzle</button>
        `;
        document.getElementById('puzzle').insertBefore(
            buttonDiv, 
            document.getElementById('message')
        );
        
        document.getElementById('hint').addEventListener('click', getHint);
        document.getElementById('skip').addEventListener('click', skipPuzzle);
    }
    
    loadProblem();
    startTimer();
}

// Load the current problem
function loadProblem() {
    const problemDiv = document.getElementById('problem');
    const inputsDiv = document.getElementById('inputs');
    const messageDiv = document.getElementById('message');
    
    // Reset used digits for the new problem
    usedDigits.clear();
    
    // Display problem number
    problemDiv.innerHTML = `<p>Puzzle ${currentProblemIndex + 1} of ${problems.length}</p>
                           <p class="problem-text">${problems[currentProblemIndex].problem}</p>`;
    
    inputsDiv.innerHTML = '';
    messageDiv.innerText = '';

    // Extract unique letters and create input fields
    const uniqueLetters = Array.from(
        new Set(problems[currentProblemIndex].problem.replace(/[^A-Z]/g, '').split(''))
    ).sort();
    
    // Get leading digits (first letter of each word)
    const words = problems[currentProblemIndex].problem.split('=').join('+').split('+');
    const leadingLetters = new Set(words.map(word => word.trim()[0]));
    
    uniqueLetters.forEach(letter => {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        
        const label = document.createElement('label');
        label.textContent = letter;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.max = '9';
        input.setAttribute('maxlength', 1);
        input.setAttribute('data-letter', letter);
        
        // Mark leading letters (can't be zero)
        if (leadingLetters.has(letter)) {
            input.classList.add('leading');
            label.classList.add('leading');
        }
        
        // Add event listeners
        input.addEventListener('input', handleInput);
        input.addEventListener('keydown', handleKeyDown);
        
        inputGroup.appendChild(label);
        inputGroup.appendChild(input);
        inputsDiv.appendChild(inputGroup);
    });
    
    // Display rules
    const rulesDiv = document.createElement('div');
    rulesDiv.className = 'rules';
    rulesDiv.innerHTML = `
        <p>Rules:</p>
        <ul>
            <li>Each letter represents a unique digit (0-9)</li>
            <li>Leading digits (marked in bold) cannot be zero</li>
        </ul>
    `;
    inputsDiv.appendChild(rulesDiv);
}

// Handle input changes
function handleInput(e) {
    const input = e.target;
    const value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
    const letter = input.getAttribute('data-letter');
    
    // Only allow one digit
    input.value = value;
    
    // Check if this digit is already used
    if (value && usedDigits.has(parseInt(value))) {
        const currentLetterInputs = document.querySelectorAll(`input[data-letter="${letter}"]`);
        currentLetterInputs.forEach(inp => {
            if (inp !== input && inp.value === value) {
                return; // Same letter can have same value
            }
        });
        
        input.classList.add('duplicate');
        setTimeout(() => input.classList.remove('duplicate'), 500);
    } else if (value) {
        // Add this digit to used digits
        usedDigits.add(parseInt(value));
    }
    
    // Check if leading digit is 0
    if (input.classList.contains('leading') && value === '0') {
        input.classList.add('error');
        setTimeout(() => input.classList.remove('error'), 500);
    }
    
    // Move to next input if value is entered
    if (value) {
        const inputs = Array.from(document.querySelectorAll('#inputs input'));
        const currentIndex = inputs.indexOf(input);
        if (currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
        }
    }
}

// Handle keyboard navigation
function handleKeyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const inputs = Array.from(document.querySelectorAll('#inputs input'));
        const currentIndex = inputs.indexOf(e.target);
        if (currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
        }
        e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const inputs = Array.from(document.querySelectorAll('#inputs input'));
        const currentIndex = inputs.indexOf(e.target);
        if (currentIndex > 0) {
            inputs[currentIndex - 1].focus();
        }
        e.preventDefault();
    } else if (e.key === 'Enter') {
        checkAnswer();
    }
}

// Check if the answer is correct
function checkAnswer() {
    const inputs = document.querySelectorAll('#inputs input');
    let isCorrect = true;
    let allFilled = true;
    const solution = problems[currentProblemIndex].solution;
    const userSolution = {};
    
    // First check if all inputs are filled
    inputs.forEach(input => {
        if (!input.value) {
            allFilled = false;
        }
        const letter = input.getAttribute('data-letter');
        userSolution[letter] = parseInt(input.value, 10);
    });
    
    if (!allFilled) {
        showMessage('Please fill in all letters', 'warning');
        return;
    }
    
    // Check for duplicates
    const values = Object.values(userSolution);
    if (new Set(values).size !== values.length) {
        showMessage('Each letter must represent a unique digit', 'error');
        return;
    }
    
    // Check if solution is correct
    inputs.forEach(input => {
        const letter = input.getAttribute('data-letter');
        const value = parseInt(input.value, 10);
        
        if (solution[letter] !== value) {
            isCorrect = false;
            input.classList.add('incorrect');
        } else {
            input.classList.add('correct');
        }
    });

    if (isCorrect) {
        score++;
        document.getElementById('score-display').innerHTML = `Score: ${score}`;
        showMessage('Correct! Well done!', 'success');
        
        // Move to next problem
        currentProblemIndex++;
        if (currentProblemIndex < problems.length) {
            setTimeout(loadProblem, 1500);
        } else {
            clearInterval(timer);
            const finalTime = Math.floor((Date.now() - startTime) / 1000);
            showMessage(`Congratulations! You completed all puzzles in ${formatTime(finalTime)} with a score of ${score}`, 'success');
        }
    } else {
        showMessage('Not quite right. Try again!', 'error');
        setTimeout(() => {
            inputs.forEach(input => {
                input.classList.remove('incorrect');
                input.classList.remove('correct');
            });
        }, 1500);
    }
}

// Provide a hint for the player
function getHint() {
    const inputs = document.querySelectorAll('#inputs input');
    const solution = problems[currentProblemIndex].solution;
    
    // Find an empty or incorrect input
    let emptyInputs = Array.from(inputs).filter(input => !input.value);
    
    if (emptyInputs.length > 0) {
        // Select a random empty input
        const randomInput = emptyInputs[Math.floor(Math.random() * emptyInputs.length)];
        const letter = randomInput.getAttribute('data-letter');
        
        randomInput.value = solution[letter];
        randomInput.classList.add('hint');
        usedDigits.add(solution[letter]);
        
        showMessage(`Hint: ${letter} = ${solution[letter]}`, 'info');
    } else {
        // Check for incorrect inputs
        let incorrectInputs = Array.from(inputs).filter(input => {
            const letter = input.getAttribute('data-letter');
            return parseInt(input.value, 10) !== solution[letter];
        });
        
        if (incorrectInputs.length > 0) {
            const randomInput = incorrectInputs[Math.floor(Math.random() * incorrectInputs.length)];
            const letter = randomInput.getAttribute('data-letter');
            
            randomInput.value = solution[letter];
            randomInput.classList.add('hint');
            
            showMessage(`Hint: ${letter} = ${solution[letter]}`, 'info');
        } else {
            showMessage('All values are already correct!', 'info');
        }
    }
}

// Skip the current puzzle
function skipPuzzle() {
    currentProblemIndex++;
    if (currentProblemIndex < problems.length) {
        showMessage('Puzzle skipped', 'info');
        setTimeout(loadProblem, 500);
    } else {
        clearInterval(timer);
        const finalTime = Math.floor((Date.now() - startTime) / 1000);
        showMessage(`Game over! Your final score is ${score}. Time: ${formatTime(finalTime)}`, 'info');
    }
}

// Display a message with a specified type
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerText = text;
    messageDiv.className = type;
    
    // Remove any previous classes
    messageDiv.classList.remove('success', 'error', 'warning', 'info');
    messageDiv.classList.add(type);
}

// Start the timer
function startTimer() {
    startTime = Date.now();
    const timerElement = document.getElementById('timer');
    
    timer = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        timerElement.innerHTML = `Time: ${formatTime(elapsedSeconds)}`;
    }, 1000);
}

// Format time as mm:ss
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Add event listener for the submit button
document.getElementById('submit').addEventListener('click', checkAnswer);

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', initGame);