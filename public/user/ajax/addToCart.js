// const { response } = require("express");

function addToCart(proId) {
  $.ajax({
    url: "/add-to-cart/" + proId,
    type: "post",
    success: (response) => {
      if (response.status) {
        swal("Good job!", "Added to Cart! You Can Check There", "success");
      } else {
        location.href = "/login";
      }
    },
  });
}

function deleteCart(proId) {
  $.ajax({
    url: "/delete/" + proId,
    type: "delete",
    success: (response) => {
      location.reload();
    },
  });
}
