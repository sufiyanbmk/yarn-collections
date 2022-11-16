function name() {
    let name = document.getElementById("name").value;
    let error1 = document.getElementById("err1")
    if (name.trim() == '') {
        error1.innerHTML = 'Enter Full Name';
        return false;
    }
    else if (name.length < 6) {
        error1.innerHTML = 'Name Must Be Atleast Four Character';
        return false;
    }
    else if (!name.match(/^[a-zA-Z ]+$/)) {
        error1.innerHTML = 'Enter valid name';
        return false;
    }
    else {
        error1.innerHTML = '';
        return true;
    }
}
function email() {
    var email = document.getElementById("email").value;
    var error1 = document.getElementById("err2");
    if (email == '') {
        error1.innerHTML = 'Enter a Email';
        return false;
    }
    else if(!email.match ('/^[A-Za-z\._\-[0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)')){
        error1.innerHTML = 'Please Insert valid Email'
    }
    else {
        error1.innerHTML = '';
        return true;
    }
}

function phone() {
    var phone = document.getElementById("phone").value;
    var error3 = document.getElementById("err3");
    if (phone == '') {
        error3.innerHTML = 'Enter a Mobile no';
        return false;
    }
    else if (phone.length < 10) {
        error3.innerHTML = 'please Enter 10 Number';
        return false;
    }
    else if (!phone.match(/^\d{10}$/)) {
        error3.innerHTML = 'Please Enter valid number';
        return false;
    }
    else {
        error3.innerHTML = '';

        return true;
    }
}

function passwordvalidate(){
    var pass=document.getElementById('Password').value
    var error4=document.getElementById('err4');
    var regexWhiteSpace= /^\S*$/
    var regexUpperCase= /^(?=.*[A-Z]).*$/
    var regexLowerCase= /^(?=.*[a-z]).*$/
    var regexNumber = /^(?=.*[0-9]).*$/;
    var regexSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/;
    var regexLength = /^.{7,16}$/;
    if(pass==""){
        error4.innerHTML='Password not entered'
    }else if(!regexWhiteSpace.test(pass)){
        error4.innerHTML="Password must not contain Whitespaces."
    }else if(!regexUpperCase.test(pass)){
        error4.innerHTML='Password must have at least one Uppercase Character.'
    }else if(!regexLowerCase.test(pass)){
        error4.innerHTML="Password must have at least one Lowercase Character."
    }else if(!regexNumber.test(pass)){
        error4.innerHTML='Password must contain at least one Digit.'
    }else if(!regexSymbol.test(pass)){
        error4.innerHTML='Password must contain at least one Special Symbol.'
    }else if(!regexLength.test(pass)){
        error4.innerHTML='Password must be 7-16 Characters Long.'
    }else{
        error4.innerHTML=''
        return true
    }
    
}

function validateRepass(){
    var pass=document.getElementById('Password').value
    var repass=document.getElementById('Repassword').value
    var error5 = document.getElementById('err5'); 
   if(repass==''){
    error5.innerHTML='re-password not entered'
    return false
   }else if(pass!=repass){
    error5.innerHTML="Password doesn't match"
    return false
   }else{
    error5.innerHTML=""
    return true
   }
}




function validation() {
    namevalidation();
    emailvalidation();
    phoneNovalidation();
    passwordvalidate();
    validateRepass();
    
    if ( phoneNovalidation() == false) {
        return false;
    }

    else if (emailvalidation() == false) {
        return false;
    }
    else if (namevalidation() == false) {
       return false;
    }
    else if (passwordvalidate() == false) {
        return false;
    }
    else if(validateRepass() == false){
        return false;
    }
    else {
        document.getElementById("submit-btn").style.background = "green";
        return true;
    }
}


//---proceed checkout address validation

$("#name").keyup(function(){
    alert()
})