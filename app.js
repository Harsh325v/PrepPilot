// DOM Elements
const homeView = document.getElementById('homeView');
const companyView = document.getElementById('companyView');
const roadmapView = document.getElementById('roadmapView');
const dailyView = document.getElementById('dailyView');
const mockView = document.getElementById('mockView');
const bookmarksView = document.getElementById('bookmarksView');
const overallProgress = document.getElementById('overallProgress');
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Data (unchanged)
const companies = [
  { id: 1, name: "TCS", info: "Largest IT services company in India. Focus on aptitude, coding, HR.", resources: [{ id: 1, title: "Aptitude PDF" }, { id: 2, title: "CodeVita Questions" }] },
  { id: 2, name: "Amazon", info: "Leadership Principles heavy. DSA + System Design.", resources: [{ id: 3, title: "DSA Sheet" }, { id: 4, title: "Leadership Principles" }] },
  { id: 3, name: "Google", info: "Hard DSA, System Design, Behavioral.", resources: [{ id: 5, title: "Google DSA" }, { id: 6, title: "System Design Prep" }] },
  { id: 4, name: "Microsoft", info: "Coding + Projects discussion.", resources: [{ id: 7, title: "MS Coding Patterns" }, { id: 8, title: "Project Deep Dive" }] },
  { id: 5, name: "Infosys", info: "Aptitude + Basic Coding.", resources: [{ id: 9, title: "Infy TQ Practice" }, { id: 10, title: "Puzzle Questions" }] }
];

const roadmap = {
  Basics: ["Variables", "Loops", "Functions", "Arrays"],
  Easy: ["Two Pointers", "Sliding Window", "Hashing"],
  Medium: ["Binary Search", "Linked List", "Stack/Queue", "Binary Tree"],
  Hard: ["DP", "Graphs", "Tries", "System Design Basics"]
};

const dailyTasks = [
  "Solve 2 DSA questions (LeetCode/HackerRank)",
  "Revise 1 aptitude topic",
  "Practice 1 HR question",
  "Review 1 company specific prep"
];

const mockQuestions = [
  { q: "Binary search complexity?", a: "O(log n)", opts: ["O(n)", "O(log n)", "O(n²)"] },
  { q: "FIFO uses?", a: "Queue", opts: ["Stack", "Queue", "Tree"] },
  { q: "Tell me about yourself?", a: "30-60 sec elevator pitch", opts: ["5 min life story", "30-60 sec elevator pitch", "Just name & college"] },
  { q: "Why this company?", a: "Research + genuine interest", opts: ["Good salary", "Research + genuine interest", "Close to home"] },
  { q: "Strengths & Weaknesses?", a: "STAR method + improvement", opts: ["I'm perfect", "STAR method + improvement", "Work too hard"] },
  { q: "Where do you see in 5 years?", a: "Growth within company", opts: ["CEO", "Growth within company", "Freelancing"] }
];

// FIXED STATE - Progress starts at 0%
let bookmarks = new Set(JSON.parse(localStorage.getItem("bookmarks")) || []);
let notes = JSON.parse(localStorage.getItem("notes")) || {};
let mockScore = 0;

let progress = {};
Object.keys(roadmap).forEach(stage => {
  roadmap[stage].forEach(topic => {
    progress[topic] = false;
  });
});
localStorage.setItem("progress", JSON.stringify(progress));

let dailyProgress = {};
dailyTasks.forEach((task, i) => {
  dailyProgress[i] = false;
});
localStorage.setItem("dailyProgress", JSON.stringify(dailyProgress));

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    body.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
  }
}

function toggleTheme() {
  if (body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode');
    body.removeAttribute('data-theme');
    themeToggle.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.add('dark-mode');
    body.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  }
}

themeToggle.addEventListener('click', toggleTheme);

// Navigation
function show(view) {
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  document.getElementById(view + "View").classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.querySelector(`[data-view="${view}"]`).classList.add("active");
  updateProgressTracker();

  if (view === "home") renderHome();
  if (view === "roadmap") renderRoadmap();
  if (view === "daily") renderDaily();
  if (view === "mock") renderMock();
  if (view === "bookmarks") renderBookmarks();
}

document.querySelectorAll(".nav-btn").forEach(b => {
  b.onclick = () => show(b.dataset.view);
});

function updateProgressTracker() {
  const allTopics = Object.values(roadmap).flat();
  const totalTopics = allTopics.length;
  const completedTopics = allTopics.filter(topic => progress[topic] === true).length;
  const percentage = Math.round((completedTopics / totalTopics) * 100);
  overallProgress.textContent = percentage + '%';
}

function renderHome() {
  homeView.innerHTML = companies.map(c => `
    <div class="card" onclick="openCompany(${c.id})">
      <h3>${c.name}</h3>
      <p>${c.info}</p>
      <p><strong>${c.resources.length} resources</strong></p>
    </div>
  `).join("");
}

function openCompany(id) {
  const c = companies.find(x => x.id === id);
  show("company");
  renderCompanyView(c);
}

function renderCompanyView(c) {
  companyView.innerHTML = `
    <button onclick="show('home')">← Back</button>
    <h2>${c.name}</h2>
    <p>${c.info}</p>
    ${c.resources.map(r => `
      <div class="box">
        ${r.title}
        <button class="star-btn" onclick="toggleBookmark(${r.id})">
          ${bookmarks.has(r.id) ? "⭐" : "☆"}
        </button>
      </div>
    `).join("")}
    <div class="add-bookmark">
      <input type="text" id="newBookmarkTitle" placeholder="Add custom bookmark...">
      <button onclick="addCustomBookmark('${c.name.replace(/'/g, '\\\'')}')">Add</button>
    </div>
    <textarea placeholder="Notes..." oninput="saveNote('${c.name.replace(/'/g, '\\\'')}', this.value)">${notes[c.name] || ""}</textarea>
  `;
}

