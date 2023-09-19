"use strict";
/**
 * PointerEvent 등 를 확장해서 custom event를 triger 해서 사용할 수 있게 한다.
 */
class CustomGestureEventHandler{
    // 싱글톤 객체
    static instance = null;

    // 디버깅 여부
    debug = false;

    // 
    activated = false; //동작
    listener = null; // 이벤트를 붙이는 대상. 기본은 window
    target = null; // 최초 이벤트 발생 요소(pointerdown 에서 event.target)

    // 커스텀 이벤트 옵션 값 설정
    bubbles = true; // 이벤트 버블 가능?
    cancelable = true; // 이벤트 취소 가능?
    composed = true; // 셰도루트에서 이벤트가 나갈 수 있는가?

    // longPress
    longPressTimeout = 500; //0.5 sec. for Long press
    longPressCancelThreshold = 30; // 30px
    longPressTimeoutTm = null; //

    // swipe 
    swipeVelocityThreshold = 0.3; // px / ms
    swipeDistanceThreshold = 100; // px

    // pinch/zoom
    pinchZoomDistanceBetweenDeltaThreshold = 0.1; //0.1px // for pinch/zoom
    rotateAngleBetweenDeltaThreshold = 0; //0.0001rad // for rotate


    // 싱글톤 객체 가져오기
    static getInstance(){
        if(!this.instance){
            this.instance = new this();
        }
        return this.instance;
    }
    //=== 전역 메소드 
    // 동작 on
    static activate(){
        let instance = this.getInstance();
        instance.printDebug('activate');
        if(!globalThis?.window){ throw('window is not exists'); }
        instance.addEventListener(globalThis.window);
    }
    // 동작 off
    static deactivate(){
        let instance = this.getInstance();
        instance.printDebug('deactivate');
        instance.removeEventListener();
    }

    constructor(){

    }

    // 디버깅용
    printDebug(){
        if(!this.debug){return;}
        console.log.apply(null, [this.constructor.name , ...arguments]);
    }

    // 동작 이벤트 등록
    addEventListener(listener){
        if(this.activated){ console.warn('already activated'); }
        this.listener = listener
        this.activated = true;
        this.listener.addEventListener('custompointerdown',this.cbCustompointerdown);
    }

    // 동작 이벤트 제거
    removeEventListener(){
        if(!this.activated){ console.warn('not activated'); }
        this.activated = false;
        this.listener.removeEventListener('custompointerdown',this.cbCustompointerdown);
    }

    // customevent option 부 생성
    options(event,message){
        return { 
            bubbles:this.bubbles, 
            cancelable:this.cancelable, 
            composed:this.composed,
            detail:this.detail(event,message),
        }
    }
    // customevent option.detail 부 생성
    detail(event,message){
        const detail = Object.assign(event.detail);
        detail.message = message??'';
        return detail;

    }


    cbCustompointerdown = (event) =>{
        return this.custompointerdown(event)
    }

    custompointerdown(event){
        this.printDebug('customointerdown');
               
        if(event.detail.isPrimary){ // 기본포인터인 경우만 
            this.target = event.target;
        }

        //----- longpress
        this.longPressTimeoutTm = setTimeout(() => {
            this.longPressTimeoutTm = null;
            this.target.dispatchEvent((new CustomEvent('longpress', this.options(event))));
        }, this.longPressTimeout);

        window.addEventListener('custompointermove',this.cbCustompointermove);
        window.addEventListener('custompointerup',this.cbCustompointerup);
        window.addEventListener('custompointercancel',this.cbCustompointercancel);
    }

    cbCustompointermove = (event) =>{
        return this.custompointermove(event)
    }

    custompointermove(event){
        this.printDebug('custompointermove');

        //----- longpress
        if(this.longPressTimeoutTm && event.detail.distance > this.longPressCancelThreshold ){
            clearTimeout(this.longPressTimeoutTm);
            this.longPressTimeoutTm = null;
            // this.target.dispatchEvent((new CustomEvent('longpresscancel', this.options(event,'distance > longPressCancelThreshold'))));
        }

        if(event.detail.pointerNumber >= 2){
            //----- pinch/zoom
            if(Math.abs(event.detail.distanceBetweenDelta) >= this.pinchZoomDistanceBetweenDeltaThreshold ){
                if(event.detail.distanceBetweenDelta < 0){
                    this.target.dispatchEvent((new CustomEvent('pinch', this.options(event))));
                }else{
                    this.target.dispatchEvent((new CustomEvent('zoom', this.options(event))));
                }
            }
    
            //----- rotate
            if(Math.abs(event.detail.angleBetweenDelta) >= this.rotateAngleBetweenDeltaThreshold ){
                this.target.dispatchEvent((new CustomEvent('rotate', this.options(event))));
            }
        }
    }

    cbCustompointerup = (event) =>{
        return this.custompointerup(event)
    }

    custompointerup(event){
        this.printDebug('custompointerup');

        //----- longpress
        if(this.longPressTimeoutTm){
            clearTimeout(this.longPressTimeoutTm);
            this.longPressTimeoutTm = null;
            // this.target.dispatchEvent((new CustomEvent('longpresscancel', this.options(event,'custompointerup before longPressTimeout'))));
        }
        //----- swipe
        {
            let absX = Math.abs(event.detail.distanceX);
            let absY = Math.abs(event.detail.distanceY);
            if(absX >= absY && absX >= this.swipeDistanceThreshold && event.detail.velocityX >= this.swipeVelocityThreshold ){
                if(event.detail.distanceX < 0){
                    this.target.dispatchEvent((new CustomEvent('swipeleft', this.options(event))));
                }else{
                    this.target.dispatchEvent((new CustomEvent('swiperight', this.options(event))));
                }
            }else if(absY >= this.swipeDistanceThreshold && event.detail.velocityY >= this.swipeVelocityThreshold){
                if(event.detail.distanceY < 0){
                    this.target.dispatchEvent((new CustomEvent('swipeup', this.options(event))));
                }else{
                    this.target.dispatchEvent((new CustomEvent('swipedown', this.options(event))));
                }
            }
        }
        

        window.removeEventListener('custompointermove',this.cbCustompointermove);
        window.removeEventListener('custompointerup',this.cbCustompointerup);
        window.removeEventListener('custompointercancel',this.cbCustompointercancel);
    }

    cbCustompointercancel = (event) =>{
        return this.custompointercancel(event)
    }
    custompointercancel(event){
        this.printDebug('custompointercancel');
        
        //----- longpress
        if(this.longPressTimeoutTm){
            clearTimeout(this.longPressTimeoutTm);
            this.longPressTimeoutTm = null;
            // event.target.dispatchEvent((new CustomEvent('longpresscancel', this.options(event,'custompointercancel before longPressTimeout'))));
        }

        window.removeEventListener('custompointermove',this.cbCustompointermove);
        window.removeEventListener('custompointerup',this.cbCustompointerup);
        window.removeEventListener('custompointercancel',this.cbCustompointercancel);
    }
    
}