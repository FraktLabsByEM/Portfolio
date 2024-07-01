
/**
 * Map a number between source range and target range
 * @param {number} number number to map
 * @param {number} smin source range min value
 * @param {number} smax source range max value
 * @param {number} tmin target range min value
 * @param {number} tmax target range max value
 * @returns mapped number
 * @example 
 */
const map = (number, smin, smax, tmin, tmax) => {
    return (number - smin) / (smax - smin) * (tmax - tmin) + tmin;
}

export default { map }
