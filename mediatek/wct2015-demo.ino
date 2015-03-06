#include <LBT.h>
#include <LBTServer.h>

const int L_MOTOR_PIN = 3;
const int R_MOTOR_PIN = 4;
const int L_LED_PIN = 5;
const int R_LED_PIN = 6;

const int L_LIGHT_SENS_PIN = 0; 
const int R_LIGHT_SENS_PIN = 1;

const char LED_ON = '1';
const char LED_OFF = '0';
const char TURN_LEFT = '2';
const char TURN_RIGHT = '3';
const char FORWARD = '6';
const char STOP = '7';
const char LEFT_LIGHT_SENSOR = '8';
const char RIGHT_LIGHT_SENSOR = '9';

void setup() {
  LBTServer.begin((uint8_t*)"WTC2015Demo");
  
  pinMode(L_MOTOR_PIN, OUTPUT);
  pinMode(R_MOTOR_PIN, OUTPUT);
  
  pinMode(L_LED_PIN, OUTPUT);
  pinMode(R_LED_PIN, OUTPUT);
}


char currentState;

void loop() {
  uint8_t buf[64];
  int bytesRead = 0;
  
  if(LBTServer.connected()){
    while(true){
      bytesRead = LBTServer.readBytes(buf,64);
      if(!bytesRead){
        break;
      }
      currentState = buf[0];    
    }  
    switch(currentState){
        case(LED_OFF):{
          digitalWrite(L_LED_PIN, LOW);
          digitalWrite(R_LED_PIN, LOW);
          LBTServer.write((uint8_t*)"0", 1);
          break;
        }
        case(LED_ON):{
          digitalWrite(L_LED_PIN, HIGH);
          digitalWrite(R_LED_PIN, HIGH);
          LBTServer.write((uint8_t*)"1", 1);
          break;
        }
       case(TURN_LEFT):{
          digitalWrite(L_MOTOR_PIN, LOW);
          digitalWrite(R_MOTOR_PIN, HIGH);
          LBTServer.write((uint8_t*)"2", 1);
          break;
        }
        case(TURN_RIGHT):{
          digitalWrite(L_MOTOR_PIN, HIGH);
          digitalWrite(R_MOTOR_PIN, LOW);
          LBTServer.write((uint8_t*)"3", 1);
          break;
        }
        case(FORWARD):{
          digitalWrite(L_MOTOR_PIN, HIGH);
          digitalWrite(R_MOTOR_PIN, HIGH);
          LBTServer.write((uint8_t*)"6", 1);
          break;
        }
        case(STOP):{
          digitalWrite(L_MOTOR_PIN, LOW);
          digitalWrite(R_MOTOR_PIN, LOW);
          LBTServer.write((uint8_t*)"7", 1);
          break;
        }
      }
    delay(100);  
  }
  else{
    LBTServer.accept(5);
  }

}
