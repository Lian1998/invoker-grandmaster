import { Loader, Quaternion, Vector3, Matrix4, AnimationClip, FileLoader, VectorKeyframeTrack, QuaternionKeyframeTrack, Euler } from 'three';

const Rneg90ByAxX_Mat = new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), -Math.PI / 2);
const Rneg90ByAxY_Mat = new Matrix4().makeRotationAxis(new Vector3(0, 1, 0), -Math.PI / 2);
// const neg90ByAxX_Mat1 = new Matrix4().set(
//     1, 0, 0, 0,
//     0, Math.cos(-Math.PI / 2), -Math.sin(-Math.PI / 2), 0,
//     0, Math.sin(-Math.PI / 2), Math.cos(-Math.PI / 2), 0,
//     0, 0, 0, 1
// );
// console.log('neg90ByAxX_Mat1', neg90ByAxX_Mat1);

class SMDLoader extends Loader {

    load(url, onLoad, onProgress, onError) {
        const scope = this;
        const loader = new FileLoader(this.manager);
        loader.setPath(this.path);
        // loader.setResponseType('arraybuffer');
        // loader.setWithCredentials(this.withCredentials);

        // 调用loadingManager.load请求加载文件
        loader.load(url, function (text) {
            try {
                onLoad(scope.parse(text));
            } catch (e) {
                if (onError) {
                    onError(e);
                } else {
                    console.error(e);
                }
                scope.manager.itemError(url);
            }
        }, onProgress, onError);
    }

    parse(buffer) {


        const rootIndexs = [];
        let currentHandler = null;
        let currentFrame = 0;

        // name parent
        const joints = [];

        const tracks_arrmap = new Map();
        const mat4 = new Matrix4();
        const pos = new Vector3();
        const quat = new Quaternion();
        const scale = new Vector3(1, 1, 1);

        function handleJoint(line) {
            let items = line.split(/\s+/);
            if (items.length > 3) {
                items = [items[0], items.slice(1, items.length - 1).join(' '), items[items.length - 1]];
            }
            if (items.length === 3) {
                let idx = parseInt(items[0]);
                let name = items[1].replace(/"/g, '');
                const parentIdx = parseInt(items[2]);
                if (parentIdx === -1) { rootIndexs.push(idx); }
                joints[idx] = name;
            }
        }

        function handleAnimation(line) {
            const items = line.split(/\s+/);
            if (items[0] === 'time') { currentFrame = parseInt(items[1]); }

            // 信息行
            else if (items.length === 7) {
                const idx = parseInt(items[0]);
                const jointName = joints[idx];

                // 如果该名字还没有生成轨道信息数组, 添加该名字的轨道信息数组
                if (!tracks_arrmap.has(jointName)) {
                    // time, position, quaternion
                    tracks_arrmap.set(jointName, [[], [], []]);
                }

                pos.set(parseFloat(items[1]), parseFloat(items[2]), parseFloat(items[3]));
                quat.setFromEuler(new Euler(parseFloat(items[4]), parseFloat(items[5]), parseFloat(items[6]), 'ZYX')); // why z first ????

                // Z-up to Y-up
                if (rootIndexs.length && rootIndexs.includes(idx)) {

                    // 使用矩阵计算
                    mat4.compose(pos, quat, scale);

                    // 左乘
                    mat4.premultiply(Rneg90ByAxX_Mat);
                    mat4.premultiply(Rneg90ByAxY_Mat);

                    // 分解
                    mat4.decompose(pos, quat, scale);
                }

                const track = tracks_arrmap.get(jointName);
                track[0].push(currentFrame);
                track[1].push(pos.x, pos.y, pos.z);
                track[2].push(quat.x, quat.y, quat.z, quat.w);
            }
        }


        // 解析
        const lines = buffer.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // 判断行
            switch (line) {
                case 'nodes':
                    currentHandler = handleJoint;
                    break;
                case 'skeleton':
                    currentHandler = handleAnimation;
                    break;
                case 'end':
                    currentHandler = null;
                    break;
                default:
                    if (currentHandler) { currentHandler(line); }
            }
        }

        const keyframeTracks = [];

        for (const jointName of tracks_arrmap.keys()) {

            // [[],[],[]] time, position, quaternion
            const jointValues = tracks_arrmap.get(jointName);

            keyframeTracks.push(new VectorKeyframeTrack(`${jointName}.position`, jointValues[0], jointValues[1]));
            keyframeTracks.push(new QuaternionKeyframeTrack(`${jointName}.quaternion`, jointValues[0], jointValues[2]));
        }

        const animationClip = new AnimationClip('idle', -1, keyframeTracks);

        return animationClip;
    }

}


export { SMDLoader }