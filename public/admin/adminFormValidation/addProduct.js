function fname() {
  let name = document.getElementById("name").value;
  let error1 = document.getElementById("error1");

  if (name.trim() == "") {
    error1.innerHTML = "Enter the product name";
    return false;
  } else {
    error1.innerHTML = "";
    return true;
  }
}

function description() {
  let description = document.getElementById("description").value;
  let error2 = document.getElementById("error2");
  if (description.trim() == "") {
    error2.innerHTML = "Enter the description";
    return false;
  } else if (description.length < 10) {
    error2.innerHTML = "Enter atleast 10 character";
    return false;
  } else {
    error2.innerHTML = "";
    return true;
  }
}

function category() {
  let category = document.getElementById("category").value;
  let error3 = document.getElementById("error3");
  if (category == "") {
    error3.innerHTML = "please chose catagory";
    return false;
  } else {
    error3.innerHTML = "";
    return true;
  }
}
function price() {
  let price = document.getElementById("price").value;
  let error4 = document.getElementById("error4");
  if (price == "") {
    error4.innerHTML = "Enter the price";
    return false;
  } else if (price.match(/^[A-Za-z]+$/)) {
    error4.innerHTML = "Please Enter valid number";
    return false;
  } else {
    error4.innerHTML = "";
    return true;
  }
}
function offerprice() {
  let priceCheck = document.getElementById('price').value;
  let offerprice = document.getElementById("offerprice").value;
  let error5 = document.getElementById("error5");
  if (offerprice == "") {
    error5.innerHTML = "Enter the offer price";
    return false;
  }else if(priceCheck <= offerprice ){
    error5.innerHTML = 'Plese Give Discount Amount'
  }
   else if (offerprice.match(/^[A-Za-z]+$/)) {
    error5.innerHTML = "Please Enter valid number";
    return false;
  } else {
    error5.innerHTML = "";
    return true;
  }
}
function stock() {
  let stock = document.getElementById("stock").value;
  let error6 = document.getElementById("error6");
  if (stock.trim() == "") {
    error6.innerHTML = "Enter the number";
    return false;
  } else if (stock.match(/^[A-Za-z]+$/)) {
    error6.innerHTML = "Please Enter valid number";
    return false;
  } else {
    error6.innerHTML = "";
    return true;
  }
}
function image() {
  let image = document.getElementById("image").value;
  let error7 = document.getElementById("error7");
  if (image == "") {
    alert("please upload a image");
    return false;
  } else {
    return true;
  }
}

function valid() {
  fname();
  description();
  category();
  price();
  offerprice();
  stock();
  image();
  if (
    fname() &&
    description() &&
    category() &&
    price() &&
    offerprice() &&
    stock() &&
    image() == true
  ) {
    return true;
  } else {
    return false;
  }
}
