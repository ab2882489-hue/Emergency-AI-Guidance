// RescueVoice AI - Emergency Guidance JavaScript

// Main Application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

function initApp() {
    // Navigation
    initNavigation();
    
    // Voice Functionality
    initVoice();
    
    // Emergency Analysis
    initEmergencyAnalysis();
    
    // Guidance Steps
    initGuidance();
    
    // Severe Emergency Functions
    initSevereEmergency();
    
    // Hospital Finder
    initHospitals();
    
    // First Aid Learning
    initLearning();
    
    // Set active section based on hash
    updateActiveSection();
}

// Navigation
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.innerHTML = navMenu.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : 
                '<i class="fas fa-bars"></i>';
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.nav-container') && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    
    // Nav link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Get target section
            const targetId = this.getAttribute('href');
            showSection(targetId);
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });
    
    // Hash change detection
    window.addEventListener('hashchange', updateActiveSection);
}

function updateActiveSection() {
    const hash = window.location.hash || '#home';
    showSection(hash);
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === hash) {
            link.classList.add('active');
        }
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.querySelector(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Scroll to top of section
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Voice Functionality
function initVoice() {
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const voiceOutput = document.getElementById('voiceOutput');
    const langButtons = document.querySelectorAll('.lang-btn');
    const emergencyText = document.getElementById('emergencyText');
    
    let isListening = false;
    let recognition = null;
    let currentLanguage = 'en-US';
    
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = currentLanguage;
        
        recognition.onstart = function() {
            isListening = true;
            voiceStatus.textContent = 'Listening... Speak now';
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Listening';
            voiceBtn.style.backgroundColor = '#dc2626';
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            voiceOutput.textContent = transcript;
            emergencyText.value = transcript;
            voiceStatus.textContent = 'Voice input received';
            
            // Auto-analyze if it's a longer description
            if (transcript.split(' ').length > 3) {
                setTimeout(() => {
                    analyzeEmergency();
                }, 1000);
            }
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            voiceStatus.textContent = 'Error: ' + event.error;
            resetVoiceButton();
        };
        
        recognition.onend = function() {
            resetVoiceButton();
        };
    } else {
        voiceStatus.textContent = 'Voice recognition not supported in this browser';
        voiceBtn.disabled = true;
    }
    
    // Voice button click handler
    if (voiceBtn) {
        voiceBtn.addEventListener('click', function() {
            if (!recognition) {
                voiceStatus.textContent = 'Voice recognition not available';
                return;
            }
            
            if (!isListening) {
                try {
                    recognition.start();
                } catch (error) {
                    console.error('Failed to start recognition:', error);
                    voiceStatus.textContent = 'Failed to start voice recognition';
                }
            } else {
                recognition.stop();
            }
        });
    }
    
    // Language selection
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            langButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Set language for speech recognition
            const lang = this.getAttribute('data-lang');
            switch(lang) {
                case 'en':
                    currentLanguage = 'en-US';
                    break;
                case 'ur':
                    currentLanguage = 'ur-PK';
                    break;
                default:
                    currentLanguage = 'en-US';
            }
            
            if (recognition) {
                recognition.lang = currentLanguage;
            }
            
            // Update UI text based on language
            updateUILanguage(lang);
        });
    });
    
    // Text to speech function
    window.speakText = function(text, rate = 0.9) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = currentLanguage;
            utterance.rate = rate;
            
            window.speechSynthesis.speak(utterance);
            return true;
        }
        return false;
    };
    
    // Reset voice button to default state
    function resetVoiceButton() {
        isListening = false;
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Speaking';
        voiceBtn.style.backgroundColor = '';
    }
    
    // Update UI language
    function updateUILanguage(lang) {
        // This is a simplified version - in a real app, you would have translations
        const translations = {
            en: {
                voiceStatus: 'Click button and describe the emergency',
                emergencyTextPlaceholder: 'Example: Person is choking and cannot breathe. They are conscious but panicking.'
            },
            ur: {
                voiceStatus: 'بٹن دبائیں اور ایمرجنسی بیان کریں',
                emergencyTextPlaceholder: 'مثال: شخص گھٹ رہا ہے اور سانس نہیں لے سکتا۔ وہ ہوش میں ہے لیکن گھبراہٹ کا شکار ہے۔'
            },
            ru: {
                voiceStatus: 'Button dabain aur emergency bayan karein',
                emergencyTextPlaceholder: 'Misal: Shakhs ghat raha hai aur saans nahi le sakta. Woh hosh mein hai lekin ghabrahat ka shikar hai.'
            }
        };
        
        if (translations[lang]) {
            voiceStatus.textContent = translations[lang].voiceStatus;
            emergencyText.placeholder = translations[lang].emergencyTextPlaceholder;
        }
    }
}

