define(['aps/ResourceStore', 'aps/Memory'], function(Store, Memory) {
    return function(parameters) {
        var store = parameters.calendarId ? (new Store({
                target: '/aps/2/resources/' + parameters.calendarId + '/events'
            })) : (new Memory()),
            result = ['aps/Container', {
                    id: 'fs-events',
                    title: 'Events on this calendar'
                },
                [
                    ['aps/Grid', {
                        id: 'gr-events',
                        store: store,
                        selectionMode: 'multiple',
                        apsResourceViewId: 'event.view',
                        columns: [{
                            field: 'name',
                            name: 'Name',
                            type: 'resourceName'
                        }, {
                            field: 'timezone',
                            name: 'Time Zone'
                        }, {
                            field: 'owner',
                            name: 'Name'
                        }]
                    }]
                ]
            ];
        if (parameters.showControls)
            result[2][0].push([
                ['aps/Toolbar', {
                        class: 'sid-kapc'
                    },
                    [
                        ['aps/ToolbarButton', {
                            id: 'btn-schedule',
                            iconClass: 'sb-task-add',
                            label: 'Schedule'
                        }],
                        ['aps/ToolbarButton', {
                            id: 'btn-cancel',
                            iconClass: 'sb-terminate',
                            label: 'Cancel',
                            requireItems: true
                        }]
                    ]
                ]
            ]);
        return result;
    }
});