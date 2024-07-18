# Invoker GrandMaster 卡尔宗师
塞卓昂的无尽战栗!  
米瑞特之阻碍!  
托纳鲁斯之爪!  
西梅尔的精华脉冲!  
迅猛作战之魔令!  
塔拉克的天坠之火!  
加拉隆的深渊之核!  
哈雷克之火葬魔咒!  
卡尔维因的至邪产物!  
科瑞克斯的杀戮之墙!  
布鲁冯特之无力声波!  

这个魔法令人失望.  
记忆有误.  
念错咒语了  
?我的注意力……分散了!  
咒语无效?  
真是浪费，被诅咒的法术.  
心神不宁.  
可悲至极.  
出师不利!  

苍天愚弄我!苍天愚弄我!苍天愚弄我!  
苍天愚弄我!苍天愚弄我!苍天愚弄我!  
苍天愚弄我!苍天愚弄我!苍天愚弄我!  

# 简介
对互联网上出现的KareTrainer软件(https://www.bilibili.com/video/BV1Z64y1M7wG)的web版移植, 该软件  
Web版的优点, 不需要通过网盘进行传播了, 更加实用

# 第一代尝试
使用clayGL https://github.com/pissang/claygl 并参考项目 https://github.com/pissang/dota2hero/ 做了初步尝试, 在网页端渲染卡尔模型;  
模型资源准备相关案例链接:  
1. 使用V社官方开发工具`Dota2 item tool`将模型/动画资源解包到Blender https://www.youtube.com/watch?v=Oyex10_9UUM  
2. 在`Blender`中导入`.smd`/`vdml`格式文件 https://www.bilibili.com/read/cv15706566  
   1. `Blender`插件下载地址: http://steamreview.org/BlenderSourceTools/  
   2. 创意工坊模型资源(卡尔模型) https://www.dota2.com/workshop/requirements/invoker?l=schinese  

第一代尝试遇到的问题:  
由于卡尔的模型比较特殊, 其三个球与模型都有Root骨骼, 使用作者封装的`SMDLoader.js`读取时, 导致了动画解包的问题  
https://github.com/pissang/dota2hero/issues/9  

# 第二代尝试
1. 使用VRF对起源引擎的 `pak[]_[].vpk` 文件进行整合并解包, 这个软件提供gltf格式导出功能  
   1. VRF github首页: https://github.com/ValveResourceFormat/ValveResourceFormat  
   2. VRF gitpages: https://valveresourceformat.github.io/  
   3. 使用VRF导出小松鼠的案例 https://www.youtube.com/watch?v=odZz7sNbqDo  

使用VRF导出的gltf时需要检查一下导出的gltf, 部分模型会出现`骨骼名称`与`顶点组名称`大小写不一致, 导致大小写不一致的骨骼无法驱动顶点组运动的问题  
ps: 我自己实验下来的`hoodwink(小松鼠)`和`invoker(卡尔)`都出现了这个问题  

# 一些帮助链接
1. invoker 官网英雄介绍: https://www.dota2.com/hero/invoker  
2. 自制英雄模型以addon包的形式加入dota2启动文件(其中有一部分对于dota2材质的认识) https://www.youtube.com/watch?v=RjSPY81cLmQ  
3. invoker 官网英雄介绍里的视频文件: https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/invoker.webm  
4. 游戏内 invoker 出镜很多的视频片段: https://www.bilibili.com/video/BV1PA4y1R7bU/  
5. photoshop怎么用噪声制作电元素法球 https://jingyan.baidu.com/article/90895e0fb4b45464ec6b0bd3.html  
6. photoshop怎么制作闪电帧动画 https://www.bilibili.com/video/BV1Sh4y1U78v  
7. vite的glsl打包工具 https://gitee.com/lian_1998/vitejs_plugins  
8. 查询战队相关物品id https://www.dota2.com/majorsregistration/rosters  

# 开发日志
在`2023年8月31日的非游戏性更新(TI12敌法宝瓶)`描述中其中一条 `游戏特效优化, 粒子光照优化`, 对卡尔的特效有以下优化(源于肉眼观察):
1. 去除卡尔冰元素法球中的高光点特效, 现在冰元素法球更白了, 并且边框有一点云层冷气的效果
2. 电元素法球不再是透明的了, 现在当改变视点与Y轴夹角时, 电元素法球内的颜色会从透明色到白色之间过渡插值
3. 元素法球的运动会有拖尾的轨迹
4. 切技能会在脚下生成法阵, 并且会有一个后处理的震荡效果
5. 切元素法球的时候手部会有一个震荡效果, 并且元素法球是从手的骨骼节点出现插值到对应骨骼位置的, 如果快速的切3次以上, 会放弃插值