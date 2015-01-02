require(['js/meta.js', 'dojox/mvc/getStateful', 'aps/load'], function(meta, getStateful, load) {
    if (!meta.check({
            'suwizard.overview': [
                [],
                suwizardOverview
            ],
            'suservice.view': [
                ['aps/ResourceStore', 'dojo/promise/all'],
                suserviceView
            ],
            'calendar.view': [
                ['aps/ResourceStore'],
                calendarView
            ]
        }))
        return;
    var layout = ['aps/PageContainer', {
            id: 'page-container'
        },
        [
            ['aps/FieldSet', {
                    id: 'fs-params',
                    title: 'Calendar parameters'
                },
                [
                    ['aps/Output', {
                        id: 'ou-name',
                        label: 'Name'
                    }],
                    ['aps/Output', {
                        id: 'ou-description',
                        label: 'Description'
                    }],
                    ['aps/Output', {
                        id: 'ou-timezone',
                        label: 'Timezone'
                    }]
                ]
            ]
        ]
    ];
    meta.run();

    function suwizardOverview() {
        var target = getStateful(aps.context.params.objects[0]);
        layout[2][0][2][0][1].value = target.name;
        layout[2][0][2][1][1].value = target.description;
        layout[2][0][2][2][1].value = target.timezone;
        load(layout);
    }

    function suserviceView(Store, all) {
        var store = new Store({
            target: '/aps/2/resources',
            apsType: 'http://aps.google.com/gcalendar/calendar/1.0'
        });
        store.query()
            .then(function(calendars) {
                return all(calendars.map(function(v) {
                    return store.get(v.aps.id);
                }));

            })
            .then(function(calendars) {
                var target;
                calendars.some(function(v) {
                    if (v.owner.aps.id === aps.context.params.user.aps.id) {
                        target = v;
                        return true;
                    }
                });
                //showMsg on error
                layout[2][0][2][0][1].value = target.name;
                layout[2][0][2][1][1].value = target.description;
                layout[2][0][2][2][1].value = target.timezone;
                layout[2].push(eventBlock(Store, target));
                load(layout);
            });
    }

    function calendarView(Store) {
        (new Store({
            target: '/aps/2/resources/' + aps.context.vars.target.aps.id
        })).query().then(function(target) {
            console.log(aps, target);
        });
    }

    function eventBlock(Store, target) {
        return ['aps/Container', {
                id: 'fs-events',
                title: 'Events on this calendar'
            },
            [
                ['aps/Grid', {
                        id: 'gr-events',
                        store: new Store({
                            target: '/aps/2/resources/' + target.aps.id + '/events'
                        }),
                        selectionMode: 'multiple',
                        apsResourceViewId: 'event.view',
                        columns: [{
                            field: 'name',
                            name: 'Name',
                            type: 'resourceName'
                        },
                        {
                            field: 'timezone',
                            name: 'Time Zone'
                        },
                        {
                            field: 'owner',
                            name: 'Name'
                        }]
                    },
                    [
                        ['aps/Toolbar', {},
                            [
                                ['aps/ToolbarButton', {
                                    id: 'btn-schedule',
                                    iconClass: 'sb-new-domain',
                                    label: 'Schedule',
                                    requireItems: true
                                }],
                                ['aps/ToolbarButton', {
                                    id: 'btn-cancel',
                                    iconClass: 'sb-delete',
                                    label: 'Cancel',
                                    requireItems: true
                                }]
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }
});