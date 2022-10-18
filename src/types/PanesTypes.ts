import type { Color, Vector2, Vector3 } from 'three';

export type ValuesPaneCtrl = {
    value: number | string | Color | boolean | Vector2 | Vector3;
    oldValue: number | string | Color | boolean | Vector2 | Vector3;
    history: boolean;
};

export type ColorPaneCtrl = {
    value: number | string | Color;
    oldValue: number | string | Color;
    history: boolean;
};

export type ValuesCommand = {
    name: string;
    value: number | string | Color | boolean | Vector2 | Vector3;
    oldValue: number | string | Color | boolean | Vector2 | Vector3;
};
