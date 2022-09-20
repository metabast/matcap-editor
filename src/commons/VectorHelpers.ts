import { Camera, Vector2, Vector3 } from 'three';

function getScreenPosition(
    vector: Vector3,
    camera: Camera,
    width: number,
    height: number,
) {
    const hw = width / 2;
    const hh = height / 2;
    const position = vector.clone().project(camera);
    return new Vector2((position.x + 1) * hw, -(position.y - 1) * hh);
}

// eslint-disable-next-line import/prefer-default-export
export { getScreenPosition };
