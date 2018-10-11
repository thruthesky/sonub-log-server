CREATE TABLE `logs` (
  `idx` int(10) UNSIGNED NOT NULL,
  `YmdHis` bigint(10) UNSIGNED NOT NULL DEFAULT 0,
  `domain` varchar(128) NOT NULL DEFAULT '',
  `path` tinytext NOT NULL DEFAULT '',
  `ip` varchar(15) NOT NULL DEFAULT '',
  `user_agent` varchar(255) NOT NULL DEFAULT '',
  `idx_member` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `id` varchar(128) NOT NULL DEFAULT '',
  `referrer` varchar(255) NOT NULL DEFAULT '',
  `lang` char(2) NOT NULL DEFAULT '',
  `status` varchar(32) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- 덤프된 테이블의 인덱스
--

--
-- 테이블의 인덱스 `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`idx`),
  ADD KEY `YmdHis` (`YmdHis`),
  ADD KEY `domain_YmdHis` (`domain`,`YmdHis`),
  ADD KEY `ip_YmdHis` (`ip`,`YmdHis`),
  ADD KEY `ip_domain_YmdHis` (`ip`,`domain`,`YmdHis`);

--
-- 덤프된 테이블의 AUTO_INCREMENT
--

--
-- 테이블의 AUTO_INCREMENT `logs`
--
ALTER TABLE `logs`
  MODIFY `idx` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

