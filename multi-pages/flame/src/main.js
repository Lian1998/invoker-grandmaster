import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const clock = new THREE.Clock();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 15);

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#viewport'), antialias: true });
renderer.setClearColor(0x000000);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const orbitcontrols = new OrbitControls(camera, renderer.domElement);
orbitcontrols.maxPolarAngle = Math.PI / 2;

const textureLoader = new THREE.TextureLoader();

// 背景
const bgMesh = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 4),
    new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: textureLoader.load('/flame/rock.jpg') })
);
scene.add(bgMesh);

// 精灵
const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: textureLoader.load('/flame/sprite.jpg') })
);
sprite.position.set(0, 5, 0);
scene.add(sprite);

// 精灵(shaderMaterial)
import mySpriteVert from './mySpriteVert.glsl?raw';
import mySpriteFrag from './mySpriteFrag.glsl?raw';
const planeGeom = new THREE.PlaneGeometry(1., 1.);
console.log(planeGeom);
const mySpriteMaterial = new THREE.ShaderMaterial({
    uniforms: {
        map: { value: textureLoader.load('/flame/sprite.jpg') },
        scale: { value: new THREE.Vector2(1, 1) },
    },
    vertexShader: mySpriteVert,
    fragmentShader: mySpriteFrag,
    side: THREE.DoubleSide
});
const sprite1 = new THREE.Mesh(planeGeom, mySpriteMaterial);
// const sprite1 = new THREE.Mesh(planeGeom, new THREE.MeshBasicMaterial({ color: 0xffffff }));
sprite1.position.set(0, 10, 0);
scene.add(sprite1);

// 火焰



const animate = () => {

    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    renderer.render(scene, camera);
    orbitcontrols.update();
}

animate();