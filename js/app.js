  var oReq;
  var csvdata = "-1"; 
  var finaldata = []; 
  var fillColor = null;
  var sheetname = "Sheet_FA"
  if(window.XMLHttpRequest) oReq = new XMLHttpRequest();
  else if(window.ActiveXObject) oReq = new ActiveXObject('MSXML2.XMLHTTP.3.0');
  else throw "XHR unavailable for your browser";
  var __excelurl = "data/Sample.xlsx";
  if (__excelurl.toUpperCase().indexOf(".XLS") > -1 || __excelurl.toUpperCase().indexOf(".XLSX") > -1)
     {
      oReq.open("GET",__excelurl, true);
     }
  xlsfile = false;
  questionselected = "پرسش 1";
  legendcolors = ["#FC7A57","#93B7BE","#EAC435","#C2AF9D","#BF211E","#696969","#DC143C","#FFF8DC","#A9A9A9","#8FBC8F"]  // Add the color when new options are added.
  bubbleradius = ["10","10","10","10","10","10","10","10","10","10"];
  questionidselected = "q_0";
  ukeys = {};
 
  function process_wb(wb)
     {
      icount = 0;
      inprocess = false;
      pcount = 0;
      output = to_csv(wb);
     }


  function to_csv(workbook)
     {
      csvcount = 0;
      if (csvdata == "-1")
         {  
          csvdata = [];
          try
            {
             workbook.SheetNames.forEach(function(sheetName) { 
               if (sheetName.toUpperCase() == sheetname.toUpperCase())
                  {
                   if (xlsfile)
                      { 
                       var csv = XLS.utils.sheet_to_csv(workbook.Sheets[sheetName]);
                      }
                   else
                      {   
                       var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
                      } 
                   if (csv.length > 0)
                      { 
                       csvtemp = csv.split("\n");
                       for (icsv = 0; icsv < csvtemp.length; icsv++)
                           {
                            if (!csvtemp[icsv])
                               {
                                continue;
                               } 
                            csvcount++;
                            var xdata = csvtemp[icsv];
                            csvdata.push(xdata);
                           } 
                       }
                  }  
              }); 
            }
          catch(e)
            {
             console.log('Format not compatible. Convert the data to Excel or CSV or Paste to see the details in the map.',1,"Error !!!","");
             return; 
            }
         }
      else
         {
          if (csvdata.length > 0)
             { 
              csvtemp = csvdata.split("\n");
              csvdata = []; 
              for (icsv = 0; icsv < csvtemp.length; icsv++)
                  {
                   if (!csvtemp[icsv])
                      {
                       continue;
                      } 
                   var xdata = csvtemp[icsv];
                   csvdata.push(xdata);
                  }      
             } 
         } 
      if (csvdata.length == 0)
         {
          console.log("No data to generate chart");
          return;
         } 
      header = csvdata[0];
      header = header.split('"');
      header = header.join("")
      header.replace(/'"'/g,'');
      header = header.split(","); 
      finaldata = []; 
      for (idata = 1; idata < csvdata.length; idata++)
          {
           fdata = {};
           ftdata = csvdata[idata]
           ftx = ftdata.split('"');
           ftdata = ftx.join("")
           ftdata.replace(/'"'/g,'');
           ftdata = ftdata.split(',');
           for (ihead = 0; ihead < header.length; ihead++)
               {
                if (!header[ihead])
                   {
                    continue;
                   }
                ftx = ftdata[ihead]; 
                ftx = ftx.replace(/'"'/g,"")
                fdata[header[ihead]] = ftx;
               }
            finaldata.push(fdata); 
          } 
      drawchart(finaldata);
     }

  function getdata()
     {
      if (__excelurl.toUpperCase().indexOf(".XLS") > -1 || __excelurl.toUpperCase().indexOf(".XLSX") > -1)
         {
          if (__excelurl.toUpperCase().indexOf(".XLSX") < 0)
             {
              xlsfile = true;
             }
          if (typeof Uint8Array !== 'undefined')
             {
              oReq.responseType = "arraybuffer";
              oReq.onload = function(e) 
                {
                 if (typeof console !== 'undefined') 
                     console.log("onload", new Date());
                     var arraybuffer = oReq.response;
                     var data = new Uint8Array(arraybuffer);
                     var arr = new Array();
                      for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                      var wb = XLSX.read(arr.join(""), {type:"binary"});;
                      process_wb(wb);
                 };
              } 
           else
              {
               oReq.setRequestHeader("Accept-Charset", "x-user-defined");	
               oReq.onreadystatechange = function()
                 { 
                  if (oReq.readyState == 4 && oReq.status == 200)
                     {
                      var ff = convertResponseBodyToText(oReq.responseBody);
                      if(typeof console !== 'undefined') 
                        console.log("onload", new Date());
                        var wb = XLSX.read(ff, {type:"binary"});;
                        process_wb(wb);
                     } 
                  };
              }
          oReq.send();
         } 
      else
         { 
          $.ajax({url: __excelurl,aync: false,success: function (csvd) {
             csvdata = csvd;
             to_csv()
             }, 
             dataType: "text",
             complete: function () {}
           });
         }
     }      
  getdata();

