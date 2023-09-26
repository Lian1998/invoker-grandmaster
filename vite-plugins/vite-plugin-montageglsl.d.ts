import type { Plugin } from 'vite';
interface Options {
}
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
export default function VitePluginMontageGLSL(options?: Options): Plugin;
export {};
//# sourceMappingURL=vite-plugin-montageglsl.d.ts.map