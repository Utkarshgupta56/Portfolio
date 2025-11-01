// Chatbot UI and Logic
document.addEventListener("DOMContentLoaded", function () {
    const chatbotHTML = `
        <div id="chatbot" style="opacity: 0; transition: opacity 1s ease;">
            <div id="chat-header">AI Assistant <span id="close-chat">&times;</span></div>
            <div id="chat-body"></div>
            <div id="chat-input-container">
                <input type="text" id="chat-input" placeholder="Type a message..." />
                <button id="send-btn">Send</button>
            </div>
        </div>
        <button id="chat-toggle" style="display: none;">Chat Now</button>
    `;
    
    document.body.insertAdjacentHTML("beforeend", chatbotHTML);

    const chatToggle = document.getElementById("chat-toggle");
    const chatbot = document.getElementById("chatbot");
    const closeChat = document.getElementById("close-chat");
    const sendBtn = document.getElementById("send-btn");
    const chatInput = document.getElementById("chat-input");
    const chatBody = document.getElementById("chat-body");
    
    let hasWelcomed = false;
    let autoPopupShown = false;

    // Auto popup after 3 seconds
    setTimeout(() => {
        if (!autoPopupShown) {
            autoPopupShown = true;
            chatbot.style.display = "flex";
            
            // Fade in the chatbot
            setTimeout(() => {
                chatbot.style.opacity = "1";
            }, 50);
            
            // Add welcome message
            addMessage("AI Assistant", "Hey! I am your AI Assistant! How can I help you know more about Utkarsh?");
            hasWelcomed = true;
            
            // Fade out after 5 seconds and show button
            setTimeout(() => {
                chatbot.style.opacity = "0";
                
                // After fade animation completes, hide chatbot and show button
                setTimeout(() => {
                    chatbot.style.display = "none";
                    chatToggle.style.display = "flex";
                }, 1000); // Wait for 1s fade animation to complete
            }, 5000); // Show for 5 seconds
        }
    }, 3000); // Wait 3 seconds before showing

    // Toggle chatbot visibility
    chatToggle.addEventListener("click", () => {
        chatbot.style.display = "flex";
        chatbot.style.opacity = "1";
        chatToggle.style.display = "none";
        
        // Add welcome message on first open (if not shown via auto popup)
        if (!hasWelcomed) {
            addMessage("AI Assistant", "Hey! I am your AI Assistant! How can I help you know more about Utkarsh?");
            hasWelcomed = true;
        }
    });

    closeChat.addEventListener("click", () => {
        chatbot.style.opacity = "0";
        
        setTimeout(() => {
            chatbot.style.display = "none";
            chatToggle.style.display = "flex";
        }, 300);
    });

    // Function to extract website content for context
    function extractWebsiteContext() {
        const context = {
            personalInfo: {},
            about: "",
            workExperience: [],
            projects: [],
            publications: [],
            skills: [],
            contact: {}
        };

        // Extract personal information from hero section
        const heroSection = document.querySelector('#hero');
        if (heroSection) {
            const nameEl = heroSection.querySelector('h2');
            const titleEl = heroSection.querySelector('.typed');
            context.personalInfo.name = nameEl ? nameEl.textContent.trim() : "Utkarsh Gupta";
            context.personalInfo.title = titleEl ? titleEl.getAttribute('data-typed-items') : "";
        }

        // Extract About section
        const aboutSection = document.querySelector('#about');
        if (aboutSection) {
            const bioElements = aboutSection.querySelectorAll('.about-bio p');
            const highlights = aboutSection.querySelectorAll('.highlight-item span');
            
            context.about = Array.from(bioElements).map(p => p.textContent.trim()).join(' ');
            context.personalInfo.highlights = Array.from(highlights).map(h => h.textContent.trim());
        }

        // Extract Work Experience
        const workExperienceCards = document.querySelectorAll('.resume-card .resume-item');
        workExperienceCards.forEach(item => {
            const title = item.querySelector('h4');
            const date = item.querySelector('h5');
            const description = item.querySelector('p');
            const points = item.querySelectorAll('ul li');
            
            if (title) {
                const experience = {
                    title: title.textContent.trim(),
                    date: date ? date.textContent.trim() : "",
                    description: description ? description.textContent.trim() : "",
                    responsibilities: Array.from(points).map(p => p.textContent.trim())
                };
                context.workExperience.push(experience);
            }
        });

        // Extract Projects
        const projectCards = document.querySelectorAll('.resume-card .resume-item');
        projectCards.forEach(item => {
            const titleEl = item.querySelector('h4');
            const techStackEl = item.querySelector('p');
            const detailsEl = item.querySelectorAll('ul li');
            
            if (titleEl && titleEl.textContent.includes('Website') || 
                titleEl && (titleEl.textContent.includes('AI') || titleEl.textContent.includes('DDoS'))) {
                const project = {
                    name: titleEl.textContent.trim(),
                    techStack: techStackEl ? techStackEl.textContent.trim() : "",
                    details: Array.from(detailsEl).map(d => d.textContent.trim())
                };
                context.projects.push(project);
            }
        });

        // Extract Publications
        const publicationSection = document.querySelector('.resume-title');
        if (publicationSection && publicationSection.textContent.includes('Publications')) {
            const pubItem = publicationSection.closest('.resume-card');
            if (pubItem) {
                const pubTitle = pubItem.querySelector('h4');
                const pubDate = pubItem.querySelector('h5');
                const pubDetails = pubItem.querySelectorAll('ul li');
                
                context.publications.push({
                    title: pubTitle ? pubTitle.textContent.trim() : "",
                    conference: pubDate ? pubDate.textContent.trim() : "",
                    details: Array.from(pubDetails).map(d => d.textContent.trim())
                });
            }
        }

        // Extract Skills
        const skillBoxes = document.querySelectorAll('.skill-box h4');
        context.skills = Array.from(skillBoxes).map(skill => skill.textContent.trim());

        // Extract Contact Information
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            const infoItems = contactSection.querySelectorAll('.info-item');
            infoItems.forEach(item => {
                const heading = item.querySelector('h3');
                const detail = item.querySelector('p');
                if (heading && detail) {
                    const key = heading.textContent.trim().toLowerCase();
                    context.contact[key] = detail.textContent.trim();
                }
            });
        }

        return context;
    }

    // Function to send a message with website context
    async function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        addMessage("You", userMessage);
        chatInput.value = "";

        try {
            // Extract website content for context
            const websiteContext = extractWebsiteContext();
            
            // Create a comprehensive context string
            const contextString = `
                WEBSITE CONTENT CONTEXT:
                
                Personal Information:
                - Name: ${websiteContext.personalInfo.name}
                - Role: ${websiteContext.personalInfo.title}
                
                About:
                ${websiteContext.about}
                
                Key Highlights:
                ${websiteContext.personalInfo.highlights ? websiteContext.personalInfo.highlights.join('\n') : ''}
                
                Work Experience:
                ${websiteContext.workExperience.map(exp => `
                    ${exp.title} (${exp.date})
                    ${exp.description}
                    Responsibilities: ${exp.responsibilities.join('; ')}
                `).join('\n')}
                
                Projects:
                ${websiteContext.projects.map(proj => `
                    ${proj.name}
                    Tech Stack: ${proj.techStack}
                    Details: ${proj.details.join('; ')}
                `).join('\n')}
                
                Publications:
                ${websiteContext.publications.map(pub => `
                    ${pub.title}
                    Conference: ${pub.conference}
                    ${pub.details.join('; ')}
                `).join('\n')}
                
                Skills:
                ${websiteContext.skills.join(', ')}
                
                Contact Information:
                ${Object.entries(websiteContext.contact).map(([key, value]) => `${key}: ${value}`).join('\n')}
                
                USER QUESTION: ${userMessage}
            `;

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    message: userMessage,
                    context: contextString,
                    websiteData: websiteContext
                })
            });

            const data = await response.json();
            const botMessage = data.reply || "Sorry, I couldn't understand that.";
            addMessage("Chatbot", botMessage);
        } catch (error) {
            console.error("Chat error:", error);
            addMessage("Chatbot", "Error: Unable to reach the chat service. Try again later.");
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
