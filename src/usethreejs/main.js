import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const matJson = await fetch('/heroes/invoker/materials.json').then(response => response.json());

const scene = new THREE.Scene();

const amb_light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(amb_light);
const dir_light = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(dir_light);
const hemi_light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(hemi_light);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#viewport1'), antialias: true });
renderer.setClearColor(0xffffff);
renderer.setSize(window.innerWidth, window.innerHeight);
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 5;
controls.maxDistance = 30;
controls.maxPolarAngle = Math.PI / 2;

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
    controls.update();
}
animate();

const texture_loader = new THREE.TextureLoader();
const gltf_loader = new GLTFLoader();
gltf_loader.load('/heroes/invoker/invoker.gltf', (gltf) => {
    gltf.scene.traverse(child => {
        if (child.isSkinnedMesh) {
            if (!(child.material && child.material.name)) return;

            // console.log(child);
            // console.log(child.material)
            // console.log(matJson)

            const matMeshStandardMaterial = child.material;

            if (matJson[matMeshStandardMaterial.name]) {
                if (matJson[matMeshStandardMaterial.name]['diffuseMap']) {
                    matMeshStandardMaterial.map = texture_loader.load(matJson[matMeshStandardMaterial.name]['diffuseMap']);
                    matMeshStandardMaterial.map.flipY = false;
                    matMeshStandardMaterial.map.wrapS = THREE.RepeatWrapping;
                    matMeshStandardMaterial.map.wrapT = THREE.RepeatWrapping;
                }
                if (matJson[matMeshStandardMaterial.name]['normalMap']) {
                    matMeshStandardMaterial.normalMap = texture_loader.load(matJson[matMeshStandardMaterial.name]['normalMap']);
                    matMeshStandardMaterial.normalMap.flipY = false;
                    matMeshStandardMaterial.normalMap.wrapS = THREE.RepeatWrapping;
                    matMeshStandardMaterial.normalMap.wrapT = THREE.RepeatWrapping;
                }
            }
        }
    })

    gltf.scene.scale.set(1 / 40.0, 1 / 40.0, 1 / 40.0);
    scene.add(gltf.scene);
})

export const app = 1;