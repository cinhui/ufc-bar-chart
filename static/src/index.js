const height = 600;
const width = 900;

const tickDuration  = 700;
const delayDuration = 1000;

let sequenceArray = [];

let option = "total";
// let option = "wins";

let title = "Most Number of Fights";
let filename = "output_"+option+"_df.csv";
if(option == "wins"){
   title = "Most Number of Wins";
}


const subTitle = "482 Events. 5307 Matches. 1891 Fighters. Records since UFC 28.";

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
const from_top = 170;

const x1 = 750
const x2 = 770

svg.append("rect")
   .attr("x",x1).attr("y", from_top+rect_offset)
   .attr("width", rect_size).attr("height", rect_size)
   .style("fill", "#efe350b2");
svg.append("text")
   .attr("class", "legend")
   .attr("x",x2).attr("y", from_top+rect_offset+12)
   .attr("alignment-baseline","middle")
   .text("Strawweight");
svg.append("rect")
   .attr("x",x1).attr("y", from_top+2*rect_offset)
   .attr("width", rect_size).attr("height", rect_size)
   .style("fill", "#f9b641b2");
svg.append("text")
   .attr("class", "legend")
   .attr("x",x2).attr("y", from_top+2*rect_offset+12)
   .attr("alignment-baseline","middle")
   .text("Flyweight");
svg.append("rect")
   .attr("x",x1).attr("y", from_top+3*rect_offset)
   .attr("width", rect_size).attr("height", rect_size)
   .style("fill", "#f68f46b2");
svg.append("text")
   .attr("class", "legend")   
   .attr("x",x2).attr("y", from_top+3*rect_offset+12)
   .attr("alignment-baseline","middle")
   .text("Bantamweight");
svg.append("rect")
   .attr("x",x1).attr("y", from_top+4*rect_offset)
   .attr("width", rect_size).attr("height", rect_size)
   .style("fill", "#de7065b2");
svg.append("text")
   .attr("class", "legend")
   .attr("x",x2).attr("y", from_top+4*rect_offset+12)
   .attr("alignment-baseline","middle")
   .text("Featherweight");
svg.append("rect")
   .attr("x",x1).attr("y", from_top+5*rect_offset)
   .attr("width", rect_size).attr("height", rect_size)
   .style("fill", "#b8627db2");
svg.append("text")
   .attr("class", "legend")
   .attr("x",x2).attr("y", from_top+5*rect_offset+12)
   .attr("alignment-baseline","middle")
   .text("Lightweight");
svg.append("rect")
   .attr("x",x1).attr("y", from_top+6*rect_offset)
   .attr("width", rect_size).attr("height", rect_size)
   .style("fill", "#90548bb2");
svg.append("text")
   .attr("class", "legend")   
   .attr("x",x2).attr("y", from_top+6*rect_offset+12)
   .attr("alignment-baseline","middle")
   .text("Welterweight");
svg.append("rect")
   .attr("x",x1).attr("y", from_top+7*rect_offset)
   .attr("width", rect_size).attr("height", rect_size)
   .style("fill", "#7e4e90b2");
svg.append("text")
   .attr("class", "legend")
   .attr("x",x2).attr("y", from_top+7*rect_offset+12)
   .attr("alignment-baseline","middle")
   .text("Middleweight");
svg.append("rect")
   .attr("x",x1).attr("y", from_top+8*rect_offset)
   .attr("width", rect_size).attr("height", rect_size)
   .style("fill", "#593d9cb2");
svg.append("text")
   .attr("class", "legend")   
   .attr("x",x2).attr("y", from_top+8*rect_offset+12)
   .attr("alignment-baseline","middle")
   .text("Light Heavyweight");
svg.append("rect")
   .attr("x",x1).attr("y", from_top+9*rect_offset)
   .attr("width", rect_size).attr("height", rect_size)
   .style("fill", "#253582b2");
svg.append("text")
   .attr("class", "legend")
   .attr("x",x2).attr("y", from_top+9*rect_offset+12)
   .attr("alignment-baseline","middle")
   .text("Heavyweight");
svg.append("rect")
   .attr("x",x1).attr("y", from_top+10*rect_offset)
   .attr("width", rect_size).attr("height", rect_size)
   .style("fill", "#5da25da5");
svg.append("text")
   .attr("class", "legend")   
   .attr("x",x2).attr("y", from_top+10*rect_offset+12)
   .attr("alignment-baseline","middle")
   .text("Catchweight");

