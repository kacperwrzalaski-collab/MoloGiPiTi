/* ELEMENTY UI */
const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const historyList = document.getElementById("history-list");
const assistantList = document.getElementById("assistant-list");
const newChatBtn = document.getElementById("new-chat");
const dropdown = document.querySelector(".dropdown");
const dropdownBtn = document.querySelector(".dropdown-btn");
const chatTitle = document.getElementById("chat-title");
const themeToggle = document.getElementById("theme-toggle");
const tabsEl = document.getElementById("tabs");

const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeSettings = document.getElementById("close-settings");
const saveSettings = document.getElementById("save-settings");

const userNameInput = document.getElementById("user-name-input");
const userAvatarInput = document.getElementById("user-avatar-input");
const themeSelect = document.getElementById("theme-select");
const layoutSelect = document.getElementById("layout-select");

/* STAN APLIKACJI */
let currentAssistant = "general";
let currentChat = [];
let chatHistory = loadHistory();
let currentChatKey = null;
let userProfile = loadProfile();

/* ASYSTENCI */
const assistants = {
    general: { name: "Asystent ogólny", avatar: "A" },
    mikolaj: { name: "Mikołaj Klix", avatar: "M" }
};

/* 🔥 SPECJALNE ODPOWIEDZI MIKOŁAJA — TEKST + OBRAZKI */
const mikolajResponses = [
    {
        trigger: ["cześć", "czesc", "hej"],
        type: "text",
        reply: "czego chcesz?"
    },
    {
        trigger: ["ile masz lat"],
        type: "text",
        reply: "Tyle, ile trzeba, żeby wiedzieć za dużo."
    },
    {
        trigger: ["kim jestes", "kim jesteś"],
        type: "text",
        reply: "Jestem Mikołaj Klix, jestem mśdry chytry i inteligentny."
    },
    {
        trigger: ["kim jest paluszek?"],
        type: "text",
        reply: "Cwelem."
    },
    {
        trigger: ["Paluszek"],
        type: "text",
        reply: "Paluszek to jebany cwel"
    },
    {
        trigger: ["A czemu na krześle Niełacnego narysowaleś kutasa?"],
        type: "text",
        reply: "Bo lubi po nich skakać."
    },
    {
        trigger: ["Nie lubie cie."],
        type: "text",
        reply: "Ja ciebie też."
    },
    {
        trigger: ["Co stało się na nocce?","Nocka","Coś o tym wiesz?"],
        type: "text",
        reply: "Nic, masz nie wnikać albo naśle na dziebie kondzia."
    },
    {
        trigger: ["jak wyglądasz", "jak wygladasz", "pokaż siebie", "pokaz siebie"],
        type: "image",
        reply: "images/mikolaj1.png"   // TU WSTAWIASZ SWOJE PNG
    },
    {
        trigger: ["Daj mi zdjecie swojego idola", "selfie"],
        type: "image",
        reply: "images/mikolaj2.png"   // TU WSTAWIASZ SWOJE PNG
    },
];

/* LOSOWE TEKSTY MIKOŁAJA */
const mikolajRandomText = [
    "Brzmi jak problem na później.",
    "To pytanie pachnie kłopotami.",
    "Brzmi jakbyś miał rozsądek... udajmy, że też go mam.",
    "ja nie wielbię szat... nieważne",
    "Tak bardzo mam w dupie twoje pytania i cb że ci na to nie odpowiem.",
    "Spierdalaj.",
    "Wpierdol chcesz?.",
    "Ja jestem zmęczony zostaw mnie w spokoju",
    "Brzmi mądrze. Nie będę psuł klimatu odpowiedzią.",
    "To zależy. Na pewno od czegoś innego niż mam o tym pojęcie."

];

/* LOSOWE OBRAZKI MIKOŁAJA */
const mikolajRandomImages = [
    "https://placekitten.com/200/200",
    "https://picsum.photos/200",
    "https://placehold.co/200x200?text=Mikolaj",
    "https://placehold.co/200x200?text=XD"
];