function drawchart(finaldata)
  {
   options = {};
   for (ifinaldata = 1; ifinaldata < finaldata.length; ifinaldata++)
       {
        if (finaldata[ifinaldata]["پاسخ‌دهنده"])
           {
            break;
           }          
        for (ikey in finaldata[ifinaldata])
            {
             if (ikey.toUpperCase() == "پاسخ‌دهنده" || !finaldata[ifinaldata][ikey])
                {
                 continue;
                }        
             if (!options[ikey])
                {     
                 options[ikey] = {};
                 options[ikey]["options"] = [];
                 options[ikey]["bpos"] = [];
                 options[ikey]["tpos"] = [];
                 options[ikey]["ppos"] = [];
                }
             options[ikey]["options"].push(finaldata[ifinaldata][ikey]); 
            }      
       }  
   for (iopts in options) 
       { 
        optlength = options[iopts].options.length;
        if (optlength == 2)
           {
            tsoptpos = .3/optlength;
            wsoptpos = .5/optlength;
           }
        if (optlength == 3)
           {
            tsoptpos = .3/optlength;
            wsoptpos = .7/optlength;
           }
        if (optlength == 4)
           {
            tsoptpos = .7/optlength;
            wsoptpos = .7/optlength;
           }
        if (optlength == 5)
           {
            tsoptpos = .4/optlength;
            wsoptpos = .65/optlength;
           }
        coptpos = tsoptpos
        wcoptpos = wsoptpos
        for (iopt = 0; iopt < optlength; iopt++)
            {
             bp = {};
             bp.width = coptpos;
             bp.height = .5;
             if (iopt == 0)
                { 
                 bp.wadjust = -20;
                }
             if (iopt == 1)
                { 
                 bp.wadjust = 90;
                }
             if (iopt == 2)
                { 
                 bp.wadjust = 180;
                }
             if (iopt == 3)
                { 
                 bp.wadjust = 230;
                }
             if (iopt == 4)
                { 
                 bp.wadjust = 300;
                }
             if (iopt == 5)
                { 
                 bp.wadjust = 370;
                }
//             bp.wadjust = 0;
             bp.hadjust = 0;  
             options[iopts].bpos.push(bp);
             tp = {};
             tp.width = coptpos;
             tp.height = .5;
             tp.wadjust = 0;
             if (iopt == 0)
                { 
                 tp.wadjust = -10;
                }
             if (iopt == 1)
                { 
                 tp.wadjust = 80;
                }
             if (iopt == 2)
                { 
                 tp.wadjust = 185;
                }
             if (iopt == 3)
                { 
                 tp.wadjust = 285;
                }
             if (iopt == 4)
                { 
                 tp.wadjust = 370;
                }
             if (iopt == 5)
                { 
                 tp.wadjust = 580;
                }
//             if (iopt == 1)
//                {   
//                 tp.wadjust += 30;
//                }
//             if (iopt > 1)
//                {   
//                 tp.wadjust += 60;
//                }
//             if (iopt > 2)
//                {   
//                 tp.wadjust += 40;
//                }
//             if (iopt > 3)
//                {   
//                 tp.wadjust += 10;
//                }
             tp.hadjust = 0;  
             options[iopts].tpos.push(tp);
             pp = {};
             pp.width = coptpos;
             pp.height = .5;
             pp.wadjust = 0;
             pp.hadjust = 0;  
             if (iopt == 0)
                {   
                 pp.wadjust += 10;
                }
             if (iopt == 1)
                {   
                 pp.wadjust += 10;
                }
             if (iopt == 2)
                {   
                 pp.wadjust += 40;
                }
             if (iopt == 3)
                {   
                 pp.wadjust += 10;
                }
             if (iopt == 4)
                {   
                 pp.wadjust += 10;
                }
             if (iopt == 5)
                {   
                 pp.wadjust += 10;
                }
             options[iopts].ppos.push(pp);
             coptpos = coptpos + tsoptpos;
             wcoptpos = wcoptpos + wsoptpos; 
            }  
       }      
    responses = [];
    uniquenames = {};
    restrictto1 = 6;
    restrictto2 = 4;
    for (ifinaldata = 1; ifinaldata < finaldata.length; ifinaldata++)
        {
         if (!finaldata[ifinaldata]["پاسخ‌دهنده"])
            {
             continue;
            }
         cques = 1;
         irestrict1 = 0;
         irestrict2 = 1;
         for (iques in finaldata[ifinaldata])
             {    
              if (iques.toUpperCase() == "پاسخ‌دهنده")
                 {
                  irestrict1 = irestrict1+1
                  continue;
                 } 
              irestrict1 = irestrict1+1
              if (irestrict1 < restrictto1)
                 {
                  continue;
                 }
              p = {};
              p.person =  finaldata[ifinaldata]["پاسخ‌دهنده"];
              p.optiontype = iques;
              p.name = "پرسش "+cques;
              if (!uniquenames[p.name])
                 {
                  uniquenames[p.name] = "";
                 } 
              p.qname = finaldata[0][iques];
              p.value = finaldata[ifinaldata][iques];    
              cques++;
              optcounter = 0;     
              for (iopt = 0; iopt < options[p.optiontype].options.length; iopt++)
                  {
                   if (options[p.optiontype].options[iopt].toUpperCase() == p.value.toUpperCase())
                      {
                       optcounter++;
                       break; 
                      }      
                   optcounter++;
                  } 
              p.radius = parseFloat(bubbleradius[optcounter]);  
              p.fixedparams = {};
              irestrict2 = 1;  
              for (iques1 in finaldata[ifinaldata])
                  {    
                   if (iques1.toUpperCase() == "پاسخ‌دهنده")
                      {
                       continue;
                      }
                   if (irestrict2 > restrictto2)
                      {
                       break;
                      }
                   irestrict2 = irestrict2 + 1;         
                   p.fixedparams[iques1] = finaldata[ifinaldata][iques1];
                  }      
              responses.push(p);  
             } 
        }
     qhtml = ''  //'<a href="#" rel = "questions" qtext="'+"All"+'" id="q_-1" class="button active">'+"All"+'</a>';
     first = true;
     icounter = 0;
     for (ikey in uniquenames)
         {
          if (first)
             {
              qhtml += '<a href="#" rel = "questions" qtext="'+ikey+'" id="q_'+icounter+'" class="button active">'+ikey+'</a>'
             }
          else
             {
              qhtml += '<a href="#" rel = "questions" qtext="'+ikey+'" id="q_'+icounter+'" class="button">'+ikey+'</a>'
             }
         first = false;
         icounter++
        }
     d3.select("#toolbar").html(qhtml);
     soption = '<a href="#" rel = "options" style = "padding-right:5px;" class = "active" id = "all">All</a>'
     uniqueoptions = {}
     for (iresponses = 0; iresponses < responses.length; iresponses++)
         {
          for (iparams in responses[iresponses].fixedparams)
              {   
               if (!uniqueoptions[iparams])
                  {
                   uniqueoptions[iparams] = "";
                  } 
              } 
         }
     for (ikey in uniqueoptions)
         {
          ikey1 = ikey.split("##")[0];
          soption += '<a href="#"  style = "padding-right:5px;" rel = "options" id = "'+ ikey + '">' + ikey1 + '</a>';
         }

     d3.select("#suboptions").html(soption);
     optionsselected = "All";

     function bubbleChart() {
        var width = 900;
        var height = 500;
        var tooltip = floatingTooltip('gates_tooltip', 240);
        var center = {
            x: width / 2,
            y: height / 2
        };
        var damper = 0.2;
        var svg = null;
        var bubbles = null;
        var nbubbles = null;
        var nodes = [];
        var opt = 0;
        function charge(d) {
           if (resize == 0)
              {   
               return -Math.pow(d.radius, 2) / 50;
              }
           else
              {  
               return -Math.pow(d.radius, 2) / 50;
              }
        }
       var force = d3.layout.force()
                     .size([1000, 800])
                     .charge(charge)
                     .gravity(0.01)
                     .friction(0.9);
//        var fillColor = d3.scale.ordinal()
//                     .domain(optionss)
//                     .range(valuess);
        var radiusScale = d3.scale.pow()
                     .exponent(0.5)
                     .range([2, 85]);
        var fillcolor;
        function hideDetail(d) {
            fillcolor=d3.rgb(d3.select(this).attr("fill"));
            d3.select(this)
              .attr('stroke', fillcolor.darker(1));
            tooltip.hideTooltip();
        }

        function createNodes(rawData,question) { 
            uid = -1;
            totalresponses = 0;
            var myNodes = rawData.map(function(d) {
               uid++;
               optcounter = 0;
               for (iopt in d.fixedparams)
                   {
                    if (d.fixedparams[iopt].toUpperCase() == d.value.toUpperCase())
                       {
                        optcounter++;
                        break; 
                       }      
                    optcounter++;
                   }    
               return {
                  id: d.person,
                  uid:uid,
                  radius: parseFloat(bubbleradius[optcounter]),
                  tags:d.name,
                  qhtml:"",
                  shtml:"",
                  qname : d.qname.split("||").join(","),
                  name:d.name,
                  option:d.option,
                  optiontype:d.optiontype,       
                  fixedparams:d.fixedparams,
                  value : d.value,
                  x: Math.random() * 900,
                  y: Math.random() * 800
              };
            });
            myN = [];
            for (inodes = 0; inodes < myNodes.length; inodes++)
                {
                 if (myNodes[inodes].tags.toUpperCase() == question.toUpperCase() || question.toUpperCase() == "ALL")
                    {
                     moptionsselected = myNodes[inodes].optiontype;
                     myN.push(myNodes[inodes]); 
                     totalresponses++;
                    }
                }
            for (inodes = 0; inodes < myN.length; inodes++)
                {
                 qhtml = "";
                 atext = {};
                 qtext = {};
                 for (iresponses = 0; iresponses < responses.length; iresponses++)
                     {
                      if (responses[iresponses].person.toUpperCase() == myN[inodes].id.toUpperCase())
                         {
                          qhtml += responses[iresponses].qname.split("||").join(",")+";;;;"+responses[iresponses].value+"||";
                          shtml = "";
                          for (ivalue in responses[iresponses].fixedparams)    
                              {
                               shtml += ivalue.split("##")[0]+";;;;"+responses[iresponses].fixedparams[ivalue]+"||";
                              } 
                        }
                     }
                 myN[inodes].qhtml = qhtml;  
                 myN[inodes].shtml = shtml;  
                }
            ukeys = {};
            okeys = options[myN[0]["optiontype"]].options;
            for (xkey = 0; xkey < okeys.length; xkey++)
                {
                 if (!ukeys[okeys[xkey]])
                    {
                     ukeys[okeys[xkey]] = "";    
                    }
                }  
            for (ioptions in options)
                {
                 options[ioptions]["total"] = {};
                 for (iopts = 0; iopts < options[ioptions].options.length; iopts++)
                     {
                      options[ioptions]["total"][options[ioptions].options[iopts]] = {};
                      for (iukeys in ukeys)
                          {
                           options[ioptions]["total"][options[ioptions].options[iopts]][iukeys] = 0;
                          }
                     }    
                }
            persondone = "";
            for (inodes = 0; inodes < myN.length; inodes++)
                {
                 if (persondone.indexOf(myN[inodes].id+"||") > 0)
                    {      
                     continue;
                    }  
                 if (myN[inodes].tags != question)
                    {
                     continue;
                    }      
                 persondone += myN[inodes].id+"||";
                 for (ifixed in myN[inodes].fixedparams) 
                     {
                      for (iukeys in ukeys)
                          {
                           if (iukeys.split("##")[0].toUpperCase() == myN[inodes].value.toUpperCase())
                              { 
                               for (keys in options[ifixed]["total"])
                                   {
                                    if (keys.split("##")[0].toUpperCase() == myN[inodes].fixedparams[ifixed].toUpperCase())
                                       { 
                                        options[ifixed]["total"][keys][iukeys] = options[ifixed]["total"][keys][iukeys] + 1;
                                       }
                                   } 
                              }
                          }
                     }  
               } 
              myNodes = myN;
              return myNodes;
             }
        var chart = function chart(selector, rawData) {
           var maxRadius = d3.max(rawData, function(d) {
              return d.radius;
           });
           radiusScale.domain([0, maxRadius]);
           nodes = createNodes(responses,questionselected);
           force.nodes(nodes);
           svg = d3.select(selector)
                   .append('svg')
                   .attr('width', width+100)
                   .attr('height', height)
           g1 =  svg.append("g").attr("id","bubbles")


           bubbles = g1.selectAll('.bubble')
                    .data(nodes, function(d) {
                          return d.uid;
                    });
           bubbles.enter().append('circle')
                  .classed('bubble', true)
                  .attr('r', 0)
                  .attr('fill', function(d) { 
                       for (iopts = 0; iopts < options[d.optiontype].options.length; iopts++)
                           {
                            if (options[d.optiontype].options[iopts].split("##")[0].toUpperCase() == d.value.toUpperCase())
                               {
                                return legendcolors[iopts];
                               }
                           }     
console.log(d); 
//                        return fillColor("Option " + d.option);
                  })
                  .attr('stroke', function(d) {
                       for (iopts = 0; iopts < options[d.optiontype].options.length; iopts++)
                           {
                            if (options[d.optiontype].options[iopts].split("##")[0].toUpperCase() == d.value.toUpperCase())
                               {
                                return d3.rgb(legendcolors[iopts]).darker();
                               }
                           } 
//                        return d3.rgb(fillColor("Option " + d.option)).darker();
                  })                      
                  .attr('stroke-width', 2)
                  .on('mouseover', showDetail)
                  .on('mouseout', hideDetail);
           bubbles.transition()
                  .duration(2000)
                  .attr('r', function(d) {
                       return d.radius;
                  });
           opt = 0;
           showHeaders(false);
           groupBubbles();
         };
        function hideHeaders() {
           svg.selectAll('.header').remove();
        }
        function groupBubbles() {
            force.on('tick', function(e) {
              bubbles.each(moveToCenter(e.alpha))
                    .attr('r', function(d) {
                         if (resize == 1) {
                             return d.radius / 4;
                         } else {
                             return d.radius/4;
                         }
                    })
             .attr('cx', function(d) {
                  return d.x;
             })
             .attr('cy', function(d) {
                  return d.y;
             });
           }); 
          force.start();
         }
        function collide(node) {
           var r = node.radius + 25,
             nx1 = node.x - r,
             nx2 = node.x + r,
             ny1 = node.y - r,
             ny2 = node.y + r;
           return function(quad, x1, y1, x2, y2) {
              if (quad.point && (quad.point !== node)) {
                  var x = node.x - quad.point.x,
                  y = node.y - quad.point.y,
                  l = Math.sqrt(x * x + y * y),
                  r = node.radius + quad.point.radius;
                  if (l < r) {
                     l = (l - r) / l * 1.5;
                     node.x -= x *= l;
                     node.y -= y *= l;
                     quad.point.x += x;
                     quad.point.y += y;
                  }
              }
           return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
          };
        }
      function moveToCenter(alpha) {
          return function(d) {
              d3.select("#questionname").html(d.qname)
              d.x = d.x + (center.x - d.x) * (damper) * alpha;
              d.y = d.y + (center.y - d.y) * (damper) * alpha;
          };
      }
      function splitBubbles() {
          force.on('tick', function(e) {
             bubbles.each(moveToSelected(e.alpha))
              .attr('r', function(d) {
                 if (resize == 1) {
                     return d.radius / 4;
                 } else {
                     return d.radius;
                 }
            })
            .attr('cx', function(d) {
                return d.x;
            })
            .attr('cy', function(d) {
               return d.y;
            });
         });
         force.start();
        }
        function showHeaders(show){
            if (optionsselected.toUpperCase() != "ALL")
               {
                tpos = options[optionsselected].tpos;
                ppos = options[optionsselected].ppos;
                headerdata = []; 
                optionss = options[optionsselected].options;
                for (ioptions = 0; ioptions < tpos.length; ioptions++)
                    {
                     headerdata.push(options[optionsselected].options[ioptions]);
                    }   
                headerCenters = {};
                for (ioptions = 0; ioptions < tpos.length; ioptions++)
                    {
                     if (options[optionsselected].options.length == 2 && ioptions == 1)
                        {
                         headerCenters[options[optionsselected].options[ioptions]] = {};
                         headerCenters[options[optionsselected].options[ioptions]]["x"] = parseFloat(options[optionsselected].tpos[ioptions]["width"] * width)+parseFloat(options[optionsselected].tpos[ioptions]["wadjust"])+45;
                         headerCenters[options[optionsselected].options[ioptions]]["y"] = parseFloat(options[optionsselected].tpos[ioptions]["height"] * height)+parseFloat(options[optionsselected].tpos[ioptions]["hadjust"]);
                        }
                     else
                        {         
                         headerCenters[options[optionsselected].options[ioptions]] = {};
                         headerCenters[options[optionsselected].options[ioptions]]["x"] = parseFloat(options[optionsselected].tpos[ioptions]["width"] * width)+parseFloat(options[optionsselected].tpos[ioptions]["wadjust"]);
                         headerCenters[options[optionsselected].options[ioptions]]["y"] = parseFloat(options[optionsselected].tpos[ioptions]["height"] * height)+parseFloat(options[optionsselected].tpos[ioptions]["hadjust"]);
                        }
                    }   
               } 
            html = ""; 
            tops = 20;
            tperc = 0;
            vtotal = {};
            lastkey = "";      
            for (iukeys in ukeys)
                {
                 lastkey = iukeys;   
                }    
            for (iukeys in ukeys)
                {
                 if (optionsselected.toUpperCase() != "ALL")
                    {
                     tots = options[optionsselected].total; 
                    }
                 first = true;
                 ewidth = 0;   
                 html += '<tr style = "min-height:'+tops+'px;">'
                 if (!show)
                    {
//                     html += '<td style = "min-width:160px;max-width:260px;min-height:10px;">';
                     wopt = -1;
                     for (iops = 0; iops < options[moptionsselected].options.length; iops++)
                         {
                          if (options[moptionsselected].options[iops].toUpperCase() == iukeys.toUpperCase())
                             {
                              wopt = iops;
                             }
                         } 
                     lcolor = legendcolors[wopt];  
//                     html += "<div style = 'width:100%;margin-top:3px;display:block;'>"
//                     html += '<div dir = "ltr" style = "display:inline-block;padding-left:5px;">'+iukeys.split("##")[0]+"</div>"+'<div style = "height:15px;width:15px;display:inline-block;float:right;margin-right:15px;background-color:'+ legendcolors[wopt] + '"></div>';
//                     html += "</div>"
//                     html += "</td>"
                     tresponses = {};    
                     totalresponses = 0;
                     if (optionsselected.toUpperCase() != "ALL")
                        {   
                         for (ikey1 in options[optionsselected].total)
                             {
                              for (ikey2 in options[optionsselected].total[ikey1])
                                  {
                                   for (ikey3 in options[optionsselected].total[ikey1][ikey2])
                                       {
//                                   if (ikey2.toUpperCase() == iukeys.toUpperCase())
//                                      {  
                                       totalresponses = totalresponses + options[optionsselected].total[ikey1][ikey2];
//                                      }  
                                       } 
                                  } 
                              }
                        }  
                     else
                        {      
                         for (ikey1 in options)
                             {
                              for (ikey2 in options[ikey1].total)
                                  {  
                                   for (ikey3 in options[ikey1].total[ikey2])
                                       {
                                        totalresponses = totalresponses + options[ikey1].total[ikey2][ikey3];
                                       }  
                                   } 
                               break;
                              }
                         }  
                     for (ikey1 in options)
                         {
                          for (ikey2 in options[ikey1].total)
                              {
                               for (ikey3 in options[ikey1].total[ikey2])
                                   {
                                    if (!tresponses[ikey3])
                                       {
                                        tresponses[ikey3] = 0;
                                       } 
                                    tresponses[ikey3] = tresponses[ikey3]+Math.round((options[ikey1].total[ikey2][ikey3]/totalresponses) * 100) ;
                                   }
                              } 
                           break;  
                         }  
                    ttot = 0;   
                    for (ikeys in tresponses)
                        {
                         ttot += tresponses[ikeys];
                        }    
                    for (ikeys in tresponses)
                        {
                         if (iukeys.toUpperCase() != ikeys.toUpperCase())
                            {
                             continue;
                            }     
                         val = tresponses[ikeys];
                         tperc = tperc+val;
                         if (tperc > 100)
                            {
                             diff = 100-tperc;
                             val  = val - diff;
                             tperc = 100;
                            }   
                         barlength = 70 * (val/ttot);
                         barlength = 70 - barlength;
                         vl = val+"%";
                         if (vl.length < 4)
                            { 
                             if (vl.length == 2)
                                { 
                                 html += '<td style = "position:relative;min-height:'+tops+'px; min-width:150px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:12px;display:inline-block;">'+vl+'</label></div></td>';
                                }  
                             if (vl.length == 3)
                                { 
                                 html += '<td style = "position:relative;min-height:'+tops+'px; min-width:150px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:5px;display:inline-block;">'+vl+'</label></div></td>';
                                }  
                            }
                         else
                            { 
                             html += '<td style = "position:relative;min-height:'+tops+'px; min-width:150px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:-2px;display:inline-block;">'+vl+'</label></div></td>';
                            }
                        }
                     html += '<td style = "min-width:300px;max-width:300px;min-height:10px;">';
                      if (iukeys.split("##")[0].length < 30)
                         {   
                          html += "<table style = 'width:100%;margin-top:3px;'>"
                          html += '<td dir = "rtl" style = "padding-right:5px;">'+iukeys.split("##")[0]+"</td>"+'<td style = "height:15px;width:15px;background-color:'+ legendcolors[wopt] + '"></td>';
                          html += "</table>"
                         }
                      else
                         {   
                          html += "<table style = 'width:100%;margin-top:3px;'>"
                          html += '<td dir = "rtl" style = "padding-right:25px;margin-top:-15px;">'+iukeys.split("##")[0]+"</td>"+'<td style = "height:15px;width:15px;background-color:'+ legendcolors[wopt] + '"></td>'
                          html += "</table>"
                         }
                     html += "</td>";  
                     html += "</tr>";  
                     continue;
                    } 
                 for (itots in tots)
                     {
                      if (!vtotal[itots])
                         {
                          vtotal[itots]    = 0;
                         }
                      totalresponses = 0;
                      for (ikey1 in options[optionsselected].total[itots])
                          {
                           totalresponses = totalresponses + options[optionsselected].total[itots][ikey1];
                          }
                      wopt = -1;
                      wopt1 = -1;
                      for (iops = 0; iops < options[optionsselected].options.length; iops++)
                          {
                           if (options[optionsselected].options[iops].toUpperCase() == itots.toUpperCase())
                              {
                               wopt = iops; 
                               itott = 0;
                               for (itkey in tots[itots])
                                   {    
                                    if (itkey.toUpperCase() == iukeys.toUpperCase())
                                       { 
                                        wopt1 = itott;
                                        break;
                                       }
                                    itott = itott+1; 
                                   }
                               if (wopt1 > -1)
                                  {
                                   break;
                                  }  
                              }
                          }    
                      lcolor = legendcolors[wopt1]; 
                      tperc = tperc+val;
                      if (tperc > 100)
                         {
                          diff = 100-tperc;
                          val  = val + diff;
                          tperc = 100;
                         }  
                      val = parseFloat(tots[itots][iukeys]); 
                      val = (val/totalresponses)*100;
                      if (isNaN(val))
                         {
                          val = 0;
                         }
                      val = Math.round(val);
                      vtotal[itots] = vtotal[itots] + val;
                      if (iukeys == lastkey && vtotal[itots] < 100)
                         {
                          diff = 100 - vtotal[itots];
                          val = val+diff;  
                         }  
                      if (iukeys == lastkey && vtotal[itots] > 100)
                         {
                          diff = 100 - vtotal[itots];
                          val = val+diff;  
                         } 
                      wwidth = (parseFloat(ppos[wopt].width) * width)+parseFloat(ppos[wopt].wadjust)
                      if (options[optionsselected].options.length == 2 && first)
                         {
                          wwidth = wwidth+55;
                         }
                      if (first)
                         { 
                          barlength = 70 * (val/100);
                          barlength = 70 - barlength;
                          vl = val+"%";
                          if (options[optionsselected].options.length == 2 || options[optionsselected].options.length == 3)
                             {
                              if (options[optionsselected].options.length == 2)
                                 {                                     
                                  if (vl.length < 4)
                                     { 
                                      if (vl.length == 2)
                                         { 
                                          html += '<td style = "position:relative;min-height:'+tops+'px; min-width:200px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:9px;display:inline-block;">'+vl+'</label></div></td>';
                                         }         
                                      if (vl.length == 3)
                                         { 
                                          html += '<td style = "position:relative;min-height:'+tops+'px; min-width:200px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:5px;display:inline-block;">'+vl+'</label></div></td>';
                                         }         
                                     }
                                  else
                                     { 
                                      html += '<td style = "position:relative;min-height:'+tops+'px; min-width:200px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:-2px;display:inline-block;">'+vl+'</label></div></td>';
                                     }
                                } 
                              if (options[optionsselected].options.length == 3)
                                 {                                     
                                  if (vl.length < 4)
                                     { 
                                      if (vl.length == 2)
                                         {
                                          html += '<td style = "position:relative;min-height:'+tops+'px; min-width:225px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:9px;display:inline-block;">'+vl+'</label></div></td>';
                                         }
                                      if (vl.length == 3)
                                         {
                                          html += '<td style = "position:relative;min-height:'+tops+'px; min-width:225px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:5px;display:inline-block;">'+vl+'</label></div></td>';
                                         }
                                      }
                                  else
                                     { 
                                      html += '<td style = "position:relative;min-height:'+tops+'px; min-width:225px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:-2px;display:inline-block;">'+vl+'</label></div></td>';
                                     }
                                } 
                             }
                          else
                             {   
                              if (vl.length < 4)
                                 { 
                                  if (vl.length == 2)
                                     {
                                      html += '<td style = "position:relative;min-height:'+tops+'px; min-width:150px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:9px;display:inline-block;">'+vl+'</label></div></td>';
                                     }
                                  if (vl.length == 3)
                                     {
                                      html += '<td style = "position:relative;min-height:'+tops+'px; min-width:150px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:5px;display:inline-block;">'+vl+'</label></div></td>';
                                     }
                                 }
                              else
                                 { 
                                  html += '<td style = "position:relative;min-height:'+tops+'px; min-width:150px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:-2px;display:inline-block;">'+vl+'</label></div></td>';
                                 }
                            }    
                         }
                      else
                         { 
                          barlength = (70 * val/100);
                          barlength = 70 - barlength;
                          vl = val+"%";
                          if (options[optionsselected].options.length == 2 || options[optionsselected].options.length == 3)
                             {
                              if (options[optionsselected].options.length == 2)
                                 {
                                  if (vl.length < 4)
                                     { 
                                      if (vl.length == 2)
                                         {   
                                          html += '<td style = "position:relative;min-height:'+tops+'px; min-width:200px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:9px;display:inline-block;">'+vl+'</label></div></td>';
                                         }
                                      if (vl.length == 3)
                                         {   
                                          html += '<td style = "position:relative;min-height:'+tops+'px; min-width:200px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:5px;display:inline-block;">'+vl+'</label></div></td>';
                                         }
                                     }
                                  else
                                     { 
                                      html += '<td style = "position:relative;min-height:'+tops+'px; min-width:200px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:-2px;display:inline-block;">'+vl+'</label></div></td>';
                                     }
                                }
                              if (options[optionsselected].options.length == 3)
                                 {
                                  if (vl.length < 4)
                                     { 
                                      if (vl.length == 2)
                                         {  
                                          html += '<td style = "position:relative;min-height:'+tops+'px; min-width:225px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:9px;display:inline-block;">'+vl+'</label></div></td>';
                                         }  
                                      if (vl.length == 3)
                                         {  
                                          html += '<td style = "position:relative;min-height:'+tops+'px; min-width:225px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:5px;display:inline-block;">'+vl+'</label></div></td>';
                                         }  
                                     }
                                  else
                                     { 
                                      html += '<td style = "position:relative;min-height:'+tops+'px; min-width:225px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:-2px;display:inline-block;">'+vl+'</label></div></td>';
                                     }
                                }
                             }
                          else
                             { 
                              if (vl.length < 4)
                                 { 
                                  if (vl.length == 2)
                                     {   
                                      html += '<td style = "position:relative;min-height:'+tops+'px; min-width:150px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:9px;display:inline-block;">'+vl+'</label></div></td>';
                                     }
                                  if (vl.length == 3)
                                     {   
                                      html += '<td style = "position:relative;min-height:'+tops+'px; min-width:150px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:5px;display:inline-block;">'+vl+'</label></div></td>';
                                     }
                                 }
                              else
                                 { 
                                  html += '<td style = "position:relative;min-height:'+tops+'px; min-width:150px'+';"><div style = "width:70px;height:10px;border:1px solid;margin-left:5px;margin-top:5px;"><div style = "height:10px;width:70px;background-color:'+lcolor+';"</div><div style = "height:10px;width:'+barlength+'px;background-color:#fff"></div><label style = "position:relative;top:-12px;left:73px;margin-left:-2px;display:inline-block;">'+vl+'</label></div></td>';
                                 }
                             }      
                         }
                      if (first)
                         {
                          ewidth = wwidth;   
                          first = false;
                         } 
                      else
                         {
                          ewidth += wwidth;
                         }   
                     }
                  if (options[optionsselected].options.length == 2)
                     {   
                      html += '<td style = "min-width:100px;max-width:200px;min-height:10px;">';
                     }
                  if (options[optionsselected].options.length == 3)
                     {
                      html += '<td style = "min-width:100px;max-width:200px;min-height:10px;">';
                     }
                  if (options[optionsselected].options.length > 3)
                     {   
                      html += '<td style = "min-width:100px;max-width:200px;min-height:10px;">';
                     }
                  wopts = -1;
                  for (iops = 0; iops < options[moptionsselected].options.length; iops++)
                      {
                       if (options[moptionsselected].options[iops].toUpperCase() == iukeys.toUpperCase())
                          {
                           wopts = iops;
                          }
                      } 
                  if (iukeys.split("##")[0].length < 30)
                     {   
                      html += "<table style = 'width:100%;margin-top:3px;'>"
                      html += '<td dir = "rtl" style = "padding-right:5px;">'+iukeys.split("##")[0]+"</td>"+'<td style = "height:15px;width:15px;background-color:'+ legendcolors[wopts] + '"></td>';
                      html += "</table>"
                     }
                  else
                     {   
                      html += "<table style = 'width:100%;margin-top:3px;'>"
                      html += '<td dir = "rtl" style = "padding-right:25px;margin-top:-15px;">'+iukeys.split("##")[0]+"</td>"+'<td style = "height:15px;width:15px;background-color:'+ legendcolors[wopts] + '"></td>'
                      html += "</table>"
                     }
                 html += "</td>"
                 html += "</tr>";
                }   
            if (optionsselected.toUpperCase() != "ALL")
               {
                html += "<br><br><tr>";
                for (iheader = 0; iheader < headerdata.length; iheader++)
                    {
                     if (options[optionsselected].options.length == 2 || options[optionsselected].options.length == 3)
                        {
                         if (options[optionsselected].options.length == 2)
                            {
                             html += '<td style = "min-width:100px;max-width:100px;min-height:10px;">';
                            } 
                         if (options[optionsselected].options.length == 3)
                            {
                             html += '<td style = "min-width:100px;max-width:100px;min-height:10px;">';
                            } 
                        }
                     else
                        {
                         html += '<td style = "min-width:100px;max-width:100px;min-height:10px;">';
                        }      
                     html += '<div style = "margin-top:20px;text-align:center;" dir = "ltr">'+headerdata[iheader].split("##")[0]+"</div>";     
                     html += "</td>";
                    }    
               }  
            d3.select("#perc").html(html);
            if (optionsselected.toUpperCase() != "ALL") 
               { 
                if (options[optionsselected].options.length == 2) 
                   {
                    d3.select("#perc").style("margin-left","100px");
                   }
                else
                   {
                    d3.select("#perc").style("margin-left","20px");
                   }
               }    
            else
               {
                d3.select("#perc").style("margin-left","20px");
               }   
          }
          function moveToSelected(alpha) {
             return function(d) {
                target = {};
                d3.select("#questionname").html(d.qname)
                ffixed = d.fixedparams[optionsselected];
                for (ioptions = 0; ioptions < options[optionsselected].options.length; ioptions++)
                    { 
                     if (String(options[optionsselected].options[ioptions].split("##")[0].toUpperCase()) == String(ffixed.toUpperCase()))  //  || String(options[optionsselected].options[ioptions].toUpperCase()) == String(d.astring[optionsselected].toUpperCase()))
                        {
                         target.x = (parseFloat(options[optionsselected].bpos[ioptions].width) * width)+parseFloat(options[optionsselected].bpos[ioptions].wadjust);
                         target.y = (parseFloat(options[optionsselected].bpos[ioptions].height) * height)+parseFloat(options[optionsselected].bpos[ioptions].hadjust);
                        } 
                    }
                 if (!target.x || !target.y)
                    {
                     return;
                    }      
                 d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
                 d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
              };
          }
          function showDetail(d) {
             d3.select(this).attr('stroke', 'black');
             content = "<table style = 'border:1px solid;'>";
             content += "<tr>";
             content += '<td style = "border:1px solid;">Person</td><td style = "border:1px solid;">'+d.id +'</td>';
             content += '</tr>';
             content += "<tr>";
             content += '<td style = "border:1px solid;">Question No</td><td style = "border:1px solid;">'+d.name.split(" ")[1] +'</td>';
             content += '</tr>';
//             content += "<tr>";
//             content += '<td style = "border:1px solid;">Selected Option</td><td style = "border:1px solid;">'+d.option +'</td>';
//             content += '</tr>';
             content += "<tr>";
             content += '<td colspan = "2" style = "font-weight:bold;border:1px solid;"><center><label style = "text-align:center;">Question and Responses List</label></center></td><td colspan = "2"></td>';
             content += '</tr>';
             content += '<tr>';
             content += '</tr>';
             qhml = d.qhtml.split("||");
             shml = d.shtml.split("||");
             for (iqhml = 0; iqhml < qhml.length; iqhml++)
                 {
                  if (!qhml[iqhml]) 
                     {
                      continue;
                     } 
                  qs = qhml[iqhml].split(";;;;");
                  content += "<tr>";
                  content += '<td style = "border:1px solid;">'+qs[0]+'</td><td style = "border:1px solid;">'+qs[1]+'</td>';
                  content += '</tr>';
                 }
            for (iqhml = 0; iqhml < shml.length; iqhml++)
                {
                 if (!shml[iqhml]) 
                    {
                     continue;
                    } 
                 qs = shml[iqhml].split(";;;;");
                 content += "<tr>";
                 content += '<td style = "border:1px solid;">'+qs[0]+'</td><td style = "border:1px solid;">'+qs[1]+'</td>';
                 content += '</tr>';
                }
             content += "</table>"
             tooltip.showTooltip(content, d3.event);
            }
            chart.toggleDisplay = function(initnodes) {
               if (optionsselected.toUpperCase() === 'ALL') 
                  {
                   d3.select("#questionname").html("");
                   d3.select("#perc").html("");
                   resize = 0;
                   opt = 0;
                   hideHeaders();
                   showHeaders(false);
                   groupBubbles();
                  }
               else
                  {
                   d3.select("#perc").html("");
                   resize = 1;
                   hideHeaders();
                   showHeaders(true);
                   splitBubbles();
                  }
            };
          return chart;
         }
    var resize = 0;
    var myBubbleChart = bubbleChart();
    function display(responses) {
      myBubbleChart('#vis', responses);
    }
    function setupButtons() {
        d3.selectAll("[rel=questions]").on("click",function(d){
           d3.select("#legends").html(""); 
           d3.select("#"+questionidselected).classed("active",false)
           questionselected = d3.select(this).attr("qtext");
           questionidselected = d3.select(this).attr("id") 
           d3.select("#"+questionidselected).classed("active",true)
           optionsselected = "All";
           d3.select("svg").remove();
           display(responses);
           myBubbleChart.toggleDisplay(true);
        });
        d3.selectAll("[rel=options]").on("click",function(d){
           d3.select('[id="'+optionsselected+'"]').classed("active",false)
           optionsselected = d3.select(this).attr("id")   //.toUpperCase()
           d3.select('[id="'+optionsselected+'"]').classed("active",true)
           myBubbleChart.toggleDisplay(false);
        });
    }
    function addCommas(nStr) {
       nStr += '';
       var x = nStr.split('.');
       var x1 = x[0];
       var x2 = x.length > 1 ? '.' + x[1] : '';
       var rgx = /(\d+)(\d{3})/;
       while (rgx.test(x1)) {
         x1 = x1.replace(rgx, '$1' + ',' + '$2');
       }
       return x1 + x2;
     }
   display(responses);
   setupButtons();
  }
