export default {
	title: 'Accounts growth',
	height: '250px',
	grid: {
		x: {
			enabled: false
		},
		y: {
			enabled: true
		}
	},
	axes: {
		bottom: {
			visible: true,
			title: 'Date',
			mapsTo: 'createdAt',
			scaleType: 'time',
		},
		left: {
			visible: true,
			title: 'Total acounts',
			mapsTo: 'value',
			scaleType: 'linear'
		}
	},
	color: {
		scale: {
			'All accounts': '#07AB69'
		},
		gradient: {
			enabled: true
		}
	},
	points: {
		enabled: false
	},
	legend: {
		enabled: false
	}
};
