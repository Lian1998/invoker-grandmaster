import * as THREE from 'three';

import { textureLoader, gltfLoader } from './invokerLoadingManager.js';
import { orbQuasShaderMaterial, orbWexShaderMaterial, orbExortShaderMaterial } from './orbs/invokerOrbShaderMaterials.js'

import { OrbitControls } from 'three_addons/controls/OrbitControls.js';

export const INFO = 'dota2 hero invoker - render use threejs(https://threejs.org/) By Lian1998(https://gitee.com/lian_1998)';

// FRAME LOOP
let frameLoopLongID = undefined; // 这一次开启循环的id
let startStamp = undefined; // 这一次开启帧循环时的时间戳
let previousStamp = 0; // 上一帧的时间戳

// CONTEXT
let renderer, camera, orbitcontrols;

// SCENE
let scene, ambient_light, hemisphere_light, directional_light, spot_light;

// HERO
let rockModel, heroModel, animationClips, animationMixer, animationMixer1;
let orbsSpawnActionL, orbsSpawnActionR;
let orbAttach1, orbAttach2, orbAttach3, orb1, orb2, orb3;

// HELPERS
let grid_helper, axes_helper, directional_light_helper, directional_light_helper1, spot_light_helper, spot_light_helper1, skeleton_helper;

const initContext = (domElement) => {

    // render
    renderer = new THREE.WebGLRenderer({ canvas: domElement, antialias: true });
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const v = new THREE.Vector3(-2, 2, 3);
    v.normalize().multiplyScalar(4.5);
    camera.position.copy(v);

    // controls
    orbitcontrols = new OrbitControls(camera, renderer.domElement);
    orbitcontrols.minDistance = 2;
    orbitcontrols.maxDistance = 7;
    orbitcontrols.maxPolarAngle = Math.PI / 2;
    orbitcontrols.enablePan = false; // 禁止平移
    orbitcontrols.enableDamping = true;
    orbitcontrols.dampingFactor = 0.05;

}

const initScene = () => {

    // scene
    scene = new THREE.Scene();

    // lights
    ambient_light = new THREE.AmbientLight(0xFFFFFF, 3); // soft white light
    scene.add(ambient_light);

    hemisphere_light = new THREE.HemisphereLight(0xF99221, 0x79440A, 1);
    scene.add(hemisphere_light);

    directional_light = new THREE.DirectionalLight(0xFFDEDE, 3);
    directional_light.position.set(2, 8, 8);
    directional_light.shadow.camera.position.copy(directional_light.position);
    scene.add(directional_light);
    directional_light.castShadow = true;
    directional_light.shadow.mapSize.width = 1024;
    directional_light.shadow.mapSize.height = 1024;
    directional_light.shadow.focus = 10;
    directional_light.shadow.camera.near = 0.5;
    directional_light.shadow.camera.far = 30;
    directional_light.shadow.camera.fov = 50;

    spot_light = new THREE.SpotLight(0xffffff, 100, 15, Math.PI / 6);
    spot_light.position.set(0, 6, -4);
    spot_light.shadow.camera.position.copy(spot_light.position);
    spot_light.castShadow = true;
    spot_light.shadow.mapSize.width = 1024;
    spot_light.shadow.mapSize.height = 1024;
    spot_light.shadow.focus = 10;
    spot_light.shadow.camera.near = 0.5;
    spot_light.shadow.camera.far = 30;
    spot_light.shadow.camera.fov = 50;
    scene.add(spot_light);
}

