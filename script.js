/* 1. APTITUDE QUIZ: ALL 5 QUESTIONS */

const questions = [
    {
        question: "1. What is 15% of 200?",
        options: ["20", "30", "40", "50"],
        answer: 1,
        explanation: "15% of 200 = (15 / 100) × 200 = 30."
    },
    {
        question: "2. What comes next: 2, 4, 8, 16, __?",
        options: ["18", "24", "30", "32"],
        answer: 3,
        explanation: "Every number is multiplied by 2. The next number is 32."
    },
    {
        question: "3. Which data structure follows FIFO?",
        options: ["Stack", "Queue", "Tree", "Graph"],
        answer: 1,
        explanation: "Queue follows First In, First Out (FIFO)."
    },
    {
        question: "4. Which SQL command retrieves data?",
        options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
        answer: 2,
        explanation: "SELECT is used to retrieve data from a database."
    },
    {
        question: "5. HTML is mainly used to create what?",
        options: [
            "Webpage structure",
            "Database tables",
            "Operating systems",
            "Computer networks"
        ],
        answer: 0,
        explanation: "HTML defines the structure and content of a webpage."
    }
];

let selectedAnswers = {};
let quizSubmitted = false;

const questionText = document.getElementById("questionText");
const optionsList = document.getElementById("optionsList");
const questionCounter = document.getElementById("questionCounter");
const quizProgressBar = document.getElementById("quizProgressBar");
const nextQuestion = document.getElementById("nextQuestion");
const quizResult = document.getElementById("quizResult");
const bestScoreElement = document.getElementById("bestScore");
const heroQuizScore = document.getElementById("heroQuizScore");

let bestScore = Number(localStorage.getItem("preppathBestScore")) || 0;
let latestScore = localStorage.getItem("preppathLatestScore");

function showQuiz() {
    if (!questionText || !optionsList) return;

    questionText.textContent = "Answer all 5 questions below";
    questionCounter.textContent = "5 QUESTIONS";
    quizProgressBar.style.width = "0%";

    optionsList.innerHTML = "";

    questions.forEach((item, questionIndex) => {
        const questionBox = document.createElement("div");
        questionBox.className = "quiz-question";

        const heading = document.createElement("h4");
        heading.textContent = item.question;
        questionBox.appendChild(heading);

        const choices = document.createElement("div");
        choices.className = "quiz-choices";

        item.options.forEach((option, optionIndex) => {
            const optionButton = document.createElement("button");
            optionButton.type = "button";
            optionButton.className = "quiz-option";
            optionButton.textContent = option;

            optionButton.addEventListener("click", () => {
                if (quizSubmitted) return;

                selectedAnswers[questionIndex] = optionIndex;

                // Highlight the selected answer.
                choices.querySelectorAll("button").forEach(button => {
                    button.classList.remove("selected");
                });

                optionButton.classList.add("selected");

                updateAnsweredCount();
            });

            choices.appendChild(optionButton);
        });

        questionBox.appendChild(choices);

        const explanation = document.createElement("p");
        explanation.className = "quiz-explanation hidden";
        explanation.textContent = item.explanation;
        questionBox.appendChild(explanation);

        optionsList.appendChild(questionBox);
    });

    if (nextQuestion) {
        nextQuestion.disabled = false;
        nextQuestion.textContent = "Submit Quiz →";
    }

    if (quizResult) {
        quizResult.classList.add("hidden");
        quizResult.innerHTML = "";
    }

    updateAnsweredCount();
}

function updateAnsweredCount() {
    const answered = Object.keys(selectedAnswers).length;

    if (questionCounter) {
        questionCounter.textContent =
            `${answered} OF ${questions.length} ANSWERED`;
    }

    if (quizProgressBar) {
        const percentage = (answered / questions.length) * 100;
        quizProgressBar.style.width = `${percentage}%`;
    }

    const answerHint = document.getElementById("answerHint");

    if (answerHint) {
        answerHint.textContent =
            `${answered} of ${questions.length} questions answered`;
    }
}

