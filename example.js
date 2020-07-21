const crypto = require('crypto');
var cron = require('node-cron');
const ProvableSystem = require('./main.js');
const Fair = new ProvableSystem();
const MongoClient = require('mongodb').MongoClient

var regenServerInfo = cron.schedule('0 0 0 * * *', function(){
  Fair.updateServerInfo(function(err, res){
    if(err) throw err;
    if(res){
      console.log('New server info Generated')
      console.log(res)
    }
  })
});

var generateGames = cron.schedule('*/30 * * * * *', function(){
Fair.insertGame(function(err, res){
    if(err) throw err;
    if(res){
      console.log('New game Generated')
      console.log(res);
    }
  })
});
