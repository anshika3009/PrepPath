/**
 * PrepPath Pro — Core Application Logic
 * Modern, Interactive Placement Preparation Portal
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. SOUND & AUDIO FX ENGINE (Web Audio API - Zero External Dependencies)
     ========================================================================== */
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem('preppath_sound') !== 'false';
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('preppath_sound', this.enabled);
      return this.enabled;
    }

    playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.warn('Audio play error', e);
      }
    }

    click() {
      this.playTone(600, 'sine', 0.06, 0.04);
    }

    correct() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.08, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.2);
        });
      } catch (e) {}
    }

    wrong() {
      this.playTone(180, 'sawtooth', 0.25, 0.08);
    }

    fanfare() {
      if (!this.enabled) return;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.2, 0.1), i * 90);
      });
    }

    tick() {
      this.playTone(850, 'sine', 0.04, 0.03);
    }
  }

  const sound = new SoundEngine();

  /* ==========================================================================
     2. CONFETTI CELEBRATION ENGINE (Canvas-based)
     ========================================================================== */
  class ConfettiEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.particles = [];
      this.animId = null;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    burst(count = 75) {
      if (!this.ctx) return;
      this.resize();
      const colors = ['#4f46e5', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: this.canvas.width / 2 + (Math.random() - 0.5) * 300,
          y: this.canvas.height * 0.45,
          vx: (Math.random() - 0.5) * 14,
          vy: -Math.random() * 12 - 4,
          size: Math.random() * 7 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 10,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.01
        });
      }
      if (!this.animId) {
        this.animate();
      }
    }

    animate() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.rotSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(idx, 1);
          return;
        }

        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        this.ctx.restore();
      });

      if (this.particles.length > 0) {
        this.animId = requestAnimationFrame(() => this.animate());
      } else {
        this.animId = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  }

  const confetti = new ConfettiEngine('confettiCanvas');

  /* ==========================================================================
     3. TOAST NOTIFICATION HUB
     ========================================================================== */
  function showToast(message, type = 'info') {
    const hub = document.getElementById('toastHub');
    if (!hub) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warn') icon = '⚠️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    hub.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /* ==========================================================================
     4. DATA STORES: QUIZ, JOBS, INTERVIEW & CHEATSHEET
     ========================================================================== */
  const QUIZ_DATABASE = [
    // Aptitude & Quantitative
    {
      id: 'apt-1',
      category: 'Aptitude',
      difficulty: 'Easy',
      question: 'What is 15% of 240?',
      options: ['32', '36', '40', '48'],
      answer: 1,
      hint: '10% of 240 is 24, and 5% is 12.',
      explanation: '15% of 240 = (15 / 100) × 240 = 24 + 12 = 36.'
    },
    {
      id: 'apt-2',
      category: 'Aptitude',
      difficulty: 'Medium',
      question: 'A train 120m long passes a pole in 6 seconds. What is the speed of the train in km/h?',
      options: ['60 km/h', '72 km/h', '80 km/h', '90 km/h'],
      answer: 1,
      hint: 'Speed in m/s = Distance / Time. Multiply by (18/5) for km/h.',
      explanation: 'Speed = 120 / 6 = 20 m/s. In km/h: 20 × (18 / 5) = 72 km/h.'
    },
    {
      id: 'apt-3',
      category: 'Aptitude',
      difficulty: 'Medium',
      question: 'A and B can do a job together in 12 days. If A alone takes 20 days, how long does B take alone?',
      options: ['25 days', '30 days', '35 days', '40 days'],
      answer: 1,
      hint: '1/B = 1/Total - 1/A. That is: 1/12 - 1/20.',
      explanation: "B's 1-day work = 1/12 - 1/20 = (5 - 3)/60 = 2/60 = 1/30. So B needs 30 days."
    },
    {
      id: 'apt-4',
      category: 'Aptitude',
      difficulty: 'Hard',
      question: 'Two dice are rolled simultaneously. What is the probability of getting a sum equal to 8?',
      options: ['5/36', '1/6', '7/36', '1/9'],
      answer: 0,
      hint: 'Pairs that sum to 8: (2,6), (3,5), (4,4), (5,3), (6,2).',
      explanation: 'Total outcomes = 36. Favorable outcomes = {(2,6), (3,5), (4,4), (5,3), (6,2)} = 5. Probability = 5/36.'
    },

    // Logical Reasoning
    {
      id: 'log-1',
      category: 'Logical',
      difficulty: 'Easy',
      question: 'What is the next number in the sequence: 3, 7, 15, 31, __?',
      options: ['48', '56', '63', '64'],
      answer: 2,
      hint: 'Each number is multiplied by 2 plus 1, or pattern: +4, +8, +16, +32.',
      explanation: '31 × 2 + 1 = 63 (or 31 + 32 = 63).'
    },
    {
      id: 'log-2',
      category: 'Logical',
      difficulty: 'Medium',
      question: 'If CLOCK is coded as KCOLC, then WATCH is coded as:',
      options: ['HCTAW', 'HCTWA', 'HTCAW', 'WTACH'],
      answer: 0,
      hint: 'Notice the reverse string transformation.',
      explanation: 'The word is simply reversed. WATCH backwards is HCTAW.'
    },
    {
      id: 'log-3',
      category: 'Logical',
      difficulty: 'Medium',
      question: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
      options: ['Brother', 'Uncle', 'Father', 'Grandfather'],
      answer: 2,
      hint: 'The only son of Suresh’s mother is Suresh himself.',
      explanation: 'Suresh’s mother has only one son, who is Suresh. The boy is his son. Therefore Suresh is the father.'
    },

    // DSA & Coding
    {
      id: 'dsa-1',
      category: 'DSA',
      difficulty: 'Easy',
      question: 'Which data structure is used for Breadth-First Search (BFS) in a Graph?',
      options: ['Stack', 'Queue', 'Priority Queue', 'Binary Tree'],
      answer: 1,
      hint: 'BFS explores level-by-level (First-In, First-Out).',
      explanation: 'A Queue (FIFO) is utilized in BFS traversal to maintain nodes in arrival order.'
    },
    {
      id: 'dsa-2',
      category: 'DSA',
      difficulty: 'Medium',
      question: 'What is the average time complexity of searching an element in a Hash Table?',
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
      answer: 0,
      hint: 'Direct key hashing enables immediate index lookup.',
      explanation: 'Hash tables offer average O(1) constant time lookup, with O(N) worst-case under severe hash collisions.'
    },
    {
      id: 'dsa-3',
      category: 'DSA',
      difficulty: 'Medium',
      question: 'What is the worst-case time complexity of QuickSort?',
      options: ['O(N log N)', 'O(N)', 'O(N^2)', 'O(2^N)'],
      answer: 2,
      hint: 'Occurs when the chosen pivot is always the smallest or largest element (already sorted array).',
      explanation: 'When unbalanced partitions occur repeatedly, QuickSort degrades to O(N^2).'
    },
    {
      id: 'dsa-4',
      category: 'DSA',
      difficulty: 'Hard',
      question: 'Which of the following data structures is optimal for implementing an LRU (Least Recently Used) Cache?',
      options: ['Array + Stack', 'Doubly Linked List + HashMap', 'Binary Search Tree', 'Min Heap'],
      answer: 1,
      hint: 'You need O(1) node relocation and O(1) key lookup.',
      explanation: 'HashMap provides O(1) key lookup, while Doubly Linked List enables O(1) node removal and insertion to the front.'
    },

    // Web & JavaScript
    {
      id: 'web-1',
      category: 'Web',
      difficulty: 'Easy',
      question: 'What is the output of `typeof NaN` in JavaScript?',
      options: ['"undefined"', '"NaN"', '"number"', '"object"'],
      answer: 2,
      hint: 'NaN stands for Not a Number, but ironically it represents a numeric value.',
      explanation: 'In JavaScript specifications, NaN is part of the IEEE-754 floating-point standard and is of type "number".'
    },
    {
      id: 'web-2',
      category: 'Web',
      difficulty: 'Medium',
      question: 'Which Web API handles asynchronous operations like setTimeout and fetch before pushing callbacks to the Task Queue?',
      options: ['Call Stack', 'Event Loop & Browser Web APIs', 'Render Engine', 'Memory Heap'],
      answer: 1,
      hint: 'Browser environment provides background threads for timers and networking.',
      explanation: 'Browser Web APIs handle timer delays and network requests, queuing callbacks to the task/microtask queue for the Event Loop.'
    },
    {
      id: 'web-3',
      category: 'Web',
      difficulty: 'Medium',
      question: 'In modern CSS, which property allows elements to establish a 2-dimensional grid layout?',
      options: ['display: flex', 'display: grid', 'float: left', 'display: inline-block'],
      answer: 1,
      hint: 'Flexbox is 1-dimensional (row or column); Grid is 2-dimensional (rows and columns).',
      explanation: '`display: grid` defines a two-dimensional grid container controlling both rows and columns simultaneously.'
    },

    // SQL & DBMS
    {
      id: 'dbms-1',
      category: 'DBMS',
      difficulty: 'Easy',
      question: 'Which SQL clause is used to filter records AFTER an aggregation with `GROUP BY`?',
      options: ['WHERE', 'ORDER BY', 'HAVING', 'FILTER BY'],
      answer: 2,
      hint: 'WHERE filters rows before grouping; this clause filters the resulting aggregate groups.',
      explanation: 'HAVING is applied to aggregate functions (COUNT, AVG, SUM) after GROUP BY has grouped the records.'
    },
    {
      id: 'dbms-2',
      category: 'DBMS',
      difficulty: 'Medium',
      question: 'Which of the following ACID properties ensures that a transaction is completely executed or completely rolled back?',
      options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
      answer: 0,
      hint: '"All-or-nothing" execution.',
      explanation: 'Atomicity ensures that all statements in a transaction succeed together. If any fails, the entire transaction is rolled back.'
    },
    {
      id: 'dbms-3',
      category: 'DBMS',
      difficulty: 'Hard',
      question: 'What is the purpose of a Foreign Key constraint in relational databases?',
      options: [
        'Speed up full-text search',
        'Enforce referential integrity between two tables',
        'Ensure that a column cannot contain NULL values',
        'Auto-increment the primary sequence'
      ],
      answer: 1,
      hint: 'It links a column in one table to the primary key of another table.',
      explanation: 'Foreign keys enforce referential integrity by ensuring the linked value exists in the referenced table.'
    },

    // Core CS (OS & Computer Networks)
    {
      id: 'cs-1',
      category: 'CoreCS',
      difficulty: 'Easy',
      question: 'Which protocol operates at the Transport layer of the OSI model and provides reliable, connection-oriented delivery?',
      options: ['UDP', 'IP', 'TCP', 'HTTP'],
      answer: 2,
      hint: 'Involves a 3-way handshake (SYN, SYN-ACK, ACK).',
      explanation: 'TCP (Transmission Control Protocol) is connection-oriented, providing sequencing, acknowledgment, and error-checking.'
    },
    {
      id: 'cs-2',
      category: 'CoreCS',
      difficulty: 'Medium',
      question: 'Which condition is NOT one of Coffman’s four necessary conditions for a Deadlock in an Operating System?',
      options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
      answer: 2,
      hint: 'Deadlocks require that resources CANNOT be forcibly taken away (No Preemption).',
      explanation: 'The four Coffman conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.'
    }
  ];

  const JOBS_DATABASE = [
    {
      id: 'job-1',
      title: 'Graduate SDE Intern (Summer 2026)',
      company: 'Google',
      logoInitials: 'G',
      domain: 'Software',
      type: 'Internship',
      mode: 'Hybrid',
      location: 'Bengaluru / Hyderabad',
      stipend: '₹1,10,000 / month',
      tags: ['C++', 'Java', 'Python', 'DSA', 'Algorithms'],
      deadline: 'Rolling Basis',
      description: 'Design robust algorithmic solutions, optimize high-throughput distributed systems, and contribute to production cloud services.',
      rounds: ['Online Coding Assessment (2 Qs)', 'Technical Interview I (DSA & Problem Solving)', 'Technical Interview II (System Design & OOP)', 'Googlyness & Fit'],
      eligibility: 'B.Tech / M.Tech / MCA graduating in 2026/2027 with CGPA 7.5+'
    },
    {
      id: 'job-2',
      title: 'Associate Software Engineer (Fresher)',
      company: 'Microsoft',
      logoInitials: 'MS',
      domain: 'Software',
      type: 'Fresher',
      mode: 'Hybrid',
      location: 'Noida / Bengaluru',
      stipend: '₹18 - ₹24 LPA CTC',
      tags: ['C#', '.NET', 'TypeScript', 'Azure', 'Algorithms'],
      deadline: '15 Dec 2026',
      description: 'Join the Azure and Developer Experience teams building globally scaled cloud infrastructure and collaboration tools.',
      rounds: ['Online Assessment on Codility', 'Round 1: Data Structures & Trees/Graphs', 'Round 2: OS, Multithreading & DBs', 'Round 3: Behavioral & Projects'],
      eligibility: 'Graduating 2025/2026 with strong CS fundamentals.'
    },
    {
      id: 'job-3',
      title: 'Frontend Developer Intern',
      company: 'Razorpay',
      logoInitials: 'RZ',
      domain: 'Web',
      type: 'Internship',
      mode: 'Remote',
      location: 'Pan-India (Remote)',
      stipend: '₹45,000 / month',
      tags: ['React.js', 'TypeScript', 'TailwindCSS', 'REST API', 'Web Performance'],
      deadline: '30 Nov 2026',
      description: 'Craft intuitive checkout UI, payment gateways, and merchant dashboard interfaces with micro-frontend architectures.',
      rounds: ['Machine Coding Round (Build a functional mini UI)', 'Technical JS & React Deep Dive', 'Culture Fit & Engineering Manager'],
      eligibility: 'Proven projects using React, Redux/Zustand, and responsive design.'
    },
    {
      id: 'job-4',
      title: 'Full Stack Engineer (Campus Graduate)',
      company: 'Atlassian',
      logoInitials: 'AT',
      domain: 'Web',
      type: 'Fresher',
      mode: 'Remote',
      location: 'Work from Anywhere (India)',
      stipend: '₹22 - ₹28 LPA CTC',
      tags: ['React', 'Java / Kotlin', 'AWS', 'GraphQL', 'Microservices'],
      deadline: '20 Dec 2026',
      description: 'Empower millions of engineering teams globally by advancing Jira, Confluence, and next-gen collaborative developer tools.',
      rounds: ['Online Coding Challenge (HackerRank)', 'Pair Programming / Live Code', 'System & API Design Discussion', 'Values & Leadership'],
      eligibility: 'BE / B.Tech / Dual Degree with minimum 7.0 CGPA.'
    },
    {
      id: 'job-5',
      title: 'Data Analyst & BI Intern',
      company: 'Swiggy',
      logoInitials: 'SW',
      domain: 'Data',
      type: 'Internship',
      mode: 'Hybrid',
      location: 'Bengaluru',
      stipend: '₹40,000 / month',
      tags: ['SQL', 'Python', 'PowerBI', 'Pandas', 'Statistics'],
      deadline: '05 Dec 2026',
      description: 'Analyze hyper-local logistics, delivery route metrics, customer retention cohorts, and design live business dashboards.',
      rounds: ['SQL Assignment (Window functions & Joins)', 'Python Data Manipulation & Case Study', 'Head of Analytics Round'],
      eligibility: 'Proficient in SQL, Python data libraries, and statistical modeling.'
    },
    {
      id: 'job-6',
      title: 'AI / Machine Learning Engineer',
      company: 'Zepto',
      logoInitials: 'ZP',
      domain: 'AI',
      type: 'Fresher',
      mode: 'On-Site',
      location: 'Mumbai / Bengaluru',
      stipend: '₹16 - ₹20 LPA CTC',
      tags: ['PyTorch', 'Python', 'FastAPI', 'Vector DB', 'LLMs'],
      deadline: '10 Dec 2026',
      description: 'Build predictive demand forecasting models, automated catalog classification, and smart inventory optimization algorithms.',
      rounds: ['Take-home Machine Learning Assignment', 'Technical ML & Math Concepts', 'Live Coding & System Integration', 'Founder / Director Fit'],
      eligibility: 'Strong mathematical foundation in Linear Algebra, Calculus, and Deep Learning.'
    },
    {
      id: 'job-7',
      title: 'Systems & DevOps Engineer',
      company: 'Infosys (Power Programmer)',
      logoInitials: 'INF',
      domain: 'Cloud',
      type: 'Fresher',
      mode: 'Hybrid',
      location: 'Pune / Hyderabad',
      stipend: '₹9.5 LPA CTC',
      tags: ['Linux', 'Docker', 'Kubernetes', 'Python', 'CI/CD'],
      deadline: '28 Nov 2026',
      description: 'High-package specialist role developing automated deployment pipelines, containerized clusters, and fault-tolerant infrastructure.',
      rounds: ['InfyTQ / HackWithInfy Grand Finale', 'Advanced Technical Round', 'HR & Verification'],
      eligibility: 'Selected through HackWithInfy or top InfyTQ certification score.'
    },
    {
      id: 'job-8',
      title: 'Digital Cadre Software Engineer',
      company: 'TCS (Digital / Prime)',
      logoInitials: 'TCS',
      domain: 'Software',
      type: 'Fresher',
      mode: 'On-Site',
      location: 'Chennai / Hyderabad / Bengaluru',
      stipend: '₹7.5 - ₹9 LPA CTC',
      tags: ['Java', 'Spring Boot', 'SQL', 'Data Structures', 'Cloud Basics'],
      deadline: '12 Dec 2026',
      description: 'Accelerated innovation track working directly on enterprise transformation, fintech architectures, and cloud migrations.',
      rounds: ['TCS NQT Advanced Section (Aptitude + Advanced Coding)', 'Technical Interview (OOP, DBMS, Projects)', 'Managerial & HR'],
      eligibility: 'B.E./B.Tech/M.E./M.Tech/MCA/M.Sc with 60%+ in 10th, 12th, and Degree.'
    }
  ];

  const INTERVIEW_DATABASE = [
    {
      id: 'int-1',
      topic: 'Web',
      company: 'Asked at Razorpay, Flipkart',
      question: 'Explain JavaScript Closures with a practical use case.',
      answer: 'A closure is the combination of a function bundled together with references to its surrounding lexical environment. Even after the outer function finishes execution and leaves the call stack, the inner function retains access to the outer function’s variables.',
      tip: 'Mention data encapsulation (private variables), memoization caches, and function currying as real production examples.',
      bullets: [
        'Outer function variables remain in memory due to scope chaining.',
        'Enables factory functions with private state.',
        'Prevents global namespace pollution.'
      ]
    },
    {
      id: 'int-2',
      topic: 'Web',
      company: 'Asked at Swiggy, Atlassian',
      question: 'What is the Event Loop in JavaScript and how do Microtasks differ from Macrotasks?',
      answer: 'JavaScript is single-threaded. The Event Loop constantly monitors the Call Stack and Task Queues. If the stack is clear, it first empties the entire Microtask Queue (Promises, queueMicrotask, MutationObserver) before picking the next single Macrotask (setTimeout, setInterval, I/O).',
      tip: 'Illustrate order of execution: Synchronous code -> Microtasks -> Macrotasks -> Render phase.',
      bullets: [
        'Call stack handles synchronous execution.',
        'Microtasks (Promises) execute with higher priority before render.',
        'Macrotasks (Timers, I/O) execute one at a time per loop cycle.'
      ]
    },
    {
      id: 'int-3',
      topic: 'Backend',
      company: 'Asked at Microsoft, Amazon',
      question: 'Explain the difference between SQL and NoSQL databases. When would you choose which?',
      answer: 'SQL databases (PostgreSQL, MySQL) are relational, structured with predefined schemas, and enforce strict ACID properties—ideal for financial ledgers, inventory, and complex JOIN transactions. NoSQL databases (MongoDB, DynamoDB, Redis) offer dynamic schemas and horizontal scaling—ideal for rapid schema changes, high-throughput caching, and distributed document storage.',
      tip: 'Refer to CAP theorem (Consistency, Availability, Partition tolerance) to impress the interviewer.',
      bullets: [
        'SQL: Vertical scaling, ACID compliance, complex relational queries.',
        'NoSQL: Horizontal scaling, BASE model (Basically Available, Soft-state, Eventual consistency), flexible JSON schemas.'
      ]
    },
    {
      id: 'int-4',
      topic: 'SQL',
      company: 'Asked at Google, Oracle',
      question: 'What are SQL Database Indexes and how do they speed up queries? Are there trade-offs?',
      answer: 'A database index is a specialized data structure (typically a B-Tree or B+ Tree) that stores pointers to table rows in sorted order, reducing search complexity from a full table scan O(N) to O(log N). Trade-offs include increased storage overhead and slower write operations (INSERT, UPDATE, DELETE) because indexes must be updated.',
      tip: 'Differentiate between Clustered (determines physical row order on disk) and Non-clustered (separate lookup table with pointers).',
      bullets: [
        'Significantly speeds up SELECT and WHERE filtering.',
        'Adds CPU and disk write overhead during row modifications.',
        'Best placed on high-cardinality columns frequently queried or joined.'
      ]
    },
    {
      id: 'int-5',
      topic: 'CoreCS',
      company: 'Asked at TCS Digital, Infosys',
      question: 'What is the difference between a Process and a Thread?',
      answer: 'A Process is an independent program in execution with its own dedicated virtual memory space, file descriptors, and system resources. A Thread is a lightweight sub-execution unit within a process; multiple threads in the same process share code, data, and heap memory, but each maintains its own stack and program counter.',
      tip: 'Mention context switching overhead: Switching between processes requires updating page tables and cache flushes, whereas thread context switching is much cheaper.',
      bullets: [
        'Processes are isolated; thread failure can crash the entire host process.',
        'Inter-thread communication is fast via shared memory; IPC requires pipes/sockets.',
        'Threads share memory, requiring synchronization (mutexes, semaphores) to avoid race conditions.'
      ]
    },
    {
      id: 'int-6',
      topic: 'HR',
      company: 'Standard Across All Top Companies',
      question: 'Tell me about yourself (Your 90-Second Placement Pitch).',
      answer: 'Structure using the "Present - Past - Future" formula: 1) Who you are right now (Degree, branch, core technical domains). 2) Highlights of your key achievements and projects (Built a full-stack project, solved 250+ LeetCode problems, led a college tech event). 3) Why this specific company and role align with your immediate goals.',
      tip: 'Do NOT simply recite your resume line by line. Highlight your passion, adaptability, and how you solve problems.',
      bullets: [
        'Present: Final year CS student focused on full-stack web and algorithms.',
        'Past: Developed an automated portal and completed a 3-month internship.',
        'Future: Eager to bring clean code and fast problem-solving to your engineering team.'
      ]
    },
    {
      id: 'int-7',
      topic: 'HR',
      company: 'Asked at Amazon, Deloitte',
      question: 'Describe a situation where a project ran into unexpected difficulties and how you resolved it (STAR Method).',
      answer: 'Situation: During a hackathon, our database server crashed 2 hours before demo because of unindexed search queries. Task: As lead developer, I had to restore system stability immediately. Action: I used explain-analyze to spot the bottlenecks, added composite indexes, and implemented a temporary in-memory LRU cache. Result: Query latency fell by 80%, the system served 200 demo queries without failing, and we won 2nd place.',
      tip: 'Always quantify your impact (e.g. 80% faster, 200 users, 2nd place).',
      bullets: [
        'Situation: Set context clearly.',
        'Task: Clarify your exact responsibility.',
        'Action: Focus on what YOU personally implemented.',
        'Result: Conclude with measurable metrics.'
      ]
    }
  ];

  const SQL_CHEAT_SHEET = [
    {
      title: 'Find the Nth Highest Salary',
      code: 'SELECT DISTINCT salary \nFROM Employee \nORDER BY salary DESC \nLIMIT 1 OFFSET (N - 1);'
    },
    {
      title: 'Dense Rank across Departments',
      code: 'SELECT name, department_id, salary,\n  DENSE_RANK() OVER (\n    PARTITION BY department_id \n    ORDER BY salary DESC\n  ) AS dept_rank\nFROM Employee;'
    },
    {
      title: 'Find Duplicate Records',
      code: 'SELECT email, COUNT(*)\nFROM Users\nGROUP BY email\nHAVING COUNT(*) > 1;'
    },
    {
      title: 'Employees Earning More than their Manager',
      code: 'SELECT e.name AS Employee\nFROM Employee e\nJOIN Employee m \n  ON e.manager_id = m.id\nWHERE e.salary > m.salary;'
    }
  ];

  const RESUME_KEYWORD_BANK = {
    fullstack: [
      'React', 'Node.js', 'Express', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3',
      'REST API', 'GraphQL', 'MongoDB', 'PostgreSQL', 'SQL', 'Git', 'Docker',
      'AWS', 'Redux', 'Unit Testing', 'CI/CD', 'Responsive Design', 'Agile'
    ],
    frontend: [
      'React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'TailwindCSS',
      'Redux', 'Next.js', 'Webpack', 'Vite', 'REST API', 'Git', 'Accessibility',
      'Performance Optimization', 'Jest', 'UI/UX', 'DOM', 'Responsive'
    ],
    backend: [
      'Java', 'Spring Boot', 'Python', 'Node.js', 'Microservices', 'RESTful API',
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
      'Kafka', 'Git', 'CI/CD', 'AWS', 'System Design', 'OOP', 'Data Structures'
    ],
    data: [
      'Python', 'SQL', 'Pandas', 'NumPy', 'PowerBI', 'Tableau', 'Excel',
      'Statistics', 'Data Visualization', 'Machine Learning', 'Data Cleaning',
      'ETL', 'Scikit-learn', 'Git', 'BigQuery', 'Problem Solving'
    ],
    cloud: [
      'Linux', 'AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'GitLab',
      'Bash', 'Python', 'Networking', 'Monitoring', 'Prometheus', 'Grafana',
      'Security', 'CloudFormation', 'Nginx'
    ]
  };

  const ACTION_VERBS = [
    'developed', 'engineered', 'implemented', 'designed', 'optimized', 'architected',
    'spearheaded', 'built', 'reduced', 'increased', 'accelerated', 'orchestrated',
    'refactored', 'streamlined', 'deployed', 'automated', 'integrated', 'delivered'
  ];

  const DEFAULT_CHECKLIST = [
    'Complete at least 2 Aptitude Quizzes with score >= 70%',
    'Revise Data Structures & Algorithms (Trees, Graphs, Sorting)',
    'Review Core CS (OS, DBMS, Computer Networks, OOP concepts)',
    'Practice 5 Mock Interview Flashcards and record 1 oral answer',
    'Run ATS Resume Scan & optimize keywords for target job role',
    'Bookmark and track 2 placement job applications in pipeline'
  ];

  const BADGES_CONFIG = [
    { id: 'b_explorer', title: 'Placement Explorer', desc: 'Visited the PrepPath workstation', icon: '🚀' },
    { id: 'b_quiz_ace', title: 'Quiz Maestro', desc: 'Scored 80% or higher on any quiz', icon: '🧠' },
    { id: 'b_cards_pro', title: 'Interview Scholar', desc: 'Mastered 3 or more interview flashcards', icon: '🎴' },
    { id: 'b_job_hunter', title: 'Career Strategist', desc: 'Bookmarked or tracked 2 job applications', icon: '💼' },
    { id: 'b_ats_champion', title: 'ATS Champion', desc: 'Achieved an ATS Resume score >= 70%', icon: '📄' },
    { id: 'b_streak_flame', title: 'Daily Hustler', desc: 'Maintained a placement preparation streak', icon: '🔥' },
    { id: 'b_cheat_master', title: 'STAR Architect', desc: 'Generated an interview answer with STAR builder', icon: '🌟' },
    { id: 'b_placement_ready', title: 'Campus Ready', desc: 'Attained a 75%+ overall Placement Readiness score', icon: '🏆' }
  ];

  /* ==========================================================================
     5. STATE MANAGER
     ========================================================================== */
  class StateManager {
    constructor() {
      this.theme = localStorage.getItem('preppath_theme') || 'light';
      this.streak = Number(localStorage.getItem('preppath_streak')) || 1;
      this.lastStreakDate = localStorage.getItem('preppath_last_streak_date');
      this.quizStats = JSON.parse(localStorage.getItem('preppath_quiz_stats') || '{"totalTests":0,"bestScore":0,"solvedCount":0}');
      this.completedTasks = JSON.parse(localStorage.getItem('preppath_tasks') || '[]');
      this.customTasks = JSON.parse(localStorage.getItem('preppath_custom_tasks') || '[]');
      this.masteredInterview = JSON.parse(localStorage.getItem('preppath_interview_mastered') || '[]');
      this.revisionInterview = JSON.parse(localStorage.getItem('preppath_interview_revision') || '[]');
      this.customQuestions = JSON.parse(localStorage.getItem('preppath_custom_interview') || '[]');
      this.savedJobs = JSON.parse(localStorage.getItem('preppath_saved_jobs') || '[]');
      this.jobPipeline = JSON.parse(localStorage.getItem('preppath_job_pipeline') || '{}');
      this.unlockedBadges = JSON.parse(localStorage.getItem('preppath_badges') || '["b_explorer"]');
      this.checkDailyStreak();
    }

    save() {
      localStorage.setItem('preppath_theme', this.theme);
      localStorage.setItem('preppath_streak', this.streak);
      localStorage.setItem('preppath_quiz_stats', JSON.stringify(this.quizStats));
      localStorage.setItem('preppath_tasks', JSON.stringify(this.completedTasks));
      localStorage.setItem('preppath_custom_tasks', JSON.stringify(this.customTasks));
      localStorage.setItem('preppath_interview_mastered', JSON.stringify(this.masteredInterview));
      localStorage.setItem('preppath_interview_revision', JSON.stringify(this.revisionInterview));
      localStorage.setItem('preppath_custom_interview', JSON.stringify(this.customQuestions));
      localStorage.setItem('preppath_saved_jobs', JSON.stringify(this.savedJobs));
      localStorage.setItem('preppath_job_pipeline', JSON.stringify(this.jobPipeline));
      localStorage.setItem('preppath_badges', JSON.stringify(this.unlockedBadges));
    }

    checkDailyStreak() {
      const today = new Date().toDateString();
      if (!this.lastStreakDate) {
        this.lastStreakDate = today;
        this.streak = 1;
      } else if (this.lastStreakDate !== today) {
        const last = new Date(this.lastStreakDate);
        const diffDays = Math.round((new Date(today) - last) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          this.streak += 1;
        } else if (diffDays > 1) {
          this.streak = 1;
        }
        this.lastStreakDate = today;
      }
      localStorage.setItem('preppath_streak', this.streak);
      localStorage.setItem('preppath_last_streak_date', this.lastStreakDate);
    }

    unlockBadge(badgeId) {
      if (!this.unlockedBadges.includes(badgeId)) {
        this.unlockedBadges.push(badgeId);
        this.save();
        const badge = BADGES_CONFIG.find(b => b.id === badgeId);
        if (badge) {
          sound.fanfare();
          confetti.burst(50);
          showToast(`🏆 Badge Unlocked: ${badge.title}!`, 'success');
        }
        renderBadges();
      }
    }

    calculateReadiness() {
      // 1. Quiz Component (Max 30%)
      const quizPct = Math.min(100, (this.quizStats.bestScore || 0));
      const quizWeight = (quizPct / 100) * 30;

      // 2. Interview Flashcard Mastery (Max 30%)
      const totalInterview = INTERVIEW_DATABASE.length + this.customQuestions.length;
      const intPct = totalInterview > 0 ? Math.min(100, Math.round((this.masteredInterview.length / totalInterview) * 100)) : 0;
      const intWeight = (intPct / 100) * 30;

      // 3. Checklist Tasks (Max 30%)
      const totalTasks = DEFAULT_CHECKLIST.length + this.customTasks.length;
      const taskPct = totalTasks > 0 ? Math.min(100, Math.round((this.completedTasks.length / totalTasks) * 100)) : 0;
      const taskWeight = (taskPct / 100) * 30;

      // 4. Job Tracking (Max 10%)
      const trackedCount = Object.keys(this.jobPipeline).length + this.savedJobs.length;
      const jobPct = Math.min(100, Math.round((trackedCount / 4) * 100));
      const jobWeight = (jobPct / 100) * 10;

      const totalScore = Math.min(100, Math.round(quizWeight + intWeight + taskWeight + jobWeight));

      if (totalScore >= 75) {
        this.unlockBadge('b_placement_ready');
      }

      return {
        total: totalScore,
        quiz: Math.round(quizPct),
        interview: Math.round(intPct),
        tasks: Math.round(taskPct),
        jobs: Math.round(jobPct)
      };
    }
  }

  const appState = new StateManager();

  /* ==========================================================================
     6. UI CONTROLLER: THEME & SOUND TOGGLES
     ========================================================================== */
  function initThemeAndAudio() {
    document.documentElement.setAttribute('data-theme', appState.theme);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      themeIcon.textContent = appState.theme === 'dark' ? '☀️' : '🌙';
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        sound.click();
        appState.theme = appState.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', appState.theme);
        if (themeIcon) themeIcon.textContent = appState.theme === 'dark' ? '☀️' : '🌙';
        appState.save();
        showToast(`Theme switched to ${appState.theme} mode`, 'info');
      });
    }

    const soundToggle = document.getElementById('soundToggle');
    const soundIcon = document.getElementById('soundIcon');
    if (soundIcon) {
      soundIcon.textContent = sound.enabled ? '🔊' : '🔇';
    }
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        const isNowOn = sound.toggle();
        if (soundIcon) soundIcon.textContent = isNowOn ? '🔊' : '🔇';
        if (isNowOn) sound.click();
        showToast(`Sound FX ${isNowOn ? 'Enabled' : 'Muted'}`, 'info');
      });
    }

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (menuToggle && mainNav) {
      menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('open');
        const isOpen = mainNav.classList.contains('open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
      });
      mainNav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          mainNav.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Active nav scrollspy
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset;
      sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 120;
        const sectionId = current.getAttribute('id');
        const link = document.querySelector(`.main-nav a[href*="${sectionId}"]`);
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          if (link) link.classList.add('active');
        } else {
          if (link) link.classList.remove('active');
        }
      });
    }, { passive: true });
  }

  /* ==========================================================================
     7. READINESS RADIAL GAUGE & DASHBOARD SYNC
     ========================================================================== */
  function updateReadinessDashboard() {
    const scores = appState.calculateReadiness();

    // Nav mini badge
    const navVal = document.getElementById('navReadinessVal');
    if (navVal) navVal.textContent = `${scores.total}%`;

    // Hero gauge
    const heroPercent = document.getElementById('heroGaugePercent');
    if (heroPercent) heroPercent.textContent = `${scores.total}%`;

    const gaugeCircle = document.getElementById('heroGaugeCircle');
    if (gaugeCircle) {
      const circumference = 440; // 2 * pi * 70
      const offset = circumference - (scores.total / 100) * circumference;
      gaugeCircle.style.strokeDashoffset = offset;
    }

    // Hero Breakdown
    const bQuiz = document.getElementById('heroBreakdownQuiz');
    const bInt = document.getElementById('heroBreakdownInterview');
    const bTasks = document.getElementById('heroBreakdownTasks');
    const bJobs = document.getElementById('heroBreakdownJobs');

    if (bQuiz) bQuiz.textContent = `${scores.quiz}%`;
    if (bInt) bInt.textContent = `${scores.interview}%`;
    if (bTasks) bTasks.textContent = `${scores.tasks}%`;
    if (bJobs) bJobs.textContent = `${scores.jobs}%`;

    // Tier badge
    const tierBadge = document.getElementById('readinessTierBadge');
    if (tierBadge) {
      if (scores.total >= 85) tierBadge.textContent = 'Campus Top Tier 🌟';
      else if (scores.total >= 70) tierBadge.textContent = 'Placement Ready 🚀';
      else if (scores.total >= 45) tierBadge.textContent = 'Intermediate Candidate 📈';
      else if (scores.total >= 20) tierBadge.textContent = 'Active Apprentice 🌱';
      else tierBadge.textContent = 'Explorer 🧭';
    }

    // Hero KPIs
    const kpiQuestions = document.getElementById('kpiQuestionsSolved');
    const kpiInterviews = document.getElementById('kpiInterviewsMastered');
    const kpiJobs = document.getElementById('kpiJobsTracked');
    const kpiStreak = document.getElementById('kpiStreak');

    if (kpiQuestions) kpiQuestions.textContent = appState.quizStats.solvedCount || 0;
    if (kpiInterviews) kpiInterviews.textContent = appState.masteredInterview.length || 0;
    if (kpiJobs) kpiJobs.textContent = (Object.keys(appState.jobPipeline).length + appState.savedJobs.length) || 0;
    if (kpiStreak) kpiStreak.textContent = `🔥 ${appState.streak} Day${appState.streak > 1 ? 's' : ''}`;
  }

  /* ==========================================================================
     8. JOBS & APPLICATION TRACKER MODULE
     ========================================================================== */
  let currentJobFilter = {
    search: '',
    domain: 'all',
    type: 'all',
    mode: 'all',
    view: 'all' // 'all', 'bookmarked', 'pipeline'
  };

  function renderJobs() {
    const grid = document.getElementById('jobsGrid');
    if (!grid) return;

    const searchTerm = currentJobFilter.search.toLowerCase().trim();
    const filtered = JOBS_DATABASE.filter(job => {
      const matchSearch =
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.tags.some(t => t.toLowerCase().includes(searchTerm));

      const matchDomain = currentJobFilter.domain === 'all' || job.domain === currentJobFilter.domain;
      const matchType = currentJobFilter.type === 'all' || job.type === currentJobFilter.type;
      const matchMode = currentJobFilter.mode === 'all' || job.mode === currentJobFilter.mode;

      let matchView = true;
      if (currentJobFilter.view === 'bookmarked') {
        matchView = appState.savedJobs.includes(job.id);
      } else if (currentJobFilter.view === 'pipeline') {
        matchView = Boolean(appState.jobPipeline[job.id]);
      }

      return matchSearch && matchDomain && matchType && matchMode && matchView;
    });

    // Counts update
    const allCount = document.getElementById('allJobsCount');
    const savedCount = document.getElementById('savedJobsCount');
    const pipelineCount = document.getElementById('pipelineJobsCount');

    if (allCount) allCount.textContent = JOBS_DATABASE.length;
    if (savedCount) savedCount.textContent = appState.savedJobs.length;
    if (pipelineCount) pipelineCount.textContent = Object.keys(appState.jobPipeline).length;

    grid.innerHTML = '';

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
          <p style="font-size: 1.1rem; color: var(--text-main); font-weight: 700; margin-bottom: 6px;">No opportunities found matching your filters</p>
          <small style="color: var(--text-muted);">Try clearing your search terms or selecting another domain filter.</small>
        </div>
      `;
      return;
    }

    filtered.forEach(job => {
      const isBookmarked = appState.savedJobs.includes(job.id);
      const appStage = appState.jobPipeline[job.id]?.stage || 'Not Applied';

      const card = document.createElement('article');
      card.className = 'job-card';
      card.innerHTML = `
        <div class="job-card-top">
          <div class="job-company-badge">${job.logoInitials}</div>
          <div class="job-top-meta">
            <span class="job-type-pill ${job.type === 'Internship' ? 'internship' : 'fresher'}">${job.type}</span>
            <button class="job-bookmark-btn ${isBookmarked ? 'active' : ''}" data-job-id="${job.id}" title="${isBookmarked ? 'Remove Bookmark' : 'Bookmark Job'}">
              ${isBookmarked ? '★' : '☆'}
            </button>
          </div>
        </div>

        <h3 class="job-title">${job.title}</h3>
        <p class="job-company-name">${job.company} · <span style="color: var(--text-muted); font-weight: 500;">${job.location}</span></p>

        <div class="job-details-chips">
          <span class="chip highlight">${job.stipend}</span>
          <span class="chip">${job.mode}</span>
          <span class="chip">Deadline: ${job.deadline}</span>
        </div>

        <p class="job-description">${job.description}</p>

        <div class="job-tags-row">
          ${job.tags.map(tag => `<span class="job-tech-tag">#${tag}</span>`).join('')}
        </div>

        <div class="job-card-actions">
          <button class="pipeline-status-btn" data-track-id="${job.id}">
            <span>📌 ${appStage}</span>
          </button>
          <button class="btn btn-primary-sm btn-view-job" data-details-id="${job.id}">
            View Details ↗
          </button>
        </div>
      `;

      // Bookmark action
      const bookmarkBtn = card.querySelector('.job-bookmark-btn');
      bookmarkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.click();
        const jId = bookmarkBtn.dataset.jobId;
        if (appState.savedJobs.includes(jId)) {
          appState.savedJobs = appState.savedJobs.filter(id => id !== jId);
          showToast('Job removed from bookmarks', 'info');
        } else {
          appState.savedJobs.push(jId);
          showToast('Job added to bookmarks! ⭐', 'success');
          appState.unlockBadge('b_job_hunter');
        }
        appState.save();
        renderJobs();
        updateReadinessDashboard();
      });

      // Track Pipeline action
      const trackBtn = card.querySelector('[data-track-id]');
      trackBtn.addEventListener('click', () => {
        sound.click();
        openJobPipelineModal(job);
      });

      // View details action
      const viewBtn = card.querySelector('.btn-view-job');
      viewBtn.addEventListener('click', () => {
        sound.click();
        openJobDetailsModal(job);
      });

      grid.appendChild(card);
    });
  }

  function openJobPipelineModal(job) {
    const currentStatus = appState.jobPipeline[job.id]?.stage || 'Not Applied';
    const currentNotes = appState.jobPipeline[job.id]?.notes || '';

    const content = `
      <div style="text-align: left;">
        <span class="eyebrow-pill mini">APPLICATION PIPELINE TRACKER</span>
        <h3 style="font-size: 1.4rem; color: var(--text-main); margin-bottom: 4px;">${job.title}</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">${job.company} · ${job.stipend}</p>

        <label style="display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">
          Update Application Stage:
        </label>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-bottom: 20px;" id="pipelineStageButtons">
          ${['Not Applied', 'Applied ✉️', 'OA Round 💻', 'Interview 🎙️', 'Offer Received 🏆', 'Rejected ❌'].map(stage => `
            <button type="button" class="btn btn-secondary-sm stage-opt-btn ${currentStatus === stage.split(' ')[0] ? 'stage-active' : ''}" data-stage="${stage.split(' ')[0]}" style="padding: 10px; justify-content: center; font-size: 0.82rem; border-color: ${currentStatus === stage.split(' ')[0] ? 'var(--primary)' : 'var(--border-subtle)'}; background: ${currentStatus === stage.split(' ')[0] ? 'var(--primary-soft)' : 'var(--bg-card)'};">
              ${stage}
            </button>
          `).join('')}
        </div>

        <label style="display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">
          Personal Preparation Notes / Referral Link:
        </label>
        <textarea id="pipelineNotesInput" class="ats-textarea" style="height: 90px; margin-bottom: 18px;" placeholder="e.g. Applied via career page with referral from senior; OA test scheduled for Friday...">${currentNotes}</textarea>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button class="btn btn-secondary-sm" id="btnRemovePipeline">Clear Tracking</button>
          <button class="btn btn-primary-sm" id="btnSavePipeline">Save Stage ✓</button>
        </div>
      </div>
    `;

    openModal(content);

    let selectedStage = currentStatus;
    const stageBtns = document.querySelectorAll('.stage-opt-btn');
    stageBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sound.click();
        stageBtns.forEach(b => {
          b.style.borderColor = 'var(--border-subtle)';
          b.style.background = 'var(--bg-card)';
        });
        btn.style.borderColor = 'var(--primary)';
        btn.style.background = 'var(--primary-soft)';
        selectedStage = btn.dataset.stage;
      });
    });

    document.getElementById('btnSavePipeline')?.addEventListener('click', () => {
      sound.correct();
      const notes = document.getElementById('pipelineNotesInput')?.value || '';
      appState.jobPipeline[job.id] = {
        stage: selectedStage,
        notes: notes,
        updatedAt: new Date().toLocaleDateString()
      };
      appState.save();
      appState.unlockBadge('b_job_hunter');
      closeModal();
      renderJobs();
      updateReadinessDashboard();
      showToast(`Application updated to "${selectedStage}"!`, 'success');
    });

    document.getElementById('btnRemovePipeline')?.addEventListener('click', () => {
      sound.click();
      delete appState.jobPipeline[job.id];
      appState.save();
      closeModal();
      renderJobs();
      updateReadinessDashboard();
      showToast('Job removed from pipeline tracker', 'info');
    });
  }

  function openJobDetailsModal(job) {
    const isBookmarked = appState.savedJobs.includes(job.id);
    const content = `
      <div style="text-align: left;">
        <span class="eyebrow-pill mini">OPPORTUNITY DETAILS</span>
        <h3 style="font-size: 1.5rem; color: var(--text-main); margin-bottom: 4px;">${job.title}</h3>
        <p style="color: var(--text-muted); font-size: 0.92rem; margin-bottom: 16px;">
          <strong>${job.company}</strong> · ${job.location} (${job.mode}) · <span style="color: var(--accent-emerald); font-weight: 700;">${job.stipend}</span>
        </p>

        <div style="margin-bottom: 18px;">
          <h4 style="font-size: 0.95rem; color: var(--text-main); margin-bottom: 6px;">Eligibility Criteria</h4>
          <p style="font-size: 0.88rem; color: var(--text-body); background: var(--bg-card-subtle); padding: 12px 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--primary);">
            ${job.eligibility}
          </p>
        </div>

        <div style="margin-bottom: 18px;">
          <h4 style="font-size: 0.95rem; color: var(--text-main); margin-bottom: 6px;">Interview Rounds Breakdown</h4>
          <ol style="margin-left: 20px; font-size: 0.88rem; color: var(--text-body); line-height: 1.6;">
            ${job.rounds.map(r => `<li>${r}</li>`).join('')}
          </ol>
        </div>

        <div style="margin-bottom: 22px;">
          <h4 style="font-size: 0.95rem; color: var(--text-main); margin-bottom: 8px;">Key Tech Skills</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${job.tags.map(t => `<span class="chip">${t}</span>`).join('')}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 18px;">
          <button class="btn btn-secondary-sm" id="modalToggleBookmark">
            ${isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>
          <button class="btn btn-primary" id="modalLaunchTracker">
            Update My Application Pipeline →
          </button>
        </div>
      </div>
    `;

    openModal(content);

    document.getElementById('modalToggleBookmark')?.addEventListener('click', () => {
      sound.click();
      if (appState.savedJobs.includes(job.id)) {
        appState.savedJobs = appState.savedJobs.filter(id => id !== job.id);
        showToast('Removed from bookmarks', 'info');
      } else {
        appState.savedJobs.push(job.id);
        showToast('Bookmarked! ⭐', 'success');
        appState.unlockBadge('b_job_hunter');
      }
      appState.save();
      renderJobs();
      closeModal();
    });

    document.getElementById('modalLaunchTracker')?.addEventListener('click', () => {
      closeModal();
      openJobPipelineModal(job);
    });
  }

  function initJobsListeners() {
    const searchInput = document.getElementById('jobSearch');
    const clearBtn = document.getElementById('clearJobSearch');
    const roleFilter = document.getElementById('jobRoleFilter');
    const typeFilter = document.getElementById('jobTypeFilter');
    const locationFilter = document.getElementById('jobLocationFilter');
    const tabs = document.querySelectorAll('#jobViewTabs .view-tab');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentJobFilter.search = e.target.value;
        if (clearBtn) {
          clearBtn.classList.toggle('hidden', e.target.value.length === 0);
        }
        renderJobs();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        currentJobFilter.search = '';
        clearBtn.classList.add('hidden');
        renderJobs();
      });
    }

    if (roleFilter) {
      roleFilter.addEventListener('change', (e) => {
        currentJobFilter.domain = e.target.value;
        renderJobs();
      });
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', (e) => {
        currentJobFilter.type = e.target.value;
        renderJobs();
      });
    }

    if (locationFilter) {
      locationFilter.addEventListener('change', (e) => {
        currentJobFilter.mode = e.target.value;
        renderJobs();
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        sound.click();
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentJobFilter.view = tab.dataset.view;
        renderJobs();
      });
    });
  }

  /* ==========================================================================
     9. ADAPTIVE QUIZ ENGINE MODULE
     ========================================================================== */
  class QuizManager {
    constructor() {
      this.activeCategory = 'All';
      this.mode = 'practice'; // 'practice', 'timed', 'exam'
      this.targetCount = 10;
      this.currentQuestions = [];
      this.currentIndex = 0;
      this.userAnswers = {}; // { index: selectedOptionIndex }
      this.streak = 0;
      this.timerInterval = null;
      this.secondsRemaining = 45;
      this.totalSecondsElapsed = 0;
      this.globalTimerInterval = null;
      this.lifelinesRemaining = 1;
      this.eliminatedOptions = {}; // { questionIndex: [wrongOptionIndex, wrongOptionIndex] }
    }

    init() {
      this.setupControls();
      this.startNewSession();
    }

    setupControls() {
      // Category pills
      const catPills = document.querySelectorAll('#quizCategoryPills .cat-pill');
      catPills.forEach(pill => {
        pill.addEventListener('click', () => {
          sound.click();
          catPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          this.activeCategory = pill.dataset.category;
          this.startNewSession();
        });
      });

      // Mode Select
      const modeSelect = document.getElementById('quizModeSelect');
      if (modeSelect) {
        modeSelect.addEventListener('change', (e) => {
          this.mode = e.target.value;
          const label = document.getElementById('activeQuizModeLabel');
          if (label) {
            label.textContent = e.target.options[e.target.selectedIndex].text;
          }
          this.startNewSession();
        });
      }

      // Count Select
      const countSelect = document.getElementById('quizCountSelect');
      if (countSelect) {
        countSelect.addEventListener('change', (e) => {
          this.targetCount = parseInt(e.target.value, 10);
          this.startNewSession();
        });
      }

      // Restart Button
      document.getElementById('btnRestartQuiz')?.addEventListener('click', () => {
        sound.click();
        this.startNewSession();
      });

      // Prev & Next
      document.getElementById('btnPrevQuestion')?.addEventListener('click', () => {
        if (this.currentIndex > 0) {
          sound.click();
          this.currentIndex--;
          this.renderActiveQuestion();
        }
      });

      document.getElementById('btnNextQuestion')?.addEventListener('click', () => {
        sound.click();
        if (this.currentIndex < this.currentQuestions.length - 1) {
          this.currentIndex++;
          this.renderActiveQuestion();
        } else {
          this.finishQuiz();
        }
      });

      // 50:50 Lifeline
      document.getElementById('btnLifeline5050')?.addEventListener('click', () => {
        this.useLifeline();
      });

      // Hint Toggle
      document.getElementById('btnToggleHint')?.addEventListener('click', () => {
        const hintBox = document.getElementById('hintBox');
        if (hintBox) {
          sound.click();
          hintBox.classList.toggle('hidden');
        }
      });

      // Results Actions
      document.getElementById('btnRetakeFullQuiz')?.addEventListener('click', () => {
        sound.click();
        this.startNewSession();
      });

      document.getElementById('btnRetryWrongOnly')?.addEventListener('click', () => {
        sound.click();
        this.retryWrongQuestionsOnly();
      });

      document.getElementById('btnReviewAllAnswers')?.addEventListener('click', () => {
        sound.click();
        const sheet = document.getElementById('answerKeySection');
        if (sheet) sheet.classList.toggle('hidden');
      });
    }

    startNewSession(customQuestions = null) {
      clearInterval(this.timerInterval);
      clearInterval(this.globalTimerInterval);

      if (customQuestions && customQuestions.length > 0) {
        this.currentQuestions = customQuestions;
      } else {
        let pool = QUIZ_DATABASE;
        if (this.activeCategory !== 'All') {
          pool = QUIZ_DATABASE.filter(q => q.category === this.activeCategory);
        }
        // Shuffle pool
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        this.currentQuestions = shuffled.slice(0, Math.min(this.targetCount, shuffled.length));
      }

      this.currentIndex = 0;
      this.userAnswers = {};
      this.streak = 0;
      this.lifelinesRemaining = 1;
      this.eliminatedOptions = {};
      this.totalSecondsElapsed = 0;

      // Global timer for total session
      this.globalTimerInterval = setInterval(() => {
        this.totalSecondsElapsed++;
      }, 1000);

      // Reset results card
      document.getElementById('quizResultsCard')?.classList.add('hidden');
      document.getElementById('quizCard')?.classList.remove('hidden');

      this.updateSidebarStats();
      this.renderPalette();
      this.renderActiveQuestion();
    }

    renderActiveQuestion() {
      const q = this.currentQuestions[this.currentIndex];
      if (!q) return;

      // Tracker & Meta
      const tracker = document.getElementById('questionTracker');
      const catTag = document.getElementById('currentCategoryTag');
      const diffTag = document.getElementById('currentDifficultyBadge');
      const qTitle = document.getElementById('questionTitle');
      const qCodeBlock = document.getElementById('questionCodeBlock');
      const qCode = document.getElementById('questionCode');
      const hintText = document.getElementById('hintText');
      const hintBox = document.getElementById('hintBox');
      const expBox = document.getElementById('explanationBox');
      const streakCount = document.getElementById('quizStreakCount');
      const lifelineBtn = document.getElementById('btnLifeline5050');
      const lifelineCount = document.getElementById('lifelineCount');

      if (tracker) tracker.textContent = `QUESTION ${this.currentIndex + 1} OF ${this.currentQuestions.length}`;
      if (catTag) catTag.textContent = q.category;
      if (diffTag) diffTag.textContent = q.difficulty;
      if (qTitle) qTitle.textContent = q.question;

      if (streakCount) streakCount.textContent = this.streak;
      if (hintText) hintText.textContent = q.hint || 'Carefully analyze the given options and formulas.';
      if (hintBox) hintBox.classList.add('hidden');
      if (expBox) expBox.classList.add('hidden');

      if (lifelineCount) lifelineCount.textContent = this.lifelinesRemaining;
      if (lifelineBtn) lifelineBtn.disabled = this.lifelinesRemaining === 0 || this.userAnswers[this.currentIndex] !== undefined;

      // Code snippet check
      if (q.code && qCodeBlock && qCode) {
        qCodeBlock.classList.remove('hidden');
        qCode.textContent = q.code;
      } else if (qCodeBlock) {
        qCodeBlock.classList.add('hidden');
      }

      // Progress bar
      const pBar = document.getElementById('quizProgressBar');
      if (pBar) {
        const pct = ((this.currentIndex + 1) / this.currentQuestions.length) * 100;
        pBar.style.width = `${pct}%`;
      }

      // Render Options
      const container = document.getElementById('optionsContainer');
      if (container) {
        container.innerHTML = '';
        const prefixes = ['A', 'B', 'C', 'D'];
        const isAnswered = this.userAnswers[this.currentIndex] !== undefined;
        const selectedOpt = this.userAnswers[this.currentIndex];
        const eliminated = this.eliminatedOptions[this.currentIndex] || [];

        q.options.forEach((optText, optIdx) => {
          const btn = document.createElement('button');
          btn.className = 'quiz-option-btn';
          btn.type = 'button';

          if (eliminated.includes(optIdx)) {
            btn.classList.add('eliminated');
          }

          if (isAnswered) {
            btn.disabled = true;
            if (optIdx === q.answer) {
              btn.classList.add('correct');
            } else if (optIdx === selectedOpt) {
              btn.classList.add('incorrect');
            }
          }

          btn.innerHTML = `
            <span class="opt-prefix">${prefixes[optIdx]}</span>
            <span>${optText}</span>
          `;

          btn.addEventListener('click', () => {
            this.handleOptionSelect(optIdx);
          });

          container.appendChild(btn);
        });

        // Show explanation if already answered
        if (isAnswered) {
          this.showExplanation(selectedOpt === q.answer, q.explanation);
        }
      }

      // Footer Nav buttons
      const prevBtn = document.getElementById('btnPrevQuestion');
      const nextBtn = document.getElementById('btnNextQuestion');
      const statsLbl = document.getElementById('answeredStats');

      if (prevBtn) prevBtn.disabled = this.currentIndex === 0;
      if (nextBtn) {
        nextBtn.textContent = this.currentIndex === this.currentQuestions.length - 1 ? 'Finish Assessment ✓' : 'Next Question →';
      }
      if (statsLbl) {
        statsLbl.textContent = `${Object.keys(this.userAnswers).length} of ${this.currentQuestions.length} answered`;
      }

      // Setup Timer for Timed Sprint mode
      this.handleQuestionTimer();
      this.renderPalette();
    }

    handleOptionSelect(optIdx) {
      if (this.userAnswers[this.currentIndex] !== undefined) return;

      clearInterval(this.timerInterval);
      this.userAnswers[this.currentIndex] = optIdx;
      const q = this.currentQuestions[this.currentIndex];
      const isCorrect = optIdx === q.answer;

      if (isCorrect) {
        sound.correct();
        this.streak++;
        appState.quizStats.solvedCount = (appState.quizStats.solvedCount || 0) + 1;
        if (this.streak >= 3) {
          showToast(`🔥 Streak: ${this.streak} correct in a row!`, 'success');
        }
      } else {
        sound.wrong();
        this.streak = 0;
      }

      // Update active question UI
      this.renderActiveQuestion();
      this.updateSidebarStats();
    }

    useLifeline() {
      if (this.lifelinesRemaining <= 0 || this.userAnswers[this.currentIndex] !== undefined) return;
      const q = this.currentQuestions[this.currentIndex];
      const wrongIndices = [];
      q.options.forEach((_, idx) => {
        if (idx !== q.answer) wrongIndices.push(idx);
      });
      // Pick 2 random wrong options to eliminate
      const shuffledWrong = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
      this.eliminatedOptions[this.currentIndex] = shuffledWrong;
      this.lifelinesRemaining--;
      sound.click();
      showToast('💡 50:50 Lifeline applied! Two incorrect choices eliminated.', 'info');
      this.renderActiveQuestion();
    }

    showExplanation(isCorrect, expText) {
      const expBox = document.getElementById('explanationBox');
      const expHeader = document.getElementById('expHeader');
      const expBody = document.getElementById('expBody');
      if (expBox && expHeader && expBody) {
        expBox.classList.remove('hidden');
        expHeader.className = `exp-header ${isCorrect ? 'correct' : 'incorrect'}`;
        expHeader.textContent = isCorrect ? '✓ Correct Answer!' : '✕ Incorrect';
        expBody.textContent = expText;
      }
    }

    handleQuestionTimer() {
      clearInterval(this.timerInterval);
      const timerPill = document.getElementById('timerPill');
      const timerText = document.getElementById('quizTimerText');

      if (this.mode !== 'timed') {
        if (timerPill) timerPill.style.display = 'none';
        return;
      }

      if (timerPill) {
        timerPill.style.display = 'inline-flex';
        timerPill.classList.remove('urgent');
      }

      this.secondsRemaining = 45;
      if (timerText) timerText.textContent = `00:${this.secondsRemaining < 10 ? '0' : ''}${this.secondsRemaining}`;

      this.timerInterval = setInterval(() => {
        this.secondsRemaining--;
        if (this.secondsRemaining <= 10 && timerPill) {
          timerPill.classList.add('urgent');
          sound.tick();
        }
        if (timerText) {
          timerText.textContent = `00:${this.secondsRemaining < 10 ? '0' : ''}${this.secondsRemaining}`;
        }
        if (this.secondsRemaining <= 0) {
          clearInterval(this.timerInterval);
          sound.wrong();
          showToast('Time expired for this question!', 'warn');
          // Auto record timeout as wrong (-1)
          if (this.userAnswers[this.currentIndex] === undefined) {
            this.handleOptionSelect(-1);
          }
        }
      }, 1000);
    }

    renderPalette() {
      const grid = document.getElementById('questionPaletteGrid');
      if (!grid) return;
      grid.innerHTML = '';
      this.currentQuestions.forEach((_, idx) => {
        const btn = document.createElement('button');
        btn.className = 'palette-btn';
        btn.textContent = idx + 1;
        if (idx === this.currentIndex) btn.classList.add('current');
        if (this.userAnswers[idx] !== undefined) btn.classList.add('answered');

        btn.addEventListener('click', () => {
          sound.click();
          this.currentIndex = idx;
          this.renderActiveQuestion();
        });
        grid.appendChild(btn);
      });
    }

    updateSidebarStats() {
      const answeredKeys = Object.keys(this.userAnswers);
      let correct = 0;
      answeredKeys.forEach(idx => {
        const qIdx = parseInt(idx, 10);
        if (this.userAnswers[qIdx] === this.currentQuestions[qIdx]?.answer) {
          correct++;
        }
      });

      const acc = answeredKeys.length > 0 ? Math.round((correct / answeredKeys.length) * 100) : 0;
      const accEl = document.getElementById('sessionAccuracy');
      const bestEl = document.getElementById('bestOverallScore');
      const testsEl = document.getElementById('totalTestsTaken');

      if (accEl) accEl.textContent = `${acc}%`;
      if (bestEl) bestEl.textContent = `${appState.quizStats.bestScore || 0}%`;
      if (testsEl) testsEl.textContent = appState.quizStats.totalTests || 0;
    }

    finishQuiz() {
      clearInterval(this.timerInterval);
      clearInterval(this.globalTimerInterval);

      let correctCount = 0;
      this.currentQuestions.forEach((q, idx) => {
        if (this.userAnswers[idx] === q.answer) {
          correctCount++;
        }
      });

      const total = this.currentQuestions.length;
      const pct = Math.round((correctCount / total) * 100);

      // Record state
      appState.quizStats.totalTests = (appState.quizStats.totalTests || 0) + 1;
      if (pct > (appState.quizStats.bestScore || 0)) {
        appState.quizStats.bestScore = pct;
      }
      appState.save();

      // Check badges
      if (pct >= 80) {
        appState.unlockBadge('b_quiz_ace');
      }

      // Audio & Confetti
      if (pct >= 70) {
        sound.fanfare();
        confetti.burst(80);
      } else {
        sound.correct();
      }

      // Show Results Card
      document.getElementById('quizCard')?.classList.add('hidden');
      const resCard = document.getElementById('quizResultsCard');
      if (resCard) resCard.classList.remove('hidden');

      // Update Results Elements
      const resVal = document.getElementById('resultsScoreVal');
      const resCircle = document.getElementById('resultsScoreCircle');
      const resCorrect = document.getElementById('resCorrectCount');
      const resWrong = document.getElementById('resWrongCount');
      const resTime = document.getElementById('resTimeTaken');
      const resPercentile = document.getElementById('resPercentile');

      if (resVal) resVal.textContent = `${pct}%`;
      if (resCircle) {
        const circ = 326; // 2 * pi * 52
        resCircle.style.strokeDashoffset = circ - (pct / 100) * circ;
      }
      if (resCorrect) resCorrect.textContent = correctCount;
      if (resWrong) resWrong.textContent = total - correctCount;

      const mins = Math.floor(this.totalSecondsElapsed / 60);
      const secs = this.totalSecondsElapsed % 60;
      if (resTime) resTime.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

      // Estimated percentile
      let percentile = '60th';
      if (pct === 100) percentile = '99th';
      else if (pct >= 80) percentile = '90th';
      else if (pct >= 60) percentile = '78th';
      if (resPercentile) resPercentile.textContent = percentile;

      // Render Answer Review List
      this.renderReviewList();
      updateReadinessDashboard();
      showToast(`Quiz completed! You scored ${pct}%.`, 'success');
    }

    renderReviewList() {
      const container = document.getElementById('reviewItemsList');
      if (!container) return;
      container.innerHTML = '';

      this.currentQuestions.forEach((q, idx) => {
        const userChoice = this.userAnswers[idx];
        const isCorrect = userChoice === q.answer;
        const div = document.createElement('div');
        div.className = `review-item ${isCorrect ? 'pass' : 'fail'}`;

        div.innerHTML = `
          <div class="review-q-title">${idx + 1}. ${q.question}</div>
          <div class="review-ans-row">
            <strong>Your Answer:</strong> ${userChoice !== undefined && userChoice >= 0 ? q.options[userChoice] : '<span style="color:var(--accent-rose)">Unanswered / Timed out</span>'}
          </div>
          <div class="review-ans-row">
            <strong>Correct Answer:</strong> <span style="color:var(--accent-emerald); font-weight:700;">${q.options[q.answer]}</span>
          </div>
          <div class="review-explanation">
            <strong>Explanation:</strong> ${q.explanation}
          </div>
        `;
        container.appendChild(div);
      });
    }

    retryWrongQuestionsOnly() {
      const wrongList = [];
      this.currentQuestions.forEach((q, idx) => {
        if (this.userAnswers[idx] !== q.answer) {
          wrongList.push(q);
        }
      });

      if (wrongList.length === 0) {
        showToast('You answered all questions correctly! Awesome job!', 'success');
        return;
      }

      this.startNewSession(wrongList);
      showToast(`Starting practice with ${wrongList.length} missed question(s).`, 'info');
    }
  }

  const quiz = new QuizManager();

  /* ==========================================================================
     10. MOCK INTERVIEW & FLASHCARD STUDIO MODULE
     ========================================================================== */
  let activeInterviewTopic = 'All';
  let activeFlashcardIndex = 0;
  let activeDeck = [];
  let isSpeechRecording = false;
  let speechRecognition = null;
  let recordingTimerInterval = null;
  let recordingSeconds = 0;

  function initInterviewDeck() {
    activeDeck = getFilteredInterviewQuestions();
    activeFlashcardIndex = 0;
    renderFlashcard();
    renderInterviewAccordion();
    updateInterviewMasteryUI();
  }

  function getFilteredInterviewQuestions() {
    let all = [...INTERVIEW_DATABASE, ...appState.customQuestions];
    if (activeInterviewTopic !== 'All') {
      all = all.filter(q => q.topic === activeInterviewTopic);
    }
    return all;
  }

  function renderFlashcard() {
    if (activeDeck.length === 0) {
      activeDeck = INTERVIEW_DATABASE;
    }
    const q = activeDeck[activeFlashcardIndex % activeDeck.length];
    if (!q) return;

    // Reset card flip
    const cardEl = document.getElementById('activeFlashcard');
    if (cardEl) cardEl.classList.remove('flipped');

    // Counter
    const counter = document.getElementById('flashcardCounter');
    if (counter) counter.textContent = `Card ${activeFlashcardIndex + 1} of ${activeDeck.length}`;

    // Front
    const fcDomain = document.getElementById('fcDomain');
    const fcCompany = document.getElementById('fcCompany');
    const fcQuestion = document.getElementById('fcQuestion');

    if (fcDomain) fcDomain.textContent = q.topic;
    if (fcCompany) fcCompany.textContent = q.company || 'Frequently Asked';
    if (fcQuestion) fcQuestion.textContent = q.question;

    // Back
    const fcAnswerQuestion = document.getElementById('fcAnswerQuestion');
    const fcAnswer = document.getElementById('fcAnswer');
    const fcTip = document.getElementById('fcTip');

    if (fcAnswerQuestion) fcAnswerQuestion.textContent = q.question;
    if (fcAnswer) {
      fcAnswer.innerHTML = `
        <p style="margin-bottom: 8px;">${q.answer}</p>
        ${q.bullets && q.bullets.length > 0 ? `
          <ul style="margin-left: 18px; line-height: 1.55;">
            ${q.bullets.map(b => `<li>${b}</li>`).join('')}
          </ul>
        ` : ''}
      `;
    }
    if (fcTip) fcTip.textContent = q.tip || 'Structure your answer using bullet points and mention real technical tradeoffs.';

    // Oral Question Title
    const oralTitle = document.getElementById('oralQuestionTitle');
    if (oralTitle) oralTitle.textContent = q.question;
  }

  function updateInterviewMasteryUI() {
    const masteredEl = document.getElementById('masteredCount');
    const revisionEl = document.getElementById('revisionCount');
    if (masteredEl) masteredEl.textContent = appState.masteredInterview.length;
    if (revisionEl) revisionEl.textContent = appState.revisionInterview.length;

    if (appState.masteredInterview.length >= 3) {
      appState.unlockBadge('b_cards_pro');
    }
    updateReadinessDashboard();
  }

  function speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      showToast('🔊 Reading interview question aloud...', 'info');
    } else {
      showToast('Speech synthesis not supported in this browser.', 'warn');
    }
  }

  function setupSpeechPractice() {
    const btn = document.getElementById('btnMicToggle');
    const timerEl = document.getElementById('recordingTimer');
    const transcriptEl = document.getElementById('transcriptText');
    const wordCountEl = document.getElementById('wordCountLabel');
    const paceEl = document.getElementById('speakingPace');

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRec) {
      speechRecognition = new SpeechRec();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.lang = 'en-US';

      speechRecognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcriptEl) transcriptEl.textContent = transcript;
        const words = transcript.trim().split(/\s+/).filter(Boolean).length;
        if (wordCountEl) wordCountEl.textContent = `Words spoken: ${words}`;

        // Pace calculation
        if (recordingSeconds > 5 && words > 0) {
          const wpm = Math.round((words / recordingSeconds) * 60);
          if (paceEl) {
            if (wpm < 90) paceEl.textContent = `Pace: Deliberate (${wpm} wpm)`;
            else if (wpm > 160) paceEl.textContent = `Pace: Rapid (${wpm} wpm)`;
            else paceEl.textContent = `Pace: Ideal (${wpm} wpm) ✓`;
          }
        }
      };

      speechRecognition.onerror = (e) => {
        console.warn('Speech recognition error', e);
      };
    }

    if (btn) {
      btn.addEventListener('click', () => {
        if (!isSpeechRecording) {
          // Start Recording
          sound.click();
          isSpeechRecording = true;
          recordingSeconds = 0;
          btn.classList.add('recording');
          const btnLabel = document.getElementById('micBtnLabel');
          if (btnLabel) btnLabel.textContent = 'Stop Recording';
          if (transcriptEl) transcriptEl.textContent = 'Listening to your response... Speak clearly.';

          recordingTimerInterval = setInterval(() => {
            recordingSeconds++;
            const m = Math.floor(recordingSeconds / 60);
            const s = recordingSeconds % 60;
            if (timerEl) timerEl.textContent = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
          }, 1000);

          try {
            if (speechRecognition) speechRecognition.start();
          } catch (e) {}

          showToast('🎙️ Recording started! Practice your answer clearly.', 'info');
        } else {
          // Stop Recording
          sound.correct();
          isSpeechRecording = false;
          clearInterval(recordingTimerInterval);
          btn.classList.remove('recording');
          const btnLabel = document.getElementById('micBtnLabel');
          if (btnLabel) btnLabel.textContent = 'Start Recording Answer';

          try {
            if (speechRecognition) speechRecognition.stop();
          } catch (e) {}

          showToast('Speech recorded! Review your transcript below.', 'success');
        }
      });
    }

    document.getElementById('btnCopyTranscript')?.addEventListener('click', () => {
      const text = transcriptEl?.textContent || '';
      if (text) {
        navigator.clipboard.writeText(text);
        sound.click();
        showToast('Transcript copied to clipboard! 📋', 'success');
      }
    });
  }

  function renderInterviewAccordion() {
    const list = document.getElementById('interviewAccordionList');
    const countEl = document.getElementById('filteredQuestionCount');
    if (!list) return;

    const searchTerm = (document.getElementById('interviewSearch')?.value || '').toLowerCase().trim();
    const questions = activeDeck.filter(item => {
      return item.question.toLowerCase().includes(searchTerm) || item.answer.toLowerCase().includes(searchTerm);
    });

    if (countEl) countEl.textContent = questions.length;
    list.innerHTML = '';

    if (questions.length === 0) {
      list.innerHTML = `<p style="padding: 20px; color: var(--text-muted); text-align: center;">No questions found matching your search.</p>`;
      return;
    }

    questions.forEach(q => {
      const isMastered = appState.masteredInterview.includes(q.id);
      const item = document.createElement('div');
      item.className = 'acc-item';
      item.innerHTML = `
        <button class="acc-header" type="button">
          <div class="acc-title-wrap">
            <span class="acc-topic-tag">${q.topic}</span>
            <span class="acc-question-text">${q.question}</span>
            ${isMastered ? '<span style="color:var(--accent-emerald); font-size:0.8rem; font-weight:700;">✓ Mastered</span>' : ''}
          </div>
          <span class="acc-icon">▼</span>
        </button>
        <div class="acc-body hidden">
          <p style="margin-bottom: 8px;">${q.answer}</p>
          ${q.bullets ? `<ul style="margin-left: 20px; margin-bottom: 8px;">${q.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
          <div style="font-size: 0.8rem; color: var(--text-muted); background: var(--bg-card-subtle); padding: 8px 12px; border-radius: var(--radius-sm); border-left: 2px solid var(--accent-amber);">
            <strong>Interviewer Tip:</strong> ${q.tip || 'Keep your answer structured and clear.'}
          </div>
        </div>
      `;

      const header = item.querySelector('.acc-header');
      const body = item.querySelector('.acc-body');
      header.addEventListener('click', () => {
        sound.click();
        item.classList.toggle('open');
        body.classList.toggle('hidden');
      });

      list.appendChild(item);
    });
  }

  function initInterviewListeners() {
    // Topic tabs
    const topicTabs = document.querySelectorAll('#interviewTopicTabs .topic-pill');
    topicTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        sound.click();
        topicTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeInterviewTopic = tab.dataset.topic;
        initInterviewDeck();
      });
    });

    // Flip card button & click on card
    const cardEl = document.getElementById('activeFlashcard');
    document.getElementById('btnFlipCard')?.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.click();
      cardEl?.classList.toggle('flipped');
    });

    document.getElementById('btnFlipBack')?.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.click();
      cardEl?.classList.remove('flipped');
    });

    cardEl?.addEventListener('click', (e) => {
      // Don't flip if clicking buttons
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
      sound.click();
      cardEl.classList.toggle('flipped');
    });

    // Listen button
    document.getElementById('btnSpeakQuestion')?.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.click();
      const q = activeDeck[activeFlashcardIndex % activeDeck.length];
      if (q) speakText(q.question);
    });

    // Next, Prev, Shuffle
    document.getElementById('btnNextCard')?.addEventListener('click', () => {
      sound.click();
      activeFlashcardIndex = (activeFlashcardIndex + 1) % activeDeck.length;
      renderFlashcard();
    });

    document.getElementById('btnPrevCard')?.addEventListener('click', () => {
      sound.click();
      activeFlashcardIndex = (activeFlashcardIndex - 1 + activeDeck.length) % activeDeck.length;
      renderFlashcard();
    });

    document.getElementById('btnShuffleCards')?.addEventListener('click', () => {
      sound.click();
      activeDeck.sort(() => 0.5 - Math.random());
      activeFlashcardIndex = 0;
      renderFlashcard();
      showToast('Flashcard deck shuffled! 🔀', 'info');
    });

    // Mark Mastered / Revision
    document.getElementById('btnMarkMastered')?.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.correct();
      const q = activeDeck[activeFlashcardIndex % activeDeck.length];
      if (q) {
        if (!appState.masteredInterview.includes(q.id)) {
          appState.masteredInterview.push(q.id);
        }
        appState.revisionInterview = appState.revisionInterview.filter(id => id !== q.id);
        appState.save();
        updateInterviewMasteryUI();
        showToast('Marked as Mastered! Keep building momentum.', 'success');
        // Advance to next card
        activeFlashcardIndex = (activeFlashcardIndex + 1) % activeDeck.length;
        renderFlashcard();
      }
    });

    document.getElementById('btnMarkRevision')?.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.click();
      const q = activeDeck[activeFlashcardIndex % activeDeck.length];
      if (q) {
        if (!appState.revisionInterview.includes(q.id)) {
          appState.revisionInterview.push(q.id);
        }
        appState.masteredInterview = appState.masteredInterview.filter(id => id !== q.id);
        appState.save();
        updateInterviewMasteryUI();
        showToast('Saved for revision.', 'warn');
        activeFlashcardIndex = (activeFlashcardIndex + 1) % activeDeck.length;
        renderFlashcard();
      }
    });

    // Mode Toggle (Flashcards vs Oral)
    const btnFlash = document.getElementById('btnModeFlashcards');
    const btnOral = document.getElementById('btnModeOral');
    const flashView = document.getElementById('flashcardView');
    const oralView = document.getElementById('oralPracticeView');

    btnFlash?.addEventListener('click', () => {
      sound.click();
      btnFlash.classList.add('active');
      btnOral?.classList.remove('active');
      flashView?.classList.remove('hidden');
      oralView?.classList.add('hidden');
    });

    btnOral?.addEventListener('click', () => {
      sound.click();
      btnOral.classList.add('active');
      btnFlash?.classList.remove('active');
      flashView?.classList.add('hidden');
      oralView?.classList.remove('hidden');
    });

    // Search input
    document.getElementById('interviewSearch')?.addEventListener('input', () => {
      renderInterviewAccordion();
    });

    // Custom question modal
    document.getElementById('btnOpenAddQuestionModal')?.addEventListener('click', () => {
      sound.click();
      openAddQuestionModal();
    });

    setupSpeechPractice();
  }

  function openAddQuestionModal() {
    const content = `
      <div style="text-align: left;">
        <span class="eyebrow-pill mini">CUSTOM INTERVIEW CARD</span>
        <h3 style="font-size: 1.4rem; color: var(--text-main); margin-bottom: 6px;">Add Custom Question</h3>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 18px;">
          Add university-specific or company-specific questions to your personal deck.
        </p>

        <div class="form-group">
          <label>Topic / Domain:</label>
          <select id="modalQTopic" style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-card); background: var(--bg-card);">
            <option value="Web">Web & Frontend</option>
            <option value="Backend">Backend & Systems</option>
            <option value="SQL">SQL & Databases</option>
            <option value="CoreCS">OS & Networks</option>
            <option value="HR">HR & Behavioral</option>
          </select>
        </div>

        <div class="form-group">
          <label>Question:</label>
          <input type="text" id="modalQTitle" placeholder="e.g. Explain the difference between process and thread in Linux..." required>
        </div>

        <div class="form-group">
          <label>Model Answer / Key Points:</label>
          <textarea id="modalQAnswer" class="ats-textarea" style="height: 100px;" placeholder="Write concise model answer bullets..."></textarea>
        </div>

        <div class="form-group">
          <label>Interviewer Tip:</label>
          <input type="text" id="modalQTip" placeholder="e.g. Be ready to write the syntax on whiteboard...">
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px;">
          <button class="btn btn-secondary-sm" onclick="document.getElementById('universalModalBackdrop').classList.add('hidden')">Cancel</button>
          <button class="btn btn-primary" id="btnSaveCustomQ">Save to My Deck ✓</button>
        </div>
      </div>
    `;

    openModal(content);

    document.getElementById('btnSaveCustomQ')?.addEventListener('click', () => {
      const qText = document.getElementById('modalQTitle')?.value.trim();
      const ansText = document.getElementById('modalQAnswer')?.value.trim();
      const topic = document.getElementById('modalQTopic')?.value;
      const tip = document.getElementById('modalQTip')?.value.trim();

      if (!qText || !ansText) {
        showToast('Please provide both question and answer.', 'warn');
        return;
      }

      const newQ = {
        id: `custom-${Date.now()}`,
        topic: topic,
        company: 'Personal Deck',
        question: qText,
        answer: ansText,
        tip: tip || 'Emphasize fundamentals and structured communication.',
        bullets: []
      };

      appState.customQuestions.push(newQ);
      appState.save();
      sound.correct();
      closeModal();
      initInterviewDeck();
      showToast('Custom question added to your deck! ✨', 'success');
    });
  }

  /* ==========================================================================
     11. ATS RESUME SCANNER & KEYWORD ANALYZER
     ========================================================================== */
  function initAtsScanner() {
    const scanBtn = document.getElementById('btnScanResume');
    const clearBtn = document.getElementById('btnClearResume');
    const sampleBtn = document.getElementById('btnLoadSampleResume');
    const roleSelect = document.getElementById('atsTargetRole');
    const textarea = document.getElementById('atsResumeText');

    if (sampleBtn && textarea) {
      sampleBtn.addEventListener('click', () => {
        sound.click();
        textarea.value = `John Doe | Computer Science Undergraduate | B.Tech 2026
Technical Skills: JavaScript, React.js, Node.js, Express, TypeScript, SQL, MongoDB, Git, Docker, REST API, HTML5, CSS3, TailwindCSS, Agile development.
Experience & Projects:
- Developed a high-performance full-stack e-commerce web platform using React and Node.js with MongoDB backend.
- Optimized database query response times by 40% through MongoDB compound indexing and Redis caching.
- Architected a responsive dashboard serving 5,000+ daily active users with 99.8% uptime.
- Engineered automated REST API testing pipelines using Jest and GitHub Actions CI/CD workflows.
- Spearheaded team collaboration using Git and Scrum methodologies, completing milestones 2 weeks ahead of schedule.`;
        showToast('Sample resume loaded! Click "Scan & Calculate ATS Score".', 'info');
      });
    }

    if (clearBtn && textarea) {
      clearBtn.addEventListener('click', () => {
        sound.click();
        textarea.value = '';
        showToast('Resume cleared', 'info');
      });
    }

    if (scanBtn) {
      scanBtn.addEventListener('click', () => {
        sound.click();
        analyzeResume();
      });
    }

    function analyzeResume() {
      const text = textarea ? textarea.value.trim() : '';
      if (!text) {
        showToast('Please paste your resume text before scanning.', 'warn');
        return;
      }

      const targetRole = roleSelect ? roleSelect.value : 'fullstack';
      const targetKeywords = RESUME_KEYWORD_BANK[targetRole] || RESUME_KEYWORD_BANK.fullstack;

      const lowerText = text.toLowerCase();

      // Matched & Missing Keywords
      const matched = [];
      const missing = [];

      targetKeywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(text)) {
          matched.push(kw);
        } else {
          missing.push(kw);
        }
      });

      // Action Verbs
      const verbsFound = ACTION_VERBS.filter(verb => {
        return new RegExp(`\\b${verb}\\b`, 'i').test(text);
      });

      // Metrics Detection (detects percentages, numbers, x-factors)
      const metricMatches = text.match(/\b\d+(\.\d+)?(%|k|x|\+)?\b/gi) || [];

      // Word Count
      const words = text.split(/\s+/).filter(Boolean);

      // Score Calculation
      // 50% keyword match, 25% action verbs, 25% quantifiable metrics
      const kwScore = (matched.length / targetKeywords.length) * 50;
      const verbScore = Math.min(25, (verbsFound.length / 5) * 25);
      const metricScore = Math.min(25, (metricMatches.length / 4) * 25);

      const totalAtsScore = Math.min(100, Math.round(kwScore + verbScore + metricScore));

      // Update UI
      const percentEl = document.getElementById('atsScorePercent');
      const ringEl = document.getElementById('atsScoreRing');
      const verdictEl = document.getElementById('atsVerdict');
      const summaryEl = document.getElementById('atsSummaryText');
      const verbsEl = document.getElementById('atsVerbsFound');
      const metricsEl = document.getElementById('atsMetricsFound');
      const wordCountEl = document.getElementById('atsWordCount');
      const matchedList = document.getElementById('matchedKeywordsList');
      const missingList = document.getElementById('missingKeywordsList');

      if (percentEl) percentEl.textContent = `${totalAtsScore}%`;
      if (ringEl) {
        const circ = 314; // 2 * pi * 50
        ringEl.style.strokeDashoffset = circ - (totalAtsScore / 100) * circ;
        if (totalAtsScore >= 75) ringEl.style.stroke = 'var(--accent-emerald)';
        else if (totalAtsScore >= 50) ringEl.style.stroke = 'var(--accent-amber)';
        else ringEl.style.stroke = 'var(--accent-rose)';
      }

      if (verbsEl) verbsEl.textContent = `${verbsFound.length} Detected`;
      if (metricsEl) metricsEl.textContent = `${metricMatches.length} Found`;
      if (wordCountEl) wordCountEl.textContent = `${words.length} Words`;

      if (verdictEl) {
        if (totalAtsScore >= 80) verdictEl.textContent = 'Excellent ATS Compatibility! 🎉';
        else if (totalAtsScore >= 60) verdictEl.textContent = 'Good Match, Minor Keywords Missing';
        else verdictEl.textContent = 'Needs Improvement for Target Role';
      }

      if (summaryEl) {
        summaryEl.textContent = `Matched ${matched.length} of ${targetKeywords.length} core competencies for ${roleSelect.options[roleSelect.selectedIndex].text}.`;
      }

      // Render Pills
      if (matchedList) {
        matchedList.innerHTML = matched.length > 0
          ? matched.map(k => `<span class="kw-pill match">✓ ${k}</span>`).join('')
          : '<span class="empty-hint">No direct target keywords detected.</span>';
      }

      if (missingList) {
        missingList.innerHTML = missing.length > 0
          ? missing.map(k => `<span class="kw-pill miss">+ ${k}</span>`).join('')
          : '<span class="empty-hint">Great work! All primary keywords found.</span>';
      }

      if (totalAtsScore >= 70) {
        sound.fanfare();
        confetti.burst(50);
        appState.unlockBadge('b_ats_champion');
      } else {
        sound.correct();
      }

      showToast(`ATS Scan Complete: ${totalAtsScore}% Match!`, 'success');
    }
  }

  /* ==========================================================================
     12. PLACEMENT CHEAT SHEETS MODULE
     ========================================================================== */
  function initCheatSheets() {
    // Tabs
    const tabs = document.querySelectorAll('#cheatsheetTabs .cs-tab');
    const panes = {
      bigo: document.getElementById('paneBigo'),
      sql: document.getElementById('paneSql'),
      oop: document.getElementById('paneOop'),
      star: document.getElementById('paneStar')
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        sound.click();
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        Object.keys(panes).forEach(k => {
          if (panes[k]) panes[k].classList.remove('active');
        });
        if (panes[target]) panes[target].classList.add('active');
      });
    });

    // Render SQL queries with 1-click copy
    const sqlGrid = document.getElementById('sqlQueriesGrid');
    if (sqlGrid) {
      sqlGrid.innerHTML = '';
      SQL_CHEAT_SHEET.forEach(item => {
        const card = document.createElement('div');
        card.className = 'sql-card';
        card.innerHTML = `
          <div class="sql-card-header">
            <h5>${item.title}</h5>
            <button class="sql-copy-btn">Copy SQL</button>
          </div>
          <pre class="sql-code-snippet"><code>${item.code}</code></pre>
        `;
        const copyBtn = card.querySelector('.sql-copy-btn');
        copyBtn.addEventListener('click', () => {
          sound.click();
          navigator.clipboard.writeText(item.code);
          copyBtn.textContent = 'Copied! ✓';
          setTimeout(() => (copyBtn.textContent = 'Copy SQL'), 2000);
          showToast('SQL query copied to clipboard! 📋', 'success');
        });
        sqlGrid.appendChild(card);
      });
    }

    // STAR Method Builder
    const btnGenStar = document.getElementById('btnGenerateStar');
    const btnCopyStar = document.getElementById('btnCopyStar');
    const starResult = document.getElementById('formattedStarResult');

    if (btnGenStar) {
      btnGenStar.addEventListener('click', () => {
        sound.correct();
        const s = document.getElementById('starSituation')?.value.trim() || 'Situation context...';
        const t = document.getElementById('starTask')?.value.trim() || 'Assigned objective...';
        const a = document.getElementById('starAction')?.value.trim() || 'Action taken...';
        const r = document.getElementById('starResult')?.value.trim() || 'Outcome and learning...';

        const formatted = `[Situation]: ${s}\n\n[Task]: ${t}\n\n[Action]: ${a}\n\n[Result]: ${r}`;
        if (starResult) starResult.textContent = formatted;
        if (btnCopyStar) btnCopyStar.classList.remove('hidden');

        appState.unlockBadge('b_cheat_master');
        showToast('STAR Answer structured successfully! ✨', 'success');
      });
    }

    if (btnCopyStar) {
      btnCopyStar.addEventListener('click', () => {
        const text = starResult?.textContent || '';
        navigator.clipboard.writeText(text);
        sound.click();
        showToast('STAR answer copied to clipboard! 📋', 'success');
      });
    }
  }

  /* ==========================================================================
     13. COMMAND CENTER: CHECKLIST, BADGES & REPORT EXPORT
     ========================================================================== */
  function renderChecklist() {
    const list = document.getElementById('checklist');
    if (!list) return;

    list.innerHTML = '';
    const allTasks = [...DEFAULT_CHECKLIST, ...appState.customTasks];

    allTasks.forEach((taskText, idx) => {
      const isCompleted = appState.completedTasks.includes(idx);
      const isCustom = idx >= DEFAULT_CHECKLIST.length;

      const item = document.createElement('div');
      item.className = `task-item ${isCompleted ? 'completed' : ''}`;
      item.innerHTML = `
        <label class="task-label">
          <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''}>
          <span class="task-text">${taskText}</span>
        </label>
        ${isCustom ? `<button class="task-delete-btn" title="Delete custom goal">✕</button>` : ''}
      `;

      // Checkbox event
      const chk = item.querySelector('.task-checkbox');
      chk.addEventListener('change', () => {
        if (chk.checked) {
          sound.correct();
          if (!appState.completedTasks.includes(idx)) appState.completedTasks.push(idx);
        } else {
          sound.click();
          appState.completedTasks = appState.completedTasks.filter(i => i !== idx);
        }
        appState.save();
        renderChecklist();
        updateReadinessDashboard();
      });

      // Delete custom goal
      if (isCustom) {
        const delBtn = item.querySelector('.task-delete-btn');
        delBtn.addEventListener('click', () => {
          sound.click();
          const customIdx = idx - DEFAULT_CHECKLIST.length;
          appState.customTasks.splice(customIdx, 1);
          // Re-map completedTasks
          appState.completedTasks = appState.completedTasks.filter(i => i !== idx);
          appState.save();
          renderChecklist();
          updateReadinessDashboard();
          showToast('Custom goal deleted', 'info');
        });
      }

      list.appendChild(item);
    });

    // Update progress bar
    const total = allTasks.length;
    const completed = appState.completedTasks.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const pBar = document.getElementById('progressBar');
    const pLbl = document.getElementById('progressLabel');

    if (pBar) pBar.style.width = `${pct}%`;
    if (pLbl) pLbl.textContent = `${pct}%`;

    if (pct === 100 && total > 0) {
      confetti.burst(60);
    }
  }

  function renderBadges() {
    const grid = document.getElementById('badgesGrid');
    const countEl = document.getElementById('unlockedBadgeCount');
    if (!grid) return;

    if (countEl) countEl.textContent = appState.unlockedBadges.length;
    grid.innerHTML = '';

    BADGES_CONFIG.forEach(badge => {
      const isUnlocked = appState.unlockedBadges.includes(badge.id);
      const div = document.createElement('div');
      div.className = `badge-item ${isUnlocked ? 'unlocked' : 'locked'}`;
      div.innerHTML = `
        <span class="badge-icon">${badge.icon}</span>
        <div class="badge-info">
          <strong>${badge.title}</strong>
          <small>${isUnlocked ? '✓ ' + badge.desc : '🔒 ' + badge.desc}</small>
        </div>
      `;
      grid.appendChild(div);
    });
  }

  function initChecklistListeners() {
    const addBtn = document.getElementById('btnAddCustomTask');
    const input = document.getElementById('customTaskInput');

    function addGoal() {
      const val = input ? input.value.trim() : '';
      if (!val) return;
      sound.correct();
      appState.customTasks.push(val);
      appState.save();
      input.value = '';
      renderChecklist();
      updateReadinessDashboard();
      showToast('Custom preparation goal added! 🎯', 'success');
    }

    if (addBtn) addBtn.addEventListener('click', addGoal);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addGoal();
      });
    }

    // Reset All Data
    document.getElementById('resetProgress')?.addEventListener('click', () => {
      openConfirmModal('Are you sure you want to reset all preparation progress and quiz scores?', () => {
        localStorage.clear();
        sound.click();
        showToast('All progress data has been cleared.', 'warn');
        setTimeout(() => window.location.reload(), 1000);
      });
    });

    document.getElementById('btnQuickReset')?.addEventListener('click', () => {
      openConfirmModal('Clear all saved local data and restore defaults?', () => {
        localStorage.clear();
        window.location.reload();
      });
    });

    // Export Prep Report
    document.getElementById('btnExportReport')?.addEventListener('click', () => {
      sound.click();
      exportPrepReport();
    });
  }

  function exportPrepReport() {
    const readiness = appState.calculateReadiness();
    const dateStr = new Date().toLocaleDateString();

    const reportContent = `
=====================================================
PREPPATH PRO — STUDENT PLACEMENT READINESS REPORT
Generated on: ${dateStr}
=====================================================

OVERALL PLACEMENT READINESS: ${readiness.total}%

MODULE METRICS BREAKDOWN:
- Aptitude & Coding Quiz Best Score: ${readiness.quiz}%
- Interview Flashcard Mastery:       ${readiness.interview}% (${appState.masteredInterview.length} Topics Mastered)
- Placement Action Roadmap:          ${readiness.tasks}% (${appState.completedTasks.length} Milestones Done)
- Career Opportunities Tracked:      ${appState.savedJobs.length + Object.keys(appState.jobPipeline).length} Roles

PREPARATION STREAK:
- Current Active Streak: ${appState.streak} Day(s)

UNLOCKED PLACEMENT BADGES:
${appState.unlockedBadges.map(bId => {
  const b = BADGES_CONFIG.find(item => item.id === bId);
  return b ? `  [✓] ${b.title} — ${b.desc}` : '';
}).filter(Boolean).join('\n')}

ACTIVE APPLICATION PIPELINE:
${Object.keys(appState.jobPipeline).length > 0 ? Object.keys(appState.jobPipeline).map(jId => {
  const job = JOBS_DATABASE.find(j => j.id === jId);
  const info = appState.jobPipeline[jId];
  return `  - ${job ? job.title : jId} (${job ? job.company : ''}): [${info.stage}]`;
}).join('\n') : '  (No active pipeline tracked yet)'}

=====================================================
Keep practicing daily. Small steps build dream careers!
=====================================================
`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PrepPath_Placement_Report_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Preparation summary exported successfully! 📥', 'success');
  }

  /* ==========================================================================
     14. UNIVERSAL MODAL SYSTEM
     ========================================================================== */
  function openModal(htmlContent) {
    const backdrop = document.getElementById('universalModalBackdrop');
    const container = document.getElementById('modalContent');
    if (!backdrop || !container) return;
    container.innerHTML = htmlContent;
    backdrop.classList.remove('hidden');
  }

  function closeModal() {
    const backdrop = document.getElementById('universalModalBackdrop');
    if (backdrop) backdrop.classList.add('hidden');
  }

  function openConfirmModal(promptText, onConfirm) {
    const content = `
      <div style="text-align: center; padding: 10px 0;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 12px;">⚠️</span>
        <h3 style="font-size: 1.3rem; color: var(--text-main); margin-bottom: 8px;">Confirm Action</h3>
        <p style="color: var(--text-muted); font-size: 0.92rem; margin-bottom: 24px;">${promptText}</p>
        <div style="display: flex; justify-content: center; gap: 14px;">
          <button class="btn btn-secondary-sm" id="btnCancelConfirm">Cancel</button>
          <button class="btn btn-primary" id="btnExecuteConfirm" style="background: var(--accent-rose);">Yes, Proceed</button>
        </div>
      </div>
    `;
    openModal(content);

    document.getElementById('btnCancelConfirm')?.addEventListener('click', closeModal);
    document.getElementById('btnExecuteConfirm')?.addEventListener('click', () => {
      closeModal();
      if (typeof onConfirm === 'function') onConfirm();
    });
  }

  function initModalCloseHandlers() {
    document.getElementById('modalCloseBtn')?.addEventListener('click', closeModal);
    const backdrop = document.getElementById('universalModalBackdrop');
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  /* ==========================================================================
     15. BOOTSTRAP APPLICATION
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initThemeAndAudio();
    initModalCloseHandlers();
    initJobsListeners();
    renderJobs();
    quiz.init();
    initInterviewListeners();
    initInterviewDeck();
    initAtsScanner();
    initCheatSheets();
    initChecklistListeners();
    renderChecklist();
    renderBadges();
    updateReadinessDashboard();

    // Footer year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Welcome greeting
    setTimeout(() => {
      showToast('Welcome to PrepPath Pro! Your interactive placement workspace is ready.', 'info');
    }, 600);
  });
})();
