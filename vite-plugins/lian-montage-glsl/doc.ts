
import fs from 'node:fs';
import path from 'node:path';

let modulePath = '';
let modules = new Map<string, string>();

const resolveDependencies = (modulePath: string) => {
    // 假设文件中包含了 `#pragma glslify: <module-name>=require('<module-path>')` 的形式
    const content = fs.readFileSync(path.resolve(modulePath), 'utf8');
    const dependencies = content.match(/#pragma glslify:\s*([\w]+)=require\(['"](.+)['"]\)/g);

    if (dependencies) {
        dependencies.forEach((dependencyString) => {
            const [, dep_moduleName, dep_modulePath] = dependencyString.match(/([\w]+)=require\(['"](.+)['"]\)/);
            modules.set(dep_moduleName, dep_modulePath);
            resolveDependencies(dep_modulePath); // 递归解析依赖
        });
    }
}

// glsl打包的深思
// 面对复杂的光照模型时, glsl在前端的工程化是值得深思的
// 这个工程化的步骤可以由nodejs完成, 或者由浏览器脚本js实时完成, 我更倾向于前者
// 如果要在nodejs上开发一个支持vite热更新的glsl打包插件, 可以参考GLSLify

// GLSLify 是老牌的基于nodejs进行glsl模块静态构建的框架, 其导入导出的语法如下:
// #gragma [模块名]: [函数名] = import('[文件路径]');
// #gragma [模块名]: export([函数名]);
// 在静态打包过程中, 修改单文件export的函数名, 为函数名添加模块的uuid
// 这种方法有以下的缺点:
// 1. 这种静态替换依赖于 由javascript实现的glsl语法树, 在hmr时并不是十分高效的
// 2. 会使得打包出来的glsl文件模块失去语义, 使二次开发变得困难
// 模块名这个概念从设计角度上来讲并没有十分优秀


// 带着上述的问题, 此插件需求:
// 1. 一个单文件对应一个模块
// 2. 通过指令定义当前glsl单文件的模块名称 #montage modulename('glsl_noise_simplex_noise3D'); 便于后期修改函数名
// 3. 通过地址指定导入的单文件 #montage import('../shader/glsl-noise/simplex/');
// 4. 支持vite的hmr热更新功能

// 如何支持vite的hmr机制(vite的hmr机制是如何运行的)?
// 在 createServer 的时候, 通过 WebSocket 创建浏览器和服务器通信, 使用 chokidar 监听文件的改变, 当模块内容修改时, 发送消息通知客户端, 只对发生变更的模块重新加载
// 当监听到文件内容变化 change 时, 先执行 moduleGraph.onFileChange(file), 它会通过 invalidateModule() 修改模块的时间戳, 使其失效
// 接着执行 handleHMRUpdate 函数, 通过 moduleGraph.getModulesByFile(file), 获取需要更新的模块, 调用updateModules函数, 此时会对一些文件特殊处理, 比如是 .env 配置文件、html 文件等情况, ws发送full-reload, 页面刷新

// 此插件设计的hmr策略:
// glslmodule: import到js/ts代码中的glsl模块, 是被transform成为ModuleGraph里的ModuleNode的
// glslfile: 被glslmodule依赖的glsl碎片文件
// 在插件的transform钩子进行处理, 通过自定义的compile函数, 解析/递归处理glslfile依赖, 监听所有的glslfile并且在缓存中添加记录
// 在transform后, 这个根文件会作为一个ModuleNode存储到server.moduleGraph中
// 在createServer钩子中, 添加 chokidar 监听函数, 触发时从缓存中遍历出依赖该glslfile形成的glslmodule, 通过 moduleGraph.onFileChange 打上文件失效标记