// As described in www.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf

/**
 * @type {number[][]}
 */
const grad3 = [
	[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
	[1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
	[0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
];

/**
 * @type {number[]}
 */
const p = new Array(256);
for (let i = 0; i < p.length; ++i) {
	p[i] = Math.floor(Math.random() * 256);
}

/**
 * @type {number[]}
 */
const perm = new Array(p.length * 2);
for (let i = 0; i < perm.length; ++i) {
	perm[i] = p[i & (p.length - 1)];
}

const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

/**
 * @param {number[]} g
 * @param {number} x
 * @param {number} y
 * @returns {number}
 */
function dot(g, x, y) {
	return g[0] * x + g[1] * y;
}

/**
 * @param {number} x
 * @param {number} y
 * @returns {number}
 */
export function noise(x, y) {
	let n0, n1, n2

	const s = (x + y) * F2; // Hairy factor for 2D
	const i = Math.floor(x + s);
	const j = Math.floor(y + s);

	const t = (i + j) * G2;
	const x0 = x - (i - t);
	const y0 = y - (j - t);

	let i1, j1;
	if (x0 > y0) {
		i1 = 1;
		j1 = 0;
	} else {
		i1 = 0;
		j1 = 1;
	}

	const x1 = x0 - i1 + G2;
	const y1 = y0 - j1 + G2;
	const x2 = x0 - 1.0 + 2.0 * G2;
	const y2 = y0 - 1.0 + 2.0 * G2;

	const ii = i & (p.length - 1);
	const jj = j & (p.length - 1);
	const gi0 = perm[ii + perm[jj]] % 12;
	const gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
	const gi2 = perm[ii + 1 + perm[jj + 1]] % 12;

	let t0 = 0.5 - x0 * x0 - y0 * y0;
	if (t0 < 0) {
		n0 = 0.0;
	} else {
		t0 *= t0;
		n0 = t0 * t0 * dot(grad3[gi0], x0, y0);
	}
	let t1 = 0.5 - x1 * x1 - y1 * y1;
	if (t1 < 0) {
		n1 = 0.0;
	} else {
		t1 *= t1;
		n1 = t1 * t1 * dot(grad3[gi1], x1, y1);
	}
	let t2 = 0.5 - x2 * x2 - y2 * y2;
	if (t2 < 0) {
		n2 = 0.0;
	} else {
		t2 *= t2;
		n2 = t2 * t2 * dot(grad3[gi2], x2, y2);
	}

	return n0 + n1 + n2;
}