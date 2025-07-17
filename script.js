// Ollama Server Configuration
const OLLAMA_BASE_URL = 'https://f2ki-h100-1.f2.htw-berlin.de:11435';
const FIXED_MODEL = 'llama3.1:8b';

// DOM Elements
const userInput = document.getElementById('userInput');

// Buttons
const sendChatBtn = document.getElementById('sendChat');

// State
let chatHistory = [];
let currentSessionId = null;

// Initialize storage manager
let storageManager = null;
let kiOracle = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize storage manager and KI Oracle
    storageManager = new ChatStorageManager();
    kiOracle = new KIOracle();
    
    setupEventListeners();
    currentSessionId = storageManager.generateSessionId();
    
    // Auto-focus on input field
    userInput.focus();
});

function setupEventListeners() {
    sendChatBtn.addEventListener('click', () => sendMessage());
    
    // Oracle start button
    const startOracleBtn = document.getElementById('startOracle');
    if (startOracleBtn) {
        startOracleBtn.addEventListener('click', startOracleSession);
    }
    
    // Enter key to send message
    userInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
}

function setLoading(loading) {
    if (loading) {
        sendChatBtn.disabled = true;
    } else {
        sendChatBtn.disabled = false;
    }
}

function addMessage(content, sender = 'user') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const timestamp = new Date().toISOString();
    const messageData = {
        content: content,
        sender: sender,
        timestamp: timestamp,
        sessionId: currentSessionId
    };
    
    // Add to chat history array
    chatHistory.push(messageData);
    
    if (sender === 'oracle' || sender === 'question' || sender === 'prediction') {
        // Format oracle messages as HTML
        messageDiv.innerHTML = content.replace(/\n/g, '<br>');
    } else {
        messageDiv.textContent = content;
    }
    
    // Add timestamp to message (except for oracle messages)
    if (sender !== 'oracle' && sender !== 'question' && sender !== 'prediction') {
        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'timestamp';
        timestampSpan.textContent = new Date(timestamp).toLocaleTimeString();
        messageDiv.appendChild(timestampSpan);
    }
    
    document.getElementById('chatHistory').appendChild(messageDiv);
    document.getElementById('chatHistory').scrollTop = document.getElementById('chatHistory').scrollHeight;
    
    // Auto-save to localStorage
    storageManager.saveChatToStorage(chatHistory, currentSessionId);
}

async function sendMessage() {
    const message = userInput.value.trim();
    
    // Check if we're in oracle mode
    if (kiOracle.isInOracleMode()) {
        handleOracleResponse(message);
    } else {
        // Check for oracle start commands
        if (message.toLowerCase().includes('orakel') || message.toLowerCase().includes('start')) {
            startOracleSession();
        }
    }
}

// Oracle-specific functions
function startOracleSession() {
    // Clear chat and start fresh session
    document.getElementById('chatHistory').innerHTML = '';
    chatHistory = [];
    currentSessionId = storageManager.generateSessionId();
    storageManager.saveChatToStorage(chatHistory, currentSessionId);
    
    // Reset oracle
    kiOracle.resetOracle();
    
    const welcomeMessage = kiOracle.startOracle();
    addMessage(welcomeMessage, 'oracle');
    
    // Show progress bar
    const progressDiv = document.getElementById('oracleProgress');
    if (progressDiv) {
        progressDiv.style.display = 'block';
    }
    
    // Hide start button
    const startBtn = document.getElementById('startOracle');
    if (startBtn) {
        startBtn.style.display = 'none';
    }
    
    // Show first question immediately
    const firstQuestion = kiOracle.getCurrentQuestion();
    addMessage(firstQuestion, 'question');
    updateOracleProgress();
}

async function handleOracleResponse(answer) {
    // Add user's answer
    addMessage(answer, 'user');
    userInput.value = '';
    
    try {
        // Process the answer (stores internally, no API call yet)
        const response = await kiOracle.processAnswer(answer);
        
        // Check if it's a validation error
        if (response.includes('Bitte gib eine Antwort ein')) {
            addMessage(response, 'system');
            return;
        }
        
        // Check if all questions are answered
        if (kiOracle.isCompleted || response === 'ALLE_FRAGEN_BEANTWORTET') {
            // Show "Orakel generiert Zukunft - bitte kurz warten" message
            addMessage('🔮 **Orakel generiert Zukunft** 🔮', 'oracle');
            
            // Show loading indicator for prediction generation
            setLoading(true);
            
            // NOW generate the prediction (single Ollama API call)
            const prediction = await kiOracle.generatePrediction();
            
            // Show final prediction
            addMessage(prediction, 'prediction');
            
            // Hide progress bar
            const progressDiv = document.getElementById('oracleProgress');
            if (progressDiv) {
                progressDiv.style.display = 'none';
            }
            
            // Show start button again
            const startBtn = document.getElementById('startOracle');
            if (startBtn) {
                startBtn.style.display = 'inline-block';
            }
            
        } else {
            // Show next question directly
            addMessage(response, 'question');
            updateOracleProgress();
        }
    } catch (error) {
        console.error('Error processing oracle response:', error);
        addMessage('Entschuldigung, es gab einen Fehler beim Verarbeiten Deiner Antwort. Bitte versuche es erneut.', 'system');
    } finally {
        setLoading(false);
    }
}

function updateOracleProgress() {
    const progress = kiOracle.getProgress();
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) {
        progressFill.style.width = progress.percentage + '%';
    }
    
    if (progressText) {
        progressText.textContent = `${progress.current} von ${progress.total} Fragen`;
    }
}
