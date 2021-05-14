// 被可点击的图片触发后，控制隐藏显示
module.exports = class Mask {
    constructor() {
        this.init();
    }

    init() {
        // 预设插件mask
        this.className = '';
        this.cssText = `
            z-index: 999;
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #000;
        `;
        this.el = document.createElement( 'div' );
        this.el.className = this.className;
        // 初始样式
        this.el.style.cssText = this.cssText;
        // 禁止页面滚动
        this.el.addEventListener( 'touchmove', this.eventStop.bind( this ), false )
        this.el.addEventListener( 'click', this.hide.bind( this ), false )
        this.el.setAttribute( 'hidden', true )
        document.body.appendChild( this.el )
    }

    eventStop( e ) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 显示
    show( index = 0 ) {
        this.el.removeAttribute( 'hidden' )
    }

    // 隐藏
    hide() {
        this.el.setAttribute( 'hidden', true )
    }

    append( node ) {
        this.el.appendChild( node )
    }
}
