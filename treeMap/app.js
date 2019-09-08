
const width = document.body.clientWidth;
const height = 5000;
const margin = { top: 0, right: 400, bottom: 0, left: 100 };
const innerWidth = width - margin.right - margin.left;
const innerHeight = height - margin.top - margin.bottom;

const svg = d3.select('svg')
		.attr('width', width)
		.attr('height', height)
		.attr('margin', '10');

const zoomG = svg.append('g');

const g =	zoomG.append('g')
	.attr('transform', `translate(${margin.left}, ${margin.top})`);

svg.call(d3.zoom().on('zoom', () => zoomG.attr('transform', d3.event.transform)));

/** d3.tree() --> tidy tree, we could use also d3.cluster() */
const tree = d3.tree().size([innerHeight, innerWidth]);


d3.json('data.json').then(data => {
	const root = d3.hierarchy(data);
	const links = tree(root).links();
	const linkPathGenerator = d3.linkHorizontal()
		.x(d => d.y)
		.y(d => d.x);

	const linkPathGenerator2 = d3.linkVertical()
		.x(d => d.x)
		.y(d => d.y);

	// LINKS
	g.selectAll('path').data(links)
		.enter().append('path')
			.attr('d', linkPathGenerator);

	// NODES
	// root.descendants gives us all the nodes of the hierarchy
	g.selectAll('text').data(root.descendants())
		.enter().append('text')
			.attr('x', d => d.y)
			.attr('y', d => d.x)
			.attr('dy', '0.32em')
			.attr('text-anchor', d => d.children ? 'middle' : 'start')
			.attr('font-size', d => `${4 - d.depth}em`) // depth is a property given by d3.hierarchy
			.text(d => d.data.data.id);
});