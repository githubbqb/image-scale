// mask显示时的当前图片
module.exports = class Touch {
    constructor( popout = {}, img ) {
        this.popout = popout;
        this.img = img;

        this.transform3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix());

        this.init();
    }

    init() {
        this.init_content();
        this.init_el();
        this.content.appendChild( this.el );
        this.popout.append( this.content );

        this.reset();
    }

    init_content() {
        // 初始化盒子
        this.contentClassName = '';
        this.contentCssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            height: 100%;
            flex: 1 1 0%;
            background: transparent;
        `;
        this.content = document.createElement( 'div' );
        this.content.className = this.contentClassName;
        this.content.style.cssText = this.contentCssText;
        this.content.addEventListener( 'touchstart', this.touchstart.bind( this ), false )
        this.content.addEventListener( 'touchmove', this.touchmove.bind( this ), false )
        this.content.addEventListener( 'touchend', this.touchend.bind( this ), false )
        this.content.addEventListener( 'click', this.reset.bind( this ), false )
    }

    init_el() {
        // 初始化图片
        this.className = '';
        this.cssText = '';
        this.el = new Image();
        let dataSrc = this.img.getAttribute( 'data-src' );
        let src = this.img.getAttribute( 'src' );
        this.el.src = dataSrc ? dataSrc : src;
        this.el.className = this.className;
        this.el.style.cssText = this.cssText;
        this.el.addEventListener( 'load', this.el_load.bind( this ) )
    }

    el_load() {
        // 宽图片，长图片设置样式
        let width = this.el.offsetWidth;
        let height = this.el.offsetHeight;
        let eP = width / height;
        let wP = window.innerWidth / window.innerHeight;
        if( eP < wP ) {
            this.el.style.setProperty( 'width', 'auto' )
            this.el.style.setProperty( 'height', '100%' )
        } else {
            this.el.style.setProperty( 'width', '100%' )
            this.el.style.setProperty( 'height', 'auto' )
        }
    }

    reset() {
        this.touches = []; // touches
        // 每次缩放或移动后需要保存结果，下次重新计算
        this.baseData = {
            dist : 1,// start获取到的触点间距，给move参考
            scale : 1,
            translate : {
                x : 0,
                y : 0
            },
            origin : {
                x : window.innerWidth / 2,
                y : window.innerHeight / 2
            },
            border : {
                top : true,
                right : true,
                bottom : true,
                left : true
            }
        }; // 基础值
        this.transformData = {
            dist : 1,
            scale : 1,
            translate : {
                x : 0,
                y : 0
            },
            border : {
                top : 0,
                right : 0,
                bottom : 0,
                left : 0
            }
        }; // 实时值（下次touch的基础值）
        this.finger = false; // 触摸手指的状态 false：单手指 true：多手指
        this.border = true; // 是否到了边界
        this.content.style.removeProperty( 'transform' )
        this.content.style.removeProperty( 'transform-origin' )
    }

    touchstart( e ) {
        // e.preventDefault();
        e.stopPropagation();

        this.getTouches( e );
        // 双指缩放，单指移动
        if( this.touches.length > 1 ) {
            this.finger = true;
            let start = this.touches[ 0 ];
            let end = this.touches[ 1 ]
            this.baseData.dist = this.getDist( start, end );
            this.baseData.origin.x = (start.pageX + end.pageX) / 2;
            this.baseData.origin.y = (start.pageY + end.pageY) / 2;
            // this.setOrigin()
        } else {
            this.finger = false;
            this.start = this.touches[ 0 ];
        }
    }

    touchmove( e ) {
        e.preventDefault();
        e.stopPropagation();

        this.getTouches( e );
        // 每次缩放、移动都是再上一次操作的基础上变化
        // 缩放计算move和start两指之间的距离比值
        // 移动计算move和start两点之间的横纵差值
        if( this.touches.length > 1 && this.finger ) {
            let start = this.touches[ 0 ];
            let end = this.touches[ 1 ];
            this.transformData.dist = this.getDist( start, end );
            this.transformData.scale = this.baseData.scale * this.transformData.dist / this.baseData.dist;
            this.setScale( this.transformData.scale )
        } else if( !this.finger ) {
            let end = this.touches[ 0 ];
            this.transformData.translate.x = end.pageX - this.start.pageX + this.baseData.translate.x;
            this.transformData.translate.y = end.pageY - this.start.pageY + this.baseData.translate.y;
            this.setTranslate( this.transformData.translate.x, this.transformData.translate.y )
        }
    }

    touchend( e ) {
        // e.preventDefault();
        e.stopPropagation();
        this.regScale();
        this.regBorder();
        // if( this.finger ) {
        this.setScale( this.baseData.scale )
        // } else {
        this.setTranslate( this.baseData.translate.x, this.baseData.translate.y )
        // }
    }

    getTouches( e = {} ) {
        // 筛选有用的值
        this.touches = [].map.call( e.touches, v => {
            return {
                identifier : v.identifier,
                pageX : v.pageX,
                pageY : v.pageY
            }
        } )
    }

    setOrigin() {
        this.content.style.setProperty(
            'transform-origin',
            `${ this.baseData.origin.x }px ${ this.baseData.origin.y }px`
        );
    }

    getDist( start = {}, end = {} ) {
        // 计算两点的距离
        return Math.sqrt(
            Math.pow(
                Math.abs( start.pageX - end.pageX ), 2
            )
            +
            Math.pow(
                Math.abs( start.pageY - end.pageY ), 2
            )
        )
    }

    setScale( scale = 1 ) {
        this.content.style.setProperty(
            'transform',
            `scale(${ scale }) ${ this.getTranslate( this.baseData.translate.x, this.baseData.translate.y ) }`
        );
        this.getBorder()
    }

    regScale() {
        // 给缩放定义最大和最小缩放，超出无效
        this.baseData.scale =
            this.transformData.scale < 1 ? 1 :
                this.transformData.scale > 3 ? 3 :
                    this.transformData.scale;
    }

    getBorder() {
        // 获取溢出被隐藏的部分
        let ow = window.innerWidth * (this.baseData.scale - 1); // 横向溢出
        let oh = window.innerHeight * (this.baseData.scale - 1); // 纵向溢出
        // 计算origin位置的占比
        let xp = this.baseData.origin.x / window.innerWidth; // 横向占比
        let yp = this.baseData.origin.y / window.innerHeight; // 纵向占比
        // 溢出部分*占比就是方向上被隐藏的部分
        // top left 为负
        // bottom right 为正
        this.transformData.border.top = yp * -oh;
        this.transformData.border.right = (1 - xp) * ow;
        this.transformData.border.bottom = (1 - yp) * oh;
        this.transformData.border.left = xp * -ow;
    }

    regBorder() {
        // 获取偏移量
        let x = this.transformData.translate.x;
        let y = this.transformData.translate.y;
        // 获取可偏移量
        let t = this.transformData.border.top;
        let r = this.transformData.border.right;
        let b = this.transformData.border.bottom;
        let l = this.transformData.border.left;
        // 到达边界并再次越过边界，视为切换
        if( this.baseData.border.left && x > r ) {
            return this.prev()
        } else if( this.baseData.border.right && x < l ) {
            return this.next()
        }
        // 根据隐藏部分计算是否到达边界
        // 到达左边界的标志是 向右的偏移量 大于 向右的可偏移量
        this.baseData.border.top = this.transformData.border.bottom <= this.transformData.translate.y;
        this.baseData.border.right = this.transformData.border.left >= this.transformData.translate.x;
        this.baseData.border.bottom = this.transformData.border.top >= this.transformData.translate.y;
        this.baseData.border.left = this.transformData.border.right <= this.transformData.translate.x;
        // 溢出边界，重置到边界
        this.baseData.translate.x =
            x < l ? l :
                x > r ? r :
                    x;
        this.baseData.translate.y =
            y < t ? t :
                y > b ? b :
                    y;
    }

    setTranslate( x, y ) {
        this.content.style.setProperty(
            'transform',
            `${ this.getTranslate( x, y ) } scale(${ this.baseData.scale })`
        );
    }

    getTranslate( x, y ) {
        return this.transform3d ?
            `translate3d(${ x }px, ${ y }px, 0)` :
            `translate(${ x }px, ${ y }px)`;
    }

    prev() {
        try {
            this.popout.prev && this.popout.prev.constructor === Function && this.popout.prev()
        } catch ( e ) {
            console.log( e )
        }
        this.reset()
    }

    next() {
        try {
            this.popout.next && this.popout.next.constructor === Function && this.popout.next()
        } catch ( e ) {
            console.log( e )
        }
        this.reset()
    }
}
