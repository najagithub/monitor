-- MySQL dump 10.13  Distrib 8.0.23, for Linux (x86_64)
--
-- Host: localhost    Database: monitor
-- ------------------------------------------------------
-- Server version	8.0.23-0ubuntu0.20.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `oid`
--

DROP TABLE IF EXISTS `oid`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oid` (
  `id_oid` int NOT NULL AUTO_INCREMENT,
  `router` int DEFAULT NULL,
  `name` varchar(40) DEFAULT NULL,
  `user` varchar(50) DEFAULT NULL,
  `bytes-in` varchar(50) DEFAULT NULL,
  `bytes-out` varchar(50) DEFAULT NULL,
  `usage_max` bigint DEFAULT NULL,
  `type` varchar(45) DEFAULT NULL,
  `actual_status` tinyint DEFAULT '1',
  PRIMARY KEY (`id_oid`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `oid_list`
--

DROP TABLE IF EXISTS `oid_list`;
/*!50001 DROP VIEW IF EXISTS `oid_list`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `oid_list` AS SELECT 
 1 AS `ip`,
 1 AS `id_oid`,
 1 AS `name`,
 1 AS `usage`,
 1 AS `max_usage`,
 1 AS `actual_status`,
 1 AS `type`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `oid_monitor`
--

DROP TABLE IF EXISTS `oid_monitor`;
/*!50001 DROP VIEW IF EXISTS `oid_monitor`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `oid_monitor` AS SELECT 
 1 AS `ip`,
 1 AS `lieu`,
 1 AS `name`,
 1 AS `id_oid`,
 1 AS `user`,
 1 AS `bytes-in`,
 1 AS `bytes-out`,
 1 AS `Total en KB`,
 1 AS `Total en MB`,
 1 AS `Total en GB`,
 1 AS `Dérnier Connexion`,
 1 AS `Max Usage`,
 1 AS `FUP 20 GB`,
 1 AS `Bloquer`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `packets`
--

DROP TABLE IF EXISTS `packets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packets` (
  `id_` int NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_oid` int DEFAULT NULL,
  `bytes-in` bigint DEFAULT NULL,
  `bytes-out` bigint DEFAULT NULL,
  PRIMARY KEY (`id_`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `router`
--

DROP TABLE IF EXISTS `router`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `router` (
  `id_router` int NOT NULL AUTO_INCREMENT,
  `ip` varchar(50) DEFAULT NULL,
  `name` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id_router`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'monitor'
--

--
-- Final view structure for view `oid_list`
--

/*!50001 DROP VIEW IF EXISTS `oid_list`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50001 VIEW `oid_list` AS select `r`.`ip` AS `ip`,`p`.`id_oid` AS `id_oid`,`o`.`name` AS `name`,truncate(((sum(`p`.`bytes-in`) + sum(`p`.`bytes-out`)) / (1048576.0 * 1024)),2) AS `usage`,truncate((((`o`.`usage_max` / 1024) / 1024) / 1024),2) AS `max_usage`,`o`.`actual_status` AS `actual_status`,`o`.`type` AS `type` from ((`router` `r` join `oid` `o`) join `packets` `p`) where ((`r`.`id_router` = `o`.`router`) and (`o`.`id_oid` = `p`.`id_oid`) and (`o`.`name` <> 'ether1') and (date_format(`p`.`date`,'%Y-%m') = date_format(now(),'%Y-%m'))) group by `p`.`id_oid` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `oid_monitor`
--

/*!50001 DROP VIEW IF EXISTS `oid_monitor`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50001 VIEW `oid_monitor` AS select `r`.`ip` AS `ip`,`r`.`name` AS `lieu`,(case when ((`o`.`name` = 'wlan1') and (`r`.`name` = 'rdc')) then 'rdc_gauche' when ((`o`.`name` = 'wlan5') and (`r`.`name` = 'rdc')) then 'rdc_droite' when ((`o`.`name` = 'wlan1') and (`r`.`name` = '1ère étage')) then '1ère étage' else `o`.`name` end) AS `name`,`p`.`id_oid` AS `id_oid`,`o`.`user` AS `user`,sum(`p`.`bytes-in`) AS `bytes-in`,sum(`p`.`bytes-out`) AS `bytes-out`,concat(truncate(((sum(`p`.`bytes-in`) + sum(`p`.`bytes-out`)) / 1024.0),2),' ','KB') AS `Total en KB`,concat(truncate(((sum(`p`.`bytes-in`) + sum(`p`.`bytes-out`)) / 1048576.0),2),' ','MB') AS `Total en MB`,concat(truncate(((sum(`p`.`bytes-in`) + sum(`p`.`bytes-out`)) / (1048576.0 * 1024)),2),' ','GB') AS `Total en GB`,date_format(max(`p`.`date`),'%M %d, %Y %H:%i:%S') AS `Dérnier Connexion`,concat(format((((`o`.`usage_max` / 1024) / 1024) / 1024),2),' ','GB') AS `Max Usage`,(case when ((sum(`p`.`bytes-in`) + sum(`p`.`bytes-out`)) > (((20 * 1024) * 1024) * 1024)) then 'Oui' else 'Non' end) AS `FUP 20 GB`,(case when (`o`.`actual_status` = 0) then 'Oui' else 'Non' end) AS `Bloquer` from ((`router` `r` join `oid` `o`) join `packets` `p`) where ((`r`.`id_router` = `o`.`router`) and (`o`.`id_oid` = `p`.`id_oid`) and (`o`.`name` <> 'ether1') and (date_format(`p`.`date`,'%Y-%m') = date_format(now(),'%Y-%m'))) group by `p`.`id_oid` order by `r`.`name`,`o`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-04-10 12:51:58
