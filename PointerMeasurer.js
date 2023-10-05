"use strict";
/**
 * @class
 * pointer measurer
 * 포인터 측정기. 
 * 이동거리, 각도, 가속도, 이동 시간 등등
 */
class PointerMeasurer{

  /**
   * pointerId for event
   * @type {(number|null)}
   */
  pointerId = null;
  /**
   * isPrimary for event
   * @type {(boolean|null)}
   */
  isPrimary = null;
  /**
   * first point x
   * @type {(number|null)}
   */
  firstX = null;
  /**
   * first point y
   * @type {(number|null)}
   */
  firstY = null;
  /**
   * first timeStamp (ms)
   * @type {(number|null)}
   */
  firstTimeStamp = null;
  /**
   * current point x
   * @type {(number|null)}
   */
  x = null;
  /**
   * current point y
   * @type {(number|null)}
   */
  y = null;
  /**
   * current timeStamp (ms)
   * @type {(number|null)}
   */
  timeStamp = null;
  /**
   * @constructor
   * @param {(PointerEvent|null)} event 
   */
  constructor(event){
    this.reset();
    if(event){
      this.setEvent(event);
    }
  }
  
  /**
   * reset member variables
   */
  reset(){
    this.pointerId = null;
    this.isPrimary = null;
    this.firstX = null;
    this.firstY = null;
    this.x = null;
    this.y = null;
    this.firstTimeStamp = null
    this.timeStamp = null
  }

  /**
   * set variables from event
   * @param {Event} event 
   */
  setEvent(event){
    if(this.firstX === null){
      this.pointerId = event.pointerId;
      this.isPrimary = event.isPrimary;
      this.setFirst(event.x,event.y);
    }
    this.setCurrent(event.x,event.y);
  }

  /**
   * set first pointer data
   * @param {number} x 
   * @param {number} y 
   */
  setFirst(x,y){
    this.firstX = x;
    this.firstY = y;
    this.firstTimeStamp = Date.now();
  }
  
  /**
   * set current pointer data
   * @param {number} x 
   * @param {number} y 
   */
  setCurrent(x,y){
    this.x = x;
    this.y = y;
    this.timeStamp = Date.now();
  }

  /**
   * getter point duration (ms)
   * @type {number}
   */
    get duration(){ return this.timeStamp - this.firstTimeStamp; }
  /**
   * getter horizontal distance (px)
   * @type {number}
   */
  get distanceX(){ return this.x - this.firstX; }
  /**
   * getter vertical distance (px)
   * @type {number}
   */
  get distanceY(){ return this.y - this.firstY; }
  /**
   * getter distance (px)
   * @type {number}
   */
  get distance(){ return Math.sqrt(Math.pow(this.distanceX,2) + Math.pow(this.distanceY,2)); }
  /**
   * getter angle (rad)
   * @type {number}
   */
  get angle(){ return Math.atan2(this.y - this.firstY,this.x - this.firstX); }
  /**
   * getter horizontal velocity (vector) (px/ms)
   * @type {number}
   */
  get velocityX(){ return this.duration?this.distanceX / this.duration:0; }
  /**
   * vertical velocity (vector) (px/ms)
   * @type {number}
   */
  get velocityY(){ return this.duration?this.distanceY / this.duration:0; }
  /**
   * getter horizontal speed (scalar) (px/ms)
   * @type {number}
   */
  get speedX(){ return Math.abs(this.velocityX); }
  /**
   * getter vertical speed (scalar) (px/ms)
   * @type {number}
   */
  get speedY(){ return Math.abs(this.velocityY); }
  /**
   * getter speed (scalar) (px/ms)
   * @type {number}
   */
  get speed(){ return this.duration?Math.abs(this.distance) / this.duration:0; }
  /**
   * getter velocity (scalar) (px/ms) (alias speed)
   * @type {number}
   */
  get velocity(){ return this.speed; }

  /**
   * distance between two pointers 
   * @param {PointerMeasurer} other 
   * @returns {number} distance between two points
   */
  distanceBetween(other){ 
    return Math.sqrt(Math.pow(other.x - this.x,2) + Math.pow(other.y - this.y,2))
  }
  /**
   * angle between two pointers (A->B)(rad)
   * @param {PointerMeasurer} other 
   * @returns {number} angle between two points
   */
  angleBetween(other){ 
    return Math.atan2(other.y - this.y,other.x - this.x);
  }


}