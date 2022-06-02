//-------------------------------------
var m=$vm.module_list['__MODULE__'];
if(m.prefix==undefined) m.prefix="";
if(m.change_status==undefined) m.change_status=0;
//-------------------------------------
m.load=function(){
    //$('#D__ID').scrollTop(0);
    //$(window).scrollTop(0);
    $('#F__ID')[0].reset();
    $('#submit__ID').show();
    $('#delete__ID').hide(); if(m.input!=undefined && m.input.record!=undefined && m.input.record._id!==undefined) $('#delete__ID').show();
    console.log(JSON.stringify(m.input))
    if(m.input!=undefined) $vm.deserialize(m.input.record,'#F__ID');
}
//-------------------------------
m.set_file_link=function(tag){
    $('#link_'+tag+'__ID').html("");
    $('#x_'+tag+'__ID').hide();
    var record=m.input.record;
    if(record==undefined) return;
    var filename=record.Data[tag];
    if(filename==undefined){
        filename="";
    }
    else{
        $('#x_'+tag+'__ID').show();
    }
    $('#link_'+tag+'__ID').html(filename);
    var url=record.Table+"/"+record.UID+"-"+tag+"-"+filename;
    $('#link_'+tag+'__ID').on('click',function(){
        if(record._id!==undefined){
            if(filename!="") $vm.open_s3_url(record._id,m.Table,filename,url);
        }
        else alert("No file was found on server.")
    });
    $('#x_'+tag+'__ID').on('click',function(){
        $('#link_'+tag+'__ID').html('');
        $('#x_'+tag+'__ID').hide();
        record.Data[tag]="";
    })
}
//-------------------------------
m.set_image_url=function(tag){
    $obj=$('#'+tag+'__ID');
    $obj.attr('src',"");
    $('#x_'+tag+'__ID').hide();
    var record=m.input.record;
    if(record==undefined) return;
    var filename=record.Data[tag];
    if(filename==undefined || filename==""){
        return;
    }
    else{
        $('#x_'+tag+'__ID').show();
    }
    var modified=record.Update_date;
    if(modified==undefined) modified=record.Submit_date;
    
    var img_id='img_'+tag+'_'+record._id;
    if(m[img_id]!=undefined) $obj.attr('src',m[img_id]);
    else{
        var img_url				=localStorage.getItem(img_id+"_url");
        var img_last_load_date	=localStorage.getItem(img_id+"_last_load_date");
        var img_modified		=localStorage.getItem(img_id+"_modified");
        var D1=new Date();
        var D0=new Date(img_last_load_date);
        var dif=D1.getTime()-D0.getTime();
        dif=dif/1000/3600/24;
        if(img_url!==null && dif<6 && img_modified==modified){
            m[img_id]=img_url;
            $obj.attr('src',img_url);
        }
        else{
            var expires=7*24*3600;
            var url=record.Table+"/"+record.UID+"-"+tag+"-"+filename;
            $vm.request({cmd:"s3_download_url",id:record._id,table:record.Table,filename:filename,url:url,expires:expires},function(res){
                if(res.status=="np"){
                    alert("No permission.")
                    return;
                }
                m[img_id]=res.result;
                $obj.attr('src',res.result);
                localStorage.setItem(img_id+"_url",res.result);
                localStorage.setItem(img_id+"_last_load_date",new Date().toString());
                localStorage.setItem(img_id+"_modified",modified);
            });
        }
    }
    $('#x_'+tag+'__ID').on('click',function(){
        $obj.attr('src',"");
        $('#x_'+tag+'__ID').hide();
        record.Data[tag]="";
    })
}
//-------------------------------
m.submit=function(event){
    //--------------------------------------------------------
    event.preventDefault();
    $('#submit__ID').hide();
    //--------------------------------------------------------
    var data={};
    var index={};
    var data_new=$vm.serialize('#F__ID');
    if(m.input!=undefined && m.input.record!=undefined){
        for(k in m.input.record.Data){
            data[k]=m.input.record.Data[k];
        }
    }
    if(data_new!=undefined){
        for(k in data_new){
            data[k]=data_new[k];
        }
    }
    delete data[""];
    var file=$vm.serialize_file('#F__ID');
    var FN=0; $('#F__ID').find('input[type=file]').each(function(evt){ if(this.files.length==1) FN++; });
    var r=true;
    if(m.before_submit!=undefined) r=m.before_submit(data,index);
    if(r==false){$('#submit__ID').show(); return;}
    //--------------------------------------------------------
    var rid=undefined; if(m.input!=undefined && m.input.record!=undefined) rid=m.input.record._id;
    if(rid==undefined){
        var i_cmd="insert";
        if(m.cmd_type=='table') i_cmd='insert-table';
        $vm.request({cmd:i_cmd,table:m.Table,data:data,index:index,file:file},function(res){
            if(res.status=="np"){
                alert("No permission to insert a new record in to the database.");
                if(m.input!=undefined && m.input.goback!=undefined){
                    $vm.refresh=1;
                    window.history.go(-1);       //from grid
                }
                return;
            }
            var after_submit=function(){
                if(m.after_insert!=undefined){
                    m.after_insert(data,res); return;
                }
                $vm.refresh=1;
                //if(m.change_status==undefined) m.change_status=0;
                m.change_status++;
                if(m.input.goback!=undefined) window.history.go(-1);            //from grid
                else { 
                    //Special for progress form                   
                    $vm.refresh=1;
                    window.history.go(-1);       //from form
                }
            }
            if(FN==0) after_submit();
            else{
                open_model__ID();
                $vm.upload_form_files(res,$('#F__ID'),"msg__ID",function(){
                    close_model__ID();
                    after_submit();
                })
            }
            //-----------------------------
        });
    }
    else if(rid!=undefined){
        var cmd="update";
        if(m.cmd_type=='p1') cmd='update-p1';
        if(m.cmd_type=='p2') cmd='update-p2';
        if(m.cmd_type=='table') cmd='update-table';
        $vm.request({cmd:cmd,id:rid,table:m.Table,data:data,index:index,file:file},function(res){
            //-----------------------------
            if(res.status=="lk"){
                $vm.alert("This record is locked.");
                return;
            }
            //-----------------------------
            if(res.status=="np"){
                alert("No permission to update this record.");
                return;
            }
            //-----------------------------
            var after_submit=function(){
                if(m.after_update!=undefined){
                    m.after_update(data,res); return;
                }
                $vm.refresh=1;
                //if(m.change_status==undefined) m.change_status=0;
                m.change_status++;
                if(rid!=undefined) window.history.go(-1);                       //modify
            }
            //-----------------------------
            if(FN==0) after_submit();
            else{
                open_model__ID();
                $vm.upload_form_files(res,$('#F__ID'),"msg__ID",function(){
                    close_model__ID();
                    after_submit();
                })
            }
            //-----------------------------
        });
    }
}
//--------------------------------------------------------
$('#D__ID').on('load',function(){ m.load();})
$('#F__ID').submit(function(event){m.submit(event);})
//--------------------------------------------------------
$('#delete__ID').on('click', function(){
    var record=m.input.record;    if(record==undefined) return;
    var rid=record._id;           if(rid==undefined)    return;
    if(confirm("Are you sure to delete?\n")){
        var d_cmd="delete";
        if(m.cmd_type=='table') cmd='delete-table';
        $vm.request({cmd:d_cmd,id:rid,table:m.Table},function(res){
            //-----------------------------
            if(res.status=="lk"){
                $vm.alert("This record is locked.");
                return;
            }
            //-----------------------------
            if(res.status=="np"){
                alert("No permission to delete this record.");
                return;
            }
            //-----------------------------
            if(m.after_delete!=undefined){
                m.after_delete(res); 
                return;
            }
            //-------------------------------
            $vm.refresh=1;
            //if(m.change_status==undefined) m.change_status=0;
            m.change_status++;
            window.history.go(-1);
        });
    }
})
//-------------------------------------
$('#copy__ID').on('click',function(){
    if($vm.copy_paste==undefined) $vm.copy_paste={}
    $vm.copy_paste['__ID']={Data:$vm.serialize('#F__ID')};
    console.log($vm.copy_paste['__ID'])
})
//---------------------------------------------
$('#paste__ID').on('click',function(){
    if($vm.copy_paste!=undefined && $vm.copy_paste['__ID']!=null){
        $vm.deserialize($vm.copy_paste['__ID'],'#F__ID');
        if(m.paste!=undefined) m.paste($vm.copy_paste['__ID']);
    }
})
//---------------------------------------------
$('#header__ID').on('click', function(event){
    if(event.ctrlKey){
        var x=document.getElementById("F__ID");
        var txt="";var nm0="";
        for (var i=0; i < x.length; i++) {
            var nm=x.elements[i].getAttribute("name");
            if(nm!=null && nm!=nm0){ if(txt!="") txt+=", "; txt+=nm; nm0=nm;}
        }
        console.log(txt);
    }
});
//--------------------------------------------------------
$('#pdf__ID').on('click',function(){
    $('#D__ID').scrollTop(0);
    $(window).scrollTop(0);
    var h=$('#D__ID').css('height');
    $('#D__ID').css('height',"210mm");
    $('form_container__ID').css('height',"297mm");
    $('#F__ID').css('border-bottom-width','0');
    $('#submit__ID').hide();
    $('#pdf__ID').hide();
    var pdf=new jsPDF('p', 'pt', 'a4');
    //pdf.internal.scaleFactor = 2.25;
    var options = {
        //pagesplit: true,
        background: '#fff'
    };
    pdf.addHTML($('#form_container__ID'),options,function() {
        pdf.save(m.Table+'.pdf');
        $('#F__ID').css('border-bottom-width','1px');
        $('#submit__ID').show();
        $('#pdf__ID').show();
        $('#D__ID').css('height',h);
    });
    
})
//-------------------------------------