/* OBSŁUGA MIKOŁAJA */
function handleMikolaj(text) {
    const lower = text.toLowerCase();

    // 1. triggery
    for (const item of mikolajResponses) {
        if (item.trigger.some(t => lower.includes(t))) {
            if (item.type === "text") {
                addMessage(item.reply, "bot");
                return;
            }
            if (item.type === "image") {
                addImageMessage(item.reply);
                return;
            }
        }
    }

    // 2. brak triggera → losowo tekst/obrazek
    if (Math.random() < 0.5) {
        const reply = mikolajRandomText[Math.floor(Math.random() * mikolajRandomText.length)];
        addMessage(reply, "bot");
    } else {
        const img = mikolajRandomImages[Math.floor(Math.random() * mikolajRandomImages.length)];
        addImageMessage(img);
    }
}

/* ROZWIJANE MENU ASYSTENTÓW */
dropdownBtn.addEventListener("click", () => {
    dropdown.classList.toggle("open");
});

/* RENDER ASYSTENTÓW */
function renderAssistants() {
    assistantList.innerHTML = "";
    Object.keys(assistants).forEach(id => {
        const btn = document.createElement("div");
        btn.classList.add("assistant-item");
        if (id === currentAssistant) btn.classList.add("active");
        btn.textContent = assistants[id].name;
        btn.addEventListener("click", () => switchAssistant(id));
        assistantList.appendChild(btn);
    });
}
renderAssistants();

/* ZMIANA ASYSTENTA */
function switchAssistant(id) {
    if (currentChat.length > 0) saveCurrentChat();
    currentAssistant = id;
    renderAssistants();
    startNewChat();
}

/* DODAWANIE WIADOMOŚCI TEKSTOWEJ */
function addMessage(text, sender = "bot") {
    const wrap = document.createElement("div");
    wrap.classList.add("message", sender);

    const avatar = document.createElement("div");
    avatar.classList.add("avatar");

    if (sender === "user") {
        if (userProfile.avatar) {
            const img = document.createElement("img");
            img.src = userProfile.avatar;
            avatar.appendChild(img);
        } else {
            avatar.textContent = userProfile.name
                ? userProfile.name[0].toUpperCase()
                : "Ty";
        }
    } else {
        avatar.textContent = assistants[currentAssistant].avatar;
    }

    const inner = document.createElement("div");
    inner.classList.add("message-inner");
    inner.textContent = text;

    wrap.appendChild(avatar);
    wrap.appendChild(inner);

    chatWindow.appendChild(wrap);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    currentChat.push({ sender, text });
}

/* DODAWANIE WIADOMOŚCI OBRAZKOWEJ */
function addImageMessage(url) {
    const wrap = document.createElement("div");
    wrap.classList.add("message", "bot", "image");

    const avatar = document.createElement("div");
    avatar.classList.add("avatar");
    avatar.textContent = assistants[currentAssistant].avatar;

    const inner = document.createElement("div");
    inner.classList.add("message-inner");

    const img = document.createElement("img");
    img.src = url;

    inner.appendChild(img);
    wrap.appendChild(avatar);
    wrap.appendChild(inner);

    chatWindow.appendChild(wrap);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    currentChat.push({ sender: "bot", image: url });
}

/* TYPING INDICATOR */
function showTyping() {
    const wrap = document.createElement("div");
    wrap.classList.add("message", "bot", "typing");

    const avatar = document.createElement("div");
    avatar.classList.add("avatar");
    avatar.textContent = assistants[currentAssistant].avatar;

    const inner = document.createElement("div");
    inner.classList.add("message-inner");
    inner.textContent = "pisze...";

    wrap.appendChild(avatar);
    wrap.appendChild(inner);

    chatWindow.appendChild(wrap);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    return wrap;
}

/* WYSYŁANIE WIADOMOŚCI */
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;
    addMessage(text, "user");
    userInput.value = "";

    const typingEl = showTyping();

    setTimeout(() => {
        typingEl.remove();

        if (currentAssistant === "mikolaj") {
            handleMikolaj(text);
            return;
        }

        // pozostali asystenci – echo
        addMessage(text, "bot");
    }, 600);
});

