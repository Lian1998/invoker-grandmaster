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

/**
 * 初始化卡尔的键盘事件
 * @param {*} type classic
 */
export const invokerInitializeKeyListening = () => {

    initializeKeyBinding('Dota2');

    // "切球"

    invokerEventPipe.addEventListener('Quas', () => {
        if (invokerOrbStatesStack.length >= 3) { invokerOrbStatesStack.pop(); }
        invokerOrbStatesStack.unshift('Quas');
    });
    invokerEventPipe.addEventListener('Wex', () => {
        if (invokerOrbStatesStack.length >= 3) { invokerOrbStatesStack.pop(); }
        invokerOrbStatesStack.unshift('Wex');
    });
    invokerEventPipe.addEventListener('Exort', () => {
        if (invokerOrbStatesStack.length >= 3) { invokerOrbStatesStack.pop(); }
        invokerOrbStatesStack.unshift('Exort');
    });

    // "元素祈唤"

    invokerEventPipe.addEventListener('Invoke', () => {
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
    })

    // 打印

    // invokerAbilityEvents.forEach((value, key, map) => {
    //     invokerEventPipe.addEventListener(value.type, (e) => {
    //         const abilityName = value.type;
    //         // 如果是个召唤技能
    //         if (invokerAbilityEvents.get(abilityName).detail.state) {
    //             console.log(abilityName);
    //         }
    //         // 如果是切球
    //         else {
    //             console.log(invokerOrbStatesStack, invokerExtraAbility[0], invokerExtraAbility[1]);
    //         }
    //     });
    // });

}