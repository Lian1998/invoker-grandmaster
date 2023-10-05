import * as THREE from 'three';

const width = 768;
const height = 576;
const pixelRatio = window.pixelRatio;
const el = document.getElementById('viewport');
const el1 = document.getElementById('viewport1');
const el2 = document.getElementById('viewport2');

const scene = new THREE.Scene();
const clock = new THREE.Clock();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000.);
camera.position.set(0., 0., 1.);

const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, stencil: false });
const renderer1 = new THREE.WebGLRenderer({ canvas: el1, antialias: true, stencil: false });
const renderer2 = new THREE.WebGLRenderer({ canvas: el2, antialias: true, stencil: false });

renderer.setSize(width, height);
renderer.setPixelRatio(pixelRatio);
renderer.setClearColor(0x000000);

renderer1.setSize(width, height);
renderer1.setPixelRatio(pixelRatio);
renderer1.setClearColor(0x000000);

renderer2.setSize(width, height);
renderer2.setPixelRatio(pixelRatio);
renderer2.setClearColor(0x000000);

import orb_vs from '@shaders/orb.vs';
import ice_fs from '@shaders/ice.orb.fs';
import eny_fs from '@shaders/eny.orb.fs';
import fre_fs from '@shaders/fre.orb.fs';

// console.log(ice_fs);
// console.log(eny_fs);
// console.log(fre_fs);

const textureLoader = new THREE.TextureLoader();
const orbTintable = textureLoader.load('/invoker-orbs/orb_framemap_scale2.png');
const orbEnergyTintable = textureLoader.load('/invoker-orbs/energyorb_framemap_scale2.png');
const graynoise = textureLoader.load('/invoker-orbs/graynoise_by_shadertoy.png');
graynoise.wrapS = THREE.RepeatWrapping;
graynoise.wrapT = THREE.RepeatWrapping;

const planeGeom = new THREE.PlaneGeometry(1., 1.);
const ice_sm = new THREE.ShaderMaterial({
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
    vertexShader: orb_vs,
    fragmentShader: ice_fs,
    transparent: true,
    blending: THREE.NormalBlending,
    opacity: 1.,
});
const sprite = new THREE.Mesh(planeGeom, ice_sm);
sprite.position.set(0, 0, 0);
scene.add(sprite);

const eny_sm = new THREE.ShaderMaterial({
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
    vertexShader: orb_vs,
    fragmentShader: eny_fs,
    transparent: true,
    blending: THREE.NormalBlending,
    opacity: 1.,
});
const sprite1 = new THREE.Mesh(planeGeom, eny_sm);
sprite1.position.set(0, 0, 0);
scene.add(sprite1);

const fre_sm = new THREE.ShaderMaterial({
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
    vertexShader: orb_vs,
    fragmentShader: fre_fs,
    transparent: true,
    blending: THREE.NormalBlending,
    opacity: 1.,
});
const sprite2 = new THREE.Mesh(planeGeom, fre_sm);
sprite2.position.set(0, 0, 0);
scene.add(sprite2);

const animate = () => {
    window.requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    ice_sm.uniforms.uTime.value = elapsedTime;
    ice_sm.uniforms.uRandDinamic.value = Math.random();
    ice_sm.uniforms.uLifeTime.value += deltaTime;

    eny_sm.uniforms.uTime.value = elapsedTime;
    eny_sm.uniforms.uRandDinamic.value = Math.random();
    eny_sm.uniforms.uLifeTime.value += deltaTime;

    fre_sm.uniforms.uTime.value = elapsedTime;
    fre_sm.uniforms.uRandDinamic.value = Math.random();
    fre_sm.uniforms.uLifeTime.value += deltaTime;

    sprite.visible = true;
    sprite1.visible = false;
    sprite2.visible = false;
    renderer.render(scene, camera);


    sprite.visible = false;
    sprite1.visible = true;
    sprite2.visible = false;
    renderer1.render(scene, camera);


    sprite.visible = false;
    sprite1.visible = false;
    sprite2.visible = true;
    renderer2.render(scene, camera);
}

animate();