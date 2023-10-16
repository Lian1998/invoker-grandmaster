
import { viteBaseUrlJoined } from '@src/utils/viteBaseUrlJoined.js';

document.body.style.cursor = `url(${viteBaseUrlJoined('/vrfcracked/cursor/cursor_default.png')}), default`;

// 技能图标
const ability1 = document.querySelector('.invoker-abilities .invoker-ability#a1');
const ability2 = document.querySelector('.invoker-abilities .invoker-ability#a2');
const ability3 = document.querySelector('.invoker-abilities .invoker-ability#a3');
const ability4 = document.querySelector('.invoker-abilities .invoker-ability#a4');

ability1.style.backgroundImage = `url(${viteBaseUrlJoined('/invoker-textures/icons/invoker_quas.png')})`;
ability2.style.backgroundImage = `url(${viteBaseUrlJoined('/invoker-textures/icons/invoker_wex.png')})`;
ability3.style.backgroundImage = `url(${viteBaseUrlJoined('/invoker-textures/icons/invoker_exort.png')})`;
ability4.style.backgroundImage = `url(${viteBaseUrlJoined('/invoker-textures/icons/invoker_invoke.png')})`;


export const ability5el = document.querySelector('.invoker-abilities .invoker-ability#a5');
export const ability6el = document.querySelector('.invoker-abilities .invoker-ability#a6');
