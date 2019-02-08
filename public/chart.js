angular
    .module('lnapp', [])

    .controller('ChartistExampleCtrl', [
        '$scope', '$http',
        function ($scope, $http) {

            var data = {
                labels: [1, 2, 3],
                series: [
                    [{
                            meta: 'description',
                            value: 1
                        },
                        {
                            meta: 'description',
                            value: 5
                        },
                        {
                            meta: 'description',
                            value: 3
                        }
                    ],
                    [{
                            meta: 'other description',
                            value: 2
                        },
                        {
                            meta: 'other description',
                            value: 4
                        },
                        {
                            meta: 'other description',
                            value: 2
                        }
                    ]
                ]
            };
            var responsiveOptions = [
                ['screen and (min-width: 641px) and (max-width: 1024px)', {
                    showPoint: false,
                    axisX: {
                        labelInterpolationFnc: function (value) {
                            return 'Week ' + value;
                        }
                    }
                }],
                ['screen and (max-width: 640px)', {
                    showLine: false,
                    axisX: {
                        labelInterpolationFnc: function (value) {
                            return 'W' + value;
                        }
                    }
                }]
            ];


            /* Set some base options (settings will override the default settings in Chartist.js *see default settings*). We are adding a basic label interpolation function for the xAxis labels. */
            var options = {
                axisX: {
                    labelInterpolationFnc: function (value) {
                        return 'Calendar Week ' + value;
                    }
                },
                low: 0,
                high: 8,
                fullWidth: true,
                plugins: [
                    Chartist.plugins.tooltip(),
                    Chartist.plugins.ctPointLabels({
                        textAnchor: 'middle'
                    })
                ]
            };

            //new Chartist.Line('#my-chart', data, options, responsiveOptions);
            var chart = new Chartist.Line('#my-chart', {
                labels: [1, 2, 3],
                series: [
                    [{
                            meta: 'description',
                            value: 1
                        },
                        {
                            meta: 'description',
                            value: 5
                        },
                        {
                            meta: 'description',
                            value: 3
                        }
                    ]
                ]
            }, {
                low: 0,
                high: 8,
                fullWidth: true,
                plugins: [
                    Chartist.plugins.tooltip()
                ]
            });


            var data = {
                labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'],
                series: [
                    [1, 2, 4, 8, 6, -2, -1, -4, -6, -2]
                ]
            };

            var options = {
                high: 10,
                low: -10,
                axisX: {
                    labelInterpolationFnc: function (value, index) {
                        return index % 2 === 0 ? value : null;
                    }
                }
            };

            //new Chartist.Bar('#my-chart', data, options);

            $scope.customerReport = {
                errorMessage: "",
                isError: false,
                data: {}
            };
            var lookup = {
                months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            };
            var defaultOptions = {
                high: 10,
                low: 0,
                axisX: {
                    labelInterpolationFnc: function (value, index) {
                        return index % 2 === 0 ? value : null;
                    }
                },
                fullWidth: true,
                plugins: [
                    Chartist.plugins.tooltip(),
                    Chartist.plugins.ctPointLabels({
                        textAnchor: 'middle'
                    })
                ]
            };
            $http.get('api/report/dashboard/customers').then(function (custByMonth) {
                if (custByMonth.data && custByMonth.data.length) {
                    $scope.customerReport.data.labels = custByMonth.data.map((rec) => lookup.months[rec._id.month - 1] + " - " + rec._id.year);
                    $scope.customerReport.data.series = [custByMonth.data.map((rec) => rec.count)];
                    $scope.customerReport.options = $.extend({}, defaultOptions);
                    //new Chartist.Bar('.customer-monthly', $scope.customerReport.data, $scope.customerReport.options);
                    new Chartist.Bar('#my-chart', $scope.customerReport.data, $scope.customerReport.options);

                }
            }, function (error) {
                console.log(error);
            });

        }
    ]);