import * as THREE from 'three'
import orbv from '@shaders/orb.vs';
import quasf from '@shaders/orb.quas.fs';
import wexf from '@shaders/orb.wex.fs';
import exortf from '@shaders/orb.exort.fs';

const textureLoader = new THREE.TextureLoader();
const orbTintable = textureLoader.load('/invoker-textures/orbs/orb_framemap_scale2.png');
const orbEnergyTintable = textureLoader.load('/invoker-textures/orbs/energyorb_framemap_scale2.png');
const graynoise = textureLoader.load('/invoker-textures/orbs/graynoise_by_shadertoy.png');
graynoise.wrapS = THREE.RepeatWrapping;
graynoise.wrapT = THREE.RepeatWrapping;

const iceOrbShaderMaterial = () => new THREE.ShaderMaterial({
    uniforms: {
        uType: { value: .1 },
        uRand: { value: Math.random() }, // 静态随机值
        uRandDinamic: { value: Math.random() }, // 动态随机值
        uTime: { value: 0.0 }, // 渲染时间
        uLifeTime: { value: 0.0 }, // 切球时间
        uMap1: { value: orbTintable }, // 球状着色图
        uMap2: { value: orbEnergyTintable }, // 能量球着色图
        // 冰球色
        uColor1: { value: new THREE.Color(0x9ADDFF) },
        uColor2: { value: new THREE.Color(0x3688E3) },
        uColor3: { value: new THREE.Color(0x4A76D3) },
    },
    vertexShader: orbv,
    fragmentShader: quasf,
    transparent: true,
    blending: THREE.NormalBlending,
    opacity: 1.,
});

const energyOrbShaderMaterial = () => new THREE.ShaderMaterial({
    uniforms: {
        uType: { value: 1.1 },
        uRand: { value: Math.random() }, // 静态随机值
        uRandDinamic: { value: Math.random() }, // 动态随机值
        uTime: { value: 0.0 }, // 渲染时间
        uLifeTime: { value: 0.0 }, // 切球时间
        uMap1: { value: orbTintable }, // 球状着色图
        uMap2: { value: orbEnergyTintable }, // 电球着色图
        // 电球色
        uColor1: { value: new THREE.Color(0x563659) },
        uColor2: { value: new THREE.Color(0xDCC8E1) },
        uColor3: { value: new THREE.Color(0xAA63AF) },
    },
    vertexShader: orbv,
    fragmentShader: wexf,
    transparent: true,
    blending: THREE.NormalBlending,
    opacity: 1.,
});

const fireOrbShaderMaterial = () => new THREE.ShaderMaterial({
    uniforms: {
        uType: { value: 2.1 },
        uRand: { value: Math.random() }, // 静态随机值
        uRandDinamic: { value: Math.random() }, // 动态随机值
        uTime: { value: 0.0 }, // 渲染时间
        uLifeTime: { value: 0.0 }, // 切球时间
        uMap1: { value: orbTintable }, // 球状着色图
        uMap2: { value: orbEnergyTintable }, // 能量球着色图
        uMap3: { value: graynoise }, // 能量球着色图
        // 火球色
        uColor1: { value: new THREE.Color(0xFBD4A0) },
        uColor2: { value: new THREE.Color(0xEA8B44) },
    },
    vertexShader: orbv,
    fragmentShader: exortf,
    transparent: true,
    blending: THREE.NormalBlending,
    opacity: 1.,
});



export { iceOrbShaderMaterial, energyOrbShaderMaterial, fireOrbShaderMaterial };