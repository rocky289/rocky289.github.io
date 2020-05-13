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
		alert("No Response from Device/ No Response Needed/ Response Completed");
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

	selected_device.read(readCallback, errorCallback);
	
}
function getDeviceCallback(deviceList)
{
	alert("Devices: \n" + JSON.stringify(deviceList, null, 4))
}

function getallcv()
{
	
	if (selected_device.connection === "network")
	{
		selected_device.send("! U1 getvar \"allcv\" \r\n", undefined, errorCallback);
		readALLCVnt();
			
	}
	else
	{
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
	selected_device.sendThenReadAllAvailable("~CC^^XA^HH^XZ", HHpst, errorCallback, 20);
}

var HHpst = function (readData){
	var x = document.getElementById('read_text2').value;
	document.getElementById('read_text2').value = x + readData;
	alert("HH complete");
}

function sendImage(imageUrl)
{
	url = window.location.href.substring(0, window.location.href.lastIndexOf("/"));
	url = "https://rocky289.github.io/" + imageUrl;
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