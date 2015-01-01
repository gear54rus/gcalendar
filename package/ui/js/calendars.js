require(['aps/ResourceStore', 'aps/load', 'aps/ready!'], function(Store, load) {
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
                    apsResourceViewId: 'calendar.new',
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
                                iconClass: 'sb-create',
                                label: 'Create',
                                requireItems: true
                            }],
                            ['aps/ToolbarButton', {
                                id: 'btn-delete',
                                iconClass: 'sb-delete',
                                label: 'Remove',
                                requireItems: true
                            }]
                        ]
                    ]
                ]
            ]
        ]
    ]);
});