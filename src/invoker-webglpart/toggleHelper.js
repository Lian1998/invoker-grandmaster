import {
    grid_helper, axes_helper,
    directional_light_helper, directional_light_helper1, spot_light_helper, spot_light_helper1,
    skeleton_helper
} from './index.js'


/**
 * 切换当前的帮助对象显示
 * @param {*} active true/false 激活/不激活
 * @returns 
 */
export const toggleHelper = (active = undefined) => {
    if (!grid_helper) return;
    let targetVisiable = active;
    if (active === undefined) { targetVisiable = !grid_helper.visible; }

    if (grid_helper) grid_helper.visible = targetVisiable;
    if (axes_helper) axes_helper.visible = targetVisiable;

    if (directional_light_helper) directional_light_helper.visible = targetVisiable;
    if (directional_light_helper1) directional_light_helper1.visible = targetVisiable;
    if (spot_light_helper) spot_light_helper.visible = targetVisiable;
    if (spot_light_helper1) spot_light_helper1.visible = targetVisiable;

    if (skeleton_helper) skeleton_helper.visible = targetVisiable;
}