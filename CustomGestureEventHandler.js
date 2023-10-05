"use strict";
/**
 * CustomPointerEventHandler 의 이벤트 기반으로 gesture 를 구현
 * @class
 */
class CustomGestureEventHandler{
    /**
     * 싱글톤 객체
     * @type {(CustomGestureEventHandler|null)}
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
    activated = false; //동작

    /**
     * 이벤트 리스너 대상
     * @type {Window|HTMLElement|null}
     */
    listener = null;
    /**
     * 최초 이벤트 발생 요소 (custompointerdown 에서 event.target)
     * @type {Window|HTMLElement|null}
     */
    target = null;

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


    // tab
    /**
     * 마지막 tab 발생 timeStamp
     * @type {(number|null)}
     */
    static tabLastTimeStamp = null;
    /**
     * tab 발생 timeout (ms)
     * @type {number}
     */
    tabTimeout = 100; //0.1 sec

    // doubleTab
    /**
     * doubleTab 발생 조건 < timeout (ms)
     * @type {number}
     */
    doubleTabTimeout = 500; //0.5 sec 

    // longPress
    /**
     * longPress 발생 조건 > timeout (ms)
     * @type {number}
     */
    longPressTimeout = 500; //0.5 sec. for Long press

    // swipe 
    /**
     * swipe 발생 조건 > 가속도 (px/ms)
     * @type {number}
     */
    swipeSpeedThreshold = 0.3; // px / ms
    /**
     * swipe 발생 조건 > 이동거리 (px)
     * @type {number}
     */
    swipeDistanceThreshold = 100; // px

    // pinch/zoom
    /**
     * pinch/zoom 발생 조건 > 이동거리 (px)
     * @type {number}
     */
    pinchZoomDistanceBetweenDeltaThreshold = 0.1; //0.1px // for pinch/zoom
    
    // rotate
    /**
     * rotate 발생 조건 > 회전 (rad)
     * @type {number}
     */
    rotateAngleBetweenDeltaThreshold = 0; //0.0001rad // for rotate


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
        instance.addEventListener(globalThis.window);
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
     * @listens CustomPointerEventHandler#custompointerdown
     */
    addEventListener(listener){
        if(this.activated){ console.warn('already activated'); }
        this.listener = listener
        this.activated = true;
        this.listener.addEventListener('custompointerdown',this.cbCustompointerdown);
    }

    /**
     * listener 에 removeEventListener
     */
    removeEventListener(){
        if(!this.activated){ console.warn('not activated'); }
        this.activated = false;
        this.listener.removeEventListener('custompointerdown',this.cbCustompointerdown);
    }

    /**
     * customevent option 부 생성
     * @param {Event} event 
     * @param {(String|null)} message 현재 사용안함 
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
    /**
     * customevent option.detail 부 생성
     * @param {Event} event 
     * @param {(String|null)} message 현재 사용안함
     * @returns {Object}
     */
    detail(event,message){
        const detail = Object.assign(event.detail);
        detail.message = message??'';
        return detail;

    }

    /**
     * customointerdown 이벤트 등록 용 화살표 함수
     * @param {Event} event 
     * @returns {Function}
     */
    cbCustompointerdown = (event) =>{
        return this.custompointerdown(event)
    }
    /**
     * customointerdown 이벤트 처리 메소드
     * @param {Event} event 
     * @listens CustomPointerEventHandler#custompointermove
     * @listens CustomPointerEventHandler#custompointerup
     * @listens CustomPointerEventHandler#custompointercancel
     */
    custompointerdown(event){
        this.printDebug('customointerdown');
               
        if(event.detail.isPrimary){ // 기본포인터인 경우만 
            this.target = event.target;
        }

        window.addEventListener('custompointermove',this.cbCustompointermove);
        window.addEventListener('custompointerup',this.cbCustompointerup);
        window.addEventListener('custompointercancel',this.cbCustompointercancel);
    }

    /**
     * custompointermove 이벤트 등록 용 화살표 함수
     * @param {Event} event 
     * @returns {Function}
     */
    cbCustompointermove = (event) =>{
        return this.custompointermove(event)
    }

    /**
     * custompointermove 이벤트 처리 메소드
     * @param {Event} event 
     * @fires CustomGestureEventHandler#pinch
     * @fires CustomGestureEventHandler#zoom
     * @fires CustomGestureEventHandler#rotate
     */
    custompointermove(event){
        this.printDebug('custompointermove');

        if(event.detail.pointerNumber >= 2){
            //----- pinch/zoom
            if(Math.abs(event.detail.distanceBetweenDelta) >= this.pinchZoomDistanceBetweenDeltaThreshold ){
                if(event.detail.distanceBetweenDelta < 0){
                    /**
                     * 확대 이벤트
                     * @event CustomGestureEventHandler#pinch
                     */
                    this.target.dispatchEvent((new CustomEvent('pinch', this.options(event))));
                }else{
                    /**
                     * 줌 이벤트
                     * @event CustomGestureEventHandler#zoom
                     */
                    this.target.dispatchEvent((new CustomEvent('zoom', this.options(event))));
                }
            }
    
            //----- rotate
            /**
             * 회전 이벤트
             * @event CustomGestureEventHandler#rotate
             */
            if(Math.abs(event.detail.angleBetweenDelta) >= this.rotateAngleBetweenDeltaThreshold ){
                this.target.dispatchEvent((new CustomEvent('rotate', this.options(event))));
            }
        }
    }

