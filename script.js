// Ollama Server Configuration
const OLLAMA_BASE_URL = 'https://f2ki-h100-1.f2.htw-berlin.de:11435';

// DOM Elements
const chatHistory = document.getElementById('chatHistory');
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

// State
let availableModels = [];
let isLoading = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadModels();
});

function setupEventListeners() {
    sendChatBtn.addEventListener('click', () => sendMessage('chat'));
    sendGenerateBtn.addEventListener('click', () => sendMessage('generate'));
    clearChatBtn.addEventListener('click', clearChat);
    listModelsBtn.addEventListener('click', loadModels);
    
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
    
    if (sender === 'assistant') {
        // Format assistant messages with proper line breaks
        messageDiv.innerHTML = content.replace(/\n/g, '<br>');
    } else {
        messageDiv.textContent = content;
    }
    
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
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
    chatHistory.innerHTML = '';
    updateStatus('Chat geleert');
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
