<?php
// SELECT * FROM `search_engine` WHERE match(title,content) against('one')

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


$fields = ['idx','stamp','domain','category','title','content','author','link','image_1','image_2','image_3','image_4','image_5','varchar_1','varchar_2','varchar_3','varchar_4','varchar_5','varchar_6','varchar_7','varchar_8','varchar_9','varchar_10','text_1','text_2','text_3','text_4','text_5'];

$q = _re('q');

if ( strlen( $q ) < 3 ) error(-3, 'query too short');

$rows = db()->rows("SELECT * FROM search_engine WHERE MATCH(title, content) AGAINST( '$q' ) ");
$rows = sanitize($rows);

success($rows);


function sanitize( $rows ) {
    global $fields;
    if ( empty($rows) ) return [];

    $_rets = [];
    foreach( $rows as $row ) {
        $post = [];
        foreach( $fields as $f ) {
            if ( $row[$f] ) {
                $post[$f] = $row[$f];
            }
        }
        $_rets[] = $post;
    }
    return $_rets;
}