// Emergency Analysis
function initEmergencyAnalysis() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const emergencyText = document.getElementById('emergencyText');
    const analysisResult = document.getElementById('analysisResult');
    const severityBadge = document.getElementById('severityBadge');
    const emergencyType = document.getElementById('emergencyType');
    const recommendedAction = document.getElementById('recommendedAction');
    const severeCheckBtn = document.getElementById('severeCheckBtn');
    
    // Analyze button click
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeEmergency);
    }
    
    // Severe check button
    if (severeCheckBtn) {
        severeCheckBtn.addEventListener('click', function() {
            const text = emergencyText.value.trim();
            if (!text) {
                alert('Please describe the emergency first');
                return;
            }
            
            const severity = detectSeverity(text);
            
            if (severity === 'high') {
                // Show severe emergency alert
                alert('⚠️ SEVERE EMERGENCY DETECTED!\n\nBased on your description, this appears to be a life-threatening situation. Please proceed to the Severe Emergency section immediately.');
                
                // Auto-navigate to severe section
                showSection('#severe');
                
                // Update nav
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                document.querySelector('a[href="#severe"]').classList.add('active');
            } else {
                alert('Based on your description, this does not appear to be a severe life-threatening emergency. Continue with the guidance provided.');
            }
        });
    }
}

function analyzeEmergency() {
    const emergencyText = document.getElementById('emergencyText');
    const analysisResult = document.getElementById('analysisResult');
    const severityBadge = document.getElementById('severityBadge');
    const emergencyType = document.getElementById('emergencyType');
    const recommendedAction = document.getElementById('recommendedAction');
    
    const text = emergencyText.value.trim();
    
    if (!text) {
        alert('Please describe the emergency situation first.');
        return;
    }
    
    // Show loading state
    analysisResult.classList.remove('hidden');
    severityBadge.textContent = 'Analyzing...';
    emergencyType.innerHTML = 'Detected: <strong>Analyzing...</strong>';
    recommendedAction.innerHTML = 'Recommended: <strong>Please wait...</strong>';
    
    // Simulate AI analysis (in real app, this would call an API)
    setTimeout(() => {
        const analysis = simulateEmergencyAnalysis(text);
        
        // Update UI with results
        severityBadge.textContent = analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1);
        severityBadge.className = 'severity-badge ' + analysis.severity;
        
        emergencyType.innerHTML = `Detected: <strong>${analysis.type}</strong>`;
        recommendedAction.innerHTML = `Recommended: <strong>${analysis.recommendation}</strong>`;
        
        // Speak the analysis
        speakText(`Emergency analysis complete. I've detected ${analysis.type.toLowerCase()}. ${analysis.recommendation}`);
        
        // Scroll to results
        analysisResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
    }, 1500);
}

function simulateEmergencyAnalysis(text) {
    const textLower = text.toLowerCase();
    
    // Simple keyword-based detection
    if (textLower.includes('choking') || textLower.includes('cant breathe') || textLower.includes('can\'t breathe')) {
        return {
            type: 'Choking Emergency',
            severity: 'high',
            recommendation: 'Perform Heimlich Maneuver immediately'
        };
    } else if (textLower.includes('unconscious') || textLower.includes('not breathing') || textLower.includes('no pulse')) {
        return {
            type: 'Cardiac Arrest / Unconscious',
            severity: 'high',
            recommendation: 'Begin CPR and call emergency services'
        };
    } else if (textLower.includes('bleeding') || textLower.includes('blood') || textLower.includes('cut')) {
        return {
            type: 'Severe Bleeding',
            severity: textLower.includes('severe') || textLower.includes('heavy') ? 'high' : 'medium',
            recommendation: 'Apply direct pressure to wound'
        };
    } else if (textLower.includes('burn') || textLower.includes('fire')) {
        return {
            type: 'Burn Injury',
            severity: textLower.includes('severe') || textLower.includes('third degree') ? 'high' : 'medium',
            recommendation: 'Cool burn with running water'
        };
    } else if (textLower.includes('broken') || textLower.includes('fracture')) {
        return {
            type: 'Broken Bone / Fracture',
            severity: 'medium',
            recommendation: 'Immobilize the area and seek medical attention'
        };
    } else if (textLower.includes('chest pain') || textLower.includes('heart')) {
        return {
            type: 'Possible Heart Attack',
            severity: 'high',
            recommendation: 'Call emergency services immediately'
        };
    } else {
        return {
            type: 'General Emergency',
            severity: 'low',
            recommendation: 'Assess situation and call for help if needed'
        };
    }
}

