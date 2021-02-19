const UP = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);
const YAW = -90;
const PITCH = 0;
const SPEED = 10;
const SENSITIVITY = 0.75;

export class Camera {

	constructor(x, y, z, yaw, pitch) {
		this.position = glMatrix.vec3.fromValues(x, y, z);
		this.yaw = yaw || YAW;
		this.pitch = pitch || PITCH;

		this.front = glMatrix.vec3.create();
		this.right = glMatrix.vec3.create();
		this.up = glMatrix.vec3.create();

		this.viewMatrix = glMatrix.mat4.create();
		this.projectionMatrix = glMatrix.mat4.create();
		this.mouseInput = true;

		this.updateCameraVectors();
	}

	/**
	 *
	 * @param {KeyboardEvent} event
	 */
	processKeyboard(event) {

		const velocity = SPEED * 0.33;

		switch (event.code) {
			case 'Space':
				this.mouseInput = !this.mouseInput;
				this.firstMouse = true;
				break;

			case 'KeyW':
			case "ArrowUp":
				glMatrix.vec3.add(
					this.position,
					this.position,
					glMatrix.vec3.scale(glMatrix.vec3.create(), this.front, velocity)
				);
				break;

			case 'KeyS':
			case "ArrowDown":
				glMatrix.vec3.sub(
					this.position,
					this.position,
					glMatrix.vec3.scale(glMatrix.vec3.create(), this.front, velocity)
				);
				break;

			case 'KeyD':
			case "ArrowRight":
				glMatrix.vec3.add(
					this.position,
					this.position,
					glMatrix.vec3.scale(glMatrix.vec3.create(), this.right, velocity)
				);
				break;

			case 'KeyA':
			case "ArrowLeft":
				glMatrix.vec3.sub(
					this.position,
					this.position,
					glMatrix.vec3.scale(glMatrix.vec3.create(), this.right, velocity)
				);
				break;

			case 'KeyP':
				console.log({
					'Position': this.position,
					'Yaw': this.yaw,
					'Pitch': this.pitch
				});
				break;
		}
	}

	/**
	 * @param {MouseEvent} event
	 */
	processMouse(event) {

		if(!this.mouseInput) {
			return;
		}

		const x = event.movementX;
		const y = -event.movementY;

		const factor = SENSITIVITY * 0.33;
		this.yaw += (x * factor);
		this.pitch += (y * factor);

		if (this.pitch > 89) {
			this.pitch = 89;
		} else if (this.pitch < -89) {
			this.pitch = -89;
		}
		this.updateCameraVectors();
	}

	updatePerspective(fov, aspect, zNear, zFar) {
		glMatrix.mat4.perspective(
			this.projectionMatrix,
			glMatrix.glMatrix.toRadian(fov),
			aspect,
			zNear,
			zFar
		);
	}

	updateCameraVectors() {

		const pitchRad = glMatrix.glMatrix.toRadian(this.pitch);
		const yawRad = glMatrix.glMatrix.toRadian(this.yaw);

		const front = glMatrix.vec3.fromValues(
			Math.cos(yawRad) * Math.cos(pitchRad),
			Math.sin(pitchRad),
			Math.sin(yawRad) * Math.cos(pitchRad)
		);

		glMatrix.vec3.normalize(this.front, front);

		glMatrix.vec3.cross(this.right, this.front, UP);
		glMatrix.vec3.normalize(this.right, this.right);

		glMatrix.vec3.cross(this.up, this.right, this.front);
		glMatrix.vec3.normalize(this.up, this.up);
	}

	getViewMatrix() {

		const center = glMatrix.vec3.add(
			glMatrix.vec3.create(),
			this.position,
			this.front
		);

		return glMatrix.mat4.lookAt(
			this.viewMatrix,
			this.position,
			center,
			this.up
		);
	}

	getProjectionMatrix() {
		return this.projectionMatrix;
	}
}