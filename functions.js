const width = 600
const height = 400
const gMargin = 40
const barWidth = 175

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

async function initalizeAndLoad(year) {
  await loadAndProcessData()
  loadInitialYearRanking(year)
}

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
  const gSet = d3.select('svg').selectAll('g')
  gSet.transition().duration(1500)
  .attr('transform', (d) => `translate(${gMargin}, ${getYByRank(d.ranking, year)})`);
}

function getYByRank(rankArray, year){
  const ranking = rankArray.find((element) => element.year === year);
  const rank = ranking.rank ? ranking.rank : 6;
  return rb(rank)
}

//////////////////////////////////////
// Annotations
//////////////////////////////////////

const type = d3.annotationCallout

const annotations = [{
  note: {
    label: "I'm doing it!!!!",
    bgPadding: {"top":15,"left":10,"right":10,"bottom":10},
    title: "I have a thing to say"
  },
  //can use x, y directly instead of data
 // data: { date: "18-Sep-09", close: 185.02 },
 x: barWidth + gMargin,
 y: getYByRank(data[1].ranking, 2013),
  className: "show-bg",
  dy: 137,
  dx: 162,
  connector: {
    end: "arrow" // 'dot' also available
  },
}]

const parseTime = d3.timeParse("%d-%b-%y")
const timeFormat = d3.timeFormat("%d-%b-%y")

//Skipping setting domains for sake of example
const x = d3.scaleTime().range([0, 200])
const y = d3.scaleLinear().range([200, 0])

const makeAnnotations = d3.annotation()
  .notePadding(15)
  .type(type)
  .annotations(annotations)

function createAnnotations() {
d3.select("svg")
  .append("g")
  .attr("class", "annotation-group")
  .call(makeAnnotations)
}