function submitQuiz() {
    if (quizSubmitted) return;

    if (Object.keys(selectedAnswers).length < questions.length) {
        alert("Please answer all 5 questions before submitting.");
        return;
    }

    quizSubmitted = true;

    let score = 0;

    questions.forEach((item, questionIndex) => {
        const questionBox = optionsList.children[questionIndex];
        const buttons = questionBox.querySelectorAll(".quiz-option");
        const explanation = questionBox.querySelector(".quiz-explanation");

        buttons.forEach((button, optionIndex) => {
            button.disabled = true;

            if (optionIndex === item.answer) {
                button.classList.add("correct");
            }

            if (
                optionIndex === selectedAnswers[questionIndex] &&
                optionIndex !== item.answer
            ) {
                button.classList.add("incorrect");
            }
        });

        if (selectedAnswers[questionIndex] === item.answer) {
            score++;
        }

        explanation.classList.remove("hidden");
    });

    const percentage = Math.round((score / questions.length) * 100);

    localStorage.setItem("preppathLatestScore", percentage);

    if (percentage > bestScore) {
        bestScore = percentage;
        localStorage.setItem("preppathBestScore", bestScore);
    }

    if (bestScoreElement) {
        bestScoreElement.textContent = `${bestScore}%`;
    }

    if (heroQuizScore) {
        heroQuizScore.textContent = `${percentage}%`;
    }

    if (quizResult) {
        quizResult.classList.remove("hidden");

        let message = "Keep practising! You will improve with time.";

        if (percentage === 100) {
            message = "Excellent! You answered every question correctly.";
        } else if (percentage >= 60) {
            message = "Good job! Review the explanations and keep learning.";
        }

        quizResult.innerHTML = `
            <h3>Quiz Completed!</h3>
            <p>Your score: <strong>${score}/${questions.length}</strong></p>
            <p>Percentage: <strong>${percentage}%</strong></p>
            <p>${message}</p>
            <button type="button" class="btn btn-primary" id="retryQuiz">
                Try Again ↻
            </button>
        `;

        document.getElementById("retryQuiz").addEventListener("click", () => {
            selectedAnswers = {};
            quizSubmitted = false;
            showQuiz();
        });
    }

    if (nextQuestion) {
        nextQuestion.disabled = true;
        nextQuestion.textContent = "Quiz Completed ✓";
    }

    // Completing the quiz also updates preparation progress.
    updateProgress();
    showToast("Quiz completed! Your score has been saved.");
}

if (nextQuestion) {
    nextQuestion.addEventListener("click", submitQuiz);
}

if (bestScoreElement) {
    bestScoreElement.textContent =
        latestScore === null ? "—" : `${bestScore}%`;
}

if (heroQuizScore) {
    heroQuizScore.textContent =
        latestScore === null ? "—" : `${latestScore}%`;
}

showQuiz();


/* 2. PREPARATION CHECKLIST AND PROGRESS */

const preparationTasks = [
    "Practise aptitude questions",
    "Revise HTML, CSS and JavaScript",
    "Practise SQL and DBMS questions",
    "Prepare your resume and projects",
    "Practise HR and technical interviews"
];

const checklist = document.getElementById("checklist");
const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");
const heroProgress = document.getElementById("heroProgress");
const heroProgressBar = document.getElementById("heroProgressBar");
const heroTasks = document.getElementById("heroTasks");

let completedTasks = JSON.parse(
    localStorage.getItem("preppathCompletedTasks") || "[]"
);

