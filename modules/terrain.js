import {Mesh} from './mesh.js';

/**
 *
 * @param {Number} width
 * @param {Number} height
 * @returns {Float32Array}
 */
function generateVertices(width, height) {
	// * 6 as 3 for position & 3 for RGB colour.
	const vertices = new Float32Array(width * height * 6);

	const incrementX = 1;
	const incrementZ = 1;

	let offset = 0;
	for (let y = 0; y < height; ++y) {
		for (let x = 0; x < width; ++x) {

			const vertexX = -0.5 + (x * incrementX);
			const vertexY = Math.max(Math.random(), 0.5);
			const vertexZ = -0.5 + (y * incrementZ);

			// Position
			vertices[offset++] = vertexX;
			vertices[offset++] = vertexY;
			vertices[offset++] = vertexZ;

			// UV Colour
			vertices[offset++] = (x / width);
			vertices[offset++] = (y / width);
			vertices[offset++] = 0;
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
	const numStripsRequired = height - 1;
	const numDegensRequired = 2 * (numStripsRequired - 1);
	const verticesPerStrip = 2 * width;

	const indices = new Int32Array((verticesPerStrip * numStripsRequired) + numDegensRequired);

	let offset = 0;
	for(let y = 0; y < height - 1; ++y) {
		indices[offset++] = y * height;

		for(let x = 0; x < width; ++x) {
			indices[offset++] = (y * height) + x;
			indices[offset++] = ((y + 1) * height) + x;
		}

		if(y < height - 2) {
			indices[offset++] = ((y + 1) * height) + (width - 1);
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
	constructor(gl, shader, width, height) {
		this.shader = shader;
		this.mesh = new Mesh(gl,
			generateVertices(width, height),
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