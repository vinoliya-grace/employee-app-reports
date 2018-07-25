var config = require("../config/config.js");
var XlsxTemplate = require('xlsx-template'),
fs = require('fs'),
path = require('path');
var Q = require("q");
var Promise = require("promise");

var appinstalls7daysArr = [];
 var appinstalls30daysArr = [];
 var appsession7daysArr = [];
 var appsession30daysArr = [];
 var activeUsers7daysArr = [];
 var activeUsers30daysArr = [];
 var docsRead7daysArr = [];
 var docsRead30daysArr = [];
 var docsShared7daysArr = [];
 var docsShared30daysArr = [];
 var comments7daysArr = [];
 var comments30daysArr = [];
 var saved7daysArr = [];
 var saved30daysArr = [];
 var topDocs7daysArr = [];
 var topDocs30daysArr = [];
 var topUsers7daysArr = [];
 var topUsers30daysArr = [];
 var topUsersRead7daysArr = [];
 var topUsersRead30daysArr = [];
 var topUsersComm7daysArr = [];
 var topUsersComm30daysArr = [];
 var topUsersShare7daysArr = [];
 var topUsersShare30daysArr = [];

 var docsRead7daysArrAvg = [];
 var docsRead30daysArrAvg = [];
 var appsession7daysArrAvg = [];
 var appsession30daysArrAvg = [];
 var docsShared7daysArrAvg = [];
 var docsShared30daysArrAvg = [];
 var comments7daysArrAvg = [];
 var comments30daysArrAvg = [];
 var saved7daysArrAvg = [];
 var saved30daysArrAvg = [];

 var Users7daysArrAvg = [];
 var Users30daysArrAvg = [];


var mysql = require('mysql');
var con = mysql.createConnection({
      host: config.mysql_host,
      user: config.mysql_user,
      password: config.mysql_password,
      database: config.mysql_database,
      charset : config.mysql_charset
    });
//con.connect();

function roundTo(n, digits) {
    var negative = false;
    if (digits === undefined) {
        digits = 0;
    }
        if( n < 0) {
        negative = true;
      n = n * -1;
    }
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(2);
    if( negative ) {    
        n = (n * -1).toFixed(2);
    }
    return n;
}

