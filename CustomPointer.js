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
  event = null;
  
  constructor(event){
    this.pointerId = event.pointerId,
    this.isPrimary = event.isPrimary,
    this.setFirst(event);
    this.setEvent(event);
    
  }

  setFirst(event){
    this.first.pageX = event.pageX;
    this.first.pageY = event.pageY;
    this.first.timeStamp = event.timeStamp;
  }
  setEvent(event){
    this.event = event;
  }
  
  get duration(){ return this.event.timeStamp - this.first.timeStamp; }
  get distanceX(){ return this.event.pageX - this.first.pageX; }
  get distanceY(){ return this.event.pageY - this.first.pageY; }
  get distance(){ return Math.sqrt(Math.pow(this.distanceX,2) + Math.pow(this.distanceY,2)); }
  get angle(){ return Math.atan2(this.event.pageY - this.first.pageY,this.event.pageX - this.first.pageX); }
  get velocityX(){ return this.duration?Math.abs(this.distanceX) / this.duration:0; }
  get velocityY(){ return this.duration?Math.abs(this.distanceY) / this.duration:0; }
  get velocity(){ return this.duration?Math.abs(this.distance) / this.duration:0; }

  distanceBetween(pointer1){ 
    return Math.sqrt(Math.pow(pointer1.event.pageX - this.event.pageX,2) + Math.pow(pointer1.event.pageY - this.event.pageY,2))
  }
  angleBetween(pointer1){ 
    return Math.atan2(pointer1.event.pageY - this.event.pageY,pointer1.event.pageX - this.event.pageX);
  }


}