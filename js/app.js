/*
 * PLT Labs Sample App
 * This packaged Chrome application highlights the Chrome Bluetooth APIs
 * @author: Cary A. Bran
 * @version: 1.0
 * @copyright: 2015 Plantronics Inc
 */

//Device related variables
var connectedDevice = null;
var deviceList = {};
var connectedDevice = null;

function init(){

  $('#btnConnect').attr('disabled', true);
  $('#btnConnect').click(connectToDevice);

  $('#btnScan').attr('disabled', true);
  $('#btnScan').click(getDevices);

  $('#btnDisconnect').attr('disabled', true);
  $('#btnDisconnect').click(disconnectDevice);

  $('#btnOn').attr('disabled', true);
  $('#btnOn').click(turnOnLed);

  $('#btnOff').attr('disabled', true);
  $('#btnOff').click(turnOffLed);

   //bluetooth socket callbacks
  chrome.bluetoothSocket.onReceive.addListener(onReceiveHandler);

  chrome.bluetoothSocket.onReceiveError.addListener(function(socketData){
      console.log("error from socket : " + socketData.socketId + " message: "
		        + socketData.errorMessage + " error code: " + socketData.error);
  });


  //device callbacks

  //called when a new device is discovered by the adapter
  //can be used uninstead of chrome.bluetooth.getDevices
  chrome.bluetooth.onDeviceAdded.addListener(deviceAdded);

  //called when the device has changed (e.g. name, connected state, etc)
  chrome.bluetooth.onDeviceChanged.addListener(updateDevice);

  //called when a device is unpaired (removed) or has gone out of
  //range for an extended period of time
  chrome.bluetooth.onDeviceRemoved.addListener(removeDevice);


  //get the current adapter state
  chrome.bluetooth.getAdapterState(adapterStateCallback);
  chrome.bluetooth.onAdapterStateChanged.addListener(adapterStateCallback);

  /*
  chrome.bluetooth.getDevices(function(devices){
        for(i = 0; i < devices.length; i++){
	  var device = devices[i];
	  console.log("device address: " + device.address);
	  console.log("device name: " + device.name);
	  console.log("device class: " + device.deviceClass);
	  console.log("device vendor ID source: " + device.vendorIdSource);
	  console.log("device vendor ID: " + device.vendorId);
	  console.log("device product ID: " + device.productId);
	  console.log("device device ID: " + device.deviceId);
	  console.log("device type: " + device.type);
	  console.log("device paired: " + device.paired);
	  console.log("device connected: " + device.connected);
	  console.log("device uuids: " + device.uuids);
        }
  }); */


 /*
  chrome.bluetooth.startDiscovery(function(){
    setTimeout(function(){
      //stop discovery after 15 seconds
      //discovered devices will be sent to the
      //chrome.bluetooth.onDeviceAdded listener function
      chrome.bluetooth.stopDiscovery(function(){
	  console.log("finished device discovery");
	});
      }, 15000);
  });
  */
}




function adapterStateCallback(adapterState){
  console.log("adapterStateCallback called");
  $("#adapterState").empty();
  $("#adapterState").append('<li>Name: ' + adapterState.name +'</li>');
  $("#adapterState").append('<li>Address: '  + adapterState.address +'</li>');
  $("#adapterState").append('<li>Powered: ' + adapterState.powered +'</li>');
  $("#adapterState").append('<li>Available: ' + adapterState.available +'</li>');
  $("#adapterState").append('<li>Discovering: ' + adapterState.discovering +'</li>');
  var adapterReady = adapterState.powered && adapterState.available;
  $('#btnScan').attr('disabled', !adapterReady);
  $('#btnDiscover').attr('disabled', !adapterReady);
}

function deviceAdded(device){
  //console.log('device added: ' + JSON.stringify(device));
}

function addDevice(device){
  deviceList[device.address] = device;
}

function updateDevice(device){
  //console.log('device updated: ' + JSON.stringify(device));
  deviceList[device.address] = device;
  //do some device state change logic here...
}

function removeDevice(device) {
  //console.log('device removed: ' + JSON.stringify(device));
  delete deviceList[device.address];
}

function renderDeviceList(){
  $('#deviceList').empty();
  for (var address in deviceList) {
    if (deviceList.hasOwnProperty(address)) {
      var device =  deviceList[address];
      console.log('rendering device: ' + JSON.stringify(device));
      var state = (device.connected && device.paired) ? "Available" : " Not Available";
      $('#deviceList')
	  .append($("<option></option>")
	  .attr("value", device.address)
	  .text(device.name + "(" + state +  ")"));
    }
  }
}


function getDevices(){
  console.log("getting bluetooth devices");
  chrome.bluetooth.getDevices(function(devices){
	$('#btnConnect').attr('disabled', devices.length == 0)
        //filter on PLT devices that are connected to the host
        for(i = 0; i < devices.length; i++){
	  addDevice(devices[i]);
        }
	renderDeviceList();
      });
}

function discoverDevices(){
  console.log("discovering devices for 15 seconds");
  $('#btnScan').attr('disabled', true);
  $('#btnDiscover').attr('disabled', true);
  chrome.bluetooth.startDiscovery(function(){
      setTimeout(function(){
	$('#btnScan').attr('disabled', false);
	$('#btnDiscover').attr('disabled', false);
	  chrome.bluetooth.stopDiscovery(function(){
	    console.log("finished device discovery");
	  });
        }, 15000);
  });
}

