require(['dojo/text!./js/timezoneList.json', 'dojo/text!./js/modelCalendar.json', 'js/moment.js', 'dojox/mvc/getStateful', 'dojox/mvc/getPlainValue', 'dojox/mvc/at', 'dijit/registry', 'aps/load', 'aps/ready!', ], function(tzList, modelCalendar, moment, getStateful, getPlainValue, at, registry, load) {
    tzList = JSON.parse(tzList);
    var dt = moment(),
        tmp = [];
    tzList.forEach(function(v) {
        tmp.push({
            label: v + ' (UTC' + dt.tz(v).format('Z') + ', ' + dt.tz(v).format('YYYY-MM-DD HH:mm') + ')',
            value: v
        });
    });
    tzList = tmp;
    var model = JSON.parse(modelCalendar),
        user = getStateful(aps.context.params.user);
    model.name = user.displayName + '\'s calendar';
    model.timezone = tzList[0].value;
    load(['aps/PageContainer', {
            id: 'pageContainer'
        },
        [
            ['aps/FieldSet', {
                    id: 'fs-params',
                    title: 'Calendar Parameters'
                },
                [
                    ['aps/TextBox', {
                        id: 'tb-name',
                        label: 'Name',
                        value: at(model, 'name'),
                        size: 40,
                        required: true
                    }],
                    ['aps/TextArea', {
                        id: 'tb-description',
                        label: 'Description',
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
    ]).then(function() {
        aps.app.onNext = function() {
            var page = registry.byId("pageContainer");
            page.get("messageList").removeAll();
            if (!page.validate()) {
                aps.apsc.cancelProcessing();
                return;
            }
           aps.apsc.gotoView("empty", null, { objects: [getPlainValue(model)], userAttr: "user" });
        };
        aps.app.onCancel = function() {
            aps.apsc.gotoView('calendars');
        };

    });

});