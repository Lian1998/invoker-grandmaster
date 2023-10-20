import { green, cyan, bold } from 'kolorist';
import { normalizePath } from 'vite';
import { readFileSync } from 'fs';
import * as path from 'path';
const pluginName = 'vite-plugin-montageglsl';
const fileRegex = /\.(glsl$)|(frag$)|(vert$)|(vs$)|(fs$)/;
const defaultOption = {};
const montage_modulename_test = /^(\#montage modulename\([\'|\"]){1}/g;
const montage_modulename_exec = /modulename\([\'|\"]((.)*)?[\'|\"]\)/g;
const montage_import_test = /^(\#montage import\([\'|\"]){1}/g;
const montage_import_path_exec = /import\([\'|\"]((.)*)?[\'|\"]\)/g;
// 编译文件形成的依赖映射缓存 
const file2Module = new Map(); // 键: module的filePath 值: module依赖文件的filePath
/**
 * 压缩glsl代码
 * Based on https://github.com/vwochnik/rollup-plugin-glsl
 * Modified to remove multiline comments. See #16
 * @param code {string}
 */
const compressShader = (code) => {
    let needNewline = false;
    return code.replace(/\\(?:\r\n|\n\r|\n|\r)|\/\*.*?\*\/|\/\/(?:\\(?:\r\n|\n\r|\n|\r)|[^\n\r])*/gs, '').split(/\n+/).reduce((result, line) => {
        line = line.trim().replace(/\s{2,}|\t/, ' '); // lgtm[js/incomplete-sanitization]
        if (line.charAt(0) === '#') {
            if (needNewline) {
                result.push('\n');
            }
            result.push(line, '\n');
            needNewline = false;
        }
        else {
            result.push(line.replace(/\s*({|}|=|\*|,|\+|\/|>|<|&|\||\[|\]|\(|\)|-|!|;)\s*/g, '$1'));
            needNewline = true;
        }
        return result;
    }, []).join('').replace(/\n+/g, '\n');
};
/**
 * 将文件编译成glsl字符串
 * @param {string} src 文件内容
 * @param {string} id 文件id, 一般就是文件的路径
 * @param {ResolvedConfig} config vite解析后的配置
 */
const compileFileToGLSLString = (src, id, config, server, glslmodulePath) => {
    const lines = src.split((/\r\n|\r|\n/g)); // 将字符串内容切成行
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // 判断当前行是否存在 `#montage import('')` 指令
        if (line.length > 0 && new RegExp(montage_import_test).test(line)) {
            // 通过正则匹配取出url
            const regarr = new RegExp(montage_import_path_exec).exec(line);
            if (!regarr[1]) {
                continue;
            }
            let glslfile_importurl = regarr[1];
            // 使用resolvedConfig的alia(别名)配置
            let glslfile_path = ''; // 最终计算出来的glsl文件在系统的绝对路径
            const viteAliaObject = config.resolve.alias.find(item => {
                // 如果别名配置的是一个字符串
                if (typeof item.find === 'string') {
                    return glslfile_importurl.startsWith(item.find);
                }
                // 如果别名配置的是一个正则表达式
                else if (typeof item.find === 'object') {
                    const exp = new RegExp(item.find, 'g');
                    return exp.test(glslfile_importurl);
                }
                return false; // 匹配不到路径
            });
            if (!viteAliaObject) {
                glslfile_path = normalizePath(path.join(id, '../', glslfile_importurl));
            } // 没有使用别名系统, 即相对路径
            else {
                glslfile_path = normalizePath(glslfile_importurl.replace(viteAliaObject.find, viteAliaObject.replacement));
            } // 使用了别名系统, 直接替换
            if (!glslfile_path)
                continue;
            // 读取文件信息
            const fileContent = readFileSync(glslfile_path).toString();
            // 递归获取文件进一步解析的内容
            const src = compileFileToGLSLString(fileContent, glslfile_path, config, server, glslmodulePath);
            lines[i] = src;
            // 存依赖缓存
            const modules = file2Module.get(glslfile_path);
            if (!modules) {
                file2Module.set(glslfile_path, [glslmodulePath]);
            }
            else { // 这个子文件作为多个module的基础文件
                if (!modules.find(item => item === glslmodulePath)) { // 如果没有找到这次的module
                    modules.push(glslmodulePath);
                }
            }
            // 添加文件监听
            if (server && server.watcher) {
                server.watcher.add(glslfile_path);
            }
        }
    }
    // 拼接文件内容并输出
    const res_src = lines.map(line => {
        if (!line.endsWith('\r\n')) {
            return line + '\r\n';
        }
        else {
            return line;
        }
    }).join('');
    return res_src;
};
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
export default function VitePluginMontageGLSL(options) {
    let currentCommand = 'serve';
    let configPointer = null;
    let configServerPointer = null;
    let timer = null;
    const clear = () => { clearTimeout(timer); };
    const schedule = (fn) => {
        clear();
        timer = setTimeout(fn, 200);
    };
    return {
        name: pluginName,
        /** 在ResolvedConfig钩子进行插件option合并 */
        configResolved(config) {
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
            configServerPointer = server;
            if (server && server.watcher) {
                server.watcher.on('change', (file) => {
                    schedule(() => {
                        // 查看当前moduleGraph中是否包含了glslmodule
                        // const glslRootModulePath = Array.from(server.moduleGraph.safeModulesPath).find(item => item.indexOf('test.glsl') !== -1);
                        // 'D:/Repos/www.gitee.com/Lian1998/vitejs_plugins/test-example/shader/test.glsl'
                        // const module = server.moduleGraph.getModuleById(glslRootModulePath);
                        const modules = file2Module.get(normalizePath(file));
                        if (!modules || !modules.length)
                            return; // 如果没有找到这个module, 直接return掉
                        for (let i = 0; i < modules.length; i++) {
                            const glslRootModulePath = modules[i];
                            server.moduleGraph.onFileChange(glslRootModulePath); // 打标记证明这个文件被更新过
                        }
                        server.ws.send({ type: 'full-reload' });
                        // 页面已经强制刷新了, 清除glsl文件的依赖关系
                        file2Module.clear();
                    });
                });
            }
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
                let glslraw = compileFileToGLSLString(src, id, configPointer, configServerPointer, glslmodulePath);
                // 如果是打包模式, 压缩一下glsl代码
                if (currentCommand === 'build') {
                    glslraw = compressShader(glslraw);
                }
                console.info(`  ${green('➜')}  ${cyan(pluginName)}: Watching GLSL ModuleNode ${bold(glslmodulePath)}`);
                return {
                    code: `export default ${JSON.stringify(glslraw)}`,
                    map: { mappings: '' }, // 如果可行将提供 source map
                };
                // 在这个id作为一个import被transform之后, 会在moduleGraph中形成一个这个id对应的moduleNode
            }
        },
    };
}
//# sourceMappingURL=vite-plugin-montageglsl.js.map