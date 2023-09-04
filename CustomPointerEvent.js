"use strict";
/**
 * PointerEvent 등 를 확장해서 custom event를 triger 해서 사용할 수 있게 한다.
 */
class CustomPointerEvent extends CustomEvent{
    
    

    static actived = false;
    static target = null; // 최초 이벤트 발생 요소(pointerdown 에서 event.target)
    static firstTimeStamp = null; // 최초 이벤트의 timeStamp
    
    // 멀티 포인터 이벤트
    static pointers = []; // 멀티 이벤트 처리용.
    static maxPointerNumber = 0;

    // 커스텀 이벤트 옵션 값 설정
    static bubbles = true; // 이벤트 버블 가능?
    static cancelable = true; // 이벤트 취소 가능?
    static composed = true; // 셰도루트에서 이벤트가 나갈 수 있는가?

    // 최초 클릭 위치
    static pageX0 = null; // event.pageX;
    static pageY0 = null; // event.pageY;
    static pageX1 = null; // event.pageX;
    static pageY1 = null; // event.pageY;

    // 포인터 이동 증가값
    static moveDeltaX = null;
    static moveDeltaY = null;
    static moveDelta = null;

    // 멀티 포인터 1,2 번의 거리
    static distanceBetween = null;
    static distanceBetweenDelta = 0;

    // 멀티포인트 1,2 번의 각도 rad
    static rotate = null
    static rotateDelta = null

    // 이동 속도
    static velocityX = null; // px / sec
    static velocityY = null; // px / sec
    static velocity = null; // px / sec

    static duration = null; // ms


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
    static get moveDistance(){
        if(this.moveX === null){ return null;}
        if(this.moveY === null){ return null;}
        return Math.sqrt(Math.pow(this.moveX,2) + Math.pow(this.moveY,2));
    }
    

    // static get distanceBetweenDelta(){ // 간격 변화량
    //     if(this.distanceBetween1 === null){ return null;}
    //     if(this.distanceBetween === null){ return null;}
    //     return this.distanceBetween1 - this.distanceBetween;
    // }

