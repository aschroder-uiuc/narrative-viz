const width = 400
const height = 400
const gMargin = 40

rankRange = [0,height]
rankDomain = [1, 2, 3, 4, 5, 6]
rb = d3.scaleBand().domain(rankDomain).range(rankRange)

const data = [
  {
    breed: 'Labrador Retriever',
    ranking: [{
      year: 2013,
      rank: 1
    }, 
    {
      year: 2014,
      rank: 2
    },
    {
      year: 2015,
      rank: 2
    }]
  },
  {
    breed: 'Beagle',
    ranking: [{
      year: 2013,
      rank: 2
    }, 
    {
      year: 2014,
      rank: null
    },
    {
      year: 2015,
      rank: 1
    }]
  },
  {
    breed: 'Boxer',
    ranking: [{
      year: 2013,
      rank: null
    }, 
    {
      year: 2014,
      rank: 1
    },
    {
      year: 2015,
      rank: null
    }]
  }
]

function loadInitialYearRanking(year) {
  //setup svg size
  d3.select('svg').attr('width', width).attr('height', height)

  //setup g elements to contain elements to move together
  const gSet = d3.select('svg').selectAll('g').data(data).enter().append('g')
  .attr('id', function (d) {return d.breed})
  .attr('transform', (d) => `translate(${gMargin}, ${getYByRank(d.ranking, year)})`);

  //add rectangles to each
  gSet.append('rect')
  .attr('x', 0)
  .attr('y', 0) 
  .attr('width', 100)
  .attr('height', 30) 
  .attr('fill', 'purple')

  //add text to each
  gSet.append('text')
  .attr('x', 10)
  .attr('y', 20)
  .text(function(d) {return d.breed})
}

function moveYearRanking(year) {
  const gSet = d3.select('svg').selectAll('g')
  gSet.transition().duration(1500)
  .attr('transform', (d) => `translate(${gMargin}, ${getYByRank(d.ranking, year)})`);
}

function getYByRank(rankArray, year){
  const ranking = rankArray.find((element) => element.year === year);
  const rank = ranking.rank ? ranking.rank : 6;
  return rb(rank)
}