function printDeviceInfo(address){

  var device = deviceList[address];
  if (!device) {
    return;
  }
  $("#deviceInfo").empty();
  $("#deviceInfo").append("<li>Address: " + device.address + "</li>");
  $("#deviceInfo").append("<li>Name: " + device.name + "</li>");
  $("#deviceInfo").append("<li>Class: " + device.deviceClass + "</li>");
  $("#deviceInfo").append("<li>Vendor ID Source: " + device.vendorIdSource + "</li>");
  $("#deviceInfo").append("<li>Vendor ID: " + device.vendorId + "</li>");
  $("#deviceInfo").append("<li>Product ID: " + device.productId + "</li>");
  $("#deviceInfo").append("<li>Device ID: " + device.deviceId + "</li>");
  $("#deviceInfo").append("<li>Type: " + device.type + "</li>");
  $("#deviceInfo").append("<li>Paired: " + device.paired + "</li>");
  $("#deviceInfo").append("<li>Connected: " + device.connected + "</li>");
  $("#deviceInfo").append("<li>UUIDs: " + device.uuids + "</li>");
}

function printSocketInfo(socketInfo){
  $("#socketInfo").empty();
  $("#socketInfo").append("<li>SocketId: " + socketInfo.socketId + "</li>");
  $("#socketInfo").append("<li>Persistent: " + socketInfo.persistent + "</li>");
  $("#socketInfo").append("<li>Name: " + socketInfo.name + "</li>");
  $("#socketInfo").append("<li>BufferSize: " + socketInfo.bufferSize + "</li>");
  $("#socketInfo").append("<li>Paused: " + socketInfo.paused + "</li>");
  $("#socketInfo").append("<li>Connected: " + socketInfo.connected + "</li>");
  $("#socketInfo").append("<li>Address: " + socketInfo.address + "</li>");
  $("#socketInfo").append("<li>UUID: " + socketInfo.uuid + "</li>");
}

/*  chrome.bluetoothSocket.getInfo(socketId, function(socketInfo){
      console.log("SocketId: " + socketInfo.socketId);
      console.log("Persistent: " + socketInfo.persistent);
      console.log("Name: " + socketInfo.name);
      console.log("BufferSize: " + socketInfo.bufferSize);
      console.log("Paused: " + socketInfo.paused);
      console.log("Connected: " + socketInfo.connected);
      console.log("Address: " + socketInfo.address);
      console.log("UUID: " + socketInfo.uuid);
    });
*/

function disconnectDevice(){
  if (!connectedDevice) {
    return;
  }

  var device = deviceList[connectedDevice];
  chrome.bluetoothSocket.close(device.socketId, function(){
    console.log("Device connection closed")
    delete deviceList[device.address].socketId;
    connectedDevice = null;
    $('#btnOn').attr('disabled', true);
    $('#btnOff').attr('disabled', true);
    $('#btnConnect').attr('disabled', false);
    $('#btnDisconnect').attr('disabled', true);
    $("#socketInfo").empty();
    $("#deviceInfo").empty();

  });


}
function connectToDevice(){
  var address = $('#deviceList option:selected').val();
  console.log('connectToDevice: connecting to device ' + address);
  chrome.bluetoothSocket.create(function(socketInfo) {
      //connect to the device to with Serial Port Profile (1101)
    chrome.bluetoothSocket.connect(socketInfo.socketId, address, "1101", function(){
        if (chrome.runtime.lastError) {
          throw 'connect: connection failed: ' + chrome.runtime.lastError.message;
        }
	deviceList[address].socketId = socketInfo.socketId;
	connectedDevice = address;
	printDeviceInfo(address);
	console.log('connectToDevice: Bluetooth socket has been created with Serial Port Profile')

	//enable the send button
	$('#btnOn').attr('disabled', false);
	$('#btnOff').attr('disabled', false);
	$('#btnConnect').attr('disabled', true);
	$('#btnDisconnect').attr('disabled', false);
        chrome.bluetoothSocket.getInfo(socketInfo.socketId, printSocketInfo);
    })
  });
}

function onReceiveHandler(socketData){
  console.log('onReceiveHandler: got some data from the serial port on socket id:' + socketData.socketId);
  var data_view = new Uint8Array(socketData.data);
  for(var i = 0; i < data_view.length; i++){
     console.log('onReceiveHandler: data received = ' + data_view[i]);
  }

}

function turnOnLed(){
  sendByteToSocket(49); //1 in ASCII
}

function turnOffLed(){
  sendByteToSocket(48); //0 in ASCII
}


function sendByteToSocket(value){
  if (!connectedDevice || !deviceList[connectedDevice].socketId) {
      throw "device and message parameters are required"
  }
  var message = new ArrayBuffer(1);
  var data_view = new Uint8Array(message);
  data_view[0] = value;

  //this variable is required to maintain correct scoping when calling the send function
  chrome.bluetoothSocket.send(deviceList[connectedDevice].socketId, message);
}

init();