Promise.all([
   d3.csv("sequence.csv"),
   d3.csv(filename),
   d3.json("https://raw.githubusercontent.com/cinhui/ufc-bar-chart/master/fighters.json"),
   ])
   .then(function(data) {

      data[0].forEach(d => {
         sequenceArray.push(d.date_formatted)
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

      let lastValues = {};
   
      function _normalizeData(){
         const values = {};
   
         const ret = [];
         data[1].forEach( d => {
            const name = d["fighter"];
            const txt  = d[sequence];
            let val  = 0;
            val = parseFloat(txt);
            val = Math.round(val);
   
            let lastValue = lastValues[ name ];
            if( lastValue == null )
               lastValue = val;
            
            if( val>-1){
               ret.push({
                     name     : name,
                     color   : d.color,
                     value    : val,
                     lastValue: lastValue
               });
            }
            
         //    console.log(val)
            values[name] = val;
         });
         
         lastValues = values;
   
         return ret.sort((a,b) => b.value - a.value).slice(0, max_value);
      }
   
      let sequenceValue = _normalizeData();
      sequenceValue.forEach((d,i) => d.rank = i);

      // Format axes
      let x = d3.scaleLinear()
         .domain([0, d3.max(sequenceValue, d => d.value)])
         .range([margin.left, width-margin.right-120]);
   
      let y = d3.scaleLinear()
         .domain([max_value, 0])
         .range([height-margin.bottom, margin.top]);
   
      let xAxis = d3.axisTop()
         .scale(x)
         .ticks(width > 500 ? 5:2)
         .tickSize(-(height-margin.top-margin.bottom))
         .tickFormat("");
   
      // svg.append('g')
      //    .attr('class', 'axis xAxis')
      //    .attr('transform', `translate(0, ${margin.top})`)
      //    .call(xAxis)
      //    .selectAll('.tick line')
      //    .classed('origin', d => d == 0);
      
      d3.selectAll(".annotate").style('visibility', 'hidden');

      let dateText = svg.append('text')
         .attr('class', 'dateText')
         .attr('x', width-margin.right)
         .attr('y', 45)
         .style('text-anchor', 'end');
      
      // console.log(sequenceValue)
      dateText.html(sequenceArray[sequence]);

      svg.selectAll('rect.bar')
         .data(sequenceValue, d => d.name)
         .enter()
         .append('rect')
         .attr('class', 'bar')
         .attr('x', x(0)+1)
         .attr('width', d => x(d.lastValue)-x(0))
         .attr('y', d => y(d.rank)+5)
         .attr('height', y(1)-y(0)-barPadding)
         .style('fill', d => d.color);
   
      svg.selectAll('text.label')
         .data(sequenceValue, d => d.name)
         .enter()
         .append('text')
         .attr('class', 'label')
         .attr('x', d => x(d.lastValue)-8)
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
         .text(d => { if(d.lastValue > 0) {return d.lastValue} else { return "" }})

   
      let ticker = d3.interval(e => {
   
         dateText.html(sequenceArray[sequence]);
         // console.log(sequenceArray[sequence] + " " + sequence + " " + sequenceEnd)
         d3.selectAll(".annotate").style('visibility', 'visible');
         
         sequenceValue = _normalizeData();
         sequenceValue.forEach((d,i) => d.rank = i);
         x.domain([0, d3.max(sequenceValue, d => d.value)]); 
   
         svg.select('.xAxis')
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .call(xAxis);
   
         const bars = svg.selectAll('.bar').data(sequenceValue, d => d.name);
   
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
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('width', d => Math.max(0, x(d.value)-x(0)))
            .attr('y', d => y(max_value))
            .remove();
   
         const labels = svg.selectAll('.label')
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
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('x', d => x(d.value)-8)
            .attr('y', d => y(max_value)+5)
            .remove();
   
         const valueLabels = svg.selectAll('.valueLabel').data(sequenceValue, d => d.name);
   
         valueLabels
            .enter()
            .append('text')
            .attr('class', 'valueLabel')
            .attr('x', d => x(d.value)+5)
            .attr('y', d => y(max_value+1)+((y(1)-y(0))/2)+13)
            .text(d => d.value)
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
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('x', d => x(d.value)+5)
            .attr('y', d => y(max_value)+5)
            .remove();

         sequence++;
         if(sequence>= sequenceEnd) ticker.stop();
      }, delayDuration);

})
// .catch(function(err) {
//    // handle error here
//    console.log("error")
// })


