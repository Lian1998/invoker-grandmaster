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
            console.log(this.namespace + ':\n', ...str);
        }
    }

    info(...str: any[]) {
        if (DevLogger.loglevelsMap[this.loglevel] >= DevLogger.loglevelsMap['info']) {
            console.log(this.namespace + ':\n', ...str);
        }
    }

    warn(...str: any[]) {
        if (DevLogger.loglevelsMap[this.loglevel] >= DevLogger.loglevelsMap['warn']) {
            console.warn(this.namespace + ':\n', ...str);
        }
    }

    error(...str: any[]) {
        if (DevLogger.loglevelsMap[this.loglevel] >= DevLogger.loglevelsMap['error']) {
            console.error(this.namespace + ':\n', ...str);
        }
    }
}
