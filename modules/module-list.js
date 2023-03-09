(function(){
    //-------------------------------------------------------------------------------------
    var p=""; //put a unique prefix to avoid conflict with others 
    var H=$vm.hosting_path+"/modules";
    var I=$vm.hosting_path;
    var m=$vm.module_list;
    var api="wapp";
    //-------------------------------------------------------------------------------------
    m[p+"not_elig1"]         ={url:H+"/form-grid/screening/not_elig1.html"}
    m[p+"thank_you"]         ={url:H+"/form-grid/screening/thank_you.html"}
    m[p+"pre-screening-data"]   ={url:H+"/form-grid/screening/eligibility-data.html",Table:"succeed-survey-record",router:1 };
    //m[p+"not_eligphq9"]         ={url:H+"/form-grid/screening/not_eligphq9.html"},
   // m[p+"not_elig2"]         ={url:H+"/form-grid/screening/not_elig2.html"},
    //m[p+"not_elig3"]         ={url:H+"/form-grid/screening/not_elig3.html"},

    if(window.location.toString().indexOf('tb=demo')!=-1){
        for(p in $vm.module_list){
            $vm.module_list[p].Table="demo-"+$vm.module_list[p].Table;
        }
    }

})();
