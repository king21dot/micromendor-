// Global variables
let moodData = JSON.parse(localStorage.getItem('moodData')) || [];
let moodChart = null;
let selectedCharacter = localStorage.getItem('selectedCharacter') || 'buddy';

// Simple sentiment analysis using keyword matching
const positiveWords = ['happy', 'joy', 'excited', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic', 'excellent', 'good', 'love', 'perfect', 'beautiful', 'brilliant', 'outstanding', 'superb', 'delighted', 'thrilled', 'content', 'satisfied', 'grateful', 'blessed', 'lucky', 'hopeful', 'optimistic', 'confident', 'proud', 'accomplished', 'successful', 'motivated', 'energetic', 'refreshed', 'relaxed', 'peaceful', 'calm', 'serene'];

const negativeWords = ['sad', 'angry', 'frustrated', 'upset', 'terrible', 'awful', 'horrible', 'bad', 'hate', 'annoyed', 'irritated', 'disappointed', 'worried', 'anxious', 'stressed', 'depressed', 'lonely', 'tired', 'exhausted', 'overwhelmed', 'confused', 'lost', 'hopeless', 'discouraged', 'afraid', 'scared', 'nervous', 'embarrassed', 'ashamed', 'guilty', 'regret', 'hurt', 'pain', 'suffering', 'miserable', 'devastated'];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    updateProgressTab();
});

// Initialize app functionality
function initializeApp() {
    // Initialize character selection
    initializeCharacters();
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.target.getAttribute('onclick').match(/showTab\('(.+)'\)/)[1];
            showTab(tabId);
        });
    });

    // Stress level slider
    const stressSlider = document.getElementById('stress-level');
    const stressValue = document.getElementById('stress-value');
    
    stressSlider.addEventListener('input', function() {
        stressValue.textContent = this.value;
        updateCharacterMessage('slider', this.value);
    });

    // Mood form submission
    document.getElementById('mood-form').addEventListener('submit', handleMoodSubmission);

    // Data management
    document.getElementById('clear-data-btn').addEventListener('click', showClearConfirmation);
    document.getElementById('confirm-clear-btn').addEventListener('click', clearAllData);
}

// Tab switching functionality
function showTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    
    // Add active to corresponding button
    event.target.classList.add('active');
    
    // Update progress tab when switched to
    if (tabId === 'progress') {
        updateProgressTab();
    }
}

// Handle mood form submission
function handleMoodSubmission(e) {
    e.preventDefault();
    
    const moodText = document.getElementById('mood-text').value.trim();
    const stressLevel = parseInt(document.getElementById('stress-level').value);
    
    if (!moodText) {
        alert('Please describe your mood before submitting.');
        return;
    }
    
    // Analyze sentiment
    const sentimentResult = analyzeSentiment(moodText);
    
    // Create mood entry
    const moodEntry = {
        timestamp: new Date().toISOString(),
        moodText: moodText,
        stressLevel: stressLevel,
        sentimentScore: sentimentResult.score,
        sentimentLabel: sentimentResult.label,
        sentimentPolarity: sentimentResult.polarity
    };
    
    // Add to data and save
    moodData.push(moodEntry);
    saveMoodData();
    
    // Display results
    displayMoodResults(moodEntry);
    
    // Clear form
    document.getElementById('mood-form').reset();
    document.getElementById('stress-value').textContent = '5';
}

// Analyze sentiment using simple keyword matching
function analyzeSentiment(text) {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
        // Remove punctuation for better matching
        const cleanWord = word.replace(/[^\w]/g, '');
        
        if (positiveWords.includes(cleanWord)) {
            positiveCount++;
        } else if (negativeWords.includes(cleanWord)) {
            negativeCount++;
        }
    });
    
    // Calculate score
    const totalWords = words.length;
    const score = positiveCount - negativeCount;
    
    // Convert to polarity (-1 to 1 scale)
    let polarity;
    if (totalWords > 0) {
        polarity = Math.max(-1, Math.min(1, score / Math.max(totalWords / 3, 1)));
    } else {
        polarity = 0;
    }
    
    let label;
    if (polarity >= 0.3) {
        label = 'Positive';
    } else if (polarity <= -0.3) {
        label = 'Negative';
    } else {
        label = 'Neutral';
    }
    
    return {
        score: score,
        polarity: polarity,
        label: label
    };
}

