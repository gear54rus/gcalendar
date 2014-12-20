require(['dojo/text!./js/timezoneList.json', 'dojo/text!./js/modelCalendar.json', 'dojox/mvc/getStateful', 'dojox/mvc/at', 'dijit/registry', 'aps/load', 'aps/ready!', ], function(tzList, modelCalendar, getStateful, at, registry, load) {
    tzList = JSON.parse(tzList);
    var tmp = [],
        tmp1;
    for (k in tzList) {
        tmp1 = {label: k, value: tzList[k].toString()};
        if (tmp1.value === '0')
            tmp1.selected = true;
        tmp.push(tmp1);        
    }
    tzList = tmp;
    var model = JSON.parse(modelCalendar),
        user = getStateful(aps.context.params.user);
        model.name = user.displayName + '\'s calendar';
    load(['aps/PageContainer', {},
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
                        cols: 30,
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
    ]).then(function() {
        aps.app.onCancel = function() {
            aps.apsc.gotoView('calendars');
        };

    });

});