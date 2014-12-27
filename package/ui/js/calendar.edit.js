require(['dojo/text!./js/timezoneList.json', 'dojo/text!./js/modelCalendar.json', 'js/moment.js', 'dojox/mvc/getStateful', 'dojox/mvc/getPlainValue', 'dojox/mvc/at', 'dijit/registry', 'aps/load', 'aps/ready!', ], function(tzList, modelCalendar, moment, getStateful, getPlainValue, at, registry, load) {
    var suwizard = (mode === 'suwizard.new'),
        dt = moment(),
        tmp = [];
    tzList = JSON.parse(tzList);
    tzList.forEach(function(v) {
        tmp.push({
            label: v + dt.tz(v).format(' (UTCZ, YYYY-MM-DD HH:mm)'),
            value: v
        });
    });
    tzList = tmp;
    var model = JSON.parse(modelCalendar),
        user = getStateful(aps.context.params.user);
    model.name = user.displayName + '\'s calendar';
    model.timezone = tzList[0].value;
    var layout = ['aps/PageContainer', {
            id: 'pageContainer'
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
                        value: at(model, 'name'),
                        size: 40,
                        required: true
                    }],
                    ['aps/TextArea', {
                        id: 'ta-description',
                        label: 'Description',
                        placeholder: 'Describe the calendar',
                        value: at(model, 'description'),
                        cols: 56,
                        rows: 10
                    }],
                    ['aps/Select', {
                        id: 'sel-timezone',
                        label: 'Timezone',
                        value: at(model, 'timezone'),
                        options: tzList
                    }]
                ]
            ]
        ]
    ];
    load(layout).then(function() {
        aps.app.onNext = function() {
            var page = registry.byId('pageContainer');
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
        aps.app.onCancel = function() {
            aps.apsc.gotoView('calendars');
        };

    });

});