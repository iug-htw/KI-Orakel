/**
 * Chat Storage Manager
 * Handles all chat storage operations including localStorage and file export/import
 */

class ChatStorageManager {
    constructor() {
        this.storageKey = 'ollama_chat_history';
        this.saveCounter = 0;
        this.autoSaveEnabled = true;
    }

    /**
     * Generate a unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Save chat history to localStorage
     */
    saveChatToStorage(chatHistory, sessionId) {
        try {
            const chatData = {
                history: chatHistory,
                lastSaved: new Date().toISOString(),
                sessionId: sessionId
            };
            localStorage.setItem(this.storageKey, JSON.stringify(chatData));
        } catch (error) {
            console.error('Fehler beim Speichern in localStorage:', error);
        }
    }

    /**
     * Load chat history from localStorage
     */
    loadChatFromStorage() {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            if (storedData) {
                const chatData = JSON.parse(storedData);
                return {
                    history: chatData.history || [],
                    sessionId: chatData.sessionId || this.generateSessionId(),
                    lastSaved: chatData.lastSaved
                };
            }
        } catch (error) {
            console.error('Fehler beim Laden aus localStorage:', error);
        }
        return null;
    }

    /**
     * Auto-save chat to file
     */
    autoSaveChatToFile(chatHistory, sessionId, statusCallback) {
        if (!this.autoSaveEnabled || chatHistory.length === 0) {
            return;
        }

        this.saveCounter++;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `chats/chat_${sessionId}_${timestamp}.json`;

        const exportData = {
            autoSaved: true,
            saveNumber: this.saveCounter,
            saveDate: new Date().toISOString(),
            sessionId: sessionId,
            chatHistory: chatHistory,
            totalMessages: chatHistory.length
        };

        this._downloadFile(exportData, filename, 'application/json');

        // Show notification
        if (statusCallback) {
            const originalText = statusCallback.getStatus();
            statusCallback.setStatus(`Auto-gespeichert (${this.saveCounter})`);
            setTimeout(() => {
                statusCallback.setStatus(originalText);
            }, 2000);
        }
    }

    /**
     * Export chat manually (JSON + TXT)
     */
    exportChat(chatHistory, sessionId, statusCallback) {
        if (chatHistory.length === 0) {
            if (statusCallback) {
                statusCallback.setStatus('Keine Chat-Historie zum Exportieren vorhanden');
            }
            return;
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            sessionId: sessionId,
            chatHistory: chatHistory,
            totalMessages: chatHistory.length,
            manualExport: true
        };

        // Create JSON file
        const jsonFilename = `chats/manual_export_${sessionId}_${new Date().toISOString().split('T')[0]}.json`;
        this._downloadFile(exportData, jsonFilename, 'application/json');

        // Create TXT file
        const txtContent = this._createTextExport(chatHistory, sessionId);
        const txtFilename = `chats/manual_export_${sessionId}_${new Date().toISOString().split('T')[0]}.txt`;
        this._downloadFile(txtContent, txtFilename, 'text/plain');

        if (statusCallback) {
            statusCallback.setStatus('Chat manuell exportiert (JSON & TXT)');
        }
    }

    /**
     * Import chat from file
     */
    importChat(file, confirmCallback, successCallback, errorCallback) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let importedData;

                if (file.name.endsWith('.json')) {
                    importedData = JSON.parse(e.target.result);

                    // Validate JSON structure
                    if (!importedData.chatHistory || !Array.isArray(importedData.chatHistory)) {
                        throw new Error('Ungültiges JSON-Format');
                    }

                    // Confirm import
                    const confirmMessage = `Chat importieren?\n\nDies wird den aktuellen Chat ersetzen.\n\nImportierte Nachrichten: ${importedData.chatHistory.length}\nSession ID: ${importedData.sessionId || 'Unbekannt'}`;
                    
                    if (confirmCallback && confirmCallback(confirmMessage)) {
                        const result = {
                            history: importedData.chatHistory,
                            sessionId: importedData.sessionId || this.generateSessionId()
                        };
                        
                        if (successCallback) {
                            successCallback(result, `Chat importiert (${importedData.chatHistory.length} Nachrichten)`);
                        }
                    }
                } else if (file.name.endsWith('.txt')) {
                    if (errorCallback) {
                        errorCallback('TXT-Import wird nicht unterstützt. Bitte verwenden Sie JSON-Dateien.');
                    }
                } else {
                    throw new Error('Nicht unterstütztes Dateiformat');
                }
            } catch (error) {
                console.error('Fehler beim Importieren:', error);
                if (errorCallback) {
                    errorCallback('Fehler beim Importieren der Chat-Datei');
                }
            }
        };

        reader.readAsText(file);
    }

    /**
     * Set auto-save enabled/disabled
     */
    setAutoSaveEnabled(enabled) {
        this.autoSaveEnabled = enabled;
    }

    /**
     * Get auto-save status
     */
    isAutoSaveEnabled() {
        return this.autoSaveEnabled;
    }

    /**
     * Get save counter
     */
    getSaveCounter() {
        return this.saveCounter;
    }

    /**
     * Reset save counter
     */
    resetSaveCounter() {
        this.saveCounter = 0;
    }

    /**
     * Private method to create text export
     */
    _createTextExport(chatHistory, sessionId) {
        let txtContent = `Ollama Chat Export\n`;
        txtContent += `Exportiert am: ${new Date().toLocaleString()}\n`;
        txtContent += `Session ID: ${sessionId}\n`;
        txtContent += `Anzahl Nachrichten: ${chatHistory.length}\n`;
        txtContent += `\n${'='.repeat(50)}\n\n`;

        chatHistory.forEach((message, index) => {
            txtContent += `[${new Date(message.timestamp).toLocaleString()}] ${message.sender.toUpperCase()}:\n`;
            txtContent += `${message.content}\n\n`;
        });

        return txtContent;
    }

    /**
     * Private method to download file
     */
    _downloadFile(data, filename, mimeType) {
        const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        URL.revokeObjectURL(url);
    }
}

// Export for use in other files
window.ChatStorageManager = ChatStorageManager;
