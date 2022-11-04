function changeQuantity(cartId,proId,userId,count,quantity){
    // let quantity = parseInt(document.getElementById(proId).value)
    // console.log(quantity);
    $.ajax({
        url:'/changeQuantity',
        data:{
            user:userId,
            cart : cartId,
            product: proId,
            count: count,
            quantity:quantity
        },
        method:'post',
        success:(response)=>{
            if(response.removeProduct){
                alert('product removed')
                location.reload()
            }
        //  document.getElementById('total'),innerHTML=response.total 
        location.reload()
        }
    })

}