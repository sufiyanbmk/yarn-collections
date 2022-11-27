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
          document.getElementById("errMsg").innerHTML = response.dateInvalidMessage;
        } else if (response.minChecked) {
          alert('minimum amount')
          document.getElementById("errMsg").innerHTML = response.maxAmountMsg;
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
//----------remove coupon
function removeCoupon(){
  document.getElementById("applycoupon").disabled = false;
  $("#changeCartDiv").load(location.href+" #changeCartDiv>*",""); 
}

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

//------finding address for editing
function editAddressFind(addId){
 $.ajax({
  url: '/edit-address'+addId,
  method:'get',
  success:(response)=>{
    document.getElementById('name').value = response.details.fname
    document.getElementById('state').value = response.details.state
    document.getElementById('appartment').value = response.details.appartment
    document.getElementById('city').value = response.details.city
    document.getElementById('pincode').value = response.details.pincode
    document.getElementById('phone').value = response.details.phone
    document.getElementById('email').value = response.details.email
    document.getElementById('Id').value = response.addressID
 }
 })
}
//edit address
function submitEditAddress(){
  $.ajax({
    url : '/updat-address',
    method:'patch',
    data: $('#editAddressForm').serialize(),
    success: ()=>{
      // location.reload()
    }
  })
}