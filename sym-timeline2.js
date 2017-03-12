(function (CS) {
	'use strict';
	
	function symbolVis() { }
	CS.deriveVisualizationFromBase(symbolVis)		
			
	var webIdTableDowntimeState = 'B0MGq5q1ZJTUCzOf0WUayM_wUvrm2xi2R0aDUHkWRDpvVAV0VSVVBJMjAxMlxDT1ZFU1RST1xUQUJMRVNbRE9XTlRJTUVTVEFURV0';
	var webIdTableDowntimeCause1 = 'B0MGq5q1ZJTUCzOf0WUayM_wDKYgogivMEy19zXMawdPnQV0VSVVBJMjAxMlxDT1ZFU1RST1xUQUJMRVNbRE9XTlRJTUVDQVVTRTFd';
	var webIdTableDowntimeCause2 = 'B0MGq5q1ZJTUCzOf0WUayM_wj1gtRzLQMkiJVomdGNC5KAV0VSVVBJMjAxMlxDT1ZFU1RST1xUQUJMRVNbRE9XTlRJTUVDQVVTRTJd';
			
	var currentLevel = 1;
			
    var definition = {		
        typeName: 'timeline2', 
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
		iconUrl: 'Images/sym-timeline.svg',
		getDefaultConfig: function () {
            return {
                DataShape: 'Table',
                Height: 200,
                Width: 800,
                ElementsList: {}
            };
        },
        configOptions: function () {
            return [{
                title: 'Format Symbol',
                mode: 'format'
            }];
        },
        //init: init
		visObjectType: symbolVis
    };

	
	 window.timelineCallback = function () {

        $(window).trigger('timelineLoaded');
    }
	
	function loadTimeline(scope) {
				
        if (scope.timeline == undefined) {
            if (window.timelineRequested) {
                
				setTimeout(function () {
                    window.timelineCallback();
                }, 3000);
												
            }
            else {
				
				var script_tag = document.createElement('script');
                script_tag.setAttribute("type", "text/javascript");
                script_tag.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/vis/4.16.1/vis.min.js?callback=timelineCallback");
                (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);

				var script_tag2 = document.createElement('script');
                script_tag2.setAttribute("type", "text/javascript");
				script_tag2.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/async/2.1.5/async.js?callback=timelineCallback");
                (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag2);				
				
				window.timelineRequested = true;
				
				setTimeout(function () {
                    window.timelineCallback();
                }, 500);
            }
        }
        else {
            window.timelineCallback
        }
    }
	
	
	
	 function GetEvents(start, end, scope) {
	 
		var timeSpanInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

		piwebapi.GetAfTree(function (data) {

			var databaseLink = data["Items"][0].Links["Databases"];

			var dataPromise = piwebapi.GetJsonData(databaseLink);

			dataPromise.done(function (data) {

				var playlistScanner = $.grep(data.Items, function (e) { return e.Name == "XXX"; });
				
				var startParam = start.getFullYear() + "-" + (start.getMonth() + 1) + "-" + start.getDate() + " " + start.getHours() + ":" + start.getMinutes()
				var endParam = end.getFullYear() + "-" + (end.getMonth() + 1) + "-" + end.getDate() + " " + end.getHours() + ":" + end.getMinutes()

				startParam = start.toJSON();
				endParam = end.toJSON();
				
				var eventFramesLink = playlistScanner[0].Links["EventFrames"] + "?startTime=" + startParam + "&endTime=" + endParam + "&sortField=StartTime&searchMode=Overlapped";

				var dataPromise = piwebapi.GetJsonData(eventFramesLink);

				dataPromise.done(function (data) {

					updateGrid(data.Items, start, timeSpanInHours, scope);
				});

			});
		});
	}
	
	
	function updateGrid(eventFrames, startTime, timeSpanInHours, scope) {
		  
		var stations = calcData(eventFrames, startTime, timeSpanInHours);
	 
		var timelinedata = [];
		var id = 0;
		var groupId = 0;

		var groups = [];
		
						
		async.forEach(stations,
			function (station) {

				groups.push({ id: groupId++, content: station.StationName });

				station.Items.forEach(function (item) {

					timelinedata.push({
						id: id++,
						group: $.grep(groups, function (e) { return e.content == station.StationName; })[0].id,
						content: item.InnerText,
						start: item.StartTime,
						end: item.EndTime,

						tooltip: item.InnerText,
						title: item.InnerText,
						className: item.className,
						
					});					
				});
			},
			function (err) {
				// if any of the file processing produced an error, err would equal that error
				if (err) {
					// One of the iterations produced an error.
					// All processing will now stop.
					console.log('A station failed to process');
				} else {
					console.log('All stations have been processed successfully');
				}
			});               
		
		var options = {
			stack: false,
			groupOrder: 'content'  // groupOrder can be a property name or a sorting function
		};
				
		scope.timeline.setOptions(options);
		scope.timeline.setGroups(groups);
		scope.timeline.setItems(timelinedata);                
	}

	 function calcData(eventFrames, start, timeSpanInHours) {
		var data = [];

					
		data.push({ StationName: 'V401', Items: [], });
		data.push({ StationName: 'V405', Items: [], });
		data.push({ StationName: 'V406', Items: [], });
		data.push({ StationName: 'V407', Items: [], });

		async.forEach(eventFrames, function (eventFrame) {
				eventFrame.Station = getElementData(eventFrame.Links["PrimaryReferencedElement"], "Name");
				
				eventFrame.DowntimeCause2Id = getFrameData(eventFrame.Links["Value"], "DowntimeCause2Id");
			},
			function (err) {
				// if any of the file processing produced an error, err would equal that error
				if (err) {
					// One of the iterations produced an error.
					// All processing will now stop.
					console.log('A file failed to process');
				} else {
					console.log('All files have been processed successfully');
				}
			});
	
			eventFrames.forEach(function (eventFrame) {
				
				var stationItem = $.grep(data, function (e) { return e.StationName == eventFrame.Station; });

				if ((stationItem == undefined) || (stationItem.length == 0))
				{
					stationItem = {
						StationName: eventFrame.Station,
						Items: [],
					};

					data.push(stationItem);
				}
				else
				{
					stationItem = stationItem[0];
				}

				var startMin = new Date(eventFrame.StartTime);
				var endMin = new Date(eventFrame.EndTime);
				
				//endMin = endMin.addMinutes(-1);

				if (startMin < start)
					startMin = start;

				if (endMin > Date.now())
					endMin = new Date();

				if ((Math.abs(endMin.getTime() - startMin.getTime()) / 1000)	> 60) {

					endMin = endMin.addMinutes(-0.5);
					
					var item = {
						Id: eventFrame.Id,
						StartTime: startMin,
						EndTime: endMin,
						DurationInSeconds: (Math.abs(endMin.getTime() - startMin.getTime()) / 1000),
						Key: eventFrame.Name,
						//InnerText: decodeHtml(getFrameData(eventFrame.Links["Value"])),                            
						InnerText: decodeHtml(eventFrame.Name),                            
					};
					
					item.className = 'lime';
									
					switch(eventFrame.DowntimeCause2Id) {
					case 1:
						item.className = 'cyan';
						break;
					case 2:
						item.className = 'darkorange';
						break;
					case 3:
						item.className = 'plum';
						break;
					} 
				
																			
					stationItem.Items.push(item);							
				}
			});

		//data.push(dataItem);

		return data;
	}
			
	function decodeHtml(input) {

	/*
		var elem = document.createElement('textarea');
		elem.innerHTML = input;
		var decoded = elem.value;

		return decoded;
		*/
		
		//return '<div style="text-overflow: hidden;">' + input + '</div>';
		return input;
	}
				
	function getFrameData(url, key) {

		var ret = '';
		
		$.ajax({
			type: 'GET',
			url: url,
			cache: true,

			crossDomain: true,
			xhrFields: {
				withCredentials: true
			},

			async: false, 
			success: function (value) {                            

				var data = $.grep(value.Items, function (e) { return e.Name == key; });
								
				ret = data[0].Value.Value;		
			},
			error: function (err) {

				alert(err);
			}

			});
	  
		return ret;
	}
				
	function getElementData(url, field) {

		var ret = '';

		$.ajax({
			type: 'GET',
			url: url,
			cache: true,

			crossDomain: true,
			xhrFields: {
				withCredentials: true
			},

			async: false,
			success: function (value) {

				ret = value[field]
			},
			error: function (err) {

				alert(err);
			}

		});

		return ret;
	}
				
	function getElementDatas(url, field) {

		var ret = [];

		$.ajax({
			type: 'GET',
			url: url,
			cache: true,

			crossDomain: true,
			xhrFields: {
				withCredentials: true
			},

			//headers: {
			//    'Cache-Control': 'max-age=120'
			//},
			async: false,
			success: function (value) {

				value.Items.forEach(function (item) {
					ret.push(item[field]);
				});
				
			},
			error: function (err) {

				alert(err);
			}

		});

		return ret;
	}
				
	
	function SaveTumCause(evt, scope, container){
		
		var val = {
					  "Timestamp": selectedStartTime,
					  "Good": true,
					  "Value": $('#tumcause').val()
				}
	
		$.ajax({
			type: "POST",
			url: "https://werupi2012/piwebapi/streams/" + selectedAttributeWebId + "/value",        
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			data: JSON.stringify(val),
			async: false,
			success: function(data)
					{	
					},
			failure: function (status) {
			},
			error: function (status) {				
				if (status.status == 202){
					//accepted -> alles OK
				}
			}
		});
		
		var start = scope.timeline.getItemRange().min;
		var end = scope.timeline.getItemRange().max;
		
		GetEvents(start, end, scope);
	}
	
	var downtimeStates = [];
	
	function LoadTumCauses(){
		
		downtimeStates = [];
		
		currentLevel = 1;
		
		$.ajax({
			type: "GET",
			url: "https://werupi2012/piwebapi/tables/" + webIdTableDowntimeState + "/data",        
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
				
			cache: false,
			crossDomain: true,
            xhrFields: {
                withCredentials: true
            },

			success: function(data)
					{	
						$.each(data.Rows, function (){							
							downtimeStates.push(this);
						});
					},
			failure: function (status) {				
				alert("Failed!");
			},
			error: function (status) {				
				alert("Failed!");
			}
		});	
		
		FillDropDown();
	}
	
	function FillDropDown(){
		var webId;
		
		$(".tumcause").empty();
		
		switch(currentLevel){
			case 1:
				webId = webIdTableDowntimeCause1;
				$(".tumcause").change(function(){
					currentLevel = 2;
					FillDropDown();
				});
			break;
			case 2:
				webId = webIdTableDowntimeCause2;
				$('.tumcause').off('change');
			break;
		}
		
		$.ajax({
			type: "GET",
			url: "https://werupi2012/piwebapi/tables/" + webId + "/data",        
			contentType: "application/json; charset=utf-8",
			dataType: "json",	

			cache: false,
			crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
			
			success: function(data)	{	
						$.each(data.Rows, function (){							
							var downtimeStateId = this.DowntimeStateId;
							var tumStateNames = $.grep( downtimeStates, function( n, i ) {return n.Id == downtimeStateId;})
									
							$(".tumcause").append($("<option />").val(this.Id).text(tumStateNames[0].Name));
						});
					},
			failure: function (status) {				
				alert("Failed!");
			},
			error: function (status) {				
				alert("Failed!");
			}
		});
	}
		
	
	var selectedStartTime;
	var selectedAttributeWebId;
	
	function OnSelect(properties, scope, container){
		
			if (properties.items.length > 0){
			
			var lookup = {};
			var array = scope.timeline.itemsData._data;
			for (var i = 0, len = scope.timeline.itemsData.length; i < len; i++) {
				lookup[array[i].id] = array[i];
			}
			
			if (!lookup[properties.items[0]].content.match("^Uptime")){
			
				selectedStartTime = lookup[properties.items[0]].start;
				selectedAttributeWebId = lookup[properties.items[0]].webId;
					
				$("#EnSureModal").modal();	
			}
		}
	}
		
	
	function compareGroup(a, b)
	{
	  if (a.group < b.group) return 1;
	  if (a.group > b.group) return -1;
	  return 0;
	}
	
	function unique(array){
		return $.grep(array,function(el,index){
			return index == $.inArray(el,array);
    });
}
	
	function AjaxError(status){
		
		try {

            console.log(status);

        } catch (e) {

        }
		
	}


    symbolVis.prototype.init = function init(scope, elem) {
						
        var container = elem.find('#container')[0];
		
        var id = "timeline_" + Math.random().toString(36).substr(2, 16);
        container.id = id;
        scope.id = id;
			
		scope.startTimeline = function () {
            								
			if (scope.timeline == undefined) {
			
				scope.timeline = new vis.Timeline(container);

                scope.timeline.on('rangechanged', function (properties) {

                    GetEvents(properties.start, properties.end, scope);                   
                });				

				scope.timeline.on('select', function(properties){
					OnSelect(properties, scope, container);
				});	
				
		
				var now = new Date();
				var start = new Date();
				
				start = start.addHours(-120);
				
				GetEvents(start, now, scope);						
			}
        };
		
        scope.updateConfig = function (config) {
           
        };

        scope.resizeWindow = function (width, height) {
           
        }

        scope.dataUpdate = function (data) {            
		
        }
				
		$(window).bind('timelineLoaded', scope.startTimeline);
		
		loadTimeline(scope);
		
		
		$('#dispNameContainer').css('zIndex', 0);		
		
		
		this.onDataUpdate = scope.dataUpdate;
		this.onConfigChange = scope.updateConfig;
		this.onResize = scope.resizeWindow;
		
		LoadTumCauses();
				
		$('#save').on(
			'click',
			function(evt){SaveTumCause(evt, scope, container);}
			);		
    }

    CS.symbolCatalog.register(definition);
})(window.Coresight);


 Date.prototype.addHours = function (h) {
		this.setTime(this.getTime() + (h * 60 * 60 * 1000));
		return this;
	}

