define(['js/meta.js', 'aps/ResourceStore'], function(meta, Store) {
    return function(parameters) {
        var store;
        if (parameters.calendarId)
            store = new Store({
                target: '/aps/2/resources/' + parameters.calendarId + '/events'
            });
        else if (parameters.storeTarget)
            store = new Store({
                target: parameters.storeTarget
            });
        var m = meta.moment,
            dt = parameters.dateTime ? parameters.dateTime : meta.dt,
            layout = ['aps/Container', {
                    id: 'fs-events',
                    title: 'Events on this calendar'
                },
                [
                    ['aps/Grid', {
                        id: 'gr-events',
                        selectionMode: 'multiple',
                        apsResourceViewId: 'event.view',
                        store: store,
                        columns: [{
                            field: 'summary',
                            name: 'Summary',
                            type: 'resourceName',
                            filter: {
                                title: 'Summary'
                            }
                        }, {
                            field: 'location',
                            name: 'Location'
                        }, {
                            field: 'start',
                            name: 'Start time',
                            renderCell: renderTime
                        }, {
                            field: 'end',
                            name: 'End time',
                            renderCell: renderTime
                        }, {
                            field: 'timezone',
                            name: 'Timezone'
                        }, {
                            name: 'Status (local time)',
                            renderCell: function(item) {
                                return meta.eventStatus(dt, item.start, item.end, item.timezone);
                            }
                        }]
                    }]
                ]
            ];
        if (parameters.overrideMasterDetail) {
            delete layout[2][0][1].apsResourceViewId;
            delete layout[2][0][1].columns[0].type;
            window.gCalendarWizard = meta.wizard;
            layout[2][0][1].columns[0].renderCell = function(item) {
                return '<a href="javascript:gCalendarWizard({id: \'' + item.aps.id + '\'}); aps.apsc.gotoView(\'mycp.event.view\');">' + item.summary + '</a>';
            };
        }
        if (parameters.showControls)
            layout[2][0].push([
                ['aps/Toolbar', {
                        class: 'sid-kapc'
                    },
                    [
                        ['aps/ToolbarButton', {
                            id: 'btn-schedule',
                            iconClass: 'sb-task-add',
                            label: 'Schedule'
                        }],
                        ['aps/ToolbarSeparator'],
                        ['aps/ToolbarButton', {
                            id: 'btn-cancel',
                            iconClass: 'sb-terminate',
                            label: 'Cancel',
                            requireItems: true
                        }]
                    ]
                ]
            ]);
        return layout;

        function renderTime(object, time) {
            return meta.formatTime(time);
        }
    };
});