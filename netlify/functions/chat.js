// netlify/functions/api-chat.js
// Serverless handler for /api/chat on Netlify

const fetch = require('node-fetch'); // Netlify includes this
require('dotenv').config(); // For local testing; Netlify uses dashboard env vars

// Full resume content (updated from your latest PDF—cleaned for accuracy)
const fullResumeContent = `Utkarsh Gupta
+91 9529133103 itsutkarsh1207@gmail.com
LinkedIn GitHub
Education
Indian Institute of Technology Dharwad 2022 – Current
B.Tech, Computer Science And Engineering CPI: 9.17
Work Experience
AI Intern Jun 2025 - Present Dvara-E-Registry
• Developed and implemented a price imputation pipeline for commodities, utilizing weighted correlation imputation with a 365-day rolling window to accurately fill missing price data by leveraging correlated market trends.
• Analyzed and visualized commodity price data using statistical techniques like Lasso regression and Plotly, achieving reliable imputation results (e.g., R² 0.8) for enhanced market forecasting and decision-making.
Summer Research and Development Internship May 2024 - Jul 2024 FutureGNetworks Lab, IIT Dharwad
• Led experimental research for resource profiling in virtualized Radio Access Networks (vRAN), employing scalable multi-core server infrastructure and a Kubernetes-based 5G testbed under the guidance of Prof. Koteswarao Kondepu.
• Integrated open-source power monitoring and system profiling tools (KEPLER, Prometheus, Grafana) into containerized 5G RAN deployments to enable real-time telemetry of CPU, cache, memory bandwidth, and energy metrics.
• Built automated workload generation and dynamic resource allocation workflows using iperf3, evaluating throughput, CPU utilization, LLC cache allocation, and memory bandwidth across deployment models (Monolithic RAN, Disaggregated RAN, C/U-plane separation).
Publications
Research Paper - IEEE ANTS 2024 Dec 14, 2024 – Dec 18, 2024 IEEE ComSoc | 5G vRAN, Energy Profiling, Kubernetes, Prometheus, Grafana IIT Guwahati, India
• Analyzed Radio Access Network (RAN) components of cellular networks focusing on CPU utilization, LLC (Last-Level Cache) ways allocation, and memory bandwidth efficiency.
• Co-authored and published research paper in the IEEE ANTS Conference 2024.
Projects
AI Playwright | Scikit-learn, NLTK, Pandas, NumPy, Pytorch
• Developed a custom subword tokenizer inspired by BPE and WordPiece to efficiently handle rare words and reduce vocabulary size for NLP tasks.
• Built a lightweight GPT-style language model from scratch using PyTorch, including custom attention, feedforward layers, and training loop on tokenized text data.
• Trained and evaluated the transformer model, achieving low perplexity on the test set, with checkpointing and inference capabilities for custom sentence generation.
College Tech Fest Website | ReactJS, ExpressJS, HTML5, JavaScript, React Three Fiber, Tailwind
• Contributed to a React-based 3D web experience using React Three Fiber and Three.js for an interactive and immersive event website.
• Utilized Tailwind CSS and Vite to build responsive, high-performance UI components with efficient styling and fast development workflows.
• Integrated 3D assets and animations into the frontend enhancing visual appeal and user engagement.
DDoS attack Detection and Mitigation in SDN | Python, Mininet, Ryu Controller, scikit-learn, OpenFlow, hping3
• Developed a real-time ML-based intrusion detection system for SDN environments, achieving 98.6% accuracy using Random Forest.
• Constructed a dynamic DDoS mitigation framework with the Ryu controller and OpenFlow, enabling automatic detection and blocking within 5 seconds while maintaining > 80% legitimate traffic throughput post-mitigation.
• Automated traffic simulation and aggregation in a 6-switch, 18-host Mininet topology, validating robustness across TCP-SYN, ICMP, and UDP attacks with low false positives and high availability.
Certifications
HackerRank — SQL Skill Test Certification: Basic, Intermediate, Advanced
Technical Skills
Languages: C/C++, Python, JavaScript, Bash
Frameworks / Testing: NodeJS, ExpressJS, ReactJS, MySQL, MongoDB
DevOps: Kubernetes, Docker, Prometheus, Grafana
Key Courses: Data Structures and Algorithms, Design and Analysis of Algorithms, Deep Learning, Operating Systems, DBMS
Achievements
General Secretary Academic Affairs (2025-26) and Junior General Secretary Academic Affairs (2022-24)
Assistant Student Mentor Coordinator, Student Mentorship Program (SMP), IIT Dharwad
Public Relations Coordinator, Career Development Cell (CDC), IIT Dharwad
Class XII Achievement: INSPIRE Scholarship awardee (Top 1%) for securing top percentile in Maharashtra Board (2021-22)`;

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = JSON.parse(event.body || '{}');
  const { message, history, websiteData, context: userContext } = body;

  if (!message || typeof message !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing message' }) };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing OPENAI_API_KEY' }) };
  }

  // Debug logging (view in Netlify's "Functions" tab)
  console.log('Query:', message);
  console.log('websiteData received:', !!websiteData);
  console.log('userContext length:', userContext ? userContext.length : 0);

  try {
    // Build full context (site data + resume)
    let fullSystemPrompt = '';
    if (websiteData || userContext) {
      const hasValidData = websiteData && (websiteData.personalInfo || websiteData.projects || websiteData.workExperience);
      if (hasValidData) {
        fullSystemPrompt = `You are Utkarsh Gupta's portfolio AI assistant. Base answers ONLY on the data below—NEVER say "couldn't understand" or evade. Use bullets for lists. Keep <100 words.

EXAMPLES:
"Who is Utkarsh?": "Utkarsh Gupta is a Final Year B.Tech CSE student at IIT Dharwad (CPI 9.17)."
"What is website about?": "Utkarsh Gupta's portfolio: education, experience, projects, skills."
"Projects?": Bullets from PROJECTS.

PERSONAL: ${JSON.stringify(websiteData.personalInfo)}
ABOUT: ${websiteData.about}
HIGHLIGHTS: ${websiteData.personalInfo?.highlights?.join('; ') || ''}
EXPERIENCE: ${JSON.stringify(websiteData.workExperience)}
PROJECTS: ${JSON.stringify(websiteData.projects)}
PUBLICATIONS: ${JSON.stringify(websiteData.publications)}
SKILLS: ${websiteData.skills?.join(', ') || ''}
CONTACT: ${JSON.stringify(websiteData.contact)}

FULL RESUME: ${fullResumeContent}`;
      } else if (userContext) {
        fullSystemPrompt = `You are Utkarsh Gupta's portfolio AI assistant. Base answers ONLY on the data below—NEVER say "couldn't understand" or evade.

${userContext}

FULL RESUME: ${fullResumeContent}`;
      }
    } else {
      fullSystemPrompt = 'You are Utkarsh Gupta\'s portfolio AI. Use the resume below for all answers.';
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...(Array.isArray(history) ? history : []),
          { role: 'user', content: message }
        ],
        temperature: 0.0,
        max_tokens: 150
      })
    });

    const data = await openaiResponse.json();
    if (!openaiResponse.ok) {
      console.error('OpenAI error:', data);
      return { statusCode: openaiResponse.status, body: JSON.stringify({ error: data.error?.message || 'API error' }) };
    }

    const reply = data.choices?.[0]?.message?.content || 'Try rephrasing your question about Utkarsh.';
    console.log('Reply:', reply);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    console.error('Handler error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
  }
};