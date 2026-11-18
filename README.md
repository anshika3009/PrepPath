# PrepPath Pro — Interactive Student Placement Preparation Portal

A modern, full-featured frontend placement preparation workstation built with vanilla **HTML5**, **CSS3**, and **JavaScript (ES6+)**. Designed to give students an interactive, gamified, and practical experience to prepare for campus placements and technical interviews.

---

## 🌟 Key Features & Advancements

### 1. 🎯 Dynamic Placement Readiness Command Center
- **Live Circular Radial Gauge**: Real-time readiness score (0–100%) dynamically synthesized from:
  - Aptitude & Coding Quiz performance (30%)
  - Mock Interview Flashcards mastery (30%)
  - Action Roadmap & Checklist completion (30%)
  - Opportunities bookmarked and tracked (10%)
- **Dynamic Tier Badges**: Automatically updates from *Explorer* ➔ *Apprentice* ➔ *Candidate* ➔ *Placement Ready* ➔ *Campus Top Tier*.
- **Prep Streak Counter**: Tracks daily preparation consistency with streak counters.

### 2. 🧠 Adaptive Aptitude, Core CS & Coding Quiz Arena
- **6 Knowledge Domains**:
  - Quantitative Aptitude (Percentages, Time & Work, Speed & Distance, Probability)
  - Logical Reasoning (Number sequences, Coding-Decoding, Blood relations)
  - Data Structures & Algorithms (HashTables, BFS/DFS, QuickSort, LRU Cache)
  - Web & JavaScript (Closures, Event Loop, CSS Grid)
  - SQL & DBMS (ACID properties, HAVING vs WHERE, Foreign Keys)
  - Core CS (OS Deadlocks, TCP vs UDP)
- **3 Practice Modes**:
  - *Practice Mode*: Untimed, hints available, instant explanations.
  - *Timed Sprint*: 45-second timer per question with sound ticks and urgent color warnings.
  - *Assessment Simulator*: Real exam simulation.
- **50:50 Lifeline**: Eliminates two incorrect choices.
- **Question Navigator Palette**: Numbered grid showing current, answered, and unanswered questions with 1-click jump.
- **Post-Assessment Analytics**: Accuracy %, percentile estimation, time spent, confetti celebration, retake full quiz, or retry missed questions only.

### 3. 🎙️ Mock Interview & Flashcard Studio
- **3D Flip Flashcards**: High-yield technical, system design, and behavioral questions.
- **Self-Assessment Mastery Tracker**: Mark cards as *✓ Mastered* or *↻ Need Revision* to build your mastery index.
- **Text-to-Speech**: Listen to interview questions spoken aloud via Web Speech API (`window.speechSynthesis`).
- **Oral Speech Practice**: Record your voice answers with live transcription (`webkitSpeechRecognition`), speaking pace counter (WPM), word count, and 1-click transcript copying.
- **Personal Question Builder**: Add custom university-specific or company-specific questions to your personal deck.

### 4. 💼 Career Opportunities & Application Pipeline Tracker
- **Curated Roles**: SDE Internships, Full Stack, Data Analyst, AI/ML, and Systems Engineers (Google, Microsoft, Razorpay, Atlassian, Swiggy, Zepto, Infosys, TCS).
- **Multi-Faceted Search & Filters**: Filter by domain, job type (Internship vs Fresher), work mode (Remote, Hybrid, On-site), and tech stack.
- **Application Stage Pipeline**: Track each role from *Not Applied* ➔ *Applied* ➔ *OA Round* ➔ *Interview* ➔ *Offer Received* ➔ *Rejected*, with personal notes.
- **Bookmarks**: Save favorite openings with local persistence.

### 5. 📄 ATS Resume Scanner & Keyword Optimizer
- **Role-Targeted Analysis**: Tailored for Full Stack, Frontend, Backend, Data Analyst, and Cloud/DevOps roles.
- **ATS Match Score**: Real-time percentage match calculated against industry keywords.
- **Keyword Pills**: Highlights matched keywords (green) and recommends missing competencies (red/orange).
- **Action Verbs & Impact Metric Detector**: Analyzes power verbs (*spearheaded*, *optimized*, *engineered*) and quantifiable metrics (*40%*, *10k users*).
- **1-Click Sample Resume**: Instantly loads a sample student resume for demonstration.

### 6. ⚡ Rapid Placement Cheat Sheets
- **Big-O Complexity Matrix**: Average and worst-case time & space complexity for Arrays, Linked Lists, HashMaps, BSTs, and Sorting Algorithms.
- **Top SQL Interview Queries**: Nth highest salary, Dense Rank partitions, duplicate rows, and self-joins with **1-click syntax copy**.
- **OOP in 60 Seconds**: Clean breakdown of Encapsulation, Abstraction, Inheritance, and Polymorphism with code snippets.
- **STAR Response Builder**: Interactive form (Situation, Task, Action, Result) generating structured answers for behavioral interviews.

### 7. 🏆 Gamification, Badges & Report Export
- **Custom Goal Creator**: Add, check off, or delete custom preparation goals.
- **8 Unlockable Placement Badges**: Visual unlock celebrations with sound effects and canvas confetti.
- **Export Placement Report**: Generates and downloads a clean, printable `.txt` summary of your preparation statistics.

### 8. 🎨 Modern UI & Sound FX
- **Dark / Light Mode**: One-click theme toggle with seamless CSS transitions.
- **Synthesized Web Audio FX**: Clean, zero-external-asset audio chimes for clicks, correct answers, wrong buzzers, and victory fanfares (with mute toggle).
- **Canvas Confetti**: High-performance celebration particle engine.
- **100% Client-Side**: Completely self-contained, no node modules or build steps needed. Works out of the box when opening `index.html`.

---

## 🚀 How to Run

1. Open the project folder `PrepPath_Project`.
2. Double-click or open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Brave, Firefox, Safari).
3. No build tools, npm packages, or server installations required!

---

## 📁 File Structure

```text
PrepPath_Project/
├── index.html       # Semantic, accessible UI structure & SVG icons
├── style.css        # Responsive design system, CSS variables, Dark/Light mode & 3D animations
├── script.js        # Core logic: Web Audio, Confetti, Quiz Engine, Speech, ATS Scanner & Storage
├── README.md        # Project documentation
└── backup/          # Backup of the original project files
```
