// High-level reddit commands

Components.utils.import("resource://socialite/debug.jsm");
Components.utils.import("resource://socialite/utils/action/action.jsm");
http = Components.utils.import("resource://socialite/utils/action/http_request.jsm");
Components.utils.import("resource://socialite/utils/quantizer.jsm");

var nativeJSON = Components.classes["@mozilla.org/dom/json;1"]
                 .createInstance(Components.interfaces.nsIJSON);

var EXPORTED_SYMBOLS = ["RedditAPI"];

var REDDIT_API_PATH = "/api/";
function APIURL(site, op) {
  return "http://" + site + BOOKMARKLET_API_PATH + op;
}

var sameURL = function(func1, arg1, func2, arg2) {
  var url1 = arg1[0];
  var url2 = arg2[0];
  
  return (url1 == url2);
};

var sameLinkID = function(func1, arg1, func2, arg2) {
  var linkID1 = arg1[0];
  var linkID2 = arg2[0];
  
  return (linkID1 == linkID2);
};

function RedditAPI(reddit) {
  this.reddit = reddit;
  
  this.infoQuantizer = new Quantizer("reddit.info.quantizer", QUANTIZE_TIME, sameURL);
  this.info = Action("reddit.info", this.infoQuantizer.quantize(function(url, action) {
    debug_log("reddit", "Making ajax info call");
    
    var params = {
      url:    url,
      sr:     "",
      count:  1,
    };
     
    var act = http.GetAction(
      APIURL(this.reddit.auth.site, "info.json"),
      params,
      
      function success(r) {
        var json = nativeJSON.decode(r.responseText);
        action.success(r, json);
      }
      function failure(r) { action.failure(); }
    ).perform();
  }));
  
  this.randomrising = Action("reddit.randomrising", function(action) {
    debug_log("reddit", "Making ajax randomrising call");
    
    var params = {
      limit: 1,
    };
      
    var act = http.GetAction(
      "http://www.reddit.com/randomrising.json"),
      params,
      
      function success(r) {
        var json = nativeJSON.decode(r.responseText);
        action.success(r, json);
      }
      function failure(r) { action.failure(); }
    ).perform();
  });

  this.voteQuantizer = new Quantizer("reddit.vote.quantizer", QUANTIZE_TIME, sameLinkID);
  this.vote = Action("reddit.vote", this.voteQuantizer.quantize(function(linkID, isLiked, action) {
    debug_log("reddit", "Making ajax vote call");
    
    var dir;
    if (isLiked == true) {
      dir = 1;
    } else if (isLiked == false) {
      dir = -1;
    } else {
      dir = 0;
    }
    
    var params   = {
      id:    linkID,
      uh:    modHash,
      dir:   dir,
    };
    params = this.reddit.auth.authParams(params);
    
    var act = http.PostAction(APIURL(this.reddit.auth.site, "vote"), params);
    act.chainTo(this);
    act.perform();
  }));
  
  this.saveQuantizer = new Quantizer("reddit.save.quantizer", QUANTIZE_TIME, sameLinkID);
  this.save = Action("reddit.save", this.saveQuantizer.quantize(function(linkID, action) {
    debug_log("reddit", "Making ajax save call");
    
    var params   = {
      id:    linkID,
      uh:    modHash,
    };
    params = this.reddit.auth.authParams(params);
    
    var act = http.PostAction(APIURL(this.reddit.auth.site, "save"), params);
    act.chainTo(this);
    act.perform();
  }));

  this.unsave = Action("reddit.unsave", this.saveQuantizer.quantize(function(linkID, action) {
    debug_log("reddit", "Making ajax unsave call");
    
    var params   = {
      id:    linkID,
      uh:    modHash,
    };
    params = this.reddit.auth.authParams(params);
    
    var act = http.PostAction(APIURL(this.reddit.auth.site, "unsave"), params);
    act.chainTo(this);
    act.perform();
  }));

  this.hideQuantizer = new Quantizer("reddit.hide.quantizer", QUANTIZE_TIME, sameLinkID);
  this.hide = Action("reddit.hide", this.hideQuantizer.quantize(function(linkID, action) {
    debug_log("reddit", "Making ajax hide call");
    
    var params   = {
      id:    linkID,
      uh:    modHash,
    };
    
    params = this.reddit.auth.authParams(params);
    
    var act = http.PostAction(APIURL(this.reddit.auth.site, "hide"), params);
    act.chainTo(this);
    act.perform();
  }));

  this.unhide = Action("reddit.unhide", this.hideQuantizer.quantize(function(linkID, action) {
    debug_log("reddit", "Making ajax unhide call");
    
    var params   = {
      id:    linkID,
      uh:    modHash,
    };
    
    params = this.reddit.auth.authParams(params);
    
    var act = http.PostAction(APIURL(this.reddit.auth.site, "unhide"), params);
    act.chainTo(this);
    act.perform();
  }));
}
