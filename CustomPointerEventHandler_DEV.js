"use strict";
/**
 * PointerEvent 등 를 확장해서 custom event를 triger 해서 사용할 수 있게 한다.
 */
class CustomPointerEventHandler{
    // 싱글톤 객체
    static instance = null;

    debug = false;
    actived = false; //동작
    listener = null; // 이벤트를 붙이는 대상. 기본은 window
    target = null; // 최초 이벤트 발생 요소(pointerdown 에서 event.target)
    
    // static firstTimeStamp = null; // 최초 이벤트의 timeStamp
    
    // 멀티 포인터 이벤트
    pointers = []; // 멀티 이벤트 처리용.
    maxPointerNumber = 0;

    // 커스텀 이벤트 옵션 값 설정
    bubbles = true; // 이벤트 버블 가능?
    cancelable = true; // 이벤트 취소 가능?
    composed = true; // 셰도루트에서 이벤트가 나갈 수 있는가?




    // 싱글톤 객체 가져오기
    static getInstance(){
        if(!this.instance){
            this.instance = new this();
        }
        return this.instance;
    }
    //=== 전역 메소드 
    // 동작 on
    static active(){
        this.getInstance().addEventListener();
    }
    // 동작 off
    static deactive(){
        this.getInstance().removeEventListener();
    }





    constructor(listener){

    }

    // 디버깅용
    printDebug(){
        if(!this.debug){return;}
        console.log.apply(null, [this.constructor.name , ...arguments]);
    }

    // 동작 이벤트 등록
    addEventListener(listener){
        this.listener = listener
        if(!this.listener){
            if(!globalThis?.window){ throw('window is not exists'); }
            this.listener = globalThis.window;
        }
        if(this.actived){ console.warn('already actived'); }
        this.actived = true;
        this.listener.addEventListener('pointerdown',this.cbPointerdown);
    }

    // 동작 이벤트 제거
    removeEventListener(){
        this.actived = false;
        this.listener.removeEventListener('pointerdown',this.cbPointerdown);
    }

    // 이벤트 포인터s에 넣은 객체 생성
    eventToPointer(event){
        return { 
            pointerId:event.pointerId,
            isPrimary:event.isPrimary,
            first:{
                pageX:event.pageX,
                pageY:event.pageY,
                timeStamp:event.timeStamp,
            }, 
            last:{
                pageX:event.pageX,
                pageY:event.pageY,
                timeStamp:event.timeStamp,
                moveDistance:0,
            }, 
            event:event, 
        };         
    }
    // 포인터 찾기
    indexOfPointers(event){
        for(let i=0,m=this.pointers.length;i<m;i++){
            if(event.pointerId == this.pointers[i].pointerId){
                return i;
            }
        }
        return -l
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
        return {
            target:this.target,
            event:event, // original event
            message:(message??''),
            pointers:this.pointers,
            maxPointerNumber:this.maxPointerNumber,

            moveX:this.moveX,
            moveY:this.moveY,
            moveDistance:this.moveDistance,
            moveDeltaX:this.moveDeltaX,
            moveDeltaY:this.moveDeltaY,
            moveDistanceDelta:this.moveDistanceDelta,

            // duration:this.duration,
            // velocityX:this.velocityX,
            // velocityY:this.velocityY,
            // velocity:this.velocity,
            // distanceBetween:this.distanceBetween,
            // distanceBetweenDelta:this.distanceBetweenDelta,
            // angleBetween:this.angleBetween,
            // angleBetweenDelta:this.angleBetweenDelta,
            // pointerNumber:this.pointers.length,
            // maxPointerNumber:this.maxPointerNumber,
            // pointers:this.pointers,
            
        }
    }



