$("#editProfile").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/edit-profile",
    method: "put",
    data: $("#editProfile").serialize(),
    success: (response) => {
      alert();
      swal("Good job!", "Added to Cart! You Can Check There", "success");
      location.reload();
    },
  });
});

//password change
$("#passwordChange").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/change-password",
    method: "put",
    data: $("#passwordChange").serialize(),
    success: (response) => {
        if(response.pswerr){
            alert('wrong password')
         swal("wrong password!", "Try it again", "failed");
            
        }
        else{
      swal("Good job!", "Added to Cart! You Can Check There", "success");
      myFunction()
      let timeout;

      function myFunction() {
        timeout = setTimeout(reload, 2000);
      }

      function reload() {
        
        location.href = "/my-account";
      }
    }
    },

  });
});