/* NOWY CZAT */
newChatBtn.addEventListener("click", () => {
    if (currentChat.length > 0) saveCurrentChat();
    startNewChat();
});

/* START NOWEGO CZATU */
function startNewChat() {
    currentChat = [];
    chatWindow.innerHTML = "";
    chatTitle.textContent = "Nowy czat";
    currentChatKey = null;
    addMessage("Nowy czat rozpoczęty.", "bot");
}

/* HISTORIA CZATÓW */
function saveCurrentChat() {
    const title = currentChatKey || ("Czat " + (Object.keys(chatHistory).length + 1));
    chatHistory[title] = {
        assistant: currentAssistant,
        messages: [...currentChat]
    };
    currentChatKey = title;
    saveHistory();
    renderHistory();
    renderTabs();
}

function renderHistory() {
    historyList.innerHTML = "";
    const keys = Object.keys(chatHistory);
    if (keys.length === 0) {
        historyList.innerHTML = `<p class="history-empty">Brak historii…</p>`;
        return;
    }
    keys.forEach(title => {
        const btn = document.createElement("div");
        btn.classList.add("history-item");
        btn.textContent = title;
        btn.addEventListener("click", () => loadChat(title));
        historyList.appendChild(btn);
    });
}
renderHistory();

/* ZAKŁADKI CZATÓW */
function renderTabs() {
    tabsEl.innerHTML = "";
    const keys = Object.keys(chatHistory);
    keys.forEach(title => {
        const tab = document.createElement("button");
        tab.classList.add("tab");
        if (title === currentChatKey) tab.classList.add("active");
        tab.textContent = title;
        tab.addEventListener("click", () => loadChat(title));
        tabsEl.appendChild(tab);
    });
}
renderTabs();

/* WCZYTYWANIE CZATU */
function loadChat(title) {
    const data = chatHistory[title];
    if (!data) return;
    currentAssistant = data.assistant || "general";
    renderAssistants();
    currentChat = [...data.messages];
    currentChatKey = title;
    chatTitle.textContent = title;
    chatWindow.innerHTML = "";
    currentChat.forEach(msg => {
        if (msg.image) {
            addImageMessage(msg.image);
        } else {
            addMessage(msg.text, msg.sender);
        }
    });
    renderTabs();
}

/* LOCALSTORAGE — HISTORIA */
function saveHistory() {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

function loadHistory() {
    return JSON.parse(localStorage.getItem("chatHistory") || "{}");
}

/* PROFIL UŻYTKOWNIKA */
function saveProfile() {
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
}

function loadProfile() {
    return JSON.parse(localStorage.getItem("userProfile") || "{}");
}

/* MOTYW */
function applyTheme() {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(userProfile.theme || "dark");
}
applyTheme();

/* LAYOUT */
function applyLayout() {
    document.body.classList.remove("mobile", "desktop");
    document.body.classList.add(userProfile.layout || "desktop");
}
applyLayout();

/* SKRÓT MOTYWU */
themeToggle.addEventListener("click", () => {
    userProfile.theme = (userProfile.theme === "light") ? "dark" : "light";
    saveProfile();
    applyTheme();
});

/* USTAWIENIA — OTWIERANIE */
settingsBtn.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");

    userNameInput.value = userProfile.name || "";
    userAvatarInput.value = userProfile.avatar || "";
    themeSelect.value = userProfile.theme || "dark";
    layoutSelect.value = userProfile.layout || "desktop";
});

/* USTAWIENIA — ZAMYKANIE */
closeSettings.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
});

/* USTAWIENIA — ZAPIS */
saveSettings.addEventListener("click", () => {
    userProfile = {
        name: userNameInput.value.trim(),
        avatar: userAvatarInput.value.trim(),
        theme: themeSelect.value,
        layout: layoutSelect.value
    };

    saveProfile();
    applyTheme();
    applyLayout();

    settingsModal.classList.add("hidden");
});