const dealwithResources = () => {

    gltfLoader.load('/rock/rock.gltf', (gltf) => {
        rockModel = gltf.scene;
        rockModel.traverse(child => {
            if (child.isMesh) {
                child.receiveShadow = true;
                if (child.material) {
                    // 替换一下材质
                    const oldMat = child.material;
                    const newMat = new THREE.MeshPhysicalMaterial({
                        map: oldMat.map,
                        specularIntensityMap: textureLoader.load('/rock/badside_rocks001_spec.png'),
                        normalScale: oldMat.normalScale,
                        roughness: oldMat.roughness,
                        metalness: .6,
                        reflectivity: .7,
                    });
                    newMat.generateMipmaps = true;
                    newMat.needsUpdate = true;
                    child.material = newMat;
                }
            }
        });
        rockModel.scale.set(.5, .5, .5);
        scene.add(rockModel);
    });

    gltfLoader.load('/vrfcracked/invoker/invoker.gltf', (gltf) => {
        animationClips = gltf.animations; // 动画资源
        heroModel = gltf.scene;
        heroModel.traverse(child => {
            // 绑定orbAttacher指针
            if (child.name === 'orb1') { orbAttach1 = child; }
            else if (child.name === 'orb2') { orbAttach2 = child; }
            else if (child.name === 'orb3') { orbAttach3 = child; }

            if (child.isSkinnedMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        heroModel.scale.set(.4, .4, .4);
        scene.add(heroModel);

        // 处理动画
        dealwithAnimations();

        // 添加卡尔的球

        // 白模
        // const sphere_geometry = new THREE.SphereGeometry(.1, 20, 20);
        // const sphere_material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        // const orb1 = new THREE.Mesh(sphere_geometry, sphere_material);
        // const orb2 = new THREE.Mesh(sphere_geometry, sphere_material);
        // const orb3 = new THREE.Mesh(sphere_geometry, sphere_material);

        // 使用自制的ShaderMaterial
        const planeGeom = new THREE.PlaneGeometry(1., 1.);
        orb1 = new THREE.Mesh(planeGeom, orbQuasShaderMaterial());
        orb2 = new THREE.Mesh(planeGeom, orbWexShaderMaterial());
        orb3 = new THREE.Mesh(planeGeom, orbExortShaderMaterial());

        // attach模型
        orbAttach1.attach(orb1);
        orbAttach2.attach(orb2);
        orbAttach3.attach(orb3);

        toggleHelpers(false); // 处理附加帮助图元

    });
}

/** 处理动画 */
const dealwithAnimations = () => {

    animationMixer = new THREE.AnimationMixer(heroModel);

    animationMixer1 = new THREE.AnimationMixer(heroModel);
    animationMixer1 = animationMixer1;

    // 去除idle切片中的球运动
    const idleClip = animationClips.find(item => item.name === 'idle');
    const idleClip1Tracks = [];
    idleClip.tracks.forEach(item => { if (item.name.indexOf('orb') === -1) { idleClip1Tracks.push(item); } });
    const idleClip1 = new THREE.AnimationClip('idle', -1, idleClip1Tracks);
    const idleAction = animationMixer.clipAction(idleClip1, heroModel);
    idleAction.play();

    // 添加球运动动画
    const orbsClip = animationClips.find(item => item.name === '@orbs');
    const orbsClip1Tracks = [];
    orbsClip.tracks.forEach(item => { if (item.name.indexOf('orb') !== -1) { orbsClip1Tracks.push(item); } });
    const orbsClip1 = new THREE.AnimationClip('orbs', -1, orbsClip1Tracks);
    const orbsAction = animationMixer.clipAction(orbsClip1, heroModel);
    orbsAction.blendMode = THREE.NormalAnimationBlendMode;
    orbsAction.play();

    // 左/右手切球动画
    const orbsSpawnClip = animationClips.find(item => item.name === '@orb_spawn_rt');
    const orbsSpawnClipL_Tracks = [];
    const orbsSpawnClipR_Tracks = [];
    orbsSpawnClip.tracks.forEach(item => {
        const trackName = item.name;

        if (trackName.toLowerCase().indexOf('orb') !== -1) { return; }

        else if (trackName.toLowerCase().indexOf('root') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('spine') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('head') !== -1) { return; }

        else if (trackName.toLowerCase().indexOf('shoulder') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('clavicle') !== -1) { return; }

        else if (trackName.toLowerCase().indexOf('thigh') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('knee') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('ankle') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('toe') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('tobase') !== -1) { return; }

        else if (trackName.toLowerCase().indexOf('cape') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('belt') !== -1) { return; }
        else if (trackName.toLowerCase().indexOf('manskirt') !== -1) { return; }

        else {
            if (trackName.indexOf('_L.') !== -1) { orbsSpawnClipL_Tracks.push(item); }
            if (trackName.indexOf('_R.') !== -1) { orbsSpawnClipR_Tracks.push(item); }
        }
    });
    const orbsSpawnClipL = new THREE.AnimationClip('orbsSpawnL', -1, orbsSpawnClipL_Tracks);
    const orbsSpawnClipR = new THREE.AnimationClip('orbsSpawnR', -1, orbsSpawnClipR_Tracks);
    orbsSpawnActionL = animationMixer1.clipAction(orbsSpawnClipL, heroModel);
    orbsSpawnActionR = animationMixer1.clipAction(orbsSpawnClipR, heroModel);
    orbsSpawnActionL.blendMode = THREE.NormalAnimationBlendMode;
    orbsSpawnActionL.loop = THREE.LoopOnce;
    orbsSpawnActionR.blendMode = THREE.NormalAnimationBlendMode;
    orbsSpawnActionR.loop = THREE.LoopOnce;

    // 动画测试
    let lastAction = null;
    window.addEventListener('keydown', (e) => {
        if (e.code !== 'KeyQ' && e.code !== 'KeyW' && e.code !== 'KeyE') { return; }

        if (orbsSpawnActionL.time === 0) {
            orbsSpawnActionL.reset();
            orbsSpawnActionL.play();
            lastAction = orbsSpawnActionL;
            return;
        }

        else if (orbsSpawnActionR.time === 0) {
            orbsSpawnActionR.reset();
            orbsSpawnActionR.play();
            lastAction = orbsSpawnActionR;
            return;
        }

        else {
            if (lastAction === orbsSpawnActionL) {
                orbsSpawnActionR.reset();
                orbsSpawnActionR.play();
                lastAction = orbsSpawnActionR;
                return;
            } else {
                orbsSpawnActionL.reset();
                orbsSpawnActionL.play();
                lastAction = orbsSpawnActionL;
                return;
            }
        }

    })
}

/** 帧循环 */
const frameLoop = (timeStamp) => {

    frameLoopLongID = requestAnimationFrame(frameLoop);

    if (timeStamp === undefined) { startStamp = timeStamp = 0; }
    const elapsedTime = (timeStamp - startStamp) / 1000.;
    const deltaTime = (timeStamp - previousStamp) / 1000.;
    const deltaTimeRatioed60 = deltaTime / 0.0166666666666667; // (1. / 60.)
    previousStamp = timeStamp;

    // oribitControl需要对damp进行插值
    if (orbitcontrols && orbitcontrols.enabled) { orbitcontrols.update(); }

    // 更新场景
    renderer.render(scene, camera);

    // 动画Layer1
    if (animationMixer) { animationMixer.update(deltaTime); }

    // 动画Layer2 手部动画覆盖
    if (animationMixer1) { animationMixer1.update(deltaTime); }

    // 卡尔的球
    if (orb1 && orb2 && orb3) {

        orb1.material.uniforms.uTime.value = elapsedTime;
        orb2.material.uniforms.uTime.value = elapsedTime;
        orb3.material.uniforms.uTime.value = elapsedTime;

        orb1.material.uniforms.uRandDinamic.value = Math.random();
        orb2.material.uniforms.uRandDinamic.value = Math.random();
        orb3.material.uniforms.uRandDinamic.value = Math.random();

        orb1.material.uniforms.uLifeTime.value += deltaTime;
        orb2.material.uniforms.uLifeTime.value += deltaTime;
        orb3.material.uniforms.uLifeTime.value += deltaTime;
    }

}

export const initialize3D = (domElement) => {
    initContext(domElement); // 初始化上下文, 绑定dom信息
    initScene(); // 初始化场景资源

    dealwithResources();

    frameLoop();

    // F9 暂停/启动
    window.addEventListener('keydown', (e) => {
        if (e.code === 'F9') {
            if (frameLoopLongID) {
                window.cancelAnimationFrame(frameLoopLongID);
                frameLoopLongID = undefined;
                if (orbitcontrols) { orbitcontrols.enabled = false; }
            } else {
                frameLoop();
                if (orbitcontrols) { orbitcontrols.enabled = true; }
            }
        }

        if (e.code === 'KeyH') {
            toggleHelpers()
        }
    });
}


/** 切换显示此场景所需的所有threejs图元helper */
const toggleHelpers = (active) => {
    let paramActive = active;

    // 网格
    if (!grid_helper) {
        grid_helper = new THREE.GridHelper(100, 100, 0xffffff, 0xffffff);
        grid_helper.material.opacity = 0.2;
        grid_helper.material.transparent = true;
        grid_helper.name = 'GridHelper';
        scene.add(grid_helper);
    }
    if (paramActive === undefined) { paramActive = !grid_helper.visible; }
    grid_helper.visible = paramActive;

    // 轴向
    if (!axes_helper) {
        axes_helper = new THREE.AxesHelper(500);
        axes_helper.name = 'AxesHelper';
        scene.add(axes_helper);
    }
    axes_helper.visible = paramActive;

    // 直射光
    if (directional_light) {
        if (!directional_light_helper) {
            directional_light_helper = new THREE.DirectionalLightHelper(directional_light, 5);
            scene.add(directional_light_helper);
            directional_light_helper1 = new THREE.CameraHelper(directional_light.shadow.camera);
            scene.add(directional_light_helper1);
        }
        directional_light_helper.visible = paramActive;
        directional_light_helper1.visible = paramActive;
    }

    // 点光
    if (spot_light) {
        if (!spot_light_helper) {
            spot_light_helper = new THREE.SpotLightHelper(spot_light);
            scene.add(spot_light_helper);
            spot_light_helper1 = new THREE.CameraHelper(directional_light.shadow.camera);
            scene.add(spot_light_helper1);
        }
        spot_light_helper.visible = paramActive;
        spot_light_helper1.visible = paramActive;
    }

    // 骨骼
    if (heroModel) {
        if (!skeleton_helper) {
            skeleton_helper = new THREE.SkeletonHelper(heroModel);
            scene.add(skeleton_helper);
        }
        skeleton_helper.visible = paramActive;
    }
}






