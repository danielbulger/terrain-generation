import {noise} from "./simplex.js";
import * as Random from './random.js';

/**
 * @param {Float32Array} heightMap
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {number}
 */
export function getHeight(heightMap, x, y, width, height) {
	return heightMap[x + (y * width)];
}

/**
 * @param {number} width
 * @param {number} height
 * @param {object} noiseConfig
 * @returns {Float32Array}
 */
export function generateHeightMap(width, height, noiseConfig) {
	const heights = new Float32Array(width * height);

	const offsets = new Float32Array(noiseConfig.octaves * 2);
	for(let i = 0; i < offsets.length; ++i) {
		offsets[i] = Random.range(-noiseConfig.weight, noiseConfig.weight);
	}

	for (let y = 0; y < height; ++y) {
		for (let x = 0; x < width; ++x) {

			let noiseValue = 0;
			let weight = noiseConfig.weight;
			let scale = noiseConfig.scale

			for (let i = 0; i < noiseConfig.octaves; ++i) {
				noiseValue += (weight * noise(
					offsets[i * 2] + (x / width) * scale,
					offsets[i * 2 + 1] + (y / height) * scale)
				);
				weight *= noiseConfig.persistence;
				scale *= noiseConfig.lacunarity;
			}

			heights[x + (y * width)] = noiseValue;
		}
	}

	return heights;
}