# 🎓 KI-Orakel Workshop - Anpassungsanleitung

## 📁 Datei-Struktur

### ❌ **NICHT ÄNDERN** (Core-Funktionen):
- `core.js` - Basis-Funktionen für Chat und API-Kommunikation
- `chatStorage.js` - Speicher-Funktionen
- `index.html` - HTML-Struktur (nur CSS-Klassen ändern erlaubt)

### ✅ **DÜRFEN GEÄNDERT WERDEN**:
- `main.js` - Hauptfunktionen für das Oracle
- `kiOracle.js` - Fragen und KI-Prompts
- `style.css` - Alle Styling-Anpassungen

## 🎯 Workshop-Aufgaben

### 1. **Einfache Anpassungen** (15 min)
- Ändere die Anzahl der Fragen in `kiOracle.js` (Zeile 103: `this.maxQuestions = 5`)
- Passe die Begrüßungsnachricht an (Zeile 119-125 in `kiOracle.js`)
- Ändere die Farben der Progress Bar in `style.css`

### 2. **Mittlere Anpassungen** (30 min)
- Füge neue Fragen zu `this.allQuestions` hinzu
- Ändere den KI-Prompt für personalisierte Prognosen (Zeile 194+ in `kiOracle.js`)
- Passe die Fallback-Prognose an (Zeile 257+ in `kiOracle.js`)

### 3. **Erweiterte Anpassungen** (45 min)
- Erstelle eine Zusammenfassung nach der Prognose in `main.js`
- Füge eine Bewertungsfunktion hinzu
- Experimentiere mit verschiedenen KI-Modellen

## 🔧 Wichtige Funktionen in `main.js`

### Anpassbar für Workshop:
```javascript
// Oracle-Session starten
function startOracleSession() {
    // Hier können Anpassungen vorgenommen werden
}

// Oracle-Antwort verarbeiten
async function handleOracleResponse(answer) {
    // Verarbeitung der Benutzerantworten
}

// Oracle-Session beenden
function finishOracleSession() {
    // Was passiert nach der Prognose?
}
```

## 📝 Beispiel-Anpassungen

### Anzahl Fragen ändern:
```javascript
// In kiOracle.js, Zeile 103
this.maxQuestions = 3; // Statt 5
```

### Neue Frage hinzufügen:
```javascript
// In kiOracle.js, in this.allQuestions Array
{
    id: 18,
    text: "Was ist Dein Lieblings-Programmier-Tool?",
    type: "text",
    placeholder: "Beschreibe Dein bevorzugtes Tool..."
}
```

### Farben ändern:
```css
/* In style.css */
.progress-fill {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4); /* Neue Farben */
}
```

## 🚀 Testen

1. Öffne `index.html` im Browser
2. Klicke auf "KI-Orakel starten"
3. Beantworte die Fragen
4. Sieh Dir die generierte Prognose an

## 💡 Tipps

- Immer `Strg+F5` drücken, um den Browser-Cache zu leeren
- Die Konsole öffnen (`F12`) um Fehler zu sehen
- Kleine Änderungen testen, bevor große Änderungen gemacht werden
- Bei Problemen: Auf GitHub die ursprüngliche Version wiederherstellen

## 🆘 Hilfe

- Core-Funktionen sind in `core.js` - nicht ändern!
- Alle anpassbaren Funktionen sind in `main.js` kommentiert
- Bei Fehlern: Browser-Konsole prüfen (`F12`)
