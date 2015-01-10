require(['js/meta.js', 'js/lib/moment.js', 'dojo/text!./js/timezoneList.json', 'dojox/mvc/getStateful', 'dojox/mvc/at', 'dojox/mvc/getPlainValue', 'aps/load', 'dijit/registry'], function(meta, moment, tzList, getStateful, at, getPlainValue, load, registry) {
    if (!meta.check({
            'event.new0': [
                ['dojo/text!./js/modelEvent.json', 'dojo/text!./js/newEventWizard.json'],
                eventNew
            ]
        }))
        return;
    var dt = moment.utc(),
        layout = ['aps/PageContainer', {
                id: 'page-container'
            },
            [
                ['aps/FieldSet', {
                        id: 'fs-general',
                        title: 'General information'
                    },
                    [
                        ['aps/TextBox', {
                            id: 'tb-summary',
                            label: 'Summary',
                            placeholder: 'Title for the event',
                            size: 40,
                            required: true
                        }],
                        ['aps/TextArea', {
                            id: 'ta-description',
                            label: 'Description',
                            placeholder: 'Describe the event',
                            cols: 56,
                            rows: 10
                        }],
                        ['aps/TextBox', {
                            id: 'tb-location',
                            label: 'Location',
                            placeholder: 'Location of the event',
                            size: 40
                        }]
                    ]
                ],
                ['aps/FieldSet', {
                        id: 'fs-timings',
                        title: 'Timings'
                    },
                    [
                        ['aps/TextBox', {
                            id: 'tb-start',
                            label: 'Start time',
                            placeholder: 'Event start date and time',
                            required: true
                        }],
                        ['aps/TextBox', {
                            id: 'tb-end',
                            label: 'End time',
                            placeholder: 'Event end date and time',
                            required: true
                        }],
                        ['aps/Select', {
                            id: 'sel-timezone',
                            label: 'Timezone',
                            options: JSON.parse(tzList).map(function(v) {
                                return {
                                    label: v + dt.clone().tz(v).format(' (UTCZ, ' + meta.timeFormat + ')'),
                                    value: v
                                };
                            })
                        }]
                    ]
                ],
                ['aps/FieldSet', {
                        id: 'fs-other',
                        title: 'People and reminders'
                    },
                    [
                        ['aps/TextArea', {
                            id: 'tb-attendees',
                            label: 'Attendees',
                            placeholder: 'Attendees\' emails, separated by comma',
                            cols: 40,
                            rows: 5
                        }],
                        ['aps/TextBox', {
                            id: 'tb-reminders',
                            label: 'Reminders',
                            placeholder: 'Minutes before event start, separated by comma',
                            size: 40
                        }]
                    ]
                ]
            ]
        ];
    meta.run();

    function eventNew(modelEvent, newEventWizard) {
        var data = meta.wizard(),
            model = getStateful(data ? data.model : JSON.parse(modelEvent)),
            steps = JSON.parse(newEventWizard),
            gTimeFormat = 'YYYY-MM-DDTHH:mm:ss.SSS';
        steps[0].active = true;
        layout[2].unshift(['aps/WizardControl', {
            id: 'wc-wizard',
            steps: steps
        }]);
        if (!data) {
            model.timezone = aps.context.vars.calendar.timezone;
            model.start = dt.clone().add(30, 'm').tz(model.timezone).format(gTimeFormat);
            model.end = dt.clone().add(60, 'm').tz(model.timezone).format(gTimeFormat);
            data = {};
            data.model = model;
        }
        layout[2][1][2][0][1].value = at(model, 'summary');
        layout[2][1][2][1][1].value = at(model, 'description');
        layout[2][1][2][2][1].value = at(model, 'location');
        var timeTransform = {
            format: function(v) {
                return moment(v).format(meta.timeFormat);
            },
            parse: function(v) {
                v = moment(v);
                return v.isValid() ? v.format(gTimeFormat) : '';
            }
        };
        layout[2][2][2][0][1].value = at(model, 'start').transform(timeTransform);
        layout[2][2][2][1][1].value = at(model, 'end').transform(timeTransform);
        layout[2][2][2][0][1].validator = layout[2][2][2][1][1].validator = function(v) {
            return moment(v).isValid();
        };
        layout[2][2][2][2][1].value = at(model, 'timezone');
        layout[2][3][2][0][1].value = at(model, 'attendees').transform({
            format: function(v) {
                return v ? v.join(', ') : '';
            },
            parse: function(v) {
                return meta.globalMatch(v, /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}),? */i).map(function(v) {
                    return v[1];
                });
            }
        });
        layout[2][3][2][1][1].value = at(model, 'reminders').transform({
            format: function(v) {
                return v ? v.join(', ') : '';
            },
            parse: function(v) {
                return meta.globalMatch(v, /([0-9]+),? */).map(function(v) {
                    return parseInt(v[1]);
                }).filter(function(v) {
                    return (v > 0) && (v <= (10 * 365 * 24 * 60));
                });
            }
        });
        load(layout).then(function() {
            var prevTimezone = model.timezone;
            registry.byId('sel-timezone').on('change', function(v) {
                var tmp = moment.tz(model.start, prevTimezone);
                model.set('start', tmp.tz(v).format(tmp._f));
                tmp = moment.tz(model.end, prevTimezone);
                model.set('end', tmp.tz(v).format(tmp._f));
                prevTimezone = v;
            });
            aps.app.onNext = function() {
                var page = registry.byId('page-container');
                meta.clearMessages(page);
                console.log(data);                               
                if (!page.validate() || !(function() {
                        var dt = moment.tz(model.timezone),
                            start = moment.tz(model.start, model.timezone),
                            end = moment.tz(model.end, model.timezone);
                        if (start.isBefore(dt)) {
                            meta.showMsg('Event start time is in the past!', 'error', true);
                            return false;
                        }
                        if (end.isBefore(dt)) {
                            meta.showMsg('Event end time is in the past!', 'error', true);
                            return false;
                        }
                        if (end.isBefore(start)) {
                            meta.showMsg('Event end time is before the start time!', 'error', true);
                            return false;
                        }
                        return true;
                    })()) {
                    aps.apsc.cancelProcessing();
                    return;
                }
                data.model = getPlainValue(model);
                meta.wizard(data);
                aps.apsc.gotoView('event.new1');
            }
            aps.app.onCancel = function() {
                aps.apsc.gotoView('mycp.view');
            }
        });
    }
});