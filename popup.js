
// function createTab() {
//     chrome.tabs.create({ url: "https://www.google.ca/?hl=en" });
//     console.log(getCurrentTab());
// }

const tracker = document.getElementById("tracker");
const timer = document.getElementById("timer");

// Toggle Button
const toggle = document.getElementById("toggle");

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
const reset = document.getElementById("reset");

reset.addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "stopTimer" });
    chrome.runtime.sendMessage({ action: "resetTimer" });
    toggle.innerHTML = "Start";
});

// Reset Session Button
const resetSession = document.getElementById("reset_session");

resetSession.addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "stopTimer" });
    chrome.runtime.sendMessage({ action: "resetTimer" });
    chrome.runtime.sendMessage({ action: "resetSession" });
    toggle.innerHTML = "Start";
});

// Pomodoro Button
const pomodoroButton = document.getElementById("pomodoro");

pomodoroButton.addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "stopTimer" });
    chrome.runtime.sendMessage({ action: "setPomodoro" });
    chrome.runtime.sendMessage({ action: "resetTimer" });

    toggle.innerHTML = "Start";
    pomodoroButton.disabled = true;
})

// Listener
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // Updates the pop up window
    if (message.action === "updateTimer") {
        chrome.storage.local.get(["timer", "timerOn", "status", "session", "break", "longBreakInterval"]).then((result) => {
            // Checks if the timer is off
            if (!result["timerOn"]) {
                toggle.innerHTML = "Start";
            }

            // if (result["timer"]) {
            // }

            // Changes the tracker
            // (i.e. shows how many pomodoro sessions/breaks you have done )
            if (result["status"]) {
                if (result["status"] == "pomodoro") {
                    tracker.innerHTML = `Session #${result["session"]}`;
                    console.log(result["timer"]);
                    pomodoroButton.disabled = true;
                } else {
                    tracker.innerHTML = `Break #${result["break"]}`;
                    pomodoroButton.disabled = false;
                }
            }
            timer.innerHTML = result["timer"];
            chrome.storage.local.set({ "timer": timer.innerHTML });
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