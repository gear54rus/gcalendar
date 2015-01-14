define(['js/meta.js', 'aps/ResourceStore'], function(meta, Store) {
    return function(parameters) {
        function renderTime(object, time) {
            return meta.formatTime(time);
        }
        var store;
        if (parameters.calendarId)
            store = new Store({
                target: '/aps/2/resources/' + parameters.calendarId + '/events'
            });
        else if (parameters.storeTarget)
            store = new Store({
                target: parameters.storeTarget
            });
        var dt = parameters.dateTime ? parameters.dateTime : meta.dt,
            layout = ['aps/Container', {
                    id: 'fs-events',
                    title: 'Events on this calendar'
                },
                [
                    ['aps/Grid', {
                        id: 'gr-events',
                        selectionMode: 'multiple',
                        store: store,
                        columns: [{
                            field: 'summary',
                            name: 'Summary'
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
            window.gCalendarWizard = meta.wizard;
            layout[2][0][1].columns[0].renderCell = function(item) {
                return '<a href="javascript:gCalendarWizard({id: \'' + item.aps.id + '\'}); aps.apsc.gotoView(\'mycp.event.view\');">' + item.summary + '</a>';
            };
        } else {
            layout[2][0][1].apsResourceViewId = 'event.view';
            layout[2][0][1].columns[0].type = 'resourceName';
        }
        if (!parameters.hideControls)
            layout[2][0].push([
                ['aps/Toolbar', {
                        'class': 'sid-kapc'
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
        if (!parameters.hideFilters) {
            layout[2][0][1].columns[0].filter = {
                title: 'Summary'
            };
            layout[2][0][1].columns[1].filter = {
                title: 'Location'
            };
            layout[2][0][1].columns[2].filter = {
                title: 'Start time'
            };
            layout[2][0][1].columns[3].filter = {
                title: 'End time'
            };
            layout[2][0][1].columns[4].filter = {
                title: 'Timezone'
            };
        }
        console.log(layout);
        return layout;
    };
});