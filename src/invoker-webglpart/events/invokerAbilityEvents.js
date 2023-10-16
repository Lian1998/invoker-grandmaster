// 资源处理

const AbilityMap = {

    'Quas': {

    },

    'Wex': {

    },

    'Exort': {

    },

    'Invoke': {

    },

    'Cold Snap': {
        state: 'Quas3Wex0Exort0'
    },
    'Ghost Walk': {
        state: 'Quas2Wex1Exort0'
    },
    'Ice Wall': {
        state: 'Quas2Wex0Exort1'
    },
    'Tornado': {
        state: 'Quas1Wex2Exort0'
    },
    'Deafening Blast': {
        state: 'Quas1Wex1Exort1'
    },
    'Forge Spirit': {
        state: 'Quas1Wex0Exort2'
    },
    'E.M.P': {
        state: 'Quas0Wex3Exort0'
    },
    'Alacrity': {
        state: 'Quas0Wex2Exort1'
    },
    'Chaos Meteor': {
        state: 'Quas0Wex1Exort2'
    },
    'Sun Strike': {
        state: 'Quas0Wex0Exort3'
    },
}

export const invokerState2AbilityName = new Map(); // 三球状态映射技能名
export const invokerAbilityEvents = new Map(); // 技能事件列表及事件携带信息

Object.keys(AbilityMap).forEach((key) => {

    if (AbilityMap[key].state) { invokerState2AbilityName.set(AbilityMap[key].state, key); }

    // Example Code
    // https://developer.mozilla.org/zh-CN/docs/Web/API/CustomEvent/CustomEvent
    // const customEvent = new CustomEvent('cat', { detail: {} });
    // eventPipe.addEventListener(customEvent.type, (e) => { console.log(e.detail); });

    // https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/EventTarget

    invokerAbilityEvents.set(key, new CustomEvent(key, { detail: AbilityMap[key] }));
});