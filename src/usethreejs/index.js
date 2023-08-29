import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SMDLoader } from './SMDLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// jsons & strings
import vertexShader from '../shaders/hero_three_shadermat_vert.glsl?raw'
import fragmentShader from '../shaders/hero_three_shadermat_frag.glsl?raw'
const matJson = await fetch('/heroes/invoker/materials.json').then(response => response.json());
const animJson = await fetch('/heroes/invoker/animations.json').then(response => response.json());

// scene
const scene = new THREE.Scene();

// lights
const amb_light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(amb_light);
const dir_light = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(dir_light);
const hemi_light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(hemi_light);

// camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// render
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#viewport1'), antialias: true });
renderer.setClearColor(0xffffff);
renderer.setSize(window.innerWidth, window.innerHeight);

// controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 5;
controls.maxDistance = 30;
controls.maxPolarAngle = Math.PI / 2;

// references
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.name = 'Cube1.0';
scene.add(cube);
const axes = new THREE.AxesHelper(500);
axes.name = 'AxesHelper';
scene.add(axes);

// animations
let animationMixer = null;
let model = null;

// Loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();


    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
    controls.update();

    if (animationMixer) {
        animationMixer.update(deltaTime);
    }
}

animate();


const dealwithModel = async () => {

    const texture_loader = new THREE.TextureLoader();
    const gltf_loader = new GLTFLoader();
    gltf_loader.load('/heroes/invoker/invoker.gltf', (gltf) => {

        console.log('gltf', gltf);

        model = gltf.scene;
        model.traverse((child) => {
            if (child.isSkinnedMesh) {
                if (!(child.material && child.material.name)) return;

                const gltfMatName = child.material.name;


                const source2HeroMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        map: { value: null },
                        normalMap: { value: null },
                    },

                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader
                });

                // console.log(source2HeroMaterial);

                if (matJson[gltfMatName]) {
                    if (matJson[gltfMatName]['diffuseMap']) {
                        const t = texture_loader.load(matJson[gltfMatName]['diffuseMap']);
                        t.flipY = false;
                        t.wrapS = THREE.RepeatWrapping;
                        t.wrapT = THREE.RepeatWrapping;
                        source2HeroMaterial.uniforms.map.value = t;
                    }
                    if (matJson[gltfMatName]['normalMap']) {
                        const t = texture_loader.load(matJson[gltfMatName]['normalMap']);
                        t.flipY = false;
                        t.wrapS = THREE.RepeatWrapping;
                        t.wrapT = THREE.RepeatWrapping;
                        source2HeroMaterial.uniforms.normalMap.value = t;
                    }
                }

                source2HeroMaterial.needsUpdate = true;
                child.material = source2HeroMaterial;
            }
        })
        model.scale.set(1 / 100.0, 1 / 100.0, 1 / 100.0);

        dealwithAnimations();

        scene.add(model);

        const skeletonHelper = new THREE.SkeletonHelper(model);
        // skeletonHelper.visible = true;
        console.log('skeletonHelper.bones', skeletonHelper.bones)
        scene.add(skeletonHelper);
    })
}

const dealwithAnimations = () => {
    animationMixer = new THREE.AnimationMixer(model);

    const anim_loader = new SMDLoader();
    anim_loader.load('/heroes/invoker/smd/idle.smd', (clip) => {
        model.animations.push(clip);


        const idleAction = animationMixer.clipAction(clip, model);
        model.needsUpdate = true;
        idleAction.loop = THREE.LoopRepeat;
        idleAction.weight = 1;
        idleAction.play();
    });
}

dealwithModel();

export const app = 1;