import {Shader} from "./modules/shader.js";
import {Terrain} from "./modules/terrain.js";
import {Camera} from "./modules/camera.js";

const gui = new dat.GUI();

let gl = undefined;
let shader = undefined;
let terrain = undefined;
let camera = undefined;

const config = {
	FOV: 45,
	zNear: 0.01,
	zFar: 10000,
	terrainWidth: 512,
	terrainHeight: 512,
	regenerate: makeTerrain,
	noise: {
		octaves: 7,
		persistence: 0.5,
		lacunarity: 2,
		weight: 2048,
		scale: 1
	}
};

function makeTerrain() {
	if (terrain != null) {
		terrain.destroy();
	}
	terrain = new Terrain(gl, shader, config.terrainWidth, config.terrainHeight, config.noise);
}

function initialiseConfig(canvas) {

	gui.add(config, "FOV").min(0).max(120).onChange(function (newValue) {
		resize(canvas)
	});

	gui.add(config, "zNear").min(0).onChange(function (newValue) {
		resize(canvas)
	});

	gui.add(config, "zFar").min(0).onChange(function (newValue) {
		resize(canvas)
	});

	gui.add(config, "terrainWidth").min(0);
	gui.add(config, "terrainHeight").min(0);

	gui.add(config.noise, "octaves")
	gui.add(config.noise, "persistence")
	gui.add(config.noise, "lacunarity")
	gui.add(config.noise, "weight")
	gui.add(config.noise, "scale")

	gui.add(config, "regenerate");
}

/**
 *
 * @returns {HTMLElement}
 */
function getGLContext() {
	const canvas = document.getElementById('canvas');
	gl = canvas.getContext("webgl2");
	if (gl === undefined) {
		throw 'WebGL2 is not supported';
	}

	return canvas;
}

/**
 *
 * @param {HTMLElement} canvas
 */
function resize(canvas) {
	const {width, height} = canvas.getBoundingClientRect();

	const displayWidth = Math.round(width * window.devicePixelRatio);
	const displayHeight = Math.round(height * window.devicePixelRatio);

	if (canvas.width !== displayHeight || canvas.height !== displayHeight) {
		canvas.width = displayWidth;
		canvas.height = displayHeight;
		gl.viewport(0, 0, displayWidth, displayHeight);
	}

	if (camera != null) {
		camera.updatePerspective(
			config.FOV,
			canvas.width / canvas.height,
			config.zNear,
			config.zFar
		);
	}
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	if (terrain !== undefined) {
		terrain.draw(camera.getViewMatrix(), camera.getProjectionMatrix());
	}
	gl.finish();

	requestAnimationFrame(function () {
		render();
	});
}

function main() {
	const canvas = getGLContext();

	shader = new Shader(gl, 'vertex-shader', 'fragment-shader');
	terrain = new Terrain(gl, shader, config.terrainWidth, config.terrainHeight, config.noise);
	camera = new Camera(-4, 216, -96, 50, -36);

	initialiseConfig(canvas);
	resize(canvas);

	window.addEventListener('resize', function (event) {
		resize(canvas);
	});

	window.addEventListener('keydown', function (event) {
		camera.processKeyboard(event);
	});

	window.addEventListener('mousemove', function (event) {
		camera.processMouse(event);
	});

	gl.clearColor(0, 0, 0, 1.0);
	render();
}

window.onload = main;