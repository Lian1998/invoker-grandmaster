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
camera.position.set(0., 0., .5);

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

import orbv from '@shaders/orb.vs';
import quasf from '@shaders/orb.quas.fs';
import wexf from '@shaders/orb.wex.fs';
import exortf from '@shaders/orb.exort.fs';

// console.log(quasf);
// console.log(wexf);
// console.log(exortf);

const textureLoader = new THREE.TextureLoader();
const orbTintableT = textureLoader.load('/invoker-textures/orbs/orb_framemap_scale2.png');
const orbEnergyTintableT = textureLoader.load('/invoker-textures/orbs/energyorb_framemap_scale2.png');
const graynoiseT = textureLoader.load('/invoker-textures/orbs/graynoise_by_shadertoy.png');
graynoiseT.wrapS = THREE.RepeatWrapping;
graynoiseT.wrapT = THREE.RepeatWrapping;

const planeGeom = new THREE.PlaneGeometry(1., 1.);
const orbQuasShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uType: { value: .1 },
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
    transparent: true,
    blending: THREE.NormalBlending,
    opacity: 1.,
});
const sprite = new THREE.Mesh(planeGeom, orbQuasShaderMaterial);
sprite.position.set(0, 0, 0);
scene.add(sprite);

const orbWexShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uType: { value: 1.1 },
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
    transparent: true,
    blending: THREE.NormalBlending,
    opacity: 1.,
});
const sprite1 = new THREE.Mesh(planeGeom, orbWexShaderMaterial);
sprite1.position.set(0, 0, 0);
scene.add(sprite1);

const orbExortShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uType: { value: 2.1 },
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
    vertexShader: orbv,
    fragmentShader: exortf,
    transparent: true,
    blending: THREE.NormalBlending,
    opacity: 1.,
});
const sprite2 = new THREE.Mesh(planeGeom, orbExortShaderMaterial);
sprite2.position.set(0, 0, 0);
scene.add(sprite2);

const animate = () => {
    window.requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    orbQuasShaderMaterial.uniforms.uTime.value = elapsedTime;
    orbQuasShaderMaterial.uniforms.uRandDinamic.value = Math.random();
    orbQuasShaderMaterial.uniforms.uLifeTime.value += deltaTime;

    orbWexShaderMaterial.uniforms.uTime.value = elapsedTime;
    orbWexShaderMaterial.uniforms.uRandDinamic.value = Math.random();
    orbWexShaderMaterial.uniforms.uLifeTime.value += deltaTime;

    orbExortShaderMaterial.uniforms.uTime.value = elapsedTime;
    orbExortShaderMaterial.uniforms.uRandDinamic.value = Math.random();
    orbExortShaderMaterial.uniforms.uLifeTime.value += deltaTime;

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