require(['js/meta.js', 'js/lib/moment.js', 'dojo/text!./js/timezoneList.json', 'dojox/mvc/getStateful', 'dojox/mvc/at', 'dojox/mvc/getPlainValue', 'aps/load', 'dijit/registry'], function(meta, moment, tzList, getStateful, at, getPlainValue, load, registry) {
    if (!meta.check({
            'suwizard.new': [
                ['dojo/text!./js/modelCalendar.json'],
                suwizardNew
            ],
            'calendar.new0': [
                ['dojo/text!./js/modelCalendar.json', 'dojo/text!./js/newCalendarWizard.json', 'aps/ResourceStore', 'dojo/promise/all'],
                calendarNew
            ],
            'calendar.edit': [
                ['aps/ResourceStore'],
                calendarEdit
            ]
        }))
        return;
    var dt = moment.utc(),
        layout = ['aps/PageContainer', {
                id: 'page-container'
            },
            [
                ['aps/FieldSet', {
                        id: 'fs-params',
                        title: 'Calendar parameters'
                    },
                    [
                        ['aps/TextBox', {
                            id: 'tb-name',
                            label: 'Name',
                            placeholder: 'Name the calendar',
                            size: 40,
                            required: true
                        }],
                        ['aps/TextArea', {
                            id: 'ta-description',
                            label: 'Description',
                            placeholder: 'Describe the calendar',
                            cols: 56,
                            rows: 10
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
                ]
            ]
        ];
    meta.run();

    function suwizardNew(modelCalendar) {
        var model = getStateful(JSON.parse(modelCalendar));
        model.name = aps.context.params.user.displayName + '\'s calendar';
        model.timezone = layout[2][0][2][2][1].options[0].value;
        layout[2][0][2][0][1].value = at(model, 'name');
        layout[2][0][2][1][1].value = at(model, 'description');
        layout[2][0][2][2][1].value = at(model, 'timezone');
        load(layout).then(function() {
            aps.app.onNext = function() {
                var page = registry.byId('page-container');
                meta.clearMessages(page);
                if (!page.validate()) {
                    aps.apsc.cancelProcessing();
                    return;
                }
                aps.apsc.gotoView('empty', null, {
                    objects: [getPlainValue(model)],
                    userAttr: 'owner'
                });
            };
        });
    }

    function calendarNew(modelCalendar, newCalendarWizard, Store, all) {
        all([(new Store({
            target: '/aps/2/resources',
            apsType: 'http://aps.google.com/gcalendar/calendar/1.0'
        })).query(), (new Store({
            target: '/aps/2/resources',
            apsType: 'http://parallels.com/aps/types/pa/service-user/1.0'
        })).query()]).then(function(resources) {
            return all([meta.getFull(resources[0]), meta.getFull(resources[1])]);
        }).then(function(resources) {
            var userCount = resources[1].length;
            resources[0].forEach(function(v) {
                resources[1].some(function(v1, k1) {
                    return v1.aps.id === v.owner.aps.id ? (resources[1].splice(k1, 1), true) : false;
                });
            });
            aps.app.onCancel = function() {
                aps.apsc.gotoView('calendars');
            };
            if (!resources[1].length) {
                meta.showMsg((userCount ? 'All your service users already have calendars' : 'There are no service users on your account') + '. Create a service user to proceed.', 'warning', false);
                aps.app.onNext = function() {
                    aps.apsc.cancelProcessing();
                    alert('Create a service user first!');
                };
                return;
            }
            var data = meta.wizard(),
                model = getStateful(data ? data.model : JSON.parse(modelCalendar)),
                steps = JSON.parse(newCalendarWizard),
                users = {};
            steps[0].active = true;
            layout[2].unshift(['aps/WizardControl', {
                id: 'wc-wizard',
                steps: steps
            }], ['aps/FieldSet', {
                    id: 'fs-owner',
                    title: 'Calendar owner'
                },
                [
                    ['aps/Select', {
                        id: 'sel-owner',
                        label: 'Service user',
                        options: resources[1].map(function(v) {
                            users[v.aps.id] = v;
                            return {
                                label: meta.userInfo(v),
                                value: v.aps.id
                            }
                        }),
                        required: true
                    }]
                ]
            ]);
            if (!data) {
                model.owner.aps.id = layout[2][1][2][0][1].options[0].value;
                model.timezone = aps.context.vars.context.defaultTimezone;
                var u = users[model.owner.aps.id];
                model.name = u.displayName + '\'s calendar';
                data = {};
                data.user = meta.userInfo(u);
                data.model = model;
            }
            layout[2][1][2][0][1].value = at(model.owner.aps, 'id');
            layout[2][2][2][0][1].value = at(model, 'name');
            layout[2][2][2][1][1].value = at(model, 'description');
            layout[2][2][2][2][1].value = at(model, 'timezone');
            load(layout).then(function() {
                registry.byId('sel-owner').on('change', function() {
                    var u = users[this.value];
                    model.set('name', u.displayName + '\'s calendar');
                    data.user = meta.userInfo(u);
                });
                aps.app.onNext = function() {
                    var page = registry.byId('page-container');
                    meta.clearMessages(page);
                    if (!page.validate()) {
                        aps.apsc.cancelProcessing();
                        return;
                    }
                    data.model = getPlainValue(model);
                    meta.wizard(data);
                    aps.apsc.gotoView('calendar.new1');
                };
            });
        });
    }

    function calendarEdit(Store) {
        var target;
        meta.getFull(aps.context.vars.target).then(function(resource) {
            target = resource;
            return meta.getFull(resource.owner);
        }).then(function(resource) {
            layout[2].unshift(['aps/FieldSet', {
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
            ]);
            var model = getStateful(aps.context.vars.target);
            layout[2][1][2][0][1].value = at(model, 'name');
            layout[2][1][2][1][1].value = at(model, 'description');
            layout[2][1][2][2][1].value = at(model, 'timezone');
            load(layout).then(function() {
                aps.app.onSubmit = function() {
                    var page = registry.byId('page-container');
                    meta.clearMessages(page);
                    if (!page.validate()) {
                        aps.apsc.cancelProcessing();
                        return;
                    }
                    (new Store({
                        target: '/aps/2/resources'
                    })).put(getPlainValue(model)).then(function() {
                        meta.wizard(['Calendar was successfully updated!', 'info', true]);
                        aps.apsc.gotoView('calendar.view');
                    });
                };
                aps.app.onCancel = function() {
                    aps.apsc.gotoView('calendar.view', target.aps.id);
                };
            });
        });
    }
});