function detectSeverity(text) {
    const analysis = simulateEmergencyAnalysis(text);
    return analysis.severity;
}

// Guidance Steps
function initGuidance() {
    const prevStepBtn = document.getElementById('prevStep');
    const nextStepBtn = document.getElementById('nextStep');
    const emergencyTypeBtns = document.querySelectorAll('.emergency-type-btn');
    const voiceStepBtns = document.querySelectorAll('.btn-voice-step');
    const startVoiceGuidanceBtn = document.getElementById('startVoiceGuidance');
    const pauseVoiceGuidanceBtn = document.getElementById('pauseVoiceGuidance');
    const repeatStepBtn = document.getElementById('repeatStep');
    
    let currentStep = 1;
    let totalSteps = 5; // This would be dynamic based on emergency type
    let isVoiceGuidanceActive = false;
    
    // Step navigation
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', function() {
            if (currentStep > 1) {
                currentStep--;
                updateStepDisplay();
            }
        });
    }
    
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', function() {
            if (currentStep < totalSteps) {
                currentStep++;
                updateStepDisplay();
            } else {
                // Show completion
                alert('All steps completed! Continue monitoring the situation until help arrives.');
            }
        });
    }
    
    // Emergency type selection
    emergencyTypeBtns.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            emergencyTypeBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update emergency title
            const emergencyTitle = document.getElementById('currentEmergency');
            emergencyTitle.textContent = this.textContent;
            
            // Reset to step 1
            currentStep = 1;
            updateStepDisplay();
            
            // Speak the selection
            speakText(`Showing guidance for ${this.textContent.toLowerCase()}. Starting with step one.`);
        });
    });
    
    // Voice step buttons
    voiceStepBtns.forEach(button => {
        button.addEventListener('click', function() {
            const stepNum = this.getAttribute('data-step');
            const stepCard = document.getElementById(`step${stepNum}`);
            const stepText = stepCard.querySelector('p').textContent;
            
            speakText(`Step ${stepNum}. ${stepText}`);
        });
    });
    
    // Voice guidance controls
    if (startVoiceGuidanceBtn) {
        startVoiceGuidanceBtn.addEventListener('click', function() {
            isVoiceGuidanceActive = true;
            startVoiceGuidanceBtn.disabled = true;
            pauseVoiceGuidanceBtn.disabled = false;
            
            // Start reading steps one by one
            startAutomaticGuidance();
        });
    }
    
    if (pauseVoiceGuidanceBtn) {
        pauseVoiceGuidanceBtn.addEventListener('click', function() {
            isVoiceGuidanceActive = false;
            startVoiceGuidanceBtn.disabled = false;
            pauseVoiceGuidanceBtn.disabled = true;
            
            // Stop speech
            window.speechSynthesis.cancel();
        });
    }
    
    if (repeatStepBtn) {
        repeatStepBtn.addEventListener('click', function() {
            const stepCard = document.querySelector('.step-card.active');
            if (stepCard) {
                const stepText = stepCard.querySelector('p').textContent;
                const stepNum = stepCard.querySelector('.step-number').textContent;
                
                speakText(`Repeating step ${stepNum}. ${stepText}`);
            }
        });
    }
    
    // Update step display
    function updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.step-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Show current step
        const currentStepCard = document.getElementById(`step${currentStep}`);
        if (currentStepCard) {
            currentStepCard.classList.add('active');
        }
        
        // Update step numbers
        document.getElementById('currentStepNum').textContent = currentStep;
        document.getElementById('totalSteps').textContent = totalSteps;
        
        // Update progress bar
        const progressPercent = (currentStep / totalSteps) * 100;
        document.getElementById('stepProgressBar').style.width = `${progressPercent}%`;
        
        // Update button states
        prevStepBtn.disabled = currentStep === 1;
        nextStepBtn.textContent = currentStep === totalSteps ? 
            'Complete <i class="fas fa-check"></i>' : 
            'Next <i class="fas fa-chevron-right"></i>';
    }
    
    // Automatic voice guidance
    function startAutomaticGuidance() {
        if (!isVoiceGuidanceActive) return;
        
        const stepCard = document.querySelector('.step-card.active');
        if (stepCard) {
            const stepText = stepCard.querySelector('p').textContent;
            const stepNum = stepCard.querySelector('.step-number').textContent;
            const stepTitle = stepCard.querySelector('h4').textContent;
            
            speakText(`Step ${stepNum}. ${stepTitle}. ${stepText}`);
            
            // Wait for speech to finish, then move to next step
            setTimeout(() => {
                if (isVoiceGuidanceActive && currentStep < totalSteps) {
                    currentStep++;
                    updateStepDisplay();
                    // Recursively call for next step
                    setTimeout(startAutomaticGuidance, 1000);
                } else if (currentStep === totalSteps) {
                    // Finished all steps
                    speakText('All steps completed. Please continue monitoring the situation until help arrives.');
                    isVoiceGuidanceActive = false;
                    startVoiceGuidanceBtn.disabled = false;
                    pauseVoiceGuidanceBtn.disabled = true;
                }
            }, 8000); // Wait longer than the speech duration
        }
    }
    
    // Initialize step display
    updateStepDisplay();
}

