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
	for (let y = 0; y < height; ++y) {
		for (let x = 0; x < width; ++x) {

			if (x === width - 1 || y === height - 1) {
				continue;
			}

			const idx = x + y * width;
			// Top left triangle of square
			indices[offset++] = (idx + width);
			indices[offset++] = (idx);
			indices[offset++] = (idx + width + 1);
			// Bottom right triangle of square
			indices[offset++] = (idx + 1);
			indices[offset++] = (idx + 1 + width);
			indices[offset++] = (idx);
		}
	}

	/*
	for (int y = 0; y < chunkHeight; y++)
        for (int x = 0; x < chunkWidth; x++) {
            int pos = x + y*chunkWidth;

            if (x == chunkWidth - 1 || y == chunkHeight - 1) {
                // Don't create indices for right or top edge
                continue;
            } else {
                // Top left triangle of square
                indices.push_back(pos + chunkWidth);
                indices.push_back(pos);
                indices.push_back(pos + chunkWidth + 1);
                // Bottom right triangle of square
                indices.push_back(pos + 1);
                indices.push_back(pos + 1 + chunkWidth);
                indices.push_back(pos);
            }
        }
	 */

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