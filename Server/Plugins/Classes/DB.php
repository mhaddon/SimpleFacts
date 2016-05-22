<?php

namespace MessangerServer;

class db {

    /**
     * This is the connection information that PDO uses to store its connection
     * to the database
     * 
     * View /Server/MySQL.sql for the exact code used for the database.
     * 
     * @var object 
     */
    protected $conn;

    /**
     * We want to connect to the database. I do not want to have the connection
     * information in the repository though, so i have put it in its own file.
     * 
     * We connect using an account with very restricted permissions. We are only
     * allowed to run existing routines that have been stored on the server.
     * This should help nullify any security risks that can occur from injection.
     */
    function __construct() {
        $this->conn = (require __DIR__ . '/connect.php');
    }
    
    /**
     * When the class is terminated we want to ensure that the connection safely
     * closed too.
     */
    function __destruct() {
        $this->conn = null; //PDO apparently doesnt have a ->close() function.
    }
    
    /**
     * We save the message into the database.
     * We are using the PDO library with prepared statements.
     * The purpose is to try to stop anyone from being clever and breaking into
     * the database.
     * 
     * View /Server/MySQL.sql for the exact code used for the mysql routine and
     * database.
     * 
     * @param String $JSONdata - A JSON representation of the data we want to save
     */
    public function saveMessage($JSONdata) {
        $data = json_decode($JSONdata);
        
        /**
         * saveNewMessages is a routine that is stored on the server.
         * It saves the message into the database.
         * The purpose is to restrict the server from only running preaproved 
         * routines. Therefore limiting injection vulnerability.
         */
        $stmt = $this->conn->prepare("
                        CALL saveNewMessage(:Name, :IP, :Content, :DateTime, :ms, :Topic)
                        ");
        $stmt->bindValue(":Name", $data->name, \PDO::PARAM_STR);
        $stmt->bindValue(":Topic", $data->topic, \PDO::PARAM_STR);
        $stmt->bindValue(":IP", $data->ip, \PDO::PARAM_STR);
        $stmt->bindValue(":Content", $data->msg, \PDO::PARAM_STR);
        $stmt->bindValue(":DateTime", $data->datetime, \PDO::PARAM_STR);
        $stmt->bindValue(":ms", $data->ms, \PDO::PARAM_INT);
        $stmt->execute();
        
        echo "\r\nmessage saved to database\r\n";
    }
    
    /**
     * This method retrieves recent messages from the database according to a list
     * of topics you have inputted.
     * 
     * You pass the topic names through seperated by a ,. For example:
     * '#Cats,#Dogs,#Sheep'
     * or just
     * '#Cats'
     * 
     * View /Server/MySQL.sql for the exact code used for the mysql routine and
     * database.
     * 
     * @param String $topics
     */
    public function retrieveMessages($topics) {
        $stmt = $this->conn->prepare("
                        CALL retrieveHistory(:TopicList)
                        ");
        
        $stmt->bindValue(":TopicList", $topics, \PDO::PARAM_STR);
        if ($stmt->execute()) {
            while ($row = $stmt->fetch()) {
                print_r($row);
            }
        }
        
        echo "\r\nmessage saved to database\r\n";
    }
}
?>
