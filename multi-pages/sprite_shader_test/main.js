import * as THREE from 'three';
import { OrbitControls } from 'three_addons/controls/OrbitControls.js';

const width = window.innerWidth;
const height = window.innerHeight;
const pixelRatio = window.pixelRatio;
const el = document.getElementById('viewport');

const scene = new THREE.Scene();
const clock = new THREE.Clock();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000.);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(width, height);
renderer.setPixelRatio(pixelRatio);

const orbitcontrols = new OrbitControls(camera, renderer.domElement);

////////////////////////////////
const textureLoader = new THREE.TextureLoader();

// Threejs Sprite
const spriteT = textureLoader.load('/fortest/sprite.png');
spriteT.colorSpace = THREE.SRGBColorSpace;
const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: spriteT, blending: THREE.NormalBlending })
);
sprite.position.set(-3, 0, 0);
scene.add(sprite);

// MyShader Sprite
import mySpriteVert from './mySpriteVert.glsl?raw';
import mySpriteFrag from './mySpriteFrag.glsl?raw';
const spriteT1 = textureLoader.load('/fortest/sprite.png');
const planeGeom = new THREE.PlaneGeometry(1., 1.);
const mySpriteMaterial = new THREE.ShaderMaterial({
    uniforms: {
        map: { value: spriteT1 },
        uScale: { value: 1. },
        uRotation: { value: THREE.MathUtils.degToRad(90.) },
        uOffset: { value: new THREE.Vector2(0.) },
    },
    vertexShader: mySpriteVert,
    fragmentShader: mySpriteFrag,
    side: THREE.FrontSide,
    transparent: true
});
const sprite1 = new THREE.Mesh(planeGeom, mySpriteMaterial);
sprite1.position.set(3, 0, 0);
scene.add(sprite1);

// 如果指定加载的贴图为 SRGBColorSpace 并且使用了MeshBasicMaterial 
// 则不能在同一帧数里使用这个贴图两次

///////////////////////////////


const animate = () => {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    renderer.render(scene, camera);

    mySpriteMaterial.uniforms.uRotation.value = THREE.MathUtils.degToRad(Math.sin(elapsedTime) * 90.)

    orbitcontrols.update();
}

animate();