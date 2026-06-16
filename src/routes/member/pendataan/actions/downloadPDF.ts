export async function downloadMuridPDF(
	element: HTMLElement,
	filename: string
): Promise<void> {
	const html2pdf = (await import('html2pdf.js')).default;

	const opt = {
		margin: 10,
		filename: `${filename}-${new Date().getTime()}.pdf`,
		image: { type: 'jpeg', quality: 0.98 },
		html2canvas: {
			scale: 2,
			useCORS: true,
			logging: false,
			onclone: (clonedDoc: Document) => {
				const styles2 = clonedDoc.querySelectorAll('style');
				styles2.forEach(s => {
					if (s.textContent && s.textContent.includes('oklch')) {
						s.textContent = s.textContent.replace(/oklch\([^)]*\)/g, '#3b82f6');
						s.textContent = s.textContent.replace(/color-mix\(in oklch,\s*[^,]+,\s*[^)]+\)/g, '#94a3b8');
					}
				});
				const allElements = clonedDoc.querySelectorAll('[style]');
				allElements.forEach(el => {
					const style = el.getAttribute('style');
					if (style && style.includes('oklch')) {
						el.setAttribute('style', style.replace(/oklch\([^)]*\)/g, '#3b82f6').replace(/color-mix\(in oklch,\s*[^,]+,\s*[^)]+\)/g, '#94a3b8'));
					}
				});
				const paths = clonedDoc.querySelectorAll('path');
				paths.forEach(path => {
					let d = path.getAttribute('d');
					if (d && d.includes('NaN')) {
						path.setAttribute('d', d.replace(/NaN\w*/g, '0'));
					}
				});
				const cssLinks = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
				cssLinks.forEach(link => {
					const href = link.getAttribute('href');
					if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('//')) {
						link.setAttribute('href', new URL(href, window.location.origin).href);
					}
				});
			}
		},
		jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
	};

	await html2pdf().set(opt).from(element).save();
}
