
import { DevLogger } from '@src/DevLogger.ts';

export const logger = new DevLogger('Invoker GrandMaster WebGLPart');

// 判断vite执行当前命令时候所resolved的mode
if (import.meta.env.MODE === 'development') { logger.loglevel = 'debug'; }
else { logger.loglevel = 'warn'; }