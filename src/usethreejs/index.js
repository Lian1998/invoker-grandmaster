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

// animations
let animationMixer = null;
let model = null;
const model_bones = [];

// Loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    if (animationMixer) {
        animationMixer.update(deltaTime);
    }

    renderer.render(scene, camera);
    controls.update();

}

animate();


const dealwithModel = async () => {

    const texture_loader = new THREE.TextureLoader();
    const gltf_loader = new GLTFLoader();

    gltf_loader.load('/heroes/invoker/invoker.gltf', (gltf) => {

        // 处理模型

        model = gltf.scene;
        model.traverse(child => {
            if (child.isBone) { model_bones.push(child); }
            if (child.isMesh) {
                if (!(child.material && child.material.name)) return;

                const gltfMatName = child.material.name;
                const dota2HeroMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        map: { value: null },
                        normalMap: { value: null },
                    },
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader
                });

                if (matJson[gltfMatName]) {
                    if (matJson[gltfMatName]['diffuseMap']) {
                        const t = texture_loader.load(matJson[gltfMatName]['diffuseMap']);
                        t.flipY = false;
                        t.wrapS = THREE.RepeatWrapping;
                        t.wrapT = THREE.RepeatWrapping;
                        dota2HeroMaterial.uniforms.map.value = t;
                    }
                    if (matJson[gltfMatName]['normalMap']) {
                        const t = texture_loader.load(matJson[gltfMatName]['normalMap']);
                        t.flipY = false;
                        t.wrapS = THREE.RepeatWrapping;
                        t.wrapT = THREE.RepeatWrapping;
                        dota2HeroMaterial.uniforms.normalMap.value = t;
                    }
                }

                dota2HeroMaterial.needsUpdate = true;
                child.material = dota2HeroMaterial;
            }
        });
        const rootBone = model_bones[0];
        const skeleton = new THREE.Skeleton(model_bones);
        model.traverse(child => {
            if (child.isSkinnedMesh) {
                // child.visible = false;
                // if (child.name === 'invoker_bracer_model') {
                //     child.visible = true;
                // }
                console.log(child);
                // child.bind(skeleton);
            }
        })
        model.scale.set(1 / 100.0, 1 / 100.0, 1 / 100.0);
        scene.add(model);

        // 处理动画

        dealwithAnimations();

        // 添加Helpers对象

        const axes = new THREE.AxesHelper(500);
        axes.name = 'AxesHelper';
        scene.add(axes);

        const skeletonHelper = new THREE.SkeletonHelper(model);
        skeletonHelper.visible = true;
        scene.add(skeletonHelper);

    })
}

const dealwithAnimations = () => {
    animationMixer = new THREE.AnimationMixer(model);

    const anim_loader = new SMDLoader();
    anim_loader.load('/heroes/invoker/smd/idle.smd', (clip) => {
        model.animations.push(clip);

        const idleAction = animationMixer.clipAction(clip, model);
        idleAction.timeScale = 30.0;
        idleAction.play();
    });
}

dealwithModel();

export const app = 1;