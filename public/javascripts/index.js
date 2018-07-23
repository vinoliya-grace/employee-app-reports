
//alert("inside index.js");

//first call the following to populate values into landing page
setTimeout(getCompanies, 1000);

//setTimeout(updateUserReports, 3000); //have to wait for a couple seconds to wait for userid hidden value to be updated on UI

//report related functions\\

//calculate the start date based on the end date user has selected
//will be used in generateReport() function mainly
function calculateStartDate(end_date, duration) {
  var back_GTM = new Date(end_date);
  back_GTM.setDate(back_GTM.getDate() - parseInt(duration));
  var b_dd = back_GTM.getDate();
  var b_mm = back_GTM.getMonth() + 1;
  var b_yyyy = back_GTM.getFullYear();

  if (b_dd < 10) {
  b_dd = '0' + b_dd
  }
  if (b_mm == 2) {
  b_mm = '0' + b_mm
  }
  var back_date = b_yyyy + '-' + b_mm + '-' + b_dd;
  //alert(duration + ", back date: " + back_date);
  return back_date;
}

//validate inputs selected by user for report
function validateInputs() {
  var select = document.getElementById('seltype');
  var seven_days_validate = document.getElementById('7days').checked;
  var thirty_days_validate = document.getElementById('30days').checked;
  var end_date_validate = document.getElementById('dateInput').value;

  var app_validate = document.getElementById('app_install').checked;
  var activeusers_validate = document.getElementById('active_users').checked;
  var sessions_validate = document.getElementById('app_session').checked;
  var docread_validate = document.getElementById('doc_read').checked;
  var docshared_validate = document.getElementById('doc_shared').checked;
  var comment_validate = document.getElementById('doc_comments').checked;
  var docsaved_validate = document.getElementById('doc_saved').checked;
  var topdocs_validate = document.getElementById('top_documents').checked;
  var topusers_validate = document.getElementById('top_users').checked;
  var error = "";

  if (select.value == "") {
        document.getElementById("select_error_msg").innerHTML="Choose a company";
        setTimeout(function(){ document.getElementById("select_error_msg").innerHTML=""; }, 4000);
        error = "error";
    }
  if(seven_days_validate == false && thirty_days_validate == false){
        document.getElementById("days_error_msg").innerHTML="Choose at least one date range";
        setTimeout(function(){ document.getElementById("days_error_msg").innerHTML=""; }, 4000);
        error = "error";
  }
  if(end_date_validate == ""){
        document.getElementById("enddate_error_msg").innerHTML="Choose an end date";
        setTimeout(function(){ document.getElementById("enddate_error_msg").innerHTML=""; }, 4000);
        error = "error";
  }
  if(app_validate == false && activeusers_validate == false && sessions_validate == false && docread_validate == false && docshared_validate == false && comment_validate == false && docsaved_validate == false && topdocs_validate == false && topusers_validate == false){
        document.getElementById("metrics_error_msg").innerHTML="Choose at least one metric";
        setTimeout(function(){ document.getElementById("metrics_error_msg").innerHTML=""; }, 4000);
        error = "error";
  }
  return error;
}
//validation for company inputs
function validateCompanyInputs()
{
  var company_id_validate = document.getElementById("new_company_id").value;
  var company_name_validate = document.getElementById("new_company_name").value;
  var errorlog = "";
  if(company_id_validate == "" || company_name_validate == "")
  {
    document.getElementById("newCompany_success_msg").innerHTML = " Fields cannot be empty";
    setTimeout(function(){ document.getElementById("newCompany_success_msg").innerHTML=""; }, 2000);
    errorlog = "error";
  }
  return errorlog;
}
//validation for Admin User Inputs
function validateAdminUserInputs()
{
  var userEmail_validate = document.getElementById("new_admin_user_email").value;
  var EmailFormat = /^([A-Za-z0-9_\-\.])+\@([meltwater])+\.([A-Za-z]{2,4})$/; // for @meltwater domain users only
  /*var EmailFormat = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;*/     // for any of the valid @ domain mail_id
  var errorlog = "";
  if(userEmail_validate == "")
  {
    document.getElementById("newAdmin_success_msg").innerHTML = " Email cannot be empty";
    setTimeout(function() {document.getElementById("newAdmin_success_msg").innerHTML = ""}, 2000);
    errorlog = "error";
  }
  if (!userEmail_validate.match(EmailFormat)) 
  {
    document.getElementById("newAdmin_success_msg").innerHTML = " Only Meltwater Email";
    setTimeout(function() {document.getElementById("newAdmin_success_msg").innerHTML = ""}, 2000);
    errorlog = "error";
  }

  return errorlog;
}

