"use strict";
/**
 * 제스쳐 이벤트 에뮬레이팅
 */
class CustomGestureEvent extends CustomPointerEvent{
    // longPress
    static longPressTimeout = 500; //0.5 sec. for Long press
    static longPressCancelThreshold = 10; //100px
    static longPressTimeoutTm = null; //

    static distanceThreshold = 0.1; //0.1px // for pinch/zoom
    static rotateThreshold = 0; //0.0001rad // for rotate



    // static options(event){
    //     return { 
    //         bubbles:this.bubbles, 
    //         cancelable:this.cancelable, 
    //         composed:this.composed,
    //         detail:this.detail(event),
    //     }
    // }
    // static detail(event){
    //     return {
    //         target:this.target,
    //         moveX:this.moveX,
    //         moveY:this.moveY,
    //         pressedTime:this.pressedTime,
    //         event:event, // original event
    //     }
    // }

    static cbPointerdown = (event) =>{
        return this.pointerdown(event)
    }
    static pointerdown = (event)=>{
        super.pointerdown(event);


        this.longPressTimeoutTm = setTimeout(() => {
            this.target.dispatchEvent((new this('longpress', this.options(event))));
        }, this.longPressTimeout);
    }
    static cbPointermove = (event) =>{
        return this.pointermove(event)
    }
    static pointermove = (event)=>{
        super.pointermove(event);

        if(this.longPressTimeoutTm && this.longPressCancelThreshold <= (this.moveX + this.moveY)){
            clearTimeout(this.longPressTimeoutTm);
            this.longPressTimeoutTm = null;
        }

        if(this.distanceDelta){
            if(Math.abs(this.distanceDelta) >= this.distanceThreshold){
                if(this.distanceDelta < 0){
                    this.target.dispatchEvent((new this('pinch', this.options(event))));
                }else if(this.distanceDelta > 0){
                    this.target.dispatchEvent((new this('zoom', this.options(event))));
                }
            }
            this.target.dispatchEvent((new this('pinchzoom', this.options(event))));
        }

        if(this.rotateDelta){
            if(Math.abs(this.rotateDelta) >= this.rotateThreshold){
                this.target.dispatchEvent((new this('rotate', this.options(event))));
            }
        }
    }
    static cbPointerup = (event) =>{
        return this.pointerup(event)
    }
    static pointerup = (event)=>{
        super.pointerup(event);
        

        if(this.longPressTimeoutTm){
            clearTimeout(this.longPressTimeoutTm); 
            this.longPressTimeoutTm = null;
        }

        if(this.moveX < 0){
            this.target.dispatchEvent((new this('swipeleft', this.options(event))));
        }else if(this.moveX > 0){
            this.target.dispatchEvent((new this('swiperight', this.options(event))));
        }
        if(this.moveY < 0){
            this.target.dispatchEvent((new this('swipeup', this.options(event))));
        }else if(this.moveY > 0){
            this.target.dispatchEvent((new this('swipedown', this.options(event))));
        }

        // event type swipe 는 custompointerup 과 거의 같다. moveX와 moveY가 0일 때 트리거 안하는 것만 차이 있다.
        if(this.moveX || this.moveY){
            this.target.dispatchEvent((new this('swipe', this.options(event))));
        }
    }


    /**
     * 
     */
    constructor(typeArg,options,detail){
        super(typeArg,options);
    }
}