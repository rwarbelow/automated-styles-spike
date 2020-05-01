var ghToken = PropertiesService.getScriptProperties().getProperty('GH_TOKEN');
var e = {
  values: ['second', 'third', 'fourth', 'fifth', 'sixth', 'first']
}
function onFormSubmit() {
  // Sets variables for form values and new branch name
  var timestamp = e.values[0]
  var employer = e.values[1]
  var base = e.values[2]
  var dark = e.values[3]
  var overlay = e.values[4]
  var submittedByEmail = e.values[5]
  var branchName = employer + "-ep-styles"
//  var apiUrl = "https://api.github.com/repos/GuiladEducationInc/partner-pages"
  var apiUrl = "https://api.github.com/repos/rwarbelow/automated-styles-spike"
  
  // Fetches most recent commit from master and parses response to get SHA
  var latestCommitOnMaster = UrlFetchApp.fetch(apiUrl + "/commits/master?access_token=" + ghToken)
  var sha = JSON.parse(latestCommitOnMaster.getContentText()).sha
  
  // Creates a new branch, branching from most recent commit on master
  var payload = {
    "ref": "refs/heads/" + branchName,
    "sha": sha
  }
  var options = {
    "method": "POST",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };
  var createBranchResponse = UrlFetchApp.fetch(apiUrl + "/git/refs?access_token=" + ghToken, options)
  
  // Defines content for new stylesheet, creates file, and commits to new branch
  var stylesheetContents = "." + employer + "-cms-page {\n" +
             "  // Variables\n" +
             "  $dark: " +  dark + ";\n" +
             "  $base: " + base + ";\n" +
             "  $accent: #f7f2ed;\n\n" +
             "  // Color Utilities\n" +
             "  .base-bg { background-color: $dark; }\n" +
             "  .accent-bg { background-color: $accent; }\n\n" +
             "  .button {\n" +
             "    background-color: $base;\n" +
             "    color: $color-white-base;\n" +
             "  }\n\n" +
             "  a {\n" +
             "    color: $color-black-base;\n" +
             "    &:hover, &:active {\n" +
             "      color: darken($base, 10%);\n" +
             "      & svg use {\n" +
             "        fill: darken($base, 10%);\n" +
             "      }\n" +
             "    }\n" +
             "  }\n\n" +
             "  .program-options {\n" +
             "    .multi-card:not(:first-child):not(:last-child) {\n" +
             "      .icon-container {\n" +
             "        background: $base;\n" +
             "      }\n" +
             "    }\n" +
             "  }\n\n" +
             "  .sticky-nav {\n" +
             "    .login {\n" +
             "      color: $base;\n" +
             "    }\n" +
             "    .login:hover {\n" +
             "      color: darken($base, 10%);\n" +
             "    }\n" +
             "  }\n\n" +
             "  .overlay {\n" +
             "    background-color: rgba(255,255,255," + overlay + ");\n" +
             "  }\n\n" + 
             "  svg {\n" +
             "    circle {\n" + 
             "      fill: $color-black-base;\n" +
             "    }\n" +
             "  }\n" +
             "}\n"
  var payload = {
    "message": "Adds stylesheet for " + e.values[1],
    "committer": {
      "name": submittedByEmail,
      "email": submittedByEmail
     },
    "content": Utilities.base64Encode(stylesheetContents),
    "branch": branchName
  }
  var options = {
    "method": "PUT",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };
  var addFileToBranchResponse = UrlFetchApp.fetch(apiUrl + "/contents/app/assets" + employer + ".scss?access_token=" + ghToken, options);

  // Opens PR for new branch
  var payload = {
    "title": "Stylesheet for " + employer + "'s partner page", 
    "body": "## Styles for " + employer + "\n * Base: " + base + "\n * Dark: " + dark + "\n * Overlay: " + overlay + "\n\n_Submitted by " + submittedByEmail + " on " + timestamp + "_",
    "head": branchName,
    "base": "master",
    "maintainer_can_modify": true
  }
  var options = {
    "method": "POST",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };
  var openPullRequestResponse = UrlFetchApp.fetch(apiUrl + "/pulls?access_token=" + ghToken, options)
}