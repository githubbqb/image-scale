const Mask = require( './mask.js' );
const Popout = require( './popout.js' );
const Touch = require( './touch.js' );

class ImagesWidget {
    constructor( selector = '.preview-table-img' ) {
        let mask = new Mask();

        let elList = document.querySelectorAll( selector );
        if( !elList.length ) throw '未找到可供操作的图片，selector:' + selector;

        let popout = new Popout( mask, elList.length );

        [].map.call( elList, ( v, k ) => {
            new Touch( popout, v );
            v.addEventListener( 'click', function () {
                popout.current = k + 1
                mask.show()
            } )
        } )
    }
}

module.exports = ImagesWidget;
