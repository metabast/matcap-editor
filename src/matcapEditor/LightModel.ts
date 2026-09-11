import { Matrix4, PointLight, RectAreaLight, SpotLight, Vector2, Vector3 } from 'three';
import type { LightModelPositions } from '@/ts/types/PanesTypes';

type LightType = PointLight | RectAreaLight | SpotLight;

class LightModel {
    private _light: LightType;

    private _screenPosition: Vector2 = new Vector2();

    private _distance: number;

    private _sphereFaceNormal: Vector3;

    private _positionOnSphere: Vector3;

    private _positionTarget: Vector3 = new Vector3(0, 0, 0);

    private _lookAtTarget: boolean;

    private _front: boolean;

    private _oldPositions: LightModelPositions;

    constructor() {
        this._lookAtTarget = true;
        this._front = true;
    }

    get light(): LightType {
        return this._light;
    }

    set light(value: LightType) {
        this._light = value;
        this.update();
    }

    get screenPosition(): Vector2 {
        return this._screenPosition;
    }

    set screenPosition(value: Vector2) {
        this._screenPosition = value;
    }

    get distance(): number {
        return this._distance;
    }

    set distance(value: number) {
        this._distance = value;
    }

    get sphereFaceNormal(): Vector3 {
        return this._sphereFaceNormal;
    }

    set sphereFaceNormal(value: Vector3) {
        this._sphereFaceNormal = value;
    }

    get positionOnSphere(): Vector3 {
        return this._positionOnSphere;
    }

    set positionOnSphere(value: Vector3) {
        this._positionOnSphere = value;
    }

    get positionTarget(): Vector3 {
        return this._positionTarget;
    }

    set positionTarget(value: Vector3) {
        this._positionTarget = value;
        if (this._lookAtTarget) {
            this._light.lookAt(this._positionTarget);
        }
    }

    set positionTargetX(value: number) {
        this._positionTarget.x = value;
        if (this._lookAtTarget) {
            this._light.lookAt(this._positionTarget);
        }
    }

    set positionTargetY(value: number) {
        this._positionTarget.y = value;
        if (this._lookAtTarget) {
            this._light.lookAt(this._positionTarget);
        }
    }

    set positionTargetZ(value: number) {
        this._positionTarget.z = value;
        if (this._lookAtTarget) {
            this._light.lookAt(this._positionTarget);
        }
    }

    get lookAtTarget(): boolean {
        return this._lookAtTarget;
    }

    set lookAtTarget(value: boolean) {
        this._lookAtTarget = value;
        if (value) {
            this._light.lookAt(this._positionTarget);
        } else {
            this._light.rotation.set(0, 0, 0);
        }
    }

    get front(): boolean {
        return this._front;
    }

    set front(value: boolean) {
        this._front = value;
        if (this.front) this.setPositionZ(this.light.position.z);
        else this.setPositionZ(-this.light.position.z);
    }

    get oldPositions(): LightModelPositions {
        return this._oldPositions;
    }

    get positions(): LightModelPositions {
        return {
            screenPosition: this.screenPosition.clone(),
            position: this.light.position.clone(),
        };
    }

    setPositionX(value: number) {
        this._light.position.x = value;
    }

    setPositionY(value: number) {
        this._light.position.y = value;
    }

    setPositionZ(value: number) {
        this._light.position.z = value;
    }

    update() {
        if (this._lookAtTarget) {
            this._light.lookAt(this._positionTarget);
        }
    }

    pickCurrentPositions() {
        this._oldPositions = {
            screenPosition: this.screenPosition.clone(),
            position: this.light.position.clone(),
        };
    }

    dispose() {
        if (this._light.parent) this._light.parent.remove(this._light);
        this._light.dispose();
    }

    static updateLightDistance = (lightModel: LightModel): void => {
        const lightPosition = lightModel.positionOnSphere.clone();
        lightPosition.add(lightModel.sphereFaceNormal.clone().multiplyScalar(lightModel.distance));
        lightModel.setPositionX(lightPosition.x);
        lightModel.setPositionY(lightPosition.y);

        if (lightModel.front) lightModel.setPositionZ(lightPosition.z);
        else lightModel.setPositionZ(-lightPosition.z);
    };

    static createFromSerialized = (serializedModel: any): LightModel => {
        const lightModel = new LightModel();

        switch (serializedModel._light.object.type) {
            case 'RectAreaLight':
                lightModel.light = new RectAreaLight(
                    serializedModel._light.object.color,
                    serializedModel._light.object.intensity,
                    serializedModel._light.object.width,
                    serializedModel._light.object.height,
                );
                lightModel.light.applyMatrix4(new Matrix4().fromArray(serializedModel._light.object.matrix));
                lightModel.light.uuid = serializedModel._light.object.uuid;
                break;
        }

        lightModel.screenPosition.set(serializedModel._screenPosition.x, serializedModel._screenPosition.y);
        lightModel.positionOnSphere = new Vector3(
            serializedModel._positionOnSphere.x,
            serializedModel._positionOnSphere.y,
            serializedModel._positionOnSphere.z,
        );
        lightModel.sphereFaceNormal = new Vector3(
            serializedModel._sphereFaceNormal.x,
            serializedModel._sphereFaceNormal.y,
            serializedModel._sphereFaceNormal.z,
        );
        lightModel.distance = serializedModel._distance;
        lightModel.front = serializedModel._front;
        LightModel.updateLightDistance(lightModel);
        lightModel.positionTarget = new Vector3(
            serializedModel._positionTarget.x,
            serializedModel._positionTarget.y,
            serializedModel._positionTarget.z,
        );
        lightModel.lookAtTarget = serializedModel._lookAtTarget;
        lightModel.update();

        return lightModel;
    };
}

export default LightModel;
