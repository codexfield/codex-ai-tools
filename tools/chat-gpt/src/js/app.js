import { marked } from 'marked';
import hljs from 'highlight.js';

// Configure marked to use highlight.js
marked.setOptions({
    highlight: function (code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    }
});

class ChatApp {
    constructor() {
        this.messages = [];
        this.isProcessing = false;
        this.initializeElements();
        this.setupEventListeners();
        this.loadApiKey();
    }

    initializeElements() {
        // Input elements
        this.apiKeyInput = document.getElementById('apiKey');
        this.modelSelect = document.getElementById('model');
        this.systemPromptInput = document.getElementById('systemPrompt');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');

        // Display elements
        this.messagesContainer = document.getElementById('messages');
        this.settingsPanel = document.getElementById('settingsPanel');

        // Buttons
        this.saveKeyButton = document.getElementById('saveKey');
        this.toggleSettingsButton = document.getElementById('toggleSettings');
    }

    setupEventListeners() {
        // Send message on button click or Enter (without shift)
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Save API key
        this.saveKeyButton.addEventListener('click', () => this.saveApiKey());

        // Toggle settings panel on mobile
        this.toggleSettingsButton.addEventListener('click', () => {
            this.settingsPanel.classList.toggle('open');
        });

        // Auto-resize textarea
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = this.userInput.scrollHeight + 'px';
        });
    }

    loadApiKey() {
        const savedKey = localStorage.getItem('openai-api-key');
        if (savedKey) {
            this.apiKeyInput.value = savedKey;
        }
    }

    saveApiKey() {
        const key = this.apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('openai-api-key', key);
            alert('API key saved!');
        }
    }

    async sendMessage() {
        const userMessage = this.userInput.value.trim();
        if (!userMessage || this.isProcessing) return;

        const apiKey = this.apiKeyInput.value.trim();
        if (!apiKey) {
            alert('Please enter your OpenAI API key in settings.');
            return;
        }

        // Add user message to chat
        this.addMessage('user', userMessage);
        this.userInput.value = '';
        this.userInput.style.height = 'auto';

        // Show typing indicator
        this.showTypingIndicator();
        this.isProcessing = true;
        this.sendButton.disabled = true;

        try {
            const response = await this.callOpenAI(userMessage, apiKey);
            this.hideTypingIndicator();
            this.addMessage('assistant', response);
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('assistant', `Error: ${error.message}`);
        }

        this.isProcessing = false;
        this.sendButton.disabled = false;
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    async callOpenAI(userMessage, apiKey) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: this.modelSelect.value,
                messages: [
                    {
                        role: 'system',
                        content: this.systemPromptInput.value.trim()
                    },
                    ...this.messages.map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    {
                        role: 'user',
                        content: userMessage
                    }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to get response from OpenAI');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    addMessage(role, content) {
        this.messages.push({ role, content });

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        messageDiv.innerHTML = role === 'user' ? content : marked(content);

        this.messagesContainer.appendChild(messageDiv);
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        this.messagesContainer.appendChild(indicator);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = this.messagesContainer.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
}

// Initialize the app
new ChatApp();