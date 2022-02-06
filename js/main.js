$(document).ready(function(){

    getData();

    $('#select').val();

    $( "#select" ).change(function() {
        let country = $('#select').val();
        $("#country").html(country);
        getData(country.toLowerCase());
    });

    //Data for Charts
    let totalConfirmedForCharts = [];
    let dailyConfirmedForCharts = [];
    let totalDeathsForCharts = [];
    let dailyDeathsForCharts = [];

    let averageDeaths;
    let averageRecovery;

    const defaultOptions = {
        chart: {
            title: '',
            subtitle: ''
        },
        width: 900,
        height: 400
    };

    function initCharts() {
        google.charts.load('current', {'packages':['corechart']});
        google.charts.load('current', {'packages':['line']});
        google.charts.setOnLoadCallback(drawDeathsToCases);
        google.charts.setOnLoadCallback(drawTotalDataConfirmedCharts);
        google.charts.setOnLoadCallback(drawDailyDataConfirmedCharts);
        google.charts.setOnLoadCallback(drawTotalDeathsCharts);
        google.charts.setOnLoadCallback(drawDailyDeathsCharts);
    }

    function drawDeathsToCases() {
        const data = google.visualization.arrayToDataTable([
            ['Cases', 'Percentage,%'],
            ['Death',    Number(averageDeaths)],
            ['Recovery', Number(averageRecovery)]
        ]);
        const options = {
            title: 'Average number of COVID-19 associated IT deaths (deaths to cases ratio)',
            is3D: true,
        };
        const chart = new google.visualization.PieChart(document.getElementById('piechart'));
        chart.draw(data, options);
    }

    function drawLine(row, id) {
        const data = new google.visualization.DataTable();
        data.addColumn('string', 'Date');
        data.addColumn('number', 'Number of cases');
        data.addRows(row);
        const chart = new google.charts.Line(document.getElementById(id));
        chart.draw(data, google.charts.Line.convertOptions(defaultOptions));
    }

    function drawTotalDataConfirmedCharts() {
        drawLine(totalConfirmedForCharts, 'totalDataConfirmedCharts');
    }

    function drawDailyDataConfirmedCharts() {
        drawLine(dailyConfirmedForCharts, 'dailyDataConfirmedCharts');
    }

    function drawTotalDeathsCharts() {
        drawLine(totalDeathsForCharts, 'totalDeathsCharts');
    }

    function drawDailyDeathsCharts() {
        drawLine(totalDeathsForCharts, 'dailyDeathsCharts');
    }

    function getGeneralDataView(element){
        $('#totalCases').html(element.Confirmed);
        $('#totalDeaths').html(element.Deaths);
        $('#totalRecovery').html(element.Recovered);
    }

    function getMonth(month){
        switch(month){
            case '01': return "Jan";
            case '02': return "Feb";
            case '03': return "Mar";
            case '04': return "Apr";
            case '05': return "May";
            case '06': return "Jun";
            case '07': return "Jul";
            case '08': return "Aug";
            case '09': return "Sep";
            case '10': return "Oct";
            case '11': return "Nov";
            case '12': return "Dec";
        }
    }

    function getData(country = 'italy') {
        $.ajax({
            url: `https://api.covid19api.com/country/${country}`,
            method: "get",
            dataType: "json",
            processData: false,
            contentType: false,
            cache: false,
            success: function(response) {
                if (response) {
                    console.log(response);
                    // Charts
                    initCharts();
                    response.forEach( (element, counter = 0) => {
                        // Total numbers
                        getGeneralDataView(element);
                        // Numbers for the last day
                        if(counter===response.length-1){
                            const dailyNumberCases= response[counter].Confirmed - response[counter-1].Confirmed;
                            $('#casesForDay').html(dailyNumberCases);
                            const dailyNumberDeaths = response[counter].Deaths - response[counter-1].Deaths;
                            $('#deathsForDay').html(dailyNumberDeaths);
                            const dailyNumberRecovered = response[counter].Recovered - response[counter-1].Recovered;
                            $('#recoveryForDay').html(dailyNumberRecovered);
                            // get Average
                            averageDeaths = Number ( (element.Deaths / element.Confirmed)*100).toFixed(2) ;
                            $('#averageDeaths').html(`${averageDeaths}%`);
                            averageRecovery =Number (100-averageDeaths);
                        }
                        //Date
                        let [year, month, day] = element.Date.split('-');
                        day = day.substring(0, 2);
                        month = getMonth(month);

                        //Difference in amounts within different Dates
                        let differencePrevConfirmed = 0;
                        let prevConfirmed = 0;
                        let dayBeforePrevConfirmed = 0;
                        let differenceBeforePrevConfirmed = 0;
                        let differenceDeathsDetailed =0;
                        if(counter === 0){
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
                } else {
                    console.error(response);
                }
            },
            error: function(response) {
                console.error(response.responseText);
            }
        });
    }
});


