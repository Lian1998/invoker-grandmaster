
/**
 * 压缩glsl代码
 * Based on https://github.com/vwochnik/rollup-plugin-glsl
 * Modified to remove multiline comments. See #16
 * @param code {string}
 */
export const compressShader = (code: string) => {
    let needNewline = false;
    return code.replace(/\\(?:\r\n|\n\r|\n|\r)|\/\*.*?\*\/|\/\/(?:\\(?:\r\n|\n\r|\n|\r)|[^\n\r])*/gs, '').split(/\n+/).reduce((result, line) => {
        line = line.trim().replace(/\s{2,}|\t/, ' '); // lgtm[js/incomplete-sanitization]
        if (line.charAt(0) === '#') {
            if (needNewline) { result.push('\n'); }
            result.push(line, '\n');
            needNewline = false;
        } else {
            result.push(line.replace(/\s*({|}|=|\*|,|\+|\/|>|<|&|\||\[|\]|\(|\)|-|!|;)\s*/g, '$1'));
            needNewline = true;
        }
        return result;
    }, []).join('').replace(/\n+/g, '\n');
}