const crypto = require('crypto');
const MongoClient = require('mongodb').MongoClient

function ProvableSystem(){
  this.serverInfo = this.generateServerInfo();
  this.gameID;
  this.getGameID((err, gameID)=>{
    if(err) throw err;
    this.gameID = Number(gameID);
  });
  this.gameInfo = {};
}

ProvableSystem.prototype.generateServerInfo = function(){
  const serverSeed = crypto.randomBytes(32).toString('hex');
  const hashedServerSeed = crypto.createHash('sha256').update(serverSeed).digest('hex')
  const publicSeed = Math.floor(Math.random() * 100000000);
  MongoClient.connect('mongodb://localhost:27017/', { useUnifiedTopology: true }, function(err, db) {
	  if (err) return callback(err)
	  var dbo = db.db('provably_fair')
	  var myobj = {
     serverSeed: serverSeed,
     hashedServerSeed: hashedServerSeed,
     publicSeed: publicSeed,
  	 created_at: new Date().toUTCString(),
     timestamp: Date.now()
	  }
	  dbo.collection('server_info').insertOne(myobj, function(err, res) {
	    db.close()
	    if (err) throw err
	  })
	})
  return { serverSeed: serverSeed, hashedServerSeed: hashedServerSeed, publicSeed: publicSeed };
}

ProvableSystem.prototype.getGameID = function(callback){
  MongoClient.connect("mongodb://localhost:27017/", { useUnifiedTopology: true }, function(err, db) {
    if (err) return callback(err)
    var dbo = db.db('provably_fair')
    dbo.collection('game_info').countDocuments({}, function(err, res) {
      db.close()
      if (err) return callback(err, null);
      return callback(null, res);
    })
  })
}

ProvableSystem.prototype.generateGameSeed = function(serverSeed, publicSeed, gameID){
  const gameSeed = crypto.createHash('sha256').update(`${serverSeed}_${publicSeed}_${gameID}`).digest('hex');

  return gameSeed;
}

ProvableSystem.prototype.generateGameResults = function(gameSeed){
  const result = parseInt(gameSeed.substr(0, 8), 16) % 10000

  return result;
}

ProvableSystem.prototype.insertGame = async function(callback){
  this.gameInfo.gameSeed = await this.generateGameSeed(this.serverInfo.serverSeed, this.serverInfo.publicSeed, this.gameID);
  this.gameInfo.result = await this.generateGameResults(this.gameInfo.gameSeed);
  var serverInfo = this.serverInfo;
  var gameInfo = this.gameInfo;
  var gameID = this.gameID;
  MongoClient.connect("mongodb://localhost:27017/", { useUnifiedTopology: true }, function(err, db) {
    if (err) return callback(err)
    var dbo = db.db('provably_fair')
    dbo.collection('game_history').insertOne({"gameID": gameID, "result": gameInfo.result}, function(err, res) { db.close() })
  })
  MongoClient.connect("mongodb://localhost:27017/", { useUnifiedTopology: true }, function(err, db) {
    if (err) return callback(err)
    var dbo = db.db('provably_fair')
    var myobj = {
      gameID: gameID,
      hashedServerSeed: serverInfo.hashedServerSeed,
      serverSeed: serverInfo.serverSeed,
      publicSeed: serverInfo.publicSeed,
      gameSeed: gameInfo.gameSeed,
      result: gameInfo.result,
      created_at: new Date().toUTCString(),
      timestamp: Date.now()
    }
    dbo.collection('game_info').insertOne(myobj, function(err, res) {
      db.close()
      if (err) return callback(err)

      return callback(null, res.ops[0])
    })
  })
  this.gameID = this.gameID + 1;
}

ProvableSystem.prototype.updateServerInfo = function(callback){
  var oldServerInfo = this.serverInfo;
  MongoClient.connect('mongodb://localhost:27017/', { useUnifiedTopology: true }, function(err, db) {
	  if (err) return callback(err)
	  var dbo = db.db('provably_fair')
	  var myobj = {
     serverSeed: oldServerInfo.serverSeed,
     hashedServerSeed: oldServerInfo.hashedServerSeed,
     publicSeed: oldServerInfo.publicSeed,
  	 created_at: new Date().toUTCString(),
     timestamp: Date.now()
	  }
	  dbo.collection('server_info').insertOne(myobj, function(err, res) {
	    db.close()
	    if (err) throw err
	  })
	})
  this.serverInfo = this.generateServerInfo();
  return callback(null, oldServerInfo);
}

ProvableSystem.prototype.getGameHistory = function(callback){
  MongoClient.connect('mongodb://localhost:27017/', { useUnifiedTopology: true }, function(err, db) {
	  if (err) return callback(err)
	  var dbo = db.db('provably_fair')
	  dbo.collection('game_history').find().sort({gameID:-1}).limit(15).toArray(function(err, res){
      db.close()
	    if (err) return callback(err)
      return callback(null, res)
    })
	})
}

module.exports = ProvableSystem;
