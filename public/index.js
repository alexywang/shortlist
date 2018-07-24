//Authenticate for Instagram API, token is returned as URL fragment
function instaAuth(){
    var key = "ddf68b9a766f47479db62c4be4cb349f";
    var redirect = window.location.href;
    //Direct user to this URL, upon authentication, instagram will send it back to the redirect URL with the token as a URL fragment
    // https://api.instagram.com/oauth/authorize/?client_id=ddf68b9a766f47479db62c4be4cb349f&redirect_uri=https://shortlist-1531330061369.firebaseapp.com/&scope=public_content&response_type=token
    var authURL = "https://api.instagram.com/oauth/authorize/?client_id="+key+"&redirect_uri="+redirect+"&scope=public_content&response_type=token";
    window.location.href = authURL;
}

window.onload = function(){
    var url = window.location.href;
    var splitURL = url.split("#access_token="); 
    var token;
    //If the first element of split is still the entire unsplit URL, the user has not authenticated yet, send to Instagram login
    if(splitURL[1] == undefined && url.includes("shortlist")){
        console.log(splitURL[0]);
        console.log(splitURL[1]);
        instaAuth();
    }else{
        token = splitURL[1];
        //Store token in Session Storage
        sessionStorage.setItem("instaToken", token);
    }
}

