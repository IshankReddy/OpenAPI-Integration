const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const typingIndicator = document.getElementById('typing-indicator');

function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, true);
    messageInput.value = '';

    // Show typing indicator
    typingIndicator.style.display = 'block';

    try {
        const response = await fetch('http://localhost:8000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const reader = response.body.getReader();
        let botResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Convert the Uint8Array to text
            const text = new TextDecoder().decode(value);
            botResponse += text;
            
            // Update the last message if it exists, or create a new one
            const lastMessage = chatMessages.lastElementChild;
            if (lastMessage && lastMessage.classList.contains('bot-message')) {
                lastMessage.textContent = botResponse;
            } else {
                addMessage(botResponse);
            }

            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, there was an error processing your request.', false);
    } finally {
        typingIndicator.style.display = 'none';
    }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});