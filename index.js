const dataURL =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const topologyURL =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

const svgWidth = 1060;
const svgHeight = 600;

d3.select('#container')
  .style('width', `${svgWidth}px`)
  .style('height', `${svgHeight}px`);

d3.select('#title').style('left', `${svgWidth / 2}px`);
d3.select('#description').style('left', `${svgWidth / 2}px`);

// SVG
const svg = d3
  .select('#container')
  .append('svg')
  .attr('class', 'svg-container')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

// Data
d3.json(dataURL).then(dataset => {
  d3.json(topologyURL).then(topology => {
    visualize(dataset, topology);
  });
});

const visualize = (dataset, topology) => {
  // Vars
  const all = dataset.map(d => d.bachelorsOrHigher).sort((a, b) => a - b);
  const min = all[0];
  const max = all[all.length - 1];

  const color = d3
    .scaleThreshold()
    .domain(d3.range(min, max, (max - min) / 8))
    .range(d3.schemeBlues[9]);

  // Legend
  const legend = d3.select('svg').attr('id', 'legend');
  const values = [3, 12, 21, 30, 39, 48, 57, 68];

  legend
    .selectAll('rect')
    .data(values)
    .enter()
    .append('rect')
    .attr('x', `1000px`)
    .attr('y', (d, i) => `${60 + 60 * i}px`)
    .attr('width', '60px')
    .attr('height', '60px')
    .attr('fill', d => color(d));

  d3.select('#container')
    .selectAll('h4')
    .data(values)
    .enter()
    .append('h4')
    .text(d => `${d}%`)
    .style('top', (d, i) => `${80 + 60 * i}px`);

  // Tooltip
  const tooltip = d3.select('#tooltip');

  // Draw Map
  svg
    .append('g')
    .selectAll('path')
    .data(topojson.feature(topology, topology.objects.counties).features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('data-fips', d => dataset.filter(x => d.id == x.fips)[0].fips)
    .attr(
      'data-education',
      d => dataset.filter(x => d.id == x.fips)[0].bachelorsOrHigher
    )
    .attr('d', d3.geoPath())
    .attr('stroke', '#fff')
    .attr('fill', d =>
      color(dataset.filter(x => d.id == x.fips)[0].bachelorsOrHigher)
    )
    .on('mouseover', (d, i) => {
      const data = dataset.filter(x => d.id == x.fips)[0];
      const x = window.innerWidth / 2 - svgWidth / 2;
      const y = window.innerHeight / 2 - svgHeight / 2;

      tooltip
        .html(
          `${data.state}: ${data.area_name}
          <br/>Percentage: ${data.bachelorsOrHigher}%`
        )
        .attr('data-education', data.bachelorsOrHigher)
        .style('left', `${d3.event.pageX - x + 10}px`)
        .style('top', `${d3.event.pageY - y - 60}px`)
        .style('visibility', 'visible');
    })
    .on('mouseout', () => tooltip.style('visibility', 'hidden'));
};
