const width = 600
const height = 400
const gMargin = 40
const barWidth = 250

rankRange = [0,height + 100]
rankDomain = [1, 2, 3, 4, 5, 6]
rb = d3.scaleBand().domain(rankDomain).range(rankRange)

async function loadAndProcessData () {
  const inputFile = 'https://raw.githubusercontent.com/aschroder-uiuc/aschroder-uiuc.github.io/main/popular_breeds_by_year.csv'
  const inputData = await d3.csv(inputFile)
  
  const yearArray = []
  const breedMap = new Map()
  const breedArray = []
  
  for (let yearData of inputData){
    const year = yearData.year
    yearArray.push(year)
    const ranking = yearData.ranking.split(',')
    for (let rankIndex in ranking){
      const breed = ranking[rankIndex]
      const rankData = {year: year, rank: +rankIndex + 1 }
      if (breedMap.get(breed)){
        const currentArray = breedMap.get(breed)
        const updatedArray = [...currentArray, rankData]
        breedMap.set(breed, updatedArray)
      }
      else {
        breedMap.set(breed, [rankData])
      }
    }
  }

  const allBreeds = breedMap.keys()
  for (const breed of allBreeds){
    const breedData = breedMap.get(breed)
    for (const year of yearArray){
      const rank = breedData.find((element) => element.year === year);
      const yearRanking = {year: +year, rank: rank?.rank ? rank?.rank : null}
      const breedInArray = breedArray.find((element) => element.breed === breed)
      if (breedInArray){
        breedInArray.ranking.push(yearRanking)
      }
      else{
        breedArray.push({
          breed: breed,
          ranking:[ yearRanking ]
        })
      }
    }
  }
  window.data = breedArray
}

function loadInitialYearRanking(year) {
  console.log(data)
  //setup svg size
  d3.select('svg#chart-svg').attr('width', width).attr('height', height)

  //setup g elements to contain elements to move together
  const gSet = d3.select('svg#chart-svg').selectAll('g').data(data).enter().append('g')
  .attr('id', function (d) {return d.breed})
  .attr('transform', (d) => `translate(${gMargin}, ${getYByRank(d.ranking, year)})`);

  //add rectangles to each
  gSet.append('rect')
  .attr('x', 0)
  .attr('y', 0) 
  .attr('width', barWidth)
  .attr('height', 30) 
  .attr('fill', 'purple')

  //add text to each
  gSet.append('text')
  .attr('x', 10)
  .attr('y', 20)
  .text(function(d) {return d.breed})
}

function moveYearRanking(year) {
  const gSet = d3.select('svg#chart-svg').selectAll('g')
  gSet.transition().duration(1500)
  .attr('transform', (d) => `translate(${gMargin}, ${getYByRank(d.ranking, year)})`);
}

function getYByRank(rankArray, year){
  const ranking = rankArray.find((element) => element.year === year);
  const rank = ranking.rank ? ranking.rank : 6;
  return rb(rank)
}

function buildAxis() {
  d3.select('svg#axis-svg').selectAll('g').data([1, 2, 3]).enter().append('g')
  d3.select('svg#axis-svg').select('g:nth-child(1)').append('text')
    .attr('x', 10)
    .attr('y', 20)
    .text('top')

    d3.select('svg#axis-svg').select('g:nth-child(2)').append('line')
    .attr('x1', 100)
    .attr('y1', 40)
    .attr('x2', 100)
    .attr('y2', 160)
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
  
    d3.select('svg#axis-svg').select('g:nth-child(3)').append('text')
    .attr('x', 10)
    .attr('y', 100)
    .text('bottom')
}

//////////////////////////////////////
// Annotations
//////////////////////////////////////

function getAnnotations() {
  const annotations = [{
    note: {
      title: "I have a thing to say about Goldens",
      bgPadding: {"top":15,"left":10,"right":10,"bottom":10},
      label: "They are nice but the shedding omg"
    },
    x: barWidth + gMargin,
    y: getYByRank(data.find((element) => element.breed === 'Golden Retriever').ranking, 2016) + 10,
    className: "annotation",
    dy: -40,
    dx: 160,
    connector: {
      end: "arrow"
    },
  },
  {
    note: {
      title: "I have a thing to say about Beagles",
      bgPadding: {"top":15,"left":10,"right":10,"bottom":10},
      label: "They are too loud and they smell",
    },
    x: barWidth + gMargin,
    y: getYByRank(data.find((element) => element.breed === 'Beagle').ranking, 2016) + 10,
    className: "annotation",
    dy: -10,
    dx: 160,
    connector: {
      end: "arrow"
    },
  }]

  return annotations
}

function createAnnotations() {
  const type = d3.annotationCallout
  const annotations = getAnnotations()

  const makeAnnotations = d3.annotation()
    .notePadding(15)
    .type(type)
    .annotations(annotations)

  d3.select("svg#chart-svg")
    .append("g")
    .call(makeAnnotations)
}

async function initalizeAndLoad(year) {
  await loadAndProcessData()
  loadInitialYearRanking(year)
  createAnnotations()
  buildAxis()
}