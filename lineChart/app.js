
d3.json('data.json').then(json => {
	json.data.forEach(d => {
		d.x = +d.x;
		d.y = +d.y;
	});
	render(json.data);
});

function render(data) {
	const xValue = d => d.x;
	const yValue = d => d.y;

	const width = 800;
	const height = 400;
	const margin = { top: 20, right: 50, bottom: 70, left: 150 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	const svg = d3.select('svg')
		.attr('width', width)
		.attr('height', height);

	const xScale = d3.scaleLinear()
		.domain(d3.extent(data, xValue))
		.range([0, innerWidth])
		.nice();

	const xAxis = d3.axisBottom(xScale)
		.tickSize(-innerHeight)
		.tickPadding(10);

	const yScale = d3.scaleLinear()
		.domain(d3.extent(data, yValue))
		.range([innerHeight, 0])
		.nice();

	const yAxis = d3.axisLeft(yScale)
		.tickSize(-innerWidth)
		.tickPadding(10);

	const g = svg.append('g')
		.attr('transform', `translate(${margin.left},${margin.top})`);

	const yAxisGroup = g.append('g')
		.call(yAxis)
		.attr('class', 'labels');
	
	yAxisGroup.selectAll('.domain').remove();

	yAxisGroup.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('x', -innerHeight / 2)
		.attr('y', -60)
		.attr('class', 'labels__text')
		.attr('text-anchor', 'middle')
		.text('y(x) = x²');

	const xAxisGroup = g.append('g')
		.call(xAxis)
		.attr('transform', `translate(0, ${innerHeight})`)
		.attr('class', 'labels');

	xAxisGroup.select('.domain').remove();
	
	xAxisGroup.append('text')
		.attr('x', innerWidth / 2)
		.attr('y', 50)
		.attr('class', 'labels__text')
		.attr('text-anchor', 'middle')
		.text('x');

	const lineGenerator = d3.line()
		.x(d => xScale(xValue(d)))
		.y(d => yScale(yValue(d)))
		.curve(d3.curveBasis);

	g.append('path')
		.attr('class', 'line')
		.attr('d', d => lineGenerator(data));
}