/**
 * 用于管理渲染循环的闭包
 * @param {(elapsedTime?: number, deltaTime?: number, deltaTimeRatio60?: number) => void} LoopFunctionIn 输入的循环函数 
 * @returns {{startLoop: () => void, stopLoop: () => boolean}} 闭包对象
 */
export const FrameLoopMachine = (LoopFunctionIn) => {

    let frameLoopFunction = LoopFunctionIn;

    let frameLoopLongID = undefined; // 此次启动的id
    let startStamp = 0.; // 此次启动的开始时间
    let previousStamp = 0.; // 上一帧的时间
    let elapsedTime = 0.; // 总时间
    let deltaTime = 0.; // 间隔时间
    let deltaTimeRatio60 = 0.; // 间隔时间(缩放到60帧数)

    const startLoop = (timeStamp) => {
        frameLoopLongID = window.requestAnimationFrame(startLoop);

        if (timeStamp === undefined) { // window.requestAnimationFrame 第一帧timeStamp返回的是undefined
            if (startStamp === 0.) { timeStamp = 0.; } // 是否第一帧
            timeStamp = startStamp;
        }

        timeStamp /= 1000;
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
            // 记录下次启动的开始时间为当前的渲染时间
            startStamp = previousStamp;
            return true;
        }

        else if (frameLoopLongID === undefined) {
            frameLoopLongID = window.requestAnimationFrame(startLoop);
            return false;
        }
    }

    return { startLoop, stopLoop };

}