Date.prototype.addMinutes = function (h) {
		this.setTime(this.getTime() + (h * 60 * 1000));
		return this;
	}
		

var piwebapi = (function () {
    //var base_service_url = "NotDefined";
    var base_service_url = "https://werupi2012/piwebapi";

    function GetJsonContent(url, SuccessCallBack, ErrorCallBack) {
        $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            async: true,

            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },

            success: SuccessCallBack,
            error: ErrorCallBack

        });
    }

    function CheckPIServerName(piServerName, UpdateDOM) {
        BaseUrlCheck();
        var url = base_service_url + "dataservers?name=" + piServerName;
        GetJsonContent(url, (function (piServerJsonData) {
            UpdateDOM(true);
        }), (function () {
            UpdateDOM(false);
        }));
    }


    function CheckPIPointName(piServerName, piPointName, UpdateDOM) {

        BaseUrlCheck();
        url = base_service_url + "points?path=\\\\" + piServerName + "\\" + piPointName;
        GetJsonContent(url, (function (piPointJsonData) {
            piPointLinksJsonData = piPointJsonData;
            UpdateDOM(true);
        }), (function () {
            UpdateDOM(false)
        }));
    }


    function GetAfTree(UpdateDOM) {

        var dataAssetPromise = GetAssetServer(base_service_url);

        dataAssetPromise.done(function (assetServers) {
          
            UpdateDOM(assetServers);
        });

    }

    function GetAfTreeData(url, UpdateDOM) {

        var dataPromise = GetPiWebApiData(url);

        dataPromise.done(function (data) {           

            UpdateDOM(data);
        });

    }

    function GetAssetServer(url) {

        var dfd = jQuery.Deferred();

        GetJsonContent(url + '/assetservers',
            function (collection) {
                dfd.resolve(collection);
            },
            function (err) {
                dfd.fail(err);
            });

        return dfd.promise();
    }

    function GetPiWebApiData(url) {

        var dfd = jQuery.Deferred();

        GetJsonContent(url,
            function (collection) {
                dfd.resolve(collection);
            },
            function (err) {
                dfd.fail(err);
            });

        return dfd.promise();
    }

    function GetData(piServerName, piPointName, ServiceUrl, QueryString, UpdateDOM) {
        BaseUrlCheck();
        url = base_service_url + "points?path=\\\\" + piServerName + "\\" + piPointName;
        GetJsonContent(url, (function (piPointJsonData) {
            var url_data = piPointJsonData["Links"][ServiceUrl] + QueryString;
            GetJsonContent(url_data, (function (JsonData) {
                UpdateDOM(JsonData);
            }), (function () {
                UpdateDOM("Error: Parameters are incorrect.");
            }));
        }), (function () {
            UpdateDOM("Error: Could not find PI Point on the selected PI Data Archive.");
        }));
    }


    function GetJsonData(url) {

        var dfd = jQuery.Deferred();

        GetJsonContent(url,
            function (collection) {
                dfd.resolve(collection);
            },
            function (err) {
                dfd.fail(err);
            });

        return dfd.promise();
    }

    function BaseUrlCheck() {
        if (base_service_url == "NotDefined") {
            alert("Service base url was not defined");
        }
    }

    function WriteLog(text) {

        try {

            console.log(text);

        } catch (e) {

        }

    }

    return {
        ValidPIServerName: function (piServerName, UpdateDOM) {
            CheckPIServerName(piServerName, UpdateDOM)
        },

        ValidPIPointName: function (piServerName, piPointName, UpdateDOM) {
            CheckPIPointName(piServerName, piPointName, UpdateDOM);
        },

        GetSnapshotValue: function (piServerName, piPointName, UpdateDOM) {
            GetData(piServerName, piPointName, "Value", "", UpdateDOM);
        },
        GetRecordedValues: function (piServerName, piPointName, startTime, endTime, UpdateDOM) {
            GetData(piServerName, piPointName, "RecordedData", "?starttime=" + startTime + "&endtime=" + endTime, UpdateDOM);
        },
        GetInterpolatedValues: function (piServerName, piPointName, startTime, endTime, interval, UpdateDOM) {
            GetData(piServerName, piPointName, "InterpolatedData", "?starttime=" + startTime + "&endtime=" + endTime + "&interval=" + interval, UpdateDOM);
        },
        SetBaseServiceUrl: function (baseUrl) {
            base_service_url = baseUrl;
            if (base_service_url.slice(-1) != "/") {
                base_service_url = base_service_url + "/";
            }
        },
        
        GetAfTree: function (UpdateDOM) {
            GetAfTree(UpdateDOM);
        },

        GetAfTreeData: function (url, UpdateDOM) {
            GetAfTreeData(url, UpdateDOM);
        },

        GetJsonData: function (url) {
            return GetJsonData(url);
        },       

        WriteLog: function (text) {
            WriteLog(text);
        },
    }
}());
