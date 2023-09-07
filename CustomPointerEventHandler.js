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
    
    // 포인터 이벤트
    pointers = []; // 멀티 이벤트 처리용.
    maxPointerNumber = 0;
    // 싱글 포인터
    moveDistance = null;
    moveDistanceDelta = null;
    // 멀티 포인터
    distanceBetween = null;
    distanceBetweenDelta = null;

    angleBetween = null;
    angleBetweenDelta = null;

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
        let instance = this.getInstance();
        instance.printDebug('active');
        if(!globalThis?.window){ throw('window is not exists'); }
        instance.addEventListener(globalThis?.window);
    }
    // 동작 off
    static deactive(){
        let instance = this.getInstance();
        instance.printDebug('deactive');
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
        if(this.actived){ console.warn('already actived'); }
        this.listener = listener
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
        return new CustomPointer(event);     
    }
    // 포인터 찾기
    indexOfPointers(event){
        for(let i=0,m=this.pointers.length;i<m;i++){
            if(event.pointerId == this.pointers[i].pointerId){
                return i;
            }
        }
        return -1
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
            pointerNumber:this.pointers.length,
            maxPointerNumber:this.maxPointerNumber,

            duration:this.duration,

            moveX:this.moveX,
            moveY:this.moveY,
            moveDistance:this.moveDistance,
            moveDeltaX:this.moveDeltaX,
            moveDeltaY:this.moveDeltaY,
            moveDistanceDelta:this.moveDistanceDelta,

            distanceBetween:this.distanceBetween,
            distanceBetweenDelta:this.distanceBetweenDelta,

            angleBetween:this.angleBetween,
            angleBetweenDelta:this.angleBetweenDelta,
            
            velocityX:this.velocityX,
            velocityY:this.velocityY,
            velocity:this.velocity,
            
            pointers:this.pointers,
            
        }
    }



    // 이벤트 전체 기준 값 가져오기
    get duration(){
        if(this.pointers.length < 1){ return null; }
        return this.pointers[0].duration;
    }  
    // 싱글포인터 값 가져오기
    get moveX(){
        if(this.pointers.length < 1 || !this.pointers[0].isPrimary){ return null; }
        return this.pointers[0].moveX;
    }
    get moveY(){
        if(this.pointers.length < 1 || !this.pointers[0].isPrimary){ return null; }
        return this.pointers[0].moveY;
    }
    get moveDistance(){
        if(!this.moveX || !this.moveY ){ return null; }
        // return Math.sqrt(Math.pow(this.moveX,2) + Math.pow(this.moveY,2));
        return this.pointers[0].moveDistance;
    }
    get moveDeltaX(){
        if(this.pointers.length < 1 || !this.pointers[0].isPrimary){ return null; }
        return this.pointers[0].moveDeltaX;
    }
    get moveDeltaY(){
        if(this.pointers.length < 1 || !this.pointers[0].isPrimary){ return null; }
        return this.pointers[0].moveDeltaY;
    }

    get velocityX(){
        if(this.pointers.length < 1 || !this.pointers[0].isPrimary){ return null; }
        return this.pointers[0].velocityX;
    }
    get velocityY(){
        if(this.pointers.length < 1 || !this.pointers[0].isPrimary){ return null; }
        return this.pointers[0].velocityY;
    }
    get velocity(){
        if(this.pointers.length < 1 || !this.pointers[0].isPrimary){ return null; }
        return this.pointers[0].velocity;
    }

    



    cbPointerdown = (event) =>{
        return this.pointerdown(event)
    }

    pointerdown(event){
        this.printDebug('pointerdown');

        // 포인터 등록
        this.pointers.push(this.eventToPointer(event));
        this.maxPointerNumber = Math.max(this.maxPointerNumber,this.pointers.length);

        if(event.isPrimary){ // 기본포인터인 경우만 
            this.target = event.target;
            
            const moveDistance1 = this.pointers[0].moveDistance;
            this.moveDistance = moveDistance1;
            this.moveDistanceDelta = 0
        }

        if(this.pointers.length > 1){
            const distanceBetween1 = this.pointers[0].distanceBetween(this.pointers[1]);
            this.distanceBetween = distanceBetween1;
            this.distanceBetweenDelta = 0;

            const angleBetween1 = this.pointers[0].angleBetween(this.pointers[1]);
            this.angleBetween = angleBetween1;
            this.angleBetweenDelta = 0;

            
        }



        this.target.dispatchEvent((new CustomEvent('custompointerdown', this.options(event))));

        window.addEventListener('pointermove',this.cbPointermove);
        window.addEventListener('pointerup',this.cbPointerup);
        window.addEventListener('pointercancel',this.cbPointercancel);
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
            pointer.setEvent(event)
        }

        if(event.isPrimary){ // 기본포인터인 경우만 
            const moveDistance1 = this.pointers[0].moveDistance;
            this.moveDistanceDelta = moveDistance1 - this.moveDistance;
            this.moveDistance = moveDistance1;
        }

        if(this.pointers.length > 1){
            const distanceBetween1 = this.pointers[0].distanceBetween(this.pointers[1]);
            this.distanceBetweenDelta = this.distanceBetween?distanceBetween1 - this.distanceBetween:null;
            this.distanceBetween = distanceBetween1;

            const angleBetween1 = this.pointers[0].angleBetween(this.pointers[1]);
            this.angleBetweenDelta = this.angleBetween?angleBetween1 - this.angleBetween:null;
            this.angleBetween = angleBetween1;
        }

        this.target.dispatchEvent((new CustomEvent('custompointermove', this.options(event))));

        // 마지막 포인터 갱신
        if(pointer){
            pointer.setLast(event)
            // pointer.last.moveDistance = pointer.moveDistance;
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

        if(event.isPrimary){ // 기본포인터인 경우만 
            this.moveDistanceDelta = null;
            this.moveDistance = null;
        }

        if(this.pointers.length < 2 ){
            this.distanceBetween = null;
            this.distanceBetweenDelta = null;
            this.angleBetween = null;
            this.angleBetweenDelta = null;
        }

        if(this.pointers.length === 0){
            this.maxPointerNumber = 0;
            window.removeEventListener('pointermove',this.cbPointermove);
            window.removeEventListener('pointerup',this.cbPointerup);
            window.removeEventListener('pointercancel',this.cbPointercancel);
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

        if(event.isPrimary){ // 기본포인터인 경우만 
            this.moveDistanceDelta = null;
            this.moveDistance = null;
        }

        if(this.pointers.length < 2 ){
            this.distanceBetween = null;
            this.distanceBetweenDelta = null;
            this.angleBetween = null;
            this.angleBetweenDelta = null;
        }

        if(this.pointers.length === 0){
            this.maxPointerNumber = 0;
            window.removeEventListener('pointermove',this.cbPointermove);
            window.removeEventListener('pointerup',this.cbPointerup);
            window.removeEventListener('pointercancel',this.cbPointercancel);
        }
        this.target.dispatchEvent((new CustomEvent('custompointercancel', this.options(event))));
    }
    
}