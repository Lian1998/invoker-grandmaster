import { AbilityMap } from "@src/invoker-abilitymap";

// 资源处理
// abilityName, abilityEvent, abilityState

export const invokerEvents = new Map(); // 技能名 与 技能事件 的映射
export const invokeAbilityState2Event = new Map(); // 当前球状态 与 技能事件 的映射
export const invokeAbilityNames = []; // 所有的技能名

// Example Code
// https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/EventTarget
// https://developer.mozilla.org/zh-CN/docs/Web/API/CustomEvent/CustomEvent
// const customEvent = new CustomEvent('cat', { detail: {} });
// eventPipe.addEventListener(customEvent.type, (e) => { console.log(e.detail); });

// 遍历所有的卡尔技能生成
Object.keys(AbilityMap).forEach((abilityName) => {
    const abilityEvent = new CustomEvent(abilityName, { detail: AbilityMap[abilityName] });
    invokerEvents.set(abilityName, abilityEvent);

    const abilityState = AbilityMap[abilityName].abilityState;
    if (abilityState) {
        invokeAbilityNames.push(abilityName);
        invokeAbilityState2Event.set(abilityState, abilityEvent);
    }
});
