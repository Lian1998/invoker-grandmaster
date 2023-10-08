// 将某个范围内的值通过插值算法映射到另一个范围内
float rangeMap(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    float oldRange = oldMax - oldMin;
    float newRange = newMax - newMin;
    float calRange = (((oldValue - oldMin) * newRange) / oldRange) + newMin;
    return calRange;
}