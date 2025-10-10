// Constants
const API_ENDPOINT = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
const DEFAULT_PARAMS = {
    width: 1024,
    height: 1024,
    steps: 50,
    cfg_scale: 7,
};

// DOM Elements
const promptInput = document.getElementById('prompt');
const generateButton = document.getElementById('generate');
const loadingElement = document.getElementById('loading');
const resultElement = document.getElementById('result');
const presetButtons = document.querySelectorAll('.preset-button');

// Style presets
const STYLE_PRESETS = {
    realistic: 'ultra realistic, photographic, 8k, detailed',
    anime: 'anime style, cel shaded, vibrant colors',
    '3d': '3D render, octane render, blender style',
    watercolor: 'watercolor painting, artistic, soft colors',
    oil: 'oil painting, textured, artistic',
    sketch: 'pencil sketch, black and white, detailed'
};

// Event Listeners
generateButton.addEventListener('click', generateImage);
presetButtons.forEach(button => {
    button.addEventListener('click', () => applyPreset(button.dataset.style));
});

// Functions
async function generateImage() {
    const prompt = promptInput.value.trim();
    if (!prompt) {
        alert('Please enter a description');
        return;
    }

    setLoading(true);

    try {
        // For demo, we'll use a placeholder image
        // In production, you would make an actual API call
        await simulateAPICall();
        const imageUrl = `https://picsum.photos/1024/1024?random=${Date.now()}`;
        displayResult(imageUrl);
    } catch (error) {
        console.error('Error generating image:', error);
        alert('Failed to generate image. Please try again.');
    } finally {
        setLoading(false);
    }
}

function applyPreset(style) {
    const preset = STYLE_PRESETS[style];
    if (preset) {
        const currentPrompt = promptInput.value.trim();
        promptInput.value = currentPrompt ? `${currentPrompt}, ${preset}` : preset;
    }
}

function setLoading(isLoading) {
    generateButton.disabled = isLoading;
    loadingElement.classList.toggle('active', isLoading);
}

function displayResult(imageUrl) {
    resultElement.innerHTML = `
        <img src="${imageUrl}" alt="Generated image" />
        <button class="button" onclick="downloadImage('${imageUrl}')" style="margin-top: 20px;">
            💾 Save Image
        </button>
    `;
}

async function simulateAPICall() {
    // Simulate API delay
    return new Promise(resolve => setTimeout(resolve, 2000));
}

async function downloadImage(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = `ai-generated-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
    } catch (error) {
        console.error('Error downloading image:', error);
        alert('Failed to download image. Please try again.');
    }
}