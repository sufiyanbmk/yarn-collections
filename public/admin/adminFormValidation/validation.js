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

//---coupon form validation
// function couponCode(){
//     var pass=document.getElementById('code').value
//     var error4=document.getElementById('errorCode');
//     var regexWhiteSpace= /^\S*$/
//     var regexUpperCase= /^(?=.*[A-Z]).*$/
//     var regexLowerCase= /^(?=.*[a-z]).*$/
//     var regexNumber = /^(?=.*[0-9]).*$/;
//     var regexSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/;
//     var regexLength = /^.{7,16}$/;
//     if(pass==""){
//         error4.innerHTML='Password not entered'
//     }else if(!regexWhiteSpace.test(pass)){
//         error4.innerHTML="Password must not contain Whitespaces."
//     }else if(!regexUpperCase.test(pass)){
//         error4.innerHTML='Password must have at least one Uppercase Character.'
//     }else if(!regexLowerCase.test(pass)){
//         error4.innerHTML="Password must have at least one Lowercase Character."
//     }else if(!regexNumber.test(pass)){
//         error4.innerHTML='Password must contain at least one Digit.'
//     }else if(!regexSymbol.test(pass)){
//         error4.innerHTML='Password must contain at least one Special Symbol.'
//     }else if(!regexLength.test(pass)){
//         error4.innerHTML='Password must be 7-16 Characters Long.'
//     }else{
//         error4.innerHTML=''
//         return true
//     }
// }


// $('#code').keyup(function () {
//     couponCode();
// });

// function couponvalid()
// {
//     couponCode();
//     if(couponCode() == false){
//         return false;
//     }
//     else{
//         return true
//     }
// }