//gather all user selected values and call the nodejs endpoint to generate the report
//display the latest reports in Recent Reports div
function generateReport()
{

  var error = validateInputs();

  if (error == "") {
    //alert("inside generateReport");

    //document.getElementById("singlebutton").disabled = true;

    document.getElementById("messages").innerHTML = "<span>Report generation in progress...</span>";

    var days7, days30, months6;
    var app_value,activeusers_value,session_val,read_val,shared_val,comment_val,saved_val,topusers_val,topdocs_val;
    var week_back_date = '';
    var month_back_date = '';
    var year_back_date = '';

    //user, company details
    var userId = document.getElementById('userIdHidden').value;
    var companyIdElement = document.getElementById('seltype');
    var companyId = companyIdElement.options[companyIdElement.selectedIndex].id;
    var companyName = companyIdElement.options[companyIdElement.selectedIndex].value;

    //getting the id of the date check box
    var seven_days = document.getElementById('7days');
    var thirty_days = document.getElementById('30days');
    var six_months = document.getElementById('oneyear');

    var end_date = document.getElementById('dateInput').value;
    
    //check for dates
    if(seven_days.checked == true)
    {
      days7 = true;
      week_back_date = calculateStartDate(end_date, "6");
    }
    else 
    {
      days7 = false;
    }
    if(thirty_days.checked == true)
    {
      days30 = true;
      month_back_date = calculateStartDate(end_date, "29");
    }
    else 
    {
      days30 = false;
    }
    // if(six_months.checked == true)
    // {
    //   months6 = true;
    // }
    // else 
    // {
    //   months6 = false;
    // }

    // check for the metrics check box
    var app = document.getElementById('app_install');
    var activeusers = document.getElementById('active_users');
    var sessions = document.getElementById('app_session');
    var docread = document.getElementById('doc_read');
    var docshared = document.getElementById('doc_shared');
    var comment = document.getElementById('doc_comments');
    var docsaved = document.getElementById('doc_saved');
    var topdocs = document.getElementById('top_documents');
    var topusers = document.getElementById('top_users');

    if(app.checked == true)
    {
      app_value = true;
    }
    else 
    {
      app_value = false;
    }

    if(activeusers.checked == true)
    {
      activeusers_value = true;
    }
    else 
    {
      activeusers_value = false;
    }

    if(sessions.checked == true)
    {
      session_val = true;
    }
    else 
    {
      session_val = false;
    }

    if(docread.checked == true)
    {
      read_val = true;
    }
    else 
    {
      read_val = false;
    }

    if(docshared.checked == true)
    {
      shared_val = true;
    }
    else 
    {
      shared_val = false;
    }

    if(comment.checked == true)
    {
      comment_val = true;
    }
    else 
    {
      comment_val = false;
    }

    if(docsaved.checked == true)
    {
      saved_val = true;
    }
    else 
    {
      saved_val = false;
    }

    if(topdocs.checked == true)
    {
      topdocs_val = true;
    }
    else 
    {
      topdocs_val = false;
    }

    if(topusers.checked == true)
    {
      topusers_val = true;
    }
    else 
    {
      topusers_val = false;
    }

     //get all the values to pass on to /generateReport
    //company id, user id, required date ranges, required metrics

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        //alert(this.responseText);
        setTimeout(function(){ document.getElementById("singlebutton").disabled = false; }, 3000);
        if (this.responseText == "success") {
          
          document.getElementById("messages").style.display="block";
          document.getElementById("messages").innerHTML = "<span>Report Generated Successfully. Please download from Recent Reports below.</span>";
          setTimeout(resetReportStatusMessage, 5000);
          //now make an ajax call to update recent reports
          //alert("");
          if (document.getElementById("isAdminUser").value == "true") {
            updateAllReports();
          } else {
            updateUserReports();
          }
        } else {
          document.getElementById("messages").style.display="block";
          document.getElementById("messages").innerHTML = "<span>Report could not be generated. Please contact {}</span>";
          setTimeout(resetReportStatusMessage, 5000);
        }

      }
    };
    var url = "generateReport?appinstalls="+app_value+"&activeusers="+activeusers_value+"&appsessions="+session_val+"&articlesread="+read_val+"&shared="+shared_val+"&comment="+comment_val+"&saved="+saved_val+"&topdocs="+topdocs_val+"&topuser="+topusers_val+"&days7="+days7+"&days30="+days30+"&months6="+months6+"&end_date="+end_date+"&week_back_date="+week_back_date+"&month_back_date="+month_back_date+"&userId="+userId+"&companyId="+companyId+"&companyName="+companyName;
    //alert(url);
    xhttp.open("GET", url, true);
    xhttp.send();
  } else {
    return false;
  }
  
}

