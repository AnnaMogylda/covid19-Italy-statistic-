$(document).ready(function(){
  
    $.ajax({
        url: 'https://api.covid19api.com/country/italy',
        method: "get",
        dataType: "json",
        processData: false,
        contentType: false,
        cache: false,
        success: function(response) {
            if (response) {
                console.log(response);
                // Charts
                google.charts.load('current', {'packages':['corechart']});
                google.charts.load('current', {'packages':['line']});
                google.charts.setOnLoadCallback(drawDeathsToCases);
                google.charts.setOnLoadCallback(drawTotalDataConfirmedCharts);
                google.charts.setOnLoadCallback(drawDailyDataConfirmedCharts);
                google.charts.setOnLoadCallback(drawTotalDeathsCharts);
                google.charts.setOnLoadCallback(drawDailyDeathsCharts);
                //Data for Charts
                let totalConfirmedForCharts = [];
                let dailyConfirmedForCharts = [];
                let totalDeathsForCharts = [];
                let dailyDeathsForCharts = [];
            
                let averageDeaths;
                let averageRecovery;

                response.forEach( (element, counter = 0) => {
                    // Total numbers
                    $('#totalCases').html(element.Confirmed);
                    $('#totalDeaths').html(element.Deaths);
                    $('#totalRecovery').html(element.Recovered);
                    // Numbers for the last day
                    if(counter==response.length-1){
                        const dailyNumberCases= response[counter].Confirmed - response[counter-1].Confirmed;
                        $('#casesForDay').html(dailyNumberCases);
                        const dailyNumberDeaths = response[counter].Deaths - response[counter-1].Deaths;
                        $('#deathsForDay').html(dailyNumberDeaths);
                        const dailyNumberRecovered = response[counter].Recovered - response[counter-1].Recovered;
                        $('#recoveryForDay').html(dailyNumberRecovered);
                    //Average
                        averageDeaths = Number ( (element.Deaths / element.Confirmed)*100).toFixed(2) ;
                        $('#averageDeaths').html(`${averageDeaths}%`);
                        averageRecovery =Number (100-averageDeaths);
                    }
                    //Date
                    let [year, month, day] = element.Date.split('-');
                    day = day.substring(0, 2);
                    switch(month){
                        case '01': month = "Jan";
                            JanCases = element.Confirmed;
                            break;
                        case '02': month = "Feb";
                            FebCases = element.Confirmed;
                            break;
                        case '03': month = "Mar";
                            MarCases = element.Confirmed;
                            break;
                        case '04': month = "Apr";
                            AprCases = element.Confirmed;
                            break;
                        case '05': month = "May";
                            MayCases = element.Confirmed;
                            break;
                        case '06': month = "Jun"; 
                            JunCases = element.Confirmed;
                            break;
                        case '07': month = "Jul";
                            JulCases = element.Confirmed;
                            break;
                        case '08': month = "Aug";
                            AugCases = element.Confirmed;
                            break;
                        case '09': month = "Sep";
                            SepCases = element.Confirmed;
                            break;
                        case '10': month = "Oct";
                            OctCases = element.Confirmed;
                            break;
                        case '11': month = "Nov";
                            NovCases = element.Confirmed;
                            break;
                        case '12': month = "Dec";
                            DecCases = element.Confirmed;
                            break;
                    }

                    //Difference in amounts within different Dates
                    let differencePrevConfirmed = 0; 
                    let prevConfirmed = 0;
                    let dayBeforePrevConfirmed = 0;
                    let differenceBeforePrevConfirmed = 0;
                    let differenceDeathsDetailed =0;
                    if(counter == 0){
                        differencePrevConfirmed = 0;
                        prevConfirmed = 0;
                        dayBeforePrevConfirmed = 0;
                        differenceDeathsDetailed =0;
                    } else if (counter == 1){
                        dayBeforePrevConfirmed = 0
                    } else{
                        prevConfirmed = response[counter-1].Confirmed;
                        differencePrevConfirmed = Number(response[counter].Confirmed)  - Number(response[counter-1].Confirmed);
                        differenceBeforePrevConfirmed = Number(response[counter-1].Confirmed)  - Number(response[counter-2].Confirmed);
                        differenceDeathsDetailed = Number(response[counter].Deaths)  - Number(response[counter-1].Deaths);
                    }         
                    counter++;  
                    
                     //data for charts
                     totalConfirmedForCharts.push([String(`${month}-${year}`), Number(element.Confirmed)]);
                     dailyConfirmedForCharts.push([String(`${month}-${year}`), Number(differencePrevConfirmed)]);
                     totalDeathsForCharts.push([String(`${month}-${year}`), Number(element.Deaths)]);
                     dailyDeathsForCharts.push([String(`${month}-${year}`), Number(differenceDeathsDetailed)]);
                    
                     //generating table data
                    $('#totalDataConfirmedDetailed').append(`<tr>
                        <td scope="row"> ${day}-${month}-${year} </td>
                        <td>${prevConfirmed}</td>
                        <td>${element.Confirmed}</td>
                        <td>${differencePrevConfirmed}</td>
                    <tr>`); 
                     $('#dailyDataConfirmedDetailed').append(`<tr>
                        <td scope="row"> ${day}-${month}-${year} </td>
                        <td>${differenceBeforePrevConfirmed}</td>
                        <td>${differencePrevConfirmed - differenceBeforePrevConfirmed}</td>
                        <td>${differencePrevConfirmed}</td>
                    <tr>`);
                    $('#totalDeathsDetailed').append(`<tr>
                        <td scope="row"> ${day}-${month}-${year} </td>
                        <td>${element.Deaths}</td>
                    <tr>`); 
                    $('#dailyDeathsDetailed').append(`<tr>
                        <td scope="row"> ${day}-${month}-${year} </td>
                        <td>${differenceDeathsDetailed}</td>
                    <tr>`); 

                   
                });
                  // Charts
                  function drawDeathsToCases() {
                    var data = google.visualization.arrayToDataTable([
                      ['Cases', 'Percentage,%'],
                      ['Death',    Number(averageDeaths)],
                      ['Recovery', Number(averageRecovery)]
                    ]);
                    var options = {
                      title: 'Average number of COVID-19 associated IT deaths (deaths to cases ratio)',
                      is3D: true,
                    };
                    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
                    chart.draw(data, options);
                }
            
                function drawTotalDataConfirmedCharts() {
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', 'Date');
                    data.addColumn('number', 'Number of cases');
                    data.addRows(totalConfirmedForCharts);
                    var options = {
                      chart: {
                        title: '',
                        subtitle: ''
                      },
                      width: 900,
                      height: 400
                    };
                    var chart = new google.charts.Line(document.getElementById('totalDataConfirmedCharts'));     
                    chart.draw(data, google.charts.Line.convertOptions(options));
                  }

                  function drawDailyDataConfirmedCharts() {
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', 'Date');
                    data.addColumn('number', 'Number of cases');
                    data.addRows(dailyConfirmedForCharts);
                    var options = {
                      chart: {
                        title: '',
                        subtitle: ''
                      },
                      width: 900,
                      height: 400
                    };
                    var chart = new google.charts.Line(document.getElementById('dailyDataConfirmedCharts'));     
                    chart.draw(data, google.charts.Line.convertOptions(options));
                  }

                function drawTotalDeathsCharts() {
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', 'Date');
                    data.addColumn('number', 'Number of cases');
                    data.addRows(totalDeathsForCharts);
                    var options = {
                      chart: {
                        title: '',
                        subtitle: ''
                      },
                      width: 900,
                      height: 400
                    };
                    var chart = new google.charts.Line(document.getElementById('totalDeathsCharts'));     
                    chart.draw(data, google.charts.Line.convertOptions(options));
                }

                function drawDailyDeathsCharts() {
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', 'Date');
                    data.addColumn('number', 'Number of cases');
                    data.addRows(dailyDeathsForCharts);
                    var options = {
                      chart: {
                        title: '',
                        subtitle: ''
                      },
                      width: 900,
                      height: 400
                    };
                    var chart = new google.charts.Line(document.getElementById('dailyDeathsCharts'));     
                    chart.draw(data, google.charts.Line.convertOptions(options));
                }
                
            } else {
                console.error(response);
            }
        },
        error: function(response) {
            console.error(response.responseText);
        }
    });

})