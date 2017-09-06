const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

// connect to mongodb
mongo.connect('mongodb://127.0.0.1/mogochat',function(err,db){
    if(err){
        throw err
    }


    

    console.log("mongo connected");

    // connect to socket io

    client.on('connection',function(socket){
        let chat = db.collection('chats');

        // create fujnction to send status
        sendStatus = function(s){
            socket.emit('status',s);
        }

        // get chats from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err,result){
             if(err){
                 throw err;
             }
             socket.emit('output',result);
        })

        // handle input events
        socket.on('input',function(data){
            let name = data.name;
            let message = data.message;

            // check for name and message
            if(name == "" || message == ""){
                sendStatus('please enter name and message')
            }else{
                chat.insert({name:name,message:message},function(){
                    client.emit('output',[data]);

                    sendStatus({
                        message : 'Message send',
                        clear : true
                    })
                })
            }
        });


        // handle clear
        socket.on('clear',function(data){
            // remove all chats from 
            chat.remove({},function(){
                socket.emit('cleared');
            })
        })
    })
})