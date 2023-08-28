"use strict";
/**
 * PointerEvent 등 를 확장해서 custom event를 triger 해서 사용할 수 있게 한다.
 */
class CustomPointerEvent extends CustomEvent{
    
    static actived = false;
    static target = null; // 최초 이벤트 발생 요소(pointerdown 에서 event.target)
    // 커스텀 이벤트 옵션 값 설정
    static bubbles = true; // 이벤트 버블 가능?
    static cancelable = true; // 이벤트 취소 가능?
    static composed = true; // 셰도루트에서 이벤트가 나갈 수 있는가?

    // 최초 클릭 위치
    static pageX0 = null; // event.pageX;
    static pageY0 = null; // event.pageY;
    static pageX1 = null; // event.pageX;
    static pageY1 = null; // event.pageY;

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
        globalThis.window.addEventListener('pointerdown',this.cbPointerdown);
    }
    static removeEventListener(){
        if(!globalThis.window){ throw('window is not exists'); }
        this.actived = false;
        globalThis.window.removeEventListener('pointerdown',this.cbPointerdown);
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
            event:event, // original event
        }
    }
    static cbPointerdown = (event) =>{
        return this.pointerdown(event)
    }
    static pointerdown(event){
        this.target = event.target;
        this.pageX0 = event.pageX;
        this.pageY0 = event.pageY;
        this.pageX1 = event.pageX;
        this.pageY1 = event.pageY;

        this.target.dispatchEvent((new this('custompointerdown', this.options(event))));

        document.addEventListener('pointermove',this.cbPointermove);
        document.addEventListener('pointerup',this.cbPointerup);
        // document.addEventListener('pointercancel',this.cbPointercancel);
    }
    static cbPointermove = (event) =>{
        return this.pointermove(event)
    }
    static pointermove(event){
        this.pageX1 = event.pageX;
        this.pageY1 = event.pageY;

        this.target.dispatchEvent((new this('custompointermove', this.options(event))));
    }
    static cbPointerup = (event) =>{
        return this.pointerup(event)
    }
    static pointerup(event){
        this.target.dispatchEvent((new this('custompointerup', this.options(event))));

        document.removeEventListener('pointermove',this.cbPointermove);
        document.removeEventListener('pointerup',this.cbPointerup);
        // document.removeEventListener('pointercancel',this.cbPointercancel);
    }

    // 나중에 하자
    // static cbPointercancel = (event) =>{
    //     return this.pointercancel(event)
    // }
    // static pointercancel(event){
    //     this.target.dispatchEvent((new this('custompointercancel', this.options(event))));

    //     document.removeEventListener('pointermove',this.cbPointermove);
    //     document.removeEventListener('pointerup',this.cbPointerup);
    //     document.removeEventListener('pointercancel',this.cbPointercancel);
    // }

    /**
     * 
     */
    constructor(typeArg,options,detail){
        super(typeArg,options);
    }
}