// Display mood analysis results
function displayMoodResults(entry) {
    const resultsDiv = document.getElementById('mood-results');
    
    // Update character response based on sentiment
    updateCharacterResponse(entry.sentimentLabel, entry.sentimentPolarity, entry.stressLevel);
    
    // Update metrics
    document.getElementById('sentiment-label').textContent = entry.sentimentLabel;
    document.getElementById('sentiment-score').textContent = entry.sentimentPolarity.toFixed(2);
    document.getElementById('stress-display').textContent = entry.stressLevel;
    
    // Generate and display microtasks
    const tasks = generateMicrotasks(entry.sentimentPolarity, entry.stressLevel, entry.moodText);
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${index + 1}.</strong> ${task}`;
        taskList.appendChild(li);
    });
    
    // Show results
    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Generate personalized microtasks
function generateMicrotasks(sentimentPolarity, stressLevel, moodText) {
    let tasks = [];
    
    // High stress level tasks
    if (stressLevel >= 7) {
        tasks.push(
            "🫁 Take 5 deep breaths using the 4-7-8 technique (inhale 4, hold 7, exhale 8)",
            "🚶‍♀️ Take a 5-minute walk outside or around your room",
            "🎵 Listen to one calming song and focus only on the music",
            "💧 Drink a glass of water slowly and mindfully"
        );
    }
    
    // Negative sentiment tasks
    if (sentimentPolarity < -0.2) {
        tasks.push(
            "📝 Write down 3 things you're grateful for today",
            "🤗 Give yourself a 30-second hug or stretch",
            "📞 Send a quick message to someone you care about",
            "🌱 Do a 2-minute guided breathing exercise"
        );
    }
    
    // Neutral/positive sentiment tasks for growth
    if (sentimentPolarity >= -0.2) {
        tasks.push(
            "📄 Update one line of your resume or LinkedIn profile",
            "💻 Practice coding for 10 minutes (try a simple problem)",
            "📚 Read one article about a topic you're interested in",
            "🎯 Set one small goal for tomorrow"
        );
    }
    
    // Career development tasks
    const careerTasks = [
        "✍️ Write a 50-word reflection on what you learned today",
        "🔍 Research one company or career path you're curious about",
        "💼 Practice answering one interview question out loud",
        "🌟 Identify one skill you want to develop this month"
    ];
    
    // Energy-based tasks
    const moodLower = moodText.toLowerCase();
    if (moodLower.includes('tired') || moodLower.includes('exhausted')) {
        tasks.push(
            "😴 Take a 5-minute power nap or rest with eyes closed",
            "☕ Make yourself a warm drink mindfully",
            "🧘‍♀️ Do gentle neck and shoulder stretches"
        );
    } else if (moodLower.includes('energetic') || moodLower.includes('excited')) {
        tasks.push(
            "🏃‍♂️ Do 10 jumping jacks or pushups",
            "🎨 Spend 5 minutes on a creative activity",
            "📝 Brainstorm ideas for a project you're excited about"
        );
    }
    
    // Add career tasks to the pool
    tasks.push(...careerTasks);
    
    // Return 3 random suggestions
    const shuffled = tasks.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

// Update progress tab
function updateProgressTab() {
    updateStatistics();
    updateChart();
    updateRecentEntries();
}

// Update statistics display
function updateStatistics() {
    const totalEntries = moodData.length;
    
    if (totalEntries === 0) {
        document.getElementById('total-entries').textContent = '0';
        document.getElementById('avg-sentiment').textContent = '0.00';
        document.getElementById('avg-stress').textContent = '0.0';
        document.getElementById('recent-trend').textContent = '📊 Starting';
        return;
    }
    
    const avgSentiment = moodData.reduce((sum, entry) => sum + entry.sentimentPolarity, 0) / totalEntries;
    const avgStress = moodData.reduce((sum, entry) => sum + entry.stressLevel, 0) / totalEntries;
    
    let recentTrend = '📊 Stable';
    if (totalEntries >= 2) {
        const lastEntry = moodData[moodData.length - 1];
        const secondLastEntry = moodData[moodData.length - 2];
        if (lastEntry.sentimentPolarity > secondLastEntry.sentimentPolarity) {
            recentTrend = '📈 Improving';
        } else if (lastEntry.sentimentPolarity < secondLastEntry.sentimentPolarity) {
            recentTrend = '📉 Declining';
        }
    }
    
    document.getElementById('total-entries').textContent = totalEntries;
    document.getElementById('avg-sentiment').textContent = avgSentiment.toFixed(2);
    document.getElementById('avg-stress').textContent = avgStress.toFixed(1);
    document.getElementById('recent-trend').textContent = recentTrend;
}

// Update mood chart
function updateChart() {
    const ctx = document.getElementById('mood-chart').getContext('2d');
    
    if (moodChart) {
        moodChart.destroy();
    }
    
    if (moodData.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('No mood data available yet. Start tracking your mood to see your progress!', 
                     ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    const sortedData = [...moodData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedData.map(entry => {
                const date = new Date(entry.timestamp);
                return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }),
            datasets: [{
                label: 'Sentiment Score',
                data: sortedData.map(entry => entry.sentimentPolarity),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.1,
                yAxisID: 'y'
            }, {
                label: 'Stress Level',
                data: sortedData.map(entry => entry.stressLevel),
                borderColor: '#ff7f0e',
                backgroundColor: 'rgba(255, 127, 14, 0.1)',
                tension: 0.1,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date & Time'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Sentiment Score'
                    },
                    min: -1,
                    max: 1,
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Stress Level'
                    },
                    min: 0,
                    max: 10,
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

// Update recent entries display
function updateRecentEntries() {
    const entriesList = document.getElementById('entries-list');
    
    if (moodData.length === 0) {
        entriesList.innerHTML = '<p>No mood entries available yet. Start tracking your mood!</p>';
        return;
    }
    
    const recentEntries = [...moodData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
    
    entriesList.innerHTML = '';
    
    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry';
        
        const date = new Date(entry.timestamp);
        const dateString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        entryDiv.innerHTML = `
            <div class="entry-header">
                <span class="entry-sentiment ${entry.sentimentLabel.toLowerCase()}">${entry.sentimentLabel}</span>
                <small>${dateString}</small>
            </div>
            <div><strong>Mood:</strong> ${entry.moodText}</div>
            <div><strong>Stress Level:</strong> ${entry.stressLevel}/10</div>
            <div><strong>Sentiment Score:</strong> ${entry.sentimentPolarity.toFixed(2)}</div>
        `;
        
        entriesList.appendChild(entryDiv);
    });
}

// Show clear data confirmation
function showClearConfirmation() {
    const confirmDiv = document.getElementById('clear-confirm');
    confirmDiv.style.display = confirmDiv.style.display === 'none' ? 'block' : 'none';
}

// Clear all data
function clearAllData() {
    const confirmCheckbox = document.getElementById('confirm-clear');
    
    if (!confirmCheckbox.checked) {
        alert('Please confirm that you understand this will delete all your mood data.');
        return;
    }
    
    moodData = [];
    localStorage.removeItem('moodData');
    
    updateProgressTab();
    document.getElementById('clear-confirm').style.display = 'none';
    confirmCheckbox.checked = false;
    
    alert('All data cleared successfully!');
}

// Save mood data to localStorage
function saveMoodData() {
    localStorage.setItem('moodData', JSON.stringify(moodData));
}

// Character System
const characters = {
    buddy: {
        name: "Buddy the Dog",
        emoji: "🐶",
        personality: "enthusiastic and supportive",
        messages: {
            welcome: "Woof! I'm so excited you're here! Let's track your mood together and find fun activities!",
            positive: "That's fantastic! Your positive energy makes my tail wag! Keep up the great work!",
            negative: "I sense you might be going through a tough time. Don't worry, I'm here for you! Let's find something that helps.",
            neutral: "I'm here to support you no matter how you're feeling. What matters most is that you're taking care of yourself!",
            highStress: "Whoa, that stress level seems pretty high! Let's take some deep breaths together. You've got this!"
        }
    },
    sage: {
        name: "Sage the Owl",
        emoji: "🦉",
        personality: "wise and thoughtful",
        messages: {
            welcome: "Greetings, wise one. I'm here to guide you through understanding your emotions and finding balance.",
            positive: "Your positive sentiment reflects inner wisdom. Continue nurturing this mindful state.",
            negative: "Difficult emotions are teachers in disguise. Let's explore some practices that bring clarity.",
            neutral: "Balance is the key to wisdom. You're exactly where you need to be in this moment.",
            highStress: "High stress clouds the mind. Let's find some centering activities to restore your peace."
        }
    },
    sunny: {
        name: "Sunny the Flower",
        emoji: "🌻",
        personality: "warm and nurturing",
        messages: {
            welcome: "Hello sunshine! I'm here to help you bloom and grow, no matter the weather in your heart.",
            positive: "You're radiating such beautiful positive energy! Like sunshine helping flowers grow!",
            negative: "Even flowers need rain to grow. Your feelings are valid, and brighter days are coming.",
            neutral: "Every feeling is like weather - it passes through. I'm here to help you through all seasons.",
            highStress: "Take a moment to feel the warmth of the sun. Let's find gentle ways to ease that stress."
        }
    },
    zen: {
        name: "Zen the Cat",
        emoji: "🐱",
        personality: "calm and mindful",
        messages: {
            welcome: "Purr... I'm here to help you find inner peace and mindfulness in your daily journey.",
            positive: "Mmm, I can feel your contentment. Let's maintain this peaceful energy together.",
            negative: "Sometimes we need to sit with difficult feelings. I'll keep you company through this.",
            neutral: "In stillness, we find clarity. Your presence in this moment is enough.",
            highStress: "Breathe with me... in... and out. Let's find your calm center together."
        }
    }
};

// Initialize character selection
function initializeCharacters() {
    // Set up character selection
    document.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', function() {
            selectCharacter(this.dataset.character);
        });
    });
    
    // Initialize selected character
    selectCharacter(selectedCharacter);
    updateCharacterMessage('welcome');
}

// Select character
function selectCharacter(characterId) {
    selectedCharacter = characterId;
    localStorage.setItem('selectedCharacter', characterId);
    
    // Update UI
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-character="${characterId}"]`).classList.add('active');
    
    // Update main character display
    const character = characters[characterId];
    const mainCharacter = document.getElementById('selected-character');
    mainCharacter.textContent = character.emoji;
    mainCharacter.className = `main-character ${characterId}-avatar`;
    
    // Update welcome message
    updateCharacterMessage('welcome');
}

