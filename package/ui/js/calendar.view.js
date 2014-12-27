require(['dojox/mvc/getStateful', 'aps/load', 'aps/ready!'], function(getStateful, load) {
    var suwizard = (mode === 'suwizard.new'),
        resource = getStateful(aps.context.params.objects[0]);
    console.log(aps.context.params);
    load(['aps/PageContainer', {
            id: 'pageContainer'
        },
        [
            ['aps/FieldSet', {
                    id: 'fs-params',
                    title: 'Calendar parameters'
                },
                [
                    ["aps/Output", {
                        id: "ou-name",
                        label: "Name",
                        value: resource.name
                    }],
                    ["aps/Output", {
                        id: "ou-description",
                        label: "Description",
                        value: resource.description
                    }],
                    ["aps/Output", {
                        id: "ou-timezone",
                        label: "Timezone",
                        value: resource.timezone
                    }]
                ]
            ]
        ]
    ]);
});