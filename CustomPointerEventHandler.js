"use strict";
/**
 * PointerEvent 등 를 확장해서 custom pointer event를 triger 해서 사용할 수 있게 한다.
 * @class
 */
class CustomPointerEventHandler{
    /**
     * 싱글톤 객체
     * @type {?CustomPointerEventHandler}
     */
    static instance = null;

    /**
     * 디버그 여부 (개발용)
     * @type {boolean}
     */
    debug = false;

    /**
     * 핸들러 동작 여부
     * @type {boolean}
     */
    activated = false;
    /**
     * 이벤트 리스너 요소
     * @type {?(Window|HTMLElement)}
     */
    listener = null;
    /**
     * 최초 이벤트 발생 요소 (pointerdown 에서 event.target)
     * @type {?(Window|HTMLElement)}
     */
    target = null;

    // 시간정보
    /**
     * 최초 이벤트 발생 시간 (unix timestamp)
     * @type {?number}
     */
    firstTimeStamp = null;
    /**
     * 이벤트 발생 시간 (unix timestamp)
     * @type {?number}
     */
    timeStamp = null;

    // 포인터 이벤트
    /**
     * 이벤트 관련 PointerMeasurer 들
     * @type {PointerMeasurer[]}
     */
    pointerMeasurers = []; // 포인터 측정기 들. 멀티
    /**
     * 최대 동시 포인터 수
     * @type {number}
     */
    maxPointerNumber = 0;

    // 싱글 포인터
    /**
     * X 축 거리
     * @type {?number}
     */
    distanceX = null;
    /**
     * Y 축 거리
     * @type {?number}
     */
    distanceY = null;
    /**
     * 거리
     * @type {?number}
     */
    distance = null;
    /**
     * X 축 거리 변화량
     * @type {?number}
     */
    distanceDeltaX = null;
    /**
     * Y 축 거리 변화량
     * @type {?number}
     */
    distanceDeltaY = null;
    /**
     * 거리 변화량
     * @type {?number}
     */
    distanceDelta = null;

    /**
     * 각도 (rad)
     * @type {?number}
     */
    angle = null;
    /**
     * 각도 변화량 (rad)
     * @type {?number}
     */
    angleDelta = null;

    // 멀티 포인터
    /**
     * 두 포인터 간의 거리
     * @type {?number}
     */
    distanceBetween = null;
    /**
     * 두 포인터 간의 거리 변화량
     * @type {?number}
     */
    distanceBetweenDelta = null;

    /**
     * 두 포인터 간의 각도 (rad)
     * @type {?number}
     */
    angleBetween = null;
    /**
     * 두 포인터 간의 각도 변화량(rad)
     * @type {?number}
     */
    angleBetweenDelta = null;

    // 커스텀 이벤트 옵션 값 설정
    /**
     * custome event config bubbles (이벤트 버블 가능?)
     * @type {boolean}
     */
    bubbles = true;
    /**
     * custome event config cancelable (이벤트 취소 가능?)
     * @type {boolean}
     */
    cancelable = true;
    /**
     * custome event config composed (셰도루트에서 이벤트가 나갈 수 있는가?)
     * @type {boolean}
     */
    composed = true;




    /**
     * 싱글톤 핸들러 객체 가져오기
     * @returns {CustomGestureEventHandler}
     */
    static getInstance(){
        if(!this.instance){
            this.instance = new this();
        }
        return this.instance;
    }
    //=== 전역 메소드 
    /**
     * 싱글톤 핸들러 객체 동작 ON
     */
    static activate(){
        let instance = this.getInstance();
        instance.printDebug('activate');
        if(!globalThis?.window){ throw('window is not exists'); }
        instance.addEventListener(globalThis?.window);
    }
    /**
     * 싱글톤 핸들러 객체 동작 OFF
     */
    static deactivate(){
        let instance = this.getInstance();
        instance.printDebug('deactivate');
        instance.removeEventListener();
    }

    /**
     * @constructs
     */
    constructor(){
        this.activated = false; //동작
        this.listener = null; // 이벤트를 붙이는 대상. 기본은 window
        this.target = null; // 최초 이벤트 발생 요소(pointerdown 에서 event.target)
        this.reset();
    }
    /**
     * 초기화
     */
    reset(){
        // 최초 정보
        this.firstTimeStamp = null;

        // 포인터 이벤트
        this.pointerMeasurers = []; // 포인터 측정기 들. 멀티
        this.maxPointerNumber = 0;
        // 싱글 포인터
        this.distanceX = null;
        this.distanceY = null;
        this.distance = null;
        this.distanceDeltaX = null;
        this.distanceDeltaY = null;
        this.distanceDelta = null;
    
        this.angle = null;
        this.angleDelta = null;
    
        // 멀티 포인터
        this.distanceBetween = null;
        this.distanceBetweenDelta = null;
    
        this.angleBetween = null;
        this.angleBetweenDelta = null;
    }
    /**
     * 디버깅용 (개발용)
     */
    printDebug(){
        if(!this.debug){return;}
        console.log.apply(null, [this.constructor.name , ...arguments]);
    }

