var allcvctr = 0;
var selected_device;
var devices = [];
function setup()
{
	//Get the default device from the application as a first step. Discovery takes longer to complete.
	BrowserPrint.getDefaultDevice("printer", function(device)
			{
		
				//Add device to list of devices and to html select element
				selected_device = device;
				devices.push(device);
				var html_select = document.getElementById("selected_device");
				var option = document.createElement("option");
				option.text = device.name;
				html_select.add(option);
				
				//Discover any other devices available to the application
				BrowserPrint.getLocalDevices(function(device_list){
					for(var i = 0; i < device_list.length; i++)
					{
						//Add device to list of devices and to html select element
						var device = device_list[i];
						if(!selected_device || device.uid != selected_device.uid)
						{
							devices.push(device);
							var option = document.createElement("option");
							option.text = device.name;
							option.value = device.uid;
							html_select.add(option);
						}
					}
					
				}, function(){alert("Error getting local devices")},"printer");
				
			}, function(error){
				alert(error);
			})
}
function getConfig(){
	BrowserPrint.getApplicationConfiguration(function(config){
		alert(JSON.stringify(config))
	}, function(error){
		alert(JSON.stringify(new BrowserPrint.ApplicationConfiguration()));
	})
}

function writeToSelectedPrinter(dataToWrite)
{
	selected_device.send(dataToWrite, undefined, errorCallback);
}
var readCallback = function(readData) {
	if(readData === undefined || readData === null || readData === "")
	{
		alert("No Response from Device");
	}
	else
	{
		var x = document.getElementById('read_text2').value
		document.getElementById('read_text2').value = x + readData;
	}
	
}
var errorCallback = function(errorMessage){
	alert("Error: " + errorMessage);	
}

function readFromSelectedPrinter()
{

	selected_device.readAllAvailable(readCallback, errorCallback, 1);
	
}
function getDeviceCallback(deviceList)
{
	alert("Devices: \n" + JSON.stringify(deviceList, null, 4))
}

function getallcv()
{
	
	if (selected_device.connection === "network")
	{
		alert("Getting ALLCV. Please wait..");
		selected_device.send("! U1 getvar \"allcv\" \r\n", undefined, errorCallback);
		readALLCVnt();
			
	}
	else
	{
		alert("Getting ALLCV. Please wait..");
		selected_device.sendThenReadUntilStringReceived("! U1 getvar \"allcv\" \r\n",'""', allcvpst, errorCallback, 20);
	}
}

var allcvpst = function (readData){
	var x = document.getElementById('read_text2').value;
	document.getElementById('read_text2').value = x + readData;
	alert("ALLCV complete");
}

function readALLCVnt()
{
	selected_device.read(allcvntpst, errorCallback);
}

var allcvntpst = function(readData) {
	if(readData === undefined || readData === null || readData === "")
	{
		alert("No Response from Device/ No Response Needed/ Response Completed");
	}
	else if(readData.includes('""'))
	{
		var x = document.getElementById('read_text2').value
		document.getElementById('read_text2').value = x + readData;
		alert("ALLCV complete");
	}
	else
	{
		var x = document.getElementById('read_text2').value
		document.getElementById('read_text2').value = x + readData;
		setTimeout(readALLCVnt, 2000);
	}
}

function getHH()
{
	alert("Getting HH. Please wait..");
	selected_device.sendThenReadAllAvailable("~CC^^XA^HH^XZ", HHpst, errorCallback, 20);
}

var HHpst = function (readData){
	var x = document.getElementById('read_text2').value;
	document.getElementById('read_text2').value = x + readData;
	alert("HH complete");
}

function calib()
{
	selected_device.send("! U1 do \"zpl.calibrate\" \"run\" \r\n", undefined, errorCallback);
}

function RFIDcalib()
{
	selected_device.send("! U1 setvar \"rfid.tag.calibrate\" \"run\" \r\n", undefined, errorCallback);
}

function BClearBonding()
{
	selected_device.send("! U1 do \"bluetooth.clear_bonding_cache\" \"run\" \r\n", undefined, errorCallback);
}

