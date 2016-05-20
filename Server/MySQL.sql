/*
    This file is a dump of the MySQL database.
    The dump was generated by Adminer, which is a free database management tool
*/

-- Adminer 4.2.4 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';

DROP DATABASE IF EXISTS `SimpleFacts`;
CREATE DATABASE `SimpleFacts` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `SimpleFacts`;

DELIMITER ;;
CREATE PROCEDURE `retrieveHistory`(IN `Topics` varchar(255))
    SELECT
       *
    FROM
       `Messages`
    WHERE
       FIND_IN_SET(`Topic`, Topics) > 0
    GROUP BY
       `ms`
;;

CREATE PROCEDURE `saveNewMessage`(IN `pi_Name` varchar(255), IN `pi_IP` varchar(255), IN `pi_Content` blob, IN `pi_DateTime` datetime, IN `pi_ms` int(11), IN `pi_Topic` varchar(255))
    INSERT INTO 
        `Messages` 
        (`Name`, `IP`, `Content`, `DateTime`, `ms`, `Topic`) 
    VALUES 
        (pi_Name, pi_IP, pi_Content, pi_DateTime, pi_ms, pi_Topic)
;;
DELIMITER ;

DROP TABLE IF EXISTS `Messages`;
CREATE TABLE `Messages` (
  `ID` int(255) NOT NULL AUTO_INCREMENT,
  `Topic` varchar(255) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `IP` varchar(45) NOT NULL,
  `Content` blob NOT NULL,
  `DateTime` datetime NOT NULL,
  `ms` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- 2016-05-20 17:16:49