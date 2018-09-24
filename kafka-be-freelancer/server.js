var connection =  new require('./kafka/Connection');
var all_freelancer_api = require('./services/all_freelancer_api');

var topic_name = 'request_topic';
var consumer = connection.getConsumer(topic_name);
var producer = connection.getProducer();

console.log('server is running');
consumer.on('message', function (message) {
    console.log('message received',message);
    console.log('message  reply to',message.value);
    var parsedMsg = JSON.parse(message.value);
    console.log('message  reply to',parsedMsg);
    console.log('message  reply to',parsedMsg.replyTo);
    console.log('message  reply to',parsedMsg.correlationId);
    console.log('message  reply to',parsedMsg.data.value);
    all_freelancer_api.handle_request(parsedMsg.data, function(err,res){
        console.log('after handle',res);
        var payloads = [
            { topic: parsedMsg.replyTo,
                messages:JSON.stringify({
                    correlationId:parsedMsg.correlationId,
                    data : res
                }),
                partition : 0
            }
        ];
        producer.send(payloads, function(err, data){
            console.log("Inside Producer");
            console.log(payloads);
        });
        return;
    });
});