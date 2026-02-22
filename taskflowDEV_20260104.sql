/*
SQLyog Community v13.3.0 (64 bit)
MySQL - 9.4.0 : Database - taskflowDEV
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
USE `taskflowDEV`;

/*Table structure for table `comments` */

DROP TABLE IF EXISTS `comments`;

CREATE TABLE `comments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `comment` text NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `ticket_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKj7vc0aigr2m5mew52v7ddt4fo` (`ticket_id`),
  KEY `FK8omq0tc18jd43bu5tjh6jvraq` (`user_id`),
  CONSTRAINT `FK8omq0tc18jd43bu5tjh6jvraq` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKj7vc0aigr2m5mew52v7ddt4fo` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `comments` */

insert  into `comments`(`id`,`comment`,`created_at`,`updated_at`,`ticket_id`,`user_id`) values 
(1,'First testing comment for Ticket No. 1','2025-11-08 20:52:47.328164','2025-11-08 20:52:47.328164',1,1),
(2,'Second testing comment for Ticket No. 1','2025-11-08 21:07:33.802383','2025-11-08 21:16:50.359744',1,1),
(3,'Comment for Ticket No. 3 first','2025-11-08 21:09:44.911760','2025-11-08 21:09:44.911760',3,1),
(5,'Comment for Ticket No. 3 Third','2025-11-08 21:10:25.628905','2025-11-08 21:10:25.628905',3,1);

/*Table structure for table `tickets` */

DROP TABLE IF EXISTS `tickets`;

CREATE TABLE `tickets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `due_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `status` enum('CLOSED','IN_PROGRESS','NEW','OPEN','PENDING','RESOLVED') NOT NULL,
  `subject` varchar(150) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK4eqsebpimnjen0q46ja6fl2hl` (`user_id`),
  CONSTRAINT `FK4eqsebpimnjen0q46ja6fl2hl` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `tickets` */

insert  into `tickets`(`id`,`created_at`,`description`,`due_date`,`end_date`,`start_date`,`status`,`subject`,`updated_at`,`user_id`) values 
(1,'2025-10-24 18:02:25.742717','After login, during activity, found that the token has been expired all in a sudden','2025-10-30','2025-10-27','2025-10-25','NEW','The token is expiring very quickly','2025-11-16 10:20:14.703446',1),
(3,'2025-10-24 21:54:36.945612','This is just a testing ticket','2025-10-30','2000-01-01','2025-10-24','OPEN','A testing ticket','2025-11-11 12:32:30.597595',1),
(4,'2025-10-26 09:32:19.487750','When purchasing some item, amount is not calculating','2025-10-30','2000-01-01','2025-10-26','NEW','Purchase not activated','2025-10-26 09:32:19.487750',1),
(5,'2025-10-26 10:19:02.621091','Design of the comment panel in not professional.\nPlease fix and update the design issue.','2025-11-05','2000-01-01','2025-10-26','PENDING','Redesign the comment window','2025-11-18 13:43:52.991341',1),
(6,'2025-10-26 10:25:51.346042','Day by day the application is running very slow by 50%. The counters are suffering badly for such delay in execution.','2025-11-05','2000-01-01','2025-10-26','CLOSED','The application is running very slow','2025-11-11 13:16:01.547163',1),
(10,'2025-10-28 19:04:18.912851','Another new ticket for testing purpose','2025-10-31','2000-01-01','2025-10-28','NEW','Another new ticket','2025-10-28 19:04:18.912851',1),
(11,'2025-11-02 10:07:14.027143','When going to update an existing ticket, after pressing the update button, the application getting stuck off.\nCorresponding database is not being updated.','2025-11-20','2000-01-01','2025-11-02','IN_PROGRESS','Ticket update panel is not working','2025-11-18 12:22:10.010902',1),
(13,'2025-11-16 09:15:37.081317','Please provide the gateway to provide comments on tickets.','2025-11-30','2000-01-01','2025-11-16','PENDING','Unable to create comments on a tickets','2026-01-04 09:33:56.417129',1);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
