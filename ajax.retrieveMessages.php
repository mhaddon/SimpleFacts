<?php
require_once(__DIR__ . '/Server/Plugins/vendor/autoload.php');

/**
 * Connect to the database.
 */
$database = new MessangerServer\db;

echo $database->retrieveMessages(str_replace('@', '#', $_GET['topics']));
?>