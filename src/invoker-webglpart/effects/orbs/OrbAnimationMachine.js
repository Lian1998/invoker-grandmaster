
import * as THREE from 'three';

import { OrbQuasShaderMaterial, OrbWexShaderMaterial, OrbExortShaderMaterial } from './OrbShaderMaterials.js';
import { SpritePlaneBufferGeometry } from '../SpritePlaneBufferGeometry.js';
import { invokerEventPipe } from '@src/invoker-webglpart/events/invokerEventPipe.js';
import { invokerAbilityEvents } from '@src/invoker-webglpart/events/invokerAbilityEvents.js';

import { TurbShaderMaterial } from '../TurbShaderMaterial.js';

import {
    orbsSpawnActionL, orbsSpawnActionR, // 动画
    wristL, wristR, // 手腕骨骼
    orbSlot1, orbSlot2, orbSlot3, // 球骨骼
    scene, // 场景
} from '../../invoker.js';

const vec3Util = new THREE.Vector3();

/**
 * 播放召唤法球的动画
 * @returns {boolean} isLeft? 是否左手位置发出
 */
const playOrbSpawnAnimation = () => {
    if (!orbsSpawnActionL || !orbsSpawnActionR) { return; }

    const duration = orbsSpawnActionL._clip.duration; // 通过访问clip获取剪辑片段的时间
    const isLeft = Math.random() < .5 ? true : false; // 计算一个随机值用于确定播放哪只手的动画

    let orbAction = null;
    if (isLeft) { orbAction = orbsSpawnActionL; }
    else { orbAction = orbsSpawnActionR; }

    // 如果这个动画还没有播放过, 无脑播放它
    if (orbAction.time <= 0.) {
        orbAction.play();
        return isLeft;
    }

    // 如果动画已经播放过且播放完毕, 无脑重置并重新播放
    else if (orbAction.time >= duration) {
        orbAction.reset();
        orbAction.play();
        return isLeft;
    }

    // 如果当前动画其实正在进行中, 且动画当前处于手往下运动的阶段, 那么需要映射到同样位置其向上运动的time, 让手重新抬起
    else if (orbAction.time >= duration / 2.) {
        // clamp一下以免出现bug
        orbAction.time = THREE.MathUtils.clamp(duration / 2. - (duration - orbAction.time), 0., 1.);
        return isLeft;
    }
}

/**
 * 单个祈求者球体
 * 一个祈求者的球体包含了三个平面精灵, 分别对应了 冰/雷/火(Quas/Wex/Exort) 球体
 * 
 * @param {THREE.Bone} orbSlot 当前球体所对应的插槽
 * @returns {{ 
 *  meshesMap: { quas: THREE.Mesh, wex: THREE.Mesh, exort: THREE.Mesh, activeP: undefined | THREE.Mesh },
 *  fadeToAnotherMesh: (name: 'Quas'|'Wex'|'Exort') => void,
 *  frameLoop: (elapsedTime: number, deltaTime: number) => void,
 * }} 球体更新机闭包
 */
