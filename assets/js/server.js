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
            
            if (titleEl && (titleEl.textContent.includes('Website') || 
                titleEl.textContent.includes('AI') || titleEl.textContent.includes('DDoS'))) {
                const project = {
                    name: titleEl.textContent.trim(),
                    techStack: techStackEl ? techStackEl.textContent.trim() : "",
                    details: Array.from(detailsEl).map(d => d.textContent.trim())
                };
                context.projects.push(project);
            }
        });

        // Extract Publications
        const publicationTitles = document.querySelectorAll('.resume-title');
        publicationTitles.forEach(titleEl => {
            if (titleEl.textContent.includes('Publications')) {
                const pubCard = titleEl.closest('.resume-card');
                if (pubCard) {
                    const pubItems = pubCard.querySelectorAll('.resume-item');
                    pubItems.forEach(pubItem => {
                        const pubTitle = pubItem.querySelector('h4');
                        const pubDate = pubItem.querySelector('h5');
                        const pubDetails = pubItem.querySelectorAll('ul li');
                        
                        if (pubTitle) {
                            context.publications.push({
                                title: pubTitle.textContent.trim(),
                                conference: pubDate ? pubDate.textContent.trim() : "",
                                details: Array.from(pubDetails).map(d => d.textContent.trim())
                            });
                        }
                    });
                }
            }
        });

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
            
            // Create a comprehensive system message with all resume/portfolio information
            const systemMessage = `You are an AI assistant for Utkarsh Gupta's portfolio website. You have access to all information about Utkarsh from his portfolio.

PERSONAL INFORMATION:
Name: ${websiteContext.personalInfo.name}
Role: ${websiteContext.personalInfo.title}

ABOUT:
${websiteContext.about}

KEY HIGHLIGHTS:
${websiteContext.personalInfo.highlights ? websiteContext.personalInfo.highlights.join('\n') : ''}

WORK EXPERIENCE:
${websiteContext.workExperience.map(exp => `
${exp.title} (${exp.date})
${exp.description}
Key Responsibilities:
${exp.responsibilities.map(r => '- ' + r).join('\n')}`).join('\n\n')}

PROJECTS:
${websiteContext.projects.map(proj => `
${proj.name}
${proj.techStack}
Project Details:
${proj.details.map(d => '- ' + d).join('\n')}`).join('\n\n')}

PUBLICATIONS:
${websiteContext.publications.map(pub => `
${pub.title}
${pub.conference}
${pub.details.map(d => '- ' + d).join('\n')}`).join('\n\n')}

SKILLS:
${websiteContext.skills.join(', ')}

CONTACT INFORMATION:
${Object.entries(websiteContext.contact).map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`).join('\n')}

Your role is to answer questions about Utkarsh's background, experience, projects, skills, and provide helpful information to visitors. Be professional, concise, and helpful.`;

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer YOUR_API_KEY_HERE" // Replace with your actual API key
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: systemMessage },
                        { role: "user", content: userMessage }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            const data = await response.json();
            const botMessage = data.choices[0]?.message?.content || "AI couldn't understand your request.";
            addMessage("AI", botMessage);
        } catch (error) {
            console.error("Chat error:", error);
            addMessage("AI", "Error: Unable to fetch response. Please try again.");
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
