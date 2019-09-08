const width = 960;
const height = 500;

const svg = d3.select('svg')
	.attr('width', width)
	.attr('height', height);
const choroplethMapG = svg.append('g');

let countries;
const projection = d3.geoNaturalEarth1();
const pathGenerator = d3.geoPath().projection(projection);
const sizeScale = d3.scaleSqrt();
const radiusValue = d => d.properties['2018'];

loadAndProcessData().then(data => {
	countries = data; 
	render();
});
function render() {
	choroplethMapG.call(choroplethMap);
}
function loadAndProcessData() {
	return Promise.all([
		d3.csv('un-population-estimates-2017-medium-variant.csv'),
		d3.json('0_0_4_50m.json')
	])
	.then(response =>  {
		const csvData = response[0];
		const topoJsonData = response[1];

		const rowByID = csvData.reduce((acc, currValue) => {
			acc[currValue['Country code']] = currValue;
			return acc;
		}, {});
		const countries = topojson.feature(topoJsonData, topoJsonData.objects.countries);
		countries.features.forEach(d => Object.assign(d.properties, rowByID[+d.id]));
		const featuresWithPopulation = countries.features
			.filter(d => d.properties['2018'])
			.map(d => {
				d.properties['2018'] = +(d.properties['2018'].replace(/ /g, '')) * 1e3;
				return d;
			});
		return {
			featuresWithPopulation,
			features: countries.features,
		};
	})
}
function choroplethMap(selection) {

	const populationFormat = (d) => d3.format('.3s')(d).replace('G', 'B');

	sizeScale
		.domain([0, d3.max(countries.features, radiusValue)])
		.range([0, 33]);

	const gUpdate = selection.selectAll('g').data([null]);
	const gEnter = gUpdate.enter().append('g');
	const g = gUpdate.merge(gEnter);

	gEnter
		.append('path')
			.attr('class', 'sphere')
			.attr('d', pathGenerator({ type: 'Sphere' }))
		.merge(gUpdate.select('.sphere'));

	selection.call(d3.zoom().on('zoom', () => g.attr('transform', d3.event.transform)))

	g.selectAll('path').data(countries.features)
		.enter()
		.append('path')
			.attr('class', 'country')
			.attr('d', pathGenerator)
			.attr('fill', d => d.properties['2018'] ? '#a6a6a6' : '#fec1c1')
		.append('title')
			.text(d => {
				const countryName = d.properties['Region, subregion, country or area *'];
				const population = populationFormat(d.properties['2018']);
				if (!countryName) return 'Missing data';
				return `${countryName}: ${population}`;
			});

	countries.featuresWithPopulation.forEach(d => {
		d.properties.projection = projection(d3.geoCentroid(d));  
	});

	g.selectAll('circle.country-circle').data(countries.featuresWithPopulation)
		.enter().append('circle')
			.attr('class', 'country-circle')
			.attr('cx', d => d.properties.projection[0])
			.attr('cy', d => d.properties.projection[1])
			.attr('r', d => sizeScale(radiusValue(d)));

	g
		.append('g')
		.attr('transform', 'translate(60, 300)')
		.call(sizeLegend, {
			numTicks: 5,
			spacing: 30,
			textOffset: 60,
			tickFormat: populationFormat
		})
		.append('text')
			.attr('transform', 'translate(-30, -40)')
			.attr('class', 'title-legend')
			.text('Population:');
}

function sizeLegend(selection, props) {
	const numTicks = props.numTicks;
	const spacing = props.spacing;
	const ticks = sizeScale.ticks(numTicks).filter(d => d !== 0).reverse();
	const textOffset = props.textOffset;
	const tickFormat = props.tickFormat;

	const groups = selection.selectAll('g.tick').data(ticks);

	const groupsEnter = groups.enter().append('g');
	groupsEnter.merge(groups)
		.attr('class', 'tick')
		.attr('transform', (d, i) => `translate(0, ${i * spacing})`);
	groups.exit().remove();

	groupsEnter.append('circle')
		.merge(groups.select('circle'))
			.attr('r', sizeScale);
	groupsEnter.append('text')
		.merge(groups.select('text'))
			.text(d => tickFormat(d))
			.attr('text-anchor', 'middle')
			.attr('dy', '0.32em')
			.attr('x', textOffset);	
}

