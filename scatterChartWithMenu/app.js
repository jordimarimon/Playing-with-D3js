/** 
Unidirectional Data Flow:
	User Interactions --> 
	Event Listeners --> 
	Change State --> 
	Render Function --> 
	(Nested) General Update Pattern
*/

let data = [];
let xColumn;
let yColumn;

const width = 960;
const height = 480;
const margin = { top: 20, right: 50, bottom: 90, left: 150 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
const circleRadius = 5;
const tickPadding = 15;
const offsetAxisTextLabel = 80;

const svg = d3.select('svg')
		.attr('width', width)
		.attr('height', height);

d3.csv('auto-mpg.csv').then(csv => {
	csv.forEach(d => {
		d.mpg = +d.mpg;
		d.cylinders = +d.cylinders;
		d.displacement = +d.displacement;
		d.horsepower = +d.horsepower;
		d.weight = +d.weight;
		d.acceleration = +d.acceleration;
		d.year = +d.year;
	});

	data = csv;
	xColumn = data.columns[4];
	yColumn = data.columns[0];
	d3.select('#xMenus').call(dropDownMenu, onXColumnClicked, xColumn);
	d3.select('#yMenus').call(dropDownMenu, onYColumnClicked, yColumn);

	render();
});
function render() {
	svg.call(scatterPlot, {
		xValue: d => d[xColumn],
		yValue: d => d[yColumn],
		title: yColumn + ' vs ' + xColumn,
	});
}
function scatterPlot(selection, props) {
	const xValue = props.xValue;
	const yValue = props.yValue;
	const title = props.title;

	const xScale = d3.scaleLinear()
		.domain(d3.extent(data, xValue))
		.range([0, innerWidth])
		.nice();

	const xAxis = d3.axisBottom(xScale)
		.tickSize(-innerHeight)
		.tickPadding(tickPadding);

	const yScale = d3.scaleLinear()
		.domain(d3.extent(data, yValue))
		.range([0, innerHeight])
		.nice();

	const yAxis = d3.axisLeft(yScale)
		.tickSize(-innerWidth)
		.tickPadding(tickPadding);

	const g = selection.selectAll('g.container').data([null]);
	const gEnter = g.enter()
		.append('g')
		.attr('class', 'container')
		.attr('transform', `translate(${margin.left},${margin.top})`);

	const yAxisG = g.select('g.y-axis');
	const yAxisGEnter = gEnter.append('g')
		.attr('class', 'y-axis');
	yAxisG.merge(yAxisGEnter)
		.call(yAxis)
		.selectAll('.domain').remove();

	const yAxisLabelText = yAxisGEnter
		.append('text')
			.attr('y', -offsetAxisTextLabel)
			.attr('transform', 'rotate(-90)')
			.attr('class', 'labels__text')
			.attr('text-anchor', 'middle')
		.merge(yAxisG.select('.labels__text'))
			.attr('x', -innerHeight / 2)
			.text(yColumn);

	const xAxisG = g.select('g.x-axis');
	const xAxisGEnter = gEnter.append('g')
		.attr('class', 'x-axis');
	xAxisG.merge(xAxisGEnter)
		.attr('transform', `translate(0, ${innerHeight})`)
		.call(xAxis)
		.selectAll('.domain').remove();

	const xAxisLabelText = xAxisGEnter
		.append('text')
			.attr('y', offsetAxisTextLabel)
			.attr('class', 'labels__text')
			.attr('text-anchor', 'middle')
		.merge(xAxisG.select('.labels__text'))
			.attr('x', innerWidth / 2)
			.text(xColumn);

	const circles = g.merge(gEnter)
		.selectAll('circle.circle--color').data(data);
	circles.enter()
		.append('circle')
			.attr('class', 'circle--color')
			.attr('cx', innerWidth / 2)
			.attr('cy', innerHeight / 2)
			.attr('r', 0)
		.merge(circles)
			.transition().duration(1000)
			.delay((d, i) => i * 2)
			.attr('r', circleRadius)
			.attr('cy', d => yScale(yValue(d)))
			.attr('cx', d => xScale(xValue(d)));
}
function dropDownMenu(selection, callback, selectedOption) {
	let select = selection.selectAll('select').data([null]);
	select = select.enter().append('select').merge(select);

	select.on('change', function() { callback(this.value); });

	const columnsAccepted = data.columns.filter(d => !['cylinders', 'year', 'origin', 'name'].includes(d));
	const option = select.selectAll('option').data(columnsAccepted);
	option.enter().append('option')
		.merge(option)
			.attr('value', d => d)
			.property('selected', d => d === selectedOption)
			.text(d => d);
}
function onXColumnClicked(column) {
	xColumn = column;
	render();
}
function onYColumnClicked(column) {
	yColumn = column;
	render();
}