
import {
    ability1el, ability2el, ability3el, ability4el, ability5el, ability6el,
    target1el, target2el, target3el, target4el, target5el
} from '@src/dompart/index.js';

// 事件管线

export const invokerEventPipe = new EventTarget();
const invokerOrbStatesStack = []; // Orbs状态栈
const extraAbility = ['', '']; // 当前召唤的技能槽5/6
const extraAbilityEls = [ability5el, ability6el];

// 通过遍历按键绑定设置, 发出invoker事件
import { invokeAbilityState2Event, invokerEvents } from './invokerEvents';
import { classicKeymapping, dota2Keymapping } from './keymapping.js';

/** Dota2键盘模式, QWERDF */
const dota2EventEmitter = (e) => {
    Object.keys(dota2Keymapping).forEach(key => {
        const keycode = dota2Keymapping[key].keycode;
        let abilityName = key;
        if (keycode && keycode === e.code) {
            if (key === 'ability5' && extraAbility[0]) { abilityName = extraAbility[0]; }
            else if (key === 'ability6' && extraAbility[1]) { abilityName = extraAbility[1]; }
            const abilityEvent = invokerEvents.get(abilityName);
            if (!abilityEvent) return;
            invokerEventPipe.dispatchEvent(abilityEvent);
        }
    });
}

/** 经典键盘模式, 每个技能都对应一个快捷键 */
const classicEventEmitter = (e) => {
    Object.keys(classicKeymapping).forEach(key => {
        const keycode = classicKeymapping[key].keycode;
        // 通过快捷键找到按下的是哪一个技能名
        if (keycode && keycode === e.code) {
            let abilityName = key; // 找到技能事件
            const abilityEvent = invokerEvents.get(abilityName);
            if (!abilityEvent) return;
            // 事件是否是Invoke事件(ability5, ability6)
            if (abilityEvent.detail.abilityState) { // 当前技能槽中是否召唤了这个事件
                // 没有召唤这个技能直接弹出
                if (!(invokerEvents[0] === abilityName || invokerEvents[1] === abilityName)) { return; }
            }
            invokerEventPipe.dispatchEvent(abilityEvent); // 触发事件
        }
    });
}

/** 初始化按键风格 */
export const initializeKeyBinding = (type = 'Dota2') => {
    if (type === 'Dota2') {
        window.removeEventListener('keydown', classicEventEmitter);
        window.addEventListener('keydown', dota2EventEmitter);
    }
    else if (type === 'Classic') {
        window.removeEventListener('keydown', dota2EventEmitter);
        window.addEventListener('keydown', classicEventEmitter);
    }
}

import { invokerAbility4HaloPlane, invokerAbility4TurbPlane } from '@src/invoker-webglpart/index.js';
import { invokeAbilityNames } from './invokerEvents';
import { toggleElementActiveClass } from '@src/utils/toggleElementActiveClass.js';
import { baseUrlT } from '@src/utils/baseUrlT.js';

const targetAbilityEls = [target1el, target2el, target3el, target4el, target5el];
const targetAbilityStatus = [];
const targetAbilities = [];

const initializeTargetsAbilitites = () => {
    for (let i = 0; i < targetAbilityEls.length; i++) {
        const randindex = Math.floor(Math.random() * invokeAbilityNames.length);
        const randAbilityName = invokeAbilityNames[randindex];
        const randAbilityEvent = invokerEvents.get(randAbilityName);
        targetAbilityStatus[i] = false;
        targetAbilities[i] = randAbilityName;
        if (targetAbilityEls[i]) {
            targetAbilityEls[i].style.backgroundImage = `url(${baseUrlT(randAbilityEvent.detail.icon)})`;
            targetAbilityEls[i].classList.remove('active');
        }
    }
}

/**
 * 初始化卡尔的键盘事件
 * @param {*} type classic
 */
