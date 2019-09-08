const width = 960;
const height = 500;

const svg = d3.select('svg')
	.attr('width', width)
	.attr('height', height);
const choroplethMapG = svg.append('g');
const colorLegendG = svg.append('g')
		.attr('transform', 'translate(40, 300)');

// const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
let countries;
let property = 'economy';
let selectedColorValue = [];
const projection = d3.geoNaturalEarth1();
const pathGenerator = d3.geoPath().projection(projection);
const colorScale = d3.scaleOrdinal();
const circleRadius = 10;
const spacing = 30;
let textOffset = 30;

loadAndProcessData().then(data => {
	countries = data; 
	render();
});
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
function choroplethMap(selection, colorValue) {
	const gUpdate = selection.selectAll('g').data([null]);
	const gEnter = gUpdate.enter().append('g');
	const g = gUpdate.merge(gEnter);

	gEnter
		.append('path')
			.attr('class', 'sphere')
			.attr('d', pathGenerator({ type: 'Sphere' }))
		.merge(gUpdate.select('.sphere'))
			.attr('opacity', selectedColorValue.length ? 0.1 : 1);

	selection.call(d3.zoom().on('zoom', () => g.attr('transform', d3.event.transform)))

	const countryPaths = g.selectAll('.country').data(countries.features);
	const countryPathsEnter = countryPaths.enter()
		.append('path')
			.attr('class', 'country');

	countryPaths
		.merge(countryPathsEnter)
			.attr('d', pathGenerator)
			.attr('fill', d => colorScale(colorValue(d)))
			.attr('opacity', d => {
				if (!selectedColorValue.length) return 1;
				return selectedColorValue.includes(colorValue(d)) ? 1 : 0.1;
			})
			.classed('highlighted', d => {
				return selectedColorValue.length || selectedColorValue.includes(colorValue(d));
			});

	countryPathsEnter
		.append('title')
			.text(d => `${d.properties.name} - ${colorValue(d)}`);

	countryPaths.selectAll('title')
		.text(d => `${d.properties.name} - ${colorValue(d)}`);
}

function render() {
	const colorValue = d => d.properties[property];
	colorScale
		.domain(countries.features.map(colorValue))
		.domain(colorScale.domain().sort().reverse())
		.range(d3.schemeSpectral[colorScale.domain().length]);

	colorLegendG.call(colorLegend);

	choroplethMapG.call(choroplethMap, colorValue);
}
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
		.attr('class', 'legend-item')
		.attr('transform', (d, i) => `translate(0, ${i * spacing})`)
		.attr('opacity', d => {
			if (!selectedColorValue.length) return 1;
			return selectedColorValue.includes(d) ? 1 : 0.2;
		})
		.on('click', onClick);
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
function onClick(d) {
	if (!selectedColorValue.includes(d)) selectedColorValue.push(d);
	else selectedColorValue = selectedColorValue.filter(_d => d !== _d);
	render();
}
document.querySelector('select')
	.addEventListener('change', (event) => {
		property = event.target.value; 
		selectedColorValue = [];
		render();
	});
document.querySelector('button')
	.addEventListener('click', (event) => {
		selectedColorValue = [];
		render();
	});