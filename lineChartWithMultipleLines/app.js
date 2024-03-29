const width = 800;
const height = 400;
const margin = { top: 70, right: 200, bottom: 70, left: 120 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const svg = d3.select('svg')
	.attr('width', width)
	.attr('height', height);

let selectedDate;
let data;

const xValue = d => d.timestamp;
const yValue = d => d.temperature;
const title = 'A week of temperature around the world';
const xLabel = 'Date';
const yLabel = 'Temperature';

let colorLegendG = svg.append('g');
let lineChartG = svg.append('g');
const colorScale = d3.scaleOrdinal()
	.range(d3.schemeCategory10);

d3.csv('data-canvas-sense-your-city-one-week.csv').then(csv => {
	csv.forEach(d => {
		d.temperature = +d.temperature;
		d.timestamp = new Date(d.timestamp);
	});
	data = csv;
	render();
});
function render() {
	const nestedData = d3.nest()
		.key(d => d.city)
		.entries(data)
		.sort(compare);

	colorScale.domain(nestedData.map(d => d.key));

	const xScale = d3.scaleTime()
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

	const g = lineChartG.selectAll('.container').data([null]);
	const gEnter = g.enter().append('g')
		.attr('class', 'container')
		.attr('transform', `translate(${margin.left},${margin.top})`);

	const yAxisGroup = gEnter.append('g')
		.call(yAxis)
		.attr('class', 'labels');
	
	yAxisGroup.selectAll('.domain').remove();

	yAxisGroup.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('x', -innerHeight / 2)
		.attr('y', -60)
		.attr('class', 'labels__text')
		.attr('text-anchor', 'middle')
		.text(yLabel);

	const xAxisGroup = gEnter.append('g')
		.call(xAxis)
		.attr('transform', `translate(0, ${innerHeight})`)
		.attr('class', 'labels');

	xAxisGroup.select('.domain').remove();
	
	xAxisGroup.append('text')
		.attr('x', innerWidth / 2)
		.attr('y', 50)
		.attr('class', 'labels__text')
		.attr('text-anchor', 'middle')
		.text(xLabel);

	const lineGenerator = d3.line()
		.x(d => xScale(xValue(d)))
		.y(d => yScale(yValue(d)))
		.curve(d3.curveBasis);

	gEnter.selectAll('path.line').data(nestedData)
		.enter().append('path')
			.attr('class', 'line')
			.attr('stroke', d => colorScale(d.key))
			.attr('d', d => lineGenerator(d.values));

	const line = g.merge(gEnter).selectAll('line.cursor-line').data([null]);
	const lineEnter = line.enter().append('line');
	line.merge(lineEnter)
		.attr('class', 'cursor-line')
		.attr('x1', xScale(selectedDate))
		.attr('x2', xScale(selectedDate))
		.attr('y1', 0)
		.attr('y2', innerHeight)
		.attr('stroke-width', 3)
		.attr('stroke', 'black');

	line.exit().remove();

	gEnter.append('text')
		.attr('class', 'title')
		.attr('x', innerWidth / 2)
		.attr('y', -30)
		.attr('text-anchor', 'middle')
		.text(title);

	gEnter.append('rect')
		.attr('width', innerWidth)
		.attr('height', innerHeight)
		.attr('fill', 'none')
		.attr('pointer-events', 'all')
		.on('mousemove', () => {
			const x = d3.mouse(gEnter.node())[0];
			selectedDate = xScale.invert(x);
			render();
		});

	colorLegendG.selectAll('.legend').data([null])
		.enter().append('g')
		.attr('class', 'legend')
		.attr('transform', `translate(100, 150)`)
		.call(colorLegend, {
			circleRadius: 5,
			spacing: 25,
			textOffset: 15
		});
}
function colorLegend(selection, props) {
	const circleRadius = props.circleRadius;
	const spacing = props.spacing;
	const textOffset = props.textOffset;

	const groups = selection.selectAll('g').data(colorScale.domain());

	const groupsEnter = groups.enter().append('g');
	groupsEnter.merge(groups)
		.attr('transform', (d, i) => `translate(550, ${i * spacing - 20})`);
	groups.exit().remove();

	groupsEnter.append('circle')
		.merge(groups.select('circle'))
			.attr('r', circleRadius)
			.attr('fill', d => colorScale(d));
	groupsEnter.append('text')
		.merge(groups.select('text'))
			.attr('class', 'legend')
			.text(d => d)
			.attr('text-anchor', 'start')
			.attr('dy', '0.32em')
			.attr('x', textOffset);
}
function compare(a, b) {
	const _a = a.values[a.values.length - 1].temperature;
	const _b = b.values[b.values.length - 1].temperature;
	return _a > _b ? -1 : _a < _b ? 1 : 0;
}