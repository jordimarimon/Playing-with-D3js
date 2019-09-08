const width = 960;
const height = 500;

const svg = d3.select('svg');
svg.attr('width', width)
	 .attr('height', height);

const colorScale = d3.scaleOrdinal()
	.domain(['apple', 'lemon'])
	.range(['#c11d1d', '#eae600']);

const radiusScale = d3.scaleOrdinal()
	.domain(['apple', 'lemon'])
	.range([50, 30]);

function makeFruit(type) {
	return { type, id: Math.random() };
}

function xPosition(d, i) {
	return i * 120 + 80;
}

function render(selection, { fruits }) {
	const bowl = selection.selectAll('rect')
		.data([null])
		.enter().append('rect')
			.attr('y', 110)
			.attr('width', 650)
			.attr('height', 300)
			.attr('rx', 300 / 2);


	const circlesDataJoin = selection.selectAll('circle').data(fruits, d => d.id);

	circlesDataJoin
		.enter().append('circle')
			.attr('cx', xPosition)
			.attr('cy', height / 2)
			.attr('r', 0)
		.merge(circlesDataJoin)
			.attr('fill', d => colorScale(d.type))
			.transition().duration(1000)
				.attr('cx', xPosition)
				.attr('r', d => radiusScale(d.type));

	circlesDataJoin
		.exit()
		.transition().duration(1000)
			.attr('r', 0)
		.remove();

	const textDataJoin = selection.selectAll('text').data(fruits);

	textDataJoin
		.enter().append('text')
			.attr('x', xPosition)
			.attr('y', height / 2 + 100)
		.merge(textDataJoin)
			.text(d => d.type)
			.transition().duration(1000)
				.attr('x', xPosition);

	textDataJoin.exit().remove();
}

let fruits = d3.range(5).map(() => makeFruit('apple'));
render(svg, { fruits });

setTimeout(() => {
	fruits.pop();
	render(svg, { fruits });
}, 2000);

setTimeout(() => {
	fruits[2].type = 'lemon';
	render(svg, { fruits });
}, 4000);

setTimeout(() => {
	fruits = fruits.filter((d, i) => i !== 1);
	render(svg, { fruits });
}, 6000);
