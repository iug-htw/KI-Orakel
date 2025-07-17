/**
 * WORKSHOP-VERSION: KI Orakel für Karriereberatung
 * Diese Datei können die Teilnehmerinnen anpassen!
 */

class KIOracle {
    constructor() {
        // ===========================================
        // WORKSHOP-BEREICH: Hier können die Fragen angepasst werden!
        // ===========================================
        this.allQuestions = [            {
                id: 1,
                text: "Wie gefällt Dir der Informatikunterricht?",
                placeholder: "Beschreibe, wie Dir der Informatikunterricht gefällt und warum..."
            },
            {
                id: 2,
                text: "Was gefällt Dir am meisten im Informatikunterricht?",
                placeholder: "Beschreibe, was Dir besonders Spaß macht..."
            },            {
                id: 3,
                text: "Programmierst Du gern?",
                placeholder: "Erzähle, wie gern Du programmierst und warum..."
            },            {
                id: 4,
                text: "Programmierst Du gern in Gruppen?",
                placeholder: "Beschreibe Deine Erfahrungen mit Programmieren in Gruppen..."
            },            {
                id: 5,
                text: "Ist Programmieren für Dich eine kreative Tätigkeit?",
                placeholder: "Erkläre, inwiefern Programmieren für Dich kreativ ist..."
            },
            {
                id: 6,
                text: "Warum hast Du Informatik gewählt?",
                placeholder: "Erzähle von Deinen Beweggründen..."
            },
            {
                id: 7,
                text: "Was waren Deine Erwartungen an den Informatikunterricht?",
                placeholder: "Beschreibe Deine Erwartungen..."
            },            {
                id: 8,
                text: "Inwiefern wurden Deine Erwartungen an den Informatikunterricht erfüllt?",
                placeholder: "Beschreibe, ob und wie Deine Erwartungen erfüllt wurden..."
            },
            {
                id: 9,
                text: "Was sind typische Aufgabenstellungen im Informatikunterricht, die Dir Spaß machen?",
                placeholder: "Beschreibe Aufgaben, die Dir gefallen..."
            },
            {
                id: 10,
                text: "Welche Aufgaben im Informatikunterricht machen Dir keinen Spaß?",
                placeholder: "Beschreibe Aufgaben, die Dir weniger gefallen..."
            },
            {
                id: 11,
                text: "Welche Beispiele verwendet ihr im Informatikunterricht?",
                placeholder: "Erzähle von konkreten Beispielen und Projekten..."
            },            {
                id: 12,
                text: "Wie gefallen Dir Gruppenarbeiten in Informatik?",
                placeholder: "Erzähle von Deinen Erfahrungen mit Gruppenarbeiten in Informatik..."
            },
            {
                id: 14,
                text: "In Informatik arbeitet man häufig in Gruppen. Gab es Unterschiede zwischen Jungs und Mädchen in der Zusammenarbeit?",
                placeholder: "Teile Deine Beobachtungen..."
            },            {
                id: 15,
                text: "In Informatik arbeitet man häufig in Gruppen. Wie war die Zusammenarbeit mit den Jungs?",
                placeholder: "Beschreibe Deine Erfahrungen bei der Zusammenarbeit mit den Jungs..."
            },
            {
                id: 16,
                text: "Wer sind Deine Vorbilder in der Informatik?",
                placeholder: "Nenne Personen, die Dich inspirieren..."
            },
            {
                id: 17,
                text: "Wie stellst Du Dir das Berufsbild als Informatikerin vor?",
                placeholder: "Beschreibe Deine Vorstellungen vom Beruf..."
            }
        ];
        
        // ===========================================
        // WORKSHOP-EINSTELLUNGEN: Hier können die Teilnehmerinnen experimentieren!
        // ===========================================
        this.questions = []; // Wird mit zufälligen Fragen gefüllt
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.isOracleMode = false;
        this._isCompleted = false;
        this.maxQuestions = 5; // WORKSHOP: Hier kann die Anzahl der Fragen geändert werden!
    }

    selectRandomQuestions() {
        // Shuffle array and take first 5 questions
        const shuffled = [...this.allQuestions].sort(() => 0.5 - Math.random());
        this.questions = shuffled.slice(0, this.maxQuestions);
    }    startOracle() {        this.isOracleMode = true;
        this.currentQuestionIndex = 0;
        this.answers = {};
        this._isCompleted = false;
        this.selectRandomQuestions(); // Select 5 random questions
        return this.getWelcomeMessage();
    }

