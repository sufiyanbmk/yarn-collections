function email() {
    var email = document.getElementById("loginEmail").value;
    var error1 = document.getElementById("errEmail");
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
$('#loginEmail').keyup(() => {
email();
})
$('#loginPsw').keyup(()=>{
    function passwordvalidate(){
        var pass=document.getElementById('loginPsw').value
        var error4=document.getElementById('errPsw');
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
})

function login(){
    passwordvalidate()
    email()
    if(email() && passwordvalidate()){
        return false;
    }
    else{
        return true;
    }

}