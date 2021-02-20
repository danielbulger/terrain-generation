
export function add(v0, v1) {
	return [
		v0[0] + v1[0],
		v0[1] + v1[1]
	];
}

export function sub(v0, v1) {
	return [
		v0[0] - v1[0],
		v0[1] - v1[1]
	];
}

export function scale(v0, scale) {
	return [
		v0[0] * scale,
		v0[1] * scale
	];
}

export function length(v0) {
	return Math.sqrt(v0.reduce(function(total, currentValue) {
		return total + (currentValue * currentValue);
	}, 0));
}

export function normalise(v0) {
	const len = length(v0);
	if(len !== 0) {
		return v0.map(function(currentValue) {
			return currentValue / len;
		});
	}
}