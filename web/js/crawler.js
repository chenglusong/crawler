window.next_button_array = new Array();
var nextPage = false;
var nextPageButtonXpath=null;
var detailDateXPathArray=new Map();
var XPathArray=new Array();
var clickedContext=null;
var clickedLine = null;
var getData = false;
$(document).ready(function() {

	/*
	* author:chenglusong
	* time:2016-10-31 13:33:01
	* 设置工程的详细信息
	* */

	var saveDate = function () {
		if(clickedLine != null)
		{
			var lineName = clickedLine.find('.field-name').text()
			XPathArray.concat(detailDateXPathArray[lineName]);
			var tmpArray = XPathArray.slice();
            detailDateXPathArray.set(lineName,tmpArray);
			clickedLine.css('borderBottomStyle' ,'none')
            XPathArray.length = 0;
		}

	}

	var map2Json = function (map) {
		var resJson ={};

		detailDateXPathArray.forEach(function (value,key) {
			var tmp=''

			for(var i=0;i<value.length;i++ ){
				tmp = tmp + value[i].join('/')+';';
			}
			resJson[key]=tmp
		})


		return resJson
	}
	var setSelectArea = function () {
        	var sel = window.getSelection();
            		sel.modify('move','left','documentboundary');
		            sel.modify('extend','right','documentboundary');
    }
	var jj=0;
	$(".next-page-setting-icon").on('click',function (event) {
        var displayStyle = $('.next-page-choose').css('display')
		if(displayStyle =='none'){
            $('.next-page-choose').show();
		}else{
            $('.next-page-choose').hide();
		}

    })
	$('.click-next-page-icon').on('click',function (event) {
		nextPage = true
    })
	$(".spider-data").on("click",function(event){

		//点击保存按钮
		if(event.target.className == "saveImage")
		{
			//ToDo:将detailDateXPathArray传输到后台
			//detailDateXPathArray.clear();
			var t = XPathArray.slice();

			saveDate()
			XPathArray = t.slice();
			map2Json(detailDateXPathArray)
			getData = false;
			$.ajax({
				url: '/selected',
				type: 'get',
				data:{selected:JSON.stringify(map2Json(detailDateXPathArray))},
				error: function(e){
					console.log(e)
				},
				success: function(data) {
				}
			});

		}


		if(event.target.className == "settingImage"){
            jj = jj+1;
		    $(event.target).parent().append('<ul>' +
			'<li style=\'list-style-type:none;\'>' +
				'<i class=\'abcImage\'></i>' +
				'<div class=\'field-name\' contenteditable=\'true\'>数据'+jj+'</div>' +
				'<i class=\'setting-name-icon\'></i>'+

				'<i class=\'delete-data-icon\'></i>'+
				'<i class=\'click-icon\'></i>'+
			    '</li>' +
			'</ul>')
			$(event.target).parent().find('.field-name').last().focus()
            setSelectArea();
		}

		if(event.target.className == 'click-icon')
        {
			//先把之前的状态保存一下
			getData = false;
			$('.badge').html('0');
			$(".extracted-items").html("");

			if(clickedLine != null)
			{
                saveDate()

				//XPathArray.clear();
				clickedLine.css('borderBottomStyle' ,'none')
			}
			//添加一个字段
			//事件托管

			clickedLine= $(event.target.parentNode);

			clickedLine.css('borderBottomStyle' ,'groove')

        }
		if(event.target.className == 'setting-spidername-icon')
		{
			$(event.target).prev().attr('contenteditable','true');
			$(event.target).prev().focus();
			setSelectArea();
		}
		if(event.target.className == 'setting-name-icon')
		{
			$(event.target).prev().attr('contenteditable','true');
			$(event.target).prev().focus();
			setSelectArea();
		}
	});

    var ii=0;
	$(".add-icon").on("click",function (event) {
		ii = ii+1;
        $(".spider-data-field").append("<div class='data-formate-area>'" +
			"<div class='wordField'><i class='data-icon'></i>" +
			"<div class='fieldName' contentEditable='true'>提取的数据"+ii+"</div> " +
				"<i class='setting-spidername-icon'  title='设置'></i>"+
		"<i class='settingImage'  title='设置'></i> "+
		"<div class='saveImage'  title='保存'>" +
			"</div>" +
			"<div class='detailData'></div>" +
			"</div></div>");
        $('.spider-data-field').find('.fieldName').last().focus();
        setSelectArea();
	});
	var wd = $.createObject(WebDocument);

	var edited = false;

	$('#sUrlInput').bind('keypress', function(event) {
		if (event.keyCode == "13") {
            $('.masking').show()
            $('.masking_image').show()

			$("#side-bar").show();
			$("#tool-panels").show();

			var url = $('#sUrlInput').val();

			if (url && url.length > 0) {

				var index = url.indexOf("http://");
				if (index == -1) {
					index = url.indexOf("https://");
					if (index == -1) {
						url = "http://" + url;
					}
				}
				$('div.browser-start-page').addClass("hide");
				$('#urlInput').val(url);
				wd.loadUrl(url, shortGuid());
			}

			event.preventDefault();
		}

	});


	$('#urlInput').bind( {
		focus : function() {
			$("#refreshIcon").removeClass("fa-repeat");
			$("#refreshIcon").addClass("fa-arrow-right");
		},
		blur : function() {
			$("#refreshIcon").removeClass("fa-arrow-right");
			$("#refreshIcon").addClass("fa-repeat");
		}
	});

	$('#urlInput').bind('keypress', function(event) {
		if (event.keyCode == "13") {
			var url = $('#urlInput').val();
			if(url && url.length > 0){
                var index = url.indexOf("http://");
                if(index == -1){
                    index = url.indexOf("https://");
                    if(index == -1){
                        url = "http://"+url;
                    }
                }
                wd.loadUrl(url,shortGuid());
			}
			event.preventDefault();
		}
	});

	$('#refreshButton').bind('click',function(event){
		wd.loadUrl($('#urlInput').val(),shortGuid());
	});

	var sd = $.createObject(ScrapedDoc,{
		pageActions : [],
		listener: {
			documentActions : {}
		},
		mode : "select"
	});
	var k=1
	$("#annotationButton").on("click",function(){
		if(!edited){
            $(".next-page-setting").show();
			$(".setButtonStyle").show();
           	//将页面设置为灰度的
            $("iframe").css("-webkit-filter"," grayscale(100%) /* webkit */");
            $("iframe").css("-moz-filter"," grayscale(100%) /*firefox*/");
            $("iframe").css("-ms-filter","  grayscale(100%) /*ie9*/");
            $("iframe").css("-o-filter","  grayscale(100%) /*opera*/");
            $("iframe").css("filter","  grayscale(100%)");
			$("iframe").css("filter"," progid:DXImageTransform.Microsoft.BasicImage(grayscale=1)");
			$("iframe").css("filter"," gray /*ie9- */");
			$(".spider-data").show();



			var columnNameAddText =
				"<div><i class='spider-icon'></i>" +
				"<div style='display: inline-block' class='spider-name'  contentEditable='true' placeholder=''>我的爬虫"+k+"</div>" +
				"<i class='pencil-icon'></i>"+
				"<i class='minus-icon'></i>" +
                "<i class='setting-icon'></i>" +
				"</div>";

			//注册各种事件
			$('.spider-detail').on('click.event',function(event){
				// body...;
				if(event.target.className == 'setting-icon'){


				}
				if(event.target.className =='pencil-icon')
				{
					$(event.target).prev().attr('contenteditable','true');
					$(event.target).prev().focus();
					setSelectArea();
				}

			})
			$('.spider-detail').on('keydown.event',function (event) {
				if (event.target.className == 'spider-name'){
					if(event.keyCode == 13|| event.charCode == 13)
					{
						$('.spider-name').attr('contenteditable','false');
					}
				}

			})

			$('.spider-data-field').on('keydown.event',function (event) {
				if (event.target.className == 'fieldName'||event.target.className == 'field-name'){
					if(event.keyCode == 13|| event.charCode == 13)
					{
						$(event.target).attr('contenteditable','false');
					}
				}

			})


			k++;
			$(".spider-detail").append(columnNameAddText);
			$(".alert-message").hide();
			$(".spider-name").focus();
	        setSelectArea();
			$(".alert-message").hide();
			$('#urlInput').attr("disabled","true");
			$('#refreshButton').attr("disabled","true");
			edited = true;
			$('#abText').html('关闭操作');
			$('#abIcon').removeClass('portia-icon portia-icon-spider');
			$('#abIcon').addClass('fa fa-times');
			sd.installEventHandlersForSelecting();
			$("#stopCSS").on('click.Event',function (event) {});
			$("#thinkFunction").on('click.Event',function (event) {
				getData = true;
			});
			$("#addField").on('click.Event',function (event) {
				getData = true;

			});

		}else{
			$("#addField").unbind(".Event");
            $(".setButtonStyle").hide();
            $("iframe").css("-webkit-filter","");
            $("iframe").css("-moz-filter","");
            $("iframe").css("-ms-filter","");
            $("iframe").css("-o-filter","");
            $("iframe").css("filter","");


		    edited = false;
			$('#urlInput').removeAttr("disabled");
			$('#refreshButton').removeAttr("disabled");
			$('#abText').html('新建爬虫');
			$('#abIcon').removeClass('fa fa-times');
			$('#abIcon').addClass('portia-icon portia-icon-spider');
			sd.uninstallEventHandlers();
		}
	});
});

