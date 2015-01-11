require(['js/meta.js', 'aps/load'], function(meta, load) {
    if (!meta.check({
            'event.new1': [
                ['dojo/text!./js/newEventWizard.json', 'aps/xhr'],
                eventNew
            ],
            'event.view': [
                ['aps/xhr'],
                eventView
            ],
            'mycp.event.view': [
                ['aps/xhr'],
                myCPEventView
            ]
        }))
        return;
    var m = meta.moment,
        dt = meta.dt,
        layout = ['aps/PageContainer', {
                id: 'page-container'
            },
            [
                ['aps/FieldSet', {
                        id: 'fs-general',
                        title: 'General information'
                    },
                    [
                        ['aps/Output', {
                            id: 'ou-summary',
                            label: 'Summary'
                        }],
                        ['aps/Output', {
                            id: 'ou-description',
                            label: 'Description'
                        }],
                        ['aps/Output', {
                            id: 'ou-location',
                            label: 'Location'
                        }]
                    ]
                ],
                ['aps/FieldSet', {
                        id: 'fs-timings',
                        title: 'Timings'
                    },
                    [
                        ['aps/Output', {
                            id: 'ou-start',
                            label: 'Start time'
                        }],
                        ['aps/Output', {
                            id: 'ou-end',
                            label: 'End time'
                        }],
                        ['aps/Output', {
                            id: 'ou-timezone',
                            label: 'Timezone'
                        }],
                        ['aps/Output', {
                            id: 'ou-status',
                            label: 'Status'
                        }]
                    ]
                ],
                ['aps/FieldSet', {
                        id: 'fs-other',
                        title: 'People and reminders'
                    },
                    [
                        ['aps/Output', {
                            id: 'ou-attendees',
                            label: 'Attendees'
                        }],
                        ['aps/Output', {
                            id: 'ou-reminders',
                            label: 'Reminders'
                        }]
                    ]
                ]
            ]
        ];
    return meta.run();

    function eventNew(newEventWizard, xhr) {
        var data = meta.wizard();
        if (!data) {
            aps.apsc.gotoView('event.new0');
            return;
        }
        var model = data.model,
            steps = JSON.parse(newEventWizard);
        steps[1].active = true;
        layout[2].unshift(['aps/WizardControl', {
            id: 'wc-wizard',
            steps: steps
        }]);
        model.attendees = meta.unique(model.attendees);
        model.reminders = meta.unique(model.reminders);
        layout[2][1][2][0][1].value = model.summary;
        layout[2][1][2][1][1].value = model.description;
        layout[2][1][2][2][1].value = model.location;
        layout[2][2][2][0][1].value = m(model.start).format(meta.timeFormat);
        layout[2][2][2][1][1].value = m(model.end).format(meta.timeFormat);
        layout[2][2][2][2][1].value = meta.timezoneInfo(model.timezone, dt);
        layout[2][2][2][3][1].value = meta.eventStatus(dt, model.start, model.end, model.timezone);
        layout[2][3][2][0][1].value = model.attendees ? model.attendees.join(', ') : '';
        layout[2][3][2][1][1].value = model.reminders && model.reminders.length ? model.reminders.join(' min, ') + ' min' : '';
        load(layout).then(function() {
            aps.app.onPrev = function() {
                meta.wizard(data);
                aps.apsc.gotoView('event.new0');
            };
            aps.app.onSubmit = function() {
                xhr.post('/aps/2/resources/' + aps.context.vars.calendar.aps.id + '/scheduleEvent', {
                    data: JSON.stringify(model)
                }).then(function() {
                    meta.wizard(['Event was successfully scheduled!', 'info', true]);
                    aps.apsc.gotoView('mycp.view');
                }, meta.showMsg);
            };
            aps.app.onCancel = function() {
                meta.wizard();
                aps.apsc.gotoView('mycp.view');
            };
        });
    }

    function eventView(xhr) {
        var event = aps.context.vars.target;
        xhr.get('/aps/2/resources/' + event.aps.id + '/calendar').then(function(calendar) {
            calendar = calendar[0];
            layout[2].unshift(['aps/FieldSet', {
                    id: 'fs-calendar',
                    title: 'Calendar info'
                },
                [
                    ['aps/Output', {
                        id: 'ou-cal-name',
                        label: 'Name',
                        value: calendar.name
                    }],
                    ['aps/Output', {
                        id: 'ou-cal-desc',
                        label: 'Description',
                        value: calendar.description
                    }],
                    ['aps/Output', {
                        id: 'ou-cal-tz',
                        label: 'Timezone',
                        value: meta.timezoneInfo(calendar.timezone)
                    }]
                ]
            ]);
            layout[2][1][2][0][1].value = event.summary;
            layout[2][1][2][1][1].value = event.description;
            layout[2][1][2][2][1].value = event.location;
            layout[2][2][2][0][1].value = m(event.start).format(meta.timeFormat);
            layout[2][2][2][1][1].value = m(event.end).format(meta.timeFormat);
            layout[2][2][2][2][1].value = meta.timezoneInfo(event.timezone, dt);
            layout[2][2][2][3][1].value = meta.eventStatus(dt, event.start, event.end, event.timezone);
            layout[2][3][2][0][1].value = event.attendees ? event.attendees.join(', ') : '';
            layout[2][3][2][1][1].value = event.reminders && event.reminders.length ? event.reminders.join(' min, ') + ' min' : '';
            load(layout).then(function() {
                aps.app.onPrev = function() {
                    aps.apsc.gotoView('calendar.view', calendar.aps.id);
                };
            });
        });

    }

    function myCPEventView(xhr) {
        var data = meta.wizard();
        if (!data) {
            aps.apsc.gotoView('mycp.view');
            return;
        }
        xhr.get('/aps/2/resources/' + aps.context.vars.calendar.aps.id + '/getEvent', {
            query: {
                id: data.id
            }
        }).then(function(event) {
            layout[2][0][2][0][1].value = event.summary;
            layout[2][0][2][1][1].value = event.description;
            layout[2][0][2][2][1].value = event.location;
            layout[2][1][2][0][1].value = m(event.start).format(meta.timeFormat);
            layout[2][1][2][1][1].value = m(event.end).format(meta.timeFormat);
            layout[2][1][2][2][1].value = meta.timezoneInfo(event.timezone, dt);
            layout[2][1][2][3][1].value = meta.eventStatus(dt, event.start, event.end, event.timezone);
            layout[2][2][2][0][1].value = event.attendees ? event.attendees.join(', ') : '';
            layout[2][2][2][1][1].value = event.reminders && event.reminders.length ? event.reminders.join(' min, ') + ' min' : '';
            load(layout).then(function() {
                aps.app.onPrev = function() {
                    aps.apsc.gotoView('mycp.view');
                };
                aps.app.onSubmit = function() {
                    if (confirm('Are you sure that you want to cancel this event (notifications will be sent to attendees)?')) {
                        xhr.post('/aps/2/resources/' + aps.context.vars.calendar.aps.id + '/cancelEvent', {
                            data: data.id
                        }).then(function() {
                            meta.wizard(['Event "' + event.summary + '" was successfully canceled!', 'info', true]);
                            aps.apsc.gotoView('mycp.view');
                        }, meta.showMsg);
                    }
                };
            });
        });
    }
});