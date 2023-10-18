
import * as THREE from 'three';

import { OrbQuasShaderMaterial, OrbWexShaderMaterial, OrbExortShaderMaterial } from './OrbShaderMaterials.js';
import { SpritePlaneBufferGeometry } from '../SpritePlaneBufferGeometry.js';
import { invokerEventPipe } from '@src/invoker-webglpart/events/invokerEventPipe.js';
import { invokerAbilityEvents } from '@src/invoker-webglpart/events/invokerAbilityEvents.js';

import {
    orbsSpawnActionL, orbsSpawnActionR, orbsAction, // 动画
    wristL, wristR, // 手腕骨骼
    orbSlot1, orbSlot2, orbSlot3, // 元素法球位置插槽骨骼
    scene, // 场景
    orbSpawnEffectPlaneL, orbSpawnEffectPlaneR, // 特效Effector
} from '../../invoker.js';

const vec3Util = new THREE.Vector3(); // 一个工具v3是线程不安全的
const orbsActionDuration = 2.0;  // 通过访问clip获取剪辑片段的时间 orbsAction._clip.duration
const half_orbsActionDuration = orbsActionDuration / 2.0;
const orbSpawnActionDuration = 0.35; // orbsSpawnActionL._clip.duration
const half_orbSpawnActionDuration = orbSpawnActionDuration / 2.0;
const orbLerpingDuration = 2.0;

/**
 * 根据当前球轨道动画判断离哪个手更近, 以播放召唤元素法球的动画
 * @returns {boolean} isLeft? 是否是从左手位置发出
 */
const playOrbSpawnAnimation = () => {
    if (!orbsSpawnActionL || !orbsSpawnActionR) { return; } // 判断参数
    const isLeft = Math.random() <= 0.5 ? false : true; // 随机生成左右 
    // 采用动画的指针
    let orbSpawnAction = null;
    if (isLeft) { orbSpawnAction = orbsSpawnActionL; }
    else { orbSpawnAction = orbsSpawnActionR; }
    // 如果这个动画还没有播放过, 无脑播放它
    if (orbSpawnAction.time <= 0.0) {
        orbSpawnAction.play();
        return isLeft;
    }
    // 如果动画已经播放过且播放完毕, 无脑重置并重新播放
    else if (orbSpawnAction.time >= orbSpawnActionDuration) {
        orbSpawnAction.reset();
        orbSpawnAction.play();
        return isLeft;
    }
    // 如果当前动画其实正在进行中, 且动画当前处于手往下运动的阶段, 那么需要映射到同样位置其向上运动的time, 让手重新抬起
    else if (orbSpawnAction.time >= half_orbSpawnActionDuration) {
        // clamp一下以免出现bug
        orbSpawnAction.time = THREE.MathUtils.clamp(half_orbSpawnActionDuration - (orbSpawnActionDuration - orbSpawnAction.time), 0.0, 1.0);
        return isLeft;
    }
}

/**
 * 单个祈求者元素法球球体
 * 一个祈求者的元素法球球体包含了三个平面精灵, 分别对应了 冰/雷/火(Quas/Wex/Exort)
 * 
 * @param {THREE.Bone} orbSlot 当前元素法球体所对应的插槽
 * @returns {{ 
 *  meshesMap: { quas: THREE.Mesh, wex: THREE.Mesh, exort: THREE.Mesh, activeP: undefined | THREE.Mesh },
 *  fadeToAnotherMesh: (name: 'Quas'|'Wex'|'Exort') => void,
 *  frameLoop: (elapsedTime: number, deltaTime: number) => void,
 * }} 元素法球球体更新机闭包
 */
