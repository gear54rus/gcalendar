define(['dijit/registry', 'aps/Message', 'aps/PageContainer', 'dojo/promise/all', 'aps/xhr', 'aps/WizardData', 'aps/ready!'], function(registry, Message, PageContainer, all, xhr, wizardData) {
    var meta = {},
        mode;
    meta.appId = 'http://aps.google.com/gcalendar';
    meta.timeFormat = 'YYYY-MM-DD HH:mm';
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
        messages.addChild(new Message({
            description: data + (object.message ? '<br />' + object.message : ''),
            type: type || 'error',
            closeable: closeable
        }));
        page.startup();
    };
    meta.clearMessages = function(page) {
        return page ? page.get('messageList').removeAll() : registry.byId('page-container').get('messageList').removeAll();
    }
    meta.getFull = function(resource) {
        return Array.isArray(resource) ? all(resource.map(function(v) {
            return xhr.get('/aps/2/resources/' + v.aps.id);
        })) : xhr.get('/aps/2/resources/' + resource.aps.id);
    };
    meta.wizard = function(data) {
        if (arguments.length) {
            return wizardData.put(data);
        } else {
            data = wizardData.get();
            if (data) {
                wizardData.put(null);
                return data;
            }
            return null;
        }
    };
    meta.userInfo = function(user) {
        return user.userId + ': ' + user.displayName + ' (' + user.login + ')';
    };
    meta.globalMatch = function(string, rx) {
        if (typeof string !== 'string')
            throw Error('String expected as the first argument');
        if (!(rx instanceof RegExp))
            throw Error('RegExp expected as the second argument');
        var result = [],
            tmp;
        rx = new RegExp(rx.source, 'g' + (rx.ignoreCase ? 'i' : '') + (rx.multiline ? 'm' : ''));
        while (tmp = rx.exec(string))
            result.push(tmp);
        return result;
    };
    meta.unique = function(array) {
        var n = {},
            r = [];
        for (var i = 0; i < array.length; i++) {
            if (!n[array[i]]) {
                n[array[i]] = true;
                r.push(array[i]);
            }
        }
        return r;
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
    console.log(aps);
    return meta;
});