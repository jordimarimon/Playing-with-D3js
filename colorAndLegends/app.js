const width = 960;
const height = 500;

const svg = d3.select('svg');
svg.attr('width', width)
	 .attr('height', height);

const colorScale = d3.scaleOrdinal()
	.domain(['apple', 'lemon', 'lime', 'orange'])
	.range(['#c11d1d', '#eae600', 'green', 'orange']);
const circleRadius = 30;
const spacing = 100;
let textOffset = 70;

function colorLegend(selection) {
	const groups = selection.selectAll('g').data(colorScale.domain());

	const groupsEnter = groups.enter().append('g');
	groupsEnter.merge(groups)
		.attr('transform', (d, i) => `translate(0, ${i * spacing})`);
	groups.exit().remove();

	groupsEnter.append('circle')
		.merge(groups.select('circle'))
			.attr('r', circleRadius)
			.attr('fill', d => colorScale(d));
	groupsEnter.append('text')
		.merge(groups.select('text'))
			.text(d => d)
			.attr('text-anchor', 'middle')
			.attr('dy', '0.32em')
			.attr('x', textOffset);
}

svg
	.append('g')
	.attr('transform', `translate(100, 150)`)
	.call(colorLegend); 
// equal to do "colorLegend(g)"
// call(function, param2, param3, ...)

const sizeScale = d3.scaleSqrt()
	.domain([0, 10])
	.range([0, 50]);
const numTicks = 5;
const ticks = sizeScale.ticks(numTicks).filter(d => d !== 0);
textOffset = 90;
const colorFill = 'rgba(0,0,0,0.5)';

function sizeLegend(selection) {
	const groups = selection.selectAll('g').data(ticks);

	const groupsEnter = groups.enter().append('g');
	groupsEnter.merge(groups)
		.attr('transform', (d, i) => `translate(0, ${i * spacing})`);
	groups.exit().remove();

	groupsEnter.append('circle')
		.merge(groups.select('circle'))
			.attr('r', sizeScale)
			.attr('fill', colorFill);
	groupsEnter.append('text')
		.merge(groups.select('text'))
			.text(d => d)
			.attr('text-anchor', 'middle')
			.attr('dy', '0.32em')
			.attr('x', textOffset);	
}	

svg
	.append('g')
	.attr('transform', 'translate(500, 150)')
	.call(sizeLegend);