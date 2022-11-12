function whislistAdd(prodId) {
  $.ajax({
    url: "/addWhislist/" + prodId,
    type: "post",
    success: (response) => {

        swal("Good job!", "Added to Whislist!", "success");
        document.getElementsByClassName('whislistbtn').style.color = "#ff0000";
    },
  });
}

//delete whislist
function deleteWhislist(prodId) {
  $.ajax({
    url: "/whislistDelete/" + prodId,
    type: "delete",
    success: (response) => {
      location.reload();
    },
  });
}
