const width = 800
const height = 500
const exploreWidth = 450
const axisWidth = 200
const axisHeight = height
const gMargin = 0
const barWidth = 350

rankRange = [0,height + 100]
rankDomain = [1, 2, 3, 4, 5, 6]
rb = d3.scaleBand().domain(rankDomain).range(rankRange)

async function loadAndProcessData (limit) {
  const inputFile = 'https://raw.githubusercontent.com/aschroder-uiuc/aschroder-uiuc.github.io/main/data/popular_breeds_by_year.csv'
  const inputData = await d3.csv(inputFile)
  
  const yearArray = []
  const breedMap = new Map()
  const breedArray = []

  for (let yearData of inputData){
    const year = yearData.year
    yearArray.push(year)
    let ranking = yearData.ranking.split(',')

    //truncate ranking array as necessary
    ranking = ranking.slice(0, limit)

    for (let rankIndex in ranking){
      const breed = ranking[rankIndex]
      const rankData = { year: year, rank: +rankIndex + 1 }
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
  window.limit = limit
  window.data = breedArray

  //add description data
  const descriptionFile = 'https://raw.githubusercontent.com/aschroder-uiuc/aschroder-uiuc.github.io/main/data/breed_descriptions.csv'
  window.description = await d3.csv(descriptionFile) 
}

function loadInitialYearRanking(year, width) {
  //setup svg size
  d3.select('svg#chart-svg').attr('width', width).attr('height', height)

  //setup g elements to contain elements to move together
  const gSet = d3.select('svg#chart-svg').selectAll('g').data(data).enter().append('g')
  .attr('id', function (d) { return d.breed })
  .attr('class', 'breed-g')
  .attr('transform', (d) => `translate(${gMargin}, ${getYByRank(d.ranking, year)})`)

  //add rectangles to each
  gSet.append('rect')
  .attr('x', 0)
  .attr('y', 0) 
  .attr('width', barWidth)
  .attr('height', 30) 

  //add text to each
  gSet.append('text')
  .attr('x', 10)
  .attr('y', 20)
  .text(function(d) {return d.breed})
}

function moveYearRanking(year) {
  const yearHeader = document.getElementById('explore-year-display')
  yearHeader.innerHTML = `Year ${year}`
  const gSet = d3.select('svg#chart-svg').selectAll('g')
  gSet.transition().duration(1500)
  .attr('transform', (d) => `translate(${gMargin}, ${getYByRank(d.ranking, year)})`);
}

function getYByRank(rankArray, year){
  const rankRange = [0,height + 100]
  const rankDomain = []
  for (let i = 1; i <= limit + 3; i++) {
    rankDomain.push(i)
  }
  rb = d3.scaleBand().domain(rankDomain).range(rankRange)
  const ranking = rankArray.find((element) => element.year === year);
  const rank = ranking.rank ? ranking.rank : limit + 3;
  return rb(rank)
}

function buildAxisMain() {
  d3.select('svg#axis-svg').attr('width', axisWidth).attr('height', axisHeight)
  d3.select('svg#axis-svg').selectAll('g').remove()

  let rankStringArray = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th']
 rankStringArray =  rankStringArray.slice(0, limit)

  const rankRange = [0,height + 100]
  const rankDomain = []
  for (let i = 1; i <= limit + 3; i++) {
    rankDomain.push(i)
  }
  rb = d3.scaleBand().domain(rankDomain).range(rankRange) 
  console.log(rankStringArray)

  d3.select('svg#axis-svg').selectAll('text').data(rankStringArray).enter().append('text')
    .attr('transform',  function(d, i) {return `translate(${gMargin + axisWidth - 50}, ${rb(i + 1) + 20})`})
    .text(function(d) {return d})

  d3.select('svg#axis-svg').selectAll('g').data([1]).enter().append('line')
    .attr('x1', axisWidth - 5)
    .attr('y1', rb(1) + 10)
    .attr('x2', axisWidth - 5)
    .attr('y2', rb(limit) + 20)
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
}

function buildAxisExplore() {
  d3.select('svg#axis-svg').attr('width', axisWidth).attr('height', axisHeight)
  d3.select('svg#axis-svg').selectAll('g').remove()

  const rankRange = [0,height + 100]
  const rankDomain = []
  for (let i = 1; i <= limit + 3; i++) {
    rankDomain.push(i)
  }
  rb = d3.scaleBand().domain(rankDomain).range(rankRange)

  d3.select('svg#axis-svg').selectAll('g').data([1, 2, 3]).enter().append('g')
  d3.select('svg#axis-svg').select('g:nth-child(1)').append('text')
    .attr('transform',  `translate(${gMargin + 55}, ${rb(1) + 20})`)
    .text('Most Popular')

  d3.select('svg#axis-svg').select('g:nth-child(2)').append('line')
    .attr('x1', 100)
    .attr('y1', `${rb(1) + 30}`)
    .attr('x2', 100)
    .attr('y2', `${rb(limit) - 10}`)
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
  
  d3.select('svg#axis-svg').select('g:nth-child(3)').append('text')
    .attr('transform',  `translate(${gMargin + 55},  ${rb(limit) +20})`)
    .text('Less Popular')
}

function clearSVG() {
  d3.select('svg#chart-svg').selectAll('g').remove()
}

function setupInteractivity() {
  const gSet = d3.select('svg#chart-svg').selectAll('g')
  .on('mouseover', function () {
    d3.select(this).select('rect')
      .style('fill', 'rgb(250, 145, 163)')
      .style('cursor','pointer')
    d3.select(this).select('text')
      .style('cursor','pointer')
  })
  .on('mouseout', function () {
    d3.select(this).select('rect')
    .style('fill', 'pink')
  })
  .on('click', function (d) {
    descriptionData = getDescriptionData(d.breed)
    d3.select('div#description-div').selectAll('*').remove()
    d3.select('div#description-div').append('h2').text('About the Breed: ' + d.breed)
    d3.select('div#description-div').append('p').text(descriptionData.description)
    d3.select('div#description-div').append('a')
      .attr('href', descriptionData.link)
      .attr('target', '_blank')
      .text('Find out more from the American Kennel Club.')

  })
}

function setupTooltip(year) {
  d3.select('svg#chart-svg').selectAll('g.breed-g')
  .on('mouseover', function (d) {
    const rank = d.ranking.find((element) => element.year === year).rank
    d3.select('svg#chart-svg').append('text')
      .attr('id', 'tooltip')
      .attr('x', d3.mouse(this)[0])
      .attr('y', d3.event.pageY - 190)
      .text(`Year: ${year} - Rank: ${rank}`)
  })
  .on('mousemove', function() {
    d3.select('svg#chart-svg').select('text#tooltip')
    .attr('x', d3.mouse(this)[0])
    .attr('y', d3.event.pageY - 190)
  })
  .on('mouseout', function () {
    d3.select(this).select('rect')
      .style('fill', 'pink')
    d3.select('svg#chart-svg').select('text#tooltip').remove()
  })
}

function getDescriptionData(breed) {
  const descriptionData = description.find((element) => element.breed === breed);
  console.log(descriptionData)
  return descriptionData;
}
//////////////////////////////////////
// Annotations
//////////////////////////////////////

function getAnnotations(year) {
  let annotations;

  const annotations1 = [{
    note: {
      title: 'English Bulldog',
      bgPadding: {'top':15,'left':10,'right':10,'bottom':10},
      label: "The Frenchie's bigger and wrinklier cousin has been a fan-favorite for years"
    },
    x: barWidth + gMargin,
    y: getYByRank(data.find((element) => element.breed === 'English Bulldog').ranking, 2016) + 10,
    className: 'annotation',
    dy: -80,
    dx: 160,
    connector: {
      end: 'arrow'
    },
  },
  {
    note: {
      title: 'Beagles',
      bgPadding: {'top':15,'left':10,'right':10,'bottom':10},
      label: 'The smallest breed in the top 5, Beagles have an expected weight of 20 - 30 pounds',
    },
    x: barWidth + gMargin,
    y: getYByRank(data.find((element) => element.breed === 'Beagle').ranking, 2016) + 10,
    className: 'annotation',
    dy: -10,
    dx: 160,
    connector: {
      end: 'arrow'
    },
  }]

  const annotations2 = [{
    note: {
      title: 'German Shepherd Dog',
      bgPadding: {'top':15,'left':10,'right':10,'bottom':10},
      label: "The German Shepherd maintains it's position above Goldens"
    },
    x: barWidth + gMargin,
    y: getYByRank(data.find((element) => element.breed === 'German Shepherd Dog').ranking, 2020) + 10,
    className: 'annotation',
    dy: -10,
    dx: 160,
    connector: {
      end: 'arrow'
    },
  },
  {
    note: {
      title: 'English Bulldog',
      bgPadding: {'top':15,'left':10,'right':10,'bottom':10},
      label: '2020 is the last year that the Bulldog stay in the top 5',
    },
    x: barWidth + gMargin,
    y: getYByRank(data.find((element) => element.breed === 'English Bulldog').ranking, 2020) + 10,
    className: 'annotation',
    dy: -10,
    dx: 160,
    connector: {
      end: 'arrow'
    },
  }]
  const annotations3 = [{
    note: {
      title: 'Golden Retriever',
      bgPadding: {'top':15,'left':10,'right':10,'bottom':10},
      label: 'In another upset, the Golden finally beats out the GSD for the number 3 spot.'
    },
    x: barWidth + gMargin,
    y: getYByRank(data.find((element) => element.breed === 'Golden Retriever').ranking, 2022) + 10,
    className: 'annotation',
    dy: -10,
    dx: 160,
    connector: {
      end: 'arrow'
    },
  },
  {
    note: {
      title: 'Poodle',
      bgPadding: {'top':15,'left':10,'right':10,'bottom':10},
      label: 'Although the miniature poodles are very popular, the standard is in the top 5.',
    },
    x: barWidth + gMargin,
    y: getYByRank(data.find((element) => element.breed === 'Poodle').ranking, 2022) + 10,
    className: 'annotation',
    dy: -10,
    dx: 160,
    connector: {
      end: 'arrow'
    },
  }]

  switch(year) {
    case 2016:
      annotations = annotations1
      break;
    case 2020:
      annotations = annotations2
      break;
    case 2022:
      annotations = annotations3
  }

  return annotations
}

function createAnnotations(year) {
  const type = d3.annotationCallout
  const annotations = getAnnotations(year)

  const makeAnnotations = d3.annotation()
    .notePadding(15)
    .type(type)
    .annotations(annotations)

  d3.select('svg#chart-svg')
    .append('g')
    .call(makeAnnotations)
}

async function initializeDataAndCreateAnnotations(year) {
  await loadAndProcessData(5)
  loadInitialYearRanking(year, width)
  createAnnotations(year)
  buildAxisMain()
  setupTooltip(year)
}

async function initializeAndLoadData(year, limit = 5) {
  clearSVG()
  await loadAndProcessData(limit)
  loadInitialYearRanking(year, exploreWidth)
  buildAxisExplore()
  setupInteractivity()
  d3.select('svg#chart-svg').selectAll('g').selectAll('rect')
    .attr('stroke', 'grey')
    .attr('stroke-width', '2')
  const yearHeader = document.getElementById('explore-year-display')
  yearHeader.innerHTML = `Year ${year}`
}