// Severe Emergency Functions
function initSevereEmergency() {
    const autoCallBtn = document.getElementById('autoCallBtn');
    const autoMessageBtn = document.getElementById('autoMessageBtn');
    const shareLocationBtn = document.getElementById('shareLocationBtn');
    
    // Auto-call simulation
    if (autoCallBtn) {
        autoCallBtn.addEventListener('click', function() {
            if (confirm('⚠️ SEVERE EMERGENCY\n\nThis will simulate calling 911 with your location. In a real app, this would automatically dial emergency services.\n\nProceed with simulation?')) {
                // Simulate call
                speakText('Calling emergency services. Please stay on the line. Simulating emergency call to 9 1 1.');
                
                // Show call simulation
                alert('SIMULATION: Calling 911...\n\nConnecting to emergency dispatcher...\n\nYour location has been shared.\n\nStay on the line for instructions.');
                
                // Update button
                autoCallBtn.innerHTML = '<i class="fas fa-phone"></i> CALLING 911...';
                autoCallBtn.disabled = true;
                
                setTimeout(() => {
                    autoCallBtn.innerHTML = '<i class="fas fa-phone"></i> CALL 911 NOW';
                    autoCallBtn.disabled = false;
                }, 5000);
            }
        });
    }
    
    // Auto-message simulation
    if (autoMessageBtn) {
        autoMessageBtn.addEventListener('click', function() {
            if (confirm('Send emergency SMS to your emergency contacts with your location?')) {
                // Simulate sending message
                speakText('Sending emergency message to your contacts.');
                
                // Show message simulation
                alert('SIMULATION: Emergency message sent!\n\nMessage: "EMERGENCY! I need help at my current location. Please send assistance."\n\nSent to: Emergency Contact 1, Emergency Contact 2');
                
                // Update button
                autoMessageBtn.innerHTML = '<i class="fas fa-paper-plane"></i> MESSAGE SENT';
                autoMessageBtn.disabled = true;
                
                setTimeout(() => {
                    autoMessageBtn.innerHTML = '<i class="fas fa-paper-plane"></i> SEND EMERGENCY SMS';
                    autoMessageBtn.disabled = false;
                }, 3000);
            }
        });
    }
    
    // Share location simulation
    if (shareLocationBtn) {
        shareLocationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        const lat = position.coords.latitude.toFixed(4);
                        const lng = position.coords.longitude.toFixed(4);
                        
                        alert(`SIMULATION: Location shared with emergency services!\n\nYour location: ${lat}, ${lng}\n\nMap: https://maps.google.com/?q=${lat},${lng}`);
                        
                        speakText('Your location has been shared with emergency responders.');
                    },
                    function(error) {
                        alert('Unable to get your location. Please enable location services.');
                    }
                );
            } else {
                alert('Geolocation is not supported by your browser.');
            }
        });
    }
}

