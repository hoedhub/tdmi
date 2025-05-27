import type { LongPressEvent } from '../types';

interface LongPressOptions {
    duration?: number;
    tolerance?: number;
}

// Long press action for mobile selection
export function longPress(node: HTMLElement, options: LongPressOptions = {}) {
    const { duration = 500, tolerance = 10 } = options;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function dispatchLongPressEvent() {
        const event = new CustomEvent('longpress', {
            bubbles: true,
            cancelable: true
        }) as LongPressEvent;
        node.dispatchEvent(event);
    }

    function handleTouchStart(event: TouchEvent) {
        if (event.touches.length !== 1) return;

        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        startTime = Date.now();

        timer = setTimeout(() => {
            dispatchLongPressEvent();
        }, duration);
    }

    function handleTouchMove(event: TouchEvent) {
        if (!startTime || event.touches.length !== 1) return;

        const touch = event.touches[0];
        const diffX = Math.abs(touch.clientX - startX);
        const diffY = Math.abs(touch.clientY - startY);

        // Cancel if moved beyond tolerance
        if (diffX > tolerance || diffY > tolerance) {
            clearTimeout(timer);
            startTime = 0;
        }
    }

    function handleTouchEnd() {
        clearTimeout(timer);
        startTime = 0;
    }

    // Add event listeners
    node.addEventListener('touchstart', handleTouchStart, { passive: true });
    node.addEventListener('touchmove', handleTouchMove, { passive: true });
    node.addEventListener('touchend', handleTouchEnd);
    node.addEventListener('touchcancel', handleTouchEnd);

    return {
        destroy() {
            node.removeEventListener('touchstart', handleTouchStart);
            node.removeEventListener('touchmove', handleTouchMove);
            node.removeEventListener('touchend', handleTouchEnd);
            node.removeEventListener('touchcancel', handleTouchEnd);
            if (timer) clearTimeout(timer);
        }
    };
}
