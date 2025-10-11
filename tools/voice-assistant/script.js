// DOM Elements
const micButton = document.getElementById('micButton');
const status = document.getElementById('status');
const transcript = document.getElementById('transcript');
const response = document.getElementById('response');
const saveTranscriptBtn = document.getElementById('saveTranscript');
const saveAudioBtn = document.getElementById('saveAudio');
const inputLanguage = document.getElementById('inputLanguage');
const outputVoice = document.getElementById('outputVoice');
const visualizer = document.getElementById('visualizer');

// Global variables
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let audioContext = null;
let analyser = null;
let recognition = null;

// Initialize Web Speech API
function initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('Speech recognition is not supported in this browser.');
        return null;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
        const result = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');

        transcript.textContent = result;
        saveTranscriptBtn.disabled = false;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopRecording();
    };

    return recognition;
}

// Initialize audio context and analyzer
function initializeAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
}

// Setup audio visualization
function setupVisualization(stream) {
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = visualizer;
    const ctx = canvas.getContext('2d');

    function draw() {
        if (!isRecording) return;

        requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);

        ctx.fillStyle = 'rgb(247, 247, 248)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#10a37f';
        ctx.beginPath();

        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * canvas.height / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    }

    draw();
}

// Start recording
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        if (!audioContext) {
            initializeAudioContext();
        }

        setupVisualization(stream);

        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            saveAudioBtn.disabled = false;

            // Simulate AI response
            await generateAIResponse();
        };

        audioChunks = [];
        mediaRecorder.start();
        recognition.start();

        isRecording = true;
        micButton.classList.add('recording');
        status.textContent = 'Recording... Click again to stop';

    } catch (error) {
        console.error('Error starting recording:', error);
        alert('Could not access microphone. Please ensure you have granted permission.');
    }
}

// Stop recording
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }

    if (recognition) {
        recognition.stop();
    }

    isRecording = false;
    micButton.classList.remove('recording');
    status.textContent = 'Click the microphone to start';
}

// Generate AI response
async function generateAIResponse() {
    const userText = transcript.textContent;
    response.textContent = 'Processing...';

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Demo response
    response.textContent = `I understand you said: "${userText}"\n\nThis is a demo response. In production, this would be connected to an AI service for real responses.`;
}

// Save transcript
function saveTranscriptText() {
    const text = transcript.textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Save audio
function saveAudioRecording() {
    const blob = new Blob(audioChunks, { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${new Date().toISOString()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Event listeners
micButton.addEventListener('click', () => {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});

saveTranscriptBtn.addEventListener('click', saveTranscriptText);
saveAudioBtn.addEventListener('click', saveAudioRecording);

inputLanguage.addEventListener('change', () => {
    if (recognition) {
        recognition.lang = inputLanguage.value;
    }
});

// Initialize speech recognition
initializeSpeechRecognition();