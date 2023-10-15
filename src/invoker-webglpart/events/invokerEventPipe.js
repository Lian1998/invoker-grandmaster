// Example Code
// https://developer.mozilla.org/zh-CN/docs/Web/API/CustomEvent/CustomEvent
// const customEvent = new CustomEvent('cat', { detail: {} });
// eventPipe.addEventListener(customEvent.type, (e) => { console.log(e.detail); });

// https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/EventTarget

export const invokerEventPipe = new EventTarget();

// 生成事件
import { invokerEvents } from './invokerEvents';
Object.keys(invokerEvents).forEach(key => {
    const customEvent = new CustomEvent(key, { detail: invokerEvents[key] });
    invokerEvents[key].event = customEvent;
})

// 键盘监听事件
export const invokerInitializeKeyListening = () => {

    window.addEventListener('keydown', (e) => {
        if (e.code === 'keyQ') { invokerEventPipe.dispatchEvent(invokerEvents.quas.type); }
        else if (e.code === 'keyW') { invokerEventPipe.dispatchEvent(invokerEvents.wex.type); }
        else if (e.code === 'keyE') { invokerEventPipe.dispatchEvent(invokerEvents.exort.type); }
        else if (e.code === 'keyR') { invokerEventPipe.dispatchEvent(invokerEvents.invoke.type); }
        else if (e.code === 'keyD') { invokerEventPipe.dispatchEvent(invokerEvents.invoke1.type); }
        else if (e.code === 'keyF') { invokerEventPipe.dispatchEvent(invokerEvents.invoke2.type); }
    });

}