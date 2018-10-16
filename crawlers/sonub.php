<?php


require '../db.config.php';
require '../db.library.php';
require '../library.php';

define('IDX', 'sonub.last_crawled_idx');


$post_ids = ['media', 'blog', 'discussion', 'answer', 'market'];


$idx = db()->config(IDX);
if ( empty($idx) ) $idx = 0;


$q = [
    'method' => 'post.query',
    'fields' => 'idx, post_id, gid, user_name, subject, content, stamp',
    'where' => "idx > $idx AND (
        post_id='blog' OR post_id='media' OR post_id='discussion' OR post_id='answer' OR post_id='market' )",
    'orderby' => 'idx asc',
    'limit' => 100
];

$qs = http_build_query($q);


$url = "https://local.philgo.com/api.php?$qs";
//echo $url;
$re = file_get_contents($url);
if ( $re ) {
    $json = json_decode($re, true);
    if ( $json && isset($json['data']) ) {
        $last_idx = 0;
        foreach( $json['data'] as $post ) {
            if ( !isset($post['idx']) ) {
                continue;
            }
            $p = [
                'domain' => 'sonub',
                'category' => $post['post_id'],

                'stamp' => $post['stamp'],
                'link' => "https://philgo.com/api/linker.php?idx=$post[idx]"
            ];
            if ( $post['subject'] ) $p['title'] = $post['subject'];
            if ( isset($post['content']) ) $p['content'] = strip_tags($post['content']);
            if ( isset($post['user_name']) ) $p['author'] = $post['user_name'];

            echo "crawled: $post[idx], $post[post_id]\n";

//            print_r($post);


            if ( isset($post['files']) ) {
                $i = 1;
                foreach( $post['files'] as $file ) {
                    $p["image_$i"] = $file['src'];
                    $i ++;
                    if ( $i > 5 ) break;
                }
            }
            $db->insert( 'search_engine', $p );
            $last_idx = $post['idx'];
        }
        if ( $last_idx ) {
            db()->config(IDX, $last_idx);
        }
    }
}


