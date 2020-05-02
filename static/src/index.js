const height = 600;
const width = 900;

const tickDuration  = 700;
const delayDuration = 1000;

let sequenceArray = [];

const title = "Number of Wins";
const subTitle = "Subtitle";

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
// svg.append("text")
//    .attr("class", "subTitle")
//    .attr("y", 75)
//    .html( subTitle );
svg.append("text")
   .attr("class", "caption")
   .attr("x", 10)
   .attr('y', height-20)
   .html("Sources: https://en.wikipedia.org/wiki/List_of_UFC_events");
svg.append("text")
   .attr("class", "caption")
   .attr("x", 10+42)
   .attr('y', height-5)
   .html("https://www.ufc.com https://www.sherdog.com");

Promise.all([
   d3.csv("sequence.csv"),
   d3.csv("output_df.csv"),
   ])
   .then(function(data) {

      data[0].forEach(d => {
         sequenceArray.push(d.date_formatted)
      })

      const sequenceStart     = 1;
      const sequenceEnd       = sequenceArray.length;
      let sequence = sequenceStart;

      // console.log(sequenceArray)

      // console.log(data[1])

      // Assign random colors to each fighter
      data[1].forEach( d => {
         d.color = d3.hsl(Math.random()*360,1,0.5);
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
            val = Math.round(val + 3);
   
            let lastValue = lastValues[ name ];
            if( lastValue == null )
               lastValue = val;
   
            ret.push({
                  name     : name,
                  color   : d.color,
                  value    : val,
                  lastValue: lastValue
            });
            
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
         .range([margin.left, width-margin.right-65]);
   
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
      dateText.html(sequenceArray[sequence-1]);

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
         .attr('x', d => x(d.lastValue)+5)
         .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+2)
         .text(d => d.lastValue);
   
      let ticker = d3.interval(e => {
   
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
            .attr('y', d => y(max_value+1)+5)
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
            .attr('y', d => y(max_value+1)+5)
            .remove();
   
         const valueLabels = svg.selectAll('.valueLabel').data(sequenceValue, d => d.name);
   
         valueLabels
            .enter()
            .append('text')
            .attr('class', 'valueLabel')
            .attr('x', d => x(d.value)-8)
            .attr('y', d => y(max_value+1)+5+((y(1)-y(0))/2)+2)
            .text(d => d.value)
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+2);
   
         valueLabels
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('x', d => x(d.value)+5)
            .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+2)
   
         valueLabels
            .exit()
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('x', d => x(d.value)+5)
            .attr('y', d => y(max_value+1)+5)
            .remove();

         sequence++;
         if(sequence> sequenceEnd) ticker.stop();
      }, delayDuration);

})
// .catch(function(err) {
//    // handle error here
//    console.log("error")
// })


