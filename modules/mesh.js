export class Mesh {
	/**
	 *
	 * @param {WebGL2RenderingContext} gl
	 * @param {Float32Array} vertices
	 * @param {Int32Array} indices
	 */
	constructor(gl, vertices, indices) {
		this.gl = gl;
		this.vertices = vertices;
		this.indices = indices;

		this.vao = gl.createVertexArray();
		this.vbo = gl.createBuffer();
		this.indexBuffer = gl.createBuffer();

		gl.bindVertexArray(this.vao);

		// Write the index data to the VAO
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

		// Write the vertex data to the VAO
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

		// Vertex position attribute
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);

		// Colour attribute
		gl.enableVertexAttribArray(1);
		gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);

		// Clear the currently set VAO.
		gl.bindVertexArray(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}

	draw() {
		this.gl.bindVertexArray(this.vao);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

		this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.indices.length, this.gl.UNSIGNED_INT, 0);

		this.gl.bindVertexArray(null);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
	}

	destroy() {
		this.gl.deleteVertexArray(this.vao);
		this.gl.deleteBuffer(this.vbo);
		this.gl.deleteBuffer(this.indexBuffer);
		this.vertices = this.indices = null;
	}
}