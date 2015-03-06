/*
 * PLT Labs Sample App
 * This packaged Chrome application highlights the Chrome Bluetooth APIs
 * @author: Cary A. Bran
 * @version: 1.0
 * @copyright: 2015 Plantronics Inc
 */

//Device related variables
var connectedDeviceAddress = null;
var deviceList = {};


//commands to be sent over the bluetooth socket connection
var LED_OFF = 48;
var LED_ON = 49;
var LEFT = 50;
var RIGHT = 51;
var FORWARD = 54;
var STOP = 55;


function init(){

  $('#deviceList').on('change', function(){renderDeviceInfo(this.value);})

  $('#btnConnect').attr('disabled', true);
  $('#btnConnect').click(createSocketConnection);

  $('#btnDisconnect').attr('disabled', true);
  $('#btnDisconnect').click(disconnectSocket);

  $('#btnScan').attr('disabled', true);
  $('#btnScan').click(getDevices);

  $('#btnOn').attr('disabled', true);
  $('#btnOn').click(turnOnLed);

  $('#btnOff').attr('disabled', true);
  $('#btnOff').click(turnOffLed);

  $('#btnForward').attr('disabled', true);
  $('#btnForward').click(forward);

  $('#btnStop').attr('disabled', true);
  $('#btnStop').click(stop);

  $('#btnLeft').attr('disabled', true);
  $('#btnLeft').click(turnLeft);

  $('#btnRight').attr('disabled', true);
  $('#btnRight').click(turnRight);

   //bluetooth socket callbacks
  chrome.bluetoothSocket.onReceive.addListener(onReceiveHandler);

  chrome.bluetoothSocket.onReceiveError.addListener(function(socketData){
      console.log("error from socket : " + socketData.socketId + " message: "
		        + socketData.errorMessage + " error code: " + socketData.error);
  });

  //get the adapter state
  chrome.bluetooth.getAdapterState(renderAdapterInfo);

  //register for callback on the adapter state changes
  chrome.bluetooth.onAdapterStateChanged.addListener(renderAdapterInfo);

}

//----------Adapter Related Functions
//Draws the adaptor state to the screen
function renderAdapterInfo(adapterState){
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


//------------Device related functions------------
function addDevice(device){
  deviceList[device.address] = device;
}

function getDevices(){
  console.log("getting bluetooth devices");
  chrome.bluetooth.getDevices(function(devices){
	$('#btnConnect').attr('disabled', devices.length == 0)
        for(i = 0; i < devices.length; i++){
	  addDevice(devices[i]);
	  printDevice(devices[i]);
        }
	renderDeviceList();
    });
}

function renderDeviceList(){
  $('#deviceList').empty();
  for (var address in deviceList) {
    if (deviceList.hasOwnProperty(address)) {
      var device =  deviceList[address];
      var state = (device.connected && device.paired) ? "Available" : " Not Available";
      $('#deviceList')
	  .append($("<option></option>")
	  .attr("value", device.address)
	  .text(device.name + "(" + state +  ")"));
    }
  }
}

function printDevice(device){
    console.log("Device: ");
    console.log("\taddress: " + device.address);
    console.log("\tname: " + device.name);
    console.log("\tdevice class: " + device.deviceClass);
    console.log("\tvendor ID source: " + device.vendorIdSource);
    console.log("\tvendor ID: " + device.vendorId);
    console.log("\tproduct ID: " + device.productId);
    console.log("\tdevice ID: " + device.deviceId);
    console.log("\ttype: " + device.type);
    console.log("\tpaired: " + device.paired);
    console.log("\tconnected: " + device.connected);
    console.log("\tuuids: " + device.uuids);
}



function renderDeviceInfo(address){
  $("#deviceInfo").empty();
  var device = deviceList[address];
  if (!device) {
    return;
  }

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




//Socket Info
function renderSocketInfo(socketInfo){
  printSocketInfo(socketInfo);
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

function printSocketInfo(socketInfo){
  console.log("SocketId: " + socketInfo.socketId);
  console.log("Persistent: " + socketInfo.persistent);
  console.log("Name: " + socketInfo.name);
  console.log("BufferSize: " + socketInfo.bufferSize);
  console.log("Paused: " + socketInfo.paused);
  console.log("Connected: " + socketInfo.connected);
  console.log("Address: " + socketInfo.address);
  console.log("UUID: " + socketInfo.uuid);
}


function toggleUIState(connected){
    if(connected){
	$('#btnOn').attr('disabled', false);
	$('#btnOff').attr('disabled', false);
	$('#btnForward').attr('disabled', false);
        $('#btnStop').attr('disabled', false);
	$('#btnLeft').attr('disabled', false);
        $('#btnRight').attr('disabled', false);
	$('#btnConnect').attr('disabled', true);
	$('#btnDisconnect').attr('disabled', false);
    }
    else{
	$('#btnOn').attr('disabled', true);
	$('#btnOff').attr('disabled', true);
	$('#btnForward').attr('disabled', true);
	$('#btnStop').attr('disabled', true);
	$('#btnLeft').attr('disabled', true);
	$('#btnRight').attr('disabled', true);
	$('#btnConnect').attr('disabled', false);
	$('#btnDisconnect').attr('disabled', true);
        $("#socketInfo").empty();
    }

}

function disconnectSocket(){
  if (!connectedDeviceAddress) {
    return;
  }

  var device = deviceList[connectedDeviceAddress];
  chrome.bluetoothSocket.close(device.socketId, function(){
    //remove the socket ID associated with the device
    delete deviceList[device.address].socketId;
    connectedDeviceAddress = null;
    toggleUIState(false);

  });
}

function createSocketConnection(){
  var address = $('#deviceList option:selected').val();
  chrome.bluetoothSocket.create(function(socketInfo) {
      //connect to the device to with Serial Port Profile (1101)
    chrome.bluetoothSocket.connect(socketInfo.socketId, address, "1101", function(){
        if (chrome.runtime.lastError) {
          throw 'connect: connection failed: ' + chrome.runtime.lastError.message;
        }
	deviceList[address].socketId = socketInfo.socketId;
	connectedDeviceAddress = address;
	chrome.bluetoothSocket.getInfo(socketInfo.socketId, renderSocketInfo);
	toggleUIState(true);
    })
  });
}

function onReceiveHandler(socketData){
  console.log('Got some data from the serial port on socket id:' + socketData.socketId);
  var data_view = new Uint8Array(socketData.data);
  for(var i = 0; i < data_view.length; i++){
     console.log('data received = ' + data_view[i]);
  }
}


function sendByteToSocket(value){
  if (!connectedDeviceAddress || !deviceList[connectedDeviceAddress].socketId) {
      throw "device and message parameters are required"
  }
  //assume 1-byte messages
  var message = new ArrayBuffer(1);
  var data_view = new Uint8Array(message);
  data_view[0] = value;
  chrome.bluetoothSocket.send(deviceList[connectedDeviceAddress].socketId, message);
}

//commands to control robot
function turnOnLed(){
  sendByteToSocket(LED_ON);
}

function turnOffLed(){
  sendByteToSocket(LED_OFF);
}

function turnLeft(){
  sendByteToSocket(LEFT);
}

function turnRight(){
  sendByteToSocket(RIGHT);
}

function forward(){
  sendByteToSocket(FORWARD);
}

function stop() {
  sendByteToSocket(STOP)
}



init();