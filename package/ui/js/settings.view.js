require(['js/meta.js', 'aps/load'], function(meta, load) {
    load(['aps/PageContainer', {
            id: 'page-container'
        },
        [
            ['aps/FieldSet', {
                    id: 'fs-general',
                    title: 'GCalendar context parameters'
                },
                [
                    ['aps/Output', {
                        id: 'ou-ttl',
                        label: 'Event TTL',
                        value: aps.context.vars.context.eventTTL + ' min'
                    }],
                    ['aps/Output', {
                        id: 'ou-default-tz',
                        label: 'Default timezone',
                        value: meta.timezoneInfo(aps.context.vars.context.defaultTimezone)
                    }]
                ]
            ]
        ]
    ]).then(function() {
        var data = meta.wizard();
        if (data)
            meta.showMsg.apply(this, data);
        aps.app.onNext = function() {
            aps.apsc.gotoView('settings.edit');
        };
    });
});