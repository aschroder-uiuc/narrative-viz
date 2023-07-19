    xdomain = [0,6]
    xrange = [0,200]
    ydomain = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    yrange = [200,0]
    xs = d3.scaleLinear().domain(xdomain).range(xrange)
    ys = d3.scaleLinear().domain(ydomain).range(yrange)
    xb = d3.scaleBand().domain([0, 1, 2, 3, 4, 5]).range(xrange)
    yb = d3.scaleBand().domain(ydomain).range(yrange)
    const data1 = [{year: 2013, ranking: ['Lab', 'Golden', 'Boxer', 'Beagle', 'GSD']}, {year: 2014, ranking: ['Lab', 'Golden', 'GSD', 'Frenchie', 'Poodle']}]
    function loadInitialYearRanking() {
      d3.select('svg').select('g').attr('transform', 'translate(50,50)')
      d3.select('svg').select('g#chart').selectAll('rect').data(data1[0].ranking).enter().append('rect')
        .attr('x', 20)
        .attr('y', function(d,i) {return xb(i)})
        .attr('width', function(d,i) {return 300 - i* 40})
        .attr('height', 20)
      d3.select('svg').select('g#chart').selectAll('text').data(data1[0].ranking).enter().append('text')
        .attr('x', function(d,i) {return 250 - i* 40})
        .attr('y', function(d,i) {return xb(i) + 15})
        .attr('width', 100)
        .attr('height', 20)
        .text(function(d) {return d})
      d3.select('svg').select('g#xaxis').attr('transform', 'translate(50,250)')
      d3.select('svg').select('g#xaxis')
        .attr('x', 20)
        .call(d3.axisBottom(xb).tickValues([1, 2, 3, 4, 5]))
    }
    function loadYearData(year) {
      const yearData = data1.filter(function(input) {return input.year === year})
      const rankData = yearData[0].ranking
      clearChartBars()
      d3.select('svg').select('g#chart').selectAll('rect').data(rankData).enter().append('rect')
        .attr('x', 20)
        .attr('y', function(d,i) {return xb(i)})
        .attr('width', function(d,i) {console.log(d); return 300 - i* 40})
        .attr('height', 20)
        .text('hi')
      d3.select('svg').select('g#chart').selectAll('text').data(rankData).enter().append('text')
        .attr('x', function(d,i) {console.log(d); return 250 - i* 40})
        .attr('y', function(d,i) {return xb(i) + 15})
        .attr('width', 100)
        .attr('height', 20)
        .text(function(d) {return d})
    }

    function clearChartBars(){
      d3.select('svg').selectAll('rect').remove()
      d3.select('svg').selectAll('text').remove()
    }