function whislistAdd(prodId) {
  $.ajax({
    url: "/addWhislist/" + prodId,
    type: "post",
    success: (response) => {
        swal("Good job!", "Added to Whislist!", "success");
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
