import * as THREE from 'three'
import orb_vert from '@shaders/orb.vs';
import ice_orb_frag from '@shaders/ice.orb.fs';
import energy_orb_frag from '@shaders/eny.orb.fs';
import fire_orb_vert from '@shaders/fre.orb.fs';

const textureLoader = new THREE.TextureLoader();
const orbTintable = textureLoader.load('/invoker-orbs/orb_framemap_scale2.png');
const orbEnergyTintable = textureLoader.load('/invoker-orbs/energyorb_framemap_scale2.png');
const graynoise = textureLoader.load('/invoker-orbs/graynoise_by_shadertoy.png');
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
        uColor1: { value: new THREE.Color(0x83D5FE) },
        uColor2: { value: new THREE.Color(0x64AEFF) },
        uColor3: { value: new THREE.Color(0x4A76D3) },
    },
    vertexShader: orb_vert,
    fragmentShader: ice_orb_frag,
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
        uColor1: { value: new THREE.Color(0xFDF5FB) },
        uColor2: { value: new THREE.Color(0x916594) },
    },
    vertexShader: orb_vert,
    fragmentShader: energy_orb_frag,
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
        // 火圈色
        uColor3: { value: new THREE.Color(0xFFFFFF) },
        uColor4: { value: new THREE.Color(0xFFFF89) },
        uColor5: { value: new THREE.Color(0x7B431B) },
    },
    vertexShader: orb_vert,
    fragmentShader: fire_orb_vert,
    transparent: true,
    blending: THREE.NormalBlending,
    opacity: 1.,
});



export { iceOrbShaderMaterial, energyOrbShaderMaterial, fireOrbShaderMaterial };