$.createObject = function(clazz, options) {
	if (!options) {
		options = {};
	}
	var object = $.extend(true, {}, clazz, options);
	object.init && object.init();
	return object;
}

$.fn.getUniquePath = function() {
	if (this.length !== 1) {
		throw 'Requires one element.';
	}
	var path, node = this;
	while (node.length) {
		var realNode = node[0], name = realNode.localName;
		if (!name) {
			break;
		}
		name = name.toLowerCase();
		var parent = node.parent();
		var siblings = parent.children(name);
		if (siblings.length > 1) {
			name += ':eq(' + siblings.index(realNode) + ')';
		}
		path = name + (path ? '>' + path : '');
		node = parent;
	}
	return path;
};
//找到该节点是父节点的第几个子节点并排除父节点只有一个子节点的情况
//
getNodeIndex = function (node) {
    var result = -1;
    var parentNode = $(node).parent();

    var tagName = $(node).prop('tagName').toLowerCase();
    var sameTagBrotherNodeSet = $(parentNode).children(tagName);
    if(sameTagBrotherNodeSet.length > 1)
    {

        result = $(sameTagBrotherNodeSet).index($(node)) +1;


    }

    return result;

};
$.fn.getPath = function() {
	// if (!this.prop('tagName')) {
	// 	return;
	// }
	// var path = [ this.prop('tagName').toLowerCase() ];
	// this.parents().not('html').each(function() {
	// 	var entry = this.tagName.toLowerCase();
	// 	path.push(entry);
	// });
	// return path.reverse().join(' > ');

    $.fn.getPath = function () {
        if (!this.prop('tagName')) {
            return;
        }


        var tail='';
        var index = getNodeIndex(this);
        if(index != -1)
        {
            tail = '['+index+']';
        }
        var path = [this.prop('tagName').toLowerCase()+tail];


        this.parents().not('html').each(function () {
            var entry = this.tagName.toLowerCase();
            //找到其实父节点的第几个子节点
            //
            tail='';
            index = getNodeIndex(this);
            if(index != -1)
            {
                tail = '['+index+']';
            }

            path.push(entry+tail);
        });
        path.push('/');
        //path中存放着绝对路径的XPath
        return path.reverse().join('/');

    };

};

$.fn.getAttributeList = function() {
	var attributeList = [], text_content_key = 'content';
	if (this.attr('content')) {
		text_content_key = 'text content';
	}
	if (this.text()) {
		attributeList.push( {
			name : text_content_key,
			value : this.text()
		});
	}
	var element = this.get(0);
	if (!element) {
		return [];
	}
	var mappedAttributes = {};
	for ( var i = 0; i < element.attributes.length; i++) {
		var attrib = element.attributes[i];
		if (attrib.name.startsWith('_portia_')) {
			var originalName = attrib.name.slice(8);
			if (!mappedAttributes[originalName]) {
				mappedAttributes[originalName] = attrib.value;
			}
		}
	}
	$(element.attributes).each(
			function() {
				if (!this.nodeName.startsWith('_portia_')
						&& $.inArray(this.nodeName,
								$.fn.getAttributeList.ignoredAttributes) === -1
						&& this.value) {
					attributeList.push( {
						name : this.nodeName,
						value : mappedAttributes[this.nodeName] || this.value
					});
				}
			});
	return attributeList;
};

$.fn.getAttributeList.ignoredAttributes = [ 'id', 'class', 'width', 'style',
		'height', 'cellpadding', 'cellspacing', 'border', 'bgcolor', 'color',
		'colspan', 'data-scrapy-annotate', 'data-tagid', 'data-genid',
		'data-parentid' ];

$.fn.boundingBox = function() {
	if (!this || !this.offset()) {
		return {
			top : 0,
			left : 0,
			width : 0,
			height : 0
		};
	}
	var rect = {};
	rect.left = this.offset().left;
	rect.top = this.offset().top;
	rect.width = this.outerWidth();
	rect.height = this.outerHeight();
	return rect;
};

$.fn.isDescendant = function(parent) {
	return $(parent).find(this).length > 0;
};

$.fn.findAnnotatedElements = function() {
	return this.find('[data-scrapy-annotate]');
};

$.fn.findAnnotatedElement = function(annotationId) {
	var selector = '[data-scrapy-annotate*="' + annotationId + '"]';
	return this.find(selector);
};

$.fn.findIgnoredElements = function(annotationId) {
	var selector;
	if (annotationId) {
		selector = '[data-scrapy-ignore*="' + annotationId
				+ '"], [data-scrapy-ignore-beneath*="' + annotationId + '"]';
	} else {
		selector = '[data-scrapy-ignore], [data-scrapy-ignore-beneath]';
	}
	return this.find(selector);
};

$.fn.removePartialAnnotation = function() {
	// FIXME: this may leave empty text node children.
	var element = this.get(0);
	var textNode = element.childNodes[0];
	var parentNode = element.parentNode;
	$(textNode).unwrap();
	parentNode.normalize();
};

$.fn.renameAttr = function(from, to) {
	return this.each(function() {
		var $this = $(this);
		$this.attr(to, $this.attr(from));
		$this.removeAttr(from);
	});
};

$.expr[':'].hasAttrWithPrefix = $.expr.createPseudo(function(prefix) {
	return function(obj) {
		for ( var i = 0; i < obj.attributes.length; i++) {
			if (obj.attributes[i].nodeName.indexOf(prefix) === 0) {
				return true;
			}
		}
		return false;
	};
});

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function shortGuid(separator) {
    separator = typeof separator !== 'undefined' ? separator : '-';
    return s4() + separator + s4() + separator + s4();
}