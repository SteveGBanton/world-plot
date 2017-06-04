import './stylesheets/index.scss'
var d3 = require('d3')
var $ = require('jquery')
var topojson = require('topojson')

var masses = [];


//Get meteorite strike data
$.getJSON("https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json", function(data) {

  var data1 = data;

for (var i = 0; i < data1.features.length; i++) {
    masses.push(data1.features[i].properties.mass === null ? 1 : data1.features[i].properties.mass * 1)

}
  worldMap(data1)
});


//Function to plot the world map using topojson
function worldMap(data) {

  var width = 960,
      height = 480;

  var projection = d3.geoEquirectangular()
      .scale(height / Math.PI)
      .translate([width / 2, height / 2]);

  var path = d3.geoPath()
      .projection(projection);

  var graticule = d3.geoGraticule();

  var svg = d3.select("#chart").append("svg")
      .attr("width", width)
      .attr("height", height)

  d3.json("https://d3js.org/world-50m.v1.json", function(error, world) {
      if (error) throw error;

      svg.insert("path", ".graticule")
          .datum(topojson.feature(world, world.objects.land))
          .attr("class", "land")
          .attr("d", path);

      //Plot data after rendering map
      plotData(data)
  });

}

//Plot chart & manage zoom functions

function plotData(data) {

  var width = 960,
      height = 480,
      xScale = d3.scaleLinear()
      .domain([0, 360])
      .range([0, width]),
      yScale = d3.scaleLinear()
      .domain([180, 0])
      .range([0, height]),
      rScale = d3.scaleLinear()

      .domain([1, d3.max(masses)])
      .range([0.3, 20]),
      tooltip = d3.select('body')
      .append('div')
      .style('background', 'white')
      .style('font-size', '10px')
      .style('line-height', '100%')
      .style('position', 'absolute')
      .style('padding', '5px')
      .style('border-radius', '3px')
      .style('opacity', '0')
  .style('box-shadow','0 3px 5px 3px rgba(0,0,0,0.25), 0 3px 3px 2px rgba(0,0,0,0.22)')

  var palette = {
      'lightgray': '#819090',
      'gray': '#708284',
      'mediumgray': '#536870',
      'darkgray': '#475B62',
      'red': '#9e0142',
      'lightred': '#d53e4f',
      'orange': '#f46d43',
      'lightorange': '#fdae61',
      'yelloworange': '#fee08b',
      'paleyellow': '#ffffbf',
      'lightgreen': '#e6f598',
      'green': '#abdda4',
      'teal': '#66c2a5',
      'blue': '#3288bd',
      'purple': '#5e4fa2'
  }

  var chart = d3.select("#chart")
      .select('svg')
      .call(d3.zoom().on("zoom", zoomed2))

  var dots = d3.select('svg')
      .append('g')
      .attr('height', height)
      .attr('width', width)
      .attr('height', height)
      .attr('width', width)
      .selectAll('circle')
      .data(data.features)
      .enter()
      .append('circle')
      .attr('opacity', '0.7')
      .attr('cx', function(d, i) {
          return xScale((d.geometry === null ? 1 : d.geometry.coordinates[0]) + 180)
          //return xScale((-34.26)+180)
      })
      .attr('cy', function(d, i) {
          return yScale((d.geometry === null ? 1 : d.geometry.coordinates[1]) + 90)
      })
      .attr('r', function(d, i) {
          return rScale(d.properties.mass < 1 ? 1 : d.properties.mass);
      })
      .attr('fill', palette.red)
      .on('mouseover', function(d, i) {
          d3.select(this)
              .style('opacity', '0.8')

          tooltip.transition()
              .style('opacity', '1')
          tooltip.html('Mass: '+d.properties.mass + ' g<br>Name: '+d.properties.name+'<br>Year: '+ d.properties.year.substring(0,4)+'<br>Coordinates (Latitude : Longitude):<br> '+d.geometry.coordinates[1] + ' : ' +d.geometry.coordinates[0])
              .style('left', d3.event.pageX + 8 + 'px')
              .style('top', d3.event.pageY - 50 + 'px')


      })
  .on("mousemove", function() {
          return tooltip.style("top", (d3.event.pageY - 50) + "px").style("left", (d3.event.pageX + 8) + "px");
      })
      .on('mouseout', function(d, i) {
          d3.select(this)
              .style('opacity', '0.6')
    tooltip.style('opacity', '0').style("top", (-999) + "px").style("left", (-999) + "px");
      })

  function zoomed2() {

    var xTransform,
        yTransform

    if (d3.event.transform.k <= 1) {
      xTransform = 0;
      yTransform = 0;
    } else {
      xTransform = d3.event.transform.x
      yTransform = d3.event.transform.y
    }

    if (d3.event.transform.k <= 1) {
      d3.event.transform.k = 1
      d3.event.transform.y = 0
      d3.event.transform.x = 0
    }

      chart.select('g').attr("transform", "translate(" + xTransform + ',' + yTransform + ") scale(" + Math.max(1,d3.event.transform.k) + ")");

      chart.select('path').attr("transform", "translate(" + xTransform + ',' + yTransform + ") scale(" + Math.max(1,d3.event.transform.k) + ")");

  }

}
