// Task List
// Create a model for the timer

let timer;
let minutes = 25;
let seconds = 0;

let sessionNum = 1; // Number of pomodoro sessions.
let breakNum = 1; // Number of breaks taken.

let sessionTime = undefined; // Minutes in pomodoro.
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
            let message;

            // Changes the status of the timer
            if (timerStatus == "pomodoro") {
                timerStatus = "break";
                sessionNum++;
                message = "Time to take a break!";
            } else {
                timerStatus = "pomodoro";
                breakNum++;
                message = "Time to work!";
            }
            chrome.runtime.sendMessage({ action: 'playSound' });
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
    if (sessionTime === undefined) { sessionTime = 25; }
    if (shortBreak === undefined) { shortBreak = 5; }
    if (longBreak === undefined) { longBreak = 15; }

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

    let timerDisplay = `${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`;
    chrome.storage.local.set({ "timer": timerDisplay });
    updatePopup();
}

// Restarts the number of sessions and breaks
function resetSession() {
    if (sessionTime) {
        minutes = sessionTime;
    } else {
        minutes, sessionTime = 25;
    }
    seconds = 0;

    chrome.storage.local.set({ "session": 1, "break": 1, "status": "pomodoro" });
    updateInfo();
    updateStorage();
    updatePopup();
}

// Makes the timer's status as a pomodoro
function setPomodoro() {
    if (sessionTime) {
        minutes = sessionTime;
    } else {
        minutes, sessionTime = 25;
    }
    seconds = 0;
    timerStatus = "pomodoro";
    updateStorage();
    updatePopup();
}

// Sets the timer's status as a short break
function setShortBreak() {
    if (shortBreak) {
        minutes = shortBreak;
    } else {
        minutes, shortBreak = 5;
    }
    seconds = 0;
    timerStatus = "break";
    updateStorage();
    updatePopup();
}

// Sets the timer's status as a long break
function setLongBreak() {
    if (longBreak) {
        minutes = longBreak;
    } else {
        minutes, longBreak = 15;
    }
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
        if (result["timer"] != undefined) {
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
            sessionTime = result["sessionTime"];
        } else {
            chrome.storage.local.set({ "sessionTime": 25 });
        }

        if (result["shortBreakTime"] !== undefined) {
            shortBreak = result["shortBreakTime"];
        } else {
            chrome.storage.local.set({ "shortBreakTime": 5 });
        }

        if (result["longBreakTime"] !== undefined) {
            longBreak = result["longBreakTime"];
        } else {
            chrome.storage.local.set({ "longBreakTime": 15 });
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
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.action) {
        case "startTimer":
            startTimer();
            break;
        case "stopTimer":
            stopTimer();
            break;
        case "resetTimer":
            resetTimer(false);
            break;
        case "resetTimerIgnore":
            resetTimer(true)
            break;
        case "resetSession":
            resetSession();
            break;
        case "setPomodoro":
            setPomodoro();
            break;
        case "setShortBreak":
            setShortBreak();
            break;
        case "setLongBreak":
            setLongBreak();
            break;
        case "applySettings":
            applySettings();
            break;
        default:
            console.log("Error");
    }
});