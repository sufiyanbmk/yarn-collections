// const { response } = require("express");

function addToCart(proId,stock) {
  if(parseInt(stock) <= 0){

    swal("out of Stock!", "", "failed");
  }
  else{  
  $.ajax({
    url: "/add-to-cart/" + proId,
    type: "post",
    success: (response) => {
      if (response.status) {
        $("#singleProductCartDiv").load(location.href + " #singleProductCartDiv");
             let count = $('#cartCount').html()
             count = parseInt(count)+1
             $('#cartCount').html(count)
      } else {
        location.href = "/login";
      }
    },
  });
}
}
function deleteCart(proId) {
  $.ajax({
    url: "/delete/" + proId,
    type: "delete",
    success: (response) => {
      $("#changeCartDiv").load(location.href+" #changeCartDiv>*",""); 
    },
  });
}

