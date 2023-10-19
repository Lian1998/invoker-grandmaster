
// https://segmentfault.com/a/1190000020254076

// Matrix4 multiply
// a b c d   x   ax + by + cz + dw
// e f g h   y   ex + fy + gz + hw
// i j k l   z   ix + jy + kz + lw
// m n o p   w   mx + ny + oz + pw

// Trainsform
// a 0 0 1   x   x' = x + ax
// 0 b 0 1   y   y' = y + by
// 0 0 c 1   z   z' = z + cz
// 0 0 0 1   w   w' = 1

// Rotation X/Y/Z 
// 1  0  0  0    c  0  s  0    c -s  0  0
// 0  c -s  0    0  1  0  0    s  c  0  0
// 0  s  c  0   -s  0  c  0    0  0  1  0
// 0  0  0  1    0  0  0  1    0  0  0  1

// Scale
// a 0 0 0  x  x' = ax
// 0 b 0 0  y  y' = by
// 0 0 c 0  z  z' = cz
// 0 0 0 1  w  w' = 1