define(['dijit/registry', 'aps/Message', 'aps/PageContainer', 'aps/ready!'], function(registry, Message, PageContainer) {
    var meta = {},
        mode;
    meta.appId = 'http://aps.google.com/gcalendar';
    meta.showMsg = function(data, type, closeable) {
        var object = data.response ? JSON.parse(data.response.text) : data,
            page = registry.byId('page-container');
        aps.apsc.cancelProcessing();
        if (!page) {
            page = new PageContainer({
                id: 'page-container'
            });
            page.placeAt(document.body, 'first');
        }
        var messages = page.get('messageList');
        messages.removeAll();
        console.log(closeable);
        messages.addChild(new Message({
            description: data + (object.message ? '<br />' + object.message : ''),
            type: type || 'error',
            closeable: closeable
        }));
        page.startup();
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
    };
    meta.run = function() {
        require.apply(this, mode);
    };
    return meta;
});