function renderChecklist() {
    if (!checklist) return;

    checklist.innerHTML = "";

    preparationTasks.forEach((task, index) => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        const text = document.createElement("span");

        checkbox.type = "checkbox";
        checkbox.checked = completedTasks.includes(index);

        text.textContent = task;

        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                if (!completedTasks.includes(index)) {
                    completedTasks.push(index);
                }
            } else {
                completedTasks = completedTasks.filter(
                    taskIndex => taskIndex !== index
                );
            }

            localStorage.setItem(
                "preppathCompletedTasks",
                JSON.stringify(completedTasks)
            );

            updateProgress();
        });

        label.appendChild(checkbox);
        label.appendChild(text);
        checklist.appendChild(label);
    });
}

function updateProgress() {
    const completed = completedTasks.length;
    const total = preparationTasks.length;

    const percentage = Math.round((completed / total) * 100);

    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }

    if (progressLabel) {
        progressLabel.textContent = `${percentage}%`;
    }

    if (heroProgress) {
        heroProgress.textContent = `${percentage}%`;
    }

    if (heroProgressBar) {
        heroProgressBar.style.width = `${percentage}%`;
    }

    if (heroTasks) {
        heroTasks.textContent = `${completed}/${total}`;
    }
}

renderChecklist();
updateProgress();


/* 3. RESET PREPARATION PROGRESS */

const resetProgress = document.getElementById("resetProgress");

if (resetProgress) {
    resetProgress.addEventListener("click", () => {
        const confirmed = confirm(
            "Are you sure you want to reset your preparation progress?"
        );

        if (!confirmed) return;

        completedTasks = [];

        localStorage.removeItem("preppathCompletedTasks");

        renderChecklist();
        updateProgress();

        showToast("Preparation progress has been reset.");
    });
}


/* 4. SAMPLE JOBS AND INTERNSHIPS */

const jobs = [
    {
        title: "Frontend Developer Intern",
        company: "Web Development",
        type: "Internship",
        description: "Practise HTML, CSS, JavaScript and responsive design.",
        link: "https://www.linkedin.com/jobs/"
    },
    {
        title: "Software Developer",
        company: "Entry-Level Opportunity",
        type: "Fresher",
        description: "Build programming, problem-solving and coding skills.",
        link: "https://www.linkedin.com/jobs/"
    },
    {
        title: "Data Analyst Intern",
        company: "Data and Analytics",
        type: "Internship",
        description: "Explore SQL, spreadsheets and data visualisation.",
        link: "https://www.linkedin.com/jobs/"
    },
    {
        title: "Java Developer Trainee",
        company: "Software Development",
        type: "Fresher",
        description: "Learn Java, OOP concepts and application development.",
        link: "https://www.linkedin.com/jobs/"
    },
    {
        title: "Web Developer",
        company: "Website Development",
        type: "Fresher",
        description: "Practise building and maintaining websites.",
        link: "https://www.linkedin.com/jobs/"
    },
    {
        title: "AI/ML Intern",
        company: "Artificial Intelligence",
        type: "Internship",
        description: "Explore Python, machine learning and data projects.",
        link: "https://www.linkedin.com/jobs/"
    }
];

const jobsGrid = document.getElementById("jobsGrid");
const jobSearch = document.getElementById("jobSearch");
const jobTypeFilter = document.getElementById("jobTypeFilter");
const jobCount = document.getElementById("jobCount");

function renderJobs() {
    if (!jobsGrid) return;

    const searchTerm = jobSearch
        ? jobSearch.value.trim().toLowerCase()
        : "";

    const selectedType = jobTypeFilter
        ? jobTypeFilter.value
        : "all";

    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            job.title.toLowerCase().includes(searchTerm) ||
            job.company.toLowerCase().includes(searchTerm) ||
            job.description.toLowerCase().includes(searchTerm);

        const matchesType =
            selectedType === "all" || job.type === selectedType;

        return matchesSearch && matchesType;
    });

    jobsGrid.innerHTML = "";

    if (jobCount) {
        jobCount.textContent =
            `${filteredJobs.length} opportunities`;
    }

    if (filteredJobs.length === 0) {
        jobsGrid.innerHTML =
            "<p>No matching opportunities found. Try another search.</p>";
        return;
    }

    filteredJobs.forEach(job => {
        const card = document.createElement("article");
        card.className = "job-card";

        const tag = document.createElement("span");
        tag.className = "job-tag";
        tag.textContent = job.type;

        const title = document.createElement("h3");
        title.textContent = job.title;

        const company = document.createElement("p");
        company.textContent = job.company;

        const description = document.createElement("p");
        description.textContent = job.description;

        const link = document.createElement("a");
        link.className = "btn btn-primary";
        link.href = job.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Explore jobs ↗";

        card.append(tag, title, company, description, link);
        jobsGrid.appendChild(card);
    });
}

