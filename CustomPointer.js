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
  current = {
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
    this.setCurrent(event)
  }
  setCurrent(event){
    this.current.pageX = event.pageX;
    this.current.pageY = event.pageY;
    this.current.timeStamp = event.timeStamp;
  }
  
  get duration(){ return this.current.timeStamp - this.first.timeStamp; }
  get distanceX(){ return this.current.pageX - this.first.pageX; }
  get distanceY(){ return this.current.pageY - this.first.pageY; }
  get distance(){ return Math.sqrt(Math.pow(this.distanceX,2) + Math.pow(this.distanceY,2)); }
  get angle(){ return Math.atan2(this.current.pageY - this.first.pageY,this.current.pageX - this.first.pageX); }
  get velocityX(){ return this.duration?Math.abs(this.distanceX) / this.duration:0; }
  get velocityY(){ return this.duration?Math.abs(this.distanceY) / this.duration:0; }
  get velocity(){ return this.duration?Math.abs(this.distance) / this.duration:0; }

  distanceBetween(pointer1){ 
    return Math.sqrt(Math.pow(pointer1.current.pageX - this.current.pageX,2) + Math.pow(pointer1.current.pageY - this.current.pageY,2))
  }
  angleBetween(pointer1){ 
    return Math.atan2(pointer1.current.pageY - this.current.pageY,pointer1.current.pageX - this.current.pageX);
  }


}