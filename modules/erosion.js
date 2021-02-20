import * as Random from './random.js';
import * as Vector from './vector.js';

/**
 * Implemented as in https://www.firespark.de/resources/downloads/implementation%20of%20a%20methode%20for%20hydraulic%20erosion.pdf
 * @param {number} iterations
 * @param {Float32Array} heightMap
 * @param {number} width
 * @param {number} height
 * @param {object} params
 */
export function simulate(iterations, heightMap, width, height, params) {
	for (let iteration = 0; iteration < iterations; ++iteration) {
		let posX = Random.next(width - 1);
		let posY = Random.next(height - 1);
		let velocity = params.initialVelocity;
		let water = params.initialVolume;
		let sediment = 0;

		for(let lifetime = 0; lifetime < params.maxLifetime; ++lifetime) {

			const oldX = posX, oldY = posY;
			const gradient = calculateGradient(heightMap, posX, posY, width, height);
			const dirX = calculateNewPos(posX, params.inertia, gradient.x);
			const dirY = calculateNewPos(posY, params.inertia, gradient.y);
			const norm = normalise(dirX, dirY);
			posX += norm[0];
			posY += norm[1];

			if(hasDropletStopped(posX, posY, norm[0], norm[1], width, height)) {
				break;
			}

			const newGradient = calculateGradient(heightMap, posX, posY, width, height);
			const heightDiff = newGradient.height - gradient.height;
			const sedimentCapacity = calculateSedimentCapacity(heightDiff, params.minSlope, velocity, water, params.capacity);

			if(shouldDeposit(heightDiff, sediment, sedimentCapacity)) {
				const amount = getDepositAmount(heightDiff, sediment, sedimentCapacity, params.depositSpeed);
				sediment -= amount;
				deposit(heightMap, oldX, oldY, amount, width, height);
			} else {
				const amount = getErodeAmount(heightDiff, sedimentCapacity, sediment, params.erodeSpeed);
				sediment += amount;
				erode(heightMap, posX, posY, width, height, amount, params.radius);
			}

			velocity = calculateDropletVelocity(heightDiff, velocity, params.gravity);
			water = evaporateWater(water, params.evaporateSpeed);
		}
	}
}

/**
 * page 11, figure 5.9
 *
 * @param {Float32Array} heightMap
 * @param {Number} posX
 * @param {Number} posY
 * @param {Number} width
 * @param {Number} height
 * @param {Number} amount
 * @param {Number} radius
 */
function erode(heightMap, posX, posY, width, height, amount, radius) {

	const x0 = Math.trunc(posX) - radius;
	const y0 = Math.trunc(posY) - radius;

	const xStart = Math.max(0, x0);
	const yStart = Math.max(0, y0);
	const xEnd = Math.min(width, x0 + 2 * radius + 1);
	const yEnd = Math.min(height, y0 + 2 * radius + 1);

	const size = 2 * radius + 1;
	const kernel = new Float32Array(size * size);
	let kernelSum = 0;

	for(let y = yStart; y < yEnd; ++y) {
		for(let x = xStart; x < xEnd; ++x) {
			const deltaX = x - posX;
			const deltaY = y - posY;
			const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			const weight = Math.max(0, radius - distance);
			kernelSum += weight;
			kernel[(y - y0) * size + (x - x0)] = weight;
		}
	}

	for(let y = yStart; y < yEnd; ++y) {
		for (let x = xStart; x < xEnd; ++x) {
			const index = (y - y0) * size + (x - x0);
			kernel[index] /= kernelSum;
			heightMap[y * width + x] -= amount * kernel[index];
		}
	}
}

/**
 *
 * @param {number} heightDiff
 * @param {number} sediment
 * @param {number} sedimentCapacity
 * @return {boolean}
 */
function shouldDeposit(heightDiff, sediment, sedimentCapacity) {
	return sediment > sedimentCapacity || heightDiff > 0;
}

/**
 *
 * @param {number} dx
 * @param {number} dy
 * @return {number[]}
 */
function normalise(dx, dy) {
	const length = Math.sqrt(dx * dx + dy * dy);
	if (length !== 0) {
		dx /= length;
		dy /= length;
	}
	return [dx, dy];
}

/**
 *  page 9 figure 5.1
 *
 * @param {number} pos
 * @param {number} inertia
 * @param {number} gradient
 * @returns {number}
 */
function calculateNewPos(pos, inertia, gradient) {
	return pos * inertia - gradient * (1 - inertia);
}

/**
 * page 10, figure 5.4
 *
 * @param {number} heightDiff
 * @param {number} minSlope
 * @param {number} velocity
 * @param {number} water
 * @param {number} capacity
 * @returns {number}
 */
function calculateSedimentCapacity(heightDiff, minSlope, velocity, water, capacity) {
	return Math.max(-heightDiff, minSlope) * velocity * water * capacity;
}

