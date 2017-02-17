const THREE = require('three');

class Bounds
{
	constructor(min, max)
	{
		this.min = min.clone();
		this.max = max.clone();
	}

	encapsulate(p)
	{
		this.min.min(p);
		this.max.max(p);
	}

	intersectsX(x)
	{
		return this.min.x < x && this.max.x > x;
	}

	intersectsY(y)
	{
		return this.min.y < y && this.max.y > y;
	}

	intersectsZ(Z)
	{
		return this.min.z < z && this.max.z > z;
	}

	contains(p)
	{
		return this.min.x < p.x && this.min.y < p.y && this.max.x > p.x && this.max.y > p.y;
	}
}

export {Bounds}