export const SingleOrbObject = (orbSlot, scene) => {
    const orbSlotPointer = orbSlot; // 记录插槽的指针

    // 生成三个球的Mesh
    const quas = new THREE.Mesh(SpritePlaneBufferGeometry(), OrbQuasShaderMaterial());
    const wex = new THREE.Mesh(SpritePlaneBufferGeometry(), OrbWexShaderMaterial());
    const exort = new THREE.Mesh(SpritePlaneBufferGeometry(), OrbExortShaderMaterial());

    // 添加到场景中
    quas.visible = false;
    wex.visible = false;
    exort.visible = false;
    scene.add(quas);
    scene.add(wex);
    scene.add(exort);

    // 用于保存对象
    const meshesMap = { 'Quas': quas, 'Wex': wex, 'Exort': exort, active: undefined };

    /** 此位点的球切换显示 */
    const fadeToAnotherMesh = (name) => {
        if (name !== 'Quas' && name !== 'Wex' && name !== 'Exort') { return; }

        // 不是当前切换球的话直接消失
        quas.visible = false;
        wex.visible = false;
        exort.visible = false;

        // 播放手部召唤法球的动画
        const isLeft = playOrbSpawnAnimation();

        const targetMesh = meshesMap[name]; // 目标球
        meshesMap.active = targetMesh; // 设置指针
        targetMesh.visible = true; // 设置可见性
        targetMesh.material.uniforms.uLifeTime.value = 0.; // 设置uniform

        // 目标球的位置应该立刻修改到手腕位置
        if (isLeft) { wristL.getWorldPosition(vec3Util); }
        else { wristR.getWorldPosition(vec3Util); }
        vec3Util.y += .15; // 比手腕位置稍微高一点
        targetMesh.position.copy(vec3Util);
    }

    /** 帧更新函数 */
    const frameLoop = (elapsedTime, deltaTime) => {
        if (!orbSlotPointer) { return; } // 球体插槽骨骼
        const activeMesh = meshesMap.active; // 当前球体
        if (!activeMesh) { return; }

        activeMesh.material.uniforms.uTime.value = elapsedTime;
        activeMesh.material.uniforms.uRandDinamic.value = Math.random();
        activeMesh.material.uniforms.uLifeTime.value += deltaTime;

        // 目标球的位置应该不断插值到Slot位置
        orbSlotPointer.getWorldPosition(vec3Util);
        const smoothstepFactor = THREE.MathUtils.smootherstep(activeMesh.material.uniforms.uLifeTime.value, 0., .8);
        vec3Util.y += (1. - smoothstepFactor) * .3; // 向上方向加一个值, 召唤时有弹出的感觉
        activeMesh.position.lerp(vec3Util, smoothstepFactor);
    }

    return { meshesMap, fadeToAnotherMesh, frameLoop };
}

/**
 * 球体状态更新机
 * @returns {{frameLoop: (elapsedTime: number, deltaTime: number) => void}}
 */
export const OrbAnimationMachine = () => {

    const orb1 = SingleOrbObject(orbSlot1, scene);
    const orb2 = SingleOrbObject(orbSlot2, scene);
    const orb3 = SingleOrbObject(orbSlot3, scene);

    let index = 0;
    const orbsMap = [orb1, orb2, orb3];
    const abilityNameArr = ['Quas', 'Wex', 'Exort']; // 切球事件
    abilityNameArr.forEach(abilityName => {
        const abilityEvent = invokerAbilityEvents.get(abilityName);
        invokerEventPipe.addEventListener(abilityEvent.type, (e) => { // 监听切球事件
            if (index + 1 > 2) { index = 0; }
            else { index += 1; }

            // 使用API调用 SingleOrbObject 更新球的显示状态过渡到另一个球
            const currentSingleOrbObject = orbsMap[index]; // 根据缓存的index找到SingleOrbObject
            currentSingleOrbObject.fadeToAnotherMesh(abilityName);
        });

    });

    const testplane1 = new THREE.Mesh(new THREE.PlaneGeometry(1.), TurbShaderMaterial());
    testplane1.visible = false;
    scene.add(testplane1);

    const testplane2 = new THREE.Mesh(new THREE.PlaneGeometry(1.), TurbShaderMaterial());
    testplane2.visible = false;
    scene.add(testplane2);

    /** 帧更新函数 */
    const frameLoop = (elapsedTime, deltaTime) => {

        // 更新 SingleOrbObject
        orb1.frameLoop(elapsedTime, deltaTime);
        orb2.frameLoop(elapsedTime, deltaTime);
        orb3.frameLoop(elapsedTime, deltaTime);

        wristL.getWorldPosition(vec3Util);
        testplane1.position.lerp(vec3Util, 1.);
        wristR.getWorldPosition(vec3Util);
        testplane2.position.lerp(vec3Util, 1.);
    }

    return { frameLoop };
}