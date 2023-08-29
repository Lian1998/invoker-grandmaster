import { Loader, Quaternion, Vector3, Matrix4, AnimationClip, FileLoader, VectorKeyframeTrack, QuaternionKeyframeTrack } from 'three';

const neg90ByAxX_Mat = new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), - Math.PI / 2);

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


        let rootIndex = -1;
        let currentHandler = null;
        let currentFrame = 0;

        const joints = [];

        const tracks_arrmap = new Map();
        const mat4 = new Matrix4();
        const pos = new Vector3();
        const quat = new Quaternion();

        function handleJoint(line) {
            const items = line.split(/\s+/);
            if (items.length > 3) {
                items = [items[0], items.slice(1, items.length - 1).join(' '), items[items.length - 1]];
            }
            if (items.length === 3) {
                let idx = parseInt(items[0]);
                let name = items[1].replace(/"/g, '');
                let parentIdx = parseInt(items[2]);
                if (parentIdx === -1) { rootIndex = idx; }
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
                if (!tracks_arrmap.has(jointName)) {
                    // time, position, quaternion
                    tracks_arrmap.set(jointName, [[], [], []]);
                }

                pos.set(parseFloat(items[1]), parseFloat(items[2]), parseFloat(items[3]));
                quat.set(parseFloat(items[4]), parseFloat(items[5]), parseFloat(items[6])); // why z first ????

                // Z-up to Y-up
                if (idx === rootIndex) {
                    mat4.identity();

                    mat4.setPosition(pos);
                    mat4.makeRotationFromQuaternion(quat);

                    mat4.premultiply(neg90ByAxX_Mat);

                    pos.setFromMatrixPosition(mat4);
                    quat.setFromRotationMatrix(mat4);
                }

                const track = tracks_arrmap.get(jointName);
                track[0].push(currentFrame * 30);
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
        const animationClip = new AnimationClip('idle', 1, keyframeTracks);
        return animationClip;
    }

}


export { SMDLoader }