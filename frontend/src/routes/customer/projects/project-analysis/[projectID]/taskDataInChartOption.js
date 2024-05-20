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
			mapsTo: 'completionDate',
			scaleType: 'time',
		},
		left: {
			visible: true,
			title: 'remaining tasks',
			mapsTo: 'value',
			scaleType: 'linear'
		}
	},
	color: {
		scale: {
			'Total tasks': '#07AB69'
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
