<?php
include_once "ezSQL/shared/ez_sql_core.php";
include_once "ezSQL/lib/ez_sql_mysqli.php";

$conn = new mysqli('localhost', 'root', '7777', 'sonub', 0, '/tmp/mysql.sock');
$db = new ezSQL_mysqli();
$db->dbh = $conn;


