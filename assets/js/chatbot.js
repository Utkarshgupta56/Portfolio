// Chatbot UI and Logic
document.addEventListener("DOMContentLoaded", function () {
    const chatbotHTML = `
        <div id="chatbot">
            <div id="chat-header">AI Chatbot <span id="close-chat">&times;</span></div>
            <div id="chat-body"></div>
            <div id="chat-input-container">
                <input type="text" id="chat-input" placeholder="Type a message..." />
                <button id="send-btn">Send</button>
            </div>
        </div>
        <button id="chat-toggle">💬 Chat</button>
    `;
    
    document.body.insertAdjacentHTML("beforeend", chatbotHTML);

    const chatToggle = document.getElementById("chat-toggle");
    const chatbot = document.getElementById("chatbot");
    const closeChat = document.getElementById("close-chat");
    const sendBtn = document.getElementById("send-btn");
    const chatInput = document.getElementById("chat-input");
    const chatBody = document.getElementById("chat-body");

    // Toggle chatbot visibility
    chatToggle.addEventListener("click", () => {
        chatbot.style.display = "block";
        chatToggle.style.display = "none";
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
                    "Authorization": "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"
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: userMessage }]
                })
            });

            const data = await response.json();
            const botMessage = data.choices[0]?.message?.content || "Sorry, I couldn't understand that.";
            addMessage("AI", botMessage);
        } catch (error) {
            addMessage("AI", "Error: Unable to fetch response. Please check your API key.");
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
