class Pace {
    static convertHuman(minutes, seconds, unit, digits = 2) {
        const conversion = this.#_convert(minutes, seconds, unit);
        return `${conversion.result} ${conversion.unit}`;
    }

    static mileToKm(minutes, seconds) {
        const totalSeconds = Clock.minutesAndSecondsToSeconds(minutes, seconds);
        const kmPaceInSeconds = totalSeconds / Distance.oneMileInKm;
        const time = Clock.secondsToMinutesAndSeconds(kmPaceInSeconds);

        return Clock.prettify(time);
    }

    static kmToMile(minutes, seconds) {
        const totalSeconds = Clock.minutesAndSecondsToSeconds(minutes, seconds);
        const kmPaceInSeconds = totalSeconds * Distance.oneMileInKm;
        const time = Clock.secondsToMinutesAndSeconds(kmPaceInSeconds);

        return Clock.prettify(time);
    }

    static #_convert(minutes, seconds, unit) {
        if (unit === 'min/mile') {
            return { result: this.mileToKm(minutes, seconds), unit: 'min/km', };
        } else if (unit === 'min/km') {
            return { result: this.kmToMile(minutes, seconds), unit: 'min/mile', }
        } else {
            throw new Error('Invalid unit, only min/mile or min/km supported');
        }
    }
}
