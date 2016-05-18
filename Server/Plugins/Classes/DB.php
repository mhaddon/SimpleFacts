<?php

class db {

    protected $conn;

    function __construct() {
        require __DIR__ . '/connect.php';
    }
    
    public function saveMessage($data) {
        $stmt = $PDODB->prepare("
                        CALL saveNewMessage(:Name, :IP, :Content, :DateTime, :ms, :Topic)
                        ");
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
    
    public function retrieveMessages($data) {
    
    }
}


?>
