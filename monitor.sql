-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : lun. 18 jan. 2021 à 17:53
-- Version du serveur :  8.0.22-0ubuntu0.20.04.3
-- Version de PHP : 7.4.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `monitor`
--

-- --------------------------------------------------------

--
-- Structure de la table `oid`
--

CREATE TABLE `oid` (
  `id_oid` int NOT NULL,
  `router` int DEFAULT NULL,
  `name` varchar(40) DEFAULT NULL,
  `user` varchar(50) DEFAULT NULL,
  `bytes-in` varchar(50) DEFAULT NULL,
  `bytes-out` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `oid`
--

INSERT INTO `oid` (`id_oid`, `router`, `name`, `user`, `bytes-in`, `bytes-out`) VALUES
(1, 2, 'ether1', NULL, '.1.3.6.1.2.1.31.1.1.1.6.2', '.1.3.6.1.2.1.31.1.1.1.10.2'),
(2, 2, 'ether2', 'Elisah', '.1.3.6.1.2.1.31.1.1.1.6.3', '.1.3.6.1.2.1.31.1.1.1.10.3'),
(3, 2, 'ether3', 'Ravaka', '.1.3.6.1.2.1.31.1.1.1.6.4', '.1.3.6.1.2.1.31.1.1.1.10.4'),
(4, 2, 'ether4', 'Toky', '.1.3.6.1.2.1.31.1.1.1.6.5', '.1.3.6.1.2.1.31.1.1.1.10.5'),
(5, 2, 'ether5', 'Francky', '.1.3.6.1.2.1.31.1.1.1.6.6', '.1.3.6.1.2.1.31.1.1.1.10.6'),
(6, 2, 'wlan1', 'Sitraka', '.1.3.6.1.2.1.31.1.1.1.6.1', '.1.3.6.1.2.1.31.1.1.1.10.1'),
(7, 1, 'ether1', NULL, '.1.3.6.1.2.1.31.1.1.1.6.3', '.1.3.6.1.2.1.31.1.1.1.10.3'),
(8, 1, 'wlan5', 'Sôrry Vincent', '.1.3.6.1.2.1.31.1.1.1.6.12', '.1.3.6.1.2.1.31.1.1.1.10.12'),
(9, 1, 'wlan1', 'Hachmia', '.1.3.6.1.2.1.31.1.1.1.6.1', '.1.3.6.1.2.1.31.1.1.1.10.1');

-- --------------------------------------------------------

--
-- Structure de la table `packets`
--

CREATE TABLE `packets` (
  `id_` int NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_oid` int DEFAULT NULL,
  `bytes-in` bigint DEFAULT NULL,
  `bytes-out` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `packets`
--


-- --------------------------------------------------------

--
-- Structure de la table `router`
--

CREATE TABLE `router` (
  `id_router` int NOT NULL,
  `ip` varchar(50) DEFAULT NULL,
  `name` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `router`
--

INSERT INTO `router` (`id_router`, `ip`, `name`) VALUES
(1, '192.168.88.253', 'rdc'),
(2, '192.168.88.254', '1ère étage');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `oid`
--
ALTER TABLE `oid`
  ADD PRIMARY KEY (`id_oid`);

--
-- Index pour la table `packets`
--
ALTER TABLE `packets`
  ADD PRIMARY KEY (`id_`);

--
-- Index pour la table `router`
--
ALTER TABLE `router`
  ADD PRIMARY KEY (`id_router`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `oid`
--
ALTER TABLE `oid`
  MODIFY `id_oid` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `packets`
--
ALTER TABLE `packets`
  MODIFY `id_` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT pour la table `router`
--
ALTER TABLE `router`
  MODIFY `id_router` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