/**
 * @param {number} heightDiff
 * @param {number} sediment
 * @param {number} sedimentCapacity
 * @param {number} velocity
 * @returns {number}
 */
function getDepositAmount(heightDiff, sediment, sedimentCapacity, velocity) {
	return heightDiff > 0 ? Math.min(heightDiff, sediment) : (sediment - sedimentCapacity) * velocity;
}

/**
 * page 12, figure 5.6
 *
 * @param {number} heightDiff
 * @param {number} sedimentCapacity
 * @param {number} sediment
 * @param {number} erodeSpeed
 * @returns {number}
 */
function getErodeAmount(heightDiff, sedimentCapacity, sediment, erodeSpeed) {
	return Math.min((sedimentCapacity - sediment) * erodeSpeed, -heightDiff);
}

/**
 * page 11, figure 5.7
 *
 * @param {number} heightDiff
 * @param {number} velocity
 * @param {number} gravity
 * @returns {number}
 */
function calculateDropletVelocity(heightDiff, velocity, gravity) {
	return Math.sqrt(velocity * velocity + heightDiff * gravity);
}

/**
 * page 11, figure 5.8
 *
 * @param {number} water
 * @param {number} evaporateSpeed
 * @returns {number}
 */
function evaporateWater(water, evaporateSpeed) {
	return water * (1 - evaporateSpeed);
}

/**
 * @param {number} posX
 * @param {number} posY
 * @param {number} dirX
 * @param {number} dirY
 * @param {number} width
 * @param {number} height
 * @returns {boolean}
 */
function hasDropletStopped(posX, posY, dirX, dirY, width, height) {
	return (dirX === 0 && dirY === 0) ||
		posX < 0 || posX >= width - 1 ||
		posY < 0 || posY >= height - 1;
}

/**
 *
 * @param {Float32Array} heightMap
 * @param {number} posX
 * @param {number} posY
 * @param {number} amount
 * @param {number} width
 * @param {number} height
 */
function deposit(heightMap, posX, posY, amount,width, height) {

	const gridX = Math.trunc(posX);
	const gridY = Math.trunc(posY);

	const u = posX - gridX;
	const v = posY - gridY;

	heightMap[(gridY * width) + gridX] += amount * (1 - u) * (1 - v);
	heightMap[(gridY * width) + gridX + 1] += amount * u * (1 - v);
	heightMap[((gridY + 1) * width) + gridX] += amount * (1 - u) * v;
	heightMap[((gridY + 1) * width) + gridX + 1] += amount * u * v;
}

/**
 *
 * @param {Float32Array} heightMap
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 * @return {number[]}
 */
function getGradientAt(heightMap, x, y, width, height) {
	const index = y * width + x;

	const right = index + ((x > width - 2) ? 0 : 1);
	const below = index + ((y > height - 2) ? 0 : width);

	return [
		heightMap[right] - heightMap[index],
		heightMap[below] - heightMap[index]
	];
}

/**
 * page 8, figure 5.0
 *
 * @param {Float32Array} heightMap
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 * @return {{x: number, y: number, height: number}}
 */
function calculateGradient(heightMap, x, y, width, height) {
	const gridX = Math.trunc(x);
	const gridY = Math.trunc(y);

	const u = x - gridX;
	const v = y - gridY;

	const center = getGradientAt(heightMap, gridX, gridY, width, height);
	const right = getGradientAt(heightMap, gridX + 1, gridY, width, height);
	const top = getGradientAt(heightMap, gridX, gridY + 1, width, height);
	const topLeft = getGradientAt(heightMap, gridX + 1, gridY + 1, width, height);

	const gradient = Vector.add(
		Vector.scale(1 - u, Vector.add(
			Vector.scale(center, 1 - v),
			Vector.scale(top, v))
		),
		Vector.scale(u, Vector.add(
			Vector.scale(right, 1- u),
			Vector.scale(topLeft, u))
		)
	);

	return {
		x: gradient[0],
		y: gradient[1],
		height: bilinearInterpolate(heightMap, gridX, gridY, width, height)
	};
}

/**
 *
 * @param {Float32Array} heightMap
 * @param {Number} gridX
 * @param {Number} gridY
 * @param {Number} width
 * @param {Number} height
 * @return {number}
 */
function bilinearInterpolate(heightMap, gridX, gridY, width, height) {
	const center = heightMap[gridY * width + gridX];
	const right = heightMap[gridY * width + gridX + 1];
	const top = heightMap[(gridY + 1) * width + gridX];
	const topLeft = heightMap[(gridY + 1) * width + gridX + 1];

	return (1 - gridX) *
		((1 - gridY) * center + gridY * top) +
		gridX * ((1 - gridY) * right + gridY * topLeft);
}