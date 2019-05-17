
var app = angular.module('MyApp', ['ui.router', 'ngProgress', 'rzModule', 'ui.bootstrap', 'angucomplete-alt']);

app.config(function ($stateProvider, $urlRouterProvider, $locationProvider, $qProvider) {

    $qProvider.errorOnUnhandledRejections(false);

    //$urlRouterProvider.otherwise('/main');

    $stateProvider.state("main", {
        url: "/",
        templateUrl: "Templates/Home.html",
        controller: "MainController",
        controllerAs: "mainCtrl"
    })
        .state("booking", {
            url: "/booking",
            templateUrl: "Templates/booking.html",
            controller: "BookingController",
            controllerAs: "bookingCtrl",
            params: {
                BookingDetail: null
            }
        })
        .state("confirmation", {
            url: "/confirmation",
            templateUrl: "Templates/confirmation.html",
            controller: "ConfirmationController",
            controllerAs: "confirmationCtrl",
            params: {
                ConfirmationDetail: null
            }
        });
    //.state("    ", {
    //    url: "/searchresult",
    //    templateUrl: "Templates/SearchJsonResult.html",
    //    controller: "ResultController",
    //    controllerAs: "resultCtrl"
    //});
    $locationProvider.html5Mode(true);// it will remove the #
});

