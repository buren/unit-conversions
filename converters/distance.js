class Distance {
    static oneMileInKm = 1.609;

    static convertHuman(value, unit, digits = 2) {
        const conversion = this.#_convert(value, unit);
        return `${roundNumber(conversion.result, digits)} ${conversion.unit}`;
    }

    static mileToKm(value) {
        if (isNaN(value)) return;

        return value * this.oneMileInKm;
    }

    static kmToMile(value) {
        if (isNaN(value)) return;

        return value / this.oneMileInKm;
    }

    static #_convert(value, unit) {
        if (unit === 'miles') {
            return { result: this.mileToKm(value), unit: 'km', };
        } else if (unit === 'km') {
            return { result: this.kmToMile(value), unit: 'miles', };
        } else {
            throw new Error('Invalid unit, only miles or km supported');
        }
    }
}