function resetReportStatusMessage() {
  document.getElementById("messages").innerHTML = "";
}

function updateUserReports() {
  //alert("inside updateUserReports");
  var userId = document.getElementById('userIdHidden').value;

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      //alert(this.responseText);
      if (this.responseText == "No recent exports" || this.responseText == "no reports for user") {
        document.getElementById("recentreports").innerHTML = "<span>None available at the moment</span>"
      } else {
        var reports = JSON.parse(this.responseText);
        //alert(reports);
        //create a table to append to recentreports div
        var tableElem = document.createElement("table");
        tableElem.class = "TFtable";
        //create the headers for that table;
        var tHeaderRowElem = document.createElement("tr");
        var tHeaderDateElem = document.createElement("th");
        tHeaderDateElem.innerHTML = "Date";
        var tHeaderCompElem = document.createElement("th");
        tHeaderCompElem.innerHTML = "Company";
        var tHeaderReportElem = document.createElement("th");
        tHeaderReportElem.innerHTML = "Report";
        tHeaderRowElem.appendChild(tHeaderDateElem);
        tHeaderRowElem.appendChild(tHeaderCompElem);
        tHeaderRowElem.appendChild(tHeaderReportElem);

        tableElem.appendChild(tHeaderRowElem);

        for (var key in reports) {
          //console.log(companies[key]);
          var report = reports[key];
          console.log(report);
          var repIndex = report.indexOf("EmpAppUsageStats-");
          //alert(repIndex);
          if (repIndex > 0) {
            //var sub0 = report.substring(report.indexOf("public/reports"), report.length);
            var sub0 = report.substring(report.indexOf("reports"), report.length);
            //alert(sub0);
            //alert("http://localhost:3000" + sub0);

            var sub1 = sub0.substring(sub0.indexOf("EmpAppUsageStats-"), sub0.length);
            //alert(sub1);
          
            var arr = sub1.split("-");
            //alert(arr);
            
            var cname = arr[1];
            //alert(cname);
            
            var ts = (arr[2].split("."))[0];
            //alert(ts);
            
            var repDate = (new Date(parseInt(ts))).toString();
            //alert(repDate);

            var tReportRowElem = document.createElement("tr");
            var tReportDateElem = document.createElement("td");

            tReportDateElem.innerHTML = repDate.substring(0, repDate.indexOf("(")-1);
            var tReportCompElem = document.createElement("td");
            tReportCompElem.innerHTML = cname;
            var tReportReportElem = document.createElement("td");
            var el = document.createElement("a");
            el.href = location + sub0;
            el.id = sub1;
            el.innerHTML = sub1;
            tReportReportElem.appendChild(el);

            //tReportReportElem.innerHTML = ;
            tReportRowElem.appendChild(tReportDateElem);
            tReportRowElem.appendChild(tReportCompElem);
            tReportRowElem.appendChild(tReportReportElem);

            tableElem.appendChild(tReportRowElem);                    
          }                      
        }
        var recentReportsElem = document.getElementById("recentreports");
        recentReportsElem.innerHTML = "";
        recentReportsElem.appendChild(tableElem);   
      }
    }
  };
  var url = "getUserReports?userId="+userId;
  xhttp.open("GET", url, true);
  xhttp.send();
}

