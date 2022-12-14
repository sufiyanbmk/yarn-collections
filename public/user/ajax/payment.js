// $("#editAddressBtn").on("click", (e) => {
//     e.preventDefault()
//     console.log("clicked me");
//     $('#editModal').modal('show');
// });

$("#placeOrderBtn").on("click", (e) => {
    e.preventDefault()
    const addressId = $('input[name="address"]:checked').val();
    const userID = $('input[name="userId"]').val();
    const paymentMethod = $('input[name="paymentMethod"]:checked').val();
    const subtotal = $('input[name="subtotal"]').val();
    const couponAmt = $('input[name = "couponAmt"]').val()
    const coupId = $('input[name ="couponID"]').val()

    $.ajax({
        url: '/placeOrder',
        method: 'post',
        data: {
            addressID: addressId,
            userId: userID,
            paymentMethod: paymentMethod,
            subtotal: subtotal,
            couponAmt: couponAmt,
            couponId:coupId
        },
        success: (response) => {
            if (response.codSuccess) {

                document.location.href = '/orderplaced'
            } else if (response.unknown) {

                razorpayPayment(response)
            }
            else if (response.walletSucces) {
                document.location.href = '/orderplaced'
            }
            else if (response.walletPaymentFail) {
             alert("you don't have enough balance")
            }
            else {
                document.location.href = response.href
            }
        }
    })

})
function razorpayPayment(order) {
    var options = {
        "key": "rzp_test_oXgNaRuBSLuUSI", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "YARN FASHIONS",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {
    
            verifyPayment(response, order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        },
        "modal":{
            ondismiss:function(){
                $.ajax({
                    url:'/razorpayDismisal',
                    data:{
                        orderId:order
                    },
                    method:'delete',
                    success:(response)=>{
                        
                    }
                })
            }
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.on('payment.failed',function(response){
            $.ajax({
                    url:'/razorPayFailed',
                    data:{
                        orderId:order
                    },
                    method:'delete',
                    success:(response)=>{
                        rzp1.close()
                        alert('succes')
                    location.href = '/payment-failed'
                    }
                })
    })
    rzp1.open();
}
function verifyPayment(payment, order) {
    $.ajax({
        url: '/verify-payment',
        data: {
            payment,
            order
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                document.location.href = '/orderplaced'
            } else {
                alert("payment failed")
            }
        }
    })
}