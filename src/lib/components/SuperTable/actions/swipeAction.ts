import type { SwipeEvent } from '../types';

// Opsi tetap sama
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
		threshold = 50, // threshold bisa sedikit dikurangi karena kita punya deteksi yang lebih baik
		maxTime = 500,
		disableScroll = true,
		triggerPercent = 0.4,
		onSwipeStart,
		onSwipeMove,
		onSwipeCancel
	} = options;

	// --- State Baru untuk Mengunci Arah & Zona Mati ---
	let startX = 0;
	let startY = 0;
	let startTime = 0;
	let translateX = 0;
	let isAnimating = false;
	let elementWidth = node.offsetWidth;

	// BARU: State untuk mengunci arah gerakan
	let lockDirection: 'horizontal' | 'vertical' | null = null;
	const deadZone = 10; // Abaikan 10px pertama gerakan untuk mencegah getaran kecil

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

		// BARU: Reset kunci arah setiap kali sentuhan baru dimulai
		lockDirection = null;

		// Reset transisi untuk pergerakan langsung
		node.style.transition = 'none';
	}

	// DIUBAH: Logika inti dipindahkan ke sini
	function handleTouchMove(event: TouchEvent) {
		if (!startTime || event.touches.length !== 1) return;

		const touch = event.touches[0];
		const diffX = touch.clientX - startX;
		const diffY = touch.clientY - startY;

		// --- Tahap 1: Tentukan & Kunci Arah ---
		if (lockDirection === null) {
			// Hitung total jarak dari titik awal
			const distance = Math.sqrt(diffX * diffX + diffY * diffY);

			// Jika masih di dalam zona mati, jangan lakukan apa-apa
			if (distance < deadZone) {
				return;
			}

			// Keluar dari zona mati, sekarang putuskan arahnya
			if (Math.abs(diffY) > Math.abs(diffX)) {
				// Gerakan dominan vertikal -> Kunci ke mode scroll
				lockDirection = 'vertical';
			} else {
				// Gerakan dominan horizontal -> Kunci ke mode swipe
				lockDirection = 'horizontal';
				onSwipeStart?.(); // Panggil callback jika ada
			}
		}

		// --- Tahap 2: Lakukan Aksi Berdasarkan Arah yang Dikunci ---
		if (lockDirection === 'vertical') {
			// Jika terkunci vertikal, biarkan browser melakukan scroll.
			// Jangan lakukan apa-apa di sini.
			return;
		}

		// Jika sampai di sini, artinya lockDirection === 'horizontal'
		// Cegah browser melakukan scroll karena kita sudah berkomitmen untuk swipe
		if (disableScroll) {
			event.preventDefault();
		}

		// Terapkan pergeseran visual (logika lama Anda)
		translateX = Math.max(-elementWidth, Math.min(elementWidth, diffX));
		const percent = translateX / elementWidth;
		node.style.transform = `translateX(${translateX}px)`;
		onSwipeMove?.(percent);
	}

	function handleTouchEnd(event: TouchEvent) {
		if (!startTime || event.changedTouches.length !== 1) return;

		// BARU: Hanya proses akhir swipe jika arahnya horizontal
		if (lockDirection !== 'horizontal') {
			resetPosition(); // Pastikan elemen kembali ke posisi semula jika itu scroll
			return;
		}

		const touch = event.changedTouches[0];
		const deltaX = touch.clientX - startX;
		const deltaTime = Date.now() - startTime;
		const percentMoved = Math.abs(deltaX) / elementWidth;

		// Logika lama Anda untuk menentukan apakah swipe berhasil
		if ((deltaTime <= maxTime && Math.abs(deltaX) >= threshold) || percentMoved >= triggerPercent) {
			const direction = deltaX > 0 ? 'right' : 'left';
			dispatchSwipeEvent(direction);
		} else {
			onSwipeCancel?.();
		}

		// Selalu reset posisi pada akhirnya
		resetPosition();
		startTime = 0; // Reset startTime untuk memastikan handleTouchMove tidak berjalan lagi
	}

	function resetPosition() {
		// Fungsi ini tidak perlu diubah
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
