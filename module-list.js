(function(){
    var modules={
        "not_elig":         {url:"$H/m/not_elig.html"},
        "thanks":         {url:"$H/m/thanks.html"},
        "survey-data": {url:"$H/m/elig-questions-data.html",Table:"success-survey-record",form_module:"survey-form"},
        "survey-form": {url:"$H/m/elig-questions-form.html",Table:"success-survey-record"},
        
    }
    for(p in modules){
        $vm.module_list[p]=modules[p];
        $vm.module_list[p].url=$vm.module_list[p].url.replace('$H',$vm.hosting_path);
    }
    if(window.location.toString().indexOf('tb=demo')!=-1){
        for(p in $vm.module_list){
            $vm.module_list[p].Table="demo-"+$vm.module_list[p].Table;
        }
    }
})();