function addCustomBookmark(companyName) {
  const title = document.getElementById('newBookmarkTitle').value.trim();
  if (title) {
    const newId = Math.max(...companies.flatMap(c => c.resources.map(r => r.id))) + 1;
    companies.find(c => c.name === companyName).resources.push({ id: newId, title });
    bookmarks.add(newId);
    localStorage.setItem("bookmarks", JSON.stringify([...bookmarks]));
    renderCompanyView(companies.find(c => c.name === companyName));
    renderHome();
  }
}

function toggleBookmark(id) {
  if (bookmarks.has(id)) bookmarks.delete(id);
  else bookmarks.add(id);
  localStorage.setItem("bookmarks", JSON.stringify([...bookmarks]));
  if (!companyView.classList.contains('hidden')) {
    const currentCompany = companies.find(comp => comp.resources.some(r => r.id === id));
    if (currentCompany) renderCompanyView(currentCompany);
  }
  renderHome();
  renderBookmarks();
}

function renderBookmarks() {
  let html = "<h3>Bookmarks</h3>";
  companies.forEach(c => {
    const companyBookmarks = c.resources.filter(r => bookmarks.has(r.id));
    if (companyBookmarks.length > 0) {
      html += `<div class="box"><h4>${c.name}</h4>`;
      companyBookmarks.forEach(r => {
        html += `<div>${r.title} <button class="star-btn" onclick="toggleBookmark(${r.id})">⭐</button></div>`;
      });
      html += `</div>`;
    }
  });
  bookmarksView.innerHTML = html || "<div class='box'>No bookmarks</div>";
}

function renderRoadmap() {
  roadmapView.innerHTML = Object.keys(roadmap).map(stage => {
    const stageTopics = roadmap[stage];
    const completed = stageTopics.filter(t => progress[t] === true).length;
    const total = stageTopics.length;
    return `
      <div class="box">
        <h3>${stage} (${completed}/${total})</h3>
        <div class="progress-bar"><div class="progress-fill" style="width: ${completed/total*100}%"></div></div>
        ${stageTopics.map(t => `
          <label>
            <input type="checkbox" ${progress[t] ? "checked" : ""} onchange="toggleProgress('${t.replace(/'/g, '\\\'')}')">
            ${t}
          </label><br>
        `).join("")}
      </div>
    `;
  }).join("");
}

function toggleProgress(topic) {
  progress[topic] = !progress[topic];
  localStorage.setItem("progress", JSON.stringify(progress));
  updateProgressTracker();
  if (!roadmapView.classList.contains('hidden')) renderRoadmap();
}

function renderDaily() {
  dailyView.innerHTML = `
    <div class="box">
      <h3>Today's Checklist</h3>
      <div class="progress-bar"><div class="progress-fill" style="width: ${Object.values(dailyProgress).filter(p => p === true).length / dailyTasks.length * 100}%"></div></div>
      ${dailyTasks.map((task, i) => `
        <label>
          <input type="checkbox" ${dailyProgress[i] ? "checked" : ""} onchange="toggleDaily(${i})">
          ${task}
        </label><br>
      `).join("")}
      <button class="danger" onclick="resetDaily()">Reset Day</button>
    </div>
  `;
}

function toggleDaily(index) {
  dailyProgress[index] = !dailyProgress[index];
  localStorage.setItem("dailyProgress", JSON.stringify(dailyProgress));
  renderDaily();
}

function resetDaily() {
  dailyTasks.forEach((_, i) => dailyProgress[i] = false);
  localStorage.setItem("dailyProgress", JSON.stringify(dailyProgress));
  renderDaily();
}

function renderMock() {
  mockView.innerHTML = mockQuestions.map((m, index) => `
    <div class="box">
      <p><strong>Q${index+1}:</strong> ${m.q}</p>
      ${m.opts.map(o => `
        <button data-answer="${m.a}" data-correct="${o === m.a}">${o}</button>
      `).join("")}
    </div>
  `).join("");

  mockView.querySelectorAll('button[data-answer]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e.target.dataset.correct === 'true') mockScore++;
      alert('Saved');
    });
  });

  const submitBtn = document.createElement('button');
  submitBtn.textContent = `Submit Test (Score: ${mockScore}/${mockQuestions.length})`;
  submitBtn.style.marginTop = '20px';
  submitBtn.onclick = () => {
    alert(`Final Score: ${mockScore}/${mockQuestions.length} (${Math.round(mockScore/mockQuestions.length*100)}%)`);
    mockScore = 0;
  };
  mockView.appendChild(submitBtn);
}

function saveNote(c, v) {
  notes[c] = v;
  localStorage.setItem("notes", JSON.stringify(notes));
}

window.addEventListener('beforeunload', () => {
  localStorage.setItem("progress", JSON.stringify(progress));
  localStorage.setItem("dailyProgress", JSON.stringify(dailyProgress));
  localStorage.setItem("bookmarks", JSON.stringify([...bookmarks]));
  localStorage.setItem("notes", JSON.stringify(notes));
});

show("home");
initTheme();
