import {Mesh} from './mesh.js';
import {getHeight} from "./heightMap.js";
import * as Vector from './vector.js';

function calculateNormal(heightMap, x, y, width, height) {

	const hl = getHeight(heightMap, x - 1, y, width, height);
	const hr = getHeight(heightMap, x + 1, y, width, height);
	const hd = getHeight(heightMap, x, y - 1, width, height);
	const hu = getHeight(heightMap, x, y + 1, width, height);

	return Vector.normalise([
		hl - hr,
		hd - hu,
		2.0
	]);
}

/**
 *
 * @param {Number} width
 * @param {Number} height
 * @param {Float32Array} heightMap
 * @returns {Float32Array}
 */
function generateVertices(width, height, heightMap) {
	// * 6 as 3 for position & 3 for normals.
	const vertices = new Float32Array(width * height * 6);

	let offset = 0;
	for (let y = 0; y < height; ++y) {
		for (let x = 0; x < width; ++x) {
			vertices[offset++] = x;
			vertices[offset++] = getHeight(heightMap, x, y, width, height);
			vertices[offset++] = y;

			const normal = calculateNormal(heightMap, x, y, width, height);
			vertices[offset++] = normal[0];
			vertices[offset++] = normal[1];
			vertices[offset++] = normal[2];
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

			indices[offset++] = idx + width;
			indices[offset++] = idx;
			indices[offset++] = idx + width + 1;

			indices[offset++] = idx + 1;
			indices[offset++] = idx + 1 + width;
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
	 * @param {Float32Array} heightMap
	 */
	constructor(gl, shader, width, height, heightMap) {
		this.shader = shader;
		this.mesh = new Mesh(gl,
			generateVertices(width, height, heightMap),
			generateVertexIndices(width, height)
		);
	}


	/**
	 *
	 * @param {Float32List} viewMatrix
	 * @param {Float32List} projectionMatrix
	 * @param {Object} renderConfig
	 */
	draw(viewMatrix, projectionMatrix, renderConfig) {
		this.shader.use();
		this.shader.setFloat("grassBlendAmount", renderConfig.grassBlendAmount);
		this.shader.setFloat("grassSlopeThreshold", renderConfig.grassSlopeThreshold);
		this.shader.setMat4("viewMatrix", viewMatrix);
		this.shader.setMat4("projectionMatrix", projectionMatrix);
		this.mesh.draw();
	}

	destroy() {
		this.mesh.destroy();
	}
}