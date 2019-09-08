const width = 960;
const height = 500;

const svg = d3.select('svg');
svg.attr('width', width)
	 .attr('height', height);

const g = svg.append('g');
g.attr('transform', `translate(${width / 2}, ${height / 2})`);

const face = g.append('circle');
face.attr('r', height / 2)
			.attr('fill', 'yellow')
			.attr('stroke', 'black');

const eyeRadius = 30;
const eyeOffSetX = 100;
const eyeOffSetY = 70;
const eyeBrowWidth = 70;
const eyeBrowHeight = 15;
const eyeBrowOffsetY = 70;

const eyes = g.append('g');
eyes.attr('fill', 'black')
		.attr('transform', `translate(0, ${-eyeOffSetY})`);

const leftEye = eyes.append('circle');
leftEye.attr('r', eyeRadius)
			 .attr('cx', -eyeOffSetX);

const rightEye = eyes.append('circle');
rightEye.attr('r', eyeRadius)
				.attr('cx', eyeOffSetX);

const leftEyebrow = eyes.append('rect');
leftEyebrow.attr('width', eyeBrowWidth)
					 .attr('height', eyeBrowHeight)
					 .attr('x', -eyeOffSetX - eyeBrowWidth / 2)
					 .attr('y', -eyeBrowOffsetY);

const rightEyebrow = eyes
	.append('rect')
		.attr('width', eyeBrowWidth)
		.attr('height', eyeBrowHeight)
	 	.attr('x', eyeOffSetX - eyeBrowWidth / 2)
	 	.attr('y', -eyeBrowOffsetY)
 	.transition().duration(1000)
 		.attr('y', -eyeBrowOffsetY - 30);

const arc = (parameters) => d3.arc()(parameters);

const mouth = g.append('path');
mouth.attr('d', arc({
	innerRadius: 180,
	outerRadius: 200,
	startAngle: Math.PI / 2,
	endAngle: 3 * Math.PI / 2
}));

