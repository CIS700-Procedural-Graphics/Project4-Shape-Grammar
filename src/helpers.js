//helper functions
export function ease_in_quadratic(t)
{
    return t * t;
}

export function ease_out_quadratic(t)
{
    return 1 - ease_in_quadratic(1 - t);
}

export function ease_in_out_quadratic(t)
{
    if (t < 0.5)
    {
        return ease_in_quadratic(t * 2) / 2;
    }
    else
    {
        return 1 - ease_in_quadratic((1 - t) * 2) / 2;
    }
}

export function smoothstep(edge0, edge1, x)
{
    x = Math.ceil((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x * x * (3 - 2 * x);
}

export function smootherstep(edge0, edge1, x)
{
    x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x * x * x * (x * (x * 6 - 15) + 10);
}

export function lerp(a, b, t)
{
    return a * (1 - t) + b * t;
}

export function square_wave(x, fq, amp)
{
    return Math.abs(Math.floor(x * fq) * amp);
}

export function sawtooth_wave(x, fq, amp)
{
    return (x * fq - Math.floor(x * fq)) * amp;
}

export function triangle_wave(x, fq, amp)
{
    return Math.abs((x * fq) % amp - (0.5 * amp));
}

export function bias(time, bias)
{
    return Math.pow(t, Math.log(bias) / Math.log(0.5));
}

export function gain(time, gain)
{
    if (t < 0.5)
    {
        return bias(1 - gain, 2 * t) / 2;
    }
    else
    {
        return 1 - bias(1 - gain, 2 * t) / 2;
    }
}

export function pulse(c, w, x)
{
    x = Math.abs(x - c);
    if (x > w)
    {
        return 0;
    }
    x /= w;
    return 1 - x * x * (2 - 2 * x);
}

export function parabola(x, k)
{
    return Math.pow(4 * x * (1 - x), k);
}

export function impulse(k, x)
{
    var h = k * x;
    return h * Math.exp(1 - h);
}

export function pcurve(a, b, x)
{
    var k = Math.pow(a + b, a + b) / (Math.pow(a, a) * Math.pow(b, b));
    return k * Math.pow(x, a) * Math.pow(1 - x, b);
}