var SpriteStore = {
	    init: function(options) {
	        options = options || {};
	        var fillColor = options.fillColor || 'rgba(88,150,220,0.4)',
	            strokeColor = options.strokeColor || 'rgba(88,150,220,0.4)',
	            textColor = options.textColor || 'white';
	        this.fillColor = fillColor;
	        this.strokeColor = strokeColor;
	        this.textColor = textColor;
	        this._sprites = [];
	        this._ignores = [];
	        this._elements = [];
	    },

	    sprites: function() {
	        var arr = this._sprites.map(function(s) {
	            if (s.element) {
	            	return $.createObject(AnnotationSprite,{
	                    annotation: s,
	                    fillColor: s.fillColor,
	                    strokeColor: s.strokeColor,
	                    textColor: s.textColor
	                });
	            } else {
	                return null;
	            }
	        }).concat(this._ignores.map(function(s) {
	            if (s.element) {
	                return $.createObject(IgnoreSprite,{
	                    ignore: s,
	                    fillColor: s.fillColor,
	                    strokeColor: s.strokeColor,
	                    textColor: s.textColor
	                });
	            } else {
	                return null;
	            }
	        }));
	        return arr.filter(function(s) {
	            if (s) {
	                return true;
	            }
	        });
	    },

	    addSprite: function(element, text, options) {
	        var updated = false;
	        options = {};
	        this._sprites.forEach(function(sprite) {
	            if ($(sprite.element).get(0) === element) {
	                sprite.setProperties(options);
	                sprite.set('name', text);
	                updated = true;
	            }
	        });
	        if (updated) {
	            this.notifyPropertyChange('_sprites');
	        } else {
	            this._sprites.pushObject({
	                name: text,
	                element: element,
	                highlight: false,
	                fillColor: options.fillColor || this.fillColor,
	                strokeColor: options.strokeColor || this.strokeColor,
	                textColor: options.textColor || this.textColor
	            });
	        }
	    },

	    addIgnore: function(element, ignoreBeneath) {
	        var updated = false;
	        this._ignores.forEach(function(sprite) {
	            if ($(sprite.element).get(0) === element) {
	                sprite.set('ignoreBeneath', ignoreBeneath);
	                updated = true;
	            }
	        });
	        if (updated) {
	            this.notifyPropertyChange('_ignores');
	        } else {
	            this_ignores.pushObject({
	                element: element,
	                highlight: false,
	                ignoreBeneath: ignoreBeneath,
	                fillColor: this.fillColor,
	                strokeColor: this.strokeColor,
	                textColor: this.textColor
	            });
	        }
	    },

	    highlight: function(element) {
	        this._sprites.forEach(function(sprite) {
	            if (Ember.$(sprite.element).get(0) === element) {
	                sprite.set('highlighted', true);
	            }
	        });
	        this.notifyPropertyChange('_sprites');
	    },

	    removeHighlight: function(element) {
	        this._sprites.forEach(function(sprite) {
	            if ($(sprite.element).get(0) === element) {
	                sprite.set('highlighted', false);
	            }
	        });
	        this.notifyPropertyChange('_sprites');
	    },

	    removeSprite: function(element) {
	        this._sprites = this._sprites.filter(function(sprite) {
	            if (sprite.element !== element) {
	                return true;
	            }
	        });
	    },

	    removeIgnore: function(element) {
	        this._ignores = this._ignores.filter(function(ignore) {
	            if (ignore.element !== element) {
	                return true;
	            }
	        });
	    }
	};


	var Canvas = {

	    canvasId: null,

	    canvas: null,

	    context: null,

	    init: function() {
	        this.canvas = $('#' + this.canvasId).get(0);
	        this.context = this.canvas.getContext("2d");
	    },

	    /**
	        Clears the canvas.
	    */
	    clear: function() {
	        var canvas = this.canvas;
	        var context = this.context;
	        context.clearRect(0, 0, canvas.width, canvas.height);
	    },

	    /**
	        Draws the given sprites translating the context by (xOffset, yOffset)
	        to compensate for the iframe current scroll position.
	    */
	    draw: function(sprites, xOffset, yOffset) {
	        var canvas = this.canvas;
	        var context = this.context;

	        // Match intrinsic and extrinsic dimensions.
	        canvas.width = $(canvas).outerWidth();
	        canvas.height = $(canvas).outerHeight();

	        context.translate(-xOffset, -yOffset);
	        context.clearRect(0, 0, canvas.width, canvas.height);
	        var sortedSprites = sprites.sort(function(a, b) {
	            return a.get('zPosition') - b.get('zPosition');
	        });
	        sortedSprites.forEach(function(sprite) {
	            sprite.draw(context);
	        });
	    },

	    _interactionsBlocked: false,

	    /**
	        By default the canvas is configured to let all events pass through.
	        Set this attribute to true to block interactions with the underlaying
	        layers.
	    */
	    interactionsBlocked: function(key, interactionsBlocked) {
	        if (arguments.length > 1) {
	            this_interactionsBlocked = interactionsBlocked;
	            var canvas = $('#' + this.canvasId);
	            if (interactionsBlocked) {
	                canvas.css('pointer-events', 'auto');
	                canvas.css('background-color', 'rgba(0,0,30,0.2)');
	                canvas.css('background', '-webkit-radial-gradient(circle, rgba(0,0,0,0.0), rgba(0,0,0,0.6)');
	                canvas.css('background', '-moz-radial-gradient(circle, rgba(0,0,0,0.0), rgba(0,0,0,0.6)');
	            } else {
	                canvas.css('pointer-events', 'none');
	                canvas.css('background-color', 'rgba(0,0,0,0)');
	                canvas.css('background', 'rgba(0,0,0,0)');
	            }
	        } else {
	            return this._interactionsBlocked;
	        }
	    }
	};

	var Sprite = {
	    /**
	        Sprites with lower zPosition are drawn below sprites with
	        higher zPosition.
	    */
	    zPosition: 0,

	    clazz: 'Sprite',

	    draw: function() {
	        throw('You must implement this method.');
	    }
	};

	var RectSprite = $.extend(true,{},Sprite,{
		clazz: 'RectSprite',
	    fillColor: 'blue',
	    boderWidth: 1,
	    strokeColor: 'white',
	    hasShadow: false,
	    shadowColor: 'black',
	    shadowOffsetX: 0,
	    shadowOffsetY: 0,
	    shadowBlur: 10,
	    text: null,
	    textColor: 'black',
	    rect: null,
	    blend: null,
	    highlighted: null,
	    textBackgroundColor: 'orange',

	    draw: function(context) {
	        this.drawRect(context, this.getBoundingBox());
	    },

	    drawRect: function(context, rect) {
	        context.save();
	        if (this.blend) {
	            context.globalCompositeOperation = this.blend;
	        }
	        if (this.hasShadow) {
	            context.shadowColor   = this.shadowColor;
	            context.shadowOffsetX = this.shadowOffsetX;
	            context.shadowOffsetY = this.shadowOffsetY;
	            context.shadowBlur    = this.shadowBlur;
	        }

	        context.fillStyle = this.fillColor;
	        context.fillRect(rect.left,
	                         rect.top,
	                         rect.width,
	                         rect.height);
	        context.restore();

	        context.lineWidth = this.boderWidth;
	        context.strokeStyle = this.strokeColor;
	        if (this.highlighted) {
	            context.shadowColor = 'orange';
	            context.shadowOffsetX = 0;
	            context.shadowOffsetY = 0;
	            context.shadowBlur = 5;
	            context.lineWidth = 2;
	            context.strokeStyle = 'orange';
	        }
	        context.strokeRect(rect.left,
	                           rect.top,
	                           rect.width,
	                           rect.height);
	        context.shadowColor = 'transparent';

	        if (this.text) {
	            context.font = "12px sans-serif";
	            var textWidth = context.measureText(this.get('text')).width;
	            context.fillStyle = this.textBackgroundColor;
	            if (!this.highlighted) {
	                context.globalAlpha = 0.5;
	            }
	            context.fillRect(rect.left, rect.top - 18, textWidth + 11, 18);
	            context.fillRect(rect.left, rect.top - 1, rect.width, 2);
	            context.fillStyle = this.textColor;
	            context.globalAlpha = 1.0;
	            context.fillText(this.text,
	                             rect.left + 6,
	                             rect.top - 4);

	        }
	        context.restore();
	    }
	});

	var AnnotationSprite = $.extend(true,{},RectSprite,{
		clazz: 'AnnotationSprite',
	    annotation: null,
	    fillColor: 'rgba(88,150,220,0.4)',
	    strokeColor: 'rgba(88,150,220,0.4)',
	    hasShadow: false,
	    textColor: 'white',
	    _zPosition: 0,

	    //text: Ember.computed.reads('annotation.name'),

	    //highlighted: Ember.computed.reads('annotation.highlighted'),

	    getBoundingBox: function() {
	        if (this.annotation.element) {
	            return $(this.annotation.element).boundingBox();
	        } else {
	            return RECT_ZERO;
	        }
	    },

	    zPosition: function(key, zPos) {
	        if (arguments.length > 1) {
	            this._zPosition = zPos;
	        }
	        if (this.annotation.highlighted) {
	            return 1000;
	        } else {
	            return this._zPosition;
	        }
	    }
	});

	var IgnoreSprite = $.extend(true,{},RectSprite,{
		clazz: 'IgnoreSprite',
	    ignore: null,
	    fillColor: 'black',
	    strokeColor: 'rgba(255, 0, 0, 0.4)',
	    textColor: 'rgba(255,150,150,1)',
	    blend: 'destination-out',

	    //ignoreBeneath: Ember.computed.reads('ignore.ignoreBeneath'),

	    //text: Ember.computed.reads('ignore.name'),

	    //highlighted: Ember.computed.reads('ignore.highlighted'),

	    draw: function(context) {
	        var element = $(this.ignore.element);
	        if (this.ignoreBeneath) {
	            var elementsBeneath = element.nextAll();
	            elementsBeneath.each(function(i, element) {
	                this.drawRect(context, $(element).boundingBox());
	            }.bind(this));
	        }
	        this.drawRect(context, element.boundingBox());
	    }
	});

	var ElementSprite = $.extend(true,{},RectSprite,{
		clazz: 'ElementSprite',
	    element: null,
	    fillColor: 'rgba(103,175,255,0.4)',
	    strokeColor: 'white',
	    hasShadow: false,
	    boderWidth: 2,
	    zPosition: 10,

	    getBoundingBox: function() {
	        return $(this.element).boundingBox();
	    }
	});

	var ScrapedDoc = {
		iframeId: 'scraped-doc-iframe',

	    sprites: $.createObject(SpriteStore),

	    listener: null,

	    mode: "uninitialized", // How it responds to input events, modes are 'none', 'browse' and 'select'
	    useBlankPlaceholder: false,
	    recording: false, // If we are currently recording page actions

	    canvas: null,

	    ignoredElementTags: ['html', 'body'],

	    mouseDown: false,

	    loader: null,

	    loadingDoc: false,

	    cssEnabled: true, // Only in "select" mode

	    getIframe: function() {
        	return $('#' + this.iframeId).contents();
    	},

        getIframeNode: function() {
            return $('#' + this.iframeId)[0];
        },

	    getIframeContent: function() {
            var iframe = this.getIframe().get(0);
            return iframe.documentElement && iframe.documentElement.outerHTML;
        },

    	init: function(options){
            this.initCanvas();
            var iframeNode = this.getIframeNode();
            //iframeNode.onload = $.proxy(this._updateEventHandlers,this);
            //iframeNode.onreadystatechange = $.proxy(this._updateEventHandlers,this);
    	},

    	_updateEventHandlers: function() {
    		var mode = this.mode;
            if (mode === 'select') {
                this.installEventHandlersForSelecting();
            } else if (mode === 'browse'){
                this.installEventHandlersForBrowsing();
            } else { // none
                this.uninstallEventHandlers();
            }
        },

        installEventHandlersForSelecting: function() {


        	this.uninstallEventHandlers();
            var iframe = this.getIframe();
            iframe.on('scroll.unieap', this.redrawNow.bind(this));
            iframe.on('click.unieap', this.clickHandler.bind(this));
            iframe.on('mouseover.unieap', this.mouseOverHandler.bind(this));
            iframe.on('mouseout.unieap', this.mouseOutHandler.bind(this));

            iframe.on('mouseup.unieap', this.mouseUpHandler.bind(this));
            iframe.on('hover.unieap', function(event) {event.preventDefault();});  // XXX: Why?
            this.redrawNow();

			$(".keyField").on("click",function(event){
				if(event.target.className == "settingImage"){

					clickedContext = $(event.target);
					$(clickedContext).parent().siblings().hide();
				}
				if(event.target.className == "saveImage"){
					$(clickedContext).parent().siblings().show();
					$(clickedContext).nextAll('.detailData').hide();
					clickedContext = null;

				}

			})


        },

        uninstallEventHandlers: function() {
            this.getIframe().off('.unieap');
            this.mouseOutHandler();
        },

        redrawNow: function() {
            if (!this.canvas || this.loadingDoc) {
                return;
            }
            var canvas = this.canvas;
            if (this.sprites.sprites) {
                var sprites = this.sprites.sprites().slice();
                if (this.hoveredSprite) {
                    sprites = sprites.concat([this.hoveredSprite]);
                }
                canvas.draw(sprites,
                            this.getIframe().scrollLeft(),
                            this.getIframe().scrollTop());
            } else {
                canvas.clear();
            }
        },

        initHoveredInfo: function() {
            var contents = '<div class="path"/><div class="attributes"/>';
            var element = $('#hovered-element-info').html(contents);
        },

        updateHoveredInfo: function(element) {
            var jqElem = $(element),
                path = jqElem.getPath(),
                attributes = jqElem.getAttributeList();
            if (jqElem.prop('class')) {
                attributes.unshift({name: 'class', value: jqElem.prop('class')});
            }
            if (jqElem.prop('id')) {
                attributes.unshift({name: 'id', value: jqElem.prop('id')});
            }
            var $attributes = $('#hovered-element-info .attributes').empty();
            attributes.forEach(function(attribute) {
                var value = (attribute.value + "").trim().substring(0, 50);
                $attributes.append(
                    $('<div class="attribute" style="margin:2px 0px 2px 0px"></div>').append(
                        $('<span/>').text(attribute.name + ': ')
                    ).append(
                        $('<span style="color:#AAA"></span>').text(value)
                    )
                );
            });
            $('#hovered-element-info .path').html(path);
        },


        sendElementHoveredEvent: function(element, delay, mouseX, mouseY) {
            this.sendDocumentEvent('elementHovered', element, mouseX, mouseY);
        },

        mouseOverHandler: function(event) {
            event.preventDefault();
            var target = event.target;
            if(!target || target.nodeType !== Node.ELEMENT_NODE) {
                // Ignore events on the document
                return;
            }
            this.initHoveredInfo();
            var tagName = target.tagName.toLowerCase();
            if ($.inArray(tagName, this.ignoredElementTags) === -1 &&
                !this.mouseDown) {
                if (!this.restrictToDescendants ||
                        $(target).isDescendant(this.restrictToDescendants)) {
                    this.setElementHovered(target);
                    this.sendElementHoveredEvent(target, event.clientX, event.clientY);
                }
            }
        },

        mouseOutHandler: function() {
           this.hoveredSprite = null;
           this.redrawNow();
           $('#hovered-element-info').html('<div><p class="text-muted empty-notice">No element selected</p></div>');
        },
		//在detailWord下面添加提取到的具体数据
		addDetailWord:function(jqueryObj){

		},
		analysisXpath:function(path){
			//从头开始遍历找到含有层级的位置，并看看是否存在兄弟节点，如果存在兄弟节点查看兄弟节点是否一样

			var pathArry = path.split("/");


			var finalValue=0;
			var finalKey="";
			var finalIndex="";
			var classMap = new Map();
			$.each(pathArry,function(index,arrayValue){
				var tmpPath = pathArry.slice();
				var pos = arrayValue.indexOf("[");
				if(pos != -1){
					tmpPath[index] = arrayValue.substring(0,pos);
					var xPath  = tmpPath;
                    var broNode = $("#scraped-doc-iframe").contents().xpath(xPath.join("/"));
					var count = broNode.length;

					if(count < 3){
						//找到第一个大于3的节点
						var tmpPath =  pathArry.slice();
					}else{
						//如果count大于2则代表

						//找到兄弟节点最多的情况
						$.each(broNode,function (i,ndoe) {
							var classValue = ndoe.className
							if(typeof classMap.get(classValue) == "undefined"){
								classMap.set(classValue,1);
							}else{
								var rate = classMap.get(classValue);
								rate ++;
								classMap.set(classValue,rate);
							}

						})
						//找到存现最多的节点
						classMap.forEach(function(value,key){
							if(value > finalValue)
							{
								finalIndex = index;
								finalKey = key;
								finalValue = value;
							}
						})
						classMap.clear();
					}
				}
			});

			if(finalValue != 0)
			{ var p = pathArry[finalIndex].indexOf("[")
				pathArry[finalIndex] = pathArry[finalIndex].substring(0,p);

				var node = $("#scraped-doc-iframe").contents().xpath(pathArry.join("/"));
				var num =$('.badge').text();

					$('.badge').html(parseInt(num)+parseInt(node.size()));

				$.each(node,function (i,v) {
					if(v.className == finalKey)
						$(v).css("border", "dashed");

					$(".extracted-items").append($(v).text()+"<br>");

				})

				pathArry[finalIndex] = pathArry[finalIndex].substring(0,p)+'*';

			}
			XPathArray.push(pathArry);

		},

        clickHandler:  function(event) {
            event.preventDefault();
            event.stopPropagation();
            if(!nextPage){

                //添加一个字段

                if(getData){

                    $(event.target).css("border", "dashed");

                    var path = $(event.target).getPath();
                    //不需要提前的收集jquery对象，因为使用canvas进行绘制网页的时候会有坐标，通过坐标可以得到界面

                    this.analysisXpath(path);
                }
			}else{
				//添加翻页栏

				nextPage = false;

               	var next_button_xpath = get_next_button_xpath($(event.target).getPath())
				var index = next_button_xpath.indexOf('*')
				next_button_xpath = next_button_xpath.substring(0,index)
                index = next_button_xpath.lastIndexOf('/')
                next_button_xpath = next_button_xpath.substring(0,index)
				var node = $("#scraped-doc-iframe").contents().xpath(next_button_xpath);
				$.each(node.children(),function (index,value) {
					var _has_href = value.hasAttribute('href')
					var inner_has_href = value.innerHTML.indexOf('href')
					if(_has_href || inner_has_href)
					{
						$(value).css('border','dashed');
					}
                })


				$.ajax({
					url: '/nextButton',
					type: 'get',
					data:{nextButtonXpath:next_button_xpath},
					error: function(e){
						console.log(e)
					},
					success: function(data) {
                              console.log(data)
					}
				});



			}


        },



        mouseUpHandler:  function(event) {
            this.mouseDown = false;
            var selectedText = this.getIframeSelectedText();
            if (selectedText) {
                if (this.get('partialSelectionEnabled')) {
                    if (selectedText.anchorNode === selectedText.focusNode) {
                        this.sendDocumentEvent(
                            'partialSelection', selectedText, event.clientX, event.clientY);
                    } else {
                        alert('The selected text must belong to a single HTML element');
                        selectedText.collapse(this.getIframe().find('html').get(0), 0);
                    }
                } else {
                    selectedText.collapse(this.getIframe().find('html').get(0), 0);
                }
            } else if (event && event.target && event.target.nodeType === Node.ELEMENT_NODE){
                var target = event.target;
                var tagName = target.tagName.toLowerCase();
                if ($.inArray(tagName, this.ignoredElementTags) === -1) {
                    if (!this.restrictToDescendants ||
                        $(target).isDescendant(this.restrictToDescendants)) {
                        this.sendDocumentEvent('elementSelected', target, event.clientX, event.clientY);
                    }
                }
            }
        },

        sendDocumentEvent: function(name) {
            var actions = this.listener.documentActions;
            var args = Array.prototype.slice.call(arguments, 1);
            if (actions && actions[name]) {
                (function(){
                    actions[name].apply(this.listener, args);
                }(this));
            }
        },

        getIframeSelectedText: function() {
            var range = this.getIframe().get(0).getSelection();
            if (range && !range.isCollapsed) {
                return range;
            } else {
                return null;
            }
        },

        setElementHovered: function(element) {
            this.updateHoveredInfo(element);
            this.hoveredSprite = $.createObject(ElementSprite,{
            	element : element
            });
            this.redrawNow();
        },

        iframeSize: function(){
            var iframe_window = this.getIframeNode().contentWindow;
            if (iframe_window) {
                return iframe_window.innerWidth + 'x' + iframe_window.innerHeight;
            }
            return null;
        },

        initCanvas: function() {
            if (!this.canvas) {
                this.canvas = $.createObject(Canvas,{
                	canvasId : 'infocanvas'
                });
                this.initHoveredInfo();
                window.resize = this.redrawNow.bind(this);
            }
        }
	}