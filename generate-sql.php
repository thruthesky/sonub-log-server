<?php

$sql = <<<EOS

CREATE TABLE `search_engine` (
`idx` int(10) UNSIGNED NOT NULL,
`stamp` int(10) UNSIGNED NOT NULL DEFAULT 0,
`domain` varchar(64) NOT NULL DEFAULT '',
`category` varchar(128) NOT NULL DEFAULT '',
`title` varchar(255) NOT NULL DEFAULT '',
`content` text NOT NULL DEFAULT '',
author varchar(255) not null default '',
link varchar(255) not null default '',

EOS;


for( $i = 1;  $i <=5; $i ++ ) {
    $sql .= "
        image_$i text not null default '',
    ";
}
for( $i = 1;  $i <=10; $i ++ ) {
    $sql .= "
        varchar_$i varchar(255) not null default '',
    ";
}
for( $i = 1;  $i <=4; $i ++ ) {
    $sql .= "
        text_$i text not null default '',
    ";
}
$sql .= "
        text_5 text not null default ''
    ";

$sql .= "
) ENGINE=InnoDB DEFAULT CHARSET=utf8;";

echo $sql;