if (jobSearch) {
    jobSearch.addEventListener("input", renderJobs);
}

if (jobTypeFilter) {
    jobTypeFilter.addEventListener("change", renderJobs);
}

renderJobs();


/* 5. INTERVIEW PREPARATION */

const interviewQuestions = [
    {
        topic: "Web Development",
        question: "What is HTML?",
        answer: "HTML stands for HyperText Markup Language. It defines the structure of a webpage."
    },
    {
        topic: "Web Development",
        question: "What is CSS?",
        answer: "CSS is used to style webpages, including colours, spacing, layouts and fonts."
    },
    {
        topic: "JavaScript",
        question: "What is JavaScript?",
        answer: "JavaScript adds functionality and interactivity to webpages."
    },
    {
        topic: "JavaScript",
        question: "What is the DOM?",
        answer: "DOM stands for Document Object Model. JavaScript uses it to access and change HTML elements."
    },
    {
        topic: "SQL",
        question: "What is a primary key?",
        answer: "A primary key uniquely identifies each row in a database table. It cannot contain duplicate or NULL values."
    },
    {
        topic: "SQL",
        question: "What is the difference between WHERE and HAVING?",
        answer: "WHERE filters rows before grouping. HAVING filters groups after GROUP BY."
    },
    {
        topic: "HR",
        question: "Tell me about yourself.",
        answer: "Introduce your degree, technical skills, projects, interests and career goals in a clear and concise way."
    },
    {
        topic: "HR",
        question: "Why should we hire you?",
        answer: "Explain your relevant skills, willingness to learn, problem-solving ability and how you can contribute to the team."
    }
];

const interviewList = document.getElementById("interviewList");
const topicTabs = document.getElementById("topicTabs");

function renderInterview(topic = "All") {
    if (!interviewList) return;

    interviewList.innerHTML = "";

    const filteredQuestions = interviewQuestions.filter(item =>
        topic === "All" || item.topic === topic
    );

    filteredQuestions.forEach(item => {
        const card = document.createElement("article");
        card.className = "question-card";

        const heading = document.createElement("h3");
        heading.textContent = item.question;

        const category = document.createElement("p");
        category.textContent = item.topic;

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Show answer +";

        const answer = document.createElement("p");
        answer.className = "answer hidden";
        answer.textContent = item.answer;

        button.addEventListener("click", () => {
            const isHidden = answer.classList.toggle("hidden");
            button.textContent = isHidden
                ? "Show answer +"
                : "Hide answer −";
        });

        card.append(heading, category, button, answer);
        interviewList.appendChild(card);
    });
}

if (topicTabs) {
    topicTabs.querySelectorAll(".topic-tab").forEach(button => {
        button.addEventListener("click", () => {
            topicTabs.querySelectorAll(".topic-tab").forEach(tab => {
                tab.classList.remove("active");
            });

            button.classList.add("active");
            renderInterview(button.dataset.topic);
        });
    });
}

renderInterview();


/* 6. MOBILE NAVIGATION */

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mainNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
}


/* 7. FOOTER YEAR */

const year = document.getElementById("year");

if (year) {
    year.textContent = new Date().getFullYear();
}


/* 8. SMALL NOTIFICATION */

const toast = document.getElementById("toast");

function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    // Hide the notification after 3 seconds.
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}
