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

var mysql = require('mysql');
var con = mysql.createConnection({
  host: config.mysql_host,
  user: config.mysql_user,
  password: config.mysql_password,
  database: config.mysql_database,
  charset : config.mysql_charset
});

con.connect();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

//COMPANY RELATED ROUTES

//get all companies
router.get('/getCompanies',function(req,res)
{
  con.connect(function(err) 
  {   
    console.log("Connected for companies");
    //if (err) throw err;
    console.log("Now the query to get companies");
    con.query("SELECT * from company_details", function (err, result, fields) 
    {
      if (err) throw err;

      var outputArr = [];
      for(var key in result) 
      {
          var row = result[key];
          console.log(row);
          var abc = { id : row.company_id, name : row.company_name};

          outputArr.push(abc);
      }
      res.send(outputArr);
    });
  });
});

router.get('/addNewCompany', function (req, res) {
   var company_id = req.query.company_id;
   var company_name = req.query.company_name;
  /*console.log("new user mail");
  console.log(email);*/
      var query = "Insert into "+config.mysql_database+".company_details(company_id,company_name)VALUES ('" + company_id + "', '" + company_name + "')"
      con.query(query);
      console.log("success in inserting");
      res.send("success");
});

router.get('/deleteCompany', function (req, res) {
  var name = req.query.company_name;
  console.log("delete company");
  console.log(name);
  
      var query = "DELETE FROM "+config.mysql_database+".company_details where company_name=?"
      con.query(query,[name]);
      console.log("success in deleting");
      res.send("success");
});

//ADMIN USER RELATED ROUTES

router.get('/checkIfAdminUser', function (req, res) {
  var userId = req.query.userId;
  console.log("in /checkIfAdminUser, have userId = " + userId);
  utils.checkIfAdminUser(userId)
    .then(function(result) {
      res.send(result);
    }) ;

});

router.get('/getAllAdminUsers', function (req, res) {
  utils.getAllAdminUsers()
    .then(function(result) {
      console.log("got all admin users");
      res.send(result);
    });
});

router.get('/addAdminUser', function (req, res) {
  var email = req.query.email;
  console.log("new user mail");
  console.log(email);
  
      var query = "Insert into "+config.mysql_database+".emp_app_admins(email)VALUES ('" + email + "')"
      con.query(query);
      console.log("success in inserting");
      res.send("success");
});

router.get('/deleteAdminUser', function (req, res) {
  var email = req.query.email;
  console.log("delete user name");
  console.log(email);
  
      var query = "DELETE FROM "+config.mysql_database+".emp_app_admins where email=?"
      con.query(query,[email]);
      console.log("success in deleting");
      res.send("success");
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

router.get('/getAllReports', function (req, res) {

});


//DB CONFIGURATION ROUTES

router.get('/getAllDBConfig', function (req, res) {

});

router.get('/updateDBConfig', function (req, res) {

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
