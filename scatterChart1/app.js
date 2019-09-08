
d3.json('data.json').then(json => {
	json.data.forEach(d => d.population = +d.population * 1e3);
	render(json.data);
});

function render(data) {
	const xValue = d => d.population;
	const yValue = d => d.country;

	const width = 800;
	const height = 400;
	const margin = { top: 20, right: 50, bottom: 70, left: 150 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	const svg = d3.select('svg')
		.attr('width', width)
		.attr('height', height);

	const xScale = d3.scaleLinear()
		.domain([0, d3.max(data, xValue)])
		.range([0, innerWidth])
		.nice();

	const xAxisTickFormat = number => d3.format('.3s')(number).replace('G', 'B'); 

	const xAxis = d3.axisBottom(xScale)
		.tickFormat(xAxisTickFormat)
		.tickSize(-innerHeight);

	const yScale = d3.scalePoint()
		.domain(data.map(yValue))
		.range([0, innerHeight])
		.padding(0.2);

	const yAxis = d3.axisLeft(yScale)
		.tickSize(-innerWidth);

	const g = svg.append('g')
		.attr('transform', `translate(${margin.left},${margin.top})`);

	const yAxisGroup = g.append('g')
		.call(yAxis)
		.attr('class', 'labels')
		.selectAll('.domain')
			.remove();

	const xAxisGroup = g.append('g')
		.call(xAxis)
		.attr('transform', `translate(0, ${innerHeight})`)
		.attr('class', 'labels');

	xAxisGroup.select('.domain').remove();
	
	xAxisGroup.append('text')
		.attr('x', innerWidth / 2)
		.attr('y', 50)
		.attr('class', 'labels__text')
		.text('Population');

	g.selectAll('circle.circle--color').data(data)
		.enter().append('circle')
			.attr('class', 'circle--color')
			.attr('r', 5)
			.attr('cy', d => yScale(yValue(d)))
			.attr('cx', d => xScale(xValue(d)));
}