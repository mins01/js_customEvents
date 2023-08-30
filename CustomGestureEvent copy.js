"use strict";
/**
 * 제스쳐 이벤트 에뮬레이팅
 */
class CustomGestureEvent extends CustomEvent{
    
    static actived = false;
    static target = null; // 최초 이벤트 발생 요소(pointerdown 에서 event.target)
    // 커스텀 이벤트 옵션 값 설정
    static bubbles = true; // 이벤트 버블 가능?
    static cancelable = true; // 이벤트 취소 가능?
    static composed = true; // 셰도루트에서 이벤트가 나갈 수 있는가?

    // longPress
    static longPressTimeout = 500; //0.5 sec. for Long press
    static longPressTimeoutTm = null; //



    // 최초 클릭 위치
    static pageX0 = null; // event.pageX;
    static pageY0 = null; // event.pageY;
    static pageX1 = null; // event.pageX;
    static pageY1 = null; // event.pageY;

    // 클릭 시간
    static timeStamp0 = null;
    static timeStamp1 = null;

    // moveX = null; // pageX1 - pageX0
    // moveY = null; // pageY1 - pageY0
    static get moveX(){
        if(this.pageX1 === null){ return null;}
        if(this.pageX0 === null){ return null;}
        return this.pageX1 - this.pageX0;
    }
    static get moveY(){
        if(this.pageY1 === null){ return null;}
        if(this.pageY0 === null){ return null;}
        return this.pageY1 - this.pageY0;
    }

    static get pressedTime(){
        if(this.timeStamp0 === null){ return null;}
        return this.timeStamp1 - this.timeStamp0;
    }

    //=== 전역 메소드 
    // window 에 적용된 싱글톤 객체
    // 동작 on
    static active(){
        this.addEventListener();
    }
    // 동작 off
    static deactive(){
        this.removeEventListener();
    }

    static addEventListener(){
        if(!globalThis.window){ throw('window is not exists'); }
        if(this.actived){ console.warn('already actived'); }
        this.actived = true;
        globalThis.window.addEventListener('pointerdown',this.pointerdown);
    }
    static removeEventListener(){
        if(!globalThis.window){ throw('window is not exists'); }
        this.actived = false;
        globalThis.window.removeEventListener('pointerdown',this.pointerdown);
    }

    static options(event){
        return { 
            bubbles:this.bubbles, 
            cancelable:this.cancelable, 
            composed:this.composed,
            detail:this.detail(event),
        }
    }
    static detail(event){
        return {
            target:this.target,
            moveX:this.moveX,
            moveY:this.moveY,
            pressedTime:this.pressedTime,
            event:event, // original event
        }
    }

    static pointerdown = (event)=>{
        this.target = event.target;
        this.pageX0 = event.pageX;
        this.pageY0 = event.pageY;
        this.pageX1 = event.pageX;
        this.pageY1 = event.pageY;
        this.timeStamp0 = event.timeStamp;
        this.timeStamp1 = event.timeStamp;

        this.target.dispatchEvent((new this('custompointerdown', this.options(event))));

        this.longPressTimeoutTm = setTimeout(() => {
            this.target.dispatchEvent((new this('longpress', this.options(event))));
        }, this.longPressTimeout);

        document.addEventListener('pointermove',this.pointermove);
        document.addEventListener('pointerup',this.pointerup);
    }
    static pointermove = (event)=>{
        this.pageX1 = event.pageX;
        this.pageY1 = event.pageY;
        this.timeStamp1 = event.timeStamp;

        this.target.dispatchEvent((new this('custompointermove', this.options(event))));

        if(this.longPressTimeoutTm){
            // console.log('cancel longpress');
            clearTimeout(this.longPressTimeoutTm); 
        }
    }
    static pointerup = (event)=>{
        this.timeStamp1 = event.timeStamp;
        this.target.dispatchEvent((new this('custompointerup', this.options(event))));

        if(this.longPressTimeoutTm){
            // console.log('cancel longpress'); 
            clearTimeout(this.longPressTimeoutTm); 
        }

        document.removeEventListener('pointermove',this.pointermove);
        document.removeEventListener('pointerup',this.pointerup);
    }


    /**
     * 
     */
    constructor(typeArg,options,detail){
        super(typeArg,options);
    }
}