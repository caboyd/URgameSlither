$(window).ready(function () {
	window.scrollTo(0, 0);
});


$(document).ready(function () {
	var hash = document.location.hash;

	if (hash == "#global")
		makeTabActive('global');
	else if (hash == "#profile")
		makeTabActive('profile');

});

function makeTabActive(tab) {

	$('.nav-tabs a[href="#' + tab + '"]').tab('show');
};


$("#profiletab").click(function () {
	$.ajax(
			{
				type: "GET",
				url: "stats/ajaxUpdate/profile",
				success: function (result) {
					console.log(result);
					$("#ajaxUpdateProfileStats").html(result);
				},
                complete: function () {
                    loadProfileCharts();
                    loadProgressBars();
                }
			});
});

$("#globaltab").click(function () {
	$.ajax(
			{
				type: "GET",
				url: "stats/ajaxUpdate/global",
				success: function (result) {
					console.log(result);
					$("#ajaxUpdateGlobalStats").html(result);
				},
                complete: function () {
                    loadGlobalCharts();
                }
			});
});

loadProfileCharts();
loadGlobalCharts();
loadProgressBars();


function loadProfileCharts() {
	var avgSnakeLengthChart = makeChart("avgSnakeLengthchartdiv", avgSnakeLengthChartData, "length", "second", "#AE3F69", "Average Score over time", "Score", "Seconds");
	var highestSnakeLengthChart = makeChart("highestSnakeLengthchartdiv", highestSnakeLengthChartData, "length", "second", "#ffca74", "Best Score at each interval over time", "Score", "Seconds");
	var bestScoreAndKillsChart = makeChart("bestScoreAndKillschartdiv", bestScoreAndKillsChartData, "length", "second", "#AE3F69", "Best Score and Kills over time", "Score/Kills", "Seconds");
	var max = 0;
	for (var i = 0; i < bestScoreAndKillsChart.dataProvider.length; i++) {
		var dp = bestScoreAndKillsChart.dataProvider[i];
		if (dp["kills"] > max) {
			max = dp["kills"];
		}
	}
	bestScoreAndKillsChart.valueAxes[1].maximum = max;

	var cumulativeMovingScoreChart = makeChart("cumulativeMovingScorechartdiv", cumulativeMovingScoreChartData, "score", "game", "#ffca74", "Average Score Trend", "Score", "Games")
}

function loadGlobalCharts() {
	var avgSnakeLengthAllChart = makeChart("avgSnakeLengthAllchartdiv", avgSnakeLengthAllChartData, "length", "second", "#AE3F69", "Average Score of today's users over time", "Score", "Seconds");
	var highestSnakeLengthAllChart = makeChart("highestSnakeLengthAllchartdiv", highestSnakeLengthAllChartData, "length", "second", "#AE3F69", "Best Score of each interval of today's users over time", "Score", "Seconds");
}

function makeChart(chartDiv, chartData, yAxisFieldName, xAxisFieldName, graphColor, title, xAxisLabel, yAxisLabel) {
	return AmCharts.makeChart(chartDiv, {
		"type": "serial",
		"theme": "black",
		"titles": [{
			"text": title,
			"size": 15
		}],
		"allLabels": [{
			"text": yAxisLabel,
			"y": "!20",
			"width": "50%",
			"size": 15,
			"bold": true,
			"align": "center"
		}, {
			"text": xAxisLabel,
			"x": "10",
			"y": "!20",
			"rotation": 270,
			"width": "50%",
			"size": 15,
			"bold": true,
			"align": "center",
		}],
		"marginRight": 80,
		"autoMarginOffset": 20,
		"marginTop": 7,
		"dataProvider": chartData,
		"categoryField": xAxisFieldName, //field of x-axis
		"categoryAxis":
				{},
		"valueAxes": [
			{
				"id": "ValueAxis-1",
				"position": "left",
				"title": "" //not showing up
			},
			{
				"id": "ValueAxis-2",
				"labelsEnabled": false,
				"stackType": "regular",
				"gridThickness": 0
			}],
		"mouseWheelZoomEnabled": true,
		"graphs": [
			{
				"id": "g1",
				"balloonText": "[[value]]", //what the pop up has when hovered is
				"fillColors": graphColor,
				"bullet": "round", //available: none, square, triangleUp, traingleDown, bubble, custom, round
				"bulletBorderAlpha": 1, //bulletborderopacity
				"bulletBorderColor": graphColor,
				"bulletColor": "#ffffff",
				"lineAlpha": 0,
				"hideBulletsCount": 50, //"If there are more data points than hideBulletsCount, the bullets will not be shown. 0 means the bullets will always be visible.
				"title": "title goes here", //just a variable for the ballonText
				"valueField": yAxisFieldName, //the name of the field in data in Y-axis
				"type": "smoothedLine", //typeofgraph - line, column, step, smoothedLine, candlestick,ohIc
				"balloon":
						{
							"drop": true  //if you want the balloon to be in a tear shape
						},
				"fillAlphas": 0.7,
				"valueAxis": "ValueAxis-1",
			},
			{
				"id": "g2",
				"fillColors": "#ffca74",
				"fillAlphas": 0.7,
				"valueAxis": "ValueAxis-2",
				"valueField": "kills",
				"type": "column",
				"balloonText": "[[kills]]",
				"balloonFunction": function (item, graph) {
					var value = graph.balloonText;
					var result = "";
					for (var key in item.dataContext) {
						if (item.dataContext.hasOwnProperty(key)) {
							if ("kills" == key && item.dataContext[key] != "0") {
								var snake = item.dataContext[key] > 1 ? " Snakes" : " Snake";
								result += value.replace("[[" + key + "]]",
										item.dataContext[key] + snake + " Killed");
							}
						}
					}
					return result;

				}
			}],
		"chartScrollbar":
				{
					"autoGridCount": true,
					"graph": "g1",
					"scrollbarHeight": 40
				},
		"chartCursor":
				{
					"limitToGraph": "g1"
				},
		"export":
				{
					"enabled": false
				},
		"legend":
				{
					"enabled": false, //allow a legend to turn on/off the graphs.
					"useGraphSettings": true
				}
	});
};

//
// chart.addListener("rendered", zoomChart);
// zoomChart();
//
// // this method is called when chart is first inited as we listen for "rendered" event
// function zoomChart() {
//     // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
//     chart.zoomToIndexes(chartData.length - 40, chartData.length - 1);
// }
//

if (totalGamesPlayedByUser <= 0) {
	runPlayGameToast();
}

function runPlayGameToast() {

	toastr.options = {
		"closeButton": false,
		"debug": false,
		"newestOnTop": false,
		"progressBar": true,
		"positionClass": "toast-top-left",
		"preventDuplicates": true,
		"onclick": null,
		"showDuration": "300",
		"hideDuration": "1000",
		"timeOut": "5000",
		"extendedTimeOut": "1000",
		"showEasing": "swing",
		"hideEasing": "linear",
		"showMethod": "slideDown",
		"hideMethod": "fadeOut"
	}

	toastr.info('Play a game first');

}

function loadProgressBars() {

    var bars = [];
    for (var n = 0; n < 3; n++) {
        bars.push(new tinyProgressbar(document.getElementById("progress" + n)));
    }
    bars[0].progress(avgScore);
    bars[1].progress(avgKills);
    bars[2].progress(avgBoosts);

}