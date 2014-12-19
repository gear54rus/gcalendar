require(['aps/ResourceStore', 'aps/load', 'aps/ready!'], function(Store, load){
     load(['aps/PageContainer', [
      ["aps/Toolbar", 
                 [[ "aps/ToolbarButton", {
                        label:      "Export configuration",
                        iconClass:  "sb-export",
                        onClick:    function(){ alert("Hello!"); } } ],
                  [ "aps/ToolbarButton", {
                        label:      "Add New Server",
                        iconClass:  "sb-add-new-server",
                        onClick:    function(){ alert("Hello!"); }
                 }]
     ]]
      ]]).then(function () {
     });
});