// Chatbot UI and Logic
document.addEventListener("DOMContentLoaded", function () {
    const chatbotHTML = `
        <div id="chatbot">
            <div id="chat-header">Chatbot <span id="close-chat">&times;</span></div>
            <div id="chat-body"></div>
            <div id="chat-input-container">
                <input type="text" id="chat-input" placeholder="Type a message..." />
                <button id="send-btn">Send</button>
            </div>
        </div>
        <button id="chat-toggle">Chat Now</button>
    `;
    
    document.body.insertAdjacentHTML("beforeend", chatbotHTML);

    const chatToggle = document.getElementById("chat-toggle");
    const chatbot = document.getElementById("chatbot");
    const closeChat = document.getElementById("close-chat");
    const sendBtn = document.getElementById("send-btn");
    const chatInput = document.getElementById("chat-input");
    const chatBody = document.getElementById("chat-body");
    
    let hasWelcomed = false;

    // Toggle chatbot visibility
    chatToggle.addEventListener("click", () => {
        chatbot.style.display = "block";
        chatToggle.style.display = "none";
        
        // Add welcome message on first open
        if (!hasWelcomed) {
            addMessage("Chatbot", "Hi! How can I help you know more about Utkarsh?");
            hasWelcomed = true;
        }
    });

    closeChat.addEventListener("click", () => {
        chatbot.style.display = "none";
        chatToggle.style.display = "block";
    });

    // Function to send a message
    async function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        addMessage("You", userMessage);
        chatInput.value = "";

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": ""
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: userMessage }]
                })
            });

            const data = await response.json();
            const botMessage = data.choices[0]?.message?.content || "Sorry, I couldn't understand that.";
            addMessage("Chatbot", botMessage);
        } catch (error) {
            addMessage("Chatbot", "Error: Unable to fetch response. Please check your API key.");
        }
    }

    // Function to add messages to chat
    function addMessage(sender, message) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", sender === "You" ? "user-message" : "ai-message");
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatBody.appendChild(messageElement);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Send message on button click or Enter key
    sendBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
});