    static indexOfPointers(event){
        for(let i=0,m=this.pointers.length;i<m;i++){
            if(event.pointerId == this.pointers[i].pointerId){
                return i;
            }
        }
        return -l
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

    static options(event,message){
        return { 
            bubbles:this.bubbles, 
            cancelable:this.cancelable, 
            composed:this.composed,
            detail:this.detail(event,message),
        }
    }
    static detail(event,message){
        return {
            target:this.target,
            event:event, // original event
            message:message,
            moveX:this.moveX,
            moveY:this.moveY,
            moveDistance:this.moveDistance,
            duration:this.duration,
            velocityX:this.velocityX,
            velocityY:this.velocityY,
            velocity:this.velocity,
            distanceBetween:this.distanceBetween,
            distanceBetweenDelta:this.distanceBetweenDelta,
            rotate:this.rotate,
            rotateDelta:this.rotateDelta,
            pointerNumber:this.pointers.length,
            maxPointerNumber:this.maxPointerNumber,
            pointers:this.pointers,
            
        }
    }
    static cbPointerdown = (event) =>{
        return this.pointerdown(event)
    }
    static pointerdown(event){
        // multi pointer
        this.pointers.push(event);

        if(event.isPrimary){ // 기본포인터인 경우만 
            this.target = event.target;
            this.firstTimeStamp = event.timeStamp;
            this.duration = event.timeStamp - this.firstTimeStamp;

            this.pageX0 = event.pageX;
            this.pageY0 = event.pageY;
            this.pageX1 = event.pageX;
            this.pageY1 = event.pageY;
    
            this.moveDeltaX = 0;
            this.moveDeltaY = 0;
            this.moveDelta = 0;
            

            this.velocityX = 0;
            this.velocityY = 0;
            this.velocity = 0;
        }
        

        if(this.pointers.length > 1){
            this.distanceBetween = Math.sqrt(Math.pow(this.pointers[1].pageX - this.pointers[0].pageX,2) + Math.pow(this.pointers[1].pageY - this.pointers[0].pageY,2))
            const distanceBetween1 = this.distanceBetween;
            this.distanceBetweenDelta = distanceBetween1-this.distanceBetween;

            this.rotate = Math.atan2(this.pointers[1].pageY - this.pointers[0].pageY,this.pointers[1].pageX - this.pointers[0].pageX);
            const rotate1 = this.rotate;
            this.rotateDelta = rotate1-this.rotate0;
        }else{
            this.distanceBetween = null;
            this.distanceBetweenDelta = null;

            this.rotate = null;
            this.rotateDelta = null;
        }
        this.maxPointerNumber = this.pointers.length;


        this.target.dispatchEvent((new this('custompointerdown', this.options(event))));

        document.addEventListener('pointermove',this.cbPointermove);
        document.addEventListener('pointerup',this.cbPointerup);
        document.addEventListener('pointercancel',this.cbPointercancel);
    }
    static cbPointermove = (event) =>{
        return this.pointermove(event)
    }
    static pointermove(event){
        // multi pointer
        let pointerId = this.indexOfPointers(event);
        if(pointerId > -1) this.pointers[pointerId] = event;
        if(this.pointers.length > 1){
            const distanceBetween1 = Math.sqrt(Math.pow(this.pointers[1].pageX - this.pointers[0].pageX,2) + Math.pow(this.pointers[1].pageY - this.pointers[0].pageY,2))
            this.distanceBetweenDelta = distanceBetween1-this.distanceBetween;
            this.distanceBetween = distanceBetween1;

            const rotate1 = Math.atan2(this.pointers[1].pageY - this.pointers[0].pageY,this.pointers[1].pageX - this.pointers[0].pageX);
            this.rotateDelta = rotate1-this.rotate;
            this.rotate = rotate1;
        }
        if(event.isPrimary){ // 기본포인터인 경우만 
            this.duration = event.timeStamp - this.firstTimeStamp;

            this.moveDeltaX = event.pageX - this.pageX1;
            this.moveDeltaY = event.pageY - this.pageY1;
            this.moveDelta = Math.sqrt(Math.pow(this.moveDeltaX,2) + Math.pow(this.moveDeltaY,2))

            this.pageX1 = event.pageX;
            this.pageY1 = event.pageY;

            this.velocityX = Math.abs(this.moveX) / this.duration * 1000;
            this.velocityY = Math.abs(this.moveY) / this.duration * 1000;
            this.velocity = Math.abs(this.moveDistance) / this.duration * 1000;
        }

        this.target.dispatchEvent((new this('custompointermove', this.options(event))));
    }
    static cbPointerup = (event) =>{
        return this.pointerup(event)
    }
    static pointerup(event){
        this.target.dispatchEvent((new this('custompointerup', this.options(event))));

        if(event.isPrimary){
            this.duration = 0;
            this.pageX0 = null;
            this.pageY0 = null;
            this.pageX1 = null;
            this.pageY1 = null;

            this.moveDeltaX = 0;
            this.moveDeltaY = 0;
            this.moveDelta = 0;

            this.velocityX = 0;
            this.velocityY = 0;
            this.velocity = 0;
        }

        // multi pointer
        let pointerId = this.indexOfPointers(event);
        if(pointerId >= 0) this.pointers.splice(pointerId, 1);

        if(this.pointers.length===0){
            this.distanceBetween = null;
            this.distanceBetweenDelta = null;
    
            this.rotate = null;
            this.rotateDelta = null;

            this.maxPointerNumber = 0;

            document.removeEventListener('pointermove',this.cbPointermove);
            document.removeEventListener('pointerup',this.cbPointerup);
            document.removeEventListener('pointercancel',this.cbPointercancel);
        }
        
    }


    static cbPointercancel = (event) =>{
        return this.pointercancel(event)
    }
    static pointercancel(event){
        event.target.dispatchEvent((new this('custompointercancel', this.options(event))));

        if(event.isPrimary){
            this.pageX0 = null;
            this.pageY0 = null;
            this.pageX1 = null;
            this.pageY1 = null;

            this.moveDeltaX = 0;
            this.moveDeltaY = 0;
            this.moveDelta = 0;

            this.velocityX = 0;
            this.velocityY = 0;
            this.velocity = 0;
        }

        // multi pointer
        let pointerId = this.indexOfPointers(event);
        if(pointerId >= 0) this.pointers.splice(pointerId, 1);

        if(this.pointers.length===0){
            this.distanceBetween = null;
            this.distanceBetweenDelta = null;
    
            this.rotate = null;
            this.rotateDelta = null;

            this.maxPointerNumber = 0;

            document.removeEventListener('pointermove',this.cbPointermove);
            document.removeEventListener('pointerup',this.cbPointerup);
            document.removeEventListener('pointercancel',this.cbPointercancel);
        }
    }

    /**
     * 
     */
    constructor(typeArg,options){
        super(typeArg,options);
    }
}