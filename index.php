<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, Authorization');

if ( $_SERVER['REQUEST_METHOD'] == 'OPTIONS' ) {
    echo ''; // No return data for preflight.
    return;
}


require 'db.config.php';
require 'db.library.php';


define('COMPUTATION_CODE', 1);



