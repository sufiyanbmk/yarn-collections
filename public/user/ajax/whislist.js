// const { response } = require("../../../app");

function whislistAdd(prodId) {
  $.ajax({
    url: "/addWhislist/" + prodId,
    type: "post",
    success: (response) => {
      if (response.status) {
        document.getElementById('whislistbtn').style.color = '#ff0000';
        let count = $('#whislistCount').html()
        count = parseInt(count)+1
        $('#whislistCount').html(count)
 } else {
   location.href = "/login";
 }
        // swal("Good job!", "Added to Whislist!", "success");
      
        // $("#productCard").load(location.href + " #productCard");
    },
  });
}

//delete whislist
function deleteWhislist(prodId) {
  $.ajax({
    url: "/whislistDelete/" + prodId,
    type: "delete",
    success: (response) => {
      // location.reload();
      // $("#whislistTable").load(location.href + " #whislistTable");
      $("#whislistTable").load(location.href+" #whislistTable>*",""); 
    },
  });
}

//whislist remove

function whislistRemove(proId){
  $.ajax({
    url:"/whislistDelete/" + proId,
    type:"delete",
    success: (response) =>{
      // swal("Bad job!", "Remove From Whislist!", "success" );
      // $("#productCard").load();
      // $("#productCard").load(location.href + " #productCard");
      // document.getElementById('removeWhislist').style.color = '#FFFFFF';
      location.reload()
    }
  })
}

function whislistCounttt(){
  alert('whislist')
  // $.ajax({
  //   url:"/whislistviewCount",
  //   type:'get',
  //   success: ()=>{

  //   }
  // })
}