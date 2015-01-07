require(['js/meta.js', 'js/lib/moment.js', 'dojo/text!./js/timezoneList.json', 'dojox/mvc/at', 'aps/load', 'dijit/registry'], function(meta, moment, tzList, at, load, registry) {
    if (!meta.check({
            'suwizard.new': [
                ['dojo/text!./js/modelCalendar.json', 'dojox/mvc/getStateful', 'dojox/mvc/getPlainValue'],
                suwizardNew
            ],
            'calendar.new0': [
                ['dojo/text!./js/modelCalendar.json', 'dojo/text!./js/newCalendarWizard.json', 'aps/ResourceStore', 'dojo/promise/all'],
                calendarNew
            ]
        }))
        return;
    var dt = moment(),
        tmp = [];
    tzList = JSON.parse(tzList);
    tzList.forEach(function(v) {
        tmp.push({
            label: v + dt.tz(v).format(' (UTCZ, YYYY-MM-DD HH:mm)'),
            value: v
        });
    });
    tzList = tmp;
    var layout = ['aps/PageContainer', {
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
                        options: tzList
                    }]
                ]
            ]
        ]
    ];
    meta.run();

    function suwizardNew(modelCalendar, getStateful, getPlainValue) {
        var model = JSON.parse(modelCalendar),
            user = getStateful(aps.context.params.user);
        model.name = user.displayName + '\'s calendar';
        model.timezone = tzList[0].value;
        layout[2][0][2][0][1].value = at(model, 'name');
        layout[2][0][2][1][1].value = at(model, 'description');
        layout[2][0][2][2][1].value = at(model, 'timezone');
        load(layout).then(function() {
            aps.app.onNext = function() {
                var page = registry.byId('page-container');
                page.get('messageList').removeAll();
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
            aps.app.onCancel = function () {
                aps.apsc.gotoView('calendars');
            };
            if (!resources[1].length) {
                meta.showMsg((userCount ? 'All your service users already have calendars' : 'There are no service users on your account') + '. Create a service user to proceed.', 'warning', false);
                aps.app.onNext = function () {
                    alert('Create a service user first!');                    
                };
                return false;
            }
            var steps = JSON.parse(newCalendarWizard),
                model = JSON.parse(modelCalendar),
                users = {};
            steps[0].active = true;
            layout[2][0][2][0][1].value = at(model, 'name');
            layout[2][0][2][1][1].value = at(model, 'description');
            layout[2][0][2][2][1].value = at(model, 'timezone');
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
                        ['aps/Select', {
                            id: 'sel-owner',
                            label: 'Service User',
                            value: at(model.owner.aps, 'id'),
                            required: true
                        }]
                    ]
                ],
                layout[2][0]
            ];
            layout[2][1][2][0][1].options = [];
            resources[1].forEach(function(v) {
                users[v.aps.id] = v;
                layout[2][1][2][0][1].options.push({
                    label: v.displayName + ' (' + v.login + ' )',
                    value: v.aps.id
                });
            });
            model.owner.aps.id = layout[2][1][2][0][1].options[0].value;
            model.name = users[model.owner.aps.id].displayName + '\'s calendar';
            model.timezone = tzList[0].value;
            load(layout).then(function() {
                registry.byId('sel-owner').on('change', function() {
                    registry.byId('tb-name').set('value', users[this.value].displayName + '\'s calendar');
                });
            });
            console.log(aps);
            aps.app.onNext = function () {
                aps.apsc.gotoView('calendar.new1');
            };
        });
    }

    function calendarEdit() {

    }
});