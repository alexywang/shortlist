//Authenticate for Instagram API, token is returned as URL fragment
function instaAuth(){
    var key = "ddf68b9a766f47479db62c4be4cb349f";
    var redirect = window.location.href;
    //Direct user to this URL, upon authentication, instagram will send it back to the redirect URL with the token as a URL fragment
    // https://api.instagram.com/oauth/authorize/?client_id=ddf68b9a766f47479db62c4be4cb349f&redirect_uri=https://shortlist-1531330061369.firebaseapp.com/&scope=public_content&response_type=token
    var authURL = "https://api.instagram.com/oauth/authorize/?client_id="+key+"&redirect_uri="+redirect+"&scope=public_content&response_type=token";
    window.location.href = authURL;
}

//Remove hash URL fragment with smooth reload, algorithm by Andy E on Stack Overflow
function removeHash () { 
    var scrollV, scrollH, loc = window.location;
    if ("pushState" in history)
        history.pushState("", document.title, loc.pathname + loc.search);
    else {
        // Prevent scrolling by storing the page's current scroll offset
        scrollV = document.body.scrollTop;
        scrollH = document.body.scrollLeft;

        loc.hash = "";

        // Restore the scroll offset, should be flicker free
        document.body.scrollTop = scrollV;
        document.body.scrollLeft = scrollH;
    }
}

function changeButton(buttonName, trueFalse){
    var button = document.getElementById(buttonName);
    button.disabled = trueFalse;
}

window.onload = function(){
    var url = window.location.href;
    var instaToken;
    //Check if the user has Authenticated: Either an insta token is in the sessionStorage or the current url contains an access token hash
    if(sessionStorage.instaToken || sessionStorage.getItem("instaToken") !== null){
        //User has already authenticated, disable the buttons
        changeButton("insta-button", false);
        removeHash();
    }else{
        //User may have fully authenticated, split URL to check.
        var splitURL = url.split("#access_token="); 
        if(splitURL[1] && splitURL[1] !== null){
            //User has just logged in, the access token is in the url
            sessionStorage.setItem("instaToken",splitURL[1]);
            removeHash();
            changeButton("insta-button", false);
        }else{
            //User has not logged in at all, ensure that button is enabled
            changeButton("insta-button", true);
        }
    }
}

