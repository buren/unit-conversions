function convertSecondsToTimeObject(totalSeconds) {
  if (
    typeof totalSeconds !== "number" ||
    isNaN(totalSeconds) ||
    totalSeconds < 0
  ) {
    throw new Error("Input must be a non-negative number");
  }

  // Round to the nearest second
  totalSeconds = Math.round(totalSeconds);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
  };
}

function prettifyTimeObject(timeObject) {
  const { hours, minutes, seconds } = timeObject;

  // Ensure the values are two digits with leading zeros
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  // If hours are 0, return mm:ss format, otherwise hh:mm:ss
  if (hours === 0) {
    return `${formattedMinutes}:${formattedSeconds}`;
  }
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}


class Pace {
  static convertHuman(minutes, seconds, unit) {
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

  static paceTable(minutes, seconds, unit, additionalDistancesKm = []) {
    let secondsPerKm;
    if (unit === "min/mile") {
        const totalSeconds = Clock.minutesAndSecondsToSeconds(minutes, seconds);
        secondsPerKm = totalSeconds / Distance.oneMileInKm;
    } else {
        secondsPerKm = Clock.minutesAndSecondsToSeconds(minutes, seconds);
    }
    const distancesKm = [
        5,
        10,
        15,
        21.0975,
        42.195,
        100,
        160.9,
        ...additionalDistancesKm,
    ];

    return distancesKm.map((km) => [
      km,
      prettifyTimeObject(convertSecondsToTimeObject(secondsPerKm * km)),
    ]);
  }

  static #_convert(minutes, seconds, unit) {
    if (unit === "min/mile") {
      return { result: this.mileToKm(minutes, seconds), unit: "min/km" };
    } else if (unit === "min/km") {
      return { result: this.kmToMile(minutes, seconds), unit: "min/mile" };
    } else {
      throw new Error("Invalid unit, only min/mile or min/km supported");
    }
  }
}
