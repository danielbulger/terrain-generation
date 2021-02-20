import {Shader} from "./modules/shader.js";
import {Terrain} from "./modules/terrain.js";
import {Camera} from "./modules/camera.js";
import {generateHeightMap} from "./modules/heightMap.js";
import * as Erosion from "./modules/erosion.js";

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
	rendering: {
		grassSlopeThreshold: 0.5,
		grassBlendAmount: 0.5
	},
	noise: {
		octaves: 7,
		persistence: 0.5,
		lacunarity: 2,
		weight: 2048,
		scale: 1
	},
	erosion: {
		iterations: 1,
		capacity: 2,
		radius: 3,
		minSlope: 0.05,
		inertia: 0.05,
		erodeSpeed: 0.3,
		depositSpeed: 0.3,
		gravity: 4,
		maxLifetime: 30,
		initialVolume: 1,
		initialVelocity: 1,
		evaporateSpeed: 0.01
	},

	regenerate: makeTerrain
};

function makeTerrain() {
	if (terrain != null) {
		terrain.destroy();
	}
	terrain = new Terrain(
		gl,
		shader,
		config.terrainWidth,
		config.terrainHeight,
		makeHeightMap()
	);
}

function makeHeightMap() {
	const heightMap = generateHeightMap(config.terrainWidth, config.terrainHeight, config.noise);
	Erosion.simulate(config.erosion.iterations, heightMap, config.terrainWidth, config.terrainHeight, config.erosion);
	return heightMap;
}

function initialiseConfig(canvas) {

	gui.add(config, "terrainWidth").min(0);
	gui.add(config, "terrainHeight").min(0);

	const camera = gui.addFolder('camera');

	camera.add(config, "FOV").min(0).max(120).onChange(function (newValue) {
		resize(canvas)
	});

	camera.add(config, "zNear").min(0).onChange(function (newValue) {
		resize(canvas)
	});

	camera.add(config, "zFar").min(0).onChange(function (newValue) {
		resize(canvas)
	});

	const rendering = gui.addFolder('rendering');
	for(let key in config.rendering) {
		rendering.add(config.rendering, key);
	}

	const noise = gui.addFolder("noise");
	for(let key in config.noise) {
		noise.add(config.noise, key);
	}

	const droplet = gui.addFolder("droplet");
	for(let key in config.erosion) {
		droplet.add(config.erosion, key);
	}

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
		terrain.draw(
			camera.getViewMatrix(),
			camera.getProjectionMatrix(),
			config.rendering
		);
	}
	gl.finish();

	requestAnimationFrame(function () {
		render();
	});
}

function main() {
	const canvas = getGLContext();

	shader = new Shader(gl, 'vertex-shader', 'fragment-shader');
	camera = new Camera(-4, 216, -96, 50, -36);

	makeTerrain();
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