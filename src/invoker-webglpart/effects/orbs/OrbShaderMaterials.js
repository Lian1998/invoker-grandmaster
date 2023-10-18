import * as THREE from 'three'
import orbv from '@shaders/orb.vs';
import quasf from '@shaders/orb.quas.fs';
import wexf from '@shaders/orb.wex.fs';
import exortf from '@shaders/orb.exort.fs';
import { viteBaseUrlJoined } from '@src/utils/viteBaseUrlJoined.js';

const textureLoader = new THREE.TextureLoader();
const orbTintableT = textureLoader.load(viteBaseUrlJoined('/invoker-textures/orbs/orb_framemap_scale2.png'));
const orbEnergyTintableT = textureLoader.load(viteBaseUrlJoined('/invoker-textures/orbs/energyorb_framemap_scale2.png'));
const graynoiseT = textureLoader.load(viteBaseUrlJoined('/invoker-textures/orbs/graynoise_by_shadertoy.png'));
graynoiseT.wrapS = THREE.RepeatWrapping;
graynoiseT.wrapT = THREE.RepeatWrapping;

const OrbQuasShaderMaterial = () => new THREE.ShaderMaterial({
    uniforms: {
        uRand: { value: Math.random() }, // 静态随机值
        uRandDinamic: { value: Math.random() }, // 动态随机值
        uTime: { value: 0.0 }, // 渲染时间
        uLifeTime: { value: 0.0 }, // 切球时间
        uMap1: { value: orbTintableT }, // 球状着色图
        uMap2: { value: orbEnergyTintableT }, // 能量球着色图
        // 冰球色
        uColor1: { value: new THREE.Color(0x9ADDFF) },
        uColor2: { value: new THREE.Color(0x3688E3) },
        uColor3: { value: new THREE.Color(0x4A76D3) },
    },
    vertexShader: orbv,
    fragmentShader: quasf,
    blending: THREE.NormalBlending,
    depthWrite: false,
    depthTest: true,
    transparent: true,
    opacity: 1.0,
});

const OrbWexShaderMaterial = () => new THREE.ShaderMaterial({
    uniforms: {
        uRand: { value: Math.random() }, // 静态随机值
        uRandDinamic: { value: Math.random() }, // 动态随机值
        uTime: { value: 0.0 }, // 渲染时间
        uLifeTime: { value: 0.0 }, // 切球时间
        uMap1: { value: orbTintableT }, // 球状着色图
        uMap2: { value: orbEnergyTintableT }, // 电球着色图
        // 电球色
        uColor1: { value: new THREE.Color(0x563659) },
        uColor2: { value: new THREE.Color(0xDCC8E1) },
        uColor3: { value: new THREE.Color(0xAA63AF) },
    },
    vertexShader: orbv,
    fragmentShader: wexf,
    blending: THREE.NormalBlending,
    depthWrite: false,
    depthTest: true,
    transparent: true,
    opacity: 1.0,
});

const OrbExortShaderMaterial = () => new THREE.ShaderMaterial({
    uniforms: {
        uRand: { value: Math.random() }, // 静态随机值
        uRandDinamic: { value: Math.random() }, // 动态随机值
        uTime: { value: 0.0 }, // 渲染时间
        uLifeTime: { value: 0.0 }, // 切球时间
        uMap1: { value: orbTintableT }, // 球状着色图
        uMap2: { value: orbEnergyTintableT }, // 能量球着色图
        uMap3: { value: graynoiseT }, // 火焰纹理
        // 火球色
        uColor1: { value: new THREE.Color(0xFBD4A0) },
        uColor2: { value: new THREE.Color(0xEA8B44) },
    },
    blending: THREE.NormalBlending,
    vertexShader: orbv,
    fragmentShader: exortf,
    depthWrite: false,
    depthTest: true,
    transparent: true,
    opacity: 1.0,
});

export { OrbQuasShaderMaterial, OrbWexShaderMaterial, OrbExortShaderMaterial };