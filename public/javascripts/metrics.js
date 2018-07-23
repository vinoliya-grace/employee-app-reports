//variable that will tell at any point which metrics are required/not required
var metrics = {};

var newMetricsObject = function() {

  this.metrics = {
    appInstalls: false,
    appInstalls7: false,
    appInstalls30: false,
    appInstalls6: false,
    activeUsers: false,
    activeUsers7: false,
    activeUsers30: false,
    activeUsers6: false,
    appSessions: false,
    appSessions7: false,
    appSessions30: false,
    appSessions6: false,
    docsRead: false,
    docsRead7: false,
    docsRead30: false,
    docsRead6: false,
    shares: false,
    shares7: false,
    shares30: false,
    shares6: false,
    comments: false,
    comments7: false,
    comments30: false,
    comments6: false,
    saves: false,
    saves7: false,
    saves30: false,
    saves6: false,
    topDocs: false,
    topDocs7: false,
    topDocs30: false,
    topDocs6: false,
    topUsers: false,
    topUsers7: false,
    topUsers30: false,
    topUsers6: false,
    end_date: '',
    week_back_date: '',
    month_back_date: '',
    userId:'',
    companyId:'',
    companyName: ''
  }
  return this.metrics;
}

module.exports = {
  metrics: metrics,
  newMetricsObject: function() {
    var metricsObj = newMetricsObject();
    return metricsObj;
  }
};