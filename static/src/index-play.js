const height = 600;
const width = 900;

const tickDuration  = 700;
const delayDuration = 1000;

let sequenceArray = [];
let eventArray1 = [];
let eventArray2 = [];

let title = "Most Number of Fights";
let datafile = "output_total_df.csv";
// let title = "Most Number of Wins";
// let datafile = "output_wins_df.csv";

let sequencefile = "sequence.csv";
let fighterfile = "fighters-alt.json";

const subTitle = "482 Events. 5303 Matches. 1891 Fighters.";
const subTitle2 = "Since UFC 28.";

const svg = d3.select("#bar-chart").append("svg")
   .attr("width", width)
   .attr("height", height);

const margin = {
   top: 80,
   right: 50,
   bottom: 80,
   left: 0
};

const barPadding = 0;
const bar_offset = 3;
const max_value = 15;

svg.append('text')
   .attr('class', 'title')
   .attr('y', 45)
   .html(title);
svg.append("text")
   .attr("class", "subTitle")
   .attr("y", 75)
   .html( subTitle );
svg.append("text")
   .attr("class", "caption")
   .attr("x", 10)
   .attr('y', height-28)
   .html("Sources: https://en.wikipedia.org/wiki/List_of_UFC_events");
svg.append("text")
   .attr("class", "caption")
   .attr("x", 10+42)
   .attr('y', height-16)
   .html("https://www.ufc.com");
svg.append("text")
   .attr("class", "caption")
   .attr("x", 10+42)
   .attr('y', height-4)
   .html("https://www.sherdog.com");

// Add color legend
const rect_size = 15
const rect_offset = 20
const from_top = 180;

const x1 = 750
const x2 = 770

// var keys = ['Strawweight', 'Flyweight', 'Bantamweight', 'Featherweight', 
//    'Lightweight', 'Welterweight', 'Middleweight', 'Light Heavyweight', 
//    'Heavyweight', 'Catchweight', 'Women\'s']
var keys = ['Featherweight', 
   'Lightweight', 'Welterweight', 'Middleweight', 'Light Heavyweight', 
   'Heavyweight']
var colors = {
   "Strawweight": "#AEC7E8",
   "Flyweight": "#FFBB78",
   "Bantamweight": "#98DF8A",
   "Featherweight": "#FF9896",
   "Lightweight": "#C5B0D5",
   "Welterweight": "#C39C94",
   "Middleweight": "#F7B6D2",
   "Light Heavyweight": "#BCBD22",
   "Heavyweight": "#17BECF",
   "Catchweight": "#9EDAE5",
   "Women's": "#59A14F"
}
var size = 20
svg.selectAll("legendcolors")
  .data(keys)
  .enter()
  .append("rect")
    .attr("x", x1)
    .attr("y", function(d,i){ return from_top + i*(rect_offset+5)}) 
    .attr("width", rect_size)
    .attr("height", rect_size)
    .style("fill", function(d){ return colors[d]})

svg.selectAll("legendname")
  .data(keys)
  .enter()
  .append("text")
  .attr("class","legend")
    .attr("x", x2)
    .attr("y", function(d,i){ return from_top + i*(rect_offset+5) + (rect_offset/2)}) 
    .style("fill", "#000000")
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

