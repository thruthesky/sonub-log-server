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
require 'library.php';



define('COMPUTATION_CODE', 1);




if ( ! _re('function') ) error(-1, 'Function name is empty.');


if ( !function_exists( _re('function') ) ) error( -2, _re('function') . " - function does not exists");



_re('function')();







error(-3, "Unhandled function. No data");