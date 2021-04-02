SpinWheels = function(data){
    let padding = {top:20, right:25, bottom:0, left:25},
        w = 500 - padding.left - padding.right,
        h = 500 - padding.top  - padding.bottom,
        r = Math.min(w, h)/2,
        rotation = 0,
        oldrotation = 0,
        picked = 1000000,
        oldpick = [],
        color = d3.scaleOrdinal(d3.schemeCategory10)

    let svg = d3.select('#chart')
        .append("svg")
        .data([data])
        .attr("width",  w + padding.left + padding.right)
        .attr("height", h + padding.top + padding.bottom);

    let container = svg.append("g")
        .attr("class", "chartholder")
        .attr("transform", "translate(" + (w/2 + padding.left) + "," + (h/2 + padding.top) + ")");

    let vis = container
        .append("g");

    let pie = d3.pie().sort(null).value(function(d){return 1;}).padAngle(.01);

    // declare an arc generator function
    let arc = d3.arc().innerRadius(r*0.95).outerRadius(0);
    let arcOut = d3.arc().innerRadius(r).outerRadius(0*0.1);

    // select paths, use arc generator to draw
    let arcs = vis.selectAll("g.slice")
        .data(pie)
        .enter()
        .append("g")
        .attr("class", "slice");


    arcs.append("path")
        .attr("fill", function(d, i){ return color(i); })
        .attr("d", function (d) { return arc(d); });

    // add the text
    arcs.append("text").attr("transform", function(d){
        d.innerRadius = 0;
        d.outerRadius = r*0.95;
        d.angle = (d.startAngle + d.endAngle)/2;
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")translate(" + (d.outerRadius -10) +")";
    })
        .attr("text-anchor", "end")
        .text( function(d, i) {
            return data[i].Label;
        })
        .call(wrap, r*0.6);

    container.on("click", spin);

    let questionLimit = $("#spinWheel").data("question")
    let maxQuestion = 0
    function spin(d){

        container.on("click", null);

        if( questionLimit != 0 ){
            maxQuestion = questionLimit
        }else{
            maxQuestion = data.length
        }

        if(oldpick.length == maxQuestion ){
            container.on("click", null);
            return;
        }

        let  ps       = 360/data.length,
            pieslice = Math.round(1440/data.length),
            rng      = Math.floor((Math.random() * 1440 * 8) + 360);

        rotation = (Math.round(rng / ps) * ps);


        picked = Math.round(data.length - (rotation % 360)/ps);
        picked = picked >= data.length ? (picked % data.length) : picked;


        if(oldpick.indexOf(picked) !== -1){
            d3.select(this).call(spin);
            return;
        } else {
            oldpick.push(picked);
        }

        rotation += 90 - Math.round(ps/2);

        vis.transition()
            .duration(3000)
            .attrTween("transform", rotTween)
            .on("end", function(){

                //mark Question as seen
                d3.select(".slice:nth-child(" + (picked + 1) + ") path")
                    .attr("fill", "#111")
                    .transition()
                    .duration(500)
                    .attr("d", arcOut)
                    .attr("stroke-width",6);

                d3.select(".slice:nth-child(" + (picked + 1) + ") text")
                    .style("fill", "#fff");

                //populate question
                d3.select("#question")
                    .text(data[picked].Question);

                oldrotation = rotation;

                container.on("click", spin);
            });
    }

    function wrap(text, width) {
        text.each(function() {
            let text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = 0,
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

    //make arrow
    svg.append("g")
        .attr("transform", "translate(" + (w + padding.left + padding.right) + "," + ((h/2)+padding.top) + ")")
        .append("path")
        .attr("d", "M-" + (r*.15) + ",0L0," + (r*.05) + "L0,-" + (r*.05) + "Z")
        .style("fill","black");

    //draw spin circle
    container.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 60)
        .style("fill","white")
        .style("cursor","pointer");

    //spin text
    container.append("text")
        .attr("x", 0)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text("Rotate")
        .style("font-weight","bold")
        .style("font-size","30px")


    function rotTween(to) {
        let i = d3.interpolate(oldrotation % 360, rotation);
        return function(t) {
            return "rotate(" + i(t) + ")";
        };
    }


    function getRandomNumbers(){
        let array = new Uint16Array(1000);
        let scale = d3.scaleLinear().range([360, 1440]).domain([0, 100000]);

        if(window.hasOwnProperty("crypto") && typeof window.crypto.getRandomValues === "function"){
            window.crypto.getRandomValues(array);
            console.log("works");
        } else {
            //no support for crypto, get crappy random numbers
            for(let i=0; i < 1000; i++){
                array[i] = Math.floor(Math.random() * 100000) + 1;
            }
        }

        return array;
    }
}