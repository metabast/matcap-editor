import type { Color } from 'three';

export type ValuesPaneCtrl = {
    value: number | string | Color;
    oldValue: number | string | Color;
    history: boolean;
};

export type ColorPaneCtrl = {
    value: number | string | Color;
    oldValue: number | string | Color;
    history: boolean;
};

export type ValuesCommand = {
    name: string;
    value: number | string | Color;
    oldValue: number | string | Color;
};
