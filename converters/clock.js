class Clock {
    static minutesAndSecondsToSeconds(minutes, seconds) {
        if (isNaN(minutes) || isNaN(seconds)) return;

        return minutes * 60 + seconds;
    }

    static secondsToMinutesAndSeconds(seconds) {
        if (isNaN(seconds)) return;

        const fullMinutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return {
            minutes: fullMinutes,
            seconds: remainingSeconds,
        };
    }

    static prettify(object) {
        let seconds = roundNumber(object.seconds, 0);
        if (seconds < 10) {
            seconds = `0${seconds}`;
        }

        return `${object.minutes}:${seconds}`;
    }
}
