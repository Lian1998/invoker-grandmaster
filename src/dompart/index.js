import { baseUrlT } from "@src/utils/baseUrlT.js";
import { AbilityMap } from "@src/invoker-abilitymap.js";

document.body.style.cursor = `url(${baseUrlT("/vrfcracked/cursor/cursor_default.png")}), default`;

// Loading界面
export const el_loadingMask = document.querySelector("#loading-mask");
export const el_loadedNum = document.querySelector("#loading-mask .loading-information #loaded");
export const el_requiredNum = document.querySelector("#loading-mask .loading-information #required");

// 三维视图
export const el_viewportContainer = document.querySelector("#viewport-container");
export const el_viewport1 = document.querySelector("#viewport1");

// 目标技能图标
export const el_target1 = document.querySelector(".target-abilities .invoker-ability#t1");
export const el_target2 = document.querySelector(".target-abilities .invoker-ability#t2");
export const el_target3 = document.querySelector(".target-abilities .invoker-ability#t3");
export const el_target4 = document.querySelector(".target-abilities .invoker-ability#t4");
export const el_target5 = document.querySelector(".target-abilities .invoker-ability#t5");

// 技能图标
export const el_ability1 = document.querySelector(".invoker-abilities .invoker-ability#a1");
export const el_ability2 = document.querySelector(".invoker-abilities .invoker-ability#a2");
export const el_ability3 = document.querySelector(".invoker-abilities .invoker-ability#a3");
export const el_ability4 = document.querySelector(".invoker-abilities .invoker-ability#a4");
export const el_ability5 = document.querySelector(".invoker-abilities .invoker-ability#a5");
export const el_ability6 = document.querySelector(".invoker-abilities .invoker-ability#a6");
el_ability1.style.backgroundImage = `url(${baseUrlT(AbilityMap["Quas"].icon)})`;
el_ability2.style.backgroundImage = `url(${baseUrlT(AbilityMap["Wex"].icon)})`;
el_ability3.style.backgroundImage = `url(${baseUrlT(AbilityMap["Exort"].icon)})`;
el_ability4.style.backgroundImage = `url(${baseUrlT(AbilityMap["Invoke"].icon)})`;

// 技能说明页面
const el_invokerAbilitiesGuideButton = document.querySelector("#invoker-abilities-guide-button");
el_invokerAbilitiesGuideButton.style.cursor = `url(${baseUrlT("/vrfcracked/cursor/cursor_spell_default.png")}), pointer`;
const el_invokerAbilitiesGuide_container = document.querySelector("#invoker-abilities-guide");
Object.keys(AbilityMap).forEach((abilityName) => {
    const abilityObject = AbilityMap[abilityName];
    const abilityState = abilityObject.abilityState;
    if (!abilityState) return;
    const Quas_Num = Number.parseInt(abilityState.slice(4, 5));
    const Wex_Num = Number.parseInt(abilityState.slice(8, 9));
    const Exort_Num = Number.parseInt(abilityState.slice(14, 15));

    // Quas
    for (let i = 0; i < Quas_Num; i++) {
        const domElement = document.createElement("div");
        domElement.classList.add("invoker-ability");
        domElement.style.backgroundImage = `url(${baseUrlT(AbilityMap["Quas"].icon)})`;
        el_invokerAbilitiesGuide_container.appendChild(domElement);
    }

    // Wex
    for (let i = 0; i < Wex_Num; i++) {
        const domElement = document.createElement("div");
        domElement.classList.add("invoker-ability");
        domElement.style.backgroundImage = `url(${baseUrlT(AbilityMap["Wex"].icon)})`;
        el_invokerAbilitiesGuide_container.appendChild(domElement);
    }

    // Exort
    for (let i = 0; i < Exort_Num; i++) {
        const domElement = document.createElement("div");
        domElement.classList.add("invoker-ability");
        domElement.style.backgroundImage = `url(${baseUrlT(AbilityMap["Exort"].icon)})`;
        el_invokerAbilitiesGuide_container.appendChild(domElement);
    }

    // Invoked
    const domElement = document.createElement("div");
    domElement.classList.add("invoker-ability");
    domElement.style.backgroundImage = `url(${baseUrlT(abilityObject.icon)})`;
    el_invokerAbilitiesGuide_container.appendChild(domElement);
});

el_invokerAbilitiesGuideButton.addEventListener("click", () => {
    el_invokerAbilitiesGuide_container.classList.add("open");
});

el_viewportContainer.addEventListener("click", () => {
    if (el_invokerAbilitiesGuide_container.classList.contains("open")) {
        el_invokerAbilitiesGuide_container.classList.remove("open");
    }
});
