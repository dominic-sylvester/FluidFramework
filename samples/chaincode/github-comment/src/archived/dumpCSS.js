/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

function dumpCSSText(element){
  var s = '';
  var o = getComputedStyle(element);
  for(var i = 0; i < o.length; i++){
    s+=o[i] + ':' + o.getPropertyValue(o[i])+';';
  }
  return s;
}

function getallcss() {
    var css = "", //variable to hold all the css that we extract
        styletags = document.getElementsByTagName("style");

    //loop over all the style tags
    for(var i = 0; i < styletags.length; i++)
    {
        css += styletags[i].innerHTML; //extract the css in the current style tag
    }

    //loop over all the external stylesheets
    for(var i = 0; i < document.styleSheets.length; i++)
    {
        var currentsheet = document.styleSheets[i];
        //loop over all the styling rules in this external stylesheet
        for(var e = 0; e < currentsheet.cssRules.length; e++)
        {
            css += currentsheet.cssRules[e].cssText; //extract all the styling rules
        }
    }

    return css;
}