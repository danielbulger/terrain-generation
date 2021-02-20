/**
 * @param {number} max
 * @return {number}
 */
export function next(max) {
	return Math.random() * max;
}

/**
 * @param {number} max
 * @return {number}
 */
export function nextInt(max) {
	return Math.floor(next(max));
}

/**
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
export function range(min, max) {
	return Math.random() * (max - min + 1) + min;
}