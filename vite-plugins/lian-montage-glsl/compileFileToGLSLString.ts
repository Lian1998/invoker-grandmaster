
import type { ResolvedConfig, ViteDevServer } from 'vite';
import { normalizePath } from 'vite';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { file2Module } from './index';

const montage_modulename_test = /^(\#montage modulename\([\'|\"]){1}/g;
const montage_modulename_exec = /modulename\([\'|\"]((.)*)?[\'|\"]\)/g;
const montage_import_test = /^(\#montage import\([\'|\"]){1}/g;
const montage_import_path_exec = /import\([\'|\"]((.)*)?[\'|\"]\)/g;

/**
 * 将文件编译成glsl字符串
 * @param {string} src 文件内容
 * @param {string} id 文件id, 一般就是文件的路径
 * @param {ResolvedConfig} config vite解析后的配置
 */
export const compileFileToGLSLString = (src: string, id: string, config: ResolvedConfig, server: ViteDevServer, glslmodulePath: string): string => {

    const lines = src.split((/\r\n|\r|\n/g)); // 将字符串内容切成行
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 判断当前行是否存在 `#montage import('')` 指令
        if (line.length > 0 && new RegExp(montage_import_test).test(line)) {

            // 通过正则匹配取出url
            const regarr = new RegExp(montage_import_path_exec).exec(line);
            if (!regarr[1]) { continue; }
            let glslfile_importurl = regarr[1];

            // 使用resolvedConfig的alia(别名)配置
            let glslfile_path = ''; // 最终计算出来的glsl文件在系统的绝对路径
            const viteAliaObject = config.resolve.alias.find(item => {
                // 如果别名配置的是一个字符串
                if (typeof item.find === 'string') { return glslfile_importurl.startsWith(item.find); }
                // 如果别名配置的是一个正则表达式
                else if (typeof item.find === 'object') {
                    const exp = new RegExp(item.find, 'g');
                    return exp.test(glslfile_importurl);
                }
                return false; // 匹配不到路径
            });
            if (!viteAliaObject) { glslfile_path = normalizePath(path.join(id, '../', glslfile_importurl)); } // 没有使用别名系统, 即相对路径
            else { glslfile_path = normalizePath(glslfile_importurl.replace(viteAliaObject.find, viteAliaObject.replacement)); } // 使用了别名系统, 直接替换


            if (!glslfile_path) { continue; }

            // 读取文件信息
            const fileContent = readFileSync(glslfile_path).toString();

            // 递归获取文件进一步解析的内容
            const src = compileFileToGLSLString(fileContent, glslfile_path, config, server, glslmodulePath);
            lines[i] = src;

            // 存依赖缓存
            const modules = file2Module.get(glslfile_path);
            if (!modules) { file2Module.set(glslfile_path, [glslmodulePath]); }
            else { // 这个子文件作为多个module的基础文件
                if (!modules.find(item => item === glslmodulePath)) { // 如果没有找到这次的module
                    modules.push(glslmodulePath);
                }
            }

            // 如果启动了开发服务器, 需要添加该文件的监听
            if (server) { server.watcher.add(glslfile_path); }
        }
    }

    // 拼接文件内容并输出
    const res_src = lines.map(line => {
        if (!line.endsWith('\r\n')) { return line + '\r\n'; }
        else { return line; }
    }).join('');
    return res_src;
}