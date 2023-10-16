import { orbitcontrols, frameloopMachine } from './invoker'

/**
 * 切换当前的渲染循环状态
 * @param {*} active true/false 激活/不激活
 * @returns 
 */
export const toggleLoopState = (active = undefined) => {
    if (!frameloopMachine) return;

    // 如果传入了参数
    if (active != undefined) {
        if (active) { frameloopMachine.startLoop(); }
        else { frameloopMachine.stopLoop(); }
    }

    // 如果没有传入参数
    else {
        const stop = frameloopMachine.toggleLoop();
        if (!orbitcontrols) return;
        if (stop) { orbitcontrols.enabled = false; }
        else { orbitcontrols.enabled = true; }
    }
}