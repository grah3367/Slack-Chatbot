var Botkit = require('./node_modules/botkit/lib/Botkit.js');
var mongoose = require('mongoose');
var request = require('request');
//express instance
var express = require('express');
var app = express();
var router = express.Router();
//router.use(bodyParser.urlencoded({ extended: true }));
// database connect string hosted on mLab.
mongoose.connect('mongodb://curse:cursepass@ds157539.mlab.com:57539/curse');

var bodyParser = require('body-parser');

//create schemea for cursing counting
var UserSchema = new mongoose.Schema({
    name: String,
    count: Number
});
//compile the model from the schema
var userModel = mongoose.model('User', UserSchema);


// REST API STUFF
// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
app.get('/', function (req, res) {
  res.send('Hello World!')
})


function get_joke_response(){
  var responses = [
    'How do you comfort a JavaScript bug? You console it.',
    'Why was the JavaScript developer sad? a. Because he didn’t Node how to Express himself',
    'To understand recursion, you must first understand recursion.',
    'There are no bugs only unintended features.',
    'algorithm, the word used by programmers when they do not want to explain what they did.',
    '#titanic {float:none;}',
    'You want to hear a javascript joke? I will call back later.'
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

var controller = Botkit.slackbot({
  debug: false
});

// Ive embedded the token here however this isnt recommended 
// should be using a enviroment variable but this is easier for this project. 
// forgive me.
var bot = controller.spawn({
  token: "xoxb-169544886199-vUOO1ZKoHBe48RseIMOovFgq"
}).startRTM();

controller.hears(['tell me a code joke'], 'direct_message,direct_mention,mention', function(bot, message) {
  bot.reply(message, get_joke_response());
});

controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {
  bot.reply(message, "Hello.");
});

controller.on('bot_channel_join', function(bot, message) {
  bot.reply(message, 'Yay, I have arrived!');
});

controller.hears(['lunch'],'ambient',function(bot,message) {


  bot.reply(message,"lets eat!");

});


controller.hears(['!randkitty'],'ambient',function(bot,message) {
  var link = "http://random.cat/view?i=" + getRandomInt(0,1283);

  bot.reply(message,link);


  function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

});


controller.hears(['dang', 'darn', 'damn', 'trump', 'js sucks', 'dumb', 'power down'],'ambient',function(bot,message) {

  var userID = message.user;
  var user = "<@"+userID+">";
  var reply = "";
  var count = 0;

  //find the user
  // find each person with a last name matching 'Ghost', selecting the `name` and `occupation` fields
    var theUser = userModel.findOne({ 'name': message.user }, 'name, count', function (err, usr) {
      if (err) return handleError(err);

      console.log("usr obj: " +usr);
      console.log(usr.count);

      if(usr == null){

        // we need to create the user.
        var user = new userModel({ name: message.user, count: 5 });

        //save the newly created user.
        user.save(function (err, user){
          if(err) return console.err(err);
          console.log("created user " + user.name);
        });

      } else {
        //the user exists  
       console.log("The user already exists");
       //console.log("Current count: " + usr.count);
      userModel.findOneAndUpdate({ name: message.user } , { $set: { count: usr.count+1 } }, { new: true }, function(err, doc) {
      });
      var count = usr.count++;
      bot.reply(message, "You have cursed " + count + " times!")


      }
  });

  reply  = user + " Please dont say those things.";
  bot.reply(message,reply);

});

controller.hears('free codecamp',['ambient', 'direct_message','direct_mention','mention'],function(bot,message) {
  
      //https://www.googleapis.com/youtube/v3/search?key=AIzaSyA3alE-PSKxJTxKeoUXrGjpw6WWc3_wfz4&channelId=UC8butISFwT-Wl7EV0hUK0BQ&part=snippet,id&order=date&maxResults=

  request.get('https://www.googleapis.com/youtube/v3/search?key=AIzaSyA3alE-PSKxJTxKeoUXrGjpw6WWc3_wfz4&channelId=UC8butISFwT-Wl7EV0hUK0BQ&part=snippet,id&order=date&maxResults=1', function(err, header, body) {
  if (err) throw err
  var data = JSON.parse(body);
  console.log(data.items[0].id.videoId);
  bot.reply(message, "http://www.youtube.com/watch?v="+data.items[0].id.videoId);

});
  
  //bot.reply(message, );


});

// Start the express server so that we can use the API
var port = process.env.PORT || 3000;

var server = app.listen(port, function() {
    console.log('Express server listening on port ' + port);
});


