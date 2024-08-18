// Find a way to reset the sessions
// Add buttons: Pomodoro, Short break and Long Break
let timer;
let minutes = 25;
let seconds = 0;

let sessionNum = 1; // Number of pomodoro sessions.
let breakNum = 1; // Number of breaks taken.

let sessionTime = 25; // Minutes in pomodoro.
let shortBreak = 5; // Minutes in a short break.
let longBreak = 15; // Minutes in a long break.

// Number of pomodoro sessions to get a long break
let longBreakInterval = 4;

let timerStatus = "pomodoro";

// Debug
// chrome.storage.local.set({ "session": 1, "break": 1, "status": "pomodoro", "timer": "00:03" })
// Make sures the timer does not start when browser is opened
chrome.storage.local.set({ "timerOn": false });

// Debug
// chrome.storage.local.set({ "session": 1, "break": 1, "status": "pomodoro", "timer": "00:03" });

// Gets the last timer displayed from last Chrome session
updateInfo()

// Formatting Timer
const zeroPad = (num, places) => String(num).padStart(places, '0');
let timerDisplay = `${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`;


// Passes time on the timer
function passTime() {
    seconds -= 1;
    if (seconds < 0) {
        minutes -= 1;
        seconds = 59;
    }
    // Updates the timer text
    timerDisplay = `${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`;

    chrome.storage.local.set({
        "timer": timerDisplay,
        "session": sessionNum, "break": breakNum
    });
    updatePopup();

    // Stops the timer
    if (timerDisplay == "00:00") {
        if (timerStatus) {
            // Changes the status of the timer
            if (timerStatus == "pomodoro") {
                timerStatus = "break";
                sessionNum++;
            } else {
                timerStatus = "pomodoro";
                breakNum++;
            }
        }
        updateStorage();
        resetTimer();
        stopTimer();
    }
}

// Starts the timer
async function startTimer() {
    const zeroPad = (num, places) => String(num).padStart(places, '0');

    // Updates the timer
    chrome.storage.local.set({ "timer": `${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}` })

    // console.log(minutes, seconds);
    timer = setInterval(passTime, 1000);
    chrome.storage.local.set({ "timerOn": true });
}

// Stops the timer
function stopTimer() {
    chrome.storage.local.set({ "timerOn": false });
    updatePopup();
    clearInterval(timer)
}

// Resets the timer
function resetTimer(ignore) {
    chrome.storage.local.get(["status"]).then((result) => {
        if (timerStatus) {
            timerStatus = result["status"];
        }
    })
    if (timerStatus == "pomodoro") {
        minutes = sessionTime;
        seconds = 0;
    } else {
        if (!ignore) {
            if (breakNum % longBreakInterval == 0) {
                minutes = longBreak;
                seconds = 0;
            } else {
                minutes = shortBreak;
                seconds = 0;
            }
        }
    }

    timerDisplay = `${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`;
    chrome.storage.local.set({ "timer": timerDisplay });
    updatePopup();
}

// Restarts the number of sessions and breaks
function resetSession() {
    minutes = sessionTime;
    seconds = 0;

    chrome.storage.local.set({ "session": 1, "break": 1, "status": "pomodoro" });
    updateInfo();
    updateStorage();
    updatePopup();
}

// Makes the timer's status as a pomodoro
function setPomodoro() {
    minutes = sessionTime;
    seconds = 0;
    timerStatus = "pomodoro";
    updateStorage();
    updatePopup();
}

// Sets the timer's status as a short break
function setShortBreak() {
    minutes = shortBreak;
    seconds = 0;
    timerStatus = "break";
    updateStorage();
    updatePopup();
}

// Sets the timer's status as a long break
function setLongBreak() {
    minutes = longBreak;
    seconds = 0;
    timerStatus = "break";
    updateStorage();
    updatePopup();
}

// Updates the display on the popup window
function updatePopup() {
    chrome.runtime.sendMessage({ action: 'updateTimer' })
}

// Updates the information in chrome.storage with current information.
function updateStorage() {
    chrome.storage.local.set(
        {
            "timer": `${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`,
            "status": timerStatus,
            "session": sessionNum,
            "break": breakNum,
        }
    );
}

// Updates the local variables with the information from chrome.storage.
function updateInfo() {
    chrome.storage.local.get(["timer", "status", "session", "break", "sessionTime", "shortBreakTime", "longBreakTime"]).then((result) => {
        if (result["timer"]) {
            minutes = Number(result["timer"].substring(0, 2));
            seconds = Number(result["timer"].substring(3));
        }

        if (result["status"] !== undefined) {
            timerStatus = result["status"];
        }

        if (result["session"] !== undefined) {
            sessionNum = result["session"];
        }

        if (result["break"] !== undefined) {
            breakNum = result["break"];
        }

        if (result["sessionTime"] !== undefined) {
            sessionTime = result["sessionBreakTime"];
        }

        if (result["shortBreakTime"] !== undefined) {
            shortBreak = result["shortBreakTime"];
        }

        if (result["longBreakTime"] !== undefined) {
            longBreak = result["longBreakTime"];
        }

    }
    );

    applySettings();
}

function applySettings() {
    chrome.storage.local.get(["sessionTime", "shortBreakTime", "longBreakTime"]).then((result) => {
        sessionTime = result["sessionTime"];
        shortBreak = result["shortBreakTime"];
        longBreak = result["longBreakTime"];
    });
}
/// Listens for the messages from clicked buttons on the popup window
// needs to be rewritten!
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "startTimer") {
        startTimer();
    }
    if (message.action === "stopTimer") {
        stopTimer();
    }
    if (message.action === "resetTimer") {
        resetTimer(false);
    }
    if (message.action === "resetTimerIgnore") {
        resetTimer(true);
    }
    if (message.action === "resetSession") {
        resetSession();
    }
    if (message.action === "setPomodoro") {
        setPomodoro();
    }
    if (message.action == "setShortBreak") {
        setShortBreak();
    }
    if (message.action == "setLongBreak") {
        setLongBreak();
    }
    if (message.action == "applySettings") {
        applySettings();
    }
});

console.log("background running");