// Update character message
function updateCharacterMessage(type, value = null) {
    const character = characters[selectedCharacter];
    const messageElement = document.getElementById('character-message');
    
    let message = '';
    
    switch(type) {
        case 'welcome':
            message = character.messages.welcome;
            break;
        case 'slider':
            if (value >= 7) {
                message = character.messages.highStress;
            } else if (value <= 3) {
                message = "That's a nice low stress level! I'm proud of you for taking care of yourself.";
            } else {
                message = "That stress level seems manageable. How else are you feeling today?";
            }
            break;
        default:
            message = character.messages.welcome;
    }
    
    // Animate message change
    messageElement.style.opacity = '0';
    setTimeout(() => {
        messageElement.textContent = message;
        messageElement.style.opacity = '1';
    }, 200);
}

// Update character response to mood analysis
function updateCharacterResponse(sentimentLabel, polarity, stressLevel) {
    const character = characters[selectedCharacter];
    const messageElement = document.getElementById('character-message');
    const characterElement = document.getElementById('selected-character');
    
    let message = '';
    let animationClass = '';
    
    if (stressLevel >= 7) {
        message = character.messages.highStress;
        animationClass = 'character-sad';
    } else if (sentimentLabel === 'Positive') {
        message = character.messages.positive;
        animationClass = 'character-happy';
    } else if (sentimentLabel === 'Negative') {
        message = character.messages.negative;
        animationClass = 'character-sad';
    } else {
        message = character.messages.neutral;
        animationClass = 'character-calm';
    }
    
    // Add encouraging follow-up based on character personality
    if (selectedCharacter === 'buddy' && sentimentLabel === 'Positive') {
        message += " Let's keep this energy going with some fun activities!";
    } else if (selectedCharacter === 'sage' && sentimentLabel === 'Negative') {
        message += " Remember, this too shall pass.";
    } else if (selectedCharacter === 'sunny' && stressLevel >= 7) {
        message += " You're stronger than you know! 🌈";
    } else if (selectedCharacter === 'zen' && sentimentLabel === 'Neutral') {
        message += " Purr... perfect balance.";
    }
    
    // Animate character
    characterElement.classList.remove('character-happy', 'character-sad', 'character-excited', 'character-calm');
    characterElement.classList.add(animationClass);
    
    // Update message with animation
    messageElement.style.opacity = '0';
    setTimeout(() => {
        messageElement.textContent = message;
        messageElement.style.opacity = '1';
    }, 300);
    
    // Remove animation class after animation completes
    setTimeout(() => {
        characterElement.classList.remove(animationClass);
    }, 2000);
}

// Utility function for shuffling arrays
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}