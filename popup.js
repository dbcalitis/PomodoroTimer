// function createTab() {
//     chrome.tabs.create({ url: "https://www.google.ca/?hl=en" });
//     console.log(getCurrentTab());
// }

// Task List
// Stylize the pop up

// Set up default settings
// chrome.storage.local.set({
//     "session": 1, "break": 1, "status": "pomodoro", "sessionTime": 25, "shortBreakTime": 5, "longBreakTime": 15
// });

// Debug
const longBreakInterval = 4;

const tracker = document.getElementById("tracker");
const timer = document.getElementById("timer");

// Settings and Config
const settingsButton = document.getElementById("settings");
const applyButton = document.getElementById("apply");

const configPanel = document.getElementById("configPanel");
const timerPanel = document.getElementById("timerPanel");

configPanel.style.display = "none";

// Buttons
const reset = document.getElementById("reset");
const toggle = document.getElementById("toggle");

const pomodoroButton = document.getElementById("pomodoro");
const shortBreak = document.getElementById("shortBreak");
const longBreak = document.getElementById("longBreak");

const resetSession = document.getElementById("reset_session");

// Controls display
settingsButton.addEventListener("click", function () {
    if (configPanel.style.display == "none") {
        timerPanel.style.display = "none";
        configPanel.style.display = "block";
    } else {
        configPanel.style.display = "none";
        timerPanel.style.display = "block";
    }
})

// Applies new configuration
const sessionInput = document.getElementById("sessionInput");
const shortBreakInput = document.getElementById("shortBreakInput");
const longBreakInput = document.getElementById("longBreakInput");

applyButton.addEventListener("click", function () {
    let sessionTime, shortBreakTime, longBreakTime;
    if (sessionInput.value) {
        sessionTime = sessionInput.value;
    } else {
        sessionTime = 25;
    }

    if (shortBreakInput.value) {
        shortBreakTime = shortBreakInput.value;
    } else {
        shortBreakTime = 5;
    }

    if (longBreakInput.value) {
        longBreakTime = longBreakInput.value;
    } else {
        longBreakTime = 15;
    }

    chrome.storage.local.set({ "sessionTime": sessionTime, "shortBreakTime": shortBreakTime, "longBreakTime": longBreakTime });
    chrome.runtime.sendMessage({ action: "applySettings" });
})

// Toggle Button
toggle.addEventListener("click", function () {
    if (toggle.innerHTML == "Start") {
        chrome.runtime.sendMessage({ action: "startTimer" });
        toggle.innerHTML = "Stop";
    } else {
        chrome.runtime.sendMessage({ action: "stopTimer" });
        toggle.innerHTML = "Start";
    }
});

// Reset Button
reset.addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "stopTimer" });
    chrome.runtime.sendMessage({ action: "resetTimer" });
    toggle.innerHTML = "Start";
});

// Reset Session Button
resetSession.addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "stopTimer" });
    chrome.runtime.sendMessage({ action: "resetTimer" });
    chrome.runtime.sendMessage({ action: "resetSession" });

    toggle.innerHTML = "Start";
    pomodoroButton.disabled = true;
    shortBreak.disabled = false;
    longBreak.disabled = false;
});

// Pomodoro Button
pomodoroButton.addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "stopTimer" });
    chrome.runtime.sendMessage({ action: "setPomodoro" });
    chrome.runtime.sendMessage({ action: "resetTimer" });

    pomodoroButton.disabled = true;
    toggle.innerHTML = "Start";
})

// Short Break Button
shortBreak.addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "stopTimer" });
    chrome.runtime.sendMessage({ action: "setShortBreak" });
    chrome.runtime.sendMessage({ action: "resetTimerignore" });

    toggle.innerHTML = "Start";
    pomodoroButton.disabled = false;
    shortBreak.disabled = true;
    longBreak.disabled = false;
})

// Long Break Button
longBreak.addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "stopTimer" });
    chrome.runtime.sendMessage({ action: "setLongBreak" });
    chrome.runtime.sendMessage({ action: "resetTimerIgnore" });

    toggle.innerHTML = "Start";

    pomodoroButton.disabled = false;
    shortBreak.disabled = false;
    longBreak.disabled = true;
})

// Listener
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // Updates the pop up window
    if (message.action === "updateTimer") {
        chrome.storage.local.get(["timer", "timerOn", "status", "session", "break", "longBreakInterval"]).then((result) => {
            // Checks if the timer is off
            if (!result["timerOn"]) {
                toggle.innerHTML = "Start";
            } else {
                toggle.innerHTML = "Stop";
            }

            // Changes the tracker
            // (i.e. shows how many pomodoro sessions/breaks you have done )
            if (result["status"]) {
                if (result["status"] == "pomodoro") {
                    tracker.innerHTML = `Session #${result["session"]}`;
                    pomodoroButton.disabled = true;
                    shortBreak.disabled = false;
                    longBreak.disabled = false;
                } else {
                    tracker.innerHTML = `Break #${result["break"]}`;
                    pomodoroButton.disabled = false;
                }
            }
            timer.innerHTML = result["timer"];
            chrome.storage.local.set({ "timer": timer.innerHTML });
        })
    }

    if (message.action === "playSound") {
        chrome.storage.local.get(["status"]).then((result) => {
            if (result["status"] === "pomodoro") {
                createNotification("Time to take a break!");
            } else {
                createNotification("Time to work!");
            }
        })
    }
});

// Sets up the pop up window
chrome.storage.local.get(["session", "break", "timer", "timerOn", "status", "longBreakInterval"]).then((result) => {
    if (result["status"]) {
        if (result["status"] == "pomodoro") {
            tracker.innerHTML = `Session #${result["session"]}`;
            pomodoroButton.disabled = true;
        } else {
            tracker.innerHTML = `Break #${result["break"]}`;
        }
    }
    if (result["timer"]) {
        timer.innerHTML = result["timer"];
    }
    if (result["timerOn"]) {
        toggle.innerHTML = "Stop";
    } else {
        toggle.innerHTML = "Start";
    }

    if (!result["longBreakInterval"]) {
        chrome.storage.local.set({ "longBreakInterval": 4 });
    }
});

function createNotification(message) {
    let sound = new Audio("bell.mp3");
    sound.volume = 1;
    sound.play();

    chrome.notifications.create(
        "name-for-notification",
        {
            type: "basic",
            iconUrl: "hello_extensions.png",
            title: "Pomodoro Timer",
            message: message,
        },
        function () { }
    );
}

