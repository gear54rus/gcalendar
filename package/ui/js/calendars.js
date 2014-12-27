require(['aps/ResourceStore', 'dijit/registry', 'aps/load', 'aps/ready!'], function(Store, registry, load) {
    var store = new Store({
        apsType: 'http://aps.google.com/gcalendar/calendar/1.0',
        target: '/aps/2/resources/'
    });
    load(['aps/PageContainer', {
            id: 'page-container'
        },
        [
            ['aps/Grid', {
                    id: 'grid',
                    store: store,
                    selectionMode: "multiple",
                    apsResourceViewId: "calendar.new",
                    columns: [{
                        field: 'name',
                        name: 'Name',
                        type: "resourceName"
                    }]
                },
                [
                    ['aps/Toolbar', {},
                        [
                            ["aps/ToolbarButton", {
                                id: "btn-delete",
                                iconClass: "sb-delete",
                                label: "Remove",
                                requireItems: true
                            }],
                            ["aps/ToolbarButton", {
                                id: "btn-refresh",
                                iconClass: "sb-refresh",
                                label: "Refresh",
                                autoBusy: false
                            }]
                        ]
                    ]
                ]
            ]
        ]
    ]).then(function() {

    });
});