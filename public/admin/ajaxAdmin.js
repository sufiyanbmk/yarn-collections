// const { response } = require("../../app");

// const { subCatagory } = require("../../controller/adminController");

// const { subCatagory } = require("../../controller/adminController");

//---add sub-catagory
$("#subcatagoryAdd").submit(function(e) {
    e.preventDefault()
    $.ajax({
        url:'/admin/add-sub-catagory',
        data: $("#subcatagoryAdd").serialize(),
        type:'post',
        success:(response)=>{
            $("#subCatagoryTable").load(location.href+" #subCatagoryTable>*",""); 
        }
    })
})

//----edit sub catagory----//
function updateSubCatagory(catId,name){
    $.ajax({
        url: '/admin/delete-subcatagory',
        data:{
            cataId : catId,
            cataName : name
        },
        type: 'put',
        success:(response)=>{
            $("#subCatagoryTable").load(location.href+" #subCatagoryTable>*",""); 

        }
    })
}

//--------catagory selection for sub catagory--------//

$("#category").on("input",function(){
    var catagorySelected = this.value;
    $.ajax({
        url : "/admin/catagory-selection",
        method : 'post',
        data: {
            catagoryName : catagorySelected
        },
        success: (response) => {
            if(response.categories == catagorySelected)
            {
                var subCatagory = response.subCatagories
                if(subCatagory.length>0){
                    $('#subCategory').empty();
                }
                for(let i=0; i < subCatagory.length; i++){                 
                    $("#subCategory").append($("<option />").val(subCatagory[i].name).text(subCatagory[i].name));
                }
            }
        }
    })
})