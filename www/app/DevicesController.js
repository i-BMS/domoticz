define(['app'], function (app) {
	app.controller('DevicesController', [ '$scope', '$rootScope', '$location', '$http', '$interval', function($scope,$rootScope,$location,$http,$interval) {

		AddDevice = function(idx,itemname)
		{
			$.devIdx = idx;
			if (name!='Unknown') {
				$( "#dialog-adddevice #devicename" ).val(itemname);
			}
			$("#dialog-adddevice").i18n();
			$("#dialog-adddevice").dialog( "open" );
		}

		AddLightDeviceDev = function (idx, name)
		{
			$.devIdx = idx;
			
			$("#dialog-addlightdevicedev #combosubdevice").html("");
			
				$.each($.LightsAndSwitches, function(i,item){
					var option = $('<option />');
					option.attr('value', item.idx).text(item.name);
					$("#dialog-addlightdevicedev #combosubdevice").append(option);
				});
				$("#dialog-addlightdevicedev #combosubdevice").val(0);
			
			if (name!='Unknown') {
				$( "#dialog-addlightdevicedev #devicename" ).val(name);
			}
			$( "#dialog-addlightdevicedev" ).dialog( "open" );
		}

		RemoveDevice = function(idx)
		{
			bootbox.confirm($.i18n("Are you sure to remove this Device from your used devices?"), function(result) {
				if (result==true) {
					$.ajax({
					   url: "json.htm?type=setused&idx=" + idx + '&used=false',
					   async: false, 
					   dataType: 'json',
					   success: function(data) {
						  ShowDevices();
					   }
					});
				}
			});
		}

		InvertCheck = function()
		{
			$('#devices input:checkbox').each(function(){
				$(this).prop('checked', !$(this).is(":checked"));
			});
		}
		DeleteMultipleDevices = function()
		{
			var totalselected=$('#devices input:checkbox:checked').length;
			if (totalselected==0) {
				bootbox.alert($.i18n('No Devices selected to Delete!'));
				return;
			}
			bootbox.confirm($.i18n("Are you sure you want to delete the selected Devices?"), function(result) {
				if (result==true) {
					var delCount = 0;
						$('#devices input:checkbox:checked').each(function() {
							$.ajax({
								url: "json.htm?type=deletedevice&idx=" + $(this).val(),
								async: false, 
								dataType: 'json',
								success: function(data) {
									delCount++;
								}
						});
					});
					bootbox.alert(delCount+" " + $.i18n("Devices deleted."));
					ShowDevices();
				}
			});
		}

		RefreshLightSwitchesComboArray = function()
		{
			$.LightsAndSwitches = [];
		  $.ajax({
			 url: "json.htm?type=command&param=getlightswitches", 
			 async: false, 
			 dataType: 'json',
			 success: function(data) {
			  if (typeof data.result != 'undefined') {
				$.each(data.result, function(i,item){
							$.LightsAndSwitches.push({
									idx: item.idx,
									name: item.Name
								 }
							);
				});
			  }
			 }
		  });
		}

		ShowDevices = function(filter)
		{
			if (typeof filter != 'undefined') {
				$.DevicesFilter=filter;
			}
			else {
				if (typeof $.DevicesFilter != 'undefined') {
					filter=$.DevicesFilter;
				}
			}
		  $('#modal').show();
		  
		  RefreshLightSwitchesComboArray();
		  
		  $("#devicestable #mUsed").attr('class', 'btnstyle3');
		  $("#devicestable #mAll").attr('class', 'btnstyle3');
		  $("#devicestable #mUnknown").attr('class', 'btnstyle3');
		 
		  var ifilter="all";
		  if (typeof filter != 'undefined') {
			if (filter == "used") {
			  ifilter = "true";
					$("#devicestable #mUsed").attr('class', 'btnstyle3-sel');
			}
			else if (filter == "unknown") {
					$("#devicestable #mUnknown").attr('class', 'btnstyle3-sel');
			  ifilter = "false";
			}
			else if (filter == "all") {
					$("#devicestable #mAll").attr('class', 'btnstyle3-sel');
			  ifilter = "all";
			}
		  }
		  else {
			  ChangeClass("mAll","btnstyle3-sel");
		  }
		  
		  var htmlcontent = '';
		  htmlcontent+=$('#devicestable').html();
		  $('#devicescontent').html(htmlcontent);
		  $('#devicescontent').i18n();

			$('#devicescontent #devices').dataTable( {
				"sDom": '<"H"lfrC>t<"F"ip>',
				"oTableTools": {
					"sRowSelect": "single"
				},
				"aoColumnDefs": [
					{ "bSortable": false, "aTargets": [ 0,11 ] }
				],
				"aoColumns": [
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					{ "sType": "numeric-battery" },
					null,
					null
				],
				"aaSorting": [[ 12, "desc" ]],
				"bSortClasses": false,
				"bProcessing": true,
				"bStateSave": true,
				"bJQueryUI": true,
				"aLengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
				"iDisplayLength" : 25,
				"sPaginationType": "full_numbers",
				language: $.DataTableLanguage
			} );

			var mTable = $('#devicescontent #devices');
		  var oTable = mTable.dataTable();
		  oTable.fnClearTable();
		  
		  $.ajax({
			 url: "json.htm?type=devices&displayhidden=1&used=" + ifilter, 
			 async: false, 
			 dataType: 'json',
			 success: function(data) {
			  if (typeof data.result != 'undefined') {
				$.each(data.result, function(i,item){
				  var itemSubIcons="";
							var itemChecker = '<input type="checkbox" name="Check-' + item.ID + ' id="Check-' + item.ID + '" value="'+item.idx+'" />';
				  var TypeImg=item.TypeImg;
				  var itemImage='<img src="images/' + TypeImg + '.png">';
				  if ((TypeImg.indexOf("lightbulb")==0)||(TypeImg.indexOf("dimmer")==0)) {
									if (
											(item.Status == 'On')||
											(item.Status == 'Chime')||
											(item.Status == 'Group On')||
											(item.Status.indexOf('Set ') == 0)
										 ) {
													itemImage='<img src="images/lightbulb.png" title="Turn Off" onclick="SwitchLight(' + item.idx + ',\'Off\',ShowDevices);" class="lcursor">';
									}
									else {
													itemImage='<img src="images/lightbulboff.png" title="Turn On" onclick="SwitchLight(' + item.idx + ',\'On\',ShowDevices);" class="lcursor">';
									}
				  }
				  else if (TypeImg.indexOf("motion")==0) {
									if (
											(item.Status == 'On')||
											(item.Status == 'Chime')||
											(item.Status == 'Group On')||
											(item.Status.indexOf('Set ') == 0)
										 ) {
													itemImage='<img src="images/motion.png">';
									}
									else {
													itemImage='<img src="images/motionoff.png">';
									}
				  }
				  else if (TypeImg.indexOf("smoke")==0) {
									if (item.Status == 'Panic') {
											itemImage='<img src="images/smoke.png">';
									}
									else {
											itemImage='<img src="images/smokeoff.png">';
									}
				  }
				  if ((item.Used!=0)&&(item.Name.charAt(0)!="$")) {
					itemSubIcons+='<img src="images/remove.png" title="' + $.i18n('Remove Device') +'" onclick="RemoveDevice(' + item.idx +')">';
				  }
				  else {
								if (
										(item.Type.indexOf("Light")==0)||
										(item.Type.indexOf("Security")==0)
									 )
								{
									itemSubIcons+='<img src="images/add.png" title="' + $.i18n('Add Light/Switch Device') + '" onclick="AddLightDeviceDev(' + item.idx +',\'' + item.Name + '\')">';
								}
								else {
									itemSubIcons+='<img src="images/add.png" title="' + $.i18n('Add Device') +'" onclick="AddDevice(' + item.idx +',\'' + item.Name + '\')">';
								}
				  }
				  if (
						(item.Type.indexOf("Light")==0)||
						(item.Type.indexOf("Chime")==0)||
						(item.Type.indexOf("Security")==0)
					 )
				  {
					itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#devicescontent\', \'ShowDevices\');">';
				  }
				  else if ((item.Type.indexOf("Temp")==0)||(item.Type.indexOf("Thermostat")==0)||(item.Type.indexOf("Humidity")==0)) {
					itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowTempLog(\'#devicescontent\',\'ShowDevices\',' + item.idx + ',\'' + item.Name + '\');">';
				  }
				  else if (item.SubType=="Voltage") {
					itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowGeneralGraph(\'#devicescontent\',\'ShowDevices\',' + item.idx + ',\'' + item.Name + '\',' + item.SwitchTypeVal +', \'VoltageGeneral\');">';
				  }
				  else if (item.SubType=="Current") {
					itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowGeneralGraph(\'#devicescontent\',\'ShowDevices\',' + item.idx + ',\'' + item.Name + '\',' + item.SwitchTypeVal +', \'CurrentGeneral\');">';
				  }
				  else if (item.SubType == "Percentage") {
					itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowPercentageLog(\'#devicescontent\',\'ShowDevices\',' + item.idx + ',\'' + item.Name + '\');">';
				  }
				  else if (item.SubType=="Sound Level") {
					itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowGeneralGraph(\'#devicescontent\',\'ShowDevices\',' + item.idx + ',\'' + item.Name + '\',' + item.SwitchTypeVal +', \'' + item.SubType + '\');">';
				  }
				  else if (item.Type.indexOf("Current")==0) {
					itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowCurrentLog(\'#devicescontent\',\'ShowDevices\',' + item.idx + ',\'' + item.Name + '\', ' + item.displaytype + ');">';
				  }
				  else if (typeof item.Counter != 'undefined') {
					  if ((item.Type == "P1 Smart Meter")&&(item.SubType=="Energy")) {
						itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowSmartLog(\'#devicescontent\',\'ShowDevices\',' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal + ');">';
					  }
					  else {
						itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowCounterLog(\'#devicescontent\',\'ShowDevices\',' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal + ');">';
					  }
				  }
				  else if (typeof item.Direction != 'undefined') {
					itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowWindLog(\'#devicescontent\',\'ShowDevices\',' + item.idx + ',\'' + item.Name + '\');">';
				  }
				  else if (typeof item.UVI != 'undefined') {
					itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowUVLog(\'#devicescontent\',\'ShowDevices\',' + item.idx + ',\'' + item.Name + '\');">';
				  }
				  else if (typeof item.Rain != 'undefined') {
					itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowRainLog(\'#devicescontent\',\'ShowDevices\',' + item.idx + ',\'' + item.Name + '\');">';
				  }
				  else if (item.Type == "Energy") {
					itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowCounterLog(\'#devicescontent\',\'ShowDevices\',' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal + ');">';
				  }
				  else if (item.Type == "Air Quality") {
					itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowAirQualityLog(\'#devicescontent\',\'ShowDevices\',' + item.idx + ',\'' + item.Name + '\');">';
				  }
				  else if (item.Type == "Lux") {
					itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowLuxLog(\'#devicescontent\',\'ShowDevices\',' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal + ');">';
				  }
				  else if (item.Type == "Usage") {
					itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowUsageLog(\'#devicescontent\',\'ShowDevices\',' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal + ');">';
				  }
				  else if (item.SubType == "Solar Radiation") {
					itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowGeneralGraph(\'#devicescontent\',\'ShowDevices\',' + item.idx + ',\'' + item.Name + '\',' + item.SwitchTypeVal +', \'Radiation\');">';
				  }
				  else if (item.SubType == "Visibility") {
					itemSubIcons+='&nbsp;<img src="images/log.png" title="' + $.i18n('Log') +'" onclick="ShowGeneralGraph(\'#devicescontent\',\'ShowDevices\',' + item.idx + ',\'' + item.Name + '\',' + item.SwitchTypeVal +', \'Visibility\');">';
				  }
				  else {
					itemSubIcons+='&nbsp;<img src="images/empty16.png">';
				  }
				  var ID = item.ID;
				  if (item.Type=="Lighting 1") {
								ID = String.fromCharCode(item.ID);
				  }
				  var BatteryLevel=item.BatteryLevel;
				  if (BatteryLevel=="255") {
								BatteryLevel="-";
				  }
				  else if (BatteryLevel=="0") {
								BatteryLevel=$.i18n("Low");
				  }
				  var addId = oTable.fnAddData([
							  itemChecker + "&nbsp;&nbsp;" + itemImage,
							  item.idx,
							  item.HardwareName,
							  ID,
							  item.Unit,
							  item.Name,
							  item.Type,
							  item.SubType,
							  item.Data,
							  item.SignalLevel,
							  BatteryLevel,
							  itemSubIcons,
							  item.LastUpdate
							], false);
				});
				mTable.fnDraw();
			  }
			 }
		  });
		  $('#modal').hide();
		  return false;
		}

		EnableDisableSubDevices = function(bEnabled)
		{
			var trow=$("#dialog-addlightdevicedev #lighttable #subdevice");
			if (bEnabled == true) {
				trow.show();
			}
			else {
				trow.hide();
			}
		}

		jQuery.fn.dataTableExt.oSort['numeric-battery-asc']  = function(a,b) {
			var x = a;
			var y = b;
			if (x=="-") x=101;
			if (x=="Low") x=1;
			if (y=="-") y=101;
			if (y=="Low") y=1;
			x = parseFloat( x );
			y = parseFloat( y );
			return ((x < y) ? -1 : ((x > y) ?  1 : 0));
		};
		 
		jQuery.fn.dataTableExt.oSort['numeric-battery-desc'] = function(a,b) {
			var x = a;
			var y = b;
			if (x=="-") x=101;
			if (x=="Low") x=1;
			if (y=="-") y=101;
			if (y=="Low") y=1;
			x = parseFloat( x );
			y = parseFloat( y );
			return ((x < y) ?  1 : ((x > y) ? -1 : 0));
		};
		init();

		function init()
		{
			//global var
			$.devIdx=0;
			$.LightsAndSwitches = [];
					
				$( "#dialog-adddevice" ).dialog({
					  autoOpen: false,
					  width: 420,
					  height: 170,
					  modal: true,
					  resizable: false,
					  buttons: {
						  "Add Device": function() {
							  var bValid = true;
							  bValid = bValid && checkLength( $("#dialog-adddevice #devicename"), 2, 100 );
							  if ( bValid ) {
								  $( this ).dialog( "close" );
								  $.ajax({
									 url: "json.htm?type=setused&idx=" + $.devIdx + '&name=' + $("#dialog-adddevice #devicename").val() + '&used=true',
									 async: false, 
									 dataType: 'json',
									 success: function(data) {
										ShowDevices();
									 }
								  });
								  
							  }
						  },
						  Cancel: function() {
							  $( this ).dialog( "close" );
						  }
					  },
					  close: function() {
						$( this ).dialog( "close" );
					  }
				});

				$( "#dialog-addlightdevicedev" ).dialog({
					  autoOpen: false,
					  width: 360,
					  height: 226,
					  modal: true,
					  resizable: false,
					  buttons: {
						  "Add Device": function() {
							  var bValid = true;
							  bValid = bValid && checkLength( $("#dialog-addlightdevicedev #devicename"), 2, 100 );
							  var bIsSubDevice=$("#dialog-addlightdevicedev #lighttable #how_2").is(":checked");
							  var MainDeviceIdx="";
							  if (bIsSubDevice)
							  {
									var MainDeviceIdx=$("#dialog-addlightdevicedev #combosubdevice option:selected").val();
									if (typeof MainDeviceIdx == 'undefined') {
										bootbox.alert($.i18n('No Main Device Selected!'));
										return;
									}
							  }
							  if ( bValid ) {
								  $( this ).dialog( "close" );
								  $.ajax({
									 url: "json.htm?type=setused&idx=" + $.devIdx + '&name=' + $("#dialog-addlightdevicedev #devicename").val() + '&used=true&maindeviceidx=' + MainDeviceIdx,
									 async: false, 
									 dataType: 'json',
									 success: function(data) {
										ShowDevices();
									 }
								  });
							  }
						  },
						  Cancel: function() {
							  $( this ).dialog( "close" );
						  }
					  },
					  close: function() {
						$( this ).dialog( "close" );
					  }
				});
						
			$("#dialog-addlightdevicedev #lighttable #how_1").click(function() {
				EnableDisableSubDevices(false);
			});
			$("#dialog-addlightdevicedev #lighttable #how_2").click(function() {
				EnableDisableSubDevices(true);
			});
			
			ShowDevices();
			
			$( "#dialog-adddevice" ).keydown(function (event) {
				if (event.keyCode == 13) {
					$(this).siblings('.ui-dialog-buttonpane').find('button:eq(0)').trigger("click");
					return false;
				}
			});
			$( "#dialog-addlightdevicedev" ).keydown(function (event) {
				if (event.keyCode == 13) {
					$(this).siblings('.ui-dialog-buttonpane').find('button:eq(0)').trigger("click");
					return false;
				}
			});
	
		};
	} ]);
});