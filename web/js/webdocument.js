
function paintCanvasMessage(canvas) {
    var ctx = canvas.getContext('2d');

    var pattern = document.createElement('canvas');
    pattern.width = 20;
    pattern.height = 20;
    var pctx = pattern.getContext('2d');
    pctx.fillStyle = "#ccc";
    pctx.fillRect(0,0,10,10);
    pctx.fillRect(10,10,10,10);
    pattern = ctx.createPattern(pattern, "repeat");

    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = 'black';
    ctx.fillText('Displaying the content of the canvas is not supported', 10, canvas.height / 2);
}

function addEmbedBlockedMessage(node) {
    if(!node || !node.parentNode || /EMBED|OBJECT/.test(node.parentNode.tagName)) {
        return;
    }
    var computedStyle = window.getComputedStyle(node);

    var width = node.hasAttribute("width") ? node.getAttribute("width")+"px" : computedStyle.width;
    var height = node.hasAttribute("height") ? node.getAttribute("height")+"px" : computedStyle.height;

    var errorMsg = $("<div/>").css({
        'background-color': '#269',
        'background-image': 'linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), ' +
                            'linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)',
        'background-size': '20px 20px, 20px 20px',
        'text-align': "center",
        'overflow': "hidden",
        'font-size': "18px",
        'display': "block",
        'font-family': 'sans-serif',
        'color': 'white',
        'text-shadow': '1px black',
        'width': width,
        'height': height,
        'lineHeight': height
    }).text("Portia doesn't support browser plugins.");
    node.style.display = "none";
    node.parentNode.insertBefore(errorMsg[0], node);
}

var WebDocument = {
	iframeId: 'scraped-doc-iframe',
    loading: false, // Whatever a page is being loaded at the moment
    currentUrl: "", // Current URL
    currentFp: "",  // Hash of the url.
    
    loader: null,

    init: function() {
    },
    
    getIframeNode: function() {
        return $('#' + this.iframeId)[0];
    },
    
    iframeSize: function(){
        var iframe_window = this.getIframeNode().contentWindow;
        if (iframe_window) {
            return iframe_window.innerWidth + 'x' + iframe_window.innerHeight;
        }
        return null;
    },

    /**
     * Loads and displays a url interactively
     * Can only be called in "browse" mode.
     */
    loadUrl: function(url,id) {
        this.loading = true;
        this.showLoading();
        $.ajax({
            url: '/page',
            type: 'get',
            data:{url:url},
            error: function(e){
            },
            success: function(data){
                try {
                    data = JSON.parse(data);
                } catch (err) {
                    console.warn('Error parsing data returned by server: ' + err + '\n' + data);
                    return;
                }
                var action = data[0];
                var args = data.slice(1);
                if(action === 'initialize') {
                    this.iframePromise = this.clearIframe(id).then(function(){
                    	this.loaded();
                        var doc = this.getIframeNode().contentWindow.document;
                        this.treeMirror = new TreeMirror(doc, treeMirrorDelegate(this));
                        this.treeMirror["initialize"].apply(this.treeMirror, args);

                    }.bind(this));
                }

            }.bind(this)

        });

    },
    
    rotate: function(){
    	var _self = this;
    	if(_self.loading){
    		_self.loader.animate({rotate: '360'}, 2000, 'linear', function() {
    			if(_self.loading){
    				_self.rotate();
    			}
    		});
    	}
    },
    
    loaded: function(){
    	this.hideLoading();
    },

    /**
    Displays a loading widget on top of the iframe. It should be removed
    by calling hideLoading.
	*/
	showLoading: function() {
	    var loader = this.loader;
	    if (!loader) {
	    	loader = $('span.fa-repeat');
	        this.loader = loader;
	    }
	    loader.removeClass("fa-repeat");
	    loader.addClass("fa-spin fa-refresh");
	    $('#urlInput').attr("disabled","true");
	    $('#annotationButton').attr("disabled","true");
		$('#refreshButton').attr("disabled","true");
		this.rotate();
	},

	/**
	    Hides the loading widget displayed by a previous call to showLoading.
	*/
	hideLoading: function() {
		this.loading = false;
		$('#urlInput').removeAttr("disabled");
		$('#refreshButton').removeAttr("disabled");
		$('#annotationButton').removeAttr("disabled");
		$('#annotationButton').removeAttr("disabled");
		$('.masking').hide()
        $('.masking_image').hide()

	},

    clearIframe: function(id) {
        var defer = $.Deferred();
        var iframe = this.getIframeNode();
        // Using a empty static page because using srcdoc or an data:uri gives
        // permission problems and/or broken baseURI behaviour in different browsers.
        iframe.setAttribute('src', '/static/empty-frame.html?' + id);
        iframe.removeAttribute('srcdoc');
        // Using a message to workaround onload bug on some browsers (cough IE cough).
        var $win = $(window).bind('message', function onMessage(e){
            if(e.originalEvent.data.frameReady === id){
                $win.unbind('message', onMessage);
                defer.resolve();
            }
        });
        return defer.promise();
    },

    saveCookies: function(cookies){
        this.cookies = cookies._data;
        if(window.sessionStorage){
            window.sessionStorage.portia_cookies = JSON.stringify(cookies);
        }
    },

    loadCookies: function(){
        if(window.sessionStorage && sessionStorage.portia_cookies){
            this.cookies = JSON.parse(sessionStorage.portia_cookies);
        }
    }
};
