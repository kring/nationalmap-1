"use strict";

/*global require,URI*/
var getElement = require('../../third_party/cesium/Source/Widgets/getElement');
var loadWithXhr = require('../../third_party/cesium/Source/Core/loadWithXhr');

var knockout = require('../../third_party/cesium/Source/ThirdParty/knockout');

var SharePanel = function(options) {
    var container = getElement(options.container);

    var wrapper = document.createElement('div');
    wrapper.className = 'ausglobe-info-container';
    wrapper.setAttribute('data-bind', 'click: closeIfClickOnBackground');
    container.appendChild(wrapper);

    var info = document.createElement('div');
    info.className = 'ausglobe-share';
    info.innerHTML = '\
        <div class="ausglobe-info-header">\
            <div class="ausglobe-info-close-button" data-bind="click: close">&times;</div>\
            <h1>Share</h1>\
        </div>\
        <div class="ausglobe-info-content">\
            <div class="ausglobe-share-image">\
                <img data-bind="attr: { src: request.image }" height="260" />\
            </div>\
            <div class="ausglobe-share-right">\
                <div class="ausglobe-share-label" data-bind="visible: itemsSkippedBecauseTheyHaveLocalData.length > 0">\
                    The following data sources will NOT be shared because they include data from this local system.\
                    To share these data sources, publish their data on a web server and add them to National Map using\
                    the URL instead of by dragging/dropping or selecting a local file.\
                    <ul data-bind="foreach: itemsSkippedBecauseTheyHaveLocalData">\
                        <li data-bind="text: name"></li>\
                    </ul>\
                </div>\
                <div class="ausglobe-share-label">\
                    To <strong>copy</strong> to clipboard, click the link below and press CTRL+C or &#8984;+C:\
                    <input readonly type="text" data-bind="value: url()" size="100" onclick="this.select();" />\
                </div>\
                <div class="ausglobe-share-label">\
                    To <strong>embed</strong>, copy this code to embed this map into an HTML page:\
                    <input readonly type="text" data-bind="value: embedCode()" size="100" onclick="this.select();" />\
                </div>\
            </div>\
            <div class="ausglobe-share-label" data-bind="visible: !serviceInvoked()">\
                <input class="ausglobe-services-send-button" type="button" value="Shorten" data-bind="click: sendRequest" />\
            </div>\
        </div>\
    ';
    wrapper.appendChild(info);

    var visServer = window.location.origin;
    var request = options.request;
    
    var img = request.image;
    request.image = undefined;
    var requestStr = JSON.stringify(request);
    var origUrl = visServer + '#start=' + encodeURIComponent(requestStr);
    request.image = img;

    var viewModel  = this._viewModel = {
        request : options.request,
        url : knockout.observable(origUrl),
        itemsSkippedBecauseTheyHaveLocalData : options.itemsSkippedBecauseTheyHaveLocalData,
        serviceInvoked : knockout.observable(false),
        embedCode : knockout.observable('<iframe style="width: 720px; height: 405px; border: none;" src="' + origUrl + '" allowFullScreen mozAllowFullScreen webkitAllowFullScreen></iframe>'),
        sendRequest : function() {
            viewModel.serviceInvoked(true);

            //TODO: add image to upload
            var formData = new FormData();
            formData.append('requestString', requestStr);

            return loadWithXhr({
                url : '/upload',
                method : 'POST',
                data : formData
            }).then(function(response) {
                console.log(response)
                var newUrl = visServer + '#start=' + response;
                viewModel.url(newUrl);
                viewModel.embedCode('<iframe style="width: 720px; height: 405px; border: none;" src="' + newUrl + '" allowFullScreen mozAllowFullScreen webkitAllowFullScreen></iframe>');
            }).otherwise(function() {
                errorLoading(viewModel);
            });
        }
    };

    viewModel.close = function() {
        container.removeChild(wrapper);
    };
    viewModel.closeIfClickOnBackground = function(viewModel, e) {
        if (e.target === wrapper) {
            viewModel.close();
        }
        return true;
    };

    knockout.applyBindings(this._viewModel, wrapper);

};

SharePanel.open = function(options) {
    return new SharePanel(options);
};

module.exports = SharePanel;
