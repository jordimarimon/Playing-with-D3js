const width = 960;
const height = 500;

const svg = d3.select('svg');
svg.attr('width', width)
	 .attr('height', height);

const projection = d3.geoNaturalEarth1();
const pathGenerator = d3.geoPath().projection(projection);

const g = svg.append('g');

svg.call(d3.zoom().on('zoom', () => g.attr('transform', d3.event.transform)))

g.append('path')
	.attr('class', 'sphere')
	.attr('d', pathGenerator({ type: 'Sphere' }));

Promise.all([
	d3.tsv('1_1_4_50m.tsv'),
	d3.json('1_1_4_50m.json')
]).then(response =>  {
		const tsvData = response[0];
		const topoJsonData = response[1];

		const countryName = tsvData.reduce((acc, currValue) => {
			acc[currValue.iso_n3] = currValue.name;
			return acc;
		}, {});
		const countries = topojson.feature(topoJsonData, topoJsonData.objects.countries);
		const paths = g.selectAll('path').data(countries.features);
		paths.enter()
			.append('path')
				.attr('class', 'country')
				.attr('d', pathGenerator)
			.append('title')
				.text(d => countryName[d.id]);
	})