    /**
     * listener 에 addEventListener
     * @param {Window|HTMLElement} listener 
     * @listens pointerdown
     */
    addEventListener(listener){
        if(this.activated){ console.warn('already activated'); }
        this.listener = listener
        this.activated = true;
        this.listener.addEventListener('pointerdown',this.cbPointerdown);
    }

    /**
     * listener 에 removeEventListener
     */
    removeEventListener(){
        if(!this.activated){ console.warn('not activated'); }
        this.activated = false;
        this.listener.removeEventListener('pointerdown',this.cbPointerdown);
    }

    /**
     * 이벤트 포인터s에 넣은 PointerMeasurer 객체 생성
     * @param {Event} event 
     * @returns {PointerMeasurer}
     */
    generatePointerMeasurer(event){
        return new PointerMeasurer(event);
    }
    /**
     * this.pointerMeasurers 에서 이벤트의 index 찾기
     * @param {Event} event 
     * @returns {number}
     */
    indexOfpointerMeasurers(event){
        for(let i=0,m= this.pointerMeasurers.length;i<m;i++){
            if(event.pointerId == this.pointerMeasurers[i].pointerId){
                return i;
            }
        }
        return -1
    }

    /**
     * customevent option 부 생성
     * @param {Event} event 
     * @param {?String} message 현재 사용안함 
     * @returns {Object}
     */
    options(event,message){
        return { 
            bubbles:this.bubbles, 
            cancelable:this.cancelable, 
            composed:this.composed,
            detail:this.detail(event,message),
        }
    }
    // customevent option.detail 부 생성

    /**
     * customevent option.detail 부 생성
     * @param {Event} event 
     * @param {?String} message 현재 사용안함
     * @returns {Object}
     */
    detail(event,message){
        return {
            target:this.target,
            isPrimary:event.isPrimary,
            pointerId:event.pointerId,
            event:event, // original event
            
            message:(message??''),
            pointerNumber:this.pointerNumber,
            maxPointerNumber:this.maxPointerNumber,


            firstTimeStamp:this.firstTimeStamp,
            duration:this.duration,

            distanceX:this.distanceX,
            distanceY:this.distanceY,
            distance:this.distance,
            distanceDeltaX:this.distanceDeltaX,
            distanceDeltaY:this.distanceDeltaY,
            distanceDelta:this.distanceDelta,

            angle:this.angle,
            angleDelta:this.angleDelta,

            velocityX:this.velocityX,
            velocityY:this.velocityY,
            velocity:this.velocity,

            speedX:this.speedX,
            speedY:this.speedY,
            speed:this.speed,

            distanceBetween:this.distanceBetween,
            distanceBetweenDelta:this.distanceBetweenDelta,

            angleBetween:this.angleBetween,
            angleBetweenDelta:this.angleBetweenDelta,
            
            
            
            pointerMeasurers:Array.from(this.pointerMeasurers),
            
        }
    }



    // 이벤트 전체 기준 값 가져오기
    /**
     * 이벤트 발생 기간 (ms)
     * @type {number}
     */
    get duration(){
        if(this.pointerMeasurers.length < 1){ return null; }
        // 가장 마지막 이벤트 timeStamp -  최초 이벤트 timeStamp
        return this.timeStamp - this.firstTimeStamp;
    }  
    /**
     * X축 속도 (px/ms)
     * @type {number}
     */
    get velocityX(){
        if(this.pointerMeasurers.length < 1 || !this.pointerMeasurers[0].isPrimary){ return null; }
        return this.pointerMeasurers[0].velocityX;
    }
    /**
     * Y축 속도 (px/ms)
     * @type {number}
     */
    get velocityY(){
        if(this.pointerMeasurers.length < 1 || !this.pointerMeasurers[0].isPrimary){ return null; }
        return this.pointerMeasurers[0].velocityY;
    }
    /**
     * 속도 (px/ms)
     * @type {number}
     */
    get velocity(){
        if(this.pointerMeasurers.length < 1 || !this.pointerMeasurers[0].isPrimary){ return null; }
        return this.pointerMeasurers[0].velocity;
    }

