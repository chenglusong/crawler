///<reference path='../src/mutation-summary.ts'/>

function treeMirrorDelegate(){
    return {
        createElement: function(tagName) {
            var node = null;
            if(tagName === 'SCRIPT' || tagName === 'BASE') {
                //node = document.createElement('NOSCRIPT');
            	return null;
            } else {
                try {
                    node = document.createElement(tagName);
                } catch(e) {
                    // Invalid tag name
                    node = document.createElement('NOSCRIPT');
                }
            }
            if(tagName === 'FORM') {
                $(node).on('submit', function(){
                	return false;
                });
            } else if (tagName === 'IFRAME' || tagName === 'FRAME') {
                debugger;
                 node.setAttribute('src', '/static/frames-not-supported.html');
            } else if (tagName === 'CANVAS') {
                paintCanvasMessage(node);
            } else if (tagName === 'OBJECT' || tagName === 'EMBED') {
                setTimeout(addEmbedBlockedMessage.bind(null, node), 100);
            }
            if(!node){
            	node = document.createElement(tagName);
            }
            return node;
        },
        setAttribute: function(node, attrName, value){
            if(/^on/.test(attrName) ||  // Disallow JS attributes
                ((node.tagName === 'FRAME' || node.tagName === 'IFRAME') &&
                (attrName === 'src' || attrName === 'srcdoc')) || // Frames not supported
                ((node.tagName === 'OBJECT' || node.tagName === 'EMBED') &&
                (attrName === 'data' || attrName === 'src')) || // Block embed / object
                (node.tagName === 'META' && attrName === 'http-equiv') // Disallow meta http-equiv
            ) {
                return true;
            }
            
            //图片属性转义处理
            if(node.tagName === 'IMG' && attrName.indexOf("src") >=0){
            	attrName = "src";
            }

            try{
                node.setAttribute(attrName, value);
            }catch(e){
                console.log(e, attrName, value);
            }

            if(node.tagName === 'CANVAS' && (attrName === 'width' || attrName === 'height')) {
                paintCanvasMessage(node);
            }

            return true;
        }
    };
}

var TreeMirror = (function () {
    function TreeMirror(root, delegate) {
        this.root = root;
        this.delegate = delegate;
        this.idMap = {};
    }
    TreeMirror.prototype.initialize = function (rootId, children, baseURI) {
        this.baseURI = baseURI;
        this.idMap[rootId] = this.root;
        for (var i = 0; i < children.length; i++)
            this.deserializeNode(children[i], this.root);
    };

    TreeMirror.prototype.applyChanged = function (removed, addedOrMoved, attributes, text) {
        var _this = this;
        // NOTE: Applying the changes can result in an attempting to add a child
        // to a parent which is presently an ancestor of the parent. This can occur
        // based on random ordering of moves. The way we handle this is to first
        // remove all changed nodes from their parents, then apply.
        addedOrMoved.forEach(function (data) {
            var node = _this.deserializeNode(data);
            var parent = _this.deserializeNode(data.parentNode);
            var previous = _this.deserializeNode(data.previousSibling);
            if (node.parentNode)
                node.parentNode.removeChild(node);
        });

        removed.forEach(function (data) {
            var node = _this.deserializeNode(data);
            if (node.parentNode)
                node.parentNode.removeChild(node);
        });

        addedOrMoved.forEach(function (data) {
            var node = _this.deserializeNode(data);
            var parent = _this.deserializeNode(data.parentNode);
            var previous = _this.deserializeNode(data.previousSibling);
            if(parent){
            	parent.insertBefore(node, previous ? previous.nextSibling : parent.firstChild);
            }
        });

        attributes.forEach(function (data) {
            var node = _this.deserializeNode(data);
            Object.keys(data.attributes).forEach(function (attrName) {
                var newVal = data.attributes[attrName];
                if (newVal === null) {
                    node.removeAttribute(attrName);
                } else {
                    if (!_this.delegate || !_this.delegate.setAttribute || !_this.delegate.setAttribute(node, attrName, newVal)) {
                        node.setAttribute(attrName, newVal);
                    }
                }
            });
        });

        text.forEach(function (data) {
            var node = _this.deserializeNode(data);
            node.textContent = data.textContent;
        });

        removed.forEach(function (node) {
            delete _this.idMap[node.id];
        });
    };

    TreeMirror.prototype.deserializeNode = function (nodeData, parent) {
        var _this = this;
        if (typeof(nodeData) == "undefined" || nodeData === null)
            return null;

        var node = this.idMap[nodeData.id];
        if (node)
            return node;

        var doc = this.root.ownerDocument;
        if (doc === null)
            doc = this.root;

        switch (nodeData.nodeType) {
            case Node.COMMENT_NODE:
                node = doc.createComment(nodeData.textContent);
                break;

            case Node.TEXT_NODE:
                node = doc.createTextNode(nodeData.textContent);
                break;

            case Node.DOCUMENT_TYPE_NODE:
                node = doc.implementation.createDocumentType(nodeData.name, nodeData.publicId, nodeData.systemId);
                break;

            case Node.ELEMENT_NODE:
                if (this.delegate && this.delegate.createElement)
                    node = this.delegate.createElement(nodeData.tagName);
                if (node){
                	node.setAttribute('data-tagid', nodeData.id);
                	
                	Object.keys(nodeData.attributes).forEach(function (name) {
                		if (!_this.delegate || !_this.delegate.setAttribute || !_this.delegate.setAttribute(node, name, nodeData.attributes[name])) {
                			node.setAttribute(name, nodeData.attributes[name]);
                		}
                	});
                }

                break;
        }

        if (!node) {
            //throw new Error("No node with that id.");
        }
        
        if(node){
        	this.idMap[nodeData.id] = node;
        	node.nodeid = nodeData.id;
        	
        	if (parent)
        		parent.appendChild(node);
        	
        	if (nodeData.childNodes) {
        		for (var i = 0; i < nodeData.childNodes.length; i++)
        			this.deserializeNode(nodeData.childNodes[i], node);
        	}
        }

        return node;
    };
    return TreeMirror;
})();