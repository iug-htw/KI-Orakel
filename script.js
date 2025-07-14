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
let autoSaveEnabled = true;
let saveCounter = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadModels();
    loadChatFromStorage();
    currentSessionId = generateSessionId();
    
    // Setup auto-save toggle
    const autoSaveToggle = document.getElementById('autoSaveToggle');
    autoSaveToggle.addEventListener('change', function() {
        autoSaveEnabled = this.checked;
        updateStatus(autoSaveEnabled ? 'Auto-Speicherung aktiviert' : 'Auto-Speicherung deaktiviert');
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
    } else {
        messageDiv.textContent = content;
    }
    
    // Add timestamp to message
    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'timestamp';
    timestampSpan.textContent = new Date(timestamp).toLocaleTimeString();
    messageDiv.appendChild(timestampSpan);
    
    document.getElementById('chatHistory').appendChild(messageDiv);
    document.getElementById('chatHistory').scrollTop = document.getElementById('chatHistory').scrollHeight;
    
    // Auto-save to localStorage and file
    saveChatToStorage();
    
    // Auto-save to file every 2 messages or when assistant responds
    if (sender === 'assistant' || chatHistory.length % 2 === 0) {
        autoSaveChatToFile();
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
    currentSessionId = generateSessionId();
    saveChatToStorage();
    // Save final state before clearing
    autoSaveChatToFile();
    updateStatus('Chat geleert');
}

function autoSaveChatToFile() {
    if (!autoSaveEnabled || chatHistory.length === 0) {
        return;
    }
    
    saveCounter++;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `chats/chat_${currentSessionId}_${timestamp}.json`;
    
    const exportData = {
        autoSaved: true,
        saveNumber: saveCounter,
        saveDate: new Date().toISOString(),
        sessionId: currentSessionId,
        chatHistory: chatHistory,
        totalMessages: chatHistory.length
    };
    
    // Create and download JSON file
    const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    
    const link = document.createElement('a');
    link.href = jsonUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(jsonUrl);
    
    // Show subtle notification
    const statusEl = document.getElementById('statusMessage');
    const originalText = statusEl.textContent;
    statusEl.textContent = `Auto-gespeichert (${saveCounter})`;
    setTimeout(() => {
        statusEl.textContent = originalText;
    }, 2000);
}

function exportChat() {
    if (chatHistory.length === 0) {
        updateStatus('Keine Chat-Historie zum Exportieren vorhanden');
        return;
    }
    
    const exportData = {
        exportDate: new Date().toISOString(),
        sessionId: currentSessionId,
        chatHistory: chatHistory,
        totalMessages: chatHistory.length,
        manualExport: true
    };
    
    // Create JSON file
    const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    
    // Create TXT file (human-readable format)
    let txtContent = `Ollama Chat Export\n`;
    txtContent += `Exportiert am: ${new Date().toLocaleString()}\n`;
    txtContent += `Session ID: ${currentSessionId}\n`;
    txtContent += `Anzahl Nachrichten: ${chatHistory.length}\n`;
    txtContent += `\n${'='.repeat(50)}\n\n`;
    
    chatHistory.forEach((message, index) => {
        txtContent += `[${new Date(message.timestamp).toLocaleString()}] ${message.sender.toUpperCase()}:\n`;
        txtContent += `${message.content}\n\n`;
    });
    
    const txtBlob = new Blob([txtContent], { type: 'text/plain' });
    const txtUrl = URL.createObjectURL(txtBlob);
    
    // Download JSON file to chats folder
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `chats/manual_export_${currentSessionId}_${new Date().toISOString().split('T')[0]}.json`;
    jsonLink.click();
    
    // Download TXT file to chats folder
    const txtLink = document.createElement('a');
    txtLink.href = txtUrl;
    txtLink.download = `chats/manual_export_${currentSessionId}_${new Date().toISOString().split('T')[0]}.txt`;
    txtLink.click();
    
    // Cleanup
    URL.revokeObjectURL(jsonUrl);
    URL.revokeObjectURL(txtUrl);
    
    updateStatus('Chat manuell exportiert (JSON & TXT)');
}

function importChat() {
    const file = fileInput.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let importedData;
            
            if (file.name.endsWith('.json')) {
                importedData = JSON.parse(e.target.result);
                
                // Validate JSON structure
                if (!importedData.chatHistory || !Array.isArray(importedData.chatHistory)) {
                    throw new Error('Ungültiges JSON-Format');
                }
                
                // Confirm import
                if (confirm(`Chat importieren?\n\nDies wird den aktuellen Chat ersetzen.\n\nImportierte Nachrichten: ${importedData.chatHistory.length}\nSession ID: ${importedData.sessionId || 'Unbekannt'}`)) {
                    chatHistory = importedData.chatHistory;
                    currentSessionId = importedData.sessionId || generateSessionId();
                    loadChatFromStorage(); // Reload UI
                    saveChatToStorage(); // Save to localStorage
                    updateStatus(`Chat importiert (${chatHistory.length} Nachrichten)`);
                }
            } else if (file.name.endsWith('.txt')) {
                // Simple TXT import - not as robust as JSON
                updateStatus('TXT-Import wird nicht unterstützt. Bitte verwenden Sie JSON-Dateien.');
            } else {
                throw new Error('Nicht unterstütztes Dateiformat');
            }
        } catch (error) {
            console.error('Fehler beim Importieren:', error);
            updateStatus('Fehler beim Importieren der Chat-Datei');
        }
    };
    
    reader.readAsText(file);
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

// Chat Storage Functions
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function saveChatToStorage() {
    try {
        const chatData = {
            history: chatHistory,
            lastSaved: new Date().toISOString(),
            sessionId: currentSessionId
        };
        localStorage.setItem('ollama_chat_history', JSON.stringify(chatData));
    } catch (error) {
        console.error('Fehler beim Speichern in localStorage:', error);
    }
}

function loadChatFromStorage() {
    try {
        const storedData = localStorage.getItem('ollama_chat_history');
        if (storedData) {
            const chatData = JSON.parse(storedData);
            chatHistory = chatData.history || [];
            currentSessionId = chatData.sessionId || generateSessionId();
            
            // Restore chat messages to UI
            const chatContainer = document.getElementById('chatHistory');
            chatContainer.innerHTML = '';
            
            chatHistory.forEach(message => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${message.sender}`;
                
                if (message.sender === 'assistant') {
                    messageDiv.innerHTML = message.content.replace(/\n/g, '<br>');
                } else {
                    messageDiv.textContent = message.content;
                }
                
                // Add timestamp
                const timestampSpan = document.createElement('span');
                timestampSpan.className = 'timestamp';
                timestampSpan.textContent = new Date(message.timestamp).toLocaleTimeString();
                messageDiv.appendChild(timestampSpan);
                
                chatContainer.appendChild(messageDiv);
            });
            
            chatContainer.scrollTop = chatContainer.scrollHeight;
            updateStatus(`Chat geladen (${chatHistory.length} Nachrichten)`);
        }
    } catch (error) {
        console.error('Fehler beim Laden aus localStorage:', error);
    }
}