module.exports = {
  topDocsSetup: function(metrics, duration) {
    console.log("inside topDocsSetup");

    return new Promise(function(resolve, reject) 
    {
      //metrics.topDocs = true;
      //metrics.topDocs7 = true;
      if (metrics.topDocs == true) 
      {
        if (duration == "7days" && metrics.topDocs7 == true) 
        {
          start_date = metrics.week_back_date;
          end_date = metrics.end_date;
        }
        if (duration == "30days" && metrics.topDocs30 == true) 
        {
          start_date = metrics.month_back_date;
          end_date = metrics.end_date;
        }

        console.log(start_date);
        console.log(end_date);
        // start_date = '2018-6-26';
        // end_date = '2018-07-03';
        var finalArr = [];
        con.connect(function (err) {
          con.query("Set sql_mode=('STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION')",  function (err, results, fields) 
          {
            if (err) {
              console.log("Error when setting sql_mode");
            } else {
              console.log("Successfully set sql_mode");
            }
            con.query("select document_id, document_title, document_url,channel_name as channel,count(document_id) as view_count from "+config.mysql_database+".view_document_sql where DATE(received_at)>? and DATE(received_at)<=? and context_traits_company_id=? group by document_id, document_title, document_url order by view_count desc limit 11",[start_date,end_date,metrics.companyId], function (err, results, fields) 
            {
              if (err) {
                console.log("error occurred" + err);
                resolve("Error Occurred during Top Documents " + duration + " capture! ");
              }
              else
              {     
                console.log("got some results");
                console.log(results);
                var viewsCountArr;
                var sharesCountArr;
                var commentsCountArr;
                var savesCountArr;

                viewsCountArr = results;

                //var topDocsArr = [];
                var topDocIds = '';
                for(var key in results) 
                {
                  var row = results[key];
                  if (row.document_url != 'null') {
                    topDocIds = topDocIds + "'" + row.document_id + "',";
                  }
                }
                console.log(topDocIds);
                var aaa = topDocIds.substring(0, (topDocIds.length)-1);

                var sharesArr = [];
                var commentsArr = [];

                con.query("select document_id, count(document_id) as share_count from "+config.mysql_database+".share_document_sql where document_id in ("+aaa+") and DATE(received_at)>? and DATE(received_at)<=? and context_traits_company_id=? group by document_id",[start_date,end_date,metrics.companyId], function (err, resultsShares, fields) 
                {
                  if (err) {
                    console.log("error occurred" + err);
                    //resolve("Error Occurred during App Install " + duration + " capture! ");
                  } else {
                     console.log("done done");
                    
                    sharesCountArr = resultsShares;

                    con.query("select document_id, count(document_id) as comment_count from "+config.mysql_database+".comment_on_document_sql where document_id in ("+aaa+") and DATE(received_at)>? and DATE(received_at)<=? and context_traits_company_id=? group by document_id",[start_date,end_date,metrics.companyId], function (err, resultsComments, fields) 
                    {
                      if (err) {
                        console.log("error occurred" + err);
                        //resolve("Error Occurred during App Install " + duration + " capture! ");
                      } else {
                        
                        commentsCountArr = resultsComments;

                        con.query("select document_id, count(document_id) as save_count from "+config.mysql_database+".saved_document_sql where document_id in ("+aaa+") and DATE(received_at)>? and DATE(received_at)<=? and context_traits_company_id=? group by document_id",[start_date,end_date,metrics.companyId], function (err, resultsSaves, fields) 
                        {
                          if (err) {
                            console.log("error occurred" + err);
                            //resolve("Error Occurred during App Install " + duration + " capture! ");
                          } else {
                            savesCountArr = resultsSaves;

                            // console.log(viewsCountArr);
                            // console.log(sharesCountArr);
                            // console.log(commentsCountArr);
                            // console.log(savesCountArr);

                            for (key in viewsCountArr) {
                              
                              //console.log(viewsCountArr[key]);
                              var viewsRow = viewsCountArr[key];
                              if (viewsRow.document_id != 'null') {
                                var docId = viewsRow.document_id;
                                var docTitle = viewsRow.document_title;
                                var docUrl = viewsRow.document_url;
                                var docChannel = viewsRow.channel;
                                var viewsCount = viewsRow.view_count;
                                var sharesCount = 0; var commentsCount = 0; var savesCount = 0;

                                for(key in sharesCountArr) {
                                  var sharesRow = sharesCountArr[key];
                                  if (sharesRow.document_id == docId) {
                                    sharesCount = sharesRow.share_count;
                                  }
                                }

                                for(key in commentsCountArr) {
                                  var commentsRow = commentsCountArr[key];
                                  if (commentsRow.document_id == docId) {
                                    commentsCount = commentsRow.comment_count;
                                  }
                                }

                                for(key in savesCountArr) {
                                  var savesRow = savesCountArr[key];
                                  if (savesRow.document_id == docId) {
                                    savesCount = savesRow.save_count;
                                  }
                                }
                                
                                var obj = {title:docTitle,url:docUrl,channel:docChannel,opens:viewsCount,shares:sharesCount,comments:commentsCount,saves:savesCount};
                                finalArr.push(obj);
                              }
                            }

                            console.log("finally:");
                            console.log(finalArr);

                            if (duration == "7days") topDocs7daysArr = finalArr;
                            if (duration == "30days") topDocs30daysArr = finalArr;
                            //console.log(appInstallsArr);
                            console.log("done with getting data from db, going to resolve arr topDocs");
                            resolve("Top Documents " + duration + " Data Collected! ");

                          }
                        });

                      }
                    });
                  }
                });           
              }
            });
          });
        });
      } 
      else 
      {
        resolve("Top Documents Metric Not Requested! ");
      }
    });
  },
  setAllRequiredMetrics: function(metrics, data) {
      
      console.log(data.week_back_date);
      console.log(data.month_back_date);

      metrics.userId = data.userId;
      metrics.companyId = data.companyId;
      metrics.companyName = data.companyName;

      if (!data.week_back_date == '') {
        metrics.week_back_date = data.week_back_date
      }
      if (!data.month_back_date == '') {
        metrics.month_back_date = data.month_back_date
      }

      metrics.end_date = data.end_date;

      if (data.appinstalls == 'true') {
        metrics.appInstalls = true;
        if (data.days7 == 'true')
          metrics.appInstalls7 = true;
        if (data.days30 == 'true')
          metrics.appInstalls30 = true;
        if (data.months6 == 'true')
          metrics.appInstalls6 = true;
      }
      if (data.activeusers == 'true') {
        metrics.activeUsers = true;
        if (data.days7 == 'true')
          metrics.activeUsers7 = true;
        if (data.days30 == 'true')
          metrics.activeUsers30 = true;
        if (data.months6 == 'true')
          metrics.activeUsers6 = true;
      }
      if (data.appsessions == 'true') {
        metrics.appSessions = true;
        if (data.days7 == 'true')
          metrics.appSessions7 = true;
        if (data.days30 == 'true')
          metrics.appSessions30 = true;
        if (data.months6 == 'true')
          metrics.appSessions6 = true;
      }
      if (data.articlesread == 'true') {
        metrics.docsRead = true;
        if (data.days7 == 'true')
          metrics.docsRead7 = true;
        if (data.days30 == 'true')
          metrics.docsRead30 = true;
        if (data.months6 == 'true')
          metrics.docsRead6 = true;
      }
      if (data.shared == 'true') {
        metrics.shares = true;
        if (data.days7 == 'true')
          metrics.shares7 = true;
        if (data.days30 == 'true')
          metrics.shares30 = true;
        if (data.months6 == 'true')
          metrics.shares6 = true;
      }
      if (data.comment == 'true') {
        metrics.comments = true;
        if (data.days7 == 'true')
          metrics.comments7 = true;
        if (data.days30 == 'true')
          metrics.comments30 = true;
        if (data.months6 == 'true')
          metrics.comments6 = true;
      }
      if (data.saved == 'true') {
        metrics.saves = true;
        if (data.days7 == 'true')
          metrics.saves7 = true;
        if (data.days30 == 'true')
          metrics.saves30 = true;
        if (data.months6 == 'true')
          metrics.saves6 = true;
      }
      if (data.topdocs == 'true') {
         metrics.topDocs = true;
        if (data.days7 == 'true')
          metrics.topDocs7 = true;
        if (data.days30 == 'true')
          metrics.topDocs30 = true;
        if (data.months6 == 'true')
          metrics.topDocs6 = true;
      }
      if (data.topuser == 'true') {
         metrics.topUsers = true;
        if (data.days7 == 'true')
          metrics.topUsers7 = true;
        if (data.days30 == 'true')
          metrics.topUsers30 = true;
        if (data.months6 == 'true')
          metrics.topUsers6 = true;
      }
      return metrics;
    },
  deleteAllRequiredSheets: function(metrics, callback) {
    console.log(__dirname);
    var templateFilePath = path.join(__dirname.substring(0, __dirname.indexOf('javascripts')), 'templates', config.use_template_name);
    console.log("template file path:");
    console.log(templateFilePath);
    fs.readFile(templateFilePath, function(err, data) {
    //fs.readFile(path.join(__dirname, 'test-template-all-metrics-multiple-sheets.xlsx'), function(err, data) {

      // Create a template
      template = new XlsxTemplate(data);

      if (metrics.activeUsers7 == false) {
        template.deleteSheet('Active Users - 7 Days');
      }
      if (metrics.activeUsers30 == false) {
        template.deleteSheet('Active Users - 30 Days');
      }
      if (metrics.activeUsers6 == false) {
        template.deleteSheet('Active Users - 6 Months');
      }

      if (metrics.appInstalls7 == false) {
        template.deleteSheet('App Installs - 7 Days');
      }
      if (metrics.appInstalls30 == false) {
        template.deleteSheet('App Installs - 30 Days');
      }
      if (metrics.appInstalls6 == false) {
        template.deleteSheet('App Installs - 6 Months');
      }

      if (metrics.appSessions7 == false) {
        template.deleteSheet('App Sessions - 7 Days');
      }
      if (metrics.appSessions30 == false) {
        template.deleteSheet('App Sessions - 30 Days');
      }
      if (metrics.appSessions6 == false) {
        template.deleteSheet('App Sessions - 6 Months');
      }

      if (metrics.docsRead7 == false) {
      template.deleteSheet('Articles Read - 7 Days');
      }
      if (metrics.docsRead30 == false) {
      template.deleteSheet('Articles Read - 30 Days');
      }
      if (metrics.docsRead6 == false) {
      template.deleteSheet('Articles Read - 6 Months');
      }

      if (metrics.shares7 == false) {
      template.deleteSheet('Shares - 7 Days');
      }
      if (metrics.shares30 == false) {
      template.deleteSheet('Shares - 30 Days');
      }
      if (metrics.shares6 == false) {
      template.deleteSheet('Shares - 6 Months');
      }

       if (metrics.comments7 == false) {
      template.deleteSheet('Comments - 7 Days');
      }
      if (metrics.comments30 == false) {
      template.deleteSheet('Comments - 30 Days');
      }
      if (metrics.comments6 == false) {
      template.deleteSheet('Comments - 6 Months');
      }

      if (metrics.saves7 == false) {
      template.deleteSheet('Saves - 7 Days');
      }
      if (metrics.saves30 == false) {
      template.deleteSheet('Saves - 30 Days');
      }
      if (metrics.saves6 == false) {
      template.deleteSheet('Saves - 6 Months');
      }

      if (metrics.topDocs7 == false) {
      template.deleteSheet('Top Documents - 7 Days');
      }
      if (metrics.topDocs30 == false) {
      template.deleteSheet('Top Documents - 30 Days');
      }
      /*if (metrics.topDocs6 == false) {
      template.deleteSheet('Top Documents - 6 Months');
      }*/

      if (metrics.topUsers7 == false) {
      template.deleteSheet('Top Users - 7 Days');
      }
      if (metrics.topUsers30 == false) {
      template.deleteSheet('Top Users - 30 Days');
      }
      /*if (metrics.topUsers6 == false) {
      template.deleteSheet('Top Users - 6 Months');
      }*/
      
      if (template) {
          callback(template);
          return;
      } else {
        callback("Error");
        return;
      }
      });
      
  },
  getAllCompanies: function() {
    console.log("inside getAllCompanies");

    return new Promise(function(resolve, reject) 
    {
      con.connect(function (err) {
        con.query("select * from "+config.mysql_database+".company_details",  function (err, results, fields) 
        {
          console.log("done with query");
          if (err) {
            console.log("error occurred" + err);
            //con.end();
            resolve("Error Occurred during getAllCompanies capture! ");
          } else {
            console.log("got some results without error");
            console.log(results);
            if (results.length > 0) {
              var outputArr = [];
              for(var key in results) 
              {
                  var row = results[key];
                  console.log(row);
                  var abc = { id : row.company_id, name : row.company_name};

                  outputArr.push(abc);
              }
              console.log("returning companies array");
              //con.end();
              resolve(outputArr);
            } else {
              console.log("No companies available");
              //con.end();
              resolve("No companies found!");
            }
          }
        });
        //con.end();
      });

    });
  },
  addNewCompany: function(company_id, company_name) {
    console.log("inside addNewCompany");

    return new Promise(function(resolve, reject) 
    {
      con.connect(function (err) {
        con.query("Insert into "+config.mysql_database+".company_details(company_id,company_name)VALUES ('" + company_id + "', '" + company_name + "')",  function (err, results, fields) 
        {
          console.log("done with query");
          if (err) {
            console.log("error occurred" + err);
            resolve("Error Occurred during addNewCompany capture! ");
          } else {
            console.log("got some results without error");
            console.log(results);
            console.log(fields);
            console.log(results.affectedRows);
            if (results != undefined && parseInt(results.affectedRows)>0) {
              console.log("added new company");
              resolve("success");
            } else {
              console.log("No company added");
              resolve("No company added!");
            }
          }
        });
        //con.end();
      });

    });
  },
  deleteCompany: function(company_name) {
    console.log("inside deleteCompany");

    return new Promise(function(resolve, reject) 
    {
      con.connect(function (err) {
        con.query("DELETE FROM "+config.mysql_database+".company_details where company_name=?", [company_name], function (err, results, fields) 
        {
          console.log("done with query");
          if (err) {
            console.log("error occurred" + err);
            resolve("Error Occurred during deleteCompany capture! ");
          } else {
            console.log("got some results without error");
            console.log(results);
            if (results != undefined && parseInt(results.affectedRows)>0) {
              console.log("deleted company");
              resolve("success");
            } else {
              console.log("No company deleted");
              resolve("No company deleted!");
            }
          }
        });
        //con.end();
      });

    });
  },
  getAllAdminUsers: function(userId) {
    console.log("inside getAllAdminUsers");

    return new Promise(function(resolve, reject) 
    {
      con.connect(function (err) {
        con.query("select id, email from "+config.mysql_database+".emp_app_admins",  function (err, results, fields) 
        {
          console.log("done with query");
          if (err) {
            console.log("error occurred" + err);
            resolve("Error Occurred during getAllAdminUsers capture! ");
          } else {
            console.log("got some results without error");
            console.log(results);
            if (results.length > 0) {
              var adminUsersArr = [];
              for (key in results) {
                var row = results[key];
                adminUsersArr.push(row);
              }
              console.log("returning admin users array");
              resolve(adminUsersArr);
            } else {
              console.log("No admin users available");
              resolve("No admin users found!");
            }
          }
        });
        //con.end();
      });

    });

  },  
  checkIfAdminUser: function(userId) {
    console.log("inside checkIfAdminUser with userId = " + userId);
    return new Promise(function(resolve, reject) 
    {
      //var email = userId + "@meltwater.com";
      console.log("inside promise = " + userId);
      con.connect(function (err) {
        con.query("select id, email from "+config.mysql_database+".emp_app_admins where email='" + userId + "'",  function (err, results, fields) 
        {
          console.log("done with query");
          if (err) {
            console.log("error occurred" + err);
            resolve("Error Occurred during checkIfAdminUser capture! ");
          } else {
            console.log("got some results without error");
            console.log(results);
            if (results.length <=0) {
              console.log("empty, not an admin user");
              resolve("false");
            } else {
              console.log("not empty, is an admin user");
              resolve("true");
            }
          }
        });
        //con.end();
      });
    });

  },
  addAdminUser: function(email) {
    console.log("inside addAdminUser");

    return new Promise(function(resolve, reject) 
    {
      con.connect(function (err) {
        con.query("Insert into "+config.mysql_database+".emp_app_admins(email)VALUES ('" + email + "')",  function (err, results, fields) 
        {
          console.log("done with query");
          if (err) {
            console.log("error occurred" + err);
            resolve("Error Occurred during addAdminUser capture! ");
          } else {
            console.log("got some results without error");
            console.log(results);
            if (results != undefined && parseInt(results.affectedRows)>0) {
              console.log("added new admin user");
              resolve("success");
            } else {
              console.log("No admin user added");
              resolve("No admin user added!");
            }
          }
        });
        //con.end();
      });

    });
  },
  deleteAdminUser: function(email) {
    console.log("inside deleteAdminUser");

    return new Promise(function(resolve, reject) 
    {
      con.connect(function (err) {
        con.query("DELETE FROM "+config.mysql_database+".emp_app_admins where email=?", [email], function (err, results, fields) 
        {
          console.log("done with query");
          if (err) {
            console.log("error occurred" + err);
            resolve("Error Occurred during deleteAdminUser capture! ");
          } else {
            console.log("got some results without error");
            console.log(results);
            if (results != undefined && parseInt(results.affectedRows)>0) {
              console.log("deleted admin user");
              resolve("success");
            } else {
              console.log("No admin user deleted");
              resolve("No admin user deleted!");
            }
          }
        });
        //con.end();
      });

    });
  },
  appInstallsSetup: function(metrics, duration) {
    console.log("inside appInstallsSetup");

    return new Promise(function(resolve, reject) 
    {
      /*metrics.appInstalls = true;*/
      if (metrics.appInstalls == true) 
      {
        if (duration == "7days" && metrics.appInstalls7 == true) 
        {
          start_date = metrics.week_back_date;
          end_date = metrics.end_date;
        }
        if (duration == "30days" && metrics.appInstalls30 == true) 
        {
          start_date = metrics.month_back_date;
          end_date = metrics.end_date;
        }

        console.log(start_date);
        console.log(end_date);
        con.connect(function (err) {
          con.query("SELECT DATE(received_at) as Date, SUM(case when context_device_type = 'ios' then 1 else 0 end) as ios, SUM(case when context_device_type = 'android' then 1 else 0 end) as android,SUM(case when context_device_type = 'ios' then 1 else 0 end + case when context_device_type = 'android' then 1 else 0 end) as total FROM " + config.mysql_database + ".application_installed_sql t1 inner JOIN " + config.mysql_database + ".company_details t2 where t2.company_id = ? and DATE(received_at)>? and DATE(received_at) <=? GROUP BY DATE(received_at)",[metrics.companyId,start_date,end_date], function (err, results, fields) 
          {
            if (err) {
              console.log("error occurred" + err);
              resolve("Error Occurred during App Install " + duration + " capture! ");
            }
            else
            {      
              //iterate through all the dates from start date to end date
              //for date, make sure we get the right format

              var appInstallsArr = [];
              var endDate = new Date(end_date);
              for (var d = new Date(start_date); d <= endDate; d.setDate(d.getDate() + 1)) 
              {
                
                var obj;
                var boolSetFromDB = 0;
                var dateDataPoint = new Date(d);
                var localTime = dateDataPoint.getTimezoneOffset();
                /*console.log("the UTC time: ");
                console.log(dateDataPoint);
                console.log("date converted using getTimezoneOffset function");
                console.log(localTime);*/

                var currentLocalTime = new Date(dateDataPoint + localTime);
                for(var key in results) 
                {
                  var row = results[key];
                  if ((new Date(row.Date)).valueOf() == new Date(dateDataPoint).valueOf()) {
                    obj = {day:currentLocalTime,ios:row.ios,android:row.android,total:row.total};
                    boolSetFromDB = 1;
                    break;
                  }
                }
                if (boolSetFromDB == 0) {
                  obj = {day:currentLocalTime,ios:0,android:0,total:0};
                }
                appInstallsArr.push(obj);
                
              }
              if (duration == "7days") appinstalls7daysArr = appInstallsArr;
              if (duration == "30days") appinstalls30daysArr = appInstallsArr;
              console.log(appInstallsArr);
              console.log("Done with getting data from db, going to resolve arr appInstalls");
              resolve("App Installs " + duration + " Data Collected! ");
            }
          });
        });
      } 
      else 
      {
        resolve("App Installs Metric Not Requested! ");
      }
    });
  },
  activeUsersSetup: function(metrics, duration) {
    console.log("inside activeUsersSetup");

    return new Promise(function(resolve, reject) 
    {
    /* metrics.activeUsers = true;*/
      if (metrics.activeUsers == true) 
      {
        if (duration == "7days" && metrics.activeUsers7 == true) {
        start_date = metrics.week_back_date;
        end_date = metrics.end_date;
        }

        if (duration == "30days" && metrics.activeUsers30 == true) {
        start_date = metrics.month_back_date;
        end_date = metrics.end_date;
        }

        console.log(start_date);
        console.log(end_date);
        con.connect(function (err) {
          con.query("SELECT DATE(received_at) as Date, SUM(case when context_device_type = 'ios' then 1 else 0 end) as ios, SUM(case when context_device_type = 'android' then 1 else 0 end) as android,SUM(case when context_device_type = 'ios' then 1 else 0 end + case when context_device_type = 'android' then 1 else 0 end) as total from " + config.mysql_database + ".users_sql WHERE context_traits_company_id = ? AND DATE(received_at)>? and DATE(received_at)<=? GROUP BY DATE(received_at)",[metrics.companyId,start_date,end_date], function (err, results, fields) 
          {
            if (err) {
            console.log("error occurred" + err);
            resolve("Error Occurred during Active Users " + duration + " capture! ");
            }
            else
            {      
              //iterate through all the dates from start date to end date
              //for date, make sure we get the right format
              var activeUsersArr = [];
              var endDate = new Date(end_date);
              for (var d = new Date(start_date); d <= endDate; d.setDate(d.getDate() + 1)) 
              {
                var obj;
                var boolSetFromDB = 0;
                var dateDataPoint = new Date(d);
                var localTime = dateDataPoint.getTimezoneOffset();
                var currentLocalTime = new Date(dateDataPoint + localTime);
                for(var key in results) 
                {
                  var row = results[key];
                  //console.log(row.Date);
                  if ((new Date(row.Date)).valueOf() == dateDataPoint.valueOf()) {
                    obj = {day:currentLocalTime,ios:row.ios,android:row.android,total:row.total};
                    boolSetFromDB = 1;
                    break;
                  }
                }
                if (boolSetFromDB == 0) {
                  obj = {day:currentLocalTime,ios:0,android:0,total:0};
                }
                activeUsersArr.push(obj);
              }
              if (duration == "7days") {activeUsers7daysArr = activeUsersArr; console.log("set 7 days arr of activeusers7");}
              if (duration == "30days"){activeUsers30daysArr = activeUsersArr; console.log("set 30 days arr of activeusers30");}
              console.log(activeUsersArr);
              console.log("Done with getting data from db, going to resolve arr active users");
              resolve("Active Users " + duration + " Data Collected! ");
            }
          });
        });
      } else 
      {
        resolve("Active Users Metric Not Requested! ");
      }
    });
  },
  appSessionsSetup: function(metrics, duration) {
    console.log("inside appSessionsSetup");
    return new Promise(function(resolve, reject) 
    {
      if (metrics.appSessions == true) 
      {
        if (duration == "7days" && metrics.appSessions7 == true) {
        start_date = metrics.week_back_date;
        end_date = metrics.end_date;
        }

        if (duration == "30days" && metrics.appSessions30 == true) {
        start_date = metrics.month_back_date;
        end_date = metrics.end_date;
        }
        con.connect(function (err) {
          //Query for App Session
          con.query("SELECT DATE(t1.received_at) AS Date,SUM(case when t1.context_device_type = 'ios' then 1 else 0 end) as ios, SUM(case when t1.context_device_type = 'android' then 1 else 0 end) as android,SUM(case when context_device_type = 'ios' then 1 else 0 end + case when context_device_type = 'android' then 1 else 0 end) as total FROM " + config.mysql_database + ".foreground_sql t1 inner JOIN " + config.mysql_database + ".company_details t2 on t1.context_traits_company_id = t2.company_id where t2.company_id = ? AND DATE(t1.received_at)>? and DATE(t1.received_at)<=? GROUP BY DATE(t1.received_at)",[metrics.companyId,start_date,end_date], function (err, results, fields) 
          {
            if (err) {
            resolve("Error Occurred during App Sessions" + duration + " capture! ");
            }
            else
            {      
              var appSessionArr = [];
              var endDate = new Date(end_date);
              for (var d = new Date(start_date); d <= endDate; d.setDate(d.getDate() + 1)) 
              {
                var obj;
                var boolSetFromDB = 0;
                var dateDataPoint = new Date(d);
                var localTime = dateDataPoint.getTimezoneOffset();
                var currentLocalTime = new Date(dateDataPoint + localTime);
                for(var key in results) 
                {
                  var row = results[key];
                  //console.log(row.Date);
                  if ((new Date(row.Date)).valueOf() == dateDataPoint.valueOf()) {
                    obj = {day:currentLocalTime,ios:row.ios,android:row.android,total:row.total};
                    boolSetFromDB = 1;
                    break;
                  }
                }
                if (boolSetFromDB == 0) {
                  obj = {day:currentLocalTime,ios:0,android:0,total:0};
                }
                appSessionArr.push(obj);
               
              }
              if (duration == "7days") {appsession7daysArr = appSessionArr; console.log(appsession7daysArr);}
              if (duration == "30days"){appsession30daysArr = appSessionArr; console.log(appsession30daysArr);}
              console.log("Done with getting data from db, moving on to avg now, get active users first");
              //Query for Active Users
              con.query("SELECT DATE(received_at) as Date, SUM(case when context_device_type = 'ios' then 1 else 0 end) as ios, SUM(case when context_device_type = 'android' then 1 else 0 end) as android from " + config.mysql_database + ".users_sql WHERE context_traits_company_id = ? AND DATE(received_at)>? and DATE(received_at)<=? GROUP BY DATE(received_at)",[metrics.companyId,start_date,end_date], function (err, results, fields) 
              {
                if (err) {
                console.log("error occurred" + err);
                resolve("Error Occurred during Active Users Avg " + duration + " capture! ");
                }
                else
                { 
                  var activeUsersArrForAv = []
                  var endDate = new Date(end_date);
                  for (var d = new Date(start_date); d <= endDate; d.setDate(d.getDate() + 1)) 
                  {
                    var obj;
                    var boolSetFromDB = 0;
                    var dateDataPoint = new Date(d);
                    var localTime = dateDataPoint.getTimezoneOffset();
                    var currentLocalTime = new Date(dateDataPoint + localTime);
                    for(var key in results) 
                    {
                      var row = results[key];
                      if ((new Date(row.Date)).valueOf() == dateDataPoint.valueOf()) {
                        obj = {day:currentLocalTime,ios:row.ios,android:row.android};
                        boolSetFromDB = 1;
                        break;
                      }
                    }
                    if (boolSetFromDB == 0) {
                      obj = {day:currentLocalTime,ios:0,android:0};
                    }
                    activeUsersArrForAv.push(obj);
                    //console.log("the object for activeUsersArrForAv");
                    //console.log(activeUsersArrForAv);
                  }
                  
                  var objAvg;
                  var appSessionArrAvg = [];
                  for(var key in activeUsersArrForAv) {

                    var iOSAvg, androidAvg, totalAvg;

                    if (duration == "7days"){
                      iOSAvg = parseFloat(appsession7daysArr[key].ios)/parseFloat(activeUsersArrForAv[key].ios);
                      if (isNaN(iOSAvg)) iOSAvg = 0;
                      if(iOSAvg == "Infinity") iOSAvg = 0;
                      androidAvg = parseFloat(appsession7daysArr[key].android)/parseFloat(activeUsersArrForAv[key].android);
                      if (isNaN(androidAvg)) androidAvg = 0;
                      if(androidAvg == "Infinity") androidAvg = 0;
                      totalAvg = iOSAvg + androidAvg;
                      if (isNaN(totalAvg)) totalAvg = 0;
                      if(totalAvg == "Infinity") totalAvg = 0;
                    }
                    
                    if (duration == "30days"){
                      iOSAvg = parseFloat(appsession30daysArr[key].ios)/parseFloat(activeUsersArrForAv[key].ios);
                      if (isNaN(iOSAvg)) iOSAvg = 0;
                      if(iOSAvg == "Infinity") iOSAvg = 0;
                      androidAvg = parseFloat(appsession30daysArr[key].android)/parseFloat(activeUsersArrForAv[key].android);
                      if (isNaN(androidAvg)) androidAvg = 0;
                      if(androidAvg == "Infinity") androidAvg = 0;
                      totalAvg = iOSAvg + androidAvg;
                      if (isNaN(totalAvg)) totalAvg = 0;
                      if(totalAvg == "Infinity") totalAvg = 0;
                    }

                    // objAvg = {day:activeUsersArrForAv[key].day,ios:iOSAvg,android:androidAvg,total:totalAvg};
                    //objAvg = {day:activeUsersArrForAv[key].day,ios:roundTo(iOSAvg,2),android:roundTo(androidAvg,2)};
                    objAvg = {day:activeUsersArrForAv[key].day,ios:iOSAvg,android:androidAvg,totalAvg:totalAvg};
                    appSessionArrAvg.push(objAvg);
                    
                  }
                  if (duration == "7days") {appsession7daysArrAvg = appSessionArrAvg; console.log("set 7 days arr of app session7avg");}
                  if (duration == "30days"){appsession30daysArrAvg = appSessionArrAvg; console.log("set 30 days arr of appsession30avg");}
                  
                  console.log(appSessionArrAvg);
                  console.log("Done with getting data from db, going to resolve arr");
                  resolve("App Sessions " + duration + " Data Collected! ");
                }
              });
            }
          });
        });
      } else 
      {
        resolve("App session Metric Not Requested! ");
      }
    });
  },
  docsReadSetup: function(metrics, duration) {
   console.log("inside docsReadSetup");

    return new Promise(function(resolve, reject) 
    {
    /* metrics.activeUsers = true;*/
      if (metrics.docsRead == true) 
      {
        if (duration == "7days" && metrics.docsRead7 == true) {
        start_date = metrics.week_back_date;
        end_date = metrics.end_date;
        }

        if (duration == "30days" && metrics.docsRead30 == true) {
        start_date = metrics.month_back_date;
        end_date = metrics.end_date;
        }

        /*console.log(start_date);
        console.log(end_date);*/
        con.connect(function (err) {
          con.query("SELECT DATE(t1.received_at) AS Date, SUM(case when t1.context_device_type = 'ios' then 1 else 0 end) as ios, SUM(case when t1.context_device_type = 'android' then 1 else 0 end) as android,SUM(case when context_device_type = 'ios' then 1 else 0 end + case when context_device_type = 'android' then 1 else 0 end) as total FROM " + config.mysql_database + ".view_document_sql t1 INNER JOIN " + config.mysql_database + ".company_details t2 ON t1.context_traits_company_id = t2.company_id WHERE t2.company_id = ?  AND DATE(t1.received_at)>? and DATE(t1.received_at)<=? GROUP BY DATE(t1.received_at)",[metrics.companyId,start_date,end_date], function (err, results, fields) 
          {
            if (err) {
            /*console.log("error occurred" + err);*/
            resolve("Error Occurred during Docs Read" + duration + " capture! ");
            }
            else
            {      
              var docsReadArr = [];
              var endDate = new Date(end_date);
              for (var d = new Date(start_date); d <= endDate; d.setDate(d.getDate() + 1)) 
              {
                var obj;
                var boolSetFromDB = 0;
                var dateDataPoint = new Date(d);
                var localTime = dateDataPoint.getTimezoneOffset();
                var currentLocalTime = new Date(dateDataPoint + localTime);
                for(var key in results) 
                {
                  var row = results[key];
                  //console.log(row.Date);
                  if ((new Date(row.Date)).valueOf() == dateDataPoint.valueOf()) {
                    obj = {day:currentLocalTime,ios:row.ios,android:row.android,total:row.total};
                    boolSetFromDB = 1;
                    break;
                  }
                }
                if (boolSetFromDB == 0) {
                  obj = {day:currentLocalTime,ios:0,android:0,total:0};
                }
                docsReadArr.push(obj);
              }
              if (duration == "7days") {docsRead7daysArr = docsReadArr; console.log("set 7 days arr of docsread7");}
              if (duration == "30days"){docsRead30daysArr = docsReadArr; console.log("set 30 days arr of docsread30");}

              console.log(docsReadArr);
              console.log("Done with getting data from db, moving on to avg now, get active users first");
              //Query for active users
              con.query("SELECT DATE(received_at) as Date, SUM(case when context_device_type = 'ios' then 1 else 0 end) as ios, SUM(case when context_device_type = 'android' then 1 else 0 end) as android from " + config.mysql_database + ".users_sql WHERE context_traits_company_id = ? AND DATE(received_at)>? and DATE(received_at)<=? GROUP BY DATE(received_at)",[metrics.companyId,start_date,end_date], function (err, results, fields) 
              {
                if (err) {
                console.log("error occurred" + err);
                resolve("Error Occurred during Active Users Avg " + duration + " capture! ");
                }
                else
                { 
                  var activeUsersArrForAv = []
                  var endDate = new Date(end_date);
                  for (var d = new Date(start_date); d <= endDate; d.setDate(d.getDate() + 1)) 
                  {
                    var obj;
                    var boolSetFromDB = 0;
                    var dateDataPoint = new Date(d);
                    var localTime = dateDataPoint.getTimezoneOffset();
                    var currentLocalTime = new Date(dateDataPoint + localTime);
                    for(var key in results) 
                    {
                      var row = results[key];
                      //console.log(row.Date);
                      if ((new Date(row.Date)).valueOf() == dateDataPoint.valueOf()) {
                        obj = {day:currentLocalTime,ios:row.ios,android:row.android};
                        boolSetFromDB = 1;
                        break;
                      }
                    }
                    if (boolSetFromDB == 0) {
                      obj = {day:currentLocalTime,ios:0,android:0,total:0};
                    }
                    activeUsersArrForAv.push(obj);
                  }
                  
                  var objAvg;
                  var docsReadArrAvg = [];
                  for(var key in activeUsersArrForAv) {

                    var iOSAvg, androidAvg, totalAvg;

                    if (duration == "7days"){
                      iOSAvg = parseFloat(docsRead7daysArr[key].ios)/parseFloat(activeUsersArrForAv[key].ios);
                      if (isNaN(iOSAvg)) iOSAvg = 0;
                      if(iOSAvg == "Infinity") iOSAvg = 0;
                      androidAvg = parseFloat(docsRead7daysArr[key].android)/parseFloat(activeUsersArrForAv[key].android);
                      if (isNaN(androidAvg)) androidAvg = 0;
                      if(androidAvg == "Infinity") androidAvg = 0;
                      totalAvg = iOSAvg + androidAvg;
                      if (isNaN(totalAvg)) totalAvg = 0;
                      if(totalAvg == "Infinity") totalAvg = 0;
                    }
                    
                    if (duration == "30days"){
                      iOSAvg = parseFloat(docsRead30daysArr[key].ios)/parseFloat(activeUsersArrForAv[key].ios);
                      if (isNaN(iOSAvg)) iOSAvg = 0;
                      if(iOSAvg == "Infinity") iOSAvg = 0;
                      androidAvg = parseFloat(docsRead30daysArr[key].android)/parseFloat(activeUsersArrForAv[key].android);
                      if (isNaN(androidAvg)) androidAvg = 0;
                      if(androidAvg == "Infinity") androidAvg = 0;
                      totalAvg = iOSAvg + androidAvg;
                      if (isNaN(totalAvg)) totalAvg = 0;
                      if(totalAvg == "Infinity") totalAvg = 0;
                    }

                    // objAvg = {day:activeUsersArrForAv[key].day,ios:iOSAvg,android:androidAvg,total:totalAvg};
                    //objAvg = {day:activeUsersArrForAv[key].day,ios:roundTo(iOSAvg,2),android:roundTo(androidAvg,2)};
                    objAvg = {day:activeUsersArrForAv[key].day,ios:iOSAvg,android:androidAvg,totalAvg:totalAvg};
                    docsReadArrAvg.push(objAvg);
                    
                  }
                  if (duration == "7days") {docsRead7daysArrAvg = docsReadArrAvg; console.log("set 7 days arr of app session7avg");}
                  if (duration == "30days"){docsRead30daysArrAvg = docsReadArrAvg; console.log("set 30 days arr of appsession30avg");}
                  
                  resolve("Docs read " + duration + " Data Collected! ");
                }
              });
            }
          });
        });
      } else 
      {
        resolve("Doc read Metric Not Requested! ");
      }
    });
  },
  sharesSetup: function(metrics, duration) {
   console.log("inside sharesSetup");

    return new Promise(function(resolve, reject) 
    {
    /* metrics.activeUsers = true;*/
      if (metrics.shares == true) 
      {
        if (duration == "7days" && metrics.shares7 == true) {
        start_date = metrics.week_back_date;
        end_date = metrics.end_date;
        }

        if (duration == "30days" && metrics.shares30 == true) {
        start_date = metrics.month_back_date;
        end_date = metrics.end_date;
        }

        console.log(start_date);
        console.log(end_date);
        con.connect(function (err) {
          con.query("SELECT DATE(t1.received_at) AS Date,SUM(case when t1.context_device_type = 'ios' then 1 else 0 end) as ios,SUM(case when t1.context_device_type = 'android' then 1 else 0 end) as android,SUM(case when context_device_type = 'ios' then 1 else 0 end + case when context_device_type = 'android' then 1 else 0 end) as total FROM " + config.mysql_database + ".share_document_sql t1 INNER JOIN " + config.mysql_database + ".company_details t2 ON t1.context_traits_company_id = t2.company_id WHERE t2.company_id=? AND DATE(t1.received_at)>? and DATE(t1.received_at)<=? GROUP BY DATE(t1.received_at)",[metrics.companyId,start_date,end_date], function (err, results, fields) 
          {
            if (err) {
            console.log("error occurred" + err);
            resolve("Error Occurred during Docs shared" + duration + " capture! ");
            }
            else
            {      
              var docsSharedArr = [];
              var endDate = new Date(end_date);
              for (var d = new Date(start_date); d <= endDate; d.setDate(d.getDate() + 1)) 
              {
                var obj;
                var boolSetFromDB = 0;
                var dateDataPoint = new Date(d);
                var localTime = dateDataPoint.getTimezoneOffset();
                var currentLocalTime = new Date(dateDataPoint + localTime);
                for(var key in results) 
                {
                  var row = results[key];
                  //console.log(row.Date);
                  if ((new Date(row.Date)).valueOf() == dateDataPoint.valueOf()) {
                    obj = {day:currentLocalTime,ios:row.ios,android:row.android,total:row.total};
                    boolSetFromDB = 1;
                    break;
                  }
                }
                if (boolSetFromDB == 0) {
                  obj = {day:currentLocalTime,ios:0,android:0,total:0};
                }
                docsSharedArr.push(obj);
              }
                if (duration == "7days") {docsShared7daysArr = docsSharedArr; console.log("set 7 days arr of shared");}
                if (duration == "30days"){docsShared30daysArr = docsSharedArr; console.log("set 30 days arr of shared");}

                console.log(docsSharedArr);
                console.log("Done with getting data from db, moving on to avg now, get active users first");
                
                con.query("SELECT DATE(received_at) as Date, SUM(case when context_device_type = 'ios' then 1 else 0 end) as ios, SUM(case when context_device_type = 'android' then 1 else 0 end) as android from " + config.mysql_database + ".users_sql WHERE context_traits_company_id = ? AND DATE(received_at)>? and DATE(received_at)<=? GROUP BY DATE(received_at)",[metrics.companyId,start_date,end_date], function (err, results, fields) 
                {
                  if (err) {
                  console.log("error occurred" + err);
                  resolve("Error Occurred during Active Users Avg " + duration + " capture! ");
                  }
                  else
                  { 
                    var activeUsersArrForAv = []
                    var endDate = new Date(end_date);
                    for (var d = new Date(start_date); d <= endDate; d.setDate(d.getDate() + 1)) 
                    {
                      var obj;
                      var boolSetFromDB = 0;
                      var dateDataPoint = new Date(d);
                      var localTime = dateDataPoint.getTimezoneOffset();
                      var currentLocalTime = new Date(dateDataPoint + localTime);
                      for(var key in results) 
                      {
                        var row = results[key];
                        //console.log(row.Date);
                        if ((new Date(row.Date)).valueOf() == dateDataPoint.valueOf()) {
                          obj = {day:currentLocalTime,ios:row.ios,android:row.android};
                          boolSetFromDB = 1;
                          break;
                        }
                      }
                      if (boolSetFromDB == 0) {
                        obj = {day:currentLocalTime,ios:0,android:0};
                      }
                      activeUsersArrForAv.push(obj);
                    }
                    
                    var objAvg;
                    var docsSharedArrAvg = [];
                    for(var key in activeUsersArrForAv) {

                      var iOSAvg, androidAvg, totalAvg;

                      if (duration == "7days"){
                        iOSAvg = parseFloat(docsShared7daysArr[key].ios)/parseFloat(activeUsersArrForAv[key].ios);
                        if (isNaN(iOSAvg)) iOSAvg = 0;
                        if(iOSAvg == "Infinity") iOSAvg = 0;
                        androidAvg = parseFloat(docsShared7daysArr[key].android)/parseFloat(activeUsersArrForAv[key].android);
                        if (isNaN(androidAvg)) androidAvg = 0;
                        if(androidAvg == "Infinity") androidAvg = 0;
                        totalAvg = iOSAvg + androidAvg;
                        if (isNaN(totalAvg)) totalAvg = 0;
                        if(totalAvg == "Infinity") totalAvg = 0;
                      }
                      
                      if (duration == "30days"){
                        iOSAvg = parseFloat(docsShared30daysArr[key].ios)/parseFloat(activeUsersArrForAv[key].ios);
                        if (isNaN(iOSAvg)) iOSAvg = 0;
                        if(iOSAvg == "Infinity") iOSAvg = 0;
                        androidAvg = parseFloat(docsShared30daysArr[key].android)/parseFloat(activeUsersArrForAv[key].android);
                        if (isNaN(androidAvg)) androidAvg = 0;
                        if(androidAvg == "Infinity") androidAvg = 0;
                        totalAvg = iOSAvg + androidAvg;
                        if (isNaN(totalAvg)) totalAvg = 0;
                        if(totalAvg == "Infinity") totalAvg = 0;
                      }

                      // objAvg = {day:activeUsersArrForAv[key].day,ios:iOSAvg,android:androidAvg,total:totalAvg};
                      //objAvg = {day:activeUsersArrForAv[key].day,ios:roundTo(iOSAvg,2),android:roundTo(androidAvg,2)};
                      objAvg = {day:activeUsersArrForAv[key].day,ios:iOSAvg,android:androidAvg,totalAvg:totalAvg};
                      docsSharedArrAvg.push(objAvg);
                      
                    }
                    if (duration == "7days") {docsShared7daysArrAvg = docsSharedArrAvg; console.log("set 7 days arr of docs shared 7 avg");}
                    if (duration == "30days"){docsShared30daysArrAvg = docsSharedArrAvg; console.log("set 30 days arr of docs shared 30 avg");}
                    console.log(docsSharedArrAvg);
                    resolve("Docs Shared " + duration + " Data Collected! ");
                  }
                });
            }
          });
        });
      } else 
      {
        resolve("Doc shared Metric Not Requested! ");
      }
    });
  },
  commentsSetup: function(metrics, duration) {
   console.log("inside commentsSetup");

    return new Promise(function(resolve, reject) 
    {
    /* metrics.activeUsers = true;*/
      if (metrics.comments == true) 
      {
        if (duration == "7days" && metrics.comments7 == true) {
        start_date = metrics.week_back_date;
        end_date = metrics.end_date;
        }

        if (duration == "30days" && metrics.comments30 == true) {
        start_date = metrics.month_back_date;
        end_date = metrics.end_date;
        }

        console.log(start_date);
        console.log(end_date);
        con.connect(function (err) {
          //Query for comments
          con.query("SELECT DATE(t1.received_at) AS Date,SUM(case when t1.context_device_type = 'ios' then 1 else 0 end) as ios,SUM(case when t1.context_device_type = 'android' then 1 else 0 end) as android,SUM(case when context_device_type = 'ios' then 1 else 0 end + case when context_device_type = 'android' then 1 else 0 end) as total FROM " + config.mysql_database + ".comment_on_document_sql t1 INNER JOIN " + config.mysql_database + ".company_details t2 ON t1.context_traits_company_id = t2.company_id WHERE t2.company_id=? AND DATE(t1.received_at)>? and DATE(t1.received_at)<=? GROUP BY DATE(t1.received_at)",[metrics.companyId,start_date,end_date], function (err, results, fields) 
          {
            if (err) {
            console.log("error occurred" + err);
            resolve("Error Occurred during comments" + duration + " capture! ");
            }
            else
            {      
              var commentsArr = [];
              var endDate = new Date(end_date);
              for (var d = new Date(start_date); d <= endDate; d.setDate(d.getDate() + 1)) 
              {
                var obj;
                var boolSetFromDB = 0;
                var dateDataPoint = new Date(d);
                var localTime = dateDataPoint.getTimezoneOffset();
                var currentLocalTime = new Date(dateDataPoint + localTime);
                for(var key in results) 
                {
                  var row = results[key];
                  //console.log(row.Date);
                  if ((new Date(row.Date)).valueOf() == dateDataPoint.valueOf()) {
                    obj = {day:currentLocalTime,ios:row.ios,android:row.android,total:row.total};
                    boolSetFromDB = 1;
                    break;
                  }
                }
                if (boolSetFromDB == 0) {
                  obj = {day:currentLocalTime,ios:0,android:0,total:0};
                }
                commentsArr.push(obj);
              }
                if (duration == "7days") {comments7daysArr = commentsArr; console.log("set 7 days arr of comments");}
                if (duration == "30days"){comments30daysArr = commentsArr; console.log("set 30 days arr of comments");}

                console.log(commentsArr);
                console.log("Done with getting data from db, moving on to avg now, get active users first");
                //active users
                con.query("SELECT DATE(received_at) as Date, SUM(case when context_device_type = 'ios' then 1 else 0 end) as ios, SUM(case when context_device_type = 'android' then 1 else 0 end) as android from " + config.mysql_database + ".users_sql WHERE context_traits_company_id = ? AND DATE(received_at)>? and DATE(received_at)<=? GROUP BY DATE(received_at)",[metrics.companyId,start_date,end_date], function (err, results, fields) 
                {
                  if (err) {
                  console.log("error occurred" + err);
                  resolve("Error Occurred during Active Users Avg " + duration + " capture! ");
                  }
                  else
                  { 
                    var activeUsersArrForAv = []
                    var endDate = new Date(end_date);
                    for (var d = new Date(start_date); d <= endDate; d.setDate(d.getDate() + 1)) 
                    {
                      var obj;
                      var boolSetFromDB = 0;
                      var dateDataPoint = new Date(d);
                      var localTime = dateDataPoint.getTimezoneOffset();
                      var currentLocalTime = new Date(dateDataPoint + localTime);
                      for(var key in results) 
                      {
                        var row = results[key];
                        //console.log(row.Date);
                        if ((new Date(row.Date)).valueOf() == dateDataPoint.valueOf()) {
                          obj = {day:currentLocalTime,ios:row.ios,android:row.android};
                          boolSetFromDB = 1;
                          break;
                        }
                      }
                      if (boolSetFromDB == 0) {
                        obj = {day:currentLocalTime,ios:0,android:0};
                      }
                      activeUsersArrForAv.push(obj);
                    }
                    
                    var objAvg;
                    var commentsArrAvg = [];
                    for(var key in activeUsersArrForAv) {

                      var iOSAvg, androidAvg, totalAvg;

                      if (duration == "7days"){
                        iOSAvg = parseFloat(comments7daysArr[key].ios)/parseFloat(activeUsersArrForAv[key].ios);
                        if (isNaN(iOSAvg)) iOSAvg = 0;
                        if(iOSAvg == "Infinity") iOSAvg = 0;
                        androidAvg = parseFloat(comments7daysArr[key].android)/parseFloat(activeUsersArrForAv[key].android);
                        if (isNaN(androidAvg)) androidAvg = 0;
                        if(androidAvg == "Infinity") androidAvg = 0;
                        totalAvg = iOSAvg + androidAvg;
                        if (isNaN(totalAvg)) totalAvg = 0;
                        if(totalAvg == "Infinity") totalAvg = 0;
                      }
                      
                      if (duration == "30days"){
                        iOSAvg = parseFloat(comments30daysArr[key].ios)/parseFloat(activeUsersArrForAv[key].ios);
                        if (isNaN(iOSAvg)) iOSAvg = 0;
                        if(iOSAvg == "Infinity") iOSAvg = 0;
                        androidAvg = parseFloat(comments30daysArr[key].android)/parseFloat(activeUsersArrForAv[key].android);
                        if (isNaN(androidAvg)) androidAvg = 0;
                        if(androidAvg == "Infinity") androidAvg = 0;
                        totalAvg = iOSAvg + androidAvg;
                        if (isNaN(totalAvg)) totalAvg = 0;
                        if(totalAvg == "Infinity") totalAvg = 0;
                      }

                      // objAvg = {day:activeUsersArrForAv[key].day,ios:iOSAvg,android:androidAvg,total:totalAvg};
                      //objAvg = {day:activeUsersArrForAv[key].day,ios:roundTo(iOSAvg,2),android:roundTo(androidAvg,2)};
                      objAvg = {day:activeUsersArrForAv[key].day,ios:iOSAvg,android:androidAvg,totalAvg:totalAvg};
                      commentsArrAvg.push(objAvg);
                      //console.log("average of comments");
                      //console.log(commentsArrAvg);
                      
                    }
                    if (duration == "7days") {comments7daysArrAvg = commentsArrAvg; console.log("set 7 days arr of comments 7 avg");}
                    if (duration == "30days"){comments30daysArrAvg = commentsArrAvg; console.log("set 30 days arr of comments30 avg");}
                    console.log(commentsArrAvg);
                    resolve("Comments " + duration + " Data Collected! ");
                  }
                });
            }
          });
        });
      } else 
      {
        resolve("Doc comments Metric Not Requested! ");
      }
    });
  },
  savesSetup: function(metrics, duration) {
   console.log("inside savesSetup");

    return new Promise(function(resolve, reject) 
    {
      /* metrics.activeUsers = true;*/
      if (metrics.saves == true) 
      {
        if (duration == "7days" && metrics.saves7 == true) {
        start_date = metrics.week_back_date;
        end_date = metrics.end_date;
        }

        if (duration == "30days" && metrics.saves30 == true) {
        start_date = metrics.month_back_date;
        end_date = metrics.end_date;
        }

        console.log(start_date);
        console.log(end_date);
        con.connect(function (err) {
          con.query("SELECT DATE(t1.received_at) AS Date,SUM(case when t1.context_device_type = 'ios' then 1 else 0 end) as ios,SUM(case when t1.context_device_type = 'android' then 1 else 0 end) as android,SUM(case when context_device_type = 'ios' then 1 else 0 end + case when context_device_type = 'android' then 1 else 0 end) as total FROM " + config.mysql_database + ".saved_document_sql t1 INNER JOIN " + config.mysql_database + ".company_details t2 ON t1.context_traits_company_id = t2.company_id WHERE t2.company_id = ? AND DATE(t1.received_at)>? and DATE(t1.received_at)<=? AND is_saved='true' GROUP BY DATE(t1.received_at)",[metrics.companyId,start_date,end_date], function (err, results, fields) 
          {
            if (err) {
            console.log("error occurred" + err);
            resolve("Error Occurred during Docs saved" + duration + " capture! ");
            }
            else
            {      
              var docsSavedArr = [];
              var endDate = new Date(end_date);
              for (var d = new Date(start_date); d <= endDate; d.setDate(d.getDate() + 1)) 
              {
                var obj;
                var boolSetFromDB = 0;
                var dateDataPoint = new Date(d);
                var localTime = dateDataPoint.getTimezoneOffset();
                var currentLocalTime = new Date(dateDataPoint + localTime);
                for(var key in results) 
                {
                  var row = results[key];
                  //console.log(row.Date);
                  if ((new Date(row.Date)).valueOf() == dateDataPoint.valueOf()) {
                    obj = {day:currentLocalTime,ios:row.ios,android:row.android,total:row.total};
                    boolSetFromDB = 1;
                    break;
                  }
                }
                if (boolSetFromDB == 0) {
                  obj = {day:currentLocalTime,ios:0,android:0,total:0};
                }
                docsSavedArr.push(obj);
                
              }
              if (duration == "7days") {saved7daysArr = docsSavedArr; console.log("set 7 days arr of saved");}
              if (duration == "30days"){saved30daysArr = docsSavedArr; console.log("set 30 days arr of saved");}
              console.log(docsSavedArr);
              console.log("Done with getting data from db, moving on to avg now, get active users first");
                //active users
                con.query("SELECT DATE(received_at) as Date, SUM(case when context_device_type = 'ios' then 1 else 0 end) as ios, SUM(case when context_device_type = 'android' then 1 else 0 end) as android from " + config.mysql_database + ".users_sql WHERE context_traits_company_id = ? AND DATE(received_at)>? and DATE(received_at)<=? GROUP BY DATE(received_at)",[metrics.companyId,start_date,end_date], function (err, results, fields) 
                {
                  if (err) {
                  console.log("error occurred" + err);
                  resolve("Error Occurred during Active Users Avg " + duration + " capture! ");
                  }
                  else
                  { 
                    var activeUsersArrForAv = []
                    var endDate = new Date(end_date);
                    for (var d = new Date(start_date); d <= endDate; d.setDate(d.getDate() + 1)) 
                    {
                      var obj;
                      var boolSetFromDB = 0;
                      var dateDataPoint = new Date(d);
                      var localTime = dateDataPoint.getTimezoneOffset();
                      var currentLocalTime = new Date(dateDataPoint + localTime);
                      for(var key in results) 
                      {
                        var row = results[key];
                        //console.log(row.Date);
                        if ((new Date(row.Date)).valueOf() == dateDataPoint.valueOf()) {
                          obj = {day:currentLocalTime,ios:row.ios,android:row.android};
                          boolSetFromDB = 1;
                          break;
                        }
                      }
                      if (boolSetFromDB == 0) {
                        obj = {day:currentLocalTime,ios:0,android:0};
                      }
                      activeUsersArrForAv.push(obj);
                    }
                    
                    var objAvg;
                    var savesArrAvg = [];
                    for(var key in activeUsersArrForAv) {

                      var iOSAvg, androidAvg, totalAvg;

                      if (duration == "7days"){
                        iOSAvg = parseFloat(saved7daysArr[key].ios)/parseFloat(activeUsersArrForAv[key].ios);
                        if (isNaN(iOSAvg)) iOSAvg = 0;
                        if(iOSAvg == "Infinity") iOSAvg = 0;
                        androidAvg = parseFloat(saved7daysArr[key].android)/parseFloat(activeUsersArrForAv[key].android);
                        if (isNaN(androidAvg)) androidAvg = 0;
                        if(androidAvg == "Infinity") androidAvg = 0;
                        totalAvg = iOSAvg + androidAvg;
                        if (isNaN(totalAvg)) totalAvg = 0;
                        if(totalAvg == "Infinity") totalAvg = 0;
                      }
                      
                      if (duration == "30days"){
                        iOSAvg = parseFloat(saved30daysArr[key].ios)/parseFloat(activeUsersArrForAv[key].ios);
                        if (isNaN(iOSAvg)) iOSAvg = 0;
                        if(iOSAvg == "Infinity") iOSAvg = 0;
                        androidAvg = parseFloat(saved30daysArr[key].android)/parseFloat(activeUsersArrForAv[key].android);
                        if (isNaN(androidAvg)) androidAvg = 0;
                        if(androidAvg == "Infinity") androidAvg = 0;
                        totalAvg = iOSAvg + androidAvg;
                        if (isNaN(totalAvg)) totalAvg = 0;
                        if(totalAvg == "Infinity") totalAvg = 0;
                      }

                      // objAvg = {day:activeUsersArrForAv[key].day,ios:iOSAvg,android:androidAvg,total:totalAvg};
                      //objAvg = {day:activeUsersArrForAv[key].day,ios:roundTo(iOSAvg,2),android:roundTo(androidAvg,2)};
                      objAvg = {day:activeUsersArrForAv[key].day,ios:iOSAvg,android:androidAvg,totalAvg:totalAvg};
                      savesArrAvg.push(objAvg);
                      //console.log("average of docs saved");
                      //console.log(savesArrAvg);
                      
                    }
                    if (duration == "7days") {saved7daysArrAvg = savesArrAvg; console.log("set 7 days arr of docs saved 7 avg");}
                    if (duration == "30days"){saved30daysArrAvg = savesArrAvg; console.log("set 30 days arr of docs saved 30 avg");}
                    console.log(savesArrAvg);
                    resolve("Docs Saved " + duration + " Data Collected! ");
                  }
                });
            }
          });
        });
      } else 
      {
        resolve("Doc saved Metric Not Requested! ");
      }
    });
  },  
  topdocsSetup: function(metrics, duration) {
    console.log("inside topDocsSetup1");

    return new Promise(function(resolve, reject) 
    {
      //metrics.topDocs = true;
      //metrics.topDocs7 = true;
      if (metrics.topDocs == true) 
      {
        if (duration == "7days" && metrics.topDocs7 == true) 
        {
          start_date = metrics.week_back_date;
          end_date = metrics.end_date;
        }
        if (duration == "30days" && metrics.topDocs30 == true) 
        {
          start_date = metrics.month_back_date;
          end_date = metrics.end_date;
        }

        console.log(start_date);
        console.log(end_date);
        // start_date = '2018-6-26';
        // end_date = '2018-07-03';
        var finalArr = [];
        con.connect(function (err) {
          con.query("select document_id, document_title, document_url,channel_name as channel,count(document_id) as view_count from "+config.mysql_database+".view_document_sql where DATE(received_at)>? and DATE(received_at)<=? group by document_id, document_title, document_url order by view_count desc limit 11",[start_date,end_date], function (err, results, fields) 
          {
            if (err) {
              console.log("error occurred" + err);
              resolve("Error Occurred during Top Documents " + duration + " capture! ");
            }
            else
            {     
              console.log("got some results");
              console.log(results);
              var viewsCountArr;
              var sharesCountArr;
              var commentsCountArr;
              var savesCountArr;

              viewsCountArr = results;

              //var topDocsArr = [];
              var topDocIds = '';
              for(var key in results) 
              {
                var row = results[key];
                if (row.document_url != 'null') {
                  topDocIds = topDocIds + "'" + row.document_id + "',";
                }
              }
              console.log(topDocIds);
              var aaa = topDocIds.substring(0, (topDocIds.length)-1);

              var sharesArr = [];
              var commentsArr = [];

              con.query("select document_id, count(document_id) as share_count from "+config.mysql_database+".share_document_sql where document_id in ("+aaa+") and DATE(received_at)>? and DATE(received_at)<=? group by document_id",[start_date,end_date], function (err, resultsShares, fields) 
              {
                if (err) {
                  console.log("error occurred" + err);
                  //resolve("Error Occurred during App Install " + duration + " capture! ");
                } else {
                   console.log("done done");
                  
                  sharesCountArr = resultsShares;

                  con.query("select document_id, count(document_id) as comment_count from "+config.mysql_database+".comment_on_document_sql where document_id in ("+aaa+") and DATE(received_at)>? and DATE(received_at)<=? group by document_id",[start_date,end_date], function (err, resultsComments, fields) 
                  {
                    if (err) {
                      console.log("error occurred" + err);
                      //resolve("Error Occurred during App Install " + duration + " capture! ");
                    } else {
                      
                      commentsCountArr = resultsComments;

                      con.query("select document_id, count(document_id) as save_count from "+config.mysql_database+".saved_document_sql where document_id in ("+aaa+") and DATE(received_at)>? and DATE(received_at)<=? group by document_id",[start_date,end_date], function (err, resultsSaves, fields) 
                      {
                        if (err) {
                          console.log("error occurred" + err);
                          //resolve("Error Occurred during App Install " + duration + " capture! ");
                        } else {
                          savesCountArr = resultsSaves;

                          // console.log(viewsCountArr);
                          // console.log(sharesCountArr);
                          // console.log(commentsCountArr);
                          // console.log(savesCountArr);

                          for (key in viewsCountArr) {
                            
                            //console.log(viewsCountArr[key]);
                            var viewsRow = viewsCountArr[key];
                            if (viewsRow.document_id != 'null') {
                              var docId = viewsRow.document_id;
                              var docTitle = viewsRow.document_title;
                              var docUrl = viewsRow.document_url;
                              var docChannel = viewsRow.channel;
                              var viewsCount = viewsRow.view_count;
                              var sharesCount = 0; var commentsCount = 0; var savesCount = 0;

                              for(key in sharesCountArr) {
                                var sharesRow = sharesCountArr[key];
                                if (sharesRow.document_id == docId) {
                                  sharesCount = sharesRow.share_count;
                                }
                              }

                              for(key in commentsCountArr) {
                                var commentsRow = commentsCountArr[key];
                                if (commentsRow.document_id == docId) {
                                  commentsCount = commentsRow.comment_count;
                                }
                              }

                              for(key in savesCountArr) {
                                var savesRow = savesCountArr[key];
                                if (savesRow.document_id == docId) {
                                  savesCount = savesRow.save_count;
                                }
                              }
                              
                              var obj = {title:docTitle,url:docUrl,channel:docChannel,opens:viewsCount,shares:sharesCount,comments:commentsCount,saves:savesCount};
                              finalArr.push(obj);
                            }
                          }

                          console.log("finally:");
                          console.log(finalArr);

                          if (duration == "7days") topDocs7daysArr = finalArr;
                          if (duration == "30days") topDocs30daysArr = finalArr;
                          console.log(finalArr);
                          console.log("Done with getting data from db, going to resolve arr topDocs");
                          resolve("Top Documents " + duration + " Data Collected! ");

                        }
                      });

                    }
                  });
                }
              });           
            }
          });
        });
      } 
      else 
      {
        resolve("Top Documents Metric Not Requested! ");
      }
    });
  },
  topUsersSetup: function(metrics, duration) {
   console.log("inside topUsersSetup");

    return new Promise(function(resolve, reject) 
    {
      if (metrics.topUsers == true) 
      {
        if (duration == "7days" && metrics.topUsers7 == true) {
          start_date = metrics.week_back_date;
          end_date = metrics.end_date;
        }

        if (duration == "30days" && metrics.topUsers30 == true) {
          start_date = metrics.month_back_date;
          end_date = metrics.end_date;
        }

        console.log(start_date);
        console.log(end_date);
        con.connect(function (err) {
          con.query("Set sql_mode=('STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION')",  function (err, results, fields) 
          {
            if (err) {
              console.log("Error when setting sql_mode");
            } else {
              console.log("Successfully set sql_mode");
            }
            con.query("select t1.context_traits_first_name as firstname,t1.context_traits_last_name as lastname,t1.context_traits_email as mail,COUNT(t2.user_id) as count from " + config.mysql_database + ".users_sql t1 inner JOIN " + config.mysql_database + ".foreground_sql t2 on t1.context_traits_user_id = t2.user_id where t1.context_traits_company_id = ? AND DATE(t1.received_at)>? and DATE(t1.received_at)<=? GROUP BY t2.user_id order by count DESC LIMIT 10",[metrics.companyId,start_date,end_date], function (err, sesResults, fields) 
            {
              if (err) {
              console.log("Error occurred during Top Users by sessions capture: " + err);
              resolve("Error Occurred during Top Users " + duration + " capture! ");
              }
              else
              {         
                var topUsersSessionArr = [];
                for(var key in sesResults) 
                {
                  var row = sesResults[key];
                  var obj = {first:row.firstname,last:row.lastname,email:row.mail,count:row.count};
                  topUsersSessionArr.push(obj);
                }
                
                if (duration == "7days") {topUsers7daysArr = topUsersSessionArr; console.log("set 7 days arr of topuser session");}
                if (duration == "30days"){topUsers30daysArr = topUsersSessionArr; console.log("set 30 days arr of topuser session");}
               
                //top users in articles read
                con.query("SELECT DATE(t1.received_at) AS Date,t1.context_traits_first_name as firstname,t1.context_traits_last_name as lastname,t1.context_traits_email as mail,count(t1.document_title) as articles_read FROM " + config.mysql_database + ".view_document_sql t1 INNER JOIN " + config.mysql_database + ".users_sql t2 ON t1.user_id = t2.context_traits_user_id WHERE t1.context_traits_company_id = ? AND DATE(t1.received_at)>? and DATE(t1.received_at)<=? GROUP BY t1.user_id order by articles_read DESC LIMIT 10",[metrics.companyId,start_date,end_date], function (err, readresults, fields) 
                {
                  if (err) {
                    console.log("Error occurred during Top Users by articles read capture: " + err);
                    /*resolve("Error Occurred during App Install " + duration + " capture! ");*/
                  }
                  else
                  {         
                    var topUsersReadArr = [];
                    for(var key in readresults) 
                    {
                      var row = readresults[key];
                      var obj = {first:row.firstname,last:row.lastname,email:row.mail,count:row.articles_read};
                      topUsersReadArr.push(obj);
                    }
                    
                    if (duration == "7days") {topUsersRead7daysArr = topUsersReadArr; console.log("set 7 days arr of topuser read");}
                    if (duration == "30days"){topUsersRead30daysArr = topUsersReadArr; console.log("set 30 days arr of topuser read");}
                    console.log("done with getting data from db, going to resolve arr top users read");

                    //top users by comments
                    con.query("SELECT t1.context_traits_first_name as firstname,t1.context_traits_last_name as lastname,t1.context_traits_email as mail,count(t1.document_title) as Count_of_comments FROM " + config.mysql_database + ".comment_on_document_sql t1 INNER JOIN " + config.mysql_database + ".users_sql t2 ON t1.user_id = t2.context_traits_user_id WHERE t1.context_traits_company_id = ? AND DATE(t1.received_at)>? and DATE(t1.received_at)<=? GROUP BY t1.user_id order by Count_of_comments DESC LIMIT 10",[metrics.companyId,start_date,end_date], function (err, commResults, fields) 
                    {
                      if (err) {
                        console.log("Error occurred during Top Users by comments capture: " + err);
                        /*resolve("Error Occurred during App Install " + duration + " capture! ");*/
                      }
                      else
                      {         
                        var topUsersCommArr = [];
                        for(var key in commResults) 
                        {
                          var row = commResults[key];
                          var obj = {first:row.firstname,last:row.lastname,email:row.mail,count:row.Count_of_comments};
                          topUsersCommArr.push(obj);
                        }
                        
                        if (duration == "7days") {topUsersComm7daysArr = topUsersCommArr; console.log("set 7 days arr of topuser comments");}
                        if (duration == "30days"){topUsersComm30daysArr = topUsersCommArr; console.log("set 30 days arr of topuser comments");}
                        console.log("done with getting data from db, going to resolve arr top users comment");

                        // top users by shares
                        con.query("SELECT t1.context_traits_first_name as firstname,t1.context_traits_last_name as lastname,t1.context_traits_email as mail,count(t1.document_title) as Count_of_documents_shared FROM " + config.mysql_database + ".share_document_sql t1 INNER JOIN " + config.mysql_database + ".users_sql t2 ON t1.user_id = t2.context_traits_user_id WHERE t1.context_traits_company_id = ? AND DATE(t1.received_at)>? and DATE(t1.received_at)<=? GROUP BY t1.user_id order by Count_of_documents_shared DESC LIMIT 10",[metrics.companyId,start_date,end_date], function (err, results, fields) 
                        {
                          if (err) {
                            console.log("Error occurred during Top Users by shares capture: " + err);
                            /*resolve("Error Occurred during App Install " + duration + " capture! ");*/
                          }
                          else
                          {         
                            var topUsersShareArr = [];
                            for(var key in results) 
                            {
                              var row = results[key];
                              var obj = {first:row.firstname,last:row.lastname,email:row.mail,count:row.Count_of_documents_shared};
                              topUsersShareArr.push(obj);
                            }
                            
                            if (duration == "7days") {topUsersShare7daysArr = topUsersShareArr; console.log("set 7 days arr of topuser shares");}
                            if (duration == "30days"){topUsersShare30daysArr = topUsersShareArr; console.log("set 30 days arr of topuser shares");}
                            console.log("done with getting data from db, going to resolve arr top users shares");
                            console.log("printing all top users arrays");
                            console.log(topUsers7daysArr);
                            console.log(topUsersRead7daysArr);
                            console.log(topUsersComm7daysArr);
                            console.log(topUsersShare7daysArr);
                            resolve("Top Users" + duration + " Data Collected! ");

                            
                          }  
                        });

                      }  
                    });

                  }  
                });
                
              }  
            });

          });
          
        });
      } 
      else 
      {
        resolve("Top Users Metric Not Requested! ");
      }
    });
  },
  closeConnection: function() {
    console.log("inside closeConnection");
    return new Promise(function(resolve, reject) 
    {
      con.end();
      resolve("Connection Closed");
    });
  },
  generateExcel: function(template, metrics, dirName) {
      return new Promise(function(resolve, reject) {
        var sheetNumber_app7days = 1;
        var sheetNumber_app30days = 2;
        var sheetNumber_activeusers7days = 4;
        var sheetNumber_activeusers30days = 5;
        var sheetNumber_session7days = 7;
        var sheetNumber_session30days = 8;

        console.log("inside template_call1");
        //console.log(appinstalls7daysArr);
        if(metrics.appInstalls7 == true)
        {
          var value_of_appinstalls7days;
          console.log("inside metrics app Installs");
          if (typeof appinstalls7daysArr != 'undefined') {
            console.log("inside appInstalls7");
            value_of_appinstalls7days = {appinstalls7:appinstalls7daysArr,
                          appinstalls7Date: [{daterange: metrics.week_back_date+" - "+metrics.end_date}]
                          };
            console.log("value_of_appinstalls7days");
            console.log(value_of_appinstalls7days);
            template.substitute("App Installs - 7 Days",value_of_appinstalls7days);
          }
        }
        if(metrics.appInstalls30 == true){
          console.log("inside template_call2");
          var value_of_appinstalls30days;
          if (typeof appinstalls30daysArr != 'undefined') {
            value_of_appinstalls30days = {appinstalls30:appinstalls30daysArr,
                            appinstalls30Date: [{daterange: metrics.month_back_date+" - "+metrics.end_date}]
                           };
            template.substitute("App Installs - 30 Days",value_of_appinstalls30days);
          }
        }
       
          console.log("inside template_call3");
          //activeUsers
          var value_of_activeusers7days;
          if(metrics.activeUsers7 == true)
          {
            console.log("inside metrics active users");
            if (typeof activeUsers7daysArr != 'undefined') {
              console.log("inside active users 7 days");
              value_of_activeusers7days = {activeusers7:activeUsers7daysArr,
                            activeusers7Date: [{daterange: metrics.week_back_date+" - "+metrics.end_date}]
                            };
              template.substitute("Active Users - 7 Days",value_of_activeusers7days);
            }
            console.log("inside template_call active users");
          }
        
        if(metrics.activeUsers30 == true)
        {
          var value_of_activeusers30days;
          if (typeof activeUsers30daysArr != 'undefined') {
            console.log("inside active users 30 days");
            value_of_activeusers30days = {activeusers30:activeUsers30daysArr,
                            activeusers30Date: [{daterange: metrics.month_back_date+" - "+metrics.end_date}]
                          };  
            template.substitute("Active Users - 30 Days",value_of_activeusers30days);
            console.log("inside template_call active users30");
          }
        }
        
        console.log("inside template_call app session");
        
        //values for app session
        if(metrics.appSessions7 == true)
        {
          var value_of_appsession7days;
          console.log("inside metrics appSessions");
          if (typeof appsession7daysArr != 'undefined' && typeof appsession7daysArrAvg != 'undefined') {
            console.log("inside appSessions 7 days");
            value_of_appsession7days = {sessions7:appsession7daysArr,
                          sessionsavg7:appsession7daysArrAvg,
                          sessions7Date: [{daterange: metrics.week_back_date+" - "+metrics.end_date}]
                          };
            console.log(appsession7daysArr);
            console.log(value_of_appsession7days);
            template.substitute("App Sessions - 7 Days",value_of_appsession7days);
          }
          console.log("inside template_call app session");
        }
        
        if(metrics.appSessions30 == true)
        {
          var value_of_appsession30days;
          console.log("inside metrics appSessions30 days");
          if (typeof appsession30daysArr != 'undefined' && typeof appsession30daysArrAvg != 'undefined') {
            console.log("inside appSessions 30 days");
            value_of_appsession30days = {sessions30:appsession30daysArr,
                          sessionsavg30:appsession30daysArrAvg,
                          sessions30Date: [{daterange: metrics.month_back_date+" - "+metrics.end_date}]
                          }; 
            template.substitute("App Sessions - 30 Days",value_of_appsession30days);
            console.log("inside template_call app session30");
          }
        }

        //values for docs read
        if(metrics.docsRead7 == true)
        {
          var value_of_docsRead7days;
          console.log("inside metrics docsRead");
          if (typeof docsRead7daysArr != 'undefined' && typeof docsRead7daysArrAvg != 'undefined') {
            console.log("inside docsread 7 days");
            console.log(docsRead7daysArr);
            value_of_docsRead7days = {docsread7:docsRead7daysArr,
                         docsreadavg7:docsRead7daysArrAvg,
                                docsread7Date: [{daterange: metrics.week_back_date+" - "+metrics.end_date}]
                        };
            console.log(value_of_docsRead7days);
            template.substitute("Articles Read - 7 Days",value_of_docsRead7days);
          }
          console.log("inside template_call docsread");
        }
        
        if(metrics.docsRead30 == true)
        {
          var value_of_docsRead30days;
          console.log("inside metrics docsread30 days");
          if (typeof docsRead30daysArr != 'undefined' && typeof docsRead30daysArrAvg != 'undefined') {
            console.log("inside adocsread 30 days");
            value_of_docsRead30days = {docsread30:docsRead30daysArr,
                         docsreadavg30:docsRead30daysArrAvg,
                         docsread30Date: [{daterange: metrics.month_back_date+" - "+metrics.end_date}]
                        };  
            template.substitute("Articles Read - 30 Days",value_of_docsRead30days);
            console.log("inside template_call docsread 30");
          }
        }
          //values for doc shared
         if(metrics.shares7 == true)
        {
          var value_of_docsShared7days;
          console.log("inside metrics docsShared");
          if (typeof docsShared7daysArr != 'undefined' && typeof docsShared7daysArrAvg != 'undefined') {
            console.log("inside shared 7 days");
            value_of_docsShared7days = {shares7:docsShared7daysArr,
                          sharesavg7:docsShared7daysArrAvg,
                          shares7Date: [{daterange: metrics.week_back_date+" - "+metrics.end_date}]
                         };
            template.substitute("Shares - 7 Days",value_of_docsShared7days);
          }
          console.log("inside template_call shared");
        }
        
        if(metrics.shares30 == true)
        {
          var value_of_docsShared30days;
          console.log("inside metrics shared 30 days");
          if (typeof docsShared30daysArr != 'undefined' && typeof docsShared30daysArrAvg != 'undefined') {
            console.log("inside shared 30 days");
            value_of_docsShared30days = {shares30:docsShared30daysArr,
                           sharesavg30:docsShared30daysArrAvg,
                           shares30Date: [{daterange: metrics.month_back_date+" - "+metrics.end_date}]
                          };  
            template.substitute("Shares - 30 Days",value_of_docsShared30days);
            console.log("inside template_call shared 30");
          }
        }
        
         //values for comments
         if(metrics.comments7 == true)
        {
          var value_of_comments7days;
          console.log("inside metrics comments");
          if (typeof comments7daysArr != 'undefined' && typeof comments7daysArrAvg != 'undefined') {
            console.log("inside comments 7 days");
            value_of_comments7days = {comments7:comments7daysArr,
                          commentsavg7:comments7daysArrAvg,
                          comments7Date: [{daterange: metrics.week_back_date+" - "+metrics.end_date}]
                          };
            template.substitute("Comments - 7 Days",value_of_comments7days);
          }
          console.log("inside template_call comments7");
        }
        
        if(metrics.comments30 == true)
        {
          var value_of_comments30days;
          console.log("inside metrics comments 30 days");
          if (typeof comments30daysArr != 'undefined' && typeof comments30daysArrAvg != 'undefined') {
            console.log("inside comments 30 days");
            value_of_comments30days = {comments30:comments30daysArr,
                          commentsavg30:comments30daysArrAvg,
                          comments30Date: [{daterange: metrics.month_back_date+" - "+metrics.end_date}]
                        }; 
            template.substitute("Comments - 30 Days",value_of_comments30days);
            console.log("inside template_call comments 30");
          }
        }

         //values for doc saved
         if(metrics.saves7 == true)
        {
          var value_of_docsSaved7days;
          console.log("inside metrics docsSaved");
          if (typeof saved7daysArr != 'undefined' && typeof saved7daysArrAvg != 'undefined') {
            console.log("inside shaved 7 days");
            value_of_docsSaved7days = {saves7:saved7daysArr,
                          savesavg7:saved7daysArrAvg,
                          saves7Date: [{daterange: metrics.week_back_date+" - "+metrics.end_date}]
                          };
            template.substitute("Saves - 7 Days",value_of_docsSaved7days);
          }
          console.log("inside template_call saved");
        }
        
        if(metrics.saves30 == true)
        {
          var value_of_docsSaved30days;
          console.log("inside metrics saved 30 days");
          if (typeof saved30daysArr != 'undefined' && typeof saved30daysArrAvg != 'undefined') {
            console.log("inside saved 30 days");
            value_of_docsSaved30days = {saves30:saved30daysArr,
                          savesavg30:saved30daysArrAvg,
                          saves30Date:[{daterange:metrics.month_back_date+" - "+metrics.end_date}]
                          };  
            template.substitute("Saves - 30 Days",value_of_docsSaved30days);
            console.log("inside template_call saved 30");
          }
        }
         //values for top performing documents
         if(metrics.topDocs7 == true)
        {
          var value_of_topdocx;
          console.log("inside metrics top peforming documents");
          if (typeof topDocs7daysArr != 'undefined') {
            console.log("inside top documents 7 days");
            value_of_topdocx = {topdocs7:topDocs7daysArr,
                      topdocs7Date:[{daterange:metrics.week_back_date+" - "+metrics.end_date}]
                      };
            template.substitute("Top Documents - 7 Days",value_of_topdocx);
          }
          console.log("inside template_call top documents");
        }

        if(metrics.topDocs30 == true)
        {
          var value_of_topdocx30;
          console.log("inside metrics top peforming documents 30");
          if (typeof topDocs30daysArr != 'undefined') {
            console.log("inside top documents 30 days");
            console.log(topDocs30daysArr);
            value_of_topdocx30 = {topdocs30:topDocs30daysArr,
                                  topdocs30Date:[{daterange:metrics.month_back_date+" - "+metrics.end_date}]
                        };
            template.substitute("Top Documents - 30 Days",value_of_topdocx30);
          }
          console.log("inside template_call top documents 30");
        }
        
        //values for top users
         if(metrics.topUsers7 == true)
        {
          var value_of_topusersSession7days;
          console.log("inside metrics topusers");
          /*console.log(topUsers7daysArr);
          console.log(topUsersRead7daysArr);
          console.log(topUsersComm7daysArr);
          console.log(topUsersShare7daysArr);*/
          if (typeof topUsers7daysArr != 'undefined' && typeof topUsersRead7daysArr != 'undefined' && typeof topUsersComm7daysArr != 'undefined' && typeof topUsersShare7daysArr != 'undefined') {
            console.log("inside top users session 7 days");
           /* console.log(topUsers7daysArr);*/
            value_of_topusersSession7days = {topuser7:topUsers7daysArr,
                            topuser7read:topUsersRead7daysArr,
                            topuserComm7:topUsersComm7daysArr,
                            topuserShare7:topUsersShare7daysArr,
                            topuser7Date:[{daterange:metrics.week_back_date+" - "+metrics.end_date}]
                            };
            console.log("top users session 7 days");
            console.log(value_of_topusersSession7days);
            template.substitute("Top Users - 7 Days",value_of_topusersSession7days);
            console.log("inside template_call top users");
          }    
        }
        
        if(metrics.topUsers30 == true)
        {
          var value_of_topusersSession30days;
          console.log("inside metrics topusers");
          if (typeof topUsers30daysArr != 'undefined' && typeof topUsersRead30daysArr != 'undefined' && typeof topUsersComm30daysArr != 'undefined' && typeof topUsersShare30daysArr != 'undefined') {
            console.log("inside top users session 30 days");
            console.log(topUsers30daysArr);
            value_of_topusersSession30days = {topuser30:topUsers30daysArr,
                              topuser30read:topUsersRead30daysArr,
                              topuserComm30:topUsersComm30daysArr,
                              topuserShare30:topUsersShare30daysArr,
                              topuser30Date:[{daterange:metrics.month_back_date+" - "+metrics.end_date}]
                              };
            console.log("top users session 30 days");
            template.substitute("Top Users - 30 Days",value_of_topusersSession30days);
            console.log("inside template_call top users");
          }
        }

        console.log('excel data');
        // template.deleteSheet(sheetNumber_app7days);
        var newData = template.generate();

        //get the user id from the user's email from the req param
        var userid = metrics.userId;
        //create a folder with this userid as the name if not already there
        var dir = './public/reports/' + userid;
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        //get the company name from the req param
        var companyName = metrics.companyName;
        //the output file name can be based on the timestamp
        //var outputFileName = "" + config.mysql_database + "UsageStats-" + companyName + "-" + Date.now();
        console.log(new Date().getTime);
        var outputFileName = "EmpAppUsageStats-" + companyName + "-" + new Date().getTime();
        //fs.writeFileSync('all-multiple-sheets-output.xlsx', newData, 'binary');
        console.log("have dirName: " + dirName);
        fs.writeFileSync(path.join(dirName.substring(0, dirName.indexOf('routes')), '/public/reports/'+userid, outputFileName + '.xlsx'), newData, 'binary');

        //fs.writeFileSync('EmployeeAppReport_MeltwaterInternal.xlsx', newData, 'binary');
        resolve("Done with template");
      });      
    }
};





