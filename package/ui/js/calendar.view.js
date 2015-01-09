require(['js/meta.js', 'aps/load'], function(meta, load) {
    if (!meta.check({
            'suwizard.overview': [
                [],
                suwizardOverview
            ],
            'suservice.view': [
                ['aps/ResourceStore', 'js/eventBlock.js'],
                suserviceView
            ],
            'calendar.view': [
                ['aps/ResourceStore', 'js/eventBlock.js'],
                calendarView
            ],
            'calendar.new1': [
                ['dojo/text!./js/newCalendarWizard.json', 'aps/ResourceStore'],
                calendarNew
            ],
            'mycp.settings': [
                [],
                myCPSettings
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
        var target = aps.context.params.objects[0];
        layout[2][0][2][0][1].value = target.name;
        layout[2][0][2][1][1].value = target.description;
        layout[2][0][2][2][1].value = target.timezone;
        load(layout);
    }

    function suserviceView(Store, eventBlock) {
        (new Store({
            target: '/aps/2/resources',
            apsType: 'http://aps.google.com/gcalendar/calendar/1.0'
        })).query().then(meta.getFull).then(function(calendars) {
            var target;
            calendars.some(function(v) {
                if (v.owner.aps.id === aps.context.params.user.aps.id) {
                    target = v;
                    return true;
                }
            });
            layout[2][0][2][0][1].value = target.name;
            layout[2][0][2][1][1].value = target.description;
            layout[2][0][2][2][1].value = target.timezone;
            layout[2].push(eventBlock({
                calendarId: target.aps.id
            }));
            load(layout);
        });
    }

    function calendarView(Store, eventBlock) {
        var target;
        meta.getFull(aps.context.vars.target).then(function(resource) {
            target = resource;
            return meta.getFull(resource.owner);
        }).then(function(resource) {
            layout[2] = [
                ['aps/FieldSet', {
                        id: 'fs-owner',
                        title: 'Calendar owner'
                    },
                    [
                        ['aps/Output', {
                            id: 'ou-owner',
                            label: 'Service user',
                            value: meta.userInfo(resource)
                        }]
                    ]
                ],
                layout[2][0],
                eventBlock({
                    calendarId: target.aps.id
                })
            ];
            layout[2][1][2][0][1].value = target.name;
            layout[2][1][2][1][1].value = target.description;
            layout[2][1][2][2][1].value = target.timezone;
            load(layout).then(function() {
                var data = meta.wizard();
                if (data)
                    meta.showMsg.apply(this, data);
                aps.app.onSubmit = function() {
                    if (confirm('Are you sure that you want to delete this calendar and all its events?')) {
                        (new Store({
                            target: '/aps/2/resources'
                        })).remove(target.aps.id).then(function() {
                            meta.wizard(['Calendar "' + target.name + '" was successfully deleted!', 'info', true]);
                            aps.apsc.gotoView('calendars');
                        });
                    }
                };
                aps.app.onPrev = function() {
                    aps.apsc.gotoView('calendars');
                };
                aps.app.onNext = function() {
                    aps.apsc.gotoView('calendar.edit', target.aps.id);
                };
            });
        });
    }


    function calendarNew(newCalendarWizard, Store) {
        var data = meta.wizard(),
            model = data.model,
            steps = JSON.parse(newCalendarWizard);
        steps[1].active = true;
        layout[2] = [
            ['aps/WizardControl', {
                id: 'wc-wizard',
                steps: steps
            }],
            ['aps/FieldSet', {
                    id: 'fs-owner',
                    title: 'Calendar owner'
                },
                [
                    ['aps/Output', {
                        id: 'ou-owner',
                        label: 'Service user',
                        value: data.user
                    }]
                ]
            ],
            layout[2][0]
        ];
        layout[2][2][2][0][1].value = model.name;
        layout[2][2][2][1][1].value = model.description;
        layout[2][2][2][2][1].value = model.timezone;
        load(layout).then(function() {
            aps.app.onPrev = function() {
                meta.wizard(data);
                aps.apsc.gotoView('calendar.new0');
            };
            aps.app.onSubmit = function() {
                (new Store({
                    apsType: 'http://aps.google.com/gcalendar/calendar/1.0',
                    target: '/aps/2/resources/' + aps.context.vars.context.aps.id + '/calendars'
                })).put(model).then(function() {
                    aps.apsc.gotoView('calendars');
                }, meta.showMsg);
            };
        });
    }

    function myCPSettings() {
        var calendar = aps.context.vars.calendar;
        layout[2][0][2][0][1].value = calendar.name;
        layout[2][0][2][1][1].value = calendar.description;
        layout[2][0][2][2][1].value = calendar.timezone;
        load(layout);
    }
});