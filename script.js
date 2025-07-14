// Ollama Server Configuration
const OLLAMA_BASE_URL = 'https://f2ki-h100-1.f2.htw-berlin.de:11435';

// DOM Elements
const chatHistoryElement = document.getElementById('chatHistory');
const userInput = document.getElementById('userInput');
const modelSelect = document.getElementById('modelSelect');
const modelsList = document.getElementById('modelsList');
const statusMessage = document.getElementById('statusMessage');
const loadingSpinner = document.getElementById('loadingSpinner');

// Buttons
const sendChatBtn = document.getElementById('sendChat');
const sendGenerateBtn = document.getElementById('sendGenerate');
const clearChatBtn = document.getElementById('clearChat');
const listModelsBtn = document.getElementById('listModels');
const saveChatBtn = document.getElementById('saveChat');
const loadChatBtn = document.getElementById('loadChat');
const fileInput = document.getElementById('fileInput');

// State
let availableModels = [];
let isLoading = false;
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
    loadModels();
    loadChatFromStorage();
    currentSessionId = storageManager.generateSessionId();
    
    // Auto-select llama3.1:8b model for oracle
    setTimeout(() => {
        const llama31Option = Array.from(document.getElementById('modelSelect').options).find(
            option => option.value.includes('llama3.1:8b')
        );
        if (llama31Option) {
            document.getElementById('modelSelect').value = llama31Option.value;
        }
    }, 1000);
      // Setup auto-save toggle
    const autoSaveToggle = document.getElementById('autoSaveToggle');
    autoSaveToggle.addEventListener('change', function() {
        storageManager.setAutoSaveEnabled(this.checked);
        updateStatus(this.checked ? 'Auto-Speicherung aktiviert' : 'Auto-Speicherung deaktiviert');
    });
});

function setupEventListeners() {
    sendChatBtn.addEventListener('click', () => sendMessage('chat'));
    sendGenerateBtn.addEventListener('click', () => sendMessage('generate'));
    clearChatBtn.addEventListener('click', clearChat);
    listModelsBtn.addEventListener('click', loadModels);
    saveChatBtn.addEventListener('click', exportChat);
    loadChatBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', importChat);
    
    // Oracle start button
    const startOracleBtn = document.getElementById('startOracle');
    if (startOracleBtn) {
        startOracleBtn.addEventListener('click', startOracleSession);
    }
    
    // Enter key to send message
    userInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage('chat');
        }
    });
}

function setLoading(loading) {
    isLoading = loading;
    if (loading) {
        loadingSpinner.classList.add('active');
        sendChatBtn.disabled = true;
        sendGenerateBtn.disabled = true;
    } else {
        loadingSpinner.classList.remove('active');
        sendChatBtn.disabled = false;
        sendGenerateBtn.disabled = false;
    }
}