export const SingleOrbObject = (orbSlot, scene) => {
    const singleOrbSlotP = orbSlot; // 记录插槽的指针

    // 生成三个元素法球的Mesh, 添加到场景中
    const quas = new THREE.Mesh(SpritePlaneBufferGeometry(), OrbQuasShaderMaterial());
    const wex = new THREE.Mesh(SpritePlaneBufferGeometry(), OrbWexShaderMaterial());
    const exort = new THREE.Mesh(SpritePlaneBufferGeometry(), OrbExortShaderMaterial());
    quas.visible = false;
    wex.visible = false;
    exort.visible = false;
    scene.add(quas);
    scene.add(wex);
    scene.add(exort);

    // 指针保存对象
    const meshesMap = { 'Quas': quas, 'Wex': wex, 'Exort': exort, active: undefined, previous: undefined };

    // 过渡动画曲线取值
    let singleOrbFaddingFactor = 0.0;
    const vec3Util1 = new THREE.Vector3();
    const vec3Util2 = new THREE.Vector3();

    /** 此位点的元素法球切换显示 */
    const fadeToAnotherMesh = (name) => {
        if (name !== 'Quas' && name !== 'Wex' && name !== 'Exort') { return; } // 判断参数
        const isLeft = playOrbSpawnAnimation(); // 判断左右手

        // 如果这次切球就是上一次的球, 那么直接更新位置
        if (meshesMap.active && meshesMap.active === meshesMap[name]) {
            // 可能手速太快连续切了9次, 要保持一下状态
            if (meshesMap.previous) { meshesMap.previous.visible = false; }
            meshesMap.previous = undefined;
            meshesMap.active.visible = true;

            // 设置过渡动画
            singleOrbFaddingFactor = 0.0;
            meshesMap.active.material.uniforms.uLifeTime.value = 0.0;
            // 从手部位置发出
            if (isLeft) { wristL.getWorldPosition(vec3Util1); }
            else { wristR.getWorldPosition(vec3Util1); }
            meshesMap.active.position.copy(vec3Util1);
            // 特效
            if (orbSpawnEffectPlaneL && orbSpawnEffectPlaneR) {
                if (isLeft) { orbSpawnEffectPlaneL.material.uniforms.uLifeTime.value = 0.0; }
                else { orbSpawnEffectPlaneR.material.uniforms.uLifeTime.value = 0.0; }
            }
            return;
        }

        // 播放手部召唤元素法球的动画, 计算球旧消失(新生成)延迟
        let fadeInDuration = 0.0;
        // total      : 2.0
        // right Spawn: 1.0 << orbsAction.time << 1.5
        // left  Spawn: 0.8 << orbsAction.time << 1.3
        if (orbsAction.time < 0.4) { fadeInDuration = (0.4 - orbsAction.time) * 1000; }
        if (orbsAction.time > 1.8) { fadeInDuration = (((2.0 - 1.8) + 0.4) - orbsAction.time) * 1000; }

        // 如果这次切球不是上一次的球
        // 置换/设置指针
        meshesMap.previous = meshesMap.active;
        meshesMap.active = meshesMap[name];
        const meshPrevious = meshesMap.previous; // 上一个球
        const meshActive = meshesMap.active;  // 这一个球
        if (meshPrevious) { meshPrevious.material.uniforms.uLifeTime.value = orbSpawnActionDuration; } // 设置过渡动画
        setTimeout(() => {
            if (meshPrevious) { meshPrevious.visible = false; } // 老球不显示
            meshActive.visible = true; // 新球显示
            // 设置过渡动画
            singleOrbFaddingFactor = 0.0;
            meshActive.material.uniforms.uLifeTime.value = 0.0;
            // 从手部位置发出
            if (isLeft) { wristL.getWorldPosition(vec3Util2); }
            else { wristR.getWorldPosition(vec3Util2); }
            meshActive.position.copy(vec3Util2);
            // 特效
            if (orbSpawnEffectPlaneL && orbSpawnEffectPlaneR) {
                if (isLeft) { orbSpawnEffectPlaneL.material.uniforms.uLifeTime.value = 0.0; }
                else { orbSpawnEffectPlaneR.material.uniforms.uLifeTime.value = 0.0 }
            }
        }, fadeInDuration);

    }

    /** 帧更新函数 */
    const frameLoop = (elapsedTime, deltaTime) => {

        if (!singleOrbSlotP) { return; } // 球体插槽骨骼

        // 上一次切换球体
        const meshPrevious = meshesMap.previous;
        if (meshPrevious) {
            meshPrevious.material.uniforms.uTime.value = elapsedTime;
            meshPrevious.material.uniforms.uRandDinamic.value = Math.random();
            meshPrevious.material.uniforms.uLifeTime.value -= deltaTime;
        }

        // 当前球体
        const meshActive = meshesMap.active;
        if (meshActive) {
            meshActive.material.uniforms.uTime.value = elapsedTime;
            meshActive.material.uniforms.uRandDinamic.value = Math.random();
            meshActive.material.uniforms.uLifeTime.value += deltaTime;

            // 目标球的位置应该不断插值到Slot位置
            singleOrbFaddingFactor += deltaTime;
            singleOrbSlotP.getWorldPosition(vec3Util);
            const smoothstepFactor = THREE.MathUtils.smoothstep(singleOrbFaddingFactor, 0.0, orbLerpingDuration);
            meshActive.position.y += (1.0 - smoothstepFactor) * deltaTime * 2.5;
            meshActive.position.lerp(vec3Util, smoothstepFactor);
        }
    }

    return { meshesMap, fadeToAnotherMesh, frameLoop };
}

/**
 * 球体状态更新机
 * @returns {{frameLoop: (elapsedTime: number, deltaTime: number) => void}}
 */
export const OrbAnimationMachine = () => {

    let index = 0;
    const orb1 = SingleOrbObject(orbSlot1, scene);
    const orb2 = SingleOrbObject(orbSlot2, scene);
    const orb3 = SingleOrbObject(orbSlot3, scene);

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

    /** 帧更新函数 */
    const frameLoop = (elapsedTime, deltaTime) => {

        // 更新 SingleOrbObject
        orb1.frameLoop(elapsedTime, deltaTime);
        orb2.frameLoop(elapsedTime, deltaTime);
        orb3.frameLoop(elapsedTime, deltaTime);
    }

    return { frameLoop };
}