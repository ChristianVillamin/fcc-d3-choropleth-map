d3.json(
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json'
).then(dataset => {
  d3.json(
    'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json'
  ).then(topology => {
    visualize(dataset, topology);
  });
});

const visualize = (dataset, topology) => {
  const svgWidth = 1060;
  const svgHeight = 600;

  const container = d3
    .select('body')
    .append('div')
    .attr('id', 'container')
    .style('position', 'absolute')
    .style('top', '50%')
    .style('left', '50%')
    .style('transform', 'translate(-50%, -50%)')
    .style('width', `${svgWidth}px`)
    .style('height', `${svgHeight}px`);

  const title = d3
    .select('#container')
    .append('h1')
    .attr('id', 'title')
    .text('United States Educational Attainment')
    .style('position', 'absolute')
    .style('left', `${svgWidth / 2}px`)
    .style('top', '-30px')
    .style('transform', 'translate(-50%, -50%)')
    .style('width', '100%')
    .style('text-align', 'center');

  const description = d3
    .select('#container')
    .append('p')
    .attr('id', 'description')
    .html(
      `Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)`
    )
    .style('position', 'absolute')
    .style('left', `${svgWidth / 2}px`)
    .style('top', '0px')
    .style('transform', 'translate(-50%, -50%)')
    .style('width', '100%')
    .style('text-align', 'center');

  const svg = d3
    .select('#container')
    .append('svg')
    .attr('class', 'svg-container')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .style('background-color', 'white');

  // Vars
  const all = dataset.map(d => d.bachelorsOrHigher).sort((a, b) => a - b);
  const min = all[0];
  const max = all[all.length - 1];

  const color = d3
    .scaleThreshold()
    .domain(d3.range(min, max, (max - min) / 8))
    .range(d3.schemeBlues[9]);

  // Legend
  const values = [3, 12, 21, 30, 39, 48, 57, 68];
  const legend = d3.select('svg').attr('id', 'legend');

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
    .style('position', 'absolute')
    .style('left', '1015px')
    .style('top', (d, i) => `${80 + 60 * i}px`);

  // Tooltip
  const tooltip = d3
    .select('#container')
    .append('p')
    .html('')
    .attr('id', 'tooltip')
    .style('position', 'absolute')
    .style('pointer-events', 'none');

  // Draw Map
  svg
    .append('g')
    .selectAll('path')
    .data(topojson.feature(topology, topology.objects.counties).features)
    .enter()
    .append('path')
    .attr('d', d3.geoPath())
    .attr('class', 'county')
    .attr('data-fips', d => dataset.filter(x => d.id == x.fips)[0].fips)
    .attr(
      'data-education',
      d => dataset.filter(x => d.id == x.fips)[0].bachelorsOrHigher
    )
    .attr('fill', d =>
      color(dataset.filter(x => d.id == x.fips)[0].bachelorsOrHigher)
    )
    .attr('stroke', '#fff')
    .on('mouseover', (d, i) => {
      const data = dataset.filter(x => d.id == x.fips)[0];
      const x = window.innerWidth / 2 - svgWidth / 2;
      const y = window.innerHeight / 2 - svgHeight / 2;

      tooltip
        .html(
          `${data.state}: ${data.area_name}
          <br/>Percentage: ${data.bachelorsOrHigher}%`
        )
        // .text('hi')
        .attr('data-education', data.bachelorsOrHigher)
        .style('left', `${d3.event.pageX - x + 10}px`)
        .style('top', `${d3.event.pageY - y - 60}px`)
        .style('visibility', 'visible');
    })
    .on('mouseout', () => tooltip.style('visibility', 'hidden'));
};
