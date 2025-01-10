let chatHistory = [];

function initializePage() {
  addWelcomeMessage();
}

function addWelcomeMessage() {
  addMessage("Hello! I'm your AI assistant. How can I help you today?", true);
}
function addMessage(text, isBot) {
  const container = document.getElementById("messagesContainer");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isBot ? "bot-message" : "user-message"}`;

  // Handle formatting
  const formattedText = text
    .replace(/\*\*\*\*(.*?)\*\*\*\*/g, "<strong>$1</strong>") // Bold text with ****
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold text with **
    .replace(/(?<!\\)\*/g, "•") // Convert remaining * to bullets
    // Add line break after each bullet point
    .split("\n")
    .map((line) => (line.trim().startsWith("•") ? line + "\n" : line))
    .join("\n");

  messageDiv.innerHTML = formattedText;
  container.appendChild(messageDiv);
  container.scrollTop = container.scrollHeight;

  if (!isBot) {
    addToHistory(text);
  }
}

function addToHistory(text) {
  const now = new Date();
  const timestamp = now.toLocaleTimeString();
  chatHistory.unshift({ text, timestamp });
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";

  chatHistory.forEach((item) => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.textContent = `${item.timestamp}: ${item.text}`;
    div.onclick = () => {
      document.getElementById("userInput").value = item.text;
    };
    historyList.appendChild(div);
  });
}

async function sendMessage() {
  const input = document.getElementById("userInput");
  const text = input.value.trim();

  if (text) {
    addMessage(text, false);
    input.value = "";
    document.getElementById("loading").style.display = "flex";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      if (response.ok && data.response) {
        addMessage(data.response, true);
      } else {
        addMessage(
          "Sorry, I encountered an error: " +
            (data.error || data.details || "Unknown error"),
          true,
        );
      }
    } catch (error) {
      console.error("Error:", error);
      addMessage(
        "Sorry, I couldn't connect to the server. Please try again.",
        true,
      );
    } finally {
      document.getElementById("loading").style.display = "none";
    }
  }
}

// Event Listeners
document.getElementById("userInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// Initialize the page
initializePage();
