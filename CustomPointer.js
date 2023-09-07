"use strict";
/**
 * pointer event 기반 데이터
 */
class CustomPointer{
  pointerId = null;
  isPrimary = false;
  first = {
    pageX:null,
    pageY:null,
    timeStamp:null,
  };
  last = {
    pageX:null,
    pageY:null,
    timeStamp:null,
    moveDistance:0,
  };
  event = null;
  
  constructor(event){  
    this.pointerId = event.pointerId,
    this.isPrimary = event.isPrimary,
    this.setFirst(event);
    this.setEvent(event);
    this.setLast(event);
  }

  setFirst(event){
    this.first.pageX = event.pageX;
    this.first.pageY = event.pageY;
    this.first.timeStamp = event.timeStamp;
  }
  setEvent(event){
    this.event = event;
  }  
  setLast(event){
    this.last.pageX = event.pageX;
    this.last.pageY = event.pageY;
    this.last.timeStamp = event.timeStamp;
    // this.last.moveDistance = this.moveDistance;
  }

  
  get duration(){ return this.event.timeStamp - this.first.timeStamp; }
  get moveX(){ return this.event.pageX - this.first.pageX; }
  get moveY(){ return this.event.pageY - this.first.pageY; }
  get moveDistance(){ return Math.sqrt(Math.pow(this.moveX,2) + Math.pow(this.moveY,2)); }
  get moveDeltaX(){ return this.event.pageX - this.last.pageX; }
  get moveDeltaY(){ return this.event.pageY - this.last.pageY; }
  // get moveDistanceDelta(){ return this.moveDistance - this.last.moveDistance; }
  distanceBetween(pointer1){ 
    return Math.sqrt(Math.pow(pointer1.event.pageX - this.event.pageX,2) + Math.pow(pointer1.event.pageY - this.event.pageY,2))
  }
  angleBetween(pointer1){ 
    return Math.atan2(pointer1.event.pageY - this.event.pageY,pointer1.event.pageX - this.event.pageX);
  }
  get velocityX(){ return Math.abs(this.moveX) / this.duration; }
  get velocityY(){ return Math.abs(this.moveY) / this.duration; }
  get velocity(){ return Math.abs(this.moveDistance) / this.duration; }

}