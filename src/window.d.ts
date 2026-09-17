export {};

declare global {
    interface Window {
        THREE: typeof import('three');
        matcapPreviewWorld: import('./matcapPreview/MatcapPreviewWorld').default;
        matcapEditorWorld: import('./matcapEditor/MatcapEditorWorld').default;
    }
}
