$("#editProfile").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/edit-profile",
    method: "put",
    data: $("#editProfile").serialize(),
    success: (response) => {
      $("#editProfileDiv").load(location.href+" #editProfileDiv>*",""); 
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
         swal("wrong password!", "Try it again", "failed");
            
        }
        else{
          $("#changePswDiv").load(location.href+" #changePswDiv>*",""); 
      swal("PassWord Changed!", "", "success");
    }
    },

  });
});


