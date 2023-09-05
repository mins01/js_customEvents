"use strict";
/**
 * 제스쳐 이벤트 에뮬레이팅
 */
class CustomGestureEvent extends CustomPointerEvent{
    // longPress
    static longPressTimeout = 500; //0.5 sec. for Long press
    static longPressCancelThreshold = 10; //100px
    static longPressTimeoutTm = null; //

    // swipe 
    static swipeVelocityThreshold = 300; // px / sec
    static swipeDistanceThreshold = 100; // px

    // pinch/zoom
    static pinchZoomDistanceBetweenDeltaThreshold = 0.1; //0.1px // for pinch/zoom
    static rotateAngleBetweenThreshold = 0; //0.0001rad // for rotate

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

        if(this.longPressTimeoutTm && this.longPressCancelThreshold <= (Math.abs(this.moveX) + Math.abs(this.moveY))){
            clearTimeout(this.longPressTimeoutTm);
            this.longPressTimeoutTm = null;
            this.target.dispatchEvent((new this('longpresscancel', this.options(event,'move => longPressCancelThreshold'))));

        }

        if(this.distanceBetweenDelta){
            if(Math.abs(this.distanceBetweenDelta) >= this.pinchZoomDistanceBetweenDeltaThreshold){
                if(this.distanceBetweenDelta < 0){
                    this.target.dispatchEvent((new this('pinch', this.options(event))));
                }else if(this.distanceBetweenDelta > 0){
                    this.target.dispatchEvent((new this('zoom', this.options(event))));
                }
            }
            this.target.dispatchEvent((new this('pinchzoom', this.options(event))));
        }

        if(this.angleBetweenDelta){
            if(Math.abs(this.angleBetweenDelta) >= this.rotateAngleBetweenThreshold){
                this.target.dispatchEvent((new this('rotate', this.options(event))));
            }
        }
    }
    static cbPointerup = (event) =>{
        return this.pointerup(event)
    }
    static pointerup = (event)=>{

        if(this.longPressTimeoutTm){
            clearTimeout(this.longPressTimeoutTm); 
            this.longPressTimeoutTm = null;
        }

        if(this.moveDeltaX < 0){
            if(this.velocityX < this.swipeVelocityThreshold){
                this.target.dispatchEvent((new this('swipeleftcancel', this.options(event,'velocityX < swipeVelocityThreshold'))));
            }else{
                this.target.dispatchEvent((new this('swipeleft', this.options(event))));
            }
            
        }else if(this.moveDeltaX > 0){
            if(this.velocityX < this.swipeVelocityThreshold){
                this.target.dispatchEvent((new this('swiperightcancel', this.options(event,'velocityX < swipeVelocityThreshold'))));
            }else{
                this.target.dispatchEvent((new this('swiperight', this.options(event))));
            }
        }
        if(this.moveDeltaY < 0){
            if(this.velocityY < this.swipeVelocityThreshold){
                this.target.dispatchEvent((new this('swipeupcancel', this.options(event,'velocityY < swipeVelocityThreshold'))));
            }else{
                this.target.dispatchEvent((new this('swipeup', this.options(event))));
            }
        }else if(this.moveDeltaY > 0){
            if(this.velocityY < this.swipeVelocityThreshold){
                this.target.dispatchEvent((new this('swipedowncancel', this.options(event,'velocityY < swipeVelocityThreshold'))));
            }else{
                this.target.dispatchEvent((new this('swipedown', this.options(event))));
            }
        }

        // event type swipe 는 custompointerup 과 거의 같다. moveX와 moveY가 0일 때 트리거 안하는 것만 차이 있다.
        if(this.moveDistanceDelta){
            if(this.moveDistance < this.swipeDistanceThreshold){
                this.target.dispatchEvent((new this('swipecancel', this.options(event,'moveDistance < swipeDistanceThreshold'))));
            }else if(this.velocity < this.swipeVelocityThreshold){
                this.target.dispatchEvent((new this('swipecancel', this.options(event,'velocity < swipeVelocityThreshold'))));
            }else{
                this.target.dispatchEvent((new this('swipe', this.options(event))));
            }
        }
        super.pointerup(event);
    }


    /**
     * 
     */
    constructor(typeArg,options){
        super(typeArg,options);
    }
}