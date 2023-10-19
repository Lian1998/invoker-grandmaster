// 事件管线
// https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/EventTarget
export const invokerEventPipe = new EventTarget();

export const invokerOrbStatesStack = new Array(); // Orbs状态栈
export const invokerExtraAbility = ['', '']; // 当前召唤的技能槽5/6

// 通过遍历按键绑定设置, 发出invoker事件
import { invokerState2AbilityName, invokerAbilityEvents } from './invokerAbilityEvents'
import { classic_keymapping, dota2_keymapping } from '@src/assets/keymapping';

/** Dota2键盘模式, QWERDF */
const dota2EventEmitter = (e) => {
    Object.keys(dota2_keymapping).forEach(key => {
        const keycode = dota2_keymapping[key].keycode;
        let abilityName = key;
        if (keycode && keycode === e.code) {
            if (key === 'ability5' && invokerExtraAbility[0]) { abilityName = invokerExtraAbility[0]; }
            else if (key === 'ability6' && invokerExtraAbility[1]) { abilityName = invokerExtraAbility[1]; }
            const abilityEvent = invokerAbilityEvents.get(abilityName);
            if (!abilityEvent) return;
            invokerEventPipe.dispatchEvent(abilityEvent);
        }
    });
}

/** 经典键盘模式, 每个技能都对应一个快捷键 */
const classicEventEmitter = (e) => {
    Object.keys(classic_keymapping).forEach(key => {
        const keycode = classic_keymapping[key].keycode;
        // 通过快捷键找到按下的是哪一个技能名
        if (keycode && keycode === e.code) {
            let abilityName = key; // 找到技能事件
            const abilityEvent = invokerAbilityEvents.get(abilityName);
            if (!abilityEvent) return;
            // 事件是否是Invoke事件(ability5, ability6)
            if (abilityEvent.detail.state) { // 当前技能槽中是否召唤了这个事件
                // 没有召唤这个技能直接弹出
                if (!(invokerAbilityEvents[0] === abilityName || invokerAbilityEvents[1] === abilityName)) { return; }
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


import { ability1el, ability2el, ability3el, ability4el, ability5el, ability6el, toggleElementActiveClass } from '@src/dompart/index.js';
import { getJoinedBaseUrl } from '@src/utils/getJoinedBaseUrl.js';

const abilityels = [ability5el, ability6el];

/**
 * 初始化卡尔的键盘事件
 * @param {*} type classic
 */
export const invokerInitializeKeyListening = () => {

    // 初始化按键配置
    initializeKeyBinding('Dota2');

    // "切球"
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

    // "元素祈唤"
    invokerEventPipe.addEventListener('Invoke', () => {

        // Invoke图标闪烁
        toggleElementActiveClass(ability4el);

        // 计算state字符串, 并在映射表中找到对应的技能名填塞入状态栏
        let quasNum = 0, wexNum = 0, exortNum = 0;
        quasNum = wexNum = exortNum = 0;
        invokerOrbStatesStack.forEach(item => {
            if (item === 'Quas') { quasNum += 1; }
            if (item === 'Wex') { wexNum += 1; }
            if (item === 'Exort') { exortNum += 1; }
        });
        const stateStr = `Quas${quasNum}Wex${wexNum}Exort${exortNum}`;
        const abilityName = invokerState2AbilityName.get(stateStr);
        if (!abilityName) return;
        if (invokerExtraAbility[0] === abilityName) { return; }
        invokerExtraAbility[1] = invokerExtraAbility[0];
        invokerExtraAbility[0] = abilityName;

        // 更新Invoke出来的技能图标, 并且图标闪烁
        invokerExtraAbility.forEach((abilityName, index) => {
            const event = invokerAbilityEvents.get(abilityName);
            if (event) {
                const url = getJoinedBaseUrl(event.detail.icon);
                abilityels[index].style.backgroundImage = `url(${url})`;
            }
        });
    })

    // 对所有的召唤技能进行事件监听 (存在state)
    invokerAbilityEvents.forEach((event, key, map) => {
        if (!event.detail.state) return;
        invokerEventPipe.addEventListener(event.type, event1 => {
            invokerExtraAbility.forEach((abilityName, index) => {
                if (abilityName === event1.type) { toggleElementActiveClass(abilityels[index]) };
            });
        });
    });

    // 对dom按钮进行监控
    ability1el.addEventListener('click', () => { invokerEventPipe.dispatchEvent(invokerAbilityEvents.get('Quas')); });
    ability2el.addEventListener('click', () => { invokerEventPipe.dispatchEvent(invokerAbilityEvents.get('Wex')); });
    ability3el.addEventListener('click', () => { invokerEventPipe.dispatchEvent(invokerAbilityEvents.get('Exort')); });
    ability4el.addEventListener('click', () => { invokerEventPipe.dispatchEvent(invokerAbilityEvents.get('Invoke')); });
    abilityels.forEach((abilityel, index) => {
        abilityel.addEventListener('click', () => {
            if (!invokerExtraAbility[index]) { return; }
            invokerEventPipe.dispatchEvent(invokerAbilityEvents.get(invokerExtraAbility[index]));
        });
    });

}