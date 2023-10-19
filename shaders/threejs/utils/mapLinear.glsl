// linear map value in old range 2 new range
float mapLinear(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    float oldRange = oldMax - oldMin;
    float newRange = newMax - newMin;
    float calRange = (((oldValue - oldMin) * newRange) / oldRange) + newMin;
    return calRange;
}