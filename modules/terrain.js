import {Mesh} from './mesh.js';
import {noise} from "./simplex.js";

/**
 *
 * @param {Number} width
 * @param {Number} height
 * @param {Object} noiseConfig
 * @returns {Float32Array}
 */
function generateVertices(width, height, noiseConfig) {
	// * 6 as 3 for position
	const vertices = new Float32Array(width * height * 3);

	let offset = 0;
	for (let y = 0; y < height; ++y) {
		for (let x = 0; x < width; ++x) {

			let noiseValue = 0;
			let weight = noiseConfig.weight;
			let scale = noiseConfig.scale

			for (let i = 0; i < noiseConfig.octaves; ++i) {
				noiseValue += (weight * noise((x / width) * scale, (y / height) * scale));
				weight *= noiseConfig.persistence;
				scale *= noiseConfig.lacunarity;
			}

			vertices[offset++] = x;
			vertices[offset++] = noiseValue;
			vertices[offset++] = y;
		}
	}

	return vertices;
}

/**
 *
 * @param {Number} width
 * @param {Number} height
 * @returns {Int32Array}
 */
function generateVertexIndices(width, height) {
	const indices = new Int32Array(width * height * 6);

	let offset = 0;
	for (let y = 0; y < height - 1; ++y) {
		for (let x = 0; x < width - 1; ++x) {

			const idx = x + y * width;

			indices[offset++] = (idx + width);
			indices[offset++] = idx;
			indices[offset++] = (idx + width + 1);

			indices[offset++] = (idx + 1);
			indices[offset++] = (idx + 1 + width);
			indices[offset++] = idx;
		}
	}

	return indices;
}

export class Terrain {

	/**
	 *
	 * @param {WebGL2RenderingContext} gl
	 * @param {Shader} shader
	 * @param {Number} width
	 * @param {Number} height
	 */
	constructor(gl, shader, width, height, noiseConfig) {
		this.shader = shader;
		this.mesh = new Mesh(gl,
			generateVertices(width, height, noiseConfig),
			generateVertexIndices(width, height)
		);
	}

	/**
	 *
	 * @param {Float32List} viewMatrix
	 * @param {Float32List} projectionMatrix
	 */
	draw(viewMatrix, projectionMatrix) {
		this.shader.use();
		this.shader.setMat4("viewMatrix", viewMatrix);
		this.shader.setMat4("projectionMatrix", projectionMatrix);
		this.mesh.draw();
	}

	destroy() {
		this.mesh.destroy();
	}
}