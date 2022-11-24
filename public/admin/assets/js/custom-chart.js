(function ($) {
  "use strict";
  /*Sale statistics Chart*/
  if ($("#myChart").length) {
    $.ajax({
      url: "graphData",
      success: (res) => {
        let today=new Date().getMonth()
        const Months= [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec"
        ]
        let label=Months.splice(0,today+1)
        var ctx = document.getElementById("myChart").getContext("2d");
        var chart = new Chart(ctx, {
          // The type of chart we want to create
          type: "line",
          options: {
            scales: {
              xAxes: [
                {
                  type: "time",
                },
              ],
            },
          },
          // The data for our dataset
          data: {
            labels:label,
            datasets: [
              {
                label: "Sales",
                tension: 0.3,
                fill: true,
                backgroundColor: "rgba(44, 120, 220, 0.2)",
                borderColor: "rgba(44, 120, 220)",
                data: res.data,
              },
             
            ],
          },
          options: {
            plugins: {
              legend: {
                labels: {
                  usePointStyle: true,
                },
              },
            },
          },
        });
      },
    });
  } //End if

  /*Sale statistics Chart*/
  if ($("#myChart2").length) {
    var ctx = document.getElementById("myChart2");
    var myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["900", "1200", "1400", "1600"],
        datasets: [
          {
            label: "US",
            backgroundColor: "#5897fb",
            barThickness: 10,
            data: [233, 321, 783, 900],
          },
          {
            label: "Europe",
            backgroundColor: "#7bcf86",
            barThickness: 10,
            data: [408, 547, 675, 734],
          },
          {
            label: "Asian",
            backgroundColor: "#ff9076",
            barThickness: 10,
            data: [208, 447, 575, 634],
          },
          {
            label: "Africa",
            backgroundColor: "#d595e5",
            barThickness: 10,
            data: [123, 345, 122, 302],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  } //end if

  //pie chart
  if ($("#myChart1").length) {
    $.ajax({
      url: "piechart",
      success: (res) => {
        var xValues = res.value;
        var yValues = res.pay;
        var barColors = ["#b91d47", "#00aba9", "#2b5797","#ff9076"];

        new Chart("myChart1", {
          type: "pie",
          data: {
            labels: res.pay,
            datasets: [
              {
                backgroundColor: barColors,
                data: res.value,
              },
            ],
          },
          options: {
            title: {
              display: true,
              text: "World Wide Wine Production 2018",
            },
          },
        });
      },
    });
  }
  //payment graph
  if ($("#myChart3").length) {
    $.ajax({
      url: "payment-graph",
      success: (res) => {
        var ctx = document.getElementById("myChart3").getContext("2d");
        var chart = new Chart(ctx, {
          // The type of chart we want to create
          type: "bar",
          options: {
            scales: {
              xAxes: [
                {
                  type: "time",
                },
              ],
            },
          },
          // The data for our dataset
          data: {
            labels: res.pay,
            datasets: [
              {
                label: "Sales",
                tension: 0.3,
                fill: true,
                backgroundColor: "rgba(44, 120, 220, 0.2)",
                borderColor: "rgba(44, 120, 220)",
                data: res.value,
              },
              {
                label: "Products",
                tension: 0.3,
                // fill: true,
                // backgroundColor: "rgba(4, 209, 130, 0.2)",
                // borderColor: "rgb(4, 209, 130)",
                data: [30, 10, 27, 19, 33, 15, 19, 20, 24, 15, 37, 6],
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                labels: {
                  usePointStyle: true,
                },
              },
            },
          },
        });
      },
    });
  } //End if
})(jQuery);

