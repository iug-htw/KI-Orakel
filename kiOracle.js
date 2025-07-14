/**
 * KI Orakel für Karriereberatung in der Techindustrie
 * Stellt strukturierte Fragen und macht optimistische Vorhersagen
 */

class KIOracle {
    constructor() {
        this.allQuestions = [
            {
                id: 1,
                text: "Wie gefällt Dir der Informatikunterricht?",
                type: "rating",
                options: ["Sehr gut", "Gut", "Mittelmäßig", "Nicht so gut", "Gar nicht"]
            },
            {
                id: 2,
                text: "Was gefällt Dir am meisten im Informatikunterricht?",
                type: "text",
                placeholder: "Beschreibe, was Dir besonders Spaß macht..."
            },
            {
                id: 3,
                text: "Programmierst Du gern?",
                type: "rating",
                options: ["Sehr gern", "Gern", "Geht so", "Nicht besonders", "Überhaupt nicht"]
            },
            {
                id: 4,
                text: "Programmierst Du gern in Gruppen?",
                type: "rating",
                options: ["Sehr gern", "Gern", "Geht so", "Lieber allein", "Gar nicht gern"]
            },
            {
                id: 5,
                text: "Ist Programmieren für Dich eine kreative Tätigkeit?",
                type: "rating",
                options: ["Sehr kreativ", "Kreativ", "Teilweise", "Wenig kreativ", "Nicht kreativ"]
            },
            {
                id: 6,
                text: "Warum hast Du Informatik gewählt?",
                type: "text",
                placeholder: "Erzähle von Deinen Beweggründen..."
            },
            {
                id: 7,
                text: "Was waren Deine Erwartungen an den Informatikunterricht?",
                type: "text",
                placeholder: "Beschreibe Deine Erwartungen..."
            },
            {
                id: 8,
                text: "Inwiefern wurden Deine Erwartungen erfüllt?",
                type: "rating",
                options: ["Voll erfüllt", "Größtenteils erfüllt", "Teilweise erfüllt", "Wenig erfüllt", "Nicht erfüllt"]
            },
            {
                id: 9,
                text: "Was sind typische Aufgabenstellungen im Informatikunterricht, die Dir Spaß machen?",
                type: "text",
                placeholder: "Beschreibe Aufgaben, die Dir gefallen..."
            },
            {
                id: 10,
                text: "Welche Aufgaben machen Dir keinen Spaß?",
                type: "text",
                placeholder: "Beschreibe Aufgaben, die Dir weniger gefallen..."
            },
            {
                id: 11,
                text: "Welche Beispiele verwendet ihr im Informatikunterricht?",
                type: "text",
                placeholder: "Erzähle von konkreten Beispielen und Projekten..."
            },
            {
                id: 12,
                text: "Wie gefallen Dir Gruppenarbeiten in Informatik?",
                type: "rating",
                options: ["Sehr gut", "Gut", "Geht so", "Nicht so gut", "Gar nicht"]
            },
            {
                id: 13,
                text: "Wer waren die Personen in Deiner Gruppe?",
                type: "text",
                placeholder: "Beschreibe Deine Gruppenmitglieder..."
            },
            {
                id: 14,
                text: "Gab es Unterschiede zwischen Jungs und Mädchen in der Zusammenarbeit?",
                type: "text",
                placeholder: "Teile Deine Beobachtungen..."
            },
            {
                id: 15,
                text: "Wie war die Zusammenarbeit mit den Jungs?",
                type: "rating",
                options: ["Sehr gut", "Gut", "Geht so", "Schwierig", "Sehr schwierig"]
            },
            {
                id: 16,
                text: "Wer sind Deine Vorbilder in der Informatik?",
                type: "text",
                placeholder: "Nenne Personen, die Dich inspirieren..."
            },
            {
                id: 17,
                text: "Wie stellst Du Dir das Berufsbild als Informatikerin vor?",
                type: "text",
                placeholder: "Beschreibe Deine Vorstellungen vom Beruf..."
            }
        ];
          this.questions = []; // Will be filled with 5 random questions
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.isOracleMode = false;
        this._isCompleted = false;
        this.maxQuestions = 5;
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

Ich bin das mystische KI-Orakel und werde Dir dabei helfen, Deine Zukunft in der Techindustrie zu erkunden! 

✨ Ich stelle Dir ${this.questions.length} Fragen zu Deinen Erfahrungen mit Informatik
✨ Basierend auf Deinen Antworten erstelle ich eine optimistische Karriereprognose
✨ Du wirst überrascht sein, welche großartigen Möglichkeiten auf Dich warten!

**Bist Du bereit, Deine technische Zukunft zu entdecken?**

Antworte einfach mit "Ja" oder "Start", um zu beginnen! 🚀`;
    }

    getCurrentQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            return this.generatePrediction();
        }
        
        const question = this.questions[this.currentQuestionIndex];
        let questionText = `**Frage ${this.currentQuestionIndex + 1} von ${this.questions.length}:**\n\n`;
        questionText += `${question.text}\n\n`;
        
        if (question.type === "rating") {
            questionText += "Wähle eine der folgenden Optionen:\n";
            question.options.forEach((option, index) => {
                questionText += `${index + 1}. ${option}\n`;
            });
            questionText += "\nGib die Nummer Deiner Wahl ein (1-" + question.options.length + ")";
        } else {
            questionText += question.placeholder;
        }
        
        return questionText;
    }

    processAnswer(answer) {        if (!this.isOracleMode || this._isCompleted) {
            return "Das Orakel ist nicht aktiv. Starte mit 'Orakel starten'!";
        }

        const question = this.questions[this.currentQuestionIndex];
        let processedAnswer = answer.trim();

        // Validate rating answers
        if (question.type === "rating") {
            const choice = parseInt(answer);
            if (choice >= 1 && choice <= question.options.length) {
                processedAnswer = question.options[choice - 1];
            } else {
                return `Bitte wähle eine gültige Option (1-${question.options.length})`;
            }
        }

        // Store answer
        this.answers[question.id] = {
            question: question.text,
            answer: processedAnswer,
            type: question.type
        };

        this.currentQuestionIndex++;        // Check if we're done
        if (this.currentQuestionIndex >= this.questions.length) {
            this._isCompleted = true;
            return this.generatePrediction();
        }

        // Return next question
        return this.getCurrentQuestion();
    }

    generatePrediction() {
        const prediction = this.createOptimisticPrediction();
        this.isOracleMode = false;
        return prediction;
    }

    createOptimisticPrediction() {
        let prediction = `🌟 **DEINE MAGISCHE KARRIEREPROGNOSE** 🌟\n\n`;
        prediction += `Das KI-Orakel hat gesprochen und Deine Zukunft in der Techindustrie vorausgesagt!\n\n`;

        // Analyze answers for personalized prediction
        const positiveAnswers = Object.values(this.answers).filter(a => 
            a.type === "rating" && (a.answer.includes("Sehr") || a.answer.includes("Gern"))
        ).length;

        const creativityAnswer = this.answers[5]?.answer || "";
        const motivationAnswer = this.answers[6]?.answer || "";
        const expectationsAnswer = this.answers[8]?.answer || "";

        // Generate personalized career path
        let careerPath = this.determineCareerPath(positiveAnswers, creativityAnswer, motivationAnswer);
        
        prediction += `🎯 **DEIN OPTIMALER KARRIEREWEG:**\n`;
        prediction += `${careerPath}\n\n`;

        prediction += `💫 **DEINE BESONDEREN STÄRKEN:**\n`;
        prediction += this.generateStrengths() + "\n\n";

        prediction += `🚀 **DEINE ZUKUNFTSAUSSICHTEN:**\n`;
        prediction += this.generateFuturePrediction() + "\n\n";

        prediction += `💡 **EMPFOHLENE NÄCHSTE SCHRITTE:**\n`;
        prediction += this.generateRecommendations() + "\n\n";

        prediction += `🌈 **ABSCHLIESSENDE WEISHEIT:**\n`;
        prediction += `Die Sterne stehen günstig für Dich! Du hast das Zeug zu einer erfolgreichen Karriere in der Techindustrie. Vertraue auf Deine Fähigkeiten und wage große Schritte - die Zukunft gehört Dir! ✨`;

        return prediction;
    }

    determineCareerPath(positiveAnswers, creativity, motivation) {
        const paths = [
            "**Software-Entwicklerin** - Du wirst innovative Apps und Systeme erschaffen, die das Leben von Millionen Menschen verbessern!",
            "**UX/UI-Designerin** - Deine kreative Ader wird in der Gestaltung benutzerfreundlicher Interfaces zum Tragen kommen!",
            "**Data Scientists** - Du wirst mit Big Data arbeiten und bahnbrechende Erkenntnisse gewinnen!",
            "**Cybersecurity-Expertin** - Du wirst als digitale Heldin Unternehmen vor Cyberangriffen schützen!",
            "**KI-Entwicklerin** - Du wirst an der Spitze der technologischen Revolution stehen!",
            "**Tech-Unternehmerin** - Du wirst Dein eigenes Startup gründen und die Welt verändern!",
            "**Projektmanagerin** - Du wirst große Tech-Projekte leiten und Teams zum Erfolg führen!",
            "**DevOps-Engineerin** - Du wirst die Brücke zwischen Entwicklung und Betrieb sein!"
        ];

        const index = Math.min(positiveAnswers, paths.length - 1);
        return paths[index];
    }

    generateStrengths() {
        const strengths = [
            "🔥 Ausgeprägtes analytisches Denkvermögen",
            "💪 Starke Problemlösungsfähigkeiten",
            "🎨 Kreative Herangehensweise an technische Herausforderungen",
            "🤝 Hervorragende Teamarbeit-Fähigkeiten",
            "🧠 Schnelle Auffassungsgabe für neue Technologien",
            "🎯 Zielorientierte Arbeitsweise",
            "🌟 Natürliche Führungsqualitäten",
            "🔧 Praktische Umsetzungsstärke"
        ];

        return strengths.slice(0, 4).join("\n");
    }

    generateFuturePrediction() {
        const predictions = [
            "📈 In 5 Jahren wirst Du in einem führenden Tech-Unternehmen arbeiten",
            "🏆 Du wirst für Deine innovativen Projekte Anerkennung erhalten",
            "💰 Dein Gehalt wird überdurchschnittlich sein",
            "🌍 Du wirst an Projekten mit globaler Reichweite arbeiten",
            "👥 Du wirst ein Team von talentierten Entwicklern leiten",
            "📚 Du wirst regelmäßig auf Konferenzen als Expertin sprechen",
            "🔬 Du wirst zu technologischen Durchbrüchen beitragen",
            "🎖️ Du wirst als Vorbild für andere Frauen in der Tech-Branche dienen"
        ];

        return predictions.slice(0, 3).join("\n");
    }

    generateRecommendations() {
        const recommendations = [
            "🎓 Vertiefe Dein Wissen in Deinen Lieblings-Programmiersprachen",
            "🔗 Baue ein starkes professionelles Netzwerk auf",
            "📱 Arbeite an eigenen Projekten und erstelle ein Portfolio",
            "📖 Bleibe immer auf dem neuesten Stand der Technologie",
            "👥 Suche Dir eine Mentorin in der Tech-Branche",
            "🏢 Sammle Praxiserfahrung durch Praktika oder Nebenjobs",
            "💡 Nimm an Hackathons und Coding-Wettbewerben teil",
            "🌐 Engagiere Dich in Open-Source-Projekten"
        ];

        return recommendations.slice(0, 4).join("\n");
    }    isInOracleMode() {
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