    /**
     * X축 속력 (px/ms)
     * @type {number}
     */
    get speedX(){
        if(this.pointerMeasurers.length < 1 || !this.pointerMeasurers[0].isPrimary){ return null; }
        return this.pointerMeasurers[0].speedX;
    }
    /**
     * Y축 속력 (px/ms)
     * @type {number}
     */
    get speedY(){
        if(this.pointerMeasurers.length < 1 || !this.pointerMeasurers[0].isPrimary){ return null; }
        return this.pointerMeasurers[0].speedY;
    }
    /**
     * 속력 (px/ms)
     * @type {number}
     */
    get speed(){
        if(this.pointerMeasurers.length < 1 || !this.pointerMeasurers[0].isPrimary){ return null; }
        return this.pointerMeasurers[0].speed;
    }

    /**
     * 현재 포인터 수
     * @type {number}
     */
    get pointerNumber(){
        return this.pointerMeasurers.length
    }


    /**
     * 핸들러에 이벤트 적용
     * @param {Event} event 
     */
    setEvent(event){
        if(!this.firstTimeStamp){ // 최초 동작
            if(event.isPrimary){ // 기본포인터인 경우만 
                this.target = event.target;
                this.firstTimeStamp = Date.now();
               
                const distanceX1 = this.pointerMeasurers[0].distanceX;
                this.distanceX = distanceX1;
                this.distanceDeltaX = 0;
                
                const distanceY1 = this.pointerMeasurers[0].distanceY;
                this.distanceY = distanceY1;
                this.distanceDeltaY = 0;
    
                const distance1 = this.pointerMeasurers[0].distance;
                this.distance = distance1;
                this.distanceDelta = 0
    
                const angle1 = this.pointerMeasurers[0].angle;
                this.angle = angle1;
                this.angleDelta = 0
            }
    
            if(this.pointerMeasurers.length > 1){
                const distanceBetween1 = this.pointerMeasurers[0].distanceBetween(this.pointerMeasurers[1]);
                this.distanceBetween = distanceBetween1;
                this.distanceBetweenDelta = 0;
    
                const angleBetween1 = this.pointerMeasurers[0].angleBetween(this.pointerMeasurers[1]);
                this.angleBetween = angleBetween1;
                this.angleBetweenDelta = 0;
            }
        }else{
            if(event.isPrimary){ // 기본포인터인 경우만 
                const distanceX1 = this.pointerMeasurers[0].distanceX;
                this.distanceDeltaX = distanceX1 - this.distanceX;
                this.distanceX = distanceX1;
    
                const distanceY1 = this.pointerMeasurers[0].distanceY;
                this.distanceDeltaY = distanceY1 - this.distanceY;
                this.distanceY = distanceY1;
    
                const distance1 = this.pointerMeasurers[0].distance;
                this.distanceDelta = distance1 - this.distance;
                this.distance = distance1;
    
                const angle1 = this.pointerMeasurers[0].angle;
                this.angleDelta = angle1 - this.angle;
                this.angle = angle1;
            }
    
            if(this.pointerMeasurers.length > 1){
                const distanceBetween1 = this.pointerMeasurers[0].distanceBetween(this.pointerMeasurers[1]);
                this.distanceBetweenDelta = this.distanceBetween?distanceBetween1 - this.distanceBetween:null;
                this.distanceBetween = distanceBetween1;
    
                const angleBetween1 = this.pointerMeasurers[0].angleBetween(this.pointerMeasurers[1]);
                this.angleBetweenDelta = this.angleBetween?angleBetween1 - this.angleBetween:null;
                this.angleBetween = angleBetween1;
            }
        }
        this.timeStamp = Date.now();
    }

    /**
     * pointerdown 이벤트 등록용 화살표 함수
     * @function
     * @param {Event} event
     * @returns {function(event):void}
     */
    cbPointerdown = (event) =>{
        return this.pointerdown(event)
    }

    /**
     * pointerdown 이벤트 처리 메소드
     * @param {Event} event 
     * @fires CustomPointerEventHandler#custompointerdown
     * @listens pointermove
     * @listens pointerup
     * @listens pointercancel
     */
    pointerdown(event){
        this.printDebug('pointerdown');

        // 포인터 등록
        this.pointerMeasurers.push(this.generatePointerMeasurer(event));
        this.maxPointerNumber = Math.max(this.maxPointerNumber,this.pointerMeasurers.length);

        this.setEvent(event);


        /**
         * @event CustomPointerEventHandler#custompointerdown
         */
        this.target.dispatchEvent((new CustomEvent('custompointerdown', this.options(event))));

        this.listener.addEventListener('pointermove',this.cbPointermove);
        this.listener.addEventListener('pointerup',this.cbPointerup);
        this.listener.addEventListener('pointercancel',this.cbPointercancel);
    }

