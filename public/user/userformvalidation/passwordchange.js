function cpassword(){
    var pass=document.getElementById('currentpassword').value
    var error4=document.getElementById('error1');
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
function newpassword(){
    var newpass=document.getElementById('new').value
    var error4=document.getElementById('error2');
    var regexWhiteSpace= /^\S*$/
    var regexUpperCase= /^(?=.*[A-Z]).*$/
    var regexLowerCase= /^(?=.*[a-z]).*$/
    var regexNumber = /^(?=.*[0-9]).*$/;
    var regexSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/;
    var regexLength = /^.{7,16}$/;
    if(newpass==""){
      error4.innerHTML='Password not entered'
    }else if(!regexWhiteSpace.test(newpass)){
        error4.innerHTML="Password must not contain Whitespaces."
    }else if(!regexUpperCase.test(newpass)){
        error4.innerHTML='Password must have at least one Uppercase Character.'
    }else if(!regexLowerCase.test(newpass)){
        error4.innerHTML="Password must have at least one Lowercase Character."
    }else if(!regexNumber.test(newpass)){
        error4.innerHTML='Password must contain at least one Digit.'
    }else if(!regexSymbol.test(newpass)){
        error4.innerHTML='Password must contain at least one Special Symbol.'
    }else if(!regexLength.test(newpass)){
        error4.innerHTML='Password must be 7-16 Characters Long.'
    }else{
        error4.innerHTML=''
        return true
    }
    
}

function repass(){
    var pass=document.getElementById('new').value
    var repass=document.getElementById('confirmPassword').value
    var error5 = document.getElementById('error3'); 
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

function passwordChangeValid(){
    cpassword();
    newpassword();
    repass();
    if(cpassword() && newpassword() && repass() ){
        return true
    }
    else{
        return false
    }
}


