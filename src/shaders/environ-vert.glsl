
varying vec2 vUv;


/*********************************************************/
/********************** NOISE CALCS **********************/
/*********************************************************/

float findPerlinHeight(float i, float k);
float perlinFunc(float xLoc, float zLoc);
float noiseFunc(float f1, float f2);
//float powerPos(float val, float toTheVal);


float findPerlinHeight(float i, float k) {
    float divFactor = 14.0;

    float leftX = floor(i/divFactor)*divFactor;
    float backwardsZ = floor(k/divFactor)*divFactor;

    float rightX = leftX + divFactor;
    float forwardZ = backwardsZ + divFactor;

    float heightTL = perlinFunc(leftX, forwardZ);
    float heightTR = perlinFunc(rightX, forwardZ);
    float heightBL = perlinFunc(leftX, backwardsZ);
    float heightBR = perlinFunc(rightX, backwardsZ);

    //doing lerp
    //lerp left and right for x val for both z vals then lerp between the two z's found height vals

    float xDistL = abs(leftX - i);
    float xDistR = abs(rightX - i);
    float xDistTot = xDistL + xDistR;

    float lerpTopX = heightTL * (1.0 - xDistL/xDistTot) + heightTR * (1.0 - xDistR/xDistTot);
    float lerpBackX = heightBL * (1.0 - xDistL/xDistTot) + heightBR * (1.0 - xDistR/xDistTot);

    //lerp between top and back

    float zDistT = abs(forwardZ - k);
    float zDistB = abs(backwardsZ - k);
    float zDistTot = zDistT + zDistB;

    float lerpHeight = lerpTopX * (1.0 - zDistT/zDistTot) + lerpBackX * (1.0 - zDistB/zDistTot);

    //final height

    return lerpHeight;
}

/*float powerPos(float val, float toTheVal) {
	if (toTheVal <= 0.0) {
		return 1.0;
	}
	return val * powerPos(val, toTheVal - 1.0);
}*/

float perlinFunc(float xLoc, float zLoc) {
    float noise = noiseFunc(xLoc, zLoc);

    float height = 0.0;
    float persistance = 0.25;

    for (float i = 0.0; i < 6.0; i+= 1.0) {
        float freq  = pow(2.0, i);
        float ampl = pow(persistance, i);

        float sampleNoise = noise * freq;
        height += sampleNoise * ampl;
    }

    return height;
}

float F(float t){
	return t*(t*(t-15.0)+10.0) / 100.0;
}

float noiseFunc(float f1, float f2) {
	float p = f1 + f2;
	float p0 = floor(f1);
	float p1 = p0 + 1.0;
	float f = 1.0 - F(p-p0) + F(p-p1);

	return f;

	//float x = f1 * 3.0; /// 3.0;
	//float y = f2 * 3.0;
   //return ((x * x - y * 3.0))/500.0;
}

/*********************************************************/
/********************** MAIN METHOD **********************/
/*********************************************************/

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    //gl_Position[1] += findPerlinHeight(gl_Position[0], gl_Position[1]) / 10.0;
}

