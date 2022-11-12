$("#applyCoupon").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/apply-coupon",
    method: "post",
    data: $("#applyCoupon").serialize(),
    success: (response) => {
      if (response.couponVerified) {
        document.getElementById("subTotalValue").innerHTML = response.subtotal;
        document.getElementById("finalAmount").innerHTML = response.amount;
        document.getElementById("errMsg").innerHTML = "";
        //---send values-- to checkout ---=--//

        document.getElementById("sendSubTotal").value = response.subtotal;
        document.getElementById("sendfinalAmount").value = response.amount;
      } else {
        if (response.dateChecked) {
          document.getElementById("errMsg").innerHTML = dateInvalidMessage;
          response.dateInvalidMessage;
        } else if (response.minChecked) {
          document.getElementById("errMsg").innerHTML = response.minAmoutMsg;
        } else {
          document.getElementById("errMsg").innerHTML = response.invalidMessage;
        }
      }
    },
  });
});

//-----------order replace ajax
$("#replace").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/replace-check",
    type: "post",
    data: $("#replace").serialize(),
    success: (response) => {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Your work has been saved",
        showConfirmButton: false,
        timer: 1500,
      });
      location.href = "/my-account";
    },
  });
});
