var express = require('express');
var router = express.Router();

var utils = require("../public/javascripts/utils.js");
var config = require("../public/config/config.js");
var metricsObj = require("../public/javascripts/metrics.js");

var XlsxTemplate = require('xlsx-template'),
fs = require('fs'),
path = require('path');
var Q = require("q");
var Promise = require("promise");


//COMPANY RELATED ROUTES

router.get('/getCompanies', function (req, res) {
  utils.getAllCompanies()
    .then(function(result) {
      console.log("got all companies");
      res.send(result);
    });
});

router.get('/addNewCompany', function (req, res) {
  utils.addNewCompany(req.query.company_id, req.query.company_name)
    .then(function(result) {
      console.log("added new company");
      res.send(result);
    });
});

router.get('/deleteCompany', function (req, res) {
  utils.deleteCompany(req.query.company_name)
    .then(function(result) {
      console.log("deleted company");
      res.send(result);
    });
});


//ADMIN USER RELATED ROUTES

router.get('/getAllAdminUsers', function (req, res) {
  utils.getAllAdminUsers()
    .then(function(result) {
      console.log("got all admin users");
      res.send(result);
    });
});

router.get('/checkIfAdminUser', function (req, res) {
  var userId = req.query.userId;
  console.log("in /checkIfAdminUser, have userId = " + userId);
  utils.checkIfAdminUser(userId)
    .then(function(result) {
      res.send(result);
    }) ;

});

router.get('/addAdminUser', function (req, res) {
  utils.addAdminUser(req.query.email)
    .then(function(result) {
      console.log("added admin user");
      res.send(result);
    });
});

router.get('/deleteAdminUser', function (req, res) {
  utils.deleteAdminUser(req.query.email)
    .then(function(result) {
      console.log("deleted admin user");
      res.send(result);
    });
});

//REPORT RELATED ROUTES

router.get('/getUserReports', function (req, res) {
  var userId = req.query.userId
  console.log(userId);
  var dir = './public/reports/' + userId;
  if (!fs.existsSync(dir)){
      console.log('folder with that userid does not exist');
      res.send("No exports created");
  } else {
    console.log("folder with that userid exists");
    //now look for any generated reports
    fs.readdir(dir, function(err, files) {
      //console.log(files);
      if (files) {
        //sort the files to have the latest file on top
        //https://stackoverflow.com/questions/10559685/using-node-js-how-do-you-get-a-list-of-files-in-chronological-order
        files.sort(function(a, b) {
           //var dir1 = "/Users/anupamaphilip/Documents/InternalProjects/EmployeeAppReporting/fromteam/7Jul2018/EmpAppReport_new/public/reports/anupama.philip/";
           //var dir1 = __dirname.substring(0, __dirname.indexOf('/routes')) + '/public/reports/' + userId +"/";
           var dir1 = __dirname.substring(0, __dirname.indexOf('routes')) + '/public/reports/' + userId +"/";
           return fs.statSync(dir1 + b).mtime.getTime() - fs.statSync(dir1 + a).mtime.getTime();
       });
        var reports = [];
        for (var file in files) {
          console.log("inside for");
          //console.log(files[file]);
          if (files[file] != ".DS_Store") {
            var report = path.join(__dirname, '/public/reports/'+userId, files[file]);
            reports.push(report);
          }
        }
        console.log(reports);
        console.log(reports.length);
        if (reports.length <= 0) {
          console.log(reports);
          console.log("sending that no reports for user");
          res.send("no reports for user");
        } else {
          console.log("sending reports");
          console.log(reports);
          res.send(reports);
        }
      } else {
        console.log("inside else");
        res.send("No recent exports");
      }
    });
  }
});