function updateAllReports() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      if (this.responseText == "No recent exports" || this.responseText == "no reports for user") {
        document.getElementById("recentreportsadmin").innerHTML = "<span>None available at the moment</span>"
      } else {
        var reports = JSON.parse(this.responseText);
        /*alert(reports);*/
        //create a table to append to recentreports div
        var tableElem = document.createElement("table");
        tableElem.class = "TFtable";
        //create the headers for that table;
        var tHeaderRowElem = document.createElement("tr");
        var tHeaderDateElem = document.createElement("th");
        tHeaderDateElem.innerHTML = "Date";
        var tHeaderCompElem = document.createElement("th");
        tHeaderCompElem.innerHTML = "Company";
        var tHeaderUserIdElem = document.createElement("th");
        tHeaderUserIdElem.innerHTML = "User";
        var tHeaderReportElem = document.createElement("th");
        tHeaderReportElem.innerHTML = "Report";
        tHeaderRowElem.appendChild(tHeaderDateElem);
        tHeaderRowElem.appendChild(tHeaderCompElem);
        tHeaderRowElem.appendChild(tHeaderUserIdElem);
        tHeaderRowElem.appendChild(tHeaderReportElem);

        tableElem.appendChild(tHeaderRowElem);

        for (var key in reports) {
          var report = reports[key];
          console.log(report);
          var repIndex = report.indexOf("EmpAppUsageStats-");
          if (repIndex > 0) {

            var sub0 = report.substring(report.indexOf("reports"), report.length);
            //getting the userid from the string
            var userid = report.substring(90);
            var username = (userid.split("\\"))[0]; 
            // alert(username);
            var sub1 = sub0.substring(sub0.indexOf("EmpAppUsageStats-"), sub0.length);
            var arr = sub1.split("-");
            var cname = arr[1];            
            var ts = (arr[2].split("."))[0];
            var repDate = (new Date(parseInt(ts))).toString();
         
            var tReportRowElem = document.createElement("tr");
            var tReportDateElem = document.createElement("td");

            tReportDateElem.innerHTML = repDate.substring(0, repDate.indexOf("(")-1);
            var tReportCompElem = document.createElement("td");
            tReportCompElem.innerHTML = cname;
            var tReportUserIdElem = document.createElement("td");
            tReportUserIdElem.innerHTML = username;

            var tReportReportElem = document.createElement("td");
            var el = document.createElement("a");
            el.href = location + sub0;
            el.id = sub1;
            el.innerHTML = sub1;
            tReportReportElem.appendChild(el);

            //tReportReportElem.innerHTML = ;
            tReportRowElem.appendChild(tReportDateElem);
            tReportRowElem.appendChild(tReportCompElem);
            tReportRowElem.appendChild(tReportUserIdElem);
            tReportRowElem.appendChild(tReportReportElem);

            tableElem.appendChild(tReportRowElem);                   
          }                      
        }
        var recentReportsAdminElem = document.getElementById("recentreportsadmin");
        recentReportsAdminElem.innerHTML = "";
        recentReportsAdminElem.appendChild(tableElem);   
      }
    }
  };
  var url = "getAllReports";
  xhttp.open("GET", url, true);
  xhttp.send();
}


//login related functions\\

function onSignIn(googleUser) {
  var profile=googleUser.getBasicProfile();
  var email=profile.getEmail();
  var final=email.indexOf("@meltwater.com");
  if(final<=0)
    {
    var id_token = googleUser.getAuthResponse().id_token;
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut();
    auth2.disconnect();
  $('#google_token').val(id_token); //hidden form value
  $('#google-oauth').submit();
    $("#maindiv").hide();
    // alert("signed out");
    document.getElementById("error").innerHTML = "Please try again with your Meltwater email address"; 
    }
    else
    {
        $(".g-signin2").css("display","none");
      $("#home").hide();
        $(".maindiv").show();
        $(".container").show();
      $(".data").css("display","block");
      $("#pic").attr('src',profile.getImageUrl());
      /*$("#email").text(profile.getEmail());*/
        $("#email").text(profile.getName());
      $(".error").css("display","none");
        var abc = profile.getEmail().split('@')[0];
        document.getElementById("userIdHidden").value = abc;
        //alert("set userIdHidden");
        checkIfAdminUser(profile.getEmail());
    }
}
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      // alert("Signed out");
    $(".g-signin2").css("display","block");

    $(".data").css("display","none");
    $(".error").css("display","none");
      location.reload();
    });
    $('#google_token').val(id_token); //hidden form value
  $('#google-oauth').submit();
  }


//Company related functions\\
var setCompaniesDropdown = false;

