// mapping value in old range 2 new range by lerp
float ranglerp(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    float oldRange = oldMax - oldMin;
    float newRange = newMax - newMin;
    float calRange = (((oldValue - oldMin) * newRange) / oldRange) + newMin;
    return calRange;
}