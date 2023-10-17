import * as THREE from 'three';
import turbv from '@shaders/turb.vs';
import turbf from '@shaders/turb.fs';
import { viteBaseUrlJoined } from '@src/utils/viteBaseUrlJoined.js';


const textureLoader = new THREE.TextureLoader();
const turbT = textureLoader.load(viteBaseUrlJoined('/invoker-textures/orbs/beam_turb_noise.png'));

export const rtt = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
    colorSpace: THREE.SRGBColorSpace,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    stencilBuffer: false,
    depthBuffer: false,
})

export const TurbShaderMaterial = () => new THREE.ShaderMaterial({
    uniforms: {
        uRand: { value: Math.random() }, // 静态随机值
        uRandDinamic: { value: Math.random() }, // 动态随机值
        uTime: { value: 0.0 }, // 渲染时间
        uLifeTime: { value: 0.0 }, // 切球时间
        uMap: { value: turbT },
        uMask: { value: rtt.texture },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    blending: THREE.NormalBlending,
    vertexShader: turbv,
    fragmentShader: turbf,
    depthWrite: false,
    depthTest: false,
    transparent: false,
})