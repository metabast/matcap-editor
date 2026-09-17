import { debounce } from './Utils';
import type { History } from '@/history';

/**
 * Binds the undo/redo keystrokes. Returns the teardown so that whoever wires it
 * owns its lifetime.
 */
const bindKeyboardShortcuts = (history: History): (() => void) => {
    const onKeydown = (event: KeyboardEvent) => {
        if (event.key.toLowerCase() !== 'z' || !event.ctrlKey) return;

        event.preventDefault(); // Prevent browser specific hotkeys

        if (event.shiftKey) {
            history.redo();
        } else {
            history.undo();
        }
    };

    const handler = debounce(onKeydown, 100);
    document.addEventListener('keydown', handler);

    return () => document.removeEventListener('keydown', handler);
};

export default bindKeyboardShortcuts;
