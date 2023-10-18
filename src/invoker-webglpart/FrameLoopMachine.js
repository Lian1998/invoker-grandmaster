const now = () => ((typeof performance === 'undefined' ? Date : performance).now() / 1000.);

/**
 * 用于管理渲染循环的闭包
 * @param {(elapsedTime?: number, deltaTime?: number) => void} LoopFunctionIn 输入的循环函数 
 * @returns {{startLoop: () => void, stopLoop: () => void, toggleLoop: () => boolean}} 闭包对象
 */
export const FrameLoopMachine = (LoopFunctionIn) => {

    let frameLoopFunction = LoopFunctionIn;

    let frameLoopLongID = undefined; // 此次启动的id

    let lastStopStamp = 0.0; // 上一次结束的时间
    let previousStamp = 0.0; // 上一帧的时间
    let elapsedTime = 0.0; // 总时间
    let deltaTime = 0.0; // 间隔时间

    const startLoop = () => {
        frameLoopLongID = window.requestAnimationFrame(startLoop);

        const timeStamp = now();
        deltaTime = timeStamp - previousStamp;
        elapsedTime += deltaTime;
        previousStamp = timeStamp;

        frameLoopFunction(elapsedTime, deltaTime);
    }

    const stopLoop = () => {

        if (!frameLoopLongID) return;

        window.cancelAnimationFrame(frameLoopLongID);
        frameLoopLongID = undefined;

        lastStopStamp = now(); // 记录下次启动的开始时间为当前的渲染时间
    }

    const toggleLoop = () => {

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

    return { startLoop, stopLoop, toggleLoop };

}