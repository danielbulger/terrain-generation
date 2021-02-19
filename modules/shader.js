/**
 * @param {WebGL2RenderingContext} gl
 * @param {string} source
 * @param {number} type
 * @returns {WebGLShader}
 */
function parseShader(gl, source, type) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source.trim());
	gl.compileShader(shader);

	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return shader;
	}

	const errorMessage = gl.getShaderInfoLog(shader);
	gl.deleteShader(shader);
	throw errorMessage;
}

/**
 *
 * @param {WebGL2RenderingContext} gl
 * @param {string} vertexShaderSource
 * @param {string} fragmentShaderSource
 * @returns {WebGLProgram}
 */
function makeProgram(gl, vertexShaderSource, fragmentShaderSource) {
	const vertexShader = parseShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
	const fragmentShader = parseShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);

	if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
		return program;
	}

	const errorMessage = gl.getProgramInfoLog(program);
	gl.deleteProgram(program);

	throw errorMessage;
}

export class Shader {

	/**
	 * @param {WebGL2RenderingContext} gl
	 * @param {string} vertexId
	 * @param {string} fragmentId
	 */
	constructor(gl, vertexId, fragmentId) {
		this.gl = gl;
		this.program = makeProgram(gl,
			document.getElementById(vertexId).text,
			document.getElementById(fragmentId).text);
	}

	use() {
		this.gl.useProgram(this.program);
	}

	/**
	 * @param {string} name
	 * @returns {WebGLUniformLocation}
	 */
	getLocation(name) {
		return this.gl.getUniformLocation(this.program, name);
	}

	/**
	 * @param {string} name
	 * @param {boolean} value
	 */
	setBool(name, value) {
		this.gl.uniform1i(this.getLocation(name), value ? 1 : 0);
	}


	/**
	 * @param {string} name
	 * @param {number} value
	 */
	setInt(name, value) {
		this.gl.uniform1i(this.getLocation(name), value);
	}

	/**
	 * @param {string} name
	 * @param {Float32List} value
	 */
	setFloat(name, value) {
		this.gl.uniform1fv(this.getLocation(name), value);
	}

	/**
	 * @param {string} name
	 * @param {Float32List} value
	 */
	setVec2(name, value) {
		this.gl.uniform2fv(this.getLocation(name), value);
	}

	/**
	 * @param {string} name
	 * @param {Float32List} value
	 */
	setVec3(name, value) {
		this.gl.uniform3fv(this.getLocation(name), value);
	}

	/**
	 * @param {string} name
	 * @param {Float32List} value
	 */
	setVec4(name, value) {
		this.gl.uniform4fv(this.getLocation(name), value);
	}

	/**
	 * @param {string} name
	 * @param {Float32List} value
	 */
	setMat3(name, value) {
		this.gl.uniformMatrix3fv(this.getLocation(name), false, value);
	}

	/**
	 * @param {string} name
	 * @param {Float32List} value
	 */
	setMat4(name, value) {
		this.gl.uniformMatrix4fv(this.getLocation(name), false, value);
	}

	destroy() {
		this.gl.deleteProgram(this.program);
	}
}