// Hospital Finder
function initHospitals() {
    const loadMapBtn = document.getElementById('loadMapBtn');
    const refreshLocationBtn = document.getElementById('refreshLocation');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const callBtns = document.querySelectorAll('.call-btn');
    const directionsBtns = document.querySelectorAll('.directions-btn');
    
    // Load map button
    if (loadMapBtn) {
        loadMapBtn.addEventListener('click', function() {
            // Simulate loading interactive map
            const mapPlaceholder = document.getElementById('hospitalMap');
            mapPlaceholder.innerHTML = `
                <div class="map-overlay">
                    <i class="fas fa-map-marked-alt"></i>
                    <h3>Interactive Map Loaded</h3>
                    <p>Showing hospitals within 10km radius</p>
                    <p>Simulation: 5 hospitals found nearby</p>
                    <div class="map-markers">
                        <div class="marker emergency" style="top: 30%; left: 40%;"></div>
                        <div class="marker urgent" style="top: 50%; left: 60%;"></div>
                        <div class="marker clinic" style="top: 70%; left: 30%;"></div>
                    </div>
                </div>
            `;
            
            // Add some CSS for markers
            const style = document.createElement('style');
            style.textContent = `
                .map-markers { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
                .marker { position: absolute; width: 20px; height: 20px; border-radius: 50%; transform: translate(-50%, -50%); }
                .marker.emergency { background-color: #dc2626; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3); }
                .marker.urgent { background-color: #f59e0b; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3); }
                .marker.clinic { background-color: #10b981; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3); }
            `;
            document.head.appendChild(style);
            
            loadMapBtn.textContent = 'Map Loaded';
            loadMapBtn.disabled = true;
            
            speakText('Interactive hospital map loaded. Showing nearby medical facilities.');
        });
    }
    
    // Refresh location
    if (refreshLocationBtn) {
        refreshLocationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        alert(`Location refreshed!\n\nNew coordinates: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
                        speakText('Location refreshed. Updating nearby hospitals.');
                    },
                    function(error) {
                        alert('Unable to refresh location. Using default location.');
                    }
                );
            }
        });
    }
    
    // Filter buttons
    filterBtns.forEach(button => {
        button.addEventListener('click', function() {
            // Update active filter
            filterBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // In a real app, this would filter hospital results
            speakText(`Filtering hospitals by ${this.textContent.toLowerCase()}`);
        });
    });
    
    // Call buttons
    callBtns.forEach(button => {
        button.addEventListener('click', function() {
            const hospitalCard = this.closest('.hospital-card');
            const hospitalName = hospitalCard.querySelector('h4').textContent;
            const phone = hospitalCard.querySelector('.hospital-phone').textContent.replace('(555) ', '');
            
            alert(`SIMULATION: Calling ${hospitalName} at ${phone}\n\nIn a real app, this would dial the hospital.`);
            speakText(`Calling ${hospitalName}`);
        });
    });
    
    // Directions buttons
    directionsBtns.forEach(button => {
        button.addEventListener('click', function() {
            const hospitalCard = this.closest('.hospital-card');
            const hospitalName = hospitalCard.querySelector('h4').textContent;
            
            alert(`SIMULATION: Getting directions to ${hospitalName}\n\nIn a real app, this would open Google Maps with directions.`);
            speakText(`Getting directions to ${hospitalName}`);
        });
    });
}

// Learning Section
function initLearning() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const learnCards = document.querySelectorAll('.learn-card');
    
    // Category filter buttons
    categoryBtns.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            categoryBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            
            // Filter learn cards
            learnCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
            
            speakText(`Showing ${category === 'all' ? 'all' : category} first aid lessons.`);
        });
    });
    
    // Learn card buttons
    document.querySelectorAll('.learn-card-actions .btn').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.learn-card');
            const lessonTitle = card.querySelector('h4').textContent;
            
            if (this.textContent.includes('Start Lesson')) {
                alert(`Starting lesson: ${lessonTitle}\n\nThis would open an interactive first aid lesson.`);
                speakText(`Starting lesson on ${lessonTitle.toLowerCase()}`);
            } else if (this.textContent.includes('PDF')) {
                alert(`Downloading PDF guide for: ${lessonTitle}\n\nThis would download a printable first aid guide.`);
                speakText(`Downloading PDF guide for ${lessonTitle.toLowerCase()}`);
            }
        });
    });
}

// Auto-start voice announcement on home page
setTimeout(() => {
    if (window.location.hash === '#home' || window.location.hash === '') {
        speakText("Welcome to RescueVoice AI Emergency Guidance. Press the large red button to start emergency assistance, or use voice input to describe your emergency.");
    }
}, 1000);
