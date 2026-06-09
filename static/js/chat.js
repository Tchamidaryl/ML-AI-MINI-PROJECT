const chatWindow = document.getElementById("chatWindow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const charCount = document.getElementById("charCount");
const chatWidget = document.getElementById("chatWidget");
const closeChat = document.getElementById("closeChat");
const chatLaunchers = document.querySelectorAll(".js-open-chat");
const floatingLauncher = document.querySelector(".chat-launcher");

let conversationHistory = [];

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

function renderMarkdown(text) {
  const escaped = escapeHTML(text);
  return escaped
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^(\d+)\.\s+(.+)$/gm, "<li>$2</li>")
    .replace(/^[-*]\s+(.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .trim();
}

function openChat() {
  chatWidget.classList.add("open");
  chatWidget.setAttribute("aria-hidden", "false");
  floatingLauncher.classList.add("hidden");
  floatingLauncher.setAttribute("aria-expanded", "true");
  setTimeout(() => userInput.focus(), 80);
}

function hideChat() {
  chatWidget.classList.remove("open");
  chatWidget.setAttribute("aria-hidden", "true");
  floatingLauncher.classList.remove("hidden");
  floatingLauncher.setAttribute("aria-expanded", "false");
}

function appendMessage(role, content, animate = true) {
  const isBot = role === "assistant";
  const wrapper = document.createElement("div");
  wrapper.className = `message ${isBot ? "bot-message" : "user-message"}${animate ? "" : ""}`;

  const avatar = document.createElement("div");
  avatar.className = `avatar ${isBot ? "bot-avatar" : "user-avatar"}`;
  avatar.textContent = isBot ? "AI" : "ME";

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
  avatar.textContent = "AI";

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

function autoResize() {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  openChat();
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

    const reply = data.reply || "Sorry, I could not process that. Please try again.";
    appendMessage("assistant", reply);
    conversationHistory.push({ role: "assistant", content: reply });
  } catch {
    removeTyping();
    appendMessage("assistant", "Connection error. Please check your internet or contact the ProLearn team directly.");
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
  }
}

async function loadQuickQuestions() {
  const container = document.getElementById("quick-questions");
  try {
    const res = await fetch("/quick-questions");
    const data = await res.json();
    container.innerHTML = "";

    data.questions.forEach((question) => {
      const btn = document.createElement("button");
      btn.className = "quick-pill";
      btn.type = "button";
      btn.textContent = question;
      btn.addEventListener("click", () => {
        userInput.value = question;
        charCount.textContent = `${question.length}/500`;
        sendMessage();
      });
      container.appendChild(btn);
    });
  } catch {
    container.innerHTML = '<p style="font-size:12px;color:var(--widget-muted)">Could not load suggestions.</p>';
  }
}

chatLaunchers.forEach((launcher) => launcher.addEventListener("click", openChat));
closeChat.addEventListener("click", hideChat);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && chatWidget.classList.contains("open")) {
    hideChat();
  }
});

userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

userInput.addEventListener("input", () => {
  charCount.textContent = `${userInput.value.length}/500`;
  autoResize();
});

sendBtn.addEventListener("click", sendMessage);

document.getElementById("welcomeTs").textContent = formatTime();

const modal = document.getElementById("contactModal");
const openContact = document.getElementById("openContact");
const closeContact = document.getElementById("closeContact");
const submitContact = document.getElementById("submitContact");
const contactStatus = document.getElementById("contactStatus");

openContact.addEventListener("click", () => {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
});

closeContact.addEventListener("click", () => {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }
});

submitContact.addEventListener("click", async () => {
  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const message = document.getElementById("contactMessage").value.trim();

  if (!name || !email || !message) {
    contactStatus.style.color = "#f0647b";
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
    contactStatus.style.color = "var(--green)";
    contactStatus.textContent = data.message;
    document.getElementById("contactName").value = "";
    document.getElementById("contactEmail").value = "";
    document.getElementById("contactMessage").value = "";
    setTimeout(() => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    }, 2200);
  } catch {
    contactStatus.style.color = "#f0647b";
    contactStatus.textContent = "Failed to send. Please email us directly.";
  } finally {
    submitContact.disabled = false;
    submitContact.textContent = "Send Request";
  }
});

loadQuickQuestions();
