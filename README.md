# Invoker GrandMaster 卡尔宗师

塞卓昂的无尽战栗！  
米瑞特之阻碍！  
托纳鲁斯之爪！  
西梅尔的精华脉冲！  
迅猛作战之魔令！  
塔拉克的天坠之火！  
加拉隆的深渊之核！  
哈雷克之火葬魔咒！  
卡尔维因的至邪产物！  
科瑞克斯的杀戮之墙！  
布鲁冯特之无力声波！  

这个魔法令人失望。  
记忆有误。  
念错咒语了  
？我的注意力……分散了！  
咒语无效？  
真是浪费，被诅咒的法术。  
心神不宁。  
可悲至极。  
出师不利！  

苍天愚弄我！苍天愚弄我！苍天愚弄我！  
苍天愚弄我！苍天愚弄我！苍天愚弄我！  
苍天愚弄我！苍天愚弄我！苍天愚弄我！  

# 简介
对互联网上出现的KareTrainer软件(https://www.bilibili.com/video/BV1Z64y1M7wG)的web版移植, 该软件  
Web版的优点, 不需要通过网盘进行传播了, 更加实用

# 第一代尝试  
一个国人封装的WebGL框架clayGL, 基于他自己封装的框架做了一个项目 https://github.com/pissang/dota2hero/ 此项目加载dota2英雄模型  
因此图形化显示部分使用clayGL快速搭建  

案例链接:  
官方 `Dota2 item tool` 将模型/动画资源解包到Blender https://www.youtube.com/watch?v=Oyex10_9UUM  
blender导入smd, vdml等格式文件: https://www.bilibili.com/read/cv15706566  
blender插件下载地址: http://steamreview.org/BlenderSourceTools/  
官方创意工坊模型资源(卡尔模型) https://www.dota2.com/workshop/requirements/invoker?l=schinese  

涉及到的问题:  
卡尔的模型rootIndex有多个(modelRoot和orbRoot), 用他自己封装的 SMDLoader.js 读取的时候, 导致了问题 https://github.com/pissang/dota2hero/issues/9  

# 第二代尝试
使用VRF对起源引擎的 `pak[]_[].vpk` 文件进行整合并解包, 这个软件提供gltf格式导出功能  
VRF github首页: https://github.com/ValveResourceFormat/ValveResourceFormat  
VRF gitpages: https://valveresourceformat.github.io/  
使用VRF导出小松鼠的案例 https://www.youtube.com/watch?v=odZz7sNbqDo  

涉及到的问题: 
使用VRF导出的gltf时需要检查一下导出的gltf, 会出现骨骼与顶点组名字大小写不一致导致骨骼驱动定点组运动失败的问题  
我自己实验下来的hoodwink和invoker都出现了这个问题    

# 其他帮助链接
invoker 官网英雄介绍: https://www.dota2.com/hero/invoker  
自制英雄模型以addon形式加入dota2启动(其中有一部分对于dota2材质的认识) https://www.youtube.com/watch?v=RjSPY81cLmQ  
invoker 官网英雄介绍里的视频文件: https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/invoker.webm  
游戏内 invoker 出镜很多的视频片段: https://www.bilibili.com/video/BV1PA4y1R7bU/  
photoshop怎么用噪声制作电元素法球 https://jingyan.baidu.com/article/90895e0fb4b45464ec6b0bd3.html
photoshop怎么制作闪电帧动画 https://www.bilibili.com/video/BV1Sh4y1U78v
vite的glsl打包工具 https://gitee.com/lian_1998/vitejs_plugins
查询战队相关物品id https://www.dota2.com/majorsregistration/rosters

# 记录
在 2023年8月31日 (上线TI12敌法宝瓶)的非游戏性更新中其中一条 `游戏特效优化, 粒子光照优化`, 对卡尔的特效有以下优化(我的肉眼观察):
1. 去除卡尔冰元素法球中的高光点特效, 现在冰元素法球更白了, 并且边框有一点云层冷气的效果
2. 电元素法球不再是透明的了, 现在当改变视点与Y轴夹角时, 电元素法球内的颜色会从透明色到白色之间过渡插值
3. 元素法球的运动会有拖尾的轨迹
4. 切技能会在脚下生成法阵, 并且会有一个后处理的震荡效果
5. 切元素法球的时候手部会有一个震荡效果, 并且元素法球是从手的骨骼节点出现插值到对应骨骼位置的, 如果快速的切3次以上, 会放弃插值