//get all companies
function getCompanies() {
  //upload companies into the dropdown
  var companies;
  var select = document.getElementById("seltype");
  
  //ajax call to call the nodejs context that will load all these values
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      
      companies = JSON.parse(this.responseText);
      //alert(companies);

      if (setCompaniesDropdown == false) {
        for (var key in companies) {
          console.log(companies[key]);
          var aaa = companies[key];
          //console.log(aaa.name);
          var el = document.createElement("option");
          el.textContent = aaa.name;
          el.value = aaa.name;
          el.id = aaa.id;
          select.appendChild(el);
        }
        setCompaniesDropdown = true;
      }
      document.getElementById("companiesList").innerHTML = "";
      for (var key in companies) {

          //Update admin section too:
          var aaa = companies[key];
          var companiesListElem = document.getElementById("companiesList");
          var elBr = document.createElement("br");
          var el = document.createElement("input");
          el.type = "radio";
          el.name = "companyRadio";
          el.class = "companyRadio";
          el.value = aaa.name;
          el.id = aaa.id;
          el.title = aaa.id;
          var elLabel = document.createElement("span");
          elLabel.value = aaa.name;
          elLabel.innerHTML = aaa.name;
          elLabel.id = aaa.id;
          elLabel.title = aaa.id;
          companiesListElem.appendChild(el);
          companiesListElem.appendChild(elLabel);
          companiesListElem.appendChild(elBr);

      }
    }
  };
  xhttp.open("GET", "getCompanies", true);
  xhttp.send();
}

//add a new company
function addCompany() {
  var errorlog = validateCompanyInputs();
  if(errorlog == "")
  {
    var company_id = document.getElementById("new_company_id").value;
  var company_name = document.getElementById("new_company_name").value;

  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // alert(this.responseText);
      if (this.responseText == "success") {
        document.getElementById("newCompany_success_msg").innerHTML = " Added new company!";
        getCompanies();
        document.getElementById("new_company_id").value="";
        document.getElementById("new_company_name").value="";
      } else {
        document.getElementById("newCompany_success_msg").innerHTML = " Error adding company!";
      }
      setTimeout(function() {document.getElementById("newCompany_success_msg").innerHTML = ""}, 2000);
    }
  };
  var url = "addNewCompany?company_id="+company_id+"&company_name="+company_name;
  //alert(url);
  xhttp.open("GET", url, true);
  xhttp.send();
}else{
  return false;
}  
}

//delete a company 
function deleteCompany() {
  var radioBtns = document.getElementsByName("companyRadio");
  console.log(radioBtns);  
  for(var i = 0; i < radioBtns.length; i++) {
    if(radioBtns[i].checked == true) {
    /*alert(radioBtns[i].value);*/
      company_name = radioBtns[i].value;
      console.log(company_name);
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
      /*document.getElementById("adminUsersList").innerHTML = this.responseText; */ 
          if (this.responseText == "success") {
            document.getElementById("delete_success_msg").innerHTML = " Deleted company!";
            //document.location.reload(true);
            getCompanies();
          } else {
            document.getElementById("delete_success_msg").innerHTML = " Error deleting company!";
          }     
          setTimeout(function() {document.getElementById("delete_success_msg").innerHTML = ""}, 2000);
        }
      };
      var url = "deleteCompany?company_name="+company_name;
    //alert(url);
      xhttp.open("GET", url, true);
      xhttp.send();
    }
  }
}

//Admin User related functions\\

//check if a user is an admin
function checkIfAdminUser(userId) {

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {   
      //alert(this.responseText);
      document.getElementById('isAdminUser').value = this.responseText;     
      displayRequiredContainers(this.responseText);
    }
  };
  //alert("sending for admin check: " + userId);
  var url = "checkIfAdminUser?userId=" + userId;
  xhttp.open("GET", url, true);
  xhttp.send();

}

