module.exports = {
    
    // 单文件排除/引用
    requirePragma: false,       // 是否只校验包含头注释文件
    insertPragma: false,        // 是否插入头注释

    // 格式化配置
    experimentalTernaries: false,   // 优化三元表达式
    printWidth: 600,            // 行长度
    tabWidth: 4,                // tabSize
    useTabs: false,             // tab时使用tabs还是空格
    semi: true,                 // 句子结尾使用分号
    singleQuote: false,         // 使用单引号
    quoteProps: "as-needed",    // 对象属性名是否需要添加引号
    trailingComma: "all",       // 数组/对象拖尾的那个元素是否尽可能使用逗号
    bracketSpacing: true,       // 对象/数组/括号/文字 前后插入空格 "{ foo: bar }"
    bracketSameLine: true,      // 是否把标签的闭合标签单独放在下一行
    arrowParens: "always",      // 箭头函数如果只有一个参数可以省略括号, 是否全部强制其加括号
    rangeStart: 0,              // 仅格式化文件的片段, 头
    rangeEnd: Infinity,         // 仅格式化文件的片段, 尾
    // parser: "babylon",       // [Removed] AST解析器
    proseWrap: "never",         // 非代码长文本的空白处理, 如html中写了大量文字
    htmlWhitespaceSensitivity: "strict",    // 对Html中空格的处理, strict意味着不会无故删除空格
    endOfLine: "lf",            // (各操作系统影响)行尾标识符

    // 格式化配置: 扩展语言
    jsxSingleQuote: false,                  // 使用单引号
    // jsxBracketSameLine: true,            // [Deprecated] 是否把标签的闭合标签单独放在下一行
    vueIndentScriptAndStyle: false,         // Vue文件的script和style标签缩进
    embeddedLanguageFormatting: "auto",     // 扩展语言文件的格式化策略, auto尝试, off关闭
    singleAttributePerLine: false,          // jsx属性是否独占一行
    
};