function updateStatus(message) {
    statusMessage.textContent = message;
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
    
    if (sender === 'assistant') {
        // Format assistant messages with proper line breaks
        messageDiv.innerHTML = content.replace(/\n/g, '<br>');
    } else if (sender === 'oracle' || sender === 'question' || sender === 'prediction') {
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
    
    // Auto-save to localStorage and file
    storageManager.saveChatToStorage(chatHistory, currentSessionId);
    
    // Auto-save to file every 2 messages or when assistant responds
    if (sender === 'assistant' || chatHistory.length % 2 === 0) {
        const statusCallback = {
            getStatus: () => statusMessage.textContent,
            setStatus: (msg) => statusMessage.textContent = msg
        };
        storageManager.autoSaveChatToFile(chatHistory, currentSessionId, statusCallback);
    }
}

async function loadModels() {
    try {
        setLoading(true);
        updateStatus('Lade verfügbare Modelle...');
        
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        availableModels = data.models || [];
        
        displayModels();
        populateModelSelect();
        updateStatus(`${availableModels.length} Modelle geladen`);
        
    } catch (error) {
        console.error('Fehler beim Laden der Modelle:', error);
        updateStatus('Fehler beim Laden der Modelle');
        modelsList.innerHTML = '<span class="loading-text">Fehler beim Laden der Modelle. Überprüfen Sie die Serververbindung.</span>';
    } finally {
        setLoading(false);
    }
}

function displayModels() {
    if (availableModels.length === 0) {
        modelsList.innerHTML = '<span class="loading-text">Keine Modelle gefunden</span>';
        return;
    }
    
    modelsList.innerHTML = '';
    availableModels.forEach(model => {
        const modelTag = document.createElement('span');
        modelTag.className = 'model-tag';
        modelTag.textContent = model.name;
        modelTag.title = `Größe: ${formatSize(model.size)} | Geändert: ${new Date(model.modified_at).toLocaleString()}`;
        
        modelTag.addEventListener('click', () => {
            modelSelect.value = model.name;
            // Visual feedback
            document.querySelectorAll('.model-tag').forEach(tag => tag.classList.remove('selected'));
            modelTag.classList.add('selected');
        });
        
        modelsList.appendChild(modelTag);
    });
}

function populateModelSelect() {
    modelSelect.innerHTML = '<option value="">Modell auswählen...</option>';
    availableModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model.name;
        option.textContent = model.name;
        modelSelect.appendChild(option);
    });
}

function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function sendMessage(type = 'chat') {
    const message = userInput.value.trim();
    
    // Check if we're in oracle mode
    if (kiOracle.isInOracleMode()) {
        handleOracleResponse(message);
        return;
    }
    
    // Check for oracle start commands
    if (message.toLowerCase().includes('orakel') || message.toLowerCase().includes('start')) {
        startOracleSession();
        return;
    }
    
    const selectedModel = modelSelect.value;
    
    if (!message) {
        updateStatus('Bitte geben Sie eine Nachricht ein');
        return;
    }
    
    if (!selectedModel) {
        updateStatus('Bitte wählen Sie ein Modell aus');
        return;
    }
    
    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';
    
    try {
        setLoading(true);
        updateStatus(`Sende Anfrage an ${selectedModel}...`);
        
        let response;
        if (type === 'chat') {
            response = await sendChatRequest(message, selectedModel);
        } else {
            response = await sendGenerateRequest(message, selectedModel);
        }
        
        updateStatus('Antwort erhalten');
        
    } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error);
        addMessage(`Fehler: ${error.message}`, 'system');
        updateStatus('Fehler beim Senden der Nachricht');
    } finally {
        setLoading(false);
    }
}

async function sendChatRequest(message, model) {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ],
            stream: false
        }),
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const assistantMessage = data.message?.content || 'Keine Antwort erhalten';
    addMessage(assistantMessage, 'assistant');
    
    return data;
}

async function sendGenerateRequest(message, model) {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            prompt: message,
            stream: false
        }),
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const generatedText = data.response || 'Keine Antwort erhalten';
    addMessage(generatedText, 'assistant');
    
    return data;
}

function clearChat() {
    document.getElementById('chatHistory').innerHTML = '';
    chatHistory = [];
    currentSessionId = storageManager.generateSessionId();
    storageManager.saveChatToStorage(chatHistory, currentSessionId);
    
    // Reset oracle
    kiOracle.resetOracle();
    
    // Hide progress bar
    const progressDiv = document.getElementById('oracleProgress');
    if (progressDiv) {
        progressDiv.style.display = 'none';
    }
    
    // Show start button
    const startBtn = document.getElementById('startOracle');
    if (startBtn) {
        startBtn.style.display = 'inline-block';
    }
    
    // Save final state before clearing
    const statusCallback = {
        getStatus: () => statusMessage.textContent,
        setStatus: (msg) => statusMessage.textContent = msg
    };
    storageManager.autoSaveChatToFile(chatHistory, currentSessionId, statusCallback);
    updateStatus('Chat geleert');
}

