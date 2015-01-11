require(['js/meta.js', 'aps/ResourceStore', 'dijit/registry', 'aps/load', 'aps/ready!'], function(meta, Store, registry, load) {
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
                        name: 'Timezone',
                        renderCell: function(item, value) {
                            return meta.timezoneInfo(value, meta.dt);
                        }
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
        registry.byId('btn-delete').on('click', function() {
            if (!confirm('Are you sure that you want to delete all selected calendars and all associated events?')) {
                this.cancel();
                return;
            }
            aps.apsc.showLoading();
            var button = this,
                grid = registry.byId('gr-calendars'),
                selectionArray = grid.get('selectionArray'),
                store = grid.get('store'),
                count = selectionArray.length;
            selectionArray.forEach(function(v) {
                store.remove(v).then(function() {
                    selectionArray.splice(selectionArray.indexOf(v), 1);
                    grid.refresh();
                }, meta.showMsg).always(function() {
                    if (--count === 0) {
                        aps.apsc.hideLoading();
                        button.cancel();
                    }
                });
            });
        });
    });
});