import type { SwipeEvent } from '../types';

// Swipe action for mobile row actions
interface SwipeOptions {
    threshold?: number;
    maxTime?: number;
    disableScroll?: boolean;
    triggerPercent?: number;
    onSwipeStart?: () => void;
    onSwipeMove?: (percent: number) => void;
    onSwipeCancel?: () => void;
}

export function swipe(node: HTMLElement, options: SwipeOptions = {}) {
    const {
        threshold = 200, // Increased from 50 to 200 for less sensitivity
        maxTime = 300,
        disableScroll = true,
        triggerPercent = 0.4,
        onSwipeStart,
        onSwipeMove,
        onSwipeCancel
    } = options;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let translateX = 0;
    let isAnimating = false;
    let elementWidth = node.offsetWidth;

    function dispatchSwipeEvent(direction: 'left' | 'right') {
        const event = new CustomEvent('swipe', {
            detail: { direction },
            bubbles: true,
            cancelable: true
        }) as SwipeEvent;
        node.dispatchEvent(event);
    }

    function handleTouchStart(event: TouchEvent) {
        if (event.touches.length !== 1) return;

        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        startTime = Date.now();
        isAnimating = true;

        // Reset any existing translation
        node.style.transition = 'none';
    }

    function handleTouchMove(event: TouchEvent) {
        if (!startTime || event.touches.length !== 1) return;

        const touch = event.touches[0];
        const diffX = touch.clientX - startX;
        const diffY = Math.abs(touch.clientY - startY);            // If vertical scrolling is detected, cancel swipe
        if (diffY > Math.abs(diffX)) {
            startX = 0;
            isAnimating = false;
            onSwipeCancel?.();
            return;
        }

        // Prevent scrolling if disableScroll is true
        if (disableScroll) {
            event.preventDefault();
        }

        // Constrain the translation to element width
        translateX = Math.max(-elementWidth, Math.min(elementWidth, diffX));
        const percent = translateX / elementWidth;

        node.style.transform = `translateX(${translateX}px)`;
        onSwipeMove?.(percent);

        // Add resistance at the edges
        if (Math.abs(translateX) > elementWidth * 0.6) {
            translateX = elementWidth * 0.6 * Math.sign(translateX);
        }
    }

    function handleTouchEnd(event: TouchEvent) {
        if (!startTime || event.changedTouches.length !== 1) return;

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - startX;
        const deltaTime = Date.now() - startTime;
        const percentMoved = Math.abs(deltaX) / elementWidth;

        if (deltaTime <= maxTime && Math.abs(deltaX) >= threshold) {
            const direction = deltaX > 0 ? 'right' : 'left';
            dispatchSwipeEvent(direction);
        } else if (percentMoved >= triggerPercent) {
            const direction = deltaX > 0 ? 'right' : 'left';
            dispatchSwipeEvent(direction);
        } else {
            onSwipeCancel?.();
        }

        startTime = 0;
        resetPosition();
    }

    function resetPosition() {
        isAnimating = true;
        node.style.transform = `translateX(0)`;
        node.style.transition = 'transform 0.2s ease-out';
        setTimeout(() => {
            isAnimating = false;
            node.style.transition = '';
        }, 200);
    }

    function updateElementWidth() {
        elementWidth = node.offsetWidth;
    }

    // Add event listeners
    node.addEventListener('touchstart', handleTouchStart, { passive: true });
    node.addEventListener('touchmove', handleTouchMove, { passive: !disableScroll });
    node.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('resize', updateElementWidth);

    return {
        destroy() {
            node.removeEventListener('touchstart', handleTouchStart);
            node.removeEventListener('touchmove', handleTouchMove);
            node.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('resize', updateElementWidth);
        }
    };
}
