require(['aps/ResourceStore', 'dojox/mvc/StatefulArray', 'dijit/registry', 'aps/load', 'aps/ready!'], function(Store, StatefulArray, registry, load) {
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
        registry.byId('btn-create').on('click', function() {
            aps.apsc.gotoView('calendar.new0');
        });
    });
});
