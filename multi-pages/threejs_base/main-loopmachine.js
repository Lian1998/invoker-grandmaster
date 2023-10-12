import * as THREE from 'three';
import { OrbitControls } from 'three_addons/controls/OrbitControls.js';
import { FrameLoopMachine } from '@src/invoker-webglpart/FrameLoopMachine.js';

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

const geometry = new THREE.BoxGeometry(1.);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

///////////////////////////////


const animate = (elapsedTime, deltaTime, deltaTimeRatio60) => {

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;

    renderer.render(scene, camera);

    orbitcontrols.update();
}

const frameloopMachine = FrameLoopMachine(animate);

frameloopMachine.startLoop();

window.addEventListener('keydown', (e) => {

    if (e.code === 'F9') {

        let stopped = frameloopMachine.stopLoop();
        orbitcontrols.enabled = stopped;

    }

});