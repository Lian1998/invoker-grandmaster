import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { normalizePath } from 'vite';

import { compileFileToGLSLString } from './compileFileToGLSLString';
import { compressShader } from './compressShader';

interface Options { }
const pluginName = 'lian-montage-glsl';
const fileRegex = /\.(glsl$)|(frag$)|(vert$)|(vs$)|(fs$)/;
const defaultOption: Options = {};

// 编译文件形成的依赖映射缓存 
export const file2Module = new Map<string, string[]>(); // 键: module的filePath 值: module依赖文件的filePath


/**
 * 这是一个基于静态资源构建svg文件的插件
 * 意味着被配置中目录地址管理的文件夹下的所有svg文件都会被引入到打包工程中
 * 在开发模式下, 将直接改变`index.html`, 在根标签下插入 svg => symbols
 * 在构建模式下, 打包成一个通用js模块向html动态插入标签
 * 
 * 1. 启动时读取指定配置目录下所有的 `.svg` 文件
 * 2. 将svg文件转化为`<symbol>`标签字符串, 并按照规则为每个`<symbol>`生成一个id
 * 
 * @param options {Options}
 * @returns Plugin {Plugin}
 */
export default function LianMontageGLSL(options?: Options): Plugin {

    let currentCommand = 'serve';
    let configPointer: ResolvedConfig = undefined;
    let serverPointer: ViteDevServer = undefined;

    let timer = null;
    const clear = () => { clearTimeout(timer); }
    const schedule = (fn: () => void) => {
        clear();
        timer = setTimeout(fn, 200) as any as number;
    }

    return {
        name: pluginName,

        /** 在ResolvedConfig钩子进行插件option合并 */
        configResolved(config: ResolvedConfig) {
            currentCommand = config.command;
            configPointer = config;

            if (options) {
                Object.assign(defaultOption, options); // 合并当前插件配置
            }
        },

        /**
         * vite特有钩子, 当开发服务器生成时
         * https://cn.vitejs.dev/guide/api-plugin.html#configureserver
         * @param server 生成的开发服务器
         */
        configureServer(server) {
            serverPointer = server;

            server.watcher.on('change', (file: string) => {

                schedule(() => {

                    // 查看当前moduleGraph中是否包含了glslmodule
                    // const glslRootModulePath = Array.from(server.moduleGraph.safeModulesPath).find(item => item.indexOf('test.glsl') !== -1);
                    // 'D:/Repos/www.gitee.com/Lian1998/vitejs_plugins/test-example/shader/test.glsl'
                    // const module = server.moduleGraph.getModuleById(glslRootModulePath);

                    const modules = file2Module.get(normalizePath(file));
                    if (!modules || !modules.length) return; // 如果没有找到这个module, 直接return掉

                    for (let i = 0; i < modules.length; i++) {
                        const glslRootModulePath = modules[i];
                        server.moduleGraph.onFileChange(glslRootModulePath); // 打标记证明这个文件被更新过
                    }

                    server.ws.send({ type: 'full-reload' });
                    // 页面已经强制刷新了, 清除glsl文件的依赖关系
                    file2Module.clear();
                });
            });
        },

        /**
         * rollup文件解析钩子
         * https://cn.rollupjs.org/plugin-development/#transform
         * @param src 文件内容
         * @param id moduleGraph的id
         */
        transform(src, id) {

            if (fileRegex.test(id)) {
                const glslmodulePath = id;
                let glslraw = compileFileToGLSLString(src, id, configPointer, serverPointer, glslmodulePath);

                // 如果是打包模式, 压缩一下glsl代码
                if (currentCommand === 'build') {
                    glslraw = compressShader(glslraw);
                }

                return {
                    code: `export default ${JSON.stringify(glslraw)}`,
                    map: { mappings: '' }, // 如果可行将提供 source map
                }

                // 在这个id作为一个import被transform之后, 会在moduleGraph中形成一个这个id对应的moduleNode
            }
        },

    }

}