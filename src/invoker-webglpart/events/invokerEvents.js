// 资源处理
// abilityName, abilityEvent, abilityState

const AbilityMap = {
    'Quas': {
        icon: '/invoker-textures/icons/invoker_quas_lian1998.png',
    },
    'Wex': {
        icon: '/invoker-textures/icons/invoker_wex_lian1998.png',
    },
    'Exort': {
        icon: '/invoker-textures/icons/invoker_exort_lian1998.png',
    },
    'Invoke': {
        icon: '/invoker-textures/icons/invoker_invoke.png',
    },
    'Cold Snap': {
        abilityState: 'Quas3Wex0Exort0',
        icon: '/invoker-textures/icons/invoker_cold_snap.png',
    },
    'Ghost Walk': {
        abilityState: 'Quas2Wex1Exort0',
        icon: '/invoker-textures/icons/invoker_ghost_walk.png',
    },
    'Ice Wall': {
        abilityState: 'Quas2Wex0Exort1',
        icon: '/invoker-textures/icons/invoker_ice_wall.png',
    },
    'Tornado': {
        abilityState: 'Quas1Wex2Exort0',
        icon: '/invoker-textures/icons/invoker_tornado.png',
    },
    'Deafening Blast': {
        abilityState: 'Quas1Wex1Exort1',
        icon: '/invoker-textures/icons/invoker_deafening_blast.png',
    },
    'Forge Spirit': {
        abilityState: 'Quas1Wex0Exort2',
        icon: '/invoker-textures/icons/invoker_forge_spirit.png',
    },
    'E.M.P': {
        abilityState: 'Quas0Wex3Exort0',
        icon: '/invoker-textures/icons/invoker_emp.png',
    },
    'Alacrity': {
        abilityState: 'Quas0Wex2Exort1',
        icon: '/invoker-textures/icons/invoker_alacrity.png',
    },
    'Chaos Meteor': {
        abilityState: 'Quas0Wex1Exort2',
        icon: '/invoker-textures/icons/invoker_chaos_meteor.png',
    },
    'Sun Strike': {
        abilityState: 'Quas0Wex0Exort3',
        icon: '/invoker-textures/icons/invoker_sun_strike.png',
    },
}

export const invokerEvents = new Map(); // 所有事件
export const invokeAbilityState2Event = new Map(); // 所有Invoke事件 state => abilityEvent
export const invokeAbilityNames = [];

Object.keys(AbilityMap).forEach((abilityName) => {

    // Example Code
    // https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/EventTarget
    // https://developer.mozilla.org/zh-CN/docs/Web/API/CustomEvent/CustomEvent
    // const customEvent = new CustomEvent('cat', { detail: {} });
    // eventPipe.addEventListener(customEvent.type, (e) => { console.log(e.detail); });

    const abilityEvent = new CustomEvent(abilityName, { detail: AbilityMap[abilityName] });
    invokerEvents.set(abilityName, abilityEvent);

    const abilityState = AbilityMap[abilityName].abilityState
    if (abilityState) {
        invokeAbilityNames.push(abilityName);
        invokeAbilityState2Event.set(abilityState, abilityEvent);
    }
});