export const invokerInitializeKeyListening = () => {

    // 初始化按键配置
    initializeKeyBinding('Dota2');

    // 随机技能
    initializeTargetsAbilitites();

    // "切球" Q/W/E
    invokerEventPipe.addEventListener('Quas', () => {
        toggleElementActiveClass(ability1el);
        if (invokerOrbStatesStack.length >= 3) { invokerOrbStatesStack.pop(); }
        invokerOrbStatesStack.unshift('Quas');
    });
    invokerEventPipe.addEventListener('Wex', () => {
        toggleElementActiveClass(ability2el);
        if (invokerOrbStatesStack.length >= 3) { invokerOrbStatesStack.pop(); }
        invokerOrbStatesStack.unshift('Wex');
    });
    invokerEventPipe.addEventListener('Exort', () => {
        toggleElementActiveClass(ability3el);
        if (invokerOrbStatesStack.length >= 3) { invokerOrbStatesStack.pop(); }
        invokerOrbStatesStack.unshift('Exort');
    });

    // "元素祈唤" R
    invokerEventPipe.addEventListener('Invoke', () => {
        toggleElementActiveClass(ability4el); // Invoke图标闪烁
        if (invokerOrbStatesStack.length < 3) { return; } // 没3个球弹出

        // 计算state字符串
        let quasNum = 0, wexNum = 0, exortNum = 0;
        invokerOrbStatesStack.forEach(item => {
            if (item === 'Quas') { quasNum += 1; }
            if (item === 'Wex') { wexNum += 1; }
            if (item === 'Exort') { exortNum += 1; }
        });
        const stateStr = `Quas${quasNum}Wex${wexNum}Exort${exortNum}`;
        // 从技能列表中找到该技能
        const abilityEvent = invokeAbilityState2Event.get(stateStr);
        if (!abilityEvent) return;
        const abilityName = abilityEvent.type;
        if (extraAbility[0] === abilityName) { return; } // 如果现在Ability5已经是改技能了, 那么跳出逻辑

        // 确定更新
        extraAbility[1] = extraAbility[0];
        extraAbility[0] = abilityName;
        if (quasNum > wexNum && quasNum > exortNum) { invokerAbility4HaloPlane.material.uniforms.uType.value = 0.1; }
        else if (wexNum > quasNum && wexNum > exortNum) { invokerAbility4HaloPlane.material.uniforms.uType.value = 1.1; }
        else if (exortNum > quasNum && exortNum > wexNum) { invokerAbility4HaloPlane.material.uniforms.uType.value = 2.1; }
        if (invokerAbility4HaloPlane) { invokerAbility4HaloPlane.material.uniforms.uLifeTime.value = 0.0; }
        if (invokerAbility4TurbPlane) { invokerAbility4TurbPlane.material.uniforms.uLifeTime.value = 0.0; }
        extraAbility.forEach((abilityName, index) => { // 更新技能图标
            if (!abilityName) return;
            const event = invokerEvents.get(abilityName);
            extraAbilityEls[index].style.backgroundImage = `url(${baseUrlT(event.detail.icon)})`;
        });
    })

    // 对所有的召唤技能进行事件监听 (存在state)
    for (let i = 0; i < invokeAbilityNames.length; i++) {
        const abilityName = invokeAbilityNames[i];
        const abilityEvent = invokerEvents.get(abilityName);
        if (!abilityEvent) { return; }

        // 给所有技能事件添加监听函数
        invokerEventPipe.addEventListener(abilityEvent.type, (event) => {

            // 确定是使用了技能栏的额外技能
            extraAbility.forEach((abilityName, index) => {

                if (abilityName !== event.type) { return; }
                if (extraAbilityEls[index]) { toggleElementActiveClass(extraAbilityEls[index]); } // 闪烁图标
                let flag = true;
                for (let j = 0; j < targetAbilities.length; j++) {
                    if (abilityName === targetAbilities[j]) {
                        targetAbilityStatus[j] = true;
                        if (targetAbilityEls[j]) { targetAbilityEls[j].classList.add('active'); }
                    }
                    if (targetAbilityStatus[j] === false) { flag = false; } // 只要有一个还没激活, 那么就不会激活
                }

                // 成功消除一次
                if (flag === true) {
                    initializeTargetsAbilitites();
                }
            });
        });
    }

    // 对dom按钮进行监控
    ability1el.addEventListener('click', () => { invokerEventPipe.dispatchEvent(invokerEvents.get('Quas')); });
    ability2el.addEventListener('click', () => { invokerEventPipe.dispatchEvent(invokerEvents.get('Wex')); });
    ability3el.addEventListener('click', () => { invokerEventPipe.dispatchEvent(invokerEvents.get('Exort')); });
    ability4el.addEventListener('click', () => { invokerEventPipe.dispatchEvent(invokerEvents.get('Invoke')); });
    extraAbilityEls.forEach((abilityel, index) => {
        abilityel.addEventListener('click', () => {
            if (!extraAbility[index]) { return; }
            invokerEventPipe.dispatchEvent(invokerEvents.get(extraAbility[index]));
        });
    });

}