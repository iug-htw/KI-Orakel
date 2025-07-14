/**
 * KI Orakel für Karriereberatung in der Techindustrie
 * Stellt strukturierte Fragen und macht optimistische Vorhersagen
 */

class KIOracle {
    constructor() {
        this.allQuestions = [            {
                id: 1,
                text: "Wie gefällt Dir der Informatikunterricht?",
                type: "text",
                placeholder: "Beschreibe, wie Dir der Informatikunterricht gefällt und warum..."
            },
            {
                id: 2,
                text: "Was gefällt Dir am meisten im Informatikunterricht?",
                type: "text",
                placeholder: "Beschreibe, was Dir besonders Spaß macht..."
            },            {
                id: 3,
                text: "Programmierst Du gern?",
                type: "text",
                placeholder: "Erzähle, wie gern Du programmierst und warum..."
            },            {
                id: 4,
                text: "Programmierst Du gern in Gruppen?",
                type: "text",
                placeholder: "Beschreibe Deine Erfahrungen mit Programmieren in Gruppen..."
            },            {
                id: 5,
                text: "Ist Programmieren für Dich eine kreative Tätigkeit?",
                type: "text",
                placeholder: "Erkläre, inwiefern Programmieren für Dich kreativ ist..."
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
            },            {
                id: 8,
                text: "Inwiefern wurden Deine Erwartungen erfüllt?",
                type: "text",
                placeholder: "Beschreibe, ob und wie Deine Erwartungen erfüllt wurden..."
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
            },            {
                id: 12,
                text: "Wie gefallen Dir Gruppenarbeiten in Informatik?",
                type: "text",
                placeholder: "Erzähle von Deinen Erfahrungen mit Gruppenarbeiten in Informatik..."
            },
            {
                id: 14,
                text: "Gab es Unterschiede zwischen Jungs und Mädchen in der Zusammenarbeit?",
                type: "text",
                placeholder: "Teile Deine Beobachtungen..."
            },            {
                id: 15,
                text: "Wie war die Zusammenarbeit mit den Jungs?",
                type: "text",
                placeholder: "Beschreibe Deine Erfahrungen bei der Zusammenarbeit mit den Jungs..."
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
    }    getCurrentQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            return this.generatePrediction();
        }
        
        const question = this.questions[this.currentQuestionIndex];
        let questionText = `**Frage ${this.currentQuestionIndex + 1} von ${this.questions.length}:**\n\n`;
        questionText += `${question.text}\n\n`;
        questionText += question.placeholder;
        
        return questionText;
    }processAnswer(answer) {        if (!this.isOracleMode || this._isCompleted) {
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
    }    createOptimisticPrediction() {
        let prediction = `🌟 **DEINE MAGISCHE KARRIEREPROGNOSE** 🌟\n\n`;
        prediction += `Das KI-Orakel hat gesprochen und Deine Zukunft in der Techindustrie vorausgesagt!\n\n`;

        // Analyze answers for personalized prediction
        const answers = Object.values(this.answers);
        
        // Generate personalized career path based on actual answers
        let careerPath = this.determineCareerPathFromAnswers(answers);
        
        prediction += `🎯 **DEIN OPTIMALER KARRIEREWEG:**\n`;
        prediction += `${careerPath}\n\n`;

        prediction += `💫 **DEINE BESONDEREN STÄRKEN:**\n`;
        prediction += this.generateStrengthsFromAnswers(answers) + "\n\n";

        prediction += `🚀 **DEINE ZUKUNFTSAUSSICHTEN:**\n`;
        prediction += this.generateFuturePredictionFromAnswers(answers) + "\n\n";

        prediction += `💡 **EMPFOHLENE NÄCHSTE SCHRITTE:**\n`;
        prediction += this.generateRecommendationsFromAnswers(answers) + "\n\n";

        prediction += `🌈 **ABSCHLIESSENDE WEISHEIT:**\n`;
        prediction += `Die Sterne stehen günstig für Dich! Du hast das Zeug zu einer erfolgreichen Karriere in der Techindustrie. Vertraue auf Deine Fähigkeiten und wage große Schritte - die Zukunft gehört Dir! ✨`;

        return prediction;
    }    determineCareerPathFromAnswers(answers) {
        // Analyze answers for career path determination
        const allAnswers = answers.map(a => a.answer.toLowerCase()).join(' ');
        
        // Keywords for different career paths
        const keywordMap = {
            software: ['programmier', 'code', 'entwickl', 'app', 'software', 'algorithmus'],
            data: ['daten', 'analyse', 'statistik', 'big data', 'machine learning'],
            ui: ['design', 'kreativ', 'benutzer', 'interface', 'user experience'],
            security: ['sicher', 'schutz', 'hack', 'verschlüssel', 'firewall'],
            management: ['projekt', 'team', 'leitung', 'organisation', 'gruppe'],
            research: ['forsch', 'wissenschaft', 'innovation', 'experiment']
        };
        
        let maxScore = 0;
        let bestPath = 'software';
        
        Object.entries(keywordMap).forEach(([path, keywords]) => {
            const score = keywords.reduce((sum, keyword) => {
                return sum + (allAnswers.includes(keyword) ? 1 : 0);
            }, 0);
            
            if (score > maxScore) {
                maxScore = score;
                bestPath = path;
            }
        });
        
        const paths = {
            software: "**Software-Entwicklerin** - Du wirst innovative Apps und Systeme erschaffen, die das Leben von Millionen Menschen verbessern!",
            data: "**Data Scientists** - Du wirst mit Big Data arbeiten und bahnbrechende Erkenntnisse gewinnen!",
            ui: "**UX/UI-Designerin** - Deine kreative Ader wird in der Gestaltung benutzerfreundlicher Interfaces zum Tragen kommen!",
            security: "**Cybersecurity-Expertin** - Du wirst als digitale Heldin Unternehmen vor Cyberangriffen schützen!",
            management: "**Projektmanagerin** - Du wirst große Tech-Projekte leiten und Teams zum Erfolg führen!",
            research: "**KI-Entwicklerin** - Du wirst an der Spitze der technologischen Revolution stehen!"
        };
        
        return paths[bestPath];
    }    generateStrengthsFromAnswers(answers) {
        const strengths = [];
        const allAnswers = answers.map(a => a.answer.toLowerCase()).join(' ');
        
        // Analyze answers for strengths
        if (allAnswers.includes('kreativ') || allAnswers.includes('design')) {
            strengths.push("🎨 Kreative Herangehensweise an technische Herausforderungen");
        }
        if (allAnswers.includes('gruppe') || allAnswers.includes('team') || allAnswers.includes('zusammen')) {
            strengths.push("🤝 Hervorragende Teamarbeit-Fähigkeiten");
        }
        if (allAnswers.includes('herausfordernd') || allAnswers.includes('problem') || allAnswers.includes('lösung')) {
            strengths.push("💪 Starke Problemlösungsfähigkeiten");
        }
        if (allAnswers.includes('analyse') || allAnswers.includes('struktur') || allAnswers.includes('logik')) {
            strengths.push("🔥 Ausgeprägtes analytisches Denkvermögen");
        }
        
        // Always include at least 4 strengths
        const defaultStrengths = [
            "🔥 Ausgeprägtes analytisches Denkvermögen",
            "💪 Starke Problemlösungsfähigkeiten",
            "🎨 Kreative Herangehensweise an technische Herausforderungen",
            "🤝 Hervorragende Teamarbeit-Fähigkeiten",
            "🧠 Schnelle Auffassungsgabe für neue Technologien",
            "🎯 Zielorientierte Arbeitsweise"
        ];
        
        // Fill up to 4 strengths
        while (strengths.length < 4) {
            const randomStrength = defaultStrengths[Math.floor(Math.random() * defaultStrengths.length)];
            if (!strengths.includes(randomStrength)) {
                strengths.push(randomStrength);
            }
        }
        
        return strengths.slice(0, 4).join("\n");
    }    generateFuturePredictionFromAnswers(answers) {
        const predictions = [
            "📈 In 5 Jahren wirst Du in einem führenden Tech-Unternehmen arbeiten",
            "🏆 Du wirst für Deine innovativen Projekte Anerkennung erhalten",
            "💰 Dein Gehalt wird überdurchschnittlich sein",
            "🌍 Du wirst an Projekten mit globaler Reichweite arbeiten",
            "👥 Du wirst ein Team von talentierten Entwicklern leiten",
            "🔬 Du wirst zu technologischen Durchbrüchen beitragen"
        ];
        
        return predictions.slice(0, 3).join("\n");
    }    generateRecommendationsFromAnswers(answers) {
        const allAnswers = answers.map(a => a.answer.toLowerCase()).join(' ');
        const recommendations = [];
        
        // Personalized recommendations based on answers
        if (allAnswers.includes('programmier') || allAnswers.includes('code')) {
            recommendations.push("🎓 Vertiefe Dein Wissen in Deinen Lieblings-Programmiersprachen");
        }
        if (allAnswers.includes('projekt') || allAnswers.includes('team')) {
            recommendations.push("🏢 Sammle Praxiserfahrung durch Praktika oder Team-Projekte");
        }
        if (allAnswers.includes('kreativ') || allAnswers.includes('design')) {
            recommendations.push("🎨 Arbeite an kreativen Projekten und erstelle ein Portfolio");
        }
        
        // Always include these
        const defaultRecommendations = [
            "🔗 Baue ein starkes professionelles Netzwerk auf",
            "📖 Bleibe immer auf dem neuesten Stand der Technologie",
            "💡 Nimm an Hackathons und Coding-Wettbewerben teil",
            "🌐 Engagiere Dich in Open-Source-Projekten"
        ];
        
        // Fill up to 4 recommendations
        while (recommendations.length < 4) {
            const randomRec = defaultRecommendations[Math.floor(Math.random() * defaultRecommendations.length)];
            if (!recommendations.includes(randomRec)) {
                recommendations.push(randomRec);
            }
        }
        
        return recommendations.slice(0, 4).join("\n");
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
