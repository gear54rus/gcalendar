require(['js/meta.js', 'aps/ResourceStore', 'dojox/mvc/StatefulArray', 'dijit/registry', 'aps/load', 'aps/ready!'], function(meta, Store, StatefulArray, registry, load) {
    var selectionArray = new StatefulArray();
    load(['aps/PageContainer', {
            id: 'page-container'
        },
        [
            ['aps/Grid', {
                    id: 'gr-calendars',
                    store: new Store({
                        target: '/aps/2/resources/' + aps.context.vars.context.aps.id + '/calendars'
                    }),
                    selectionMode: 'multiple',
                    apsResourceViewId: 'calendar.view',
                    columns: [{
                        field: 'name',
                        name: 'Name',
                        type: 'resourceName'
                    }, {
                        field: 'timezone',
                        name: 'Timezone'
                    }]
                },
                [
                    ['aps/Toolbar', {},
                        [
                            ['aps/ToolbarButton', {
                                id: 'btn-create',
                                iconClass: 'sb-add-new',
                                label: 'Create'
                            }],
                            ['aps/ToolbarSeparator'],
                            ['aps/ToolbarButton', {
                                id: 'btn-delete',
                                iconClass: 'sb-app-delete',
                                label: 'Delete',
                                requireItems: true
                            }]
                        ]
                    ]
                ]
            ]
        ]
    ]).then(function() {
        var data = meta.wizard();
        if (data)
            meta.showMsg.apply(this, data);
        registry.byId('btn-create').on('click', function() {
            aps.apsc.gotoView('calendar.new0');
        });
    });
});