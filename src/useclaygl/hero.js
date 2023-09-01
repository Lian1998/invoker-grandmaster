import { application, plugin, Vector3, Shader, util, animation } from 'claygl';
import readSMD from './readSMD';

import heroFrag from './shaders/hero.glsl?raw';
Shader.import(heroFrag);
const heroShader = new Shader(Shader.source('clay.standard.vertex'), Shader.source('hero.fragment'));

let animJsonGuide = undefined;
const clipsCache = new Map();

let sphere1, sphere2, sphere3, orb1, orb2, orb3;

export const app = application.create(document.querySelector('#viewport1'), {

    graphic: {
        shadow: true
    },

    init(app) {
        const heroName = 'invoker';
        const camera = app.createCamera([40, 20, 50], [0, 15, 0]);

        const dirLight = app.createDirectionalLight([-10, -10, -5]);
        dirLight.shadowResolution = 2048;
        dirLight.shadowBias = 0.005;

        app.createAmbientLight('#fff', 0.2);

        this._control = new plugin.OrbitControl({
            domElement: app.container,
            target: camera
        });

        return Promise.all([
            this._loadRocks(app),
            this._loadHero(app, heroName),
            this._loadAnimation(app, heroName)
        ]).then(result => {
            for (let skeleton of this._modelResult.skeletons) {
                skeleton.addClip(this._currentClip);
                app.timeline.addClip(this._currentClip);
            }
        });
    },

    _loadRocks(app) {
        return app.loadModel('/rock/rock.gltf').then(result => {
            let rockMaterial = app.createMaterial({
                shader: heroShader,
                diffuseMap: '/rock/badside_rocks001.png',
                maskMap2: '/rock/badside_rocks001_spec.png',
                textureFlipY: false
            });
            let rootNode = result.rootNode;
            rootNode.position.set(-5, 0, 0);
            rootNode.scale.set(8, 8, 8);

            for (let mesh of result.meshes) {
                mesh.geometry.generateTangents();
                mesh.material = rockMaterial;
            };
        });
    },

    // 加载英雄
    _loadHero(app, heroName) {
        const heroRootPath = 'heroes/' + heroName + '/';

        return Promise.all([
            app.loadModel(heroRootPath + heroName + '.gltf'),
            fetch(heroRootPath + 'materials.json').then(response => response.json()) // 这一部分会根据json文件解析材质信息
        ]).then(result => {
            const modelResult = result[0];
            const materialResult = result[1];

            console.log(modelResult.rootNode);
            modelResult.rootNode.scale.set(0.15, 0.15, 0.15);
            modelResult.rootNode.rotation.rotateX(-Math.PI / 2); // 卡尔模型有点问题, 需要旋转一下

            orb1 = new Vector3(-5, 32, -10)
            orb2 = new Vector3(-5, 30, 9)
            orb3 = new Vector3(5, 30, -11)

            sphere1 = app.createSphere({
                color: [1, 0, 0],
                transparent: true,
                alpha: 0.5
            });
            sphere2 = app.createSphere({
                color: [0, 1, 0],
                transparent: true,
                alpha: 0.5
            });
            sphere3 = app.createSphere({
                color: [0, 0, 1],
                transparent: true,
                alpha: 0.5
            });

            // Override the materials
            let newMaterials = {};
            for (let matName in materialResult) {
                let matConfig = Object.assign({
                    shader: heroShader,
                    textureFlipY: false
                }, materialResult[matName]);
                let newMat = app.createMaterial(matConfig);
                newMaterials[matName] = newMat;
            }
            for (let mesh of modelResult.meshes) {
                mesh.geometry.generateTangents();
                mesh.material = newMaterials[mesh.material.name];

                util.mesh.splitByJoints(mesh, 30, true);
                // mesh.material.define('fragment', 'RENDER_NORMAL');
            }

            this._modelResult = modelResult;
        });
    },

    _loadAnimation(app, heroName) {
        const heroRootPath = '/heroes/' + heroName + '/';
        if (!animJsonGuide) {
            return fetch(heroRootPath + 'animations.json')
                .then(response => response.json())
                .then(animations => {
                    animJsonGuide = animations;
                    const el = document.createElement('div');
                    el.id = 'animation-tool';
                    for (let clipname of Object.keys(animJsonGuide)) {
                        const btn = el.appendChild(document.createElement('button'));
                        btn.innerHTML = clipname;
                        btn.addEventListener('click', () => {
                            app.timeline.removeClipsAll();
                            this._loadClipByName(clipname).then(clip => {
                                console.log(clip);
                                for (let skeleton of this._modelResult.skeletons) {
                                    skeleton.removeClipsAll()
                                    skeleton.addClip(clip);
                                    app.timeline.addClip(clip);
                                }
                            });
                        })
                    }
                    document.body.appendChild(el);
                    return this._loadClipByName();
                });
        }
        else {
            return this._loadClipByName();
        }
    },

    _loadClipByName(clipName = 'idle') {
        const animObject = animJsonGuide[clipName][0];
        const animationPath = animObject.path;
        if (clipsCache.get(animationPath)) {
            this._currentClip = clipsCache.get(animationPath);
            return this._currentClip;
        }
        else {
            return fetch(animationPath)
                .then(response => response.text())
                .then(smdData => {
                    const clip = readSMD(smdData);
                    this._currentClip = clip;
                    clipsCache.set(animationPath, clip);
                    return clip;
                });
        }
    },

    loop(app) {
        this._control.update(app.frameTime);
        sphere1.position.copy(orb1);
        sphere2.position.copy(orb2);
        sphere3.position.copy(orb3);
    }
});