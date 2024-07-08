import * as THREE from 'three';
import invokeTurbV from './turb.vs';
import invokeTurbF from './turb.fs';
import { baseUrlT } from '@src/utils/baseUrlT.js';
import { rtt } from '@src/invoker-webglpart/index.js';

const textureLoader = new THREE.TextureLoader();
const turbT = textureLoader.load(baseUrlT('/invoker-textures/invoke/spark_cone.png'));
const turbT1 = textureLoader.load(baseUrlT('/invoker-textures/invoke/spark_cone_inverse.png'));


export const Ability4TurbShaderMaterial = () => new THREE.ShaderMaterial({
    uniforms: {
        uLifeTime: { value: 0.0 }, // 切球时间
        uMap: { value: rtt.texture },
        uMask: { value: turbT },
        uMask1: { value: turbT1 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    blending: THREE.NormalBlending,
    vertexShader: invokeTurbV,
    fragmentShader: invokeTurbF,
    depthWrite: false,
    depthTest: false,
    transparent: true,
    opacity: 1.0,

    // 模板测试时: 使用stencilFunc比较函数
    stencilWrite: true,
    stencilRef: 2,
    stencilFunc: THREE.NotEqualStencilFunc, // 设置该片元的模板!=1才可以通过测试
});