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
        document.getElementById("sendCouponId").value = response._id;
      } else {
        if (response.dateChecked){
          alert('date expired')
          swal("out of Stock!", "", "failed");
          document.getElementById("errMsg").innerHTML = response.dateInvalidMessage;
        } else if (response.minChecked) {
          alert('minimum amount')
          document.getElementById("errMsg").innerHTML = response.minAmoutMsg;
        } else if(response.usedCoupon){
          alert('used Coupon')
          document.getElementById("errMsg").innerHTML = response.usedCouponMsg;
        }
        else {
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
      location.href = "/view-order";
    },
  });
});