    /**
     * pointermove 이벤트 등록용 화살표 함수
     * @function
     * @param {Event} event
     * @returns {function(event):void}
     */
    cbPointermove = (event) =>{
        return this.pointermove(event)
    }
    /**
     * pointermove 이벤트 처리 메소드
     * @param {Event} event 
     * @fires CustomPointerEventHandler#custompointermove
     */
    pointermove(event){
        this.printDebug('pointermove');

        // 포인터 갱신
        let pointerIdx = this.indexOfpointerMeasurers(event);
        let pointer = (pointerIdx > -1)?this.pointerMeasurers[pointerIdx]:null;
        if(pointer){
            pointer.setEvent(event)
        }

        this.setEvent(event);
        /**
         * @event CustomPointerEventHandler#custompointermove
         */
        this.target.dispatchEvent((new CustomEvent('custompointermove', this.options(event))));
    }

    /**
     * pointerup 이벤트 등록용 화살표 함수
     * @function
     * @param {Event} event
     * @returns {function(event):void}
     */
    cbPointerup = (event) =>{
        return this.pointerup(event)
    }
    /**
     * pointerup 이벤트 처리 메소드
     * @param {Event} event 
     * @fires CustomPointerEventHandler#custompointerup
     */
    pointerup(event){
        this.printDebug('pointerup');

        // 포인터 갱신
        let pointerIdx = this.indexOfpointerMeasurers(event);
        let pointer = (pointerIdx > -1)?this.pointerMeasurers[pointerIdx]:null;
        if(pointer){
            pointer.setEvent(event)
        }

        this.setEvent(event);

        this.target.dispatchEvent((new CustomEvent('custompointerup', this.options(event))));

        // 포인터 삭제
        // let pointerIdx = this.indexOfpointerMeasurers(event);
        if(pointerIdx >= 0) this.pointerMeasurers.splice(pointerIdx, 1);

        if(event.isPrimary){ // 기본포인터인 경우만 
            this.distanceX = null;
            this.distanceY = null;
            this.distance = null;
            this.distanceDeltaX = null;
            this.distanceDeltaY = null;
            this.distanceDelta = null;
        }

        if(this.pointerMeasurers.length < 2 ){
            this.distanceBetween = null;
            this.distanceBetweenDelta = null;
            this.angleBetween = null;
            this.angleBetweenDelta = null;
        }

        if(this.pointerMeasurers.length === 0){
            this.reset();
            window.removeEventListener('pointermove',this.cbPointermove);
            window.removeEventListener('pointerup',this.cbPointerup);
            window.removeEventListener('pointercancel',this.cbPointercancel);
        }

        

    }

    /**
     * pointercancel 이벤트 등록용 화살표 함수
     * @function
     * @param {Event} event
     * @returns {function(event):void}
     */
    cbPointercancel = (event) =>{
        return this.pointercancel(event)
    }
    /**
     * pointercancel 이벤트 처리 메소드
     * @param {Event} event 
     * @fires CustomPointerEventHandler#custompointercancel
     */
    pointercancel(event){
        this.printDebug('pointercancel');

        // 포인터 갱신
        let pointerIdx = this.indexOfpointerMeasurers(event);
        let pointer = (pointerIdx > -1)?this.pointerMeasurers[pointerIdx]:null;
        if(pointer){
            pointer.setEvent(event)
        }

        this.setEvent(event);
        /**
         * @event CustomPointerEventHandler#custompointercancel
         */
        this.target.dispatchEvent((new CustomEvent('custompointercancel', this.options(event))));

        // 포인터 삭제
        // let pointerIdx = this.indexOfpointerMeasurers(event);
        if(pointerIdx >= 0) this.pointerMeasurers.splice(pointerIdx, 1);

        if(event.isPrimary){ // 기본포인터인 경우만 
            this.distanceX = null;
            this.distanceY = null;
            this.distance = null;
            this.distanceDeltaX = null;
            this.distanceDeltaY = null;
            this.distanceDelta = null;
        }

        if(this.pointerMeasurers.length < 2 ){
            this.distanceBetween = null;
            this.distanceBetweenDelta = null;
            this.angleBetween = null;
            this.angleBetweenDelta = null;
        }

        if(this.pointerMeasurers.length === 0){
            this.reset();
            window.removeEventListener('pointermove',this.cbPointermove);
            window.removeEventListener('pointerup',this.cbPointerup);
            window.removeEventListener('pointercancel',this.cbPointercancel);
        }
        
    }
    
}