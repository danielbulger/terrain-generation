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
	constructor(gl, vertexId, fragmentId) {
		this.gl = gl;
		this.program = makeProgram(gl,
			document.getElementById(vertexId).text,
			document.getElementById(fragmentId).text);
	}

	use() {
		this.gl.useProgram(this.program);
	}

	getLocation(name) {
		return this.gl.getUniformLocation(this.program, name);
	}

	setBool(name, value) {
		this.gl.uniform1i(this.getLocation(name), value ? 1 : 0);
	}

	setInt(name, value) {
		this.gl.uniform1i(this.getLocation(name), value);
	}

	setFloat(name, value) {
		this.gl.uniform1fv(this.getLocation(name), value);
	}

	setVec2(name, value) {
		this.gl.uniform2fv(this.getLocation(name), value);
	}

	setVec3(name, value) {
		this.gl.uniform3fv(this.getLocation(name), value);
	}

	setVec4(name, value) {
		this.gl.uniform4fv(this.getLocation(name), value);
	}

	setMat3(name, value) {
		this.gl.uniformMatrix3fv(this.getLocation(name), false, value);
	}

	setMat4(name, value) {
		this.gl.uniformMatrix4fv(this.getLocation(name), false, value);
	}

	destroy() {
		this.gl.deleteProgram(this.program);
	}
}