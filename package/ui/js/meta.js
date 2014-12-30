define(['dijit/registry', 'aps/Message', 'aps/PageContainer', 'aps/ready!'], function(registry, Message, PageContainer) {
    var meta = {},
    	mode;
    meta.appId = 'http://aps.google.com/gcalendar';
    meta.showMsg = function(err, type) {
        var errData = err.response ? JSON.parse(err.response.text) : err,
            page = registry.byId('pageContainer');
        console.log(page);
        aps.apsc.cancelProcessing();
        if (!page) {
            page = new PageContainer({
                id: 'page'
            });
            page.placeAt(document.body, 'first');
        }
        var messages = page.get('messageList');
        messages.removeAll();
        messages.addChild(new Message({
            description: err + (errData.message ? '<br />' + errData.message : ''),
            type: type || 'error'
        }));
    };
    meta.check = function(modes) {
        if (aps.context.view.id.indexOf(meta.appId) !== 0) {
            meta.showMsg('Unknown location: ' + aps.context.view.id);
            return false;
        }
        var view = aps.context.view.id.split('#')[1];
        if (!view || !(view in modes)) {
            meta.showMsg('Unknown view: ' + view);
            return false;
        }
        mode = modes[view];
        return true;
    }
    meta.run = function() {
        require.apply(this, mode);
    }
    return meta;
});