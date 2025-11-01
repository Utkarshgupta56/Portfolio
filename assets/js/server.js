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

    // Full resume content as static string (extracted from Resume.pdf)
    const fullResumeContent = `
Utkarsh Gupta
+91 9529133103 itsutkarsh1207@gmail.com
LinkedIn
GitHub
Education
Indian Institute of Technology Dharwad
2022 – Current
B.Tech, Computer Science And Engineering
CPI: 9.17
Work Experience
AI Intern
Jun 2025 - Present
Dvara-E-Registery

• Developed and implemented a price imputation pipeline for commodities, utilizing weighted correlation
imputation with a 365-day rolling window to accurately fill missing price data by leveraging correlated market
trends.

• Analyzed and visualized commodity price data using statistical techniques like Lasso regression and Plotly, achieving
reliable imputation results (e.g., R² 0.8) for enhanced market forecasting and decision-making.

Summer Research and Development Internship
May 2024 - Jul 2024
FutureGNetworks Lab, IIT Dharwad

• Led experimental research for resource profiling in virtualized Radio Access Networks (vRAN), employing scalable
multi-core server infrastructure and a Kubernetes-based 5G testbed under the guidance of Prof. Koteswarao Kondepu.

• Integrated open-source power monitoring and system profiling tools (KEPLER, Prometheus, Grafana) into
containerized 5G RAN deployments to enable real-time telemetry of CPU, cache, memory bandwidth, and
energy metrics.

• Built automated workload generation and dynamic resource allocation workflows using iperf3, evaluating
throughput, CPU utilization, LLC cache allocation, and memory bandwidth across deployment models
(Monolithic RAN, Disaggregated RAN, C/U-plane separation).

Publications
Research Paper - IEEE ANTS 2024
Dec 14, 2024 – Dec 18, 2024
IEEE ComSoc | 5G vRAN, Energy Profiling, Kubernetes, Prometheus, Grafana
IIT Guwahati, India

• Analyzed Radio Access Network (RAN) components of cellular networks focusing on CPU utilization, LLC
(Last-Level Cache) ways allocation, and memory bandwidth efficiency.

• Co-authored and published research paper in the IEEE ANTS Conference 2024.

Projects

AI Playwright | Scikit-learn, NLTK, Pandas, NumPy, Pytorch

• Developed a custom subword tokenizer inspired by BPE and WordPiece to efficiently handle rare words and reduce
vocabulary size for NLP tasks.

• Built a lightweight GPT-style language model from scratch using PyTorch, including custom attention,
feedforward layers, and training loop on tokenized text data.

• Trained and evaluated the transformer model, achieving low perplexity on the test set, with checkpointing and
inference capabilities for custom sentence generation.

College Tech Fest Website | ReactJS, ExpressJS, HTML5, JavaScript, React Three Fiber, Tailwind

• Contributed to a React-based 3D web experience using React Three Fiber and Three.js for an interactive
and immersive event website.

• Utilized Tailwind CSS and Vite to build responsive, high-performance UI components with efficient styling and fast
development workflows.

• Integrated 3D assets and animations into the frontend enhancing visual appeal and user engagement.

DDoS attack Detection and Mitigation in SDN | Python, Mininet, Ryu Controller, scikit-learn, OpenFlow, hping3

• Developed a real-time ML-based intrusion detection system for SDN environments, achieving 98.6% accuracy using
Random Forest. .

• Constructed a dynamic DDoS mitigation framework with the Ryu controller and OpenFlow, enabling
automatic detection and blocking within 5 seconds while maintaining > 80% legitimate traffic throughput
post-mitigation.

• Automated traffic simulation and aggregation in a 6-switch, 18-host Mininet topology, validating robustness
across TCP-SYN, ICMP, and UDP attacks with low false positives and high availability.

Certifications
HackerRank — SQL Skill Test Certification: Basic, Intermediate, Advanced

Technical Skills

Languages: C/C++, Python, JavaScript, Bash
Frameworks / Testing: NodeJS, ExpressJS, ReactJS,MySQL, MongoDB
DevOps: Kubernetes, Docker, Prometheus, Grafana
Key Courses: Data Structures and Algorithms, Design and Analysis of Algorithms, Deep Learning, Operating
Systems,DBMS

Achievements
General Secretary Academic Affairs (2025-26) and Junior General Secretary Academic Affairs (2022-24)
Assistant Student Mentor Coordinator, Student Mentorship Program(SMP), IIT Dharwad
Public Relations Coordinator, Carrer Development Cell (CDC), IIT Dharwad
Class XII Achievement: INSPIRE Scholarship awardee (Top 1%) for securing top percentile in Maharashtra
Board (2021-22)
    `;

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

FULL RESUME CONTENT:
${fullResumeContent}

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