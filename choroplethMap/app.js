const width = 960;
const height = 500;

const svg = d3.select('svg');
svg.attr('width', width)
	 .attr('height', height);

const projection = d3.geoNaturalEarth1();
const pathGenerator = d3.geoPath().projection(projection);

const g = svg.append('g');

const colorLegendG = svg.append('g')
	.attr('transform', 'translate(40, 300)');

svg.call(d3.zoom().on('zoom', () => g.attr('transform', d3.event.transform)))

g.append('path')
	.attr('class', 'sphere')
	.attr('d', pathGenerator({ type: 'Sphere' }));

function loadAndProcessData() {
	return Promise.all([
		d3.tsv('1_1_4_50m.tsv'),
		d3.json('1_1_4_50m.json')
	])
	.then(response =>  {
		const tsvData = response[0];
		const topoJsonData = response[1];

		const rowByID = tsvData.reduce((acc, currValue) => {
			acc[currValue.iso_n3] = currValue;
			return acc;
		}, {});
		const countries = topojson.feature(topoJsonData, topoJsonData.objects.countries);
		countries.features.forEach(d => d.properties = rowByID[d.id]);
		return countries;
	})
}

// const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
let countries;

loadAndProcessData().then(data => {
	countries = data; 
	render('economy');
});

const colorScale = d3.scaleOrdinal();

function render(property) {
	const colorValue = d => d.properties[property];

	colorScale
		.domain(countries.features.map(colorValue))
		.domain(colorScale.domain().sort().reverse())
		.range(d3.schemeSpectral[colorScale.domain().length]);

	const paths = g.selectAll('path').data(countries.features);
	paths.enter()
		.append('path')
			.attr('class', 'country')
			.attr('d', pathGenerator)
			.attr('fill', d => colorScale(colorValue(d)))
		.append('title')
			.text(d => `${d.properties.name} - ${d.properties[property]}`);

	paths.attr('fill', d => colorScale(colorValue(d)));

	colorLegendG.call(colorLegend);
}

const circleRadius = 10;
const spacing = 30;
let textOffset = 30;
function colorLegend(selection) {
	const backgroundRect = selection.selectAll('rect').data([null]);
	backgroundRect.enter().append('rect')
		.merge(backgroundRect)
			.attr('x', -circleRadius * 1.5)
			.attr('y', -circleRadius * 1.5)
			.attr('rx', circleRadius)
			.attr('width', 250)
			.attr('height', spacing * colorScale.domain().length + circleRadius * 1.5)
			.attr('fill', 'white')
			.attr('opacity', 0.7);

	const groups = selection.selectAll('g').data(colorScale.domain().reverse());

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
			.attr('class', 'text-legend')
			.attr('text-anchor', 'start')
			.attr('dy', '0.32em')
			.attr('x', textOffset);
}

document.querySelector('select').addEventListener('change', (event) => render(event.target.value));