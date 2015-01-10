require(['js/meta.js', 'js/lib/moment.js', 'aps/load'], function(meta, moment, load) {
    if (!meta.check({
            'event.new1': [
                ['dojo/text!./js/newEventWizard.json', 'aps/xhr'],
                eventNew
            ]
        }))
        return;
    var layout = ['aps/PageContainer', {
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
    meta.run();

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
        console.log(model);
        model.attendees = meta.unique(model.attendees);
        model.reminders = meta.unique(model.reminders);
        console.log(xhr, layout[2][1][2][0][1]);
        console.log(model);
        layout[2][1][2][0][1].value = model.summary;
        layout[2][1][2][1][1].value = model.description;
        layout[2][1][2][2][1].value = model.location;
        layout[2][2][2][0][1].value = moment(model.start).format(meta.timeFormat);
        layout[2][2][2][1][1].value = moment(model.end).format(meta.timeFormat);
        layout[2][2][2][2][1].value = model.timezone;
        layout[2][3][2][0][1].value = model.attendees.join(', ');
        layout[2][3][2][1][1].value = model.reminders.join(', ');
        load(layout).then(function() {
            aps.app.onPrev = function() {
                meta.wizard(data);
                aps.apsc.gotoView('event.new0');
            };
            aps.app.onSubmit = function() {
                xhr.post('/aps/2/resources/' + aps.context.vars.calendar.aps.id + '/scheduleEvent', {
                    data: JSON.stringify(model)
                }).then(function () {
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
});