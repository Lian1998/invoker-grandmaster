
import './index.scss'

import { getJoinedBaseUrl } from '@src/utils/getJoinedBaseUrl.js';

document.body.style.cursor = `url(${getJoinedBaseUrl('/vrfcracked/cursor/cursor_default.png')}), default`;

// 技能图标
export const ability1el = document.querySelector('.invoker-abilities .invoker-ability#a1');
export const ability2el = document.querySelector('.invoker-abilities .invoker-ability#a2');
export const ability3el = document.querySelector('.invoker-abilities .invoker-ability#a3');
export const ability4el = document.querySelector('.invoker-abilities .invoker-ability#a4');

ability1el.style.backgroundImage = `url(${getJoinedBaseUrl('/invoker-textures/icons/invoker_quas.png')})`;
ability2el.style.backgroundImage = `url(${getJoinedBaseUrl('/invoker-textures/icons/invoker_wex.png')})`;
ability3el.style.backgroundImage = `url(${getJoinedBaseUrl('/invoker-textures/icons/invoker_exort.png')})`;
ability4el.style.backgroundImage = `url(${getJoinedBaseUrl('/invoker-textures/icons/invoker_invoke.png')})`;


export const ability5el = document.querySelector('.invoker-abilities .invoker-ability#a5');
export const ability6el = document.querySelector('.invoker-abilities .invoker-ability#a6');

/**
 * 短暂的给某个元素添加activeClass
 * @param {Element} element 
 */
export const toggleElementActiveClass = (element) => {
    if (!element | !element.classList) { return; }
    element.classList.add('active');
    setTimeout(() => { element.classList.remove('active'); }, 120);
}