function BRestore()
{
	selected_device.send("! U1 do \"device.restore_defaults\" \"bluetooth\" \r\n", undefined, errorCallback);
}

function IPRestore()
{
	selected_device.send("! U1 do \"device.restore_defaults\" \"ip\" \r\n", undefined, errorCallback);
}

function WLANRestore()
{
	selected_device.send("! U1 do \"device.restore_defaults\" \"wlan\" \r\n", undefined, errorCallback);
}

function RFIDRestore()
{
	selected_device.send("! U1 setvar \"rfid.tag.calibrate\" \"restore\" \r\n", undefined, errorCallback);
}

function DISPRestore()
{
	selected_device.send("! U1 do \"device.restore_defaults\" \"display\" \r\n", undefined, errorCallback);
}

function PWRRestore()
{
	selected_device.send("! U1 do \"device.restore_defaults\" \"power\" \r\n", undefined, errorCallback);
}

function MediaFeed()
{
	var PW = document.getElementById('PWOpt').value;
	var HC = document.getElementById('HCOpt').value;
	var cmd = "^XA^MF"+PW+","+HC+"^JUS^XZ";
	selected_device.send(cmd, undefined, errorCallback);
}

function ConfigPS()
{
	var PrintDPI = document.getElementById('PDpi').value;
	var PrintSPD = document.getElementById('PSpd').value;
	var PrintDRK = document.getElementById('PDrk').value;
	var PrintMOD = document.getElementById('PPMo').value;
	var PrintMTY = document.getElementById('PMTy').value;
	var PrintOPT = document.getElementById('POTy').value;
	
	if (document.getElementById('PUoM').value == "in")
	{
		var PrintUOM = 1;
	}
	else if (document.getElementById('PUoM').value == "cm")
	{
		var PrintUOM = 2.54;
	}
	else if (document.getElementById('PUoM').value == "mm")
	{
		var PrintUOM = 25.4;
	}
	
	var PrintWDT = (document.getElementById('PW_text').value)*(Math.round(PrintDPI/PrintUOM));
	var PrintLL = (document.getElementById('LL_text').value)*(Math.round(PrintDPI/PrintUOM));
	PrintLL = ("0000"+PrintLL).slice(-4);
	var PrintLT = document.getElementById('LT_text').value;
	var PrintLS = document.getElementById('LS_text').value;
	var PrintTA = document.getElementById('TA_text').value;
	
	if (PrintTA.includes("-") && PrintTA.indexOf("-") == 0)
	{
		PrintTA = PrintTA.slice(1,PrintTA.length);
		PrintTA = ("000"+PrintTA).slice(-3);
		PrintTA = "-" + PrintTA;
	}
	else
	{
		PrintTA = ("000"+PrintTA).slice(-3);
	}
	var CmdStrng = "~TA"+PrintTA+"~SD"+PrintDRK+"\r\n^XA^PR"+PrintSPD+","+PrintSPD+"^MT"+PrintMOD+"^MN"+PrintMTY+"^MM"+PrintOPT+"^PW"+PrintWDT+"^LL"+PrintLL+"^LT"+PrintLT+"^LS"+PrintLS+"^JUS^XZ\r\n"
	
	selected_device.send(CmdStrng, undefined, errorCallback);
}
function sendImage(imageUrl)
{
	url = window.location.href.substring(0, window.location.href.lastIndexOf("/"));
	url = url + "/" + imageUrl;
	selected_device.sendUrl(url, undefined, errorCallback)
}
function sendImageHttp(imageUrl)
{
	url = window.location.href.substring(0, window.location.href.lastIndexOf("/"));
	url = url + "/" + imageUrl;
	url = url.replace("https", "http");
	selected_device.sendUrl(url, undefined, errorCallback)
}
function onDeviceSelected(selected)
{
	for(var i = 0; i < devices.length; ++i){
		if(selected.value == devices[i].uid)
		{
			selected_device = devices[i];
			return;
		}
	}
}
window.onload = setup;