    // 싱글포인터 값 가져오기
    get moveX(){
        if(this.pointers.length < 1 || !this.pointers[0].isPrimary){ return null; }
        return this.pointerMoveX(this.pointers[0]);
    }
    get moveY(){
        if(this.pointers.length < 1 || !this.pointers[0].isPrimary){ return null; }
        return this.pointerMoveY(this.pointers[0]);
    }
    get moveDistance(){
        if(!this.moveX || !this.moveY ){ return null; }
        return Math.sqrt(Math.pow(this.moveX,2) + Math.pow(this.moveY,2));
    }
    get moveDeltaX(){
        if(this.pointers.length < 1 || !this.pointers[0].isPrimary){ return null; }
        return this.pointerMoveDeltaX(this.pointers[0]);
    }
    get moveDeltaY(){
        if(this.pointers.length < 1 || !this.pointers[0].isPrimary){ return null; }
        return this.pointerMoveDeltaY(this.pointers[0]);
    }
    get moveDistanceDelta(){
        if(this.pointers.length < 1 || !this.pointers[0].isPrimary){ return null; }
        return this.pointerMoveDistanceDelta(this.pointers[0]);
    }
    pointerMoveX(pointer){ return pointer.event.pageX - pointer.first.pageX; }
    pointerMoveY(pointer){ return pointer.event.pageY - pointer.first.pageY; }
    pointerMoveDistance(pointer){ return Math.sqrt(Math.pow(this.pointerMoveX(pointer),2) + Math.pow(this.pointerMoveY(pointer),2)); }
    pointerMoveDeltaX(pointer){ return pointer.event.pageX - pointer.last.pageX; }
    pointerMoveDeltaY(pointer){ return pointer.event.pageY - pointer.last.pageY; }
    pointerMoveDistanceDelta(pointer){ return this.pointerMoveDistance(pointer) - pointer.last.moveDistance; }







    cbPointerdown = (event) =>{
        return this.pointerdown(event)
    }

    pointerdown(event){
        this.printDebug('pointerdown');

        // 포인터 등록
        this.pointers.push(this.eventToPointer(event));
        if(event.isPrimary){ // 기본포인터인 경우만 
            this.target = event.target;
        }
        this.maxPointerNumber = Math.max(this.maxPointerNumber,this.pointers.length);

        this.target.dispatchEvent((new CustomEvent('custompointerdown', this.options(event))));

        document.addEventListener('pointermove',this.cbPointermove);
        document.addEventListener('pointerup',this.cbPointerup);
        document.addEventListener('pointercancel',this.cbPointercancel);
    }

    cbPointermove = (event) =>{
        return this.pointermove(event)
    }

    pointermove(event){
        this.printDebug('pointermove');

        // 포인터 갱신
        let pointerIdx = this.indexOfPointers(event);
        let pointer = (pointerIdx > -1)?this.pointers[pointerIdx]:null;
        if(pointer){
            pointer.event = event;
        }


        this.target.dispatchEvent((new CustomEvent('custompointermove', this.options(event))));

        // 마지막 포인터 갱신
        if(pointer){
            pointer.last = {
                pageX:event.pageX,
                pageY:event.pageY,
                timeStamp:event.timeStamp,
                moveDistance:this.pointerMoveDistance(pointer),
            }
        }
    }

    cbPointerup = (event) =>{
        return this.pointerup(event)
    }

    pointerup(event){
        this.printDebug('pointerup');

        // 포인터 삭제
        let pointerIdx = this.indexOfPointers(event);
        if(pointerIdx >= 0) this.pointers.splice(pointerIdx, 1);


        if(this.pointers.length===0){
            this.maxPointerNumber = 0;
            document.removeEventListener('pointermove',this.cbPointermove);
            document.removeEventListener('pointerup',this.cbPointerup);
            document.removeEventListener('pointercancel',this.cbPointercancel);
        }

        this.target.dispatchEvent((new CustomEvent('custompointerup', this.options(event))));

    }

    cbPointercancel = (event) =>{
        return this.pointercancel(event)
    }
    pointercancel(event){
        this.printDebug('pointercancel');

        // 포인터 삭제
        let pointerIdx = this.indexOfPointers(event);
        if(pointerIdx >= 0) this.pointers.splice(pointerIdx, 1);

        if(this.pointers.length===0){
            this.maxPointerNumber = 0;
            document.removeEventListener('pointermove',this.cbPointermove);
            document.removeEventListener('pointerup',this.cbPointerup);
            document.removeEventListener('pointercancel',this.cbPointercancel);
        }
        this.target.dispatchEvent((new CustomEvent('custompointercancel', this.options(event))));
    }
    
}