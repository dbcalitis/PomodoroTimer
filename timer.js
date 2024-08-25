export class Timer {
    constructor() {
        this.timerDisplay = "";
        this.timerOn = false;
        this.minutes = 25;
        this.seconds = 0;

        this.sessionNum = 1;
        this.breakNum = 1;

        this.sessionDuration = 25;
        this.shortDuration = 5;
        this.longDuration = 15;

        this.longBreakInterval = 4;
        this.timerStatus = "pomodoro";
    }

    setSettings(sessionDuration, shortDuration, longDuration) {
        if (sessionDuration !== undefined) {
            this.sessionDuration = sessionDuration;
        } else {
            this.sessionDuration = 25;
        }

        if (shortDuration !== undefined) {
            this.shortDuration = shortDuration;
        } else {
            this.shortDuration = 5;
        }

        if (longDuration !== undefined) {
            this.longDuration = longDuration;
        } else {
            this.longDuration = 15;
        }
    }

    setTimer(minutes, seconds) {
        const zeroPad = (num, places) => String(num).padStart(places, '0');
        this.minutes = minutes;
        this.seconds = seconds;

        this.timer = `${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`;
    }

    setTimerDisplay(timer) {
        this.timerDisplay = timer;
    }

    getTimerDisplay(timer) {
        return this.timerDisplay;
    }

    setStatus(status) {
        this.status = status;
    }

    getStatus() {
        return this.status;
    }

    toggleTimer(isOn) {
        this.timerOn = isOn;
    }

    setSessionNum(sessionNum) {
        this.sessionNum = sessionNum;
    }

    getSessionNum() {
        return this.sessionNum;
    }

    setBreakNum(breakNum) {
        this.breakNum = breakNum;
    }

    getBreakNum() {
        return this.breakNum;
    }

    setShortBreak() {
        this.minutes = this.shortDuration;
        this.seconds = 0;
        this.timerStatus = "break";
    }

    setLongBreak() {
        this.minutes = this.longDuration;
        this.seconds = 0;
        this.timerStatus = "break";
    }

    setPomodoro() {
        this.minutes = this.sessionDuration;
        this.seconds = 0;
        this.timerStatus = "pomodoro";
    }

    resetTimer(ignore) {
        if (timerStatus == "pomodoro") {
            this.minutes = this.sessionDuration;
        } else {
            if (!ignore) {
                if (this.breakNum % this.longBreakInterval == 0) {
                    this.minutes = this.longDuration;
                } else {
                    this.minutes = this.shortDuration;
                }
            }
        }

        this.seconds = 0;
    }

    setSessionDuration(sessionDuration) {
        this.sessionDuration = sessionDuration;
    }

    setLongDuration(longDuration) {
        this.longDuration = longDuration;
    }

    setShortDuration(shortDuration) {
        this.shortDuration = shortDuration;
    }

    setLongBreakInterval(interval) {
        this.longBreakInterval = interval;
    }

    update(
        timer,
        timerOn,
        minutes,
        seconds,
        sessionNum,
        breakNum,
        sessionDuration,
        shortDuration,
        longDuration,
        longBreakInterval,
        timerStatus,
    ) {
        setTimerDisplay(timer);
        toggleTimer(timerOn);
        setTimer(minutes, seconds);
        setSessionNum(sessionNum);
        setBreakNum(breakNum);
        setSettings(sessionDuration, shortDuration, longDuration);
        setLongBreakInterval(longBreakInterval)
        setStatus(timerStatus);
    }

}

module.exports = Timer;