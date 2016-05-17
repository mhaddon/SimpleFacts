<?php

namespace MessangerServer;

use Ratchet\ConnectionInterface;
use Ratchet\Wamp\WampServerInterface;

date_default_timezone_set('UTC');

class Pusher implements WampServerInterface {

    protected $clients;
    protected $Topics;

    /**
     * When the server is started
     */
    public function __construct() {
        $this->clients = array();
        echo "\r\nServer listening and waiting.\r\n";
    }

    public function onUnSubscribe(ConnectionInterface $conn, $topic) {
        echo 'test';
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients[$conn->resourceId] = $conn;

        echo "\r\nNew Client Connected ({$conn->resourceId}) (" . count($this->clients) . " total)\r\n";
    }

    public function onClose(ConnectionInterface $conn) {
        unset($this->clients[$conn->resourceId]);

        echo "\r\nClient Terminated (" . count($this->clients) . " total)\r\n";

        if (isset($this->Topics["System"])) {
            $this->Topics["System"]->broadcast((object) array(
                        'name' => '',
                        'Type' => 'nameChange',
                        'ID' => $conn->resourceId
            ));
        }
    }

    public function onCall(ConnectionInterface $conn, $id, $topic, array $params) {
        // In this application if clients send data it's because the user hacked around in console
        $conn->callError($id, $topic, 'You are not allowed to make calls')->close();
    }

    public function onPublish(ConnectionInterface $conn, $topic, $event, array $exclude, array $eligible) {
        if ($topic->getId() === 'System') {
            if ((isset($event['name'])) && (strlen($event['name']) > 2)) {
                $event['ID'] = $conn->resourceId;
                $event['Type'] = 'nameChange';
                $topic->broadcast((object) array(
                            'ID' => $conn->resourceId,
                            'Type' => 'nameChange',
                            'name' => htmlspecialchars($event['name'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8', false)
                ));
            }
        } else if (strtolower($topic->getId()) === $topic->getId()) {
            $this->parseData($topic, (object) array(
                        'time' => date("H:i:s"),
                        'datetime' => date("Y-m-d H:i:s"),
                        'ms' => microtime(true),
                        'name' => htmlspecialchars($event['name'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8', false),
                        'msg' => htmlspecialchars($event['msg'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8', false)
                    ), $conn);
        }
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: " . $e->getMessage();
        $conn->close();
    }

    public function onSubscribe(ConnectionInterface $conn, $Topic) {
        $this->Topics[$Topic->getId()] = $Topic;
        echo $conn->resourceId . ' subcribed: ' . $Topic . "\r\n";
    }

    /**
     * @param string JSON'ified string we'll receive from ZeroMQ
     */
    public function parseData($topic, $data, $conn = null) {
        $topic->broadcast($data);


        $context = new \ZMQContext();
        $socket = $context->getSocket(\ZMQ::SOCKET_PUSH, 'my pusher');
        $socket->connect("tcp://localhost:5555");

        $data->topic = $topic->getId();

        /**
         * This is some very hacky code which needs to be replaced ASAP i know
         * what i am meant to do.
         * 
         * To retrieve the remote IP of the client you need to do:
         * $conn->remoteAddress
         * However, because we are behind a proxy, we instead need to do:
         * $conn->WebSocket->request->getHeader('X-Forwarded-For')
         * However, this returns an object, not a string, i cannot use this
         * object apparently, and all of its fields are protected.
         * 
         * To read the field with the IP we either need to convert it to a string
         * and scan for IPs with regex, or we do what i did below.
         * 
         * 1. We retrieve the object
         * 2. We convert it into an array, but the array fields cannot be referenced by name
         * 3. EXCEPT, if we loop over all the fields, we can read them
         * 4. We find the correct field and take the value in it, thats the IP
         * 
         * There must be a better way, but i must be too dumb to figure it out.
         */
        $forwarded = (array) $conn->WebSocket->request->getHeader('X-Forwarded-For');
        $IP = '';
        foreach ($forwarded as &$value) {
            if (gettype($value) === 'array') {
                $IP = $value[0];
                break;
            }
        }

        $data->ip = $IP;


        $socket->send(json_encode($data));
    }

    public function saveData($JSONdata) {
        $data = json_decode($JSONdata);

        require __DIR__ . '/connect.php';

        $stmt = $PDODB->prepare("
                        INSERT INTO 
                            `Messages` 
                            (Name, IP, Content, DateTime, ms, Topic) 
                        VALUES 
                            (:Name, :IP, :Content, :DateTime, :ms, :Topic)");

        $stmt->bindValue(":Name", $data->name, \PDO::PARAM_STR);
        $stmt->bindValue(":Topic", $data->topic, \PDO::PARAM_STR);
        $stmt->bindValue(":IP", $data->ip, \PDO::PARAM_STR);
        $stmt->bindValue(":Content", $data->msg, \PDO::PARAM_STR);
        $stmt->bindValue(":DateTime", $data->datetime, \PDO::PARAM_STR);
        $stmt->bindValue(":ms", $data->ms, \PDO::PARAM_INT);
        $stmt->execute();
        //$stmt->close();

        echo "\r\nmessage saved to database\r\n";
    }

}