//add an admin user
  function addAdminUser() {
    var errorlog = validateAdminUserInputs();
    if(errorlog == "")
    {
     var userEmail = document.getElementById("new_admin_user_email").value;
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          /*alert(this.responseText);*/
          if (this.responseText == "success") {
            document.getElementById("newAdmin_success_msg").innerHTML = " Added new admin!"
            setTimeout(function() {document.getElementById("newAdmin_success_msg").innerHTML = ""}, 2000);
            document.getElementById("new_admin_user_email").value="";
            //document.location.reload(true);
            updateAdminsSection();
          } else {
            document.getElementById("newAdmin_success_msg").innerHTML = " Error adding admin!";
            setTimeout(function() {document.getElementById("newAdmin_success_msg").innerHTML = ""}, 2000);
          }

        }
      };
      var url = "addAdminUser?email="+userEmail;
      //alert(url);
      xhttp.open("GET", url, true);
      xhttp.send();
    }else{
      return false;
  }  

   
  }

//delete an admin user
function deleteAdminUser() {
  var radioBtns = document.getElementsByName("adminRadio");
  console.log(radioBtns);  
  for(var i = 0; i < radioBtns.length; i++) {
    if(radioBtns[i].checked == true) {
    /*alert(radioBtns[i].value);*/
      email = radioBtns[i].value;
      console.log(email);
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
      /*document.getElementById("adminUsersList").innerHTML = this.responseText; */ 
          if (this.responseText == "success") {
            document.getElementById("deleteadmin_success_msg").innerHTML = " Deleted admin!";
            setTimeout(function() {document.getElementById("deleteadmin_success_msg").innerHTML = ""}, 3000);
            //document.location.reload(true);
            updateAdminsSection();
          } else {
            document.getElementById("deleteadmin_success_msg").innerHTML = " Error deleting admin!";
            setTimeout(function() {document.getElementById("deleteadmin_success_msg").innerHTML = ""}, 3000);
          }     
        }
      };
      var url = "deleteAdminUser?email="+email;
    //alert(url);
      xhttp.open("GET", url, true);
      xhttp.send();
    }
  }
}

function updateAdminsSection() {
 
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
    admins = JSON.parse(this.responseText);
      document.getElementById("adminUsersList").innerHTML = "";
     
      for (var key in admins) {
          var aaa = admins[key];
          var adminUsersListElem = document.getElementById("adminUsersList");
          var elBr = document.createElement("br");
          var el = document.createElement("input");
          el.type = "radio";
          el.name = "adminRadio";
          el.class = "adminRadio";
          el.value = aaa.email;
          el.id = aaa.id;
          var elLabel = document.createElement("span");
          elLabel.value = aaa.email;
          elLabel.innerHTML = aaa.email;
          elLabel.id = aaa.id;
          adminUsersListElem.appendChild(el);
          adminUsersListElem.appendChild(elLabel);
          adminUsersListElem.appendChild(elBr);
      }
    }
  };
  //alert("sending for admin check: " + userId);
  var url = "getAllAdminUsers";
  xhttp.open("GET", url, true);
  xhttp.send();
}


function updateConfigSection() {
 // alert("inside updateConfigSection, nothing in it yet");
  //list all the variables in config.js
  //create another in app.js for /updateDBConfig
}

function updateContainers(isAdmin) {
  if (isAdmin == "true") {
    updateAllReports();
    updateAdminsSection();
    updateConfigSection();
  } else {
    updateUserReports();
  }
}

function getDBConfig()
{
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {   
      alert(this.responseText);
    }
  };
  var url = "getDBConfig";
  xhttp.open("GET", url, true);
  xhttp.send();
}

function UpdateDBConfig()
{
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {   
      alert(this.responseText);
    }
  };
  var url = "UpdateDBConfig";
  xhttp.open("GET", url, true);
  xhttp.send();
}

function displayRequiredContainers(isAdmin) {
  
  if (isAdmin == "true") {
    //alert("isAdmin");
    document.getElementById("adminCompanies").style.display = 'inherit';
    document.getElementById("adminAdminUsers").style.display = 'inherit';
    document.getElementById("nonAdminUserReports").style.display = 'none';
    document.getElementById("adminUserReports").style.display = 'inherit';
    document.getElementById("adminDBConfig").style.display = 'inherit';
  } else {
    //alert("notAdmin");
    document.getElementById("adminCompanies").style.display = 'none';
    document.getElementById("adminAdminUsers").style.display = 'none';
    document.getElementById("nonAdminUserReports").style.display = 'inherit';
    document.getElementById("adminUserReports").style.display = 'none';
    document.getElementById("adminDBConfig").style.display = 'none';
  }

  //now display all the required containers and the content within them
  setTimeout(updateContainers(isAdmin), 3000);

}


