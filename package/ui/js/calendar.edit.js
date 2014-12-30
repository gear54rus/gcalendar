require(['js/meta.js', 'js/lib/moment.js', 'dojo/text!./js/timezoneList.json', 'dojox/mvc/at', 'aps/load', 'dijit/registry'], function(meta, moment, tzList, at, load, registry) {
    meta.check({
        'suwizard.new': [
            ['dojo/text!./js/modelCalendar.json', 'dojox/mvc/getStateful', 'dojox/mvc/getPlainValue'],
            suwizardNew
        ]
    });
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
                var page = registry.byId('pageContainer');
                page.get('messageList').removeAll();
                if (!page.validate()) {
                    aps.apsc.cancelProcessing();
                    return;
                }
                aps.apsc.gotometa('empty', null, {
                    objects: [getPlainValue(model)],
                    userAttr: 'owner'
                });
            };
            //dis shit don't work?:(
            aps.app.onCancel = function() {
                aps.apsc.gotometa('calendars');
            };
        });
    }

    function calendarEdit() {

    }
});