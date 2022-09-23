import { PointLight, RectAreaLight, SpotLight, Vector2, Vector3 } from 'three';

type LightType = PointLight | RectAreaLight | SpotLight;

class LightModel {
    private _light: LightType = undefined;

    private _screenPosition: Vector2 = new Vector2();

    private _distance = 0;

    private _sphereFaceNormal: Vector3 = undefined;

    private _positionOnSphere: Vector3 = undefined;

    private _positionTarget: Vector3 = new Vector3(0, 0, 0);

    private _lookAtTarget = true;

    get light() {
        return this._light;
    }

    set light(value: LightType) {
        this._light = value;
        this.update();
    }

    get screenPosition() {
        return this._screenPosition;
    }

    set screenPosition(value: Vector2) {
        this._screenPosition = value;
    }

    get distance() {
        return this._distance;
    }

    set distance(value: number) {
        this._distance = value;
    }

    get sphereFaceNormal() {
        return this._sphereFaceNormal;
    }

    set sphereFaceNormal(value: Vector3) {
        this._sphereFaceNormal = value;
    }

    get positionOnSphere() {
        return this._positionOnSphere;
    }

    set positionOnSphere(value: Vector3) {
        this._positionOnSphere = value;
    }

    get positionTarget() {
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

    get lookAtTarget() {
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
}

export default LightModel;
