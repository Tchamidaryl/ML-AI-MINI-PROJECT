// ─── State ────────────────────────────────────────────────────────────────────
const chatWindow  = document.getElementById("chatWindow");
const userInput   = document.getElementById("userInput");
const sendBtn     = document.getElementById("sendBtn");
const charCount   = document.getElementById("charCount");

let conversationHistory = [];

// ─── Utils ────────────────────────────────────────────────────────────────────
function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Basic Markdown-to-HTML: bold, bullets, numbered lists
function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^(\d+)\.\s+(.+)$/gm, "<li>$2</li>")
    .replace(/^[-•]\s+(.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .trim();
}

function appendMessage(role, content, animate = true) {
  const isBot = role === "assistant";
  const wrapper = document.createElement("div");
  wrapper.className = `message ${isBot ? "bot-message" : "user-message"}${animate ? "" : ""}`;

  const avatar = document.createElement("div");
  avatar.className = `avatar ${isBot ? "bot-avatar" : "user-avatar"}`;
  avatar.textContent = isBot ? "PL" : "ME";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = isBot
    ? `<p>${renderMarkdown(content)}</p>`
    : `<p>${escapeHTML(content)}</p>`;

  const ts = document.createElement("span");
  ts.className = "ts";
  ts.textContent = formatTime();

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  wrapper.appendChild(ts);

  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return wrapper;
}

function showTyping() {
  const wrapper = document.createElement("div");
  wrapper.className = "message bot-message";
  wrapper.id = "typingIndicator";

  const avatar = document.createElement("div");
  avatar.className = "avatar bot-avatar";
  avatar.textContent = "PL";

  const bubble = document.createElement("div");
  bubble.className = "bubble typing-bubble";
  bubble.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

// ─── Send message ─────────────────────────────────────────────────────────────
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  const previousHistory = conversationHistory.slice(-10);

  appendMessage("user", message);
  conversationHistory.push({ role: "user", content: message });

  userInput.value = "";
  charCount.textContent = "0/500";
  autoResize();
  sendBtn.disabled = true;
  showTyping();

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: previousHistory
      })
    });

    const data = await res.json();
    removeTyping();

    const reply = data.reply || "Sorry, I couldn't process that. Please try again.";
    appendMessage("assistant", reply);
    conversationHistory.push({ role: "assistant", content: reply });

  } catch (err) {
    removeTyping();
    appendMessage("assistant", "⚠️ Connection error. Please check your internet or contact us at info@prolearn.edu.");
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
  }
}

// ─── Input events ─────────────────────────────────────────────────────────────
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

userInput.addEventListener("input", () => {
  charCount.textContent = `${userInput.value.length}/500`;
  autoResize();
});

sendBtn.addEventListener("click", sendMessage);

function autoResize() {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 140) + "px";
}

// ─── Quick questions ──────────────────────────────────────────────────────────
async function loadQuickQuestions() {
  try {
    const res = await fetch("/quick-questions");
    const data = await res.json();
    const container = document.getElementById("quick-questions");
    container.innerHTML = "";
    data.questions.forEach((q) => {
      const btn = document.createElement("button");
      btn.className = "quick-pill";
      btn.textContent = q;
      btn.addEventListener("click", () => {
        userInput.value = q;
        charCount.textContent = `${q.length}/500`;
        sendMessage();
      });
      container.appendChild(btn);
    });
  } catch {
    document.getElementById("quick-questions").innerHTML =
      '<p style="font-size:12px;color:var(--muted)">Could not load suggestions.</p>';
  }
}

// ─── Welcome timestamp ────────────────────────────────────────────────────────
document.getElementById("welcomeTs").textContent = formatTime();

// ─── Contact modal ────────────────────────────────────────────────────────────
const modal        = document.getElementById("contactModal");
const openContact  = document.getElementById("openContact");
const closeContact = document.getElementById("closeContact");
const submitContact= document.getElementById("submitContact");
const contactStatus= document.getElementById("contactStatus");

openContact.addEventListener("click", () => modal.classList.add("open"));
closeContact.addEventListener("click", () => modal.classList.remove("open"));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });

submitContact.addEventListener("click", async () => {
  const name    = document.getElementById("contactName").value.trim();
  const email   = document.getElementById("contactEmail").value.trim();
  const message = document.getElementById("contactMessage").value.trim();

  if (!name || !email || !message) {
    contactStatus.style.color = "#ff6b6b";
    contactStatus.textContent = "Please fill in all fields.";
    return;
  }

  submitContact.disabled = true;
  submitContact.textContent = "Sending...";

  try {
    const res = await fetch("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message })
    });
    const data = await res.json();
    contactStatus.style.color = "var(--accent)";
    contactStatus.textContent = data.message;
    document.getElementById("contactName").value = "";
    document.getElementById("contactEmail").value = "";
    document.getElementById("contactMessage").value = "";
    setTimeout(() => modal.classList.remove("open"), 2500);
  } catch {
    contactStatus.style.color = "#ff6b6b";
    contactStatus.textContent = "Failed to send. Please email us directly.";
  } finally {
    submitContact.disabled = false;
    submitContact.textContent = "Send Request";
  }
});

// ─── Init ─────────────────────────────────────────────────────────────────────
loadQuickQuestions();
