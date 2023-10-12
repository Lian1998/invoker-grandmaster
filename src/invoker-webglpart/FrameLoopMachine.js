const now = () => ((typeof performance === 'undefined' ? Date : performance).now() / 1000.);

/**
 * 用于管理渲染循环的闭包
 * @param {(elapsedTime?: number, deltaTime?: number, deltaTimeRatio60?: number) => void} LoopFunctionIn 输入的循环函数 
 * @returns {{startLoop: () => void, stopLoop: () => boolean}} 闭包对象
 */
export const FrameLoopMachine = (LoopFunctionIn) => {

    let frameLoopFunction = LoopFunctionIn;

    let frameLoopLongID = undefined; // 此次启动的id

    let lastStopStamp = 0.; // 上一次结束的时间
    let previousStamp = 0.; // 上一帧的时间
    let elapsedTime = 0.; // 总时间
    let deltaTime = 0.; // 间隔时间
    let deltaTimeRatio60 = 0.; // 间隔时间(缩放到60帧数)

    const startLoop = () => {
        frameLoopLongID = window.requestAnimationFrame(startLoop);

        const timeStamp = now();
        deltaTime = timeStamp - previousStamp;
        deltaTimeRatio60 = 60 * Math.pow(deltaTime, 2);
        elapsedTime += deltaTime;
        previousStamp = timeStamp;

        frameLoopFunction(elapsedTime, deltaTime, deltaTimeRatio60);
    }

    const stopLoop = () => {

        if (frameLoopLongID) {

            window.cancelAnimationFrame(frameLoopLongID);
            frameLoopLongID = undefined;

            lastStopStamp = now(); // 记录下次启动的开始时间为当前的渲染时间

            return true;
        }

        else if (frameLoopLongID === undefined) {

            if (lastStopStamp > 0) { previousStamp = now(); }
            frameLoopLongID = window.requestAnimationFrame(startLoop);

            return false;
        }
    }

    return { startLoop, stopLoop };

}