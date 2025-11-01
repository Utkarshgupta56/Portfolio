// Simple proxy server for Mistral AI Chat Completions
// Usage: MISTRAL_API_KEY=your_key node server.js (for local testing)
// On Netlify, use the netlify/functions/api-chat.js for production

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

// Full resume content as static string (updated from latest Resume.pdf)
const fullResumeContent = `Utkarsh Gupta
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
Dvara-E-Registry

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
Random Forest.

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
Board (2021-22)`;

app.post('/api/chat', async (req, res) => {
  const { message, history, websiteData, context } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing message' });
  }

  const apiKey = process.env.MISTRAL_API_KEY;  // Changed to Mistral key
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing MISTRAL_API_KEY' });
  }

  // Debug logging (remove in production after testing)
  console.log('Query:', message);
  console.log('websiteData received:', !!websiteData);
  if (websiteData) console.log('websiteData keys:', Object.keys(websiteData));
  console.log('context length:', context ? context.length : 0);

  try {
    // ALWAYS build and use full context first—ensure it's sent before user message
    let fullContext = '';
    if (websiteData || context) {
      // Force context usage: Validate and build prompt
      const hasValidData = websiteData && (websiteData.personalInfo || websiteData.projects || websiteData.workExperience);
      if (hasValidData) {
        fullContext = `You are Utkarsh Gupta's portfolio AI assistant. STEP 1: Scan the EXACT data below (including FULL RESUME CONTENT) for facts. STEP 2: Answer ONLY using those facts—NEVER say "I don't know," "couldn't understand," or invent details. If no match, quote the closest section or redirect. STEP 3: Keep under 100 words; use bullets for lists. STEP 4: For off-topic, redirect: "Let's talk Utkarsh's portfolio—education, projects, or experience?"

EXAMPLE (FOLLOW STRICTLY):
User: "Who is Utkarsh?" → "Utkarsh Gupta is a Final Year B.Tech student in Computer Science and Engineering at IIT Dharwad (CPI: 9.17)."
User: "What is the website about?" → "This is Utkarsh Gupta's professional portfolio showcasing his education, work experience, projects, publications, skills, and achievements."
User: "What does he study?" → "B.Tech in Computer Science and Engineering at Indian Institute of Technology Dharwad (CPI: 9.17)."
User: "Projects?" → "- AI Playwright: Custom tokenizer and lightweight GPT model using PyTorch.\n- College Tech Fest Website: 3D interactive site with React Three Fiber.\n- DDoS Detection in SDN: ML-based system with 98.6% accuracy."
User: "Today's time?" → "I'm focused on Utkarsh's portfolio—ask about his AI Intern role!"

PERSONAL INFORMATION:
Name: ${websiteData.personalInfo?.name || 'Utkarsh Gupta'}
Role: ${websiteData.personalInfo?.title || 'Final Year CSE Undergraduate at IIT Dharwad'}

ABOUT: ${websiteData.about || ''}

KEY HIGHLIGHTS: ${websiteData.personalInfo?.highlights?.join('\n') || ''}

WORK EXPERIENCE:
${(websiteData.workExperience || []).map(exp => `- ${exp.title} (${exp.date}): ${exp.description}\n  Responsibilities: ${exp.responsibilities.join('; ')}`).join('\n') || 'See FULL RESUME CONTENT'}

PROJECTS:
${(websiteData.projects || []).map(proj => `- ${proj.name}: ${proj.techStack}\n  Details: ${proj.details.join('; ')}`).join('\n') || 'See FULL RESUME CONTENT'}

PUBLICATIONS:
${(websiteData.publications || []).map(pub => `- ${pub.title} (${pub.conference}): ${pub.details.join('; ')}`).join('\n') || 'See FULL RESUME CONTENT'}

SKILLS: ${(websiteData.skills || []).join(', ') || 'See FULL RESUME CONTENT'}

CONTACT: ${Object.entries(websiteData.contact || {}).map(([k, v]) => `${k}: ${v}`).join('\n') || 'See FULL RESUME CONTENT'}

FULL RESUME CONTENT (MANDATORY REFERENCE FOR ALL QUERIES—READ THIS FIRST):
${fullResumeContent}`;
      } else if (context) {
        // Fallback to context string
        fullContext = `You are Utkarsh Gupta's portfolio AI assistant. STEP 1: Scan the EXACT data below (including FULL RESUME CONTENT) for facts. STEP 2: Answer ONLY using those facts—NEVER say "I don't know," "couldn't understand," or invent details. If no match, quote the closest section or redirect. STEP 3: Keep under 100 words; use bullets for lists. STEP 4: For off-topic, redirect: "Let's talk Utkarsh's portfolio—education, projects, or experience?"

EXAMPLE (FOLLOW STRICTLY):
User: "Who is Utkarsh?" → "Utkarsh Gupta is a Final Year B.Tech student in Computer Science and Engineering at IIT Dharwad (CPI: 9.17)."
User: "What is the website about?" → "This is Utkarsh Gupta's professional portfolio showcasing his education, work experience, projects, publications, skills, and achievements."
User: "What does he study?" → "B.Tech in Computer Science and Engineering at Indian Institute of Technology Dharwad (CPI: 9.17)."
User: "Projects?" → "- AI Playwright: Custom tokenizer and lightweight GPT model using PyTorch.\n- College Tech Fest Website: 3D interactive site with React Three Fiber.\n- DDoS Detection in SDN: ML-based system with 98.6% accuracy."
User: "Today's time?" → "I'm focused on Utkarsh's portfolio—ask about his AI Intern role!"

${context}

FULL RESUME CONTENT (MANDATORY REFERENCE FOR ALL QUERIES—READ THIS FIRST):
${fullResumeContent}`;
      } else {
        console.warn('No valid context—using fallback prompt');
        fullContext = 'You are a concise assistant for Utkarsh\'s portfolio site. Be brief and helpful.';
      }
    } else {
      console.error('No context provided—responses will be generic');
      fullContext = 'You are a concise assistant for Utkarsh\'s portfolio site. Be brief and helpful.';
    }

    // Now send the full context as system prompt, followed by user message (Mistral API)
    const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',  // Fast & cheap; upgrade to 'mistral-large-latest' for more complex queries
        messages: [
          { role: 'system', content: fullContext },  // Full context ALWAYS first
          ...(Array.isArray(history) ? history : []),
          { role: 'user', content: message }  // User query after context
        ],
        temperature: 0.0,  // Factual only—no creativity or "sorry" evasions
        max_tokens: 150,   // Super concise
        top_p: 0.8         // Tight focus on provided data
      })
    });

    const data = await mistralResponse.json();
    if (!mistralResponse.ok) {
      return res.status(mistralResponse.status).json({ error: data.error || 'Mistral API error' });
    }

    const reply = data.choices?.[0]?.message?.content || 'Sorry, something went wrong—try rephrasing.';
    console.log('Generated reply:', reply);  // Log for debugging
    return res.json({ reply });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Upstream error', details: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});