router.get('/getAllReports', function (req, res) 
{ 
  var dir = './public/reports/'; 
  fs.readdir(dir, function read(err, data) 
  {
    if (err) {
      throw err;
      console.log("Error in getting the reports from all users");
      res.send("no reports for user");
    }
    else
    {
      content = data;
      console.log("reports from all the users");
      console.log(content); 
      if(content.length<=0)
      {
        console.log("no reports have been generated by any of the users");
        res.send("no reports for user");
      }
      else
      {
        console.log("reports by users");
        var reports = [];
        var report;
        for(var key=0; key<content.length;key++)
        {
          console.log("userId"); 
          console.log(content[key]);
          /*var userid = content[key];
          console.log(userid);*/
          loc = './public/reports/' + content[key];
          console.log("location of reports");
          /*console.log(loc);*/  

          fs.readdirSync(loc).forEach(files =>{   
            if (files) {
              /*console.log("printing files");
              console.log(files);*/
                if (files != ".DS_Store") {
                  report = path.join(__dirname, loc, files);
                  reports.push(report);
                  /*console.log(reports);*/
                }
            } else {
              console.log("inside else");
              res.send("No recent exports");
            }
          }); 
        }
        console.log(reports.length);
        if (reports.length <= 0) {
          /*console.log(reports);*/
          console.log("sending that no reports for user");
          res.send("no reports for user");
        } else {
          console.log("sending reports");
          /*console.log(reports);*/
          res.send(reports);
        } 
                
      }
    }
  });
});


//DB CONFIGURATION ROUTES
router.get('/getDBConfig',function(req,res)
{
  console.log("Desktop path");
  var loc = require('path').join(require('os').homedir(), 'Desktop');
 /* console.log(loc);*/
  fs.copyFile('./public/config/config.js', loc+'/emp-app-database-config.txt', (err) => {
  if (err) throw err;
    res.send("success in copying the config file to Desktop named emp-app-database-config.txt");   
  });
});

router.get('/UpdateDBConfig',function(req,res)
{
  var loc = require('path').join(require('os').homedir(), 'Desktop');
  fs.copyFile(loc+'/emp-app-database-config.txt', './public/config/config.js', (err) => {
  if (err) throw err;
    res.send("success in updating the config file"); 
  });
});


//REPORT GENERATION ROUTE

router.get('/generateReport', function (req, res) {
  var metrics = metricsObj.newMetricsObject();
  //set all the required metrics from the req query param
  utils.setAllRequiredMetrics(metrics, req.query);
  console.log(metrics);
  
  //delete all the unwanted sheets
  utils.deleteAllRequiredSheets(metrics, (template, err) => {
    if (err) 
    {
      console.log("Error occurred during call to deleteAllRequiredSheets:");
      console.log(err);
    } else {
      console.log("success after call to deleteAllRequiredSheets");

      //call each of the metric's setup methods
      utils.appInstallsSetup(metrics, "7days")
        .then(function(result) {
          console.log(result);
          return utils.appInstallsSetup(metrics, "30days");
        })
        .then(function(result) {
          console.log(result);
          return utils.activeUsersSetup(metrics, "7days");
        })
        .then(function(result) {
          console.log(result);
          return utils.activeUsersSetup(metrics, "30days");
        })
        .then(function(result) {
          console.log(result);
          return utils.appSessionsSetup(metrics, "7days");
        })
        .then(function(result) {
          console.log(result);
          return utils.appSessionsSetup(metrics, "30days");
        })
        .then(function(result) {
          console.log(result);
          return utils.docsReadSetup(metrics, "7days");
        })
        .then(function(result) {
          console.log(result);
          return utils.docsReadSetup(metrics, "30days");
        })
        .then(function(result) {
          console.log(result);
          return utils.sharesSetup(metrics, "7days");
        })
        .then(function(result) {
          console.log(result);
          return utils.sharesSetup(metrics, "30days");
        })
        .then(function(result) {
          console.log(result);
          return utils.commentsSetup(metrics, "7days");
        })
        .then(function(result) {
          console.log(result);
          return utils.commentsSetup(metrics, "30days");
        })
        .then(function(result) {
          console.log(result);
          return utils.savesSetup(metrics, "7days");
        })
        .then(function(result) {
          console.log(result);
          return utils.savesSetup(metrics, "30days");
        })
        .then(function(result) {
          console.log(result);
          console.log("done with saves, going to call topdocssetup")
          return utils.topDocsSetup(metrics, "7days");
        })
        .then(function(result) {
          console.log(result);
          return utils.topDocsSetup(metrics, "30days");
        })
        .then(function(result) {
          console.log(result);
          return utils.topUsersSetup(metrics, "7days");
        })
        .then(function(result) {
          console.log(result);
          return utils.topUsersSetup(metrics, "30days");
        })
        .then(function(result) {
          console.log(result);
          return utils.closeConnection();
        })
        .then(function(result) {
          console.log(result);
          return utils.generateExcel(template, metrics, __dirname);
        })
        .then(function(result) {
          console.log(result);
          res.send("success");
        });

    }
  });
  
});


router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;