Promise.all([
   d3.csv(sequencefile),
   d3.csv(datafile),
   d3.json("https://raw.githubusercontent.com/cinhui/ufc-bar-chart/master/"+ fighterfile),
   ])
   .then(function(data) {

      data[0].forEach(d => {
         sequenceArray.push(d.date_formatted)
         eventArray1.push(d.event1)
         eventArray2.push(d.event2)
      })

      const sequenceStart     = 0;
      const sequenceEnd       = sequenceArray.length;
      let sequence = sequenceStart;

      // console.log(sequenceArray)

      let fighters = {};
      data[2].forEach( d => {
         fighters[d.fighter] = d.bar_color
      });

      // console.log(fighters)

      // Assign colors to each 
      data[1].forEach( d => {
         // d.color = d3.hsl(Math.random()*360,1,0.5);
         d.color = fighters[d["fighter"]]
      });

      // Add slider

      var startDate = sequenceStart;
      var endDate = sequenceEnd-1;
  
      const svg2 = d3.select("#slider").append("svg")
            .attr("width", width-2*margin.right)
            .attr("height", 100);

      var moving = false;
      var currentValue = 0;
      var targetValue = width-6*margin.right;
            
      var xslider = d3.scaleLinear()
            .domain([startDate, endDate])
            .range([0, targetValue])
            .clamp(true);
      
      var slider = svg2.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(" + 130 + "," + 45 + ")");
      
      slider.append("line")
            .attr("class", "track")
            .attr("x1", xslider.range()[0])
            .attr("x2", xslider.range()[1])
         .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-inset")
         .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-overlay")
            .call(d3.drag()
               .on("start.interrupt", function() { slider.interrupt(); })
               .on("start drag", function() {
                  currentValue = d3.event.x;
                  currentValue = d3.max([0,currentValue]);
                  updateSlider(xslider.invert(currentValue)); 
                  updateChart(xslider.invert(currentValue));
               })
            );
      
      slider.insert("g", ".track-overlay")
            .attr("class", "ticks")
            .attr("transform", "translate(0," + 20 + ")");
      
      var handle = slider.insert("circle", ".track-overlay")
            .attr("class", "handle")
            .attr("r", 6);
      
      var label = slider.append("text")  
            .attr("class", "slider")
            .attr("text-anchor", "middle")
            .text((sequenceArray[Math.floor(startDate)]))
            .attr("transform", "translate(15," + (-15) + ")");

      function updateSlider(h) {
         // console.log(h + " " + Math.floor(h))
         handle.attr("cx", xslider(h));
         label.attr("x", xslider(h))
               .text(sequenceArray[Math.floor(h)]);
      }

      function computeDataSlice(sequence){
         const values = {};

         const ret = [];
         data[1].forEach( d => {
            const name = d["fighter"];
            const txt  = d[sequence];
            let val  = 0;
            val = parseFloat(txt);
            val = Math.round(val);
            
            if( val>-1){
               ret.push({
                     name     : name,
                     color   : d.color,
                     value    : val
               });
            }
         
            values[name] = val;
         });
         
         return ret.sort((a,b) => b.value - a.value).slice(0, max_value);
      }
      
      let sequenceValue = computeDataSlice(sequence);
      sequenceValue.forEach((d,i) => d.rank = i);

      // Format axes
      let x = d3.scaleLinear()
         .domain([0, d3.max(sequenceValue, d => d.value)])
         .range([margin.left, width-margin.right-160]);

      let y = d3.scaleLinear()
         .domain([max_value, 0])
         .range([height-margin.bottom, 1.5*margin.top]);
      
      let dateText = svg.append('text')
         .attr('class', 'dateText')
         .attr('x', width-margin.right-350)
         .attr('y', 70)
         .style('text-anchor', 'begin');
      
      let eventText1 = svg.append('text')
         .attr('class', 'eventTitleText')
         .attr('x', width-margin.right-350)
         .attr('y', 90)
         .style('text-anchor', 'begin');
      let eventText2 = svg.append('text')
         .attr('class', 'eventTitleText')
         .attr('x', width-margin.right-350)
         .attr('y', 110)
         .style('text-anchor', 'begin');

      // console.log(sequenceValue)
      dateText.html(sequenceArray[sequence]);
      eventText1.html(eventArray1[sequence]);
      eventText2.html(eventArray2[sequence]);

      svg.selectAll('rect.bar')
         .data(sequenceValue, d => d.name)
         .enter()
         .append('rect')
         .attr('class', 'bar')
         .attr('x', x(0)+1)
         .attr('width', d => x(d.value)-x(0))
         .attr('y', d => y(d.rank)+5)
         .attr('height', y(1)-y(0)-barPadding)
         .style('fill', d => d.color);

      svg.selectAll('text.label')
         .data(sequenceValue, d => d.name)
         .enter()
         .append('text')
         .attr('class', 'label')
         .attr('x', d => x(d.value)-8)
         .attr('y', d => y(d.rank)+((y(1)-y(0))/2)+13)
         .style('text-anchor', 'end')
         .html(d => d.name);

      svg.selectAll('text.valueLabel')
         .data(sequenceValue, d => d.name)
         .enter()
         .append('text')
         .attr('class', 'valueLabel')
         .attr('x', d => x(d.value)+5)
         .attr('y', d => y(d.rank)+((y(1)-y(0))/2)+13)
         .text(d => { if(sequence > 0) {return d.value} else { return "" }})

      function updateChart(h){
      
            sequence = d3.format(".0f")(h)
            dateText.html(sequenceArray[sequence]);
            eventText1.html(eventArray1[sequence]);
            eventText2.html(eventArray2[sequence]);

            // console.log(sequenceArray[sequence] + " " + sequence + " " + sequenceEnd)
            
            sequenceValue = computeDataSlice(sequence);
            sequenceValue.forEach((d,i) => d.rank = i);

            // console.log(sequenceValue)
            
            x.domain([0, d3.max(sequenceValue, d => d.value)]); 
      
            var bars = svg.selectAll('.bar').data(sequenceValue, d => d.name);
      
            bars
               .enter()
               .append('rect')
               .attr('class', d => `bar ${d.name.replace(/\s/g,'_')}`)
               .attr('x', x(0)+1)
               .attr( 'width', d => x(d.value)-x(0))
               .attr('y', d => y(max_value+1)+5)
               .attr('height', y(1)-y(0)-barPadding)
               .style('fill', d => d.color)
               .transition()
               .duration(tickDuration)
               .ease(d3.easeLinear)
               .attr('y', d => y(d.rank)+5);
            
            bars
               .transition()
               .duration(tickDuration)
               .ease(d3.easeLinear)
               .attr('width', d => Math.max(0, x(d.value)-x(0)))
               .attr('y', d => y(d.rank)+5);
      
            bars
               .exit()
               .remove();
      
            var labels = svg.selectAll('.label')
               .data(sequenceValue, d => d.name);
      
            labels
               .enter()
               .append('text')
               .attr('class', 'label')
               .attr('x', d => x(d.value)-8)
               .attr('y', d => y(max_value+1)+((y(1)-y(0))/2)+13)
               .style('text-anchor', 'end')
               .html(d => d.name)    
               .transition()
               .duration(tickDuration)
               .ease(d3.easeLinear)
               .attr('y', d => y(d.rank)+((y(1)-y(0))/2)+13);
            
            labels
               .transition()
               .duration(tickDuration)
               .ease(d3.easeLinear)
               .attr('x', d => x(d.value)-8)
               .attr('y', d => y(d.rank)+((y(1)-y(0))/2)+13);
      
            labels
               .exit()
               .remove();
      
            var valueLabels = svg.selectAll('.valueLabel').data(sequenceValue, d => d.name);
      
            valueLabels
               .enter()
               .append('text')
               .attr('class', 'valueLabel')
               .attr('x', d => x(d.value)+5)
               .attr('y', d => y(max_value+1)+((y(1)-y(0))/2)+13)
               .text(d => {if(d.value > 0) {return d.value} else { return "" }})
               .transition()
               .duration(tickDuration)
               .ease(d3.easeLinear)
               .attr('y', d => y(d.rank)+((y(1)-y(0))/2)+13);

            valueLabels
               .transition()
               .duration(tickDuration)
               .ease(d3.easeLinear)
               .text(d => { if(d.value > 0) {return d.value} else { return "" }})
               .attr('x', d => x(d.value)+5)
               .attr('y', d => y(d.rank)+((y(1)-y(0))/2)+13);
      
            valueLabels
               .exit()
               .remove();
      }

      updateChart(sequenceStart);

      var playButton = d3.select("#button");

      playButton
         .on("click", function() {
            var button = d3.select(this);
            // console.log(currentValue)
            if (button.text() == "Pause") {
               moving = false;
               clearInterval(timer);
               button.text("Resume");
            } else {
               moving = true;
               timer = setInterval(step, 1000);
               button.text("Pause");
            }
         })
      
      function step() {
            updateSlider(xslider.invert(currentValue)); 
            updateChart(xslider.invert(currentValue));
            currentValue = currentValue + 1;
            if (currentValue > targetValue) {
              moving = false;
              currentValue = 0;
              clearInterval(timer);
              playButton.text("Play");
            }
          }

})