function exportChat() {
    const statusCallback = {
        getStatus: () => statusMessage.textContent,
        setStatus: (msg) => statusMessage.textContent = msg
    };
    storageManager.exportChat(chatHistory, currentSessionId, statusCallback);
}

function importChat() {
    const file = fileInput.files[0];
    if (!file) return;
    
    const confirmCallback = (message) => confirm(message);
    const successCallback = (result, statusMsg) => {
        chatHistory = result.history;
        currentSessionId = result.sessionId;
        loadChatFromStorage(); // Reload UI
        storageManager.saveChatToStorage(chatHistory, currentSessionId); // Save to localStorage
        updateStatus(statusMsg);
    };
    const errorCallback = (errorMsg) => updateStatus(errorMsg);
    
    storageManager.importChat(file, confirmCallback, successCallback, errorCallback);
    fileInput.value = ''; // Reset file input
}

// Error handling for network issues
window.addEventListener('online', () => {
    updateStatus('Verbindung wiederhergestellt');
});

window.addEventListener('offline', () => {
    updateStatus('Keine Internetverbindung');
});

// Auto-focus on input field
userInput.focus();

function loadChatFromStorage() {
    const loadedData = storageManager.loadChatFromStorage();
    if (loadedData) {
        chatHistory = loadedData.history;
        currentSessionId = loadedData.sessionId;
        
        // Restore chat messages to UI
        const chatContainer = document.getElementById('chatHistory');
        chatContainer.innerHTML = '';
        
        chatHistory.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.sender}`;
            
            if (message.sender === 'assistant') {
                messageDiv.innerHTML = message.content.replace(/\n/g, '<br>');
            } else if (message.sender === 'oracle' || message.sender === 'question' || message.sender === 'prediction') {
                messageDiv.innerHTML = message.content.replace(/\n/g, '<br>');
            } else {
                messageDiv.textContent = message.content;
            }
            
            // Add timestamp (except for oracle messages)
            if (message.sender !== 'oracle' && message.sender !== 'question' && message.sender !== 'prediction') {
                const timestampSpan = document.createElement('span');
                timestampSpan.className = 'timestamp';
                timestampSpan.textContent = new Date(message.timestamp).toLocaleTimeString();
                messageDiv.appendChild(timestampSpan);
            }
            
            chatContainer.appendChild(messageDiv);
        });
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
        updateStatus(`Chat geladen (${chatHistory.length} Nachrichten)`);
    }
}

// Oracle-specific functions
function startOracleSession() {
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
    
    // Show first question
    setTimeout(() => {
        const firstQuestion = kiOracle.getCurrentQuestion();
        addMessage(firstQuestion, 'question');
        updateOracleProgress();
    }, 1000);
    
    updateStatus('KI-Orakel gestartet - Beantworte die Fragen!');
}

function handleOracleResponse(answer) {
    if (!answer.trim()) {
        updateStatus('Bitte geben Sie eine Antwort ein');
        return;
    }
    
    // Add user's answer
    addMessage(answer, 'user');
    userInput.value = '';
    
    // Process the answer
    const response = kiOracle.processAnswer(answer);
    
    // Check if it's a validation error
    if (response.includes('Bitte wähle eine gültige Option')) {
        addMessage(response, 'system');
        return;
    }
    
    // Check if oracle is completed
    if (kiOracle.isCompleted || response.includes('KARRIEREPROGNOSE')) {
        // This is the final prediction
        addMessage(response, 'prediction');
        
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
        
        updateStatus('KI-Orakel Sitzung abgeschlossen!');
        
        // Auto-save the oracle session
        const statusCallback = {
            getStatus: () => statusMessage.textContent,
            setStatus: (msg) => statusMessage.textContent = msg
        };
        storageManager.autoSaveChatToFile(chatHistory, currentSessionId, statusCallback);
        
    } else {
        // Show next question
        setTimeout(() => {
            addMessage(response, 'question');
            updateOracleProgress();
        }, 500);
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
