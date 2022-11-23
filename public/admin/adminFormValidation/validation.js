
function categoryvalidation() {
    let Catagory = document.getElementById("catagory").value 
    let error1 = document.getElementById('error1');
    if (Catagory.trim() =='') {
        error1.innerHTML = 'Enter the Catagory'
        return false;
    }
    else {
        error1.innerHTML = '';
        return true;
    }
}

function descriptionvalidation() {
    var description = document.getElementById("description").value
    var error2 = document.getElementById("error2");
   
    if (description.trim() =='') {
        error2.innerHTML = 'Enter the Description'
        return false
    }
    else if (description.length < 10) {
        error2.innerHTML = 'Enter Atleast 10 Characters'
        return false;
    }

    else {
        error2.innerhtml = '';
        return true
    }
}

function valid() {
    categoryvalidation();
    descriptionvalidation();
    if (categoryvalidation() === false) {
        return false;
    }
    else if (descriptionvalidation() === false) {
        return false;
    }
    else{
        return true;
    }

}

//grand total 
      var GrandTotal = 0
      let total = document.querySelectorAll('.totalAmount')
      total.forEach((elemnt) => {
        let value = parseInt(elemnt.innerHTML)
        GrandTotal += value
      })
      document.getElementById('sum').innerHTML = GrandTotal