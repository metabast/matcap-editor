import type { Pane } from 'tweakpane';

let refreshing = false;

/** True while a programmatic refresh is running, so change handlers can bail. */
export const isRefreshing = () => refreshing;

export const refreshPane = (pane: Pane) => {
    refreshing = true;
    try {
        pane.refresh();
    } finally {
        refreshing = false;
    }
};