app.controller('MainController', function ($scope, $http, $window, $sce, $state, $filter, ngProgressFactory, $location, $timeout) {

    $scope.insuranceDetail = {};
    $scope.CalculateTotalTrip = function (Itenary, type) {
        var data = Itenary;
        var Sector = $filter('IsReturn')(Itenary.Sectors.Sector, type);
        return "11h 22m";
    };

    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.progressbar.start();
    $scope.IsWaiting = true;
    //********Drop down List load
    $scope.AirportsDetailedList = [];
    /*     var loadRequest = {
            method: 'GET',
            url: 'http://localhost:8000/airports',
            headers: {
                contentType: 'application/json'
            }
        }; */
    var loadRequest = {
        method: 'GET',
        url: 'https://apineo.provokeaero.com/GetCompusiteAirports',
        headers: {
            contentType: 'application/json'
        }
    };
    //********Drop down List load
    $scope.MinCheapest = 0;
    $scope.count = 0;
    $scope.flightdata = {
        Flights: {},
        AltDateFlights: {},
        AltAirportFlights: {}
    };
    $scope.specificAirlines = [];

    $scope.LeftPanelDepartingFiltersData = [];

    $scope.ClearAllFilter = function () {
        $scope.Cfilter.Stops.Nonstop = false;
        $scope.Cfilter.Stops.Onestop = false;
        $scope.Cfilter.Stops.Twostop = false;
        $scope.Cfilter.SetectedCriteria.SelectedDeparture = {};
        $scope.Cfilter.SetectedCriteria.SelectedReturn = {};
        $scope.Cfilter.SetectedCriteria.SelectedUniqueRef = "";

        angular.forEach($scope.Cfilter.DepartingFromOptions, function (obj) {
            obj.Isselected = false;
        });
        angular.forEach($scope.LeftPanelConnectingFiltersData, function (obj) {
            obj.Isselected = false;
        });
        angular.forEach($scope.LeftPanelDepartingFiltersData, function (obj) {
            obj.Isselected = false;
        });
        angular.forEach($scope.LeftPanelArrivalFiltersData, function (obj) {
            obj.Isselected = false;
        });
        angular.forEach($scope.Cfilter.ArrivalAtOptions, function (obj) {
            obj.Isselected = false;
        });
        angular.forEach($scope.Cfilter.ConnectingInOptions, function (obj) {
            obj.Isselected = false;
        });
        angular.forEach($scope.Cfilter.specificAirlines, function (obj) {
            obj.IsSelected = false;
        });

        $scope.connectingChanged();
        $scope.DeaprtureChanged();
        $scope.arrivingChanged();
        $scope.airlineChange();

    };

    //********** FilterCriteria
    $scope.Cfilter = {
        Stops: {
            Nonstop: false,
            Onestop: false,
            Twostop: false,
            NonstopMinFare: 0,
            OnestopMinFare: 0,
            TwostopMinFare: 0
        },

        OutboundDepartureTimeZone: [{
            ZoneIndex: 1,
            SelectedTimeZone: false,
            TimeZoneDetails: '05:00 - 11:59',
        },
        {
            ZoneIndex: 2,
            SelectedTimeZone: false,
            TimeZoneDetails: '12:00 - 17:59',
        },
        {
            ZoneIndex: 3,
            SelectedTimeZone: false,
            TimeZoneDetails: '18:00 - 04:59',
        }],
        OutboundArrivalTimeZone: [{
            ZoneIndex: 1,
            SelectedTimeZone: false,
            TimeZoneDetails: '05:00 - 11:59',
        },
        {
            ZoneIndex: 2,
            SelectedTimeZone: false,
            TimeZoneDetails: '12:00 - 17:59',
        },
        {
            ZoneIndex: 3,
            SelectedTimeZone: false,
            TimeZoneDetails: '18:00 - 04:59',
        }],
        InboundDepartureTimeZone: [{
            ZoneIndex: 1,
            SelectedTimeZone: false,
            TimeZoneDetails: '05:00 - 11:59',
        },
        {
            ZoneIndex: 2,
            SelectedTimeZone: false,
            TimeZoneDetails: '12:00 - 17:59',
        },
        {
            ZoneIndex: 3,
            SelectedTimeZone: false,
            TimeZoneDetails: '18:00 - 04:59',
        }],
        InboundArrivalTimeZone: [{
            ZoneIndex: 1,
            SelectedTimeZone: false,
            TimeZoneDetails: '05:00 - 11:59',
        },
        {
            ZoneIndex: 2,
            SelectedTimeZone: false,
            TimeZoneDetails: '12:00 - 17:59',
        },
        {
            ZoneIndex: 3,
            SelectedTimeZone: false,
            TimeZoneDetails: '18:00 - 04:59',
        }],
        SetectedCriteria:
            {
                SelectedDeparture: {},
                SelectedReturn: {},
                SelectedUniqueRef: "",
            },

        priceSlider: {
            min: 10,
            max: 2000,
            ceil: 100,
            floor: 99990,
            step: 1
        },

        DepartingFromOptions: [],

        ArrivalAtOptions: [],

        ConnectingInOptions: [],

        specificAirlines: [],

    };
    //********** FilterCriteria

    $scope.clearInput = function (id) {
        if (id) {
            $scope.$broadcast('angucomplete-alt:clearInput', id);
        }
        else {
            $scope.$broadcast('angucomplete-alt:clearInput');
        }
    }
    //************* Price Slider
    var vm = this;
    $scope.lastSliderUpdated = '';
    $scope.myChangeListener = function (sliderId) {
        console.log(sliderId, 'has changed with ', vm.priceSlider.min, '  ', vm.priceSlider.max);
        vm.lastSliderUpdated = vm.priceSlider.min;
    };

    $scope.priceSlider = {
        min: 0,
        max: 100,
        options: {
            floor: 0,
            ceil: 100,
            id: 'sliderB',
            step: 1,
            onChange: vm.myChangeListener,
            interval: 500
        }
    };

    //**********Tabbing
    $scope.tab = 1;
    $scope.setTab = function (newTab) {
        $scope.tab = newTab;
    };
    $scope.isSet = function (tabNum) {
        return $scope.tab === tabNum;
    };

    $scope.triptypetab = 1;
    $scope.setTripTypeTab = function (newTab) {
        $scope.triptypetab = newTab;
        if (newTab === 2) {
            $scope.SearchCritaria.ReturnDate = null;
        }
    };
    $scope.istriptypeSet = function (tabNum) {
        return $scope.triptypetab === tabNum;
    };
    //**********Tabbing

    //**********string to Only Int withoutDecimal
    $scope.truncate = function (n) {
        return Math.floor(n);
    };

    $scope.ToFloat = function (n) {
        return parseFloat(n);
    }

    $scope.ToDate = function (n) {
        if (n == "" || n == null || Object.keys(n).length === 0) {
            return new Date();
        }
        var date = new Date(n.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"))
        return date;

    };

    $scope.To12HourTime = function (n) {
        var hours = Number(n.match(/^(\d+)/)[1]);
        var minutes = Number(n.match(/:(\d+)/)[1]);
        var AMPM = "";
        if (hours < 12) {
            AMPM = "AM"
        };
        if (hours == 12) {
            AMPM = "PM"
        }
        if (hours > 12) {
            AMPM = "PM"
            hours = hours - 12;
        }
        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        if (hours < 10) sHours = "0" + sHours;
        if (minutes < 10) sMinutes = "0" + sMinutes;
        return (sHours + ":" + sMinutes + " " + AMPM);
    };

    $scope.SelectedAirline = function (Airlinecode) {
        if (Airlinecode == undefined || Airlinecode == '') {
            Airlinecode = '';
        }
        angular.forEach($scope.specificAirlines, function (obj) {
            if (obj.Airline == Airlinecode)
                obj.IsSelected = true;
            else
                obj.IsSelected = false;
        });
        $scope.Cfilter.SelectedSpecificAirlines = $filter('IsSelected')($scope.specificAirlines, true);
    };
    //**********string to Only Int withoutDecimal
    $scope.isObjectEmpty = function (obj) {
        if (obj == null)
            return true;
        return Object.keys(obj).length === 0;
    }
    $scope.isNullOrEmpty = function (value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }
    //**************Filter
    $scope.SearchCritaria = {
        WebSite: "TestSite",
        MetaName: "TestMeta",
        Origin: null,
        SelectedOrigin: function (selected) {
            if (selected) {
                $scope.SearchCritaria.Origin = selected.originalObject;
            } else {
                $scope.SearchCritaria.Origin = null;
            }
        },
        Destination: null,
        SelectedDestination: function (selected) {
            if (selected) {
                $scope.SearchCritaria.Destination = selected.originalObject;
            } else {
                $scope.SearchCritaria.Destination = null;
            }
        },
        DepartureDate: "",
        ReturnDate: "",
        Class: "Y",
        Segments: {
            OutBound: [
                {
                    Origin: "MIA",
                    Destination: "NYC",
                    Date: new Date(),
                }
            ],
            InBound: {
                Origin: "NYC",
                Destination: "MIA",
                Date: new Date(),
            }
        },
        PaxDetail: {
            NoOfAdult: "1",
            NoOfChild: "0",
            NoOfInfant: "0"
        },
        Cabin: {
            Class: "Y"
        },
        Skey: null
    };

    $scope.DeaprtureChanged = function () {
        var SelectedDepartingFrom = $filter('IsSelected')($scope.LeftPanelDepartingFiltersData, true);

        var SelectedArrivingAt = $filter('IsSelected')($scope.LeftPanelArrivalFiltersData, true);
        if (SelectedArrivingAt.length > 0 && SelectedDepartingFrom.length > 0) {
            $scope.tab = 1;
        }
        else if (
            (SelectedArrivingAt.length > 0 && SelectedArrivingAt[0].AirpCode != $scope.SearchCritaria.Destination.Code) ||
            (SelectedDepartingFrom.length > 0 && SelectedDepartingFrom[0].AirpCode != $scope.SearchCritaria.Origin.Code)
        ) {
            $scope.tab = 3;
        }
        else if (SelectedArrivingAt.length > 0 || SelectedDepartingFrom.length > 0) {
            $scope.tab = 1;
        }

        $scope.Cfilter.SelectedDepartingFrom = SelectedDepartingFrom;
    };

    $scope.connectingChanged = function () {
        console.log(this);
        $scope.Cfilter.SelectedConnectingIn = $filter('IsSelected')($scope.Cfilter.ConnectingInOptions, true);
    }

    $scope.arrivingChanged = function () {
        console.log(this);
        $scope.Cfilter.SelectedArrivingAt = $filter('IsSelected')($scope.Cfilter.ArrivalAtOptions, true);
    }

    $scope.airlineChange = function () {
        console.log(this);
        $scope.Cfilter.SelectedSpecificAirlines = $filter('IsSelected')($scope.specificAirlines, true);
    }


    $scope.search = function (item) {

        var departuresectors = $filter('IsReturn')(item.Sectors.Sector, 'false');
        var arrivalsectors = $filter('IsReturn')(item.Sectors.Sector, 'true');

        if (departuresectors.length == 1 && arrivalsectors.length == 1 && $scope.Cfilter.Stops.NonstopMinFare == 0) {
            $scope.Cfilter.Stops.NonstopMinFare = parseFloat(item.Adult.AdtBFare[0]) + parseFloat(item.Adult.AdTax[0]);
        }
        else if ((departuresectors.length == 2 || arrivalsectors.length == 2) && item.Sectors.Sector.length <= 4 && $scope.Cfilter.Stops.OnestopMinFare == 0) {
            $scope.Cfilter.Stops.OnestopMinFare = parseFloat(item.Adult.AdtBFare[0]) + parseFloat(item.Adult.AdTax[0]);
        }
        else if ((departuresectors.length > 2 || arrivalsectors.length > 2) && $scope.Cfilter.Stops.TwostopMinFare == 0) {
            $scope.Cfilter.Stops.TwostopMinFare = parseFloat(item.Adult.AdtBFare[0]) + parseFloat(item.Adult.AdTax[0]);
        }



        //Innitialize filterdata
        $scope.Cfilter.DepartingFromOptions = $scope.LeftPanelDepartingFiltersData;
        $scope.Cfilter.ArrivalAtOptions = $scope.LeftPanelArrivalFiltersData;
        $scope.Cfilter.specificAirlines = $scope.specificAirlines;
        $scope.Cfilter.priceSlider = {
            min: $scope.priceSlider.min,
            max: $scope.priceSlider.max,
            ceil: $scope.priceSlider.options.ceil,
            floor: $scope.priceSlider.options.floor,
            step: 1
        };
        //
        var result = $filter('ItineraryFilter')(item, $scope.Cfilter);
        if (result)
            return result;
        return false;
    };

    //**************Filter

    $scope.SelectDeparture = function (item) {
        $window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        if ($scope.Cfilter.SetectedCriteria.SelectedDeparture && $scope.Cfilter.SetectedCriteria.SelectedDeparture.UniqueRef == item.UniqueRef) {
            $scope.Cfilter.SetectedCriteria.SelectedDeparture = null;
            $scope.Cfilter.SetectedCriteria.SelectedUniqueRef = "";
        } else {
            $scope.Cfilter.SetectedCriteria.SelectedDeparture = item;
            var dep = $filter('IsReturn')(item.Sectors.Sector, 'false');
            $scope.Cfilter.SetectedCriteria.SelectedUniqueRef = "";
            angular.forEach(dep, function (obj) {
                $scope.Cfilter.SetectedCriteria.SelectedUniqueRef = $scope.Cfilter.SetectedCriteria.SelectedUniqueRef + obj.AirV + obj.FltNum + obj.Departure.Date + obj.Departure.Time + obj.Arrival.Date + obj.Arrival.Time;
            });
        }



    }

    $scope.SelectReturn = function (item) {
        $window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        if ($scope.Cfilter.SetectedCriteria.SelectedReturn && $scope.Cfilter.SetectedCriteria.SelectedReturn.UniqueRef == item.UniqueRef) {
            $scope.Cfilter.SetectedCriteria.SelectedReturn = null;
            $scope.Cfilter.SetectedCriteria.SelectedUniqueRef = "";
        } else {

            $scope.Cfilter.SetectedCriteria.SelectedReturn = item;
            //$scope.Cfilter.SetectedCriteria.SelectedUniqueRef = "";
            var dep = $filter('IsReturn')(item.Sectors.Sector, 'true');
            angular.forEach(dep, function (obj) {
                $scope.Cfilter.SetectedCriteria.SelectedUniqueRef = $scope.Cfilter.SetectedCriteria.SelectedUniqueRef + obj.AirV + obj.FltNum + obj.Departure.Date + obj.Departure.Time + obj.Arrival.Date + obj.Arrival.Time;
            });
        }

    }

    //**********************Post
    $scope.IsShowReturn = function (FDetail) {
        if ($scope.Cfilter.SetectedCriteria.SelectedReturn != null && Object.keys($scope.Cfilter.SetectedCriteria.SelectedReturn).length > 0)
            return false;
        if (($filter('IsReturn')(FDetail, 'true')).length <= 0) {
            return false;
        }
        return true;
        //if (FDetail)
    }

    // Required Data
    $scope.FlightSearchRQ = {
        CompanyId: "3",
        LangCode: "EN",
        JourneyType: "O",
        Currency: "USD",
        Segments: {
            OutBound: [
                {
                    Origin: "MIA",
                    Destination: "NYC",
                    Date: "2018-10-16"
                }
            ],
            InBound: {
                Origin: "NYC",
                Destination: "MIA",
                Date: "2018-10-25"
            }
        },
        PaxDetail: {
            NoOfAdult: "1",
            NoOfChild: "0",
            NoOfInfant: "0"
        },
        Flexi: "false",
        Direct: "false",
        Cabin: {
            Class: "Y"
        },
        Airlines: {
            Airline: [
                "ALL"
            ],
            Exclude: [
                "NA"
            ]
        },
        Authentication: {
            HapType: "LIVE"
        }
    };

    $scope.localSearch = function (str, airportList) {
        console.log('str', airportList);
        var matches = [];
        airportList.forEach(airport => {
            var index = airport.AirportFullName.toLowerCase().indexOf(str.toLowerCase());
            if (index >= 0) {
                airport.index = index;
                matches.push(airport);
            }
        });

        matches.sort((a, b) => {
            return a.index > b.index ? 1 : -1;
        });
        return matches;
    }

    $scope.loadData = function () {
        $http(loadRequest).then(function (response) {
            $scope.AirportsDetailedList = response.data;

            //************* read query string content start here
            if ($location.search()['org'] != undefined) {
                var foundOrg = [];
                foundOrg = jQuery.grep(response.data, function (a) {
                    return a.Code == $location.search()['org'];
                });
                $scope.SearchCritaria.Origin = foundOrg.length > 0 ? foundOrg[0] : null;
            }
            //{ Code: "ATW", AirportFullName: "" };//$location.search()['org'];
            if ($location.search()['dest'] != undefined) {
                var foundDest = [];
                foundDest = jQuery.grep(response.data, function (a) {
                    return a.Code == $location.search()['dest'];
                });
                $scope.SearchCritaria.Destination = foundDest.length > 0 ? foundDest[0] : null;
            }
            if ($location.search()['depDt'] != undefined)
                $scope.SearchCritaria.DepartureDate = $location.search()['depDt'];
            if ($location.search()['retDt'] != undefined)
                $scope.SearchCritaria.ReturnDate = $location.search()['retDt'];
            if ($location.search()['org'] != undefined && ($scope.SearchCritaria.ReturnDate == "" || $scope.SearchCritaria.ReturnDate == null || Object.keys($scope.SearchCritaria.ReturnDate).length === 0)) {
                $scope.setTripTypeTab(2);
            }
            if ($location.search()['ct'] != undefined)
                $scope.FlightSearchRQ.Cabin.Class = $location.search()['ct'];
            if ($location.search()['adt'] != undefined)
                $scope.FlightSearchRQ.PaxDetail.NoOfAdult = $location.search()['adt'];
            if ($location.search()['chd'] != undefined)
                $scope.FlightSearchRQ.PaxDetail.NoOfChild = $location.search()['chd'];
            if ($location.search()['inf'] != undefined)
                $scope.FlightSearchRQ.PaxDetail.NoOfInfant = $location.search()['inf'];
            if ($location.search()['Meta'] != undefined)
                $scope.SearchCritaria.MetaName = $location.search()['Meta'];
            //if ($location.search()['siteId'] != undefined)
            //    $scope.FlightSearchRQ.CompanyId = $location.search()['siteId'];
            if ($location.search()['org'] != undefined && $location.search()['dest'] != undefined) {
                $scope.SearchFlight();
            }
            else {
                $scope.progressbar.complete();
                $scope.IsWaiting = false;
            }
        });

        //************* read query string content start here

    };

    $scope.Seats = function (Sectors) {
        var SeatsArr = [];
        if (Sectors != undefined && Sectors.Sector.length > 0) {
            $.each(Sectors.Sector, function (index, data) {
                SeatsArr.push(parseInt(data.NoSeats));
            });
            return Math.min.apply(Math, SeatsArr);
        }
        return 0;
    }

    $scope.SearchFlightRQ = function () {
        var org = "";
        if ($scope.SearchCritaria.Origin.description == undefined)
            org = $scope.SearchCritaria.Origin.Code;
        else
            org = $scope.SearchCritaria.Origin.description;

        var dest = "";
        if ($scope.SearchCritaria.Destination.description == undefined)
            dest = $scope.SearchCritaria.Destination.Code;
        else
            dest = $scope.SearchCritaria.Destination.description;

        var landingUrl = $location.protocol() + "://" + $window.location.host + "?" + "org=" + org + "&dest=" + dest
            +
            "&depDt=" + $filter('date')(Date.parse($scope.SearchCritaria.DepartureDate), "yyyy-MM-dd") +
            "&retDt=" + $filter('date')(Date.parse($scope.SearchCritaria.ReturnDate), "yyyy-MM-dd") + "&ct=Y";
        $window.open(landingUrl, "_self");
    }

    $scope.SearchFlight = function () {

        $scope.progressbar.start();
        $scope.IsWaiting = true;
        $scope.Cfilter.SelectedUniqueRef = null;
        $scope.Cfilter.SetectedCriteria.SelectedDeparture = null;
        $scope.Cfilter.SetectedCriteria.SelectedReturn = null;
        //**********************
        if ($scope.SearchCritaria.Origin == undefined || $scope.SearchCritaria.Destination == undefined) {
            alert('Please select Origin and Destination from List');
            $scope.progressbar.complete();
            $scope.IsWaiting = false;
            return;
        }
        else if ($scope.SearchCritaria.DepartureDate == undefined || $scope.SearchCritaria.DepartureDate == "") {
            alert('Please select Depart Date');
            $scope.progressbar.complete();
            $scope.IsWaiting = false;
            return;
        }
        else if ($scope.SearchCritaria.ReturnDate != "" && $scope.SearchCritaria.ReturnDate != undefined) {
            // $filter('date')($scope.FlightSearchRQ.Segments.InBound.Date, "dd-MM-yyyy");
            $scope.FlightSearchRQ.Segments =
                {
                    OutBound: [
                        {
                            Origin: $scope.SearchCritaria.Origin.Code,
                            Destination: $scope.SearchCritaria.Destination.Code,
                            Date: $scope.ToDate($scope.SearchCritaria.DepartureDate.replace(/-/g, ' ')),
                        }
                    ],
                    InBound: {
                        Origin: $scope.SearchCritaria.Destination.Code,
                        Destination: $scope.SearchCritaria.Origin.Code,
                        Date: $scope.ToDate($scope.SearchCritaria.ReturnDate.replace(/-/g, ' ')),
                    }
                };
        }
        else {
            $scope.FlightSearchRQ.Segments =
                {
                    OutBound: [
                        {
                            Origin: $scope.SearchCritaria.Origin.Code,
                            Destination: $scope.SearchCritaria.Destination.Code,
                            Date: $scope.ToDate($scope.SearchCritaria.DepartureDate.replace(/-/g, ' ')),
                        }
                    ]
                };
        }

        if ($scope.FlightSearchRQ.PaxDetail.NoOfAdult == "0" || $scope.FlightSearchRQ.PaxDetail.NoOfAdult == undefined) {
            alert('Please select atleast 1 Adult');
            $scope.progressbar.complete();
            $scope.IsWaiting = false;
            return;
        };
        $scope.SearchFlight.PaxDetail = $scope.FlightSearchRQ.PaxDetail;
        $scope.SearchFlight.Class = $scope.FlightSearchRQ.Cabin.Class;
        $scope.Cfilter.Stops = {
            Nonstop: false,
            Onestop: false,
            Twostop: false,
            NonstopMinFare: 0,
            OnestopMinFare: 0,
            TwostopMinFare: 0
        };
        //***************************


        console.log($scope.FlightSearchRQ);
        /* 
        var req = {
            method: 'GET',
            url: 'http://localhost:8000/kuchbhi',
            headers: {
                contentType: 'application/json'
            }
        } */

        $scope.leftPanelFilterData = function (filtertype) {
            var AllfilteredData = [];
            var cheapestFlightData = $scope.flightdata.Flights.Flight;
            var AltDates = $scope.flightdata.AltDateFlights.Flight;
            var nearByAirport = $scope.flightdata.AltAirportFlights.Flight;

            var allDataMergedArray = [];
            var departingFromArr = [];
            var ArrivalAtArr = [];

            if ($scope.flightdata.AltAirportFlights.Flight != undefined) {

                $.merge($.merge($.merge(allDataMergedArray, cheapestFlightData), AltDates), nearByAirport);
            }
            else {
                $.merge($.merge(allDataMergedArray, cheapestFlightData), AltDates);
            }

            $.each(allDataMergedArray, function (index, data) {
                var totalPrice = data.TotalPrice;
                var IsReturn = "";
                if (filtertype == "departing") {
                    IsReturn = "false";
                }
                else if (filtertype == "arrival") {
                    IsReturn = "false";
                }
                var Record = [];
                if (filtertype == "departing" || filtertype == "arrival") {
                    Record = $.grep(data.Sectors.Sector, function (n, i) {
                        return n.IsReturn === "false";
                    });
                }
                else if (filtertype == "connecting") {
                    var sectorCount = data.Sectors.Sector.length;



                    Record = $.grep(data.Sectors.Sector, function (n, i) {

                        return i != 0 && i != (sectorCount - 1);
                    });
                }
                if (Record.length > 0) {
                    if (filtertype == "departing" || filtertype == "arrival") {

                        if (filtertype == "departing")
                            AllfilteredData.push({
                                TotalPrice: parseFloat(totalPrice), AirpCode: Record[0].Departure.AirpCode, Isselected: false, AirpName: Record[0].Departure.AirpName
                            });
                        else if (filtertype == "arrival")
                            AllfilteredData.push({ TotalPrice: parseFloat(totalPrice), AirpCode: Record[Record.length - 1].Arrival.AirpCode, Isselected: false, AirpName: Record[Record.length - 1].Arrival.AirpName });

                    }
                    else if (filtertype == "connecting") {
                        $.each(Record, function (index, data) {

                            AllfilteredData.push({ TotalPrice: parseFloat(totalPrice), AirpCode: data.Departure.AirpCode, Isselected: false, AirpName: data.Departure.AirpName });

                        });
                    }
                }

            });

            var uniqueFilteredData = [];
            var flags = [], output = [], l = AllfilteredData.length, i;
            for (i = 0; i < l; i++) {
                if (flags[AllfilteredData[i].AirpCode] && flags[AllfilteredData[i].TotalPrice]) continue;
                flags[AllfilteredData[i].AirpCode] = true;
                flags[AllfilteredData[i].TotalPrice] = true;
                output.push(AllfilteredData[i]);
            }


            var groups1 = {};
            var groups = {};
            for (var i = 0; i < output.length; i++) {
                var groupName = output[i].AirpCode;
                if (!groups[groupName]) {
                    groups[groupName] = [];
                }
                groups[groupName].push(output[i].TotalPrice);
                if (!groups1[groupName]) {
                    groups1[groupName] = [];
                    groups1[groupName].push(output[i].AirpName);
                }

            }

            myArray = [];
            for (var groupName in groups1) {
                //var grpName = output.filter(function (obj) { return obj.AirpCode == groupName });
                myArray.push({ group: groupName, TotalPrices: groups[groupName], AirpName: groups1[groupName][0] });
            }
            var FilterData = [];

            if (filtertype == "connecting") {
                $.each($scope.LeftPanelDepartingFiltersData, function (i, n) {
                    departingFromArr.push(n.AirpCode);
                });
                $.each($scope.LeftPanelArrivalFiltersData, function (i, n) {
                    ArrivalAtArr.push(n.AirpCode);
                });
            }
            $.each(myArray, function (index, data) {

                if (filtertype == "connecting") {
                    if (!($.inArray(data.group, departingFromArr) + 1 > 0) &&
                        !($.inArray(data.group, ArrivalAtArr) + 1 > 0)) {
                        FilterData.push({ AirpCode: data.group, Price: Math.min.apply(Math, data.TotalPrices), Isselected: false, AirpName: data.AirpName });
                    }

                } else {
                    FilterData.push({ AirpCode: data.group, Price: Math.min.apply(Math, data.TotalPrices), Isselected: false, AirpName: data.AirpName });
                }

            });

            return FilterData;
        };


        var req = {
            method: 'POST',
            url: 'https://apineo.provokeaero.com/SaberDirect/SearchFlights',
            headers: {
                contentType: 'application/json'
            },
            data: $scope.FlightSearchRQ
        }

        $http(req).then(function (response) {
            $scope.IsWaiting = false;
            if (response.data == null) {
                $scope.progressbar.complete();
                $scope.IsWaiting = false;
                alert('No record found');
            }
            if (response.data.Flights.length < 0) {

                $scope.progressbar.complete();
            }
            console.log(response.data);
            $scope.flightdata.Flights = response.data.Flights;
            $scope.flightdata.AltDateFlights = response.data.AltDateFlights;
            $scope.flightdata.AltAirportFlights = response.data.AltAirportFlights;
            $scope.specificAirlines = response.data.specificAirlines;
            $scope.SearchCritaria.Skey = response.data.SKey;
            $scope.count = $scope.flightdata.Flights.Flight.length;
            var Minfare = 0;
            var Maxfare = 0;
            if ($scope.flightdata.Flights.Flight.length > 0)
                Minfare = (Math.trunc($scope.flightdata.Flights.Flight[0].Adult.AdtBFare[0]) + Math.trunc($scope.flightdata.Flights.Flight[0].Adult.AdTax[0]));

            if ($scope.flightdata.Flights.Flight.length > 0)
                Maxfare = (Math.trunc($scope.flightdata.Flights.Flight[$scope.flightdata.Flights.Flight.length - 1].Adult.AdtBFare[0]) + Math.trunc($scope.flightdata.Flights.Flight[$scope.flightdata.Flights.Flight.length - 1].Adult.AdTax[0]));



            $scope.MinCheapest = (Math.trunc($scope.flightdata.Flights.Flight[0].Adult.AdtBFare[0]) + Math.trunc($scope.flightdata.Flights.Flight[0].Adult.AdTax[0]));
            //*******Calculate MinFare
            if ($scope.flightdata.AltDateFlights.Flight.length > 0 && (Math.trunc($scope.flightdata.Flights.Flight[0].Adult.AdtBFare[0]) + Math.trunc($scope.flightdata.Flights.Flight[0].Adult.AdTax[0]))
                > (Math.trunc($scope.flightdata.AltDateFlights.Flight[0].Adult.AdtBFare[0]) + Math.trunc($scope.flightdata.AltDateFlights.Flight[0].Adult.AdTax[0]))) {
                Minfare = (Math.trunc($scope.flightdata.AltDateFlights.Flight[0].Adult.AdtBFare[0]) + Math.trunc($scope.flightdata.AltDateFlights.Flight[0].Adult.AdTax[0]));
            }
            if ($scope.flightdata.AltAirportFlights.Flight != undefined && $scope.flightdata.AltAirportFlights.Flight.length > 0 && Minfare > (Math.trunc($scope.flightdata.AltAirportFlights.Flight[0].Adult.AdtBFare[0]) + Math.trunc($scope.flightdata.AltAirportFlights.Flight[0].Adult.AdTax[0]))) {
                Minfare = (Math.trunc($scope.flightdata.AltAirportFlights.Flight[0].Adult.AdtBFare[0]) + Math.trunc($scope.flightdata.AltAirportFlights.Flight[0].Adult.AdTax[0]));
            }
            //*******Calculate MinFare

            //*******Calculate MaxFare
            if ($scope.flightdata.AltDateFlights.Flight.length > 0 && (Math.trunc($scope.flightdata.Flights.Flight[$scope.flightdata.Flights.Flight.length - 1].Adult.AdtBFare[0]) + Math.trunc($scope.flightdata.Flights.Flight[$scope.flightdata.Flights.Flight.length - 1].Adult.AdTax[0]))
                > (Math.trunc($scope.flightdata.AltDateFlights.Flight[$scope.flightdata.AltDateFlights.Flight.length - 1].Adult.AdtBFare[0]) + Math.trunc($scope.flightdata.AltDateFlights.Flight[$scope.flightdata.AltDateFlights.Flight.length - 1].Adult.AdTax[0]))) {
                Maxfare = (Math.trunc($scope.flightdata.Flights.Flight[$scope.flightdata.Flights.Flight.length - 1].Adult.AdtBFare[0]) + Math.trunc($scope.flightdata.Flights.Flight[$scope.flightdata.Flights.Flight.length - 1].Adult.AdTax[0]));
            }
            else {
                Maxfare = (Math.trunc($scope.flightdata.AltDateFlights.Flight[$scope.flightdata.AltDateFlights.Flight.length - 1].Adult.AdtBFare[0]) + Math.trunc($scope.flightdata.AltDateFlights.Flight[$scope.flightdata.AltDateFlights.Flight.length - 1].Adult.AdTax[0]));
            }
            if ($scope.flightdata.AltAirportFlights.Flight != undefined && $scope.flightdata.AltAirportFlights.Flight.length > 0 && Maxfare < (Math.trunc($scope.flightdata.AltAirportFlights.Flight[$scope.flightdata.AltAirportFlights.Flight.length - 1].Adult.AdtBFare[0]) + Math.trunc($scope.flightdata.AltAirportFlights.Flight[$scope.flightdata.AltAirportFlights.Flight.length - 1].Adult.AdTax[0]))) {
                Maxfare = (Math.trunc($scope.flightdata.AltAirportFlights.Flight[$scope.flightdata.AltAirportFlights.Flight.length - 1].Adult.AdtBFare[0]) + Math.trunc($scope.flightdata.AltAirportFlights.Flight[$scope.flightdata.AltAirportFlights.Flight.length - 1].Adult.AdTax[0]));
            }
            //*******Calculate MaxFare
            $timeout(() => {
                $scope.priceSlider = {
                    min: Minfare,
                    max: Maxfare + 1,
                    options: {
                        floor: (Minfare - 1),
                        ceil: Maxfare + 1
                    }
                };
            }, 100);


            $scope.LeftPanelDepartingFiltersData = $scope.leftPanelFilterData("departing");
            $scope.Cfilter.DepartingFromOptions = $scope.LeftPanelDepartingFiltersData;
            $scope.Cfilter.SelectedDepartingFrom = $filter('IsSelected')($scope.LeftPanelDepartingFiltersData, true);
            $scope.LeftPanelArrivalFiltersData = $scope.leftPanelFilterData("arrival");
            $scope.Cfilter.ArrivalAtOptions = $scope.LeftPanelArrivalFiltersData;
            $scope.Cfilter.SelectedArrivingAt = $filter('IsSelected')($scope.Cfilter.ArrivalAtOptions, true);

            $scope.LeftPanelConnectingFiltersData = $scope.leftPanelFilterData("connecting");
            $scope.Cfilter.ConnectingInOptions = $scope.LeftPanelConnectingFiltersData;
            $scope.Cfilter.SelectedConnectingIn = $filter('IsSelected')($scope.Cfilter.ConnectingInOptions, true);
            $scope.Cfilter.SelectedSpecificAirlines = $filter('IsSelected')($scope.specificAirlines, true);
            $scope.progressbar.complete();
            $scope.IsWaiting = false;
        },
            function (reason) {
                $scope.progressbar.complete();
                $scope.IsWaiting = false;
                $scope.error = reason.data;

                $log.info(reason);
            });
    };


    //**********************Post

    //************* Go to
    $scope.goToBooking = function (AirlineDetail) {
        //var bookingDetail = { AirlineDetail: AirlineDetail, SearchCritaria: $scope.FlightSearchRQ };
        //$state.go("booking", { BookingDetail: bookingDetail });
        var bookingUrl = $location.protocol() + "://" + $window.location.host + "/booking?" +
            "Skey=" + $scope.SearchCritaria.Skey +
            "&Ikey=";
        var Uniuqueref = bookingUrl + AirlineDetail.UniqueRef;
        $window.location.href = Uniuqueref;
    };
    //************* Go to

    $scope.setvalues = function () {
        $scope.formattedDate = $filter('date')(Date.parse($scope.SearchCritaria.ReturnDate), "dd-MM-yyyy");
        alert($scope.formattedDate);
        var d = new Date($scope.SearchCritaria.ReturnDate);
        var datestring = ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + "/" + + d.getFullYear();
        $scope.formattedDate = datestring;
        alert($scope.formattedDate);
    };
});

app.controller('BookingController', function ($scope, $http, $window, $state, $location, $stateParams, $filter, ngProgressFactory) { //
    $scope.setTravelProtection = function (value) {
        $scope.insuranceDetail.InsSelected = value;
        if (value == "YES" && $scope.insuranceQuote.Status.Success == "true") {

            $scope.insuranceDetail.AdtInsurance = $scope.insuranceQuote.PolicyInformation.Premium.StandardPremiumDistribution.Travelers.Traveler[0].TravelerPremium;

            if ($scope.fareMatchRQ.PaxDetail.NoOfChild > 0) {
                $scope.insuranceDetail.ChdInsurance = $scope.insuranceQuote.PolicyInformation.Premium.StandardPremiumDistribution.Travelers.Traveler[+($scope.fareMatchRQ.PaxDetail.NoOfAdult)].TravelerPremium;
                if ($scope.fareMatchRQ.PaxDetail.NoOfInfant > 0) {

                    $scope.insuranceDetail.InfInsurance = $scope.insuranceQuote.PolicyInformation.Premium.StandardPremiumDistribution.Travelers.Traveler[+($scope.fareMatchRQ.PaxDetail.NoOfAdult) + +($scope.fareMatchRQ.PaxDetail.NoOfChild)].TravelerPremium;

                } else {
                    $scope.insuranceDetail.InfInsurance = 0;
                }
            } else {
                $scope.insuranceDetail.ChdInsurance = 0;
                if ($scope.fareMatchRQ.PaxDetail.NoOfInfant > 0) {

                    $scope.insuranceDetail.InfInsurance = $scope.insuranceQuote.PolicyInformation.Premium.StandardPremiumDistribution.Travelers.Traveler[+($scope.fareMatchRQ.PaxDetail.NoOfAdult)].TravelerPremium;

                } else {
                    $scope.insuranceDetail.InfInsurance = 0;
                }
            }

$scope.insuranceDetail.TotalInsurance = $scope.insuranceQuote.PolicyInformation.Premium.StandardPremiumDistribution.Travelers.Traveler[0].TravelerPremium;
            //$scope.insuranceDetail.TotalInsurance = $scope.insuranceQuote.PolicyInformation.Premium.TotalPremiumAmount;
        } else {
            $scope.insuranceDetail.AdtInsurance = 0;
            $scope.insuranceDetail.ChdInsurance = 0;
            $scope.insuranceDetail.InfInsurance = 0;
            $scope.insuranceDetail.TotalInsurance = 0;
        }

    }
    $scope.ToDate = function (n) {
        if (n == "" || n == null || Object.keys(n).length === 0) {
            return new Date();
        }
        var date = new Date(n.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"))
        return date;
    };

    $scope.To12HourTime = function (n) {
        var hours = Number(n.match(/^(\d+)/)[1]);
        var minutes = Number(n.match(/:(\d+)/)[1]);
        var AMPM = "";
        if (hours < 12) {
            AMPM = "AM"
        };
        if (hours == 12) {
            AMPM = "PM"
        }
        if (hours > 12) {
            AMPM = "PM"
            hours = hours - 12;
        }
        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        if (hours < 10) sHours = "0" + sHours;
        if (minutes < 10) sMinutes = "0" + sMinutes;
        return (sHours + ":" + sMinutes + " " + AMPM);
    };

    $scope.isObjectEmpty = function (obj) {
        if (obj == null)
            return true;
        return Object.keys(obj).length === 0;
    }

    $scope.Gender = [{ text: "Male", value: "M" },
    { text: "Female", value: "F" }]
    $scope.Month = [{ text: "Jan", value: "01" },
    { text: "Feb", value: "02" }, { text: "Mar", value: "03" }, { text: "Apr", value: "04" }, { text: "May", value: "05" }, { text: "Jun", value: "06" }, { text: "Jul", value: "07" },
    { text: "Aug", value: "08" }, { text: "Sep", value: "09" }, { text: "Oct", value: "10" }, { text: "Nov", value: "11" }, { text: "Dec", value: "12" },]
    $scope.Year = [];
    for (var i = 2018; i < 2050; i++) {
        $scope.Year.push({ text: i.toString(), value: i.toString() });
    }
    $scope.PaymentMetohd = [{ text: "Visa", value: "Visa" }, { text: "Master Card", value: "Master Card" }, { text: "American Express", value: "American Express" }, { text: "Diners Club", value: "Diners Club" },
    { text: "Discovery", value: "Discovery" }, { text: "Carte Blanche", value: "Carte Blanche" }, { text: "PayPal", value: "PayPal" }, { text: "Paypal Credit", value: "Paypal Credit" }]
    //------------Start Parse to int function
    $scope.parseToInt = function (myAcc) {
        return parseInt(myAcc);
    }
    $scope.ToFloat = function (n) {
        return parseFloat(n);
    }
    //------------End 
    $scope.Seats = function (Sectors) {
        var SeatsArr = [];
        if (Sectors != undefined && Sectors.Sector.length > 0) {
            $.each(Sectors.Sector, function (index, data) {
                SeatsArr.push(parseInt(data.NoSeats));
            });
            return Math.min.apply(Math, SeatsArr);
        }
        return 0;
    }


    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.progressbar.start();
    $scope.FlightDetails = {};
    //Obsolute
    //$scope.FlightDetails = $stateParams.BookingDetail.AirlineDetail;
    //$scope.SearchCritaria = $stateParams.BookingDetail.SearchCritaria;

    $scope.IsOneWay = false;

    $scope.RQcriteria = {
        Skey: null,
        Ikey: null,
        Bkey: null,
    };

    $scope.TravlerDetail = { Adult: [], Child: [], Infant: [] };

    $scope.fareMatchRQ =
        {
            FlightDetail: {
                Flight: {}
            },
            ClientDetail: {
                ClientId: "ADT1",
                Title: "",
                FirstName: "",
                LastName: "",
                Age: "",
                DOB: "",
                Gender: "M",
                Email: "",
                Mobile: "",
                Phone: "",
                Meal: "",
                Seat: "",
                Passport: "",
                Nationality: ""
            },
            PaxDetail: {
                Adult: [
                    {
                        LocalId: "ADT1",
                        Type: "ADT",
                        Title: "Mr",
                        FirstName: "",
                        LastName: "",
                        Age: "",
                        DOB: "",
                        Gender: "M",
                        Email: "",
                        Phone: "",
                        Meal: "0",
                        Seat: "0",
                        FreqFlyerNo: {
                            Airline: ""
                        },
                        Passport: "NA",
                        Nationality: "",
                        InfAsso: "ADT1"
                    }],
                Child: [],
                Infant: [],
                NoOfAdult: "0",
                NoOfChild: "0",
                NoOfInfant: "0",
            },
            SearchDetail: {
                FlightSearchRQ: {}
            }
        };


    $scope.loadData = function () {
        $scope.QuoteDetail = {};
        $scope.insuranceDetail = {};

        if ($location.search()['Skey'] != undefined)
            $scope.RQcriteria.Skey = $location.search()['Skey'];
        if ($location.search()['Ikey'] != undefined)
            $scope.RQcriteria.Ikey = $location.search()['Ikey'];
        var loadRequest = {
            method: 'POST',
            url: 'https://apineo.provokeaero.com/SaberDirect/GetSelectedBookingRQ?Skey=' + $scope.RQcriteria.Skey + '&Ikey=' + $scope.RQcriteria.Ikey,
            headers: {
                contentType: 'application/json'
            },
            data: $scope.RQcriteria.Rkey
        }


        $http(loadRequest).then(function (response) {
            if (response.data == null) {
                $scope.progressbar.complete();
                alert('No record found');
            }
            console.log(response.data);
            $scope.fareMatchRQ.SearchDetail = response.data.SearchDetail;
            $scope.fareMatchRQ.FlightDetail = response.data.FlightDetail;
            $scope.FlightDetails = $scope.fareMatchRQ.FlightDetail;
            $scope.IsOneWay = true;
            $scope.backUrl = $location.protocol() + "://" + $window.location.host + "?" +
                "org=" + $scope.fareMatchRQ.SearchDetail.FlightSearchRQ.Segments.OutBound[0].Origin +
                "&dest=" + $scope.fareMatchRQ.SearchDetail.FlightSearchRQ.Segments.OutBound[0].Destination +
                "&depDt=" + $filter('date')($scope.ToDate($scope.fareMatchRQ.SearchDetail.FlightSearchRQ.Segments.OutBound[0].Date), "MMM-dd-yyyy") +
                "&ct=" + $scope.fareMatchRQ.SearchDetail.FlightSearchRQ.Cabin.Class +
                "&adt=" + $scope.fareMatchRQ.SearchDetail.FlightSearchRQ.PaxDetail.NoOfAdult +
                "&chd=" + $scope.fareMatchRQ.SearchDetail.FlightSearchRQ.PaxDetail.NoOfChild +
                "&inf=" + $scope.fareMatchRQ.SearchDetail.FlightSearchRQ.PaxDetail.NoOfInfant +
                "&siteId=" + $scope.fareMatchRQ.SearchDetail.FlightSearchRQ.CompanyId;
            if ($scope.fareMatchRQ.SearchDetail.FlightSearchRQ.Segments.InBound != undefined) {
                $scope.backUrl += "&retDt=" + $filter('date')($scope.ToDate($scope.fareMatchRQ.SearchDetail.FlightSearchRQ.Segments.InBound.Date), "MMM-dd-yyyy");
                $scope.IsOneWay = false;
            }
            //Operation ************

            $scope.fareMatchRQ.PaxDetail.NoOfAdult = response.data.SearchDetail.FlightSearchRQ.PaxDetail.NoOfAdult;
            $scope.fareMatchRQ.PaxDetail.NoOfChild = response.data.SearchDetail.FlightSearchRQ.PaxDetail.NoOfChild;
            $scope.fareMatchRQ.PaxDetail.NoOfInfant = response.data.SearchDetail.FlightSearchRQ.PaxDetail.NoOfInfant;
            $scope.insuranceDetail.InsSelected = 'NO';
            var dummyQuote = {
                "travelers": {
                    "Traveler": [

                    ]
                },
                "trip": {
                    "DepartureDate": "09/15/2018",
                    "ReturnDate": "09/18/2018",
                    "InitialTripDepositDate": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "FinalPaymentDate": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "Destinations": {
                        "Destination": {
                            "Country": "NA",
                            "State": "NA"
                        }
                    }
                },
                "travelType": 0,
                "ToDigitRasidanceState": "CA",
                "PlanId": "117705"
            };

            for (var i = 0; i < parseInt(response.data.SearchDetail.FlightSearchRQ.PaxDetail.NoOfAdult); i++) {
                dummyQuote.travelers.Traveler.push({
                    "TripCost": response.data.FlightDetail.Flight.Adult.AdtBFare[0],
                    "BirthDate": $filter('date')(new Date(new Date().getTime() - 30 * 365 * 24 * 60 * 60 * 1000), 'MM/dd/yyyy'),
                    "Address": {
                        "Country": "United States",
                        "State": "California",
                    }

                });
            }
            for (var i = 0; i < parseInt(response.data.SearchDetail.FlightSearchRQ.PaxDetail.NoOfChild); i++) {
                dummyQuote.travelers.Traveler.push({
                    "TripCost": response.data.FlightDetail.Flight.Adult.ChdBFare,
                    "BirthDate": $filter('date')(new Date(new Date().getTime() - 8 * 365 * 24 * 60 * 60 * 1000), 'MM/dd/yyyy'),
                    "Address": {
                        "Country": "United States",
                        "State": "California",
                    }

                });
            }
            for (var i = 0; i < parseInt(response.data.SearchDetail.FlightSearchRQ.PaxDetail.NoOfInfant); i++) {
                dummyQuote.travelers.Traveler.push({
                    "TripCost": response.data.FlightDetail.Flight.Adult.InfBFare,
                    "BirthDate": $filter('date')(new Date(new Date().getTime() - 1 * 365 * 24 * 60 * 60 * 1000), 'MM/dd/yyyy'),
                    "Address": {
                        "Country": "United States",
                        "State": "California",
                    }

                });
            }

            $scope.QuoteDetail = dummyQuote;
            var loadRequest = {
                method: 'POST',
                url: 'https://bookings.barakehtravel.com/Api/InsuranceQuoteRequest',
                headers: {
                    contentType: 'application/json'
                },
                data: $scope.QuoteDetail
            }

            $http(loadRequest).then(function (response) {
                $scope.insuranceQuote = response.data;

                if (response.data != undefined && response.data != null && $scope.insuranceQuote.Status.Success == "true") {
                    $scope.insuranceDetail.FixedTotalInsurance = $scope.insuranceQuote.PolicyInformation.Premium.StandardPremiumDistribution.Travelers.Traveler[0].TravelerPremium;
					//$scope.insuranceQuote.PolicyInformation.Premium.TotalPremiumAmount;
                }




            });


            $scope.insuranceDetail.AdtInsurance = 0;
            $scope.insuranceDetail.ChdInsurance = 0;
            $scope.insuranceDetail.InfInsurance = 0;
            $scope.insuranceDetail.TotalInsurance = 0;

            for (var i = 0; i < parseInt($scope.fareMatchRQ.PaxDetail.NoOfAdult); i++) {

                var obj = {
                    FirstName: "",
                    MiddleName: "",
                    LastName: "",
                    DOB: {
                        month: "01",
                        dd: null,
                        yyyy: null,
                    },
                    Gender: "",
                    Travler: "Adult"
                }
                $scope.TravlerDetail.Adult.push(obj);
            }
            //bind child travler
            for (var i = 0; i < parseInt($scope.fareMatchRQ.PaxDetail.NoOfChild); i++) {

                var obj = {
                    FirstName: "",
                    MiddleName: "",
                    LastName: "",
                    DOB: {
                        month: "01",
                        dd: null,
                        yyyy: null,
                    },
                    Gender: "",
                    Travler: "Child"
                }
                $scope.TravlerDetail.Child.push(obj);
            }
            // bind Infant travler
            for (var i = 0; i < parseInt($scope.fareMatchRQ.PaxDetail.NoOfInfant); i++) {

                var obj = {
                    FirstName: "",
                    MiddleName: "",
                    LastName: "",
                    DOB: {
                        month: "01",
                        dd: null,
                        yyyy: null,
                    },
                    Gender: "",
                    Travler: "Infant"
                }
                $scope.TravlerDetail.Infant.push(obj);
            }

            $scope.progressbar.complete();
        },
            function (reason) {
                $scope.progressbar.complete();
                $scope.error = reason.data;

                $log.info(reason);
            });
    };

    $scope.backUrl = $location.protocol() + "://" + $window.location.host + "?";

    //Obsolute
    //$scope.fareMatchRQ.FlightDetail.Flight = $scope.FlightDetails;
    //$scope.fareMatchRQ.SearchDetail.FlightSearchRQ = $scope.SearchCritaria;

    $scope.CardDetail = {
        PaymentMethod: "American Express",
        CardNumber: "",
        CarHolderName: "",
        ExpiryMonth: "",
        ExpiryYear: "",
        CardVerificationNumber: ""
    };

    $scope.BillingContactDetail = {
        Country: "",
        Address1: "",
        Address2: "",
        City: "",
        State: "",
        Zip: "",
        PhoneNumber: "",
        Email: "",
    };

    // bind adult travler

    $scope.goToConfirmation = function (confirmationdetail) {
        //$state.go("confirmation", { ConfirmationDetail: confirmationdetail });
        if (confirmationdetail == null) {

            $window.location.href = $scope.backUrl;
        }
        else {
            var ConfirmationUrl = $location.protocol() + "://" + $window.location.host + "/confirmation?" +
                "Bkey=" + confirmationdetail.Bkey;
            $window.location.href = ConfirmationUrl;
        }
    };

    $scope.BookFlight = function (IsValid) {

        if (IsValid) {
            $scope.progressbar.start();
            $scope.fareMatchRQ.PaxDetail.Adult.length = 0;
            $scope.fareMatchRQ.PaxDetail.Child.length = 0;
            $scope.fareMatchRQ.PaxDetail.Infant.length = 0;
            angular.forEach($scope.TravlerDetail.Adult, function (item, key) {
                var index = key;
                var obj = {
                    LocalId: "ADT" + (key + 1),
                    Type: "ADT",
                    Title: $scope.GetSpouse(item.Gender),
                    FirstName: item.FirstName,
                    LastName: $filter('NoSpace')(item.LastName + " " + item.MiddleName),
                    Age: "",
                    DOB: item.DOB.dd + "-" + item.DOB.month + "-" + item.DOB.yyyy,
                    Gender: item.Gender,
                    Email: $scope.BillingContactDetail.Email,
                    Phone: "NA",
                    Meal: "0",
                    Seat: "0",
                    FreqFlyerNo: {
                        Airline: ""
                    },
                    Passport: "NA",
                    Nationality: "NA",
                    InfAsso: "ADT" + (key + 1)
                }
                $scope.fareMatchRQ.PaxDetail.Adult.push(obj);

                if (key == 0) {
                    $scope.fareMatchRQ.ClientDetail = {
                        ClientId: "ADT1",
                        Title: $scope.GetSpouse(item.Gender),
                        FirstName: item.FirstName,
                        LastName: item.LastName,
                        Age: "",
                        DOB: item.DOB.dd + "-" + item.DOB.month + "-" + item.DOB.yyyy,
                        Gender: item.Gender,
                        Email: $scope.BillingContactDetail.Email,
                        Mobile: "",
                        Phone: $scope.BillingContactDetail.PhoneNumber,
                        Meal: "",
                        Seat: "",
                        Passport: "",
                        Nationality: ""
                    };
                }
            });
            angular.forEach($scope.TravlerDetail.Child, function (item, key) {
                var obj = {
                    LocalId: "CHD" + (key + 1),
                    Type: "CHD",
                    Title: "Master",
                    FirstName: item.FirstName,
                    LastName: $filter('NoSpace')(item.LastName + " " + item.MiddleName),
                    Age: "",
                    DOB: item.DOB.dd + "-" + item.DOB.month + "-" + item.DOB.yyyy,
                    Gender: item.Gender,
                    Email: "NA",
                    Phone: "NA",
                    Meal: "0",
                    Seat: "0",
                    FreqFlyerNo: {
                        Airline: ""
                    },
                    Passport: "NA",
                    Nationality: "NA",
                    InfAsso: "CHD" + (key + 1)
                }
                $scope.fareMatchRQ.PaxDetail.Child.push(obj);
            });
            angular.forEach($scope.TravlerDetail.Infant, function (item, key) {
                var obj = {
                    LocalId: "INF" + (key + 1),
                    Type: "INF",
                    Title: "Master",
                    FirstName: item.FirstName,
                    LastName: $filter('NoSpace')(item.LastName + " " + item.MiddleName),
                    Age: "",
                    DOB: item.DOB.dd + "-" + item.DOB.month + "-" + item.DOB.yyyy,
                    Gender: item.Gender,
                    Email: "NA",
                    Phone: "NA",
                    Meal: "0",
                    Seat: "0",
                    FreqFlyerNo: {
                        Airline: ""
                    },
                    Passport: "NA",
                    Nationality: "NA",
                    InfAsso: "INF" + (key + 1)
                }
                $scope.fareMatchRQ.PaxDetail.Infant.push(obj);
            });

            var insurancePurchaseRQ = {
                "travelers": {
                    "Traveler": [

                    ]
                },
                "travelType": 0,
                "ToDigitRasidanceState": "CA",
                "payment": {
                    "TotalPremiumAmount": $scope.insuranceDetail.TotalInsurance,
                    "CreditCardDetails": {
                        "CreditCard": {
                            "Amount": $scope.fareMatchRQ.FlightDetail.Flight.TotalPrice,
                            "CreditHolderName": $scope.CardDetail.CarHolderName,
                            "Number": $scope.CardDetail.CardNumber,
                            "ExpiryMonth": $scope.CardDetail.ExpiryMonth,
                            "ExpiryYear": $scope.CardDetail.ExpiryYear,
                            "CreditCardType": $scope.CardDetail.PaymentMethod
                        }
                    }
                },
                "agency": {
                    "ARC": "333249",
                    "Email": "hgupta@provokeaero.com"
                },
                "PlanId": "117705"
            };
            angular.forEach($scope.TravlerDetail.Adult, function (item, key) {
                var obj = {
                    TravelerName: {
                        First: item.FirstName,
                        Middle: item.MiddleName,
                        Last: item.LastName,

                    },
                    TripCost: $scope.fareMatchRQ.FlightDetail.Flight.Adult.AdtBFare[0],
                    BirthDate: `${item.DOB.dd}/${item.DOB.month}/${item.DOB.yyyy}`,
                    Address: {
                        Country: $scope.BillingContactDetail.Country,
                        State: $scope.BillingContactDetail.State,
                        City: $scope.BillingContactDetail.City,
                        Street: $scope.BillingContactDetail.Address1,
                        Zip: $scope.BillingContactDetail.Zip,
                    },
                    Email: $scope.BillingContactDetail.Email
                };
                insurancePurchaseRQ.travelers.Traveler.push(obj);
            });
            angular.forEach($scope.TravlerDetail.Child, function (item, key) {
                var obj = {
                    TravelerName: {
                        First: item.FirstName,
                        Middle: item.MiddleName,
                        Last: item.LastName,

                    },
                    TripCost: $scope.fareMatchRQ.FlightDetail.Flight.Child.ChdBFare,
                    BirthDate: `${item.DOB.dd}/${item.DOB.month}/${item.DOB.yyyy}`,
                    Address: {
                        Country: $scope.BillingContactDetail.Country,
                        State: $scope.BillingContactDetail.State,
                        City: $scope.BillingContactDetail.City,
                        Street: $scope.BillingContactDetail.Address1,
                        Zip: $scope.BillingContactDetail.Zip,
                    },
                    Email: $scope.BillingContactDetail.Email
                };
                insurancePurchaseRQ.travelers.Traveler.push(obj);
            });
            angular.forEach($scope.TravlerDetail.Infant, function (item, key) {
                var obj = {
                    TravelerName: {
                        First: item.FirstName,
                        Middle: item.MiddleName,
                        Last: item.LastName,

                    },
                    TripCost: $scope.fareMatchRQ.FlightDetail.Flight.Infant.InfBFare,
                    BirthDate: `${item.DOB.dd}/${item.DOB.month}/${item.DOB.yyyy}`,
                    Address: {
                        Country: $scope.BillingContactDetail.Country,
                        State: $scope.BillingContactDetail.State,
                        City: $scope.BillingContactDetail.City,
                        Street: $scope.BillingContactDetail.Address1,
                        Zip: $scope.BillingContactDetail.Zip,
                    },
                    Email: $scope.BillingContactDetail.Email
                };
                insurancePurchaseRQ.travelers.Traveler.push(obj);
            });
            console.log($scope.fareMatchRQ);
            var BillingInfo = {
                FareMatchRQ: $scope.fareMatchRQ,
                BillingContactDetail: $scope.BillingContactDetail,
                CardDetail: $scope.CardDetail,
                Skey: $scope.RQcriteria.Skey,
                //TODO: add insurance
                //  InsurancePurchaseRQ: 
            };

            if ($scope.insuranceDetail.InsSelected == 'YES') {
                BillingInfo.InsurancePurchaseRQ = insurancePurchaseRQ;
            }

            var req = {
                method: 'POST',
                url: 'https://apineo.provokeaero.com/SaberDirect/BookFlight',
                headers: {
                    contentType: 'application/json'
                },
                data: BillingInfo
            }
            $http(req).then(function (response) {
                console.log(response.data);
                $scope.progressbar.complete();
                $scope.goToConfirmation(response.data);
            },
                function (reason) {
                    $scope.error = reason.data;
                    $scope.progressbar.complete();
                    console.log(reason.data);
                    $log.info(reason);
                });
        }
    };


    $scope.GetSpouse = function (Gender) {
        if (Gender == "M")
            return "Mr.";
        else
            return "Mrs.";
    }
});

app.controller('ConfirmationController', function ($scope, $http, $window, $stateParams, $location, $filter, ngProgressFactory) {

    $scope.To12HourTime = function (n) {
        var hours = Number(n.match(/^(\d+)/)[1]);
        var minutes = Number(n.match(/:(\d+)/)[1]);
        var AMPM = "";
        if (hours < 12) {
            AMPM = "AM"
        };
        if (hours == 12) {
            AMPM = "PM"
        }
        if (hours > 12) {
            AMPM = "PM"
            hours = hours - 12;
        }
        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        if (hours < 10) sHours = "0" + sHours;
        if (minutes < 10) sMinutes = "0" + sMinutes;
        return (sHours + ":" + sMinutes + " " + AMPM);
    };

    $scope.Bkey = null;
    $scope.fareMatchRQ = {
    };
    $scope.Flight = {};
    $scope.PaxDetail = {};

    $scope.loadData = function () {
        if ($location.search()['Bkey'] != undefined) 
            $scope.Bkey = $location.search()['Bkey'];
        

        var loadRequest = {
            method: 'POST',
            url: 'https://apineo.provokeaero.com/SaberDirect/GetSelectedBookingRS?Bkey=' + $scope.Bkey,
            headers: {
                contentType: 'application/json'
            },
            data: $scope.Bkey
        }

        $http(loadRequest).then(function (response) {
            if (response.data == null) {
                $scope.progressbar.complete();
                alert('No record found');
            }
            $scope.fareMatchRQ = response.data;
            console.log($scope.fareMatchRQ);
            $scope.Flight = $scope.fareMatchRQ.FlightDetail.Flight;
            $scope.PaxDetail = $scope.fareMatchRQ.PaxDetail;
            $scope.progressbar.complete();
        },
            function (reason) {
                $scope.progressbar.complete();
                $scope.error = reason.data;

                $log.info(reason);
            });
    };
});

app.filter('ItineraryFilter', ['$filter', function ($filter) {
    return function (item, condition) {

        var departuresectors = $filter('IsReturn')(item.Sectors.Sector, 'false');

        var SelectedDepartingFrom = condition.SelectedDepartingFrom;
        if (SelectedDepartingFrom != undefined && SelectedDepartingFrom.length > 0) {
            var index = SelectedDepartingFrom.map(function (deaprtures) {
                return deaprtures.AirpCode;
            }).indexOf(departuresectors[0].Departure.AirpCode);
            if (index == -1)
                return false;
        }

        var SelectedArrivingAt = condition.SelectedArrivingAt;
        if (SelectedArrivingAt != undefined && SelectedArrivingAt.length > 0) {
            var index = SelectedArrivingAt.map(function (Arrivals) {
                return Arrivals.AirpCode;
            }).indexOf(departuresectors[departuresectors.length - 1].Arrival.AirpCode);
            if (index == -1)
                return false;
        }

        var SelectedConnectingIn = condition.SelectedConnectingIn;
        if (SelectedConnectingIn != undefined && SelectedConnectingIn.length > 0) {

            var connectionReq = SelectedConnectingIn.map(function (connectiongs) {
                return connectiongs.AirpCode;
            });

            var connectionExist = item.Sectors.Sector.map(function (sec) {
                return sec.Arrival.AirpCode;
            });

            var common = $.grep(connectionReq, function (element) {
                return $.inArray(element, connectionExist) !== -1;
            });
            if (common.length == 0)
                return false;
        }

        var SelectedSpecificAirlines = condition.SelectedSpecificAirlines;
        if (SelectedSpecificAirlines != undefined && SelectedSpecificAirlines.length > 0) {
            var index = SelectedSpecificAirlines.map(function (Airlines) {
                return Airlines.Airline;
            }).indexOf(departuresectors[0].AirV);
            if (index == -1)
                return false;
        }

        if (condition.SetectedCriteria.SelectedUniqueRef != undefined || condition.SetectedCriteria.SelectedUniqueRef != "") {
            if (item.UniqueRef.indexOf(condition.SetectedCriteria.SelectedUniqueRef) == -1)
                return false;
        }
        if ((parseFloat(item.Adult.AdtBFare[0]) + parseFloat(item.Adult.AdTax[0])) < condition.priceSlider.min || (parseFloat(item.Adult.AdtBFare[0]) + parseFloat(item.Adult.AdTax[0])) > condition.priceSlider.max)
            return false;
        if (condition.Stops.Nonstop == true || condition.Stops.Onestop == true || condition.Stops.Twostop == true) {
            var arrivalsectors = $filter('IsReturn')(item.Sectors.Sector, 'true');

            if (departuresectors.length == 1 && arrivalsectors.length == 1 && condition.Stops.Nonstop == false) {
                return false;
            }
            else if ((departuresectors.length == 2 || arrivalsectors.length == 2) && item.Sectors.Sector.length <= 4 && condition.Stops.Onestop == false) {
                return false;
            }
            else if ((departuresectors.length > 2 || arrivalsectors.length > 2) && condition.Stops.Twostop == false) {
                return false;
            }
        }
        if (condition.OutboundDepartureTimeZone[0].SelectedTimeZone == true && (parseInt(item.Sectors.Sector[0].Departure.Time.split(':')[0]) < 5 || parseInt(item.Sectors.Sector[0].Departure.Time.split(':')[0]) > 12)) {
            return false;
        }
        if (condition.OutboundDepartureTimeZone[1].SelectedTimeZone == true && (parseInt(item.Sectors.Sector[0].Departure.Time.split(':')[0]) < 12 || parseInt(item.Sectors.Sector[0].Departure.Time.split(':')[0]) > 18)) {
            return false;
        }
        if (condition.OutboundDepartureTimeZone[2].SelectedTimeZone == true && (parseInt(item.Sectors.Sector[0].Departure.Time.split(':')[0]) < 18 || parseInt(item.Sectors.Sector[0].Departure.Time.split(':')[0]) > 24)) {
            return false;
        }

        return true;
    };
}]);

app.filter('IsReturn', function () {
    return function (inputs, ReturnType) {
        var filtered = [];
        angular.forEach(inputs, function (item) {
            if (item.IsReturn == ReturnType) {
                filtered.push(item);
            }
        });
        return filtered;
    }
});

app.filter('IsSelected', function () {
    return function (inputs, ReturnType) {
        var filtered = [];
        angular.forEach(inputs, function (item) {
            if (item.Isselected == ReturnType || item.IsSelected == ReturnType) {
                filtered.push(item);
            }
        });
        return filtered;
    }
});

app.filter('FilterSpecificFlight', function () {

    return function (items, condition) {
        var filtered = [];

        if (condition === undefined || condition === '') {
            return items;
        }

        return filtered;
    };

});

app.filter('FilterReturnType', function () {

    return function (items, condition) {
        var filtered = [];

        if (condition === undefined || condition === '') {
            return items;
        }

        angular.forEach(items, function (item) {
            if (item.IsReturn == condition.IsReturn) {
                filtered.push(item);
            }
        });

        return filtered;
    };

});

app.filter('myfilter', function () {
    return function (items, condition) {
        var filtered = [];

        if (condition === undefined || condition === '') {
            return items;
        }

        angular.forEach(items, function (item) {
            if (item.TotalPrice >= condition.min && item.TotalPrice <= condition.max) {
                filtered.push(item);
            }
        });

        return filtered;
    };
});

app.filter("getDiff", function () {
    return function (FDetail) {

        var elapsedTimeSplit = FDetail.ElapsedTime.split(":").map(Number);
        //var milisecondsDiff = elapsedTimeSplit[0]*1000*60*60+elapsedTimeSplit[1]*1000*60;
        /* var startDate = new Date(FDetail.Departure.Date.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3") + ' ' + FDetail.Departure.Time);
        var endDate = new Date(FDetail.Arrival.Date.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3") + ' ' + FDetail.Arrival.Time);
        var milisecondsDiff = endDate - startDate; */

        // var calulatedTime = Math.floor(milisecondsDiff / (1000 * 60 * 60)).toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ":" + (Math.floor(milisecondsDiff / (1000 * 60)) % 60).toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ":" + (Math.floor(milisecondsDiff / 1000) % 60).toLocaleString(undefined, { minimumIntegerDigits: 2 });

        // var splitinFormatedTime = calulatedTime.split(':');

        return FDetail.CabinClass.Des + ' ' + elapsedTimeSplit[0] + 'h' + ' ' + elapsedTimeSplit[1] + 'm';

    }
});

app.filter("flightTime", ['$filter', function ($filter) {
    return function (flight, type) {
        if (flight != undefined && flight.Sectors != undefined && flight.Sectors.Sector.length > 0) {
            var milisecondsDiff = 0;
            var Sector = $filter('IsReturn')(flight.Sectors.Sector, type);
            angular.forEach(Sector, function (obj) {
                /* var startDate = new Date(obj.Departure.Date.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3") + ' ' + obj.Departure.Time);
                var endDate = new Date(obj.Arrival.Date.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3") + ' ' + obj.Arrival.Time);
                
                 */

                var elapsedTimeSplit = obj.ElapsedTime.split(":").map(Number);
                var miliseconds = elapsedTimeSplit[0] * 1000 * 60 * 60 + elapsedTimeSplit[1] * 1000 * 60;
                milisecondsDiff = milisecondsDiff + miliseconds;
            });

            var calulatedTime = Math.floor(milisecondsDiff / (1000 * 60 * 60)).toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ":" + (Math.floor(milisecondsDiff / (1000 * 60)) % 60).toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ":" + (Math.floor(milisecondsDiff / 1000) % 60).toLocaleString(undefined, { minimumIntegerDigits: 2 });

            var splitinFormatedTime = calulatedTime.split(':');

            return 'Flight: ' + ' ' + splitinFormatedTime[0] + 'h' + ' ' + splitinFormatedTime[1] + 'm';
        }
        return null;

    }
}]);

app.filter("layoverTime", ['$filter', function ($filter) {
    return function (flight, type, Ind) {
        if (flight != undefined && flight.Sectors != undefined && flight.Sectors.Sector.length > 0) {
            var milisecondsDiff = 0;
            var Sectors = $filter('IsReturn')(flight.Sectors.Sector, type);
            var Sector = Sectors[Ind];
            if (Sectors.length <= Ind + 1) {
                return null;
            }
            else {
                var NextSector = Sectors[Ind + 1];
                var startDate = new Date(Sector.Arrival.Date.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3") + ' ' + Sector.Arrival.Time);
                var endDate = new Date(NextSector.Departure.Date.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3") + ' ' + NextSector.Departure.Time);
                var miliseconds = endDate - startDate;
                milisecondsDiff = milisecondsDiff + miliseconds;
                var calulatedTime = Math.floor(milisecondsDiff / (1000 * 60 * 60)).toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ":" + (Math.floor(milisecondsDiff / (1000 * 60)) % 60).toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ":" + (Math.floor(milisecondsDiff / 1000) % 60).toLocaleString(undefined, { minimumIntegerDigits: 2 });
                var splitinFormatedTime = calulatedTime.split(':');
                if (parseFloat(splitinFormatedTime[0]) > 3)
                    return ' Layover: ' + ' ' + splitinFormatedTime[0] + 'h' + ' ' + splitinFormatedTime[1] + 'm (Long connection)';
                else
                    return ' Layover: ' + ' ' + splitinFormatedTime[0] + 'h' + ' ' + splitinFormatedTime[1] + 'm';
            }
        }
        return null;

    }
}]);

app.filter("totalTripDuration", ['$filter', function ($filter) {
    return function (flight, type) {
        if (flight != undefined && flight.Sectors != undefined && flight.Sectors.Sector.length > 0) {
            var milisecondsDiff = 0;
            var Sectors = $filter('IsReturn')(flight.Sectors.Sector, type);
            angular.forEach(Sectors, function (obj, key) {
                /* var startDate = new Date(obj.Departure.Date.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3") + ' ' + obj.Departure.Time);
                var endDate = new Date(obj.Arrival.Date.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3") + ' ' + obj.Arrival.Time);
                var Elapsedmiliseconds = endDate - startDate;
                milisecondsDiff = milisecondsDiff + Elapsedmiliseconds;

                if (Sectors.length > key + 1) {
                    var NextSector = Sectors[key + 1];
                    var startDate1 = new Date(obj.Arrival.Date.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3") + ' ' + obj.Arrival.Time);
                    var endDate1 = new Date(NextSector.Departure.Date.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3") + ' ' + NextSector.Departure.Time);
                    var miliseconds = endDate1 - startDate1;
                    milisecondsDiff = milisecondsDiff + miliseconds;
                } */
                if (key + 1 == Sectors.length) {
                    var actualTimeSplit = obj.ActualTime.split(":").map(Number);
                    milisecondsDiff = actualTimeSplit[0] * 1000 * 60 * 60 + actualTimeSplit[1] * 1000 * 60;
                }
            });

            var calulatedTime = Math.floor(milisecondsDiff / (1000 * 60 * 60)).toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ":" + (Math.floor(milisecondsDiff / (1000 * 60)) % 60).toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ":" + (Math.floor(milisecondsDiff / 1000) % 60).toLocaleString(undefined, { minimumIntegerDigits: 2 });

            var splitinFormatedTime = calulatedTime.split(':');

            return splitinFormatedTime[0] + 'h' + ' ' + splitinFormatedTime[1] + 'm';
        }
        return null;

    }
}]);

app.filter('NoSpace', function () {
    return function (value) {
        return (!value) ? '' : value.replace(/ /g, '');
    };
});

app.filter('MatrixCurrency', ['$filter', function ($filter) {
    return function (item, currencyType) {
        if (item == "" || item == null || Object.keys(item).length === 0) {
            return "_";
        }
        else {
            var result = $filter('currency')(item, currencyType, 2);
            return result;
        }
    };
}]);

app.directive('datepicker', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                element.datepicker({
                    dateFormat: 'M-dd-yy',
                    mindate: new Date(),
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
        }
    }
});

app.filter('ClassType', function () {
    return function (inputs) {
        if (inputs == "Y")
            return "Economy";
        else if (inputs == "S")
            return "Premium Economy";
        else if (inputs == "C")
            return "Business Class Flights";
        else if (inputs == "F")
            return "First Class";
        else
            return "";
    }
});