    getWelcomeMessage() {
        return `🔮 **Willkommen beim KI-Orakel für Karriereberatung!** 🔮

✨ Ich stelle Dir ${this.questions.length} Fragen zu Deinen Erfahrungen mit Informatik
✨ Basierend auf Deinen Antworten erstelle ich eine Karriereprognose

**Bist Du bereit, Deine technische Zukunft zu entdecken?**`;
    }    getCurrentQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            return this.generatePrediction();
        }
        
        const question = this.questions[this.currentQuestionIndex];
        let questionText = `**Frage ${this.currentQuestionIndex + 1} von ${this.questions.length}:**\n\n`;
        questionText += `${question.text}\n\n`;
        questionText += question.placeholder;
        
        return questionText;
    }

    async processAnswer(answer) {
        if (!this.isOracleMode || this._isCompleted) {
            return "Das Orakel ist nicht aktiv. Starte mit 'Orakel starten'!";
        }

        const question = this.questions[this.currentQuestionIndex];
        let processedAnswer = answer.trim();

        // Check if answer is not empty
        if (!processedAnswer) {
            return "Bitte gib eine Antwort ein.";
        }

        // Store answer
        this.answers[question.id] = {
            question: question.text,
            answer: processedAnswer
        };

        this.currentQuestionIndex++;

        // Check if we're done - ABER NOCH KEINE PROGNOSE GENERIEREN
        if (this.currentQuestionIndex >= this.questions.length) {
            this._isCompleted = true;
            // Einfach einen Platzhalter zurückgeben - die Prognose wird später generiert
            return "ALLE_FRAGEN_BEANTWORTET";
        }

        // Return next question
        return this.getCurrentQuestion();
    }

    async generatePrediction() {
        const prediction = await this.createOptimisticPrediction();
        this.isOracleMode = false;
        return prediction;
    }    async createOptimisticPrediction() {
        // Prepare the prompt for the Ollama API
        const prompt = this.buildPredictionPrompt();
        
        try {
            // Call Ollama API to generate the prediction
            const prediction = await this.callOllamaForPrediction(prompt);
            return prediction;
        } catch (error) {
            console.error('Error generating prediction with Ollama:', error);
            // Fallback to local prediction if API fails
            return this.createFallbackPrediction();
        }
    }

    buildPredictionPrompt() {
        let prompt = `Du bist ein KI-Orakel für Karriereberatung in der Techindustrie. Erstelle eine optimistische, personalisierte Karriereprognose basierend auf den folgenden Fragen und Antworten einer Schülerin:\n\n`;
        
        // Alle Fragen und Antworten für besseren Kontext
        this.questions.forEach((question, index) => {
            const answer = this.answers[question.id];
            prompt += `${index + 1}. ${question.text}\n`;
            prompt += `Antwort: ${answer ? answer.answer : 'Nicht beantwortet'}\n\n`;
        });
        
        prompt += `Erstelle eine magische Karriereprognose mit folgender Struktur:
🌟 **DEINE MAGISCHE KARRIEREPROGNOSE** 🌟

Das KI-Orakel hat gesprochen und Deine Zukunft in der Techindustrie vorausgesagt!

🎯 **DEIN OPTIMALER KARRIEREWEG:**
[Wähle basierend auf den Antworten einen passenden Karriereweg wie Software-Entwicklerin, UX/UI-Designerin, Data Scientist, Cybersecurity-Expertin, Projektmanagerin, oder KI-Entwicklerin und begründe die Wahl kurz]


🚀 **DEINE ZUKUNFTSAUSSICHTEN:**
[3 optimistische Vorhersagen für die nächsten 5 Jahre, verwende Emojis wie 📈 🏆 💰 🌍 👥 �]

�💡 **EMPFOHLENE NÄCHSTE SCHRITTE:**
[2 konkrete, personalisierte Empfehlungen basierend auf den Antworten, verwende Emojis wie 🎓 🔗 🎨 📖 💡 �]

�🌈 **ABSCHLIESSENDE WEISHEIT:**
Die Sterne stehen günstig für Dich! Du hast das Zeug zu einer erfolgreichen Karriere in der Techindustrie. Vertraue auf Deine Fähigkeiten und wage große Schritte - die Zukunft gehört Dir! ✨

Wichtig: Sei sehr optimistisch und ermutigend. Verwende die gegebenen Antworten, um die Vorhersage zu personalisieren. Schreibe auf Deutsch und verwende die Du-Form.`;
        
        return prompt;
    }

    async callOllamaForPrediction(prompt) {
        const OLLAMA_BASE_URL = 'https://f2ki-h100-1.f2.htw-berlin.de:11435';
        const FIXED_MODEL = 'llama3.1:8b';
        
        const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: FIXED_MODEL,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                stream: false
            }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.message?.content || 'Keine Antwort erhalten';
    }

    createFallbackPrediction() {
        let prediction = `🌟 **DEINE MAGISCHE KARRIEREPROGNOSE** 🌟\n\n`;
        prediction += `Das KI-Orakel hat gesprochen und Deine Zukunft in der Techindustrie vorausgesagt!\n\n`;

        prediction += `🎯 **DEIN OPTIMALER KARRIEREWEG:**\n`;
        prediction += `**Software-Entwicklerin** - Du wirst innovative Apps und Systeme erschaffen, die das Leben von Millionen Menschen verbessern!\n\n`;

        prediction += `🌈 **ABSCHLIESSENDE WEISHEIT:**\n`;
        prediction += `Die Sterne stehen günstig für Dich! Du hast das Zeug zu einer erfolgreichen Karriere in der Techindustrie. Vertraue auf Deine Fähigkeiten und wage große Schritte - die Zukunft gehört Dir! ✨`;

        return prediction;
    }



    isInOracleMode() {
        return this.isOracleMode;
    }

    get isCompleted() {
        return this._isCompleted;
    }

    getProgress() {
        return {
            current: this.currentQuestionIndex,
            total: this.questions.length,
            percentage: Math.round((this.currentQuestionIndex / this.questions.length) * 100)
        };
    }    resetOracle() {
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.isOracleMode = false;
        this._isCompleted = false;
    }
}

// Export for use in other files
window.KIOracle = KIOracle;
