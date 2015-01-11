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
            'mycp.view': [
                ['dijit/registry', 'js/eventBlock.js', 'aps/xhr'],
                myCPView
            ]
        }))
        return;
    var dt = meta.dt,
        layout = ['aps/PageContainer', {
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
    return meta.run();

    function suwizardOverview() {
        var calendar = aps.context.params.objects[0];
        layout[2][0][2][0][1].value = calendar.name;
        layout[2][0][2][1][1].value = calendar.description;
        layout[2][0][2][2][1].value = meta.timezoneInfo(calendar.timezone, dt);
        load(layout);
    }

    function suserviceView(Store, eventBlock) {
        (new Store({
            target: '/aps/2/resources',
            apsType: 'http://aps.google.com/gcalendar/calendar/1.0'
        })).query().then(meta.getFull).then(function(calendars) {
            var calendar;
            calendars.some(function(v) {
                if (v.owner.aps.id === aps.context.params.user.aps.id) {
                    calendar = v;
                    return true;
                }
            });
            layout[2][0][2][0][1].value = calendar.name;
            layout[2][0][2][1][1].value = calendar.description;
            layout[2][0][2][2][1].value = meta.timezoneInfo(calendar.timezone, dt);
            layout[2].push(eventBlock({
                calendarId: calendar.aps.id
            }));
            load(layout);
        });
    }

    function calendarView(Store, eventBlock) {
        var calendar;
        meta.getFull(aps.context.vars.target).then(function(resource) {
            calendar = resource;
            return meta.getFull(resource.owner);
        }).then(function(owner) {
            layout[2].unshift(['aps/FieldSet', {
                    id: 'fs-owner',
                    title: 'Calendar owner'
                },
                [
                    ['aps/Output', {
                        id: 'ou-owner',
                        label: 'Service user',
                        value: meta.userInfo(owner)
                    }]
                ]
            ]);
            layout[2].push(eventBlock({
                calendarId: calendar.aps.id
            }));
            layout[2][1][2][0][1].value = calendar.name;
            layout[2][1][2][1][1].value = calendar.description;
            layout[2][1][2][2][1].value = meta.timezoneInfo(calendar.timezone, dt);
            load(layout).then(function() {
                var data = meta.wizard();
                if (data)
                    meta.showMsg.apply(this, data);
                aps.app.onSubmit = function() {
                    if (confirm('Are you sure that you want to delete this calendar and all its events?')) {
                        (new Store({
                            target: '/aps/2/resources'
                        })).remove(calendar.aps.id).then(function() {
                            meta.wizard(['Calendar "' + calendar.name + '" was successfully deleted!', 'info', true]);
                            aps.apsc.gotoView('calendars');
                        }, meta.showMsg);
                    }
                };
                aps.app.onPrev = function() {
                    aps.apsc.gotoView('calendars');
                };
                aps.app.onNext = function() {
                    aps.apsc.gotoView('calendar.edit', calendar.aps.id);
                };
            });
        });
    }


    function calendarNew(newCalendarWizard, Store) {
        var data = meta.wizard();
        if (!data) {
            aps.apsc.gotoView('calendar.new0');
            return;
        }
        var model = data.model,
            steps = JSON.parse(newCalendarWizard);
        steps[1].active = true;
        layout[2].unshift(['aps/WizardControl', {
            id: 'wc-wizard',
            steps: steps
        }], ['aps/FieldSet', {
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
        ]);
        layout[2][2][2][0][1].value = model.name;
        layout[2][2][2][1][1].value = model.description;
        layout[2][2][2][2][1].value = meta.timezoneInfo(model.timezone, dt);
        load(layout).then(function() {
            aps.app.onPrev = function() {
                meta.wizard(data);
                aps.apsc.gotoView('calendar.new0');
            };
            aps.app.onSubmit = function() {
                (new Store({
                    target: '/aps/2/resources/' + aps.context.vars.context.aps.id + '/calendars'
                })).put(model).then(function() {
                    aps.apsc.gotoView('calendars');
                }, meta.showMsg);
            };
            aps.app.onCancel = function() {
                meta.wizard();
                aps.apsc.gotoView('calendars');
            };
        });
    }

    function myCPView(registry, eventBlock, xhr) {
        var calendar = aps.context.vars.calendar,
            data = meta.wizard();
        layout[2][0][2][0][1].value = calendar.name;
        layout[2][0][2][1][1].value = calendar.description;
        layout[2][0][2][2][1].value = meta.timezoneInfo(calendar.timezone, dt);
        layout[2].push(eventBlock({
            dateTime: dt,
            storeTarget: '/aps/2/resources/' + calendar.aps.id + '/listEvents',
            showControls: true,
            overrideMasterDetail: true
        }));
        load(layout).then(function() {
            if (data)
                meta.showMsg.apply(this, data);
            registry.byId('btn-schedule').on('click', function() {
                aps.apsc.gotoView('event.new0');
            });
            registry.byId('btn-cancel').on('click', function() {
                if (!confirm('Are you sure that you want to cancel all selected events (notifications will be sent to attendees)?')) {
                    this.cancel();
                    return;
                }
                aps.apsc.showLoading();
                var button = this,
                    grid = registry.byId('gr-events'),
                    selectionArray = grid.get('selectionArray'),
                    count = selectionArray.length;
                selectionArray.forEach(function(v) {
                    xhr.post('/aps/2/resources/' + calendar.aps.id + '/cancelEvent', {
                        data: v
                    }).then(function() {
                        selectionArray.splice(selectionArray.indexOf(v), 1);
                        grid.refresh();
                    }, meta.showMsg).always(function() {
                        if (--count === 0) {
                            aps.apsc.hideLoading();
                            button.cancel();
                        }
                    });
                });
            });
        });
    }
});