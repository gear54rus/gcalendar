require(['js/meta.js', 'dojo/text!./js/timezoneList.json', 'aps/xhr', 'dojox/mvc/getStateful', 'dojox/mvc/at', 'dojox/mvc/getPlainValue', 'dijit/registry', 'aps/load'], function(meta, tzList, xhr, getStateful, at, getPlainValue, registry, load) {
    var context = getStateful(aps.context.vars.context);
    load(['aps/PageContainer', {
            id: 'page-container'
        },
        [
            ['aps/FieldSet', {
                    id: 'fs-general',
                    title: 'GCalendar context parameters'
                },
                [
                    ['aps/TextBox', {
                        id: 'ou-ttl',
                        label: 'Event TTL',
                        value: at(context, 'eventTTL').transform({
                            parse: function(v) {
                                return Math.abs(parseInt(v, 10));
                            }
                        }),
                        validator: function (v) {
                            return !isNaN(parseInt(v, 10)) && isFinite(v);
                        },
                        placeholder: 'Number of minutes',
                        hint: 'Events that have ended will be deleted after that many minutes',
                        required: true
                    }],
                    ['aps/Select', {
                        id: 'ou-default-tz',
                        label: 'Default timezone',
                        options: meta.timezoneListOptions(tzList, meta.dt),
                        value: at(context, 'defaultTimezone'),
                        hint: 'Timezone which is selected by default when creating a calendar',
                        required: true
                    }]
                ]
            ]
        ]
    ]).then(function() {
        var page = registry.byId('page-container');
        if (!page.validate()) {
            return;
        }
        aps.app.onCancel = function() {
            xhr.put('/aps/2/resources/' + context.aps.id, {
                data: JSON.stringify(getPlainValue(context))
            }).then(function() {
                meta.wizard(['Settings were saved!', 'info', true]);
                aps.apsc.gotoView('settings.view');
            }, meta.showMsg);
        };
        aps.app.onSubmit = function() {
            aps.app.onCancel();
        };
    });
});