    /**
     * custompointerup 이벤트 등록 용 화살표 함수
     * @param {Event} event 
     * @returns {Function}
     */
    cbCustompointerup = (event) =>{
        return this.custompointerup(event)
    }
    /**
     * custompointerup 이벤트 처리 메소드
     * @param {Event} event 
     * @fires CustomGestureEventHandler#tab
     * @fires CustomGestureEventHandler#longpress
     * @fires CustomGestureEventHandler#doubletab
     * @fires CustomGestureEventHandler#swipeleft
     * @fires CustomGestureEventHandler#swiperight
     * @fires CustomGestureEventHandler#swipeup
     * @fires CustomGestureEventHandler#swipedown
     */
    custompointerup(event){
        this.printDebug('custompointerup');


        //---- tab
        if(event.detail.isPrimary){
            let activeDoubleTab = false;
            if(this.constructor.tabLastTimeStamp && Date.now() - this.constructor.tabLastTimeStamp < this.doubleTabTimeout){
                activeDoubleTab = true;
            }

            if(event.detail.duration < this.tabTimeout){
                /**
                 * 탭 이벤트
                 * @event CustomGestureEventHandler#tab
                 */
                this.target.dispatchEvent((new CustomEvent('tab', this.options(event))));
                this.constructor.tabLastTimeStamp = Date.now();
            }else if(event.detail.duration > this.longPressTimeout){
                /**
                 * 롱 프레스 이벤트
                 * @event CustomGestureEventHandler#longpress
                 */
                this.target.dispatchEvent((new CustomEvent('longpress', this.options(event))));
                this.constructor.tabLastTimeStamp = null;
            }


            if(activeDoubleTab){
                /**
                 * 더블탭 이벤트
                 * @event CustomGestureEventHandler#doubletab
                 */
                this.target.dispatchEvent((new CustomEvent('doubletab', this.options(event))));
                this.constructor.tabLastTimeStamp = null;
            }

            //----- swipe
            let absX = Math.abs(event.detail.distanceX);
            let absY = Math.abs(event.detail.distanceY);
            if(absX >= absY && absX >= this.swipeDistanceThreshold && event.detail.speedX >= this.swipeSpeedThreshold ){
                if(event.detail.distanceX < 0){
                    /**
                     * 스와이프 왼쪽 이벤트
                     * @event CustomGestureEventHandler#swipeleft
                     */
                    this.target.dispatchEvent((new CustomEvent('swipeleft', this.options(event))));
                }else{
                    /**
                     * 스와이프 오른쪽 이벤트
                     * @event CustomGestureEventHandler#swiperight
                     */
                    this.target.dispatchEvent((new CustomEvent('swiperight', this.options(event))));
                }
            }else if(absY >= this.swipeDistanceThreshold && event.detail.speedY >= this.swipeSpeedThreshold){
                if(event.detail.distanceY < 0){
                    /**
                     * 스와이프 위 이벤트
                     * @event CustomGestureEventHandler#swipeup
                     */
                    this.target.dispatchEvent((new CustomEvent('swipeup', this.options(event))));
                }else{
                    /**
                     * 스와이프 아래 이벤트
                     * @event CustomGestureEventHandler#swipedown
                     */
                    this.target.dispatchEvent((new CustomEvent('swipedown', this.options(event))));
                }
            }
        }

        window.removeEventListener('custompointermove',this.cbCustompointermove);
        window.removeEventListener('custompointerup',this.cbCustompointerup);
        window.removeEventListener('custompointercancel',this.cbCustompointercancel);
    }

    /**
     * custompointercancel 이벤트 등록 용 화살표 함수
     * @param {Event} event 
     * @returns {method}
     */
    cbCustompointercancel = (event) =>{
        return this.custompointercancel(event)
    }
    /**
     * custompointercancel 이벤트 처리 메소드
     * @param {Event} event 
     */
    custompointercancel(event){
        this.printDebug('custompointercancel');

        window.removeEventListener('custompointermove',this.cbCustompointermove);
        window.removeEventListener('custompointerup',this.cbCustompointerup);
        window.removeEventListener('custompointercancel',this.cbCustompointercancel);
    }
    
}
