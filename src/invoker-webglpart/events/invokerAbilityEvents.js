// 资源处理

const AbilityMap = {
    'Quas': {
        icon: '/invoker-textures/icons/invoker_quas.png',
    },
    'Wex': {
        icon: '/invoker-textures/icons/invoker_wex.png',
    },
    'Exort': {
        icon: '/invoker-textures/icons/invoker_exort.png',
    },
    'Invoke': {
        icon: '/invoker-textures/icons/invoker_invoke.png',
    },
    'Cold Snap': {
        state: 'Quas3Wex0Exort0',
        icon: '/invoker-textures/icons/invoker_cold_snap.png',
    },
    'Ghost Walk': {
        state: 'Quas2Wex1Exort0',
        icon: '/invoker-textures/icons/invoker_ghost_walk.png',
    },
    'Ice Wall': {
        state: 'Quas2Wex0Exort1',
        icon: '/invoker-textures/icons/invoker_ice_wall.png',
    },
    'Tornado': {
        state: 'Quas1Wex2Exort0',
        icon: '/invoker-textures/icons/invoker_tornado.png',
    },
    'Deafening Blast': {
        state: 'Quas1Wex1Exort1',
        icon: '/invoker-textures/icons/invoker_deafening_blast.png',
    },
    'Forge Spirit': {
        state: 'Quas1Wex0Exort2',
        icon: '/invoker-textures/icons/invoker_forge_spirit.png',
    },
    'E.M.P': {
        state: 'Quas0Wex3Exort0',
        icon: '/invoker-textures/icons/invoker_emp.png',
    },
    'Alacrity': {
        state: 'Quas0Wex2Exort1',
        icon: '/invoker-textures/icons/invoker_alacrity.png',
    },
    'Chaos Meteor': {
        state: 'Quas0Wex1Exort2',
        icon: '/invoker-textures/icons/invoker_chaos_meteor.png',
    },
    'Sun Strike': {
        state: 'Quas0Wex0Exort3',
        icon: '/invoker-textures/icons/invoker_sun_strike.png',
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