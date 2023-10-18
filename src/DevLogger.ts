export class DevLogger {

    static loglevelsMap = { 'error': 1, 'warn': 2, 'info': 3, 'debug': 4 };

    namespace = '';
    loglevel = 'error'

    constructor(namespace: string, loglevel = 'debug') {
        this.namespace = namespace;
        this.loglevel = loglevel;
    }

    debug(...str: any[]) {
        if (DevLogger.loglevelsMap[this.loglevel] >= DevLogger.loglevelsMap['debug']) {
            console.log(`%c ${this.namespace}:\n`, 'color: #909399', ...str);
        }
    }

    info(...str: any[]) {
        if (DevLogger.loglevelsMap[this.loglevel] >= DevLogger.loglevelsMap['info']) {
            console.log(`%c ${this.namespace}:\n`, 'color: #409EFF', ...str);
        }
    }

    warn(...str: any[]) {
        if (DevLogger.loglevelsMap[this.loglevel] >= DevLogger.loglevelsMap['warn']) {
            console.log(`%c ${this.namespace}:\n`, 'color: #E6A23C', ...str);
        }
    }

    error(...str: any[]) {
        if (DevLogger.loglevelsMap[this.loglevel] >= DevLogger.loglevelsMap['error']) {
            console.log(`%c ${this.namespace}:\n`, 'color: #F56C6C', ...str);
        }
    }
}
