class Weight {
    static onePoundInKilos = 0.4536;

    static convertHuman(value, unit, digits = 2) {
        const conversion = this.#_convert(value, unit);
        return `${roundNumber(conversion.result, digits)} ${conversion.unit}`;
    }

    static kilosToPounds(value) {
        if (isNaN(value)) return;

        return value / this.onePoundInKilos;
    }

    static poundsToKilos(value) {
        if (isNaN(value)) return;

        return value * this.onePoundInKilos;
    }

    static convert(value, unit) {
        return this.#_convert(value, unit).result;
    }

    static #_convert(value, unit) {
        if (unit === 'kg') {
            return { result: Weight.kilosToPounds(value), unit: 'lbs', };
        } else if (unit === 'lbs') {
            return { result: Weight.poundsToKilos(value), unit: 'kg', };
        } else {
            throw new Error('Invalid unit, only kg or lbs supported');
        }
    }
}
