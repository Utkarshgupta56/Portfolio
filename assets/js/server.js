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
                    "Authorization": "Bearer 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"
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: userMessage }]
                })
            });

            const data = await response.json();
            const botMessage = data.choices[0]?.message?.content || "AI couldn't understand your request.";
            addMessage("AI", botMessage);
        } catch (error) {
            addMessage("AI", "Error: Unable to fetch response.");
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
