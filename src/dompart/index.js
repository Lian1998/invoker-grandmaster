
import './index.scss'

import { getJoinedBaseUrl } from '@src/utils/getJoinedBaseUrl.js';

document.body.style.cursor = `url(${getJoinedBaseUrl('/vrfcracked/cursor/cursor_default.png')}), default`;

// Loading界面
export const maskel = document.querySelector('#loading-mask');
export const loadedel = document.querySelector('#loading-mask .loading-information #loaded');
export const requiredel = document.querySelector('#loading-mask .loading-information #required');


// 技能图标
export const ability1el = document.querySelector('.invoker-abilities .invoker-ability#a1');
export const ability2el = document.querySelector('.invoker-abilities .invoker-ability#a2');
export const ability3el = document.querySelector('.invoker-abilities .invoker-ability#a3');
export const ability4el = document.querySelector('.invoker-abilities .invoker-ability#a4');
export const ability5el = document.querySelector('.invoker-abilities .invoker-ability#a5');
export const ability6el = document.querySelector('.invoker-abilities .invoker-ability#a6');
ability1el.style.backgroundImage = `url(${getJoinedBaseUrl('/invoker-textures/icons/invoker_quas_lian1998.png')})`;
ability2el.style.backgroundImage = `url(${getJoinedBaseUrl('/invoker-textures/icons/invoker_wex_lian1998.png')})`;
ability3el.style.backgroundImage = `url(${getJoinedBaseUrl('/invoker-textures/icons/invoker_exort_lian1998.png')})`;
ability4el.style.backgroundImage = `url(${getJoinedBaseUrl('/invoker-textures/icons/invoker_invoke.png')})`;


// 目标技能图标
export const target1el = document.querySelector('.target-abilities .invoker-ability#t1');
export const target2el = document.querySelector('.target-abilities .invoker-ability#t2');
export const target3el = document.querySelector('.target-abilities .invoker-ability#t3');
export const target4el = document.querySelector('.target-abilities .invoker-ability#t4');
export const target5el = document.querySelector('.target-abilities .invoker-ability#t5');
