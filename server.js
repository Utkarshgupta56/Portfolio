// Simple proxy server for Groq Chat Completions
// Usage: GROQ_API_KEY=your_key node server.js

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // v2
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files (index.html, assets, etc.) from project root
app.use(express.static(path.join(__dirname)));

// Root route -> index.html
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

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

app.post('/api/chat', async (req, res) => {
  const { message, history, websiteData, context } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing message' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing GROQ_API_KEY' });
  }

  try {
    let systemMessage = 'You are a concise assistant for Utkarsh\'s portfolio site. Be brief and helpful.';
    
    if (websiteData || context) {
      // Prioritize websiteData object if available, fallback to context string
      if (websiteData) {
        // Build comprehensive system message from websiteData
        systemMessage = `You are an AI assistant for Utkarsh Gupta's portfolio website. You have access to all information about Utkarsh from his portfolio. ONLY use the information provided below. Do not add external knowledge, hallucinate details, or reference anything not explicitly stated here. If a question is unrelated to Utkarsh or the portfolio, politely redirect to portfolio topics.

PERSONAL INFORMATION:
Name: ${websiteData.personalInfo.name || 'Utkarsh Gupta'}
Role: ${websiteData.personalInfo.title || 'Final Year CSE Undergraduate at IIT Dharwad'}

ABOUT:
${websiteData.about || ''}

KEY HIGHLIGHTS:
${websiteData.personalInfo.highlights ? websiteData.personalInfo.highlights.join('\n') : ''}

WORK EXPERIENCE:
${(websiteData.workExperience || []).map(exp => `
${exp.title} (${exp.date})
${exp.description}
Key Responsibilities:
${exp.responsibilities.map(r => '- ' + r).join('\n')}`).join('\n\n') || ''}

PROJECTS:
${(websiteData.projects || []).map(proj => `
${proj.name}
${proj.techStack}
Project Details:
${proj.details.map(d => '- ' + d).join('\n')}`).join('\n\n') || ''}

PUBLICATIONS:
${(websiteData.publications || []).map(pub => `
${pub.title}
${pub.conference}
${pub.details.map(d => '- ' + d).join('\n')}`).join('\n\n') || ''}

SKILLS:
${(websiteData.skills || []).join(', ')}

CONTACT INFORMATION:
${Object.entries(websiteData.contact || {}).map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`).join('\n')}

FULL RESUME CONTENT:
${fullResumeContent}

Your role is to answer questions about Utkarsh's background, experience, projects, skills, and provide helpful information to visitors. Be professional, concise, and helpful. Always base responses on the provided data.`;
      } else if (context) {
        // Fallback: Use the context string directly as system prompt (if websiteData missing)
        systemMessage = `You are an AI assistant for Utkarsh Gupta's portfolio website. ONLY use the information provided below. Do not add external knowledge, hallucinate details, or reference anything not explicitly stated here. If a question is unrelated to Utkarsh or the portfolio, politely redirect to portfolio topics.

${context}

Your role is to answer questions about Utkarsh's background, experience, projects, skills, and provide helpful information to visitors. Be professional, concise, and helpful. Always base responses on the provided data.`;
      }
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemMessage },
          ...(Array.isArray(history) ? history : []),
          { role: 'user', content: message }
        ],
        temperature: 0.1,  // Lowered for more deterministic, less hallucinated responses
        max_tokens: 300    // Limit to keep responses concise
      })
    });

    const data = await groqResponse.json();
    if (!groqResponse.ok) {
      return res.status(groqResponse.status).json({ error: data.error || 'Groq API error' });
    }

    const reply = data.choices?.[0]?.message?.content || '';
    return res.json({ reply });
  } catch (err) {
    return res.status(500).json({ error: 'Upstream error', details: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});