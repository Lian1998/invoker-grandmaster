import * as THREE from 'three';
import turbv from '@shaders/turb.vs';
import turbf from '@shaders/turb.fs';
import { viteBaseUrlJoined } from '@src/utils/viteBaseUrlJoined.js';
import { rtt } from '../invoker';

const textureLoader = new THREE.TextureLoader();
const turbT = textureLoader.load(viteBaseUrlJoined('/invoker-textures/orbs/orb_spawn.png'));

export const TurbShaderMaterial = () => new THREE.ShaderMaterial({
    uniforms: {
        uRand: { value: Math.random() }, // 静态随机值
        uRandDinamic: { value: Math.random() }, // 动态随机值
        uTime: { value: 0.0 }, // 渲染时间
        uLifeTime: { value: 0.0 }, // 切球时间
        uMap: { value: rtt.texture },
        uMask: { value: turbT },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    blending: THREE.NormalBlending,
    vertexShader: turbv,
    fragmentShader: turbf,
    transparent: true,
})