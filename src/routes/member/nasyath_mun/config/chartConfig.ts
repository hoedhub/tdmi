import { toHindi } from '$lib/utils/toHindi';

export const commonChartOptions = {
	plugins: {
		legend: {
			position: 'bottom' as const,
			labels: {
				boxWidth: 12,
				usePointStyle: true,
				font: { size: 11 }
			}
		},
		tooltip: {
			callbacks: {
				label: function (context: any) {
					return `${context.label}: ${toHindi(context.raw)}`;
				}
			}
		}
	}
};

export const pieChartOptions = {
	...commonChartOptions,
	maintainAspectRatio: false,
};

export const barChartOptions = {
	...commonChartOptions,
	scales: {
		y: {
			beginAtZero: true,
			ticks: {
				font: { size: 11 },
				callback: function (value: any) { return toHindi(value); }
			}
		},
		x: {
			ticks: { font: { size: 11 } }
		}
	}
};
