module.exports = class Popout {
    constructor( mask = {}, length = 0 ) {
        this.mask = mask;
        // 总数
        this.length = length;

        this.timeout = 300;
        this.transform3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix());

        // 初始化
        this.init()
    }

    init() {
        let node = document.createDocumentFragment();

        this.initEl();
        node.appendChild( this.el );

        this.initTip();
        node.appendChild( this.tipEl );

        this.initWarn();
        node.appendChild( this.warnEl );

        this.mask.append && this.mask.append.constructor === Function && this.mask.append( node );

        this.focus()
        // 初始化事件
        // 监听当前是第几张，以及提示是否有下一张
        this.watch()
    }

    initEl() {
        // 图片盒子
        this.className = '';
        this.cssText = `
            display: flex;
            flex-wrap: no-wrap;
            width: ${ this.length * 100 }%;
            height: 100%;
            transition: transform ${ this.timeout }ms ease-out;
        `;
        this.el = document.createElement( 'div' );
        this.el.className = this.className;
        this.el.style.cssText = this.cssText;
    }

    initTip() {
        // 提示 1/10 第一张 最后一张
        this.tipClassName = '';
        this.tipCssText = `
            z-index: 9;
            position: absolute;
            left: 50%;
            bottom: 50px;
            width: 50px;
            transform: translate(-50%, 0);
            text-align: center;
            color: #fff;
        `;
        this.tipEl = document.createElement( 'div' );
        this.tipEl.className = this.tipClassName;
        this.tipEl.style.cssText = this.tipCssText;
    }

    initWarn() {
        // 警告已经第一张或最后一张
        this.warnClassName = '';
        this.warnCssText = `
            z-index: 9;
            position: absolute;
            left: 50%;
            bottom: 20px;
            width: 200px;
            visibility: hidden;
            transform: translate(-50%, 0);
            transition: visibility ${ this.timeout }ms ease;
            text-align: center;
            color: #fff;
        `
        this.warnEl = document.createElement( 'div' );
        this.warnEl.className = this.warnClassName;
        this.warnEl.style.cssText = this.warnCssText;
    }

    // 聚焦到应该显示的图片
    focus() {
        this.el.style.setProperty(
            'transform',
            `${ this.getTranslate( window.innerWidth * -(this.current - 1), 0 ) }`
        )
        setTimeout( () => {
            this.tipEl.innerText = `${ this.current }/${ this.length }`
        }, this.timeout )
    }

    // 移动幕布
    getTranslate( x, y ) {
        return this.transform3d ?
            'translate3d(' + x + 'px, ' + y + 'px, 0)' :
            'translate(' + x + 'px, ' + y + 'px)'
    }

    prev() {
        --this.current
    }

    next() {
        ++this.current
    }

    watch() {
        let current = 1;
        // 翻页时判断是否到头或结尾，给提示
        Object.defineProperty( this, 'current', {
            enumerable : true,
            configurable : true,
            get() {
                return current;
            },
            set( v ) {
                (v < 1 || v > this.length) && (this.noMore());
                current = v < 1 ?
                    1 :
                    v > this.length ?
                        this.length :
                        v;
                this.focus();
            }
        } )
    }

    // 划到最前提示第一张
    noMore() {
        if( this.current <= 1 ) {
            this.warnEl.innerText = '已经是第一张';
        } else if( this.current >= this.length ) {
            this.warnEl.innerText = '已经是最后一张'
        }
        this.warn()
    }

    warn() {
        this.warnEl.style.setProperty( 'visibility', 'visible' )
        setTimeout( () => {
            this.warnEl.style.setProperty( 'visibility', 'hidden' )
        }, this.timeout )
    }

    append( node ) {
        this.el.appendChild( node )
    }
}
