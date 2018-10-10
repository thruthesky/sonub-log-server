<?php

function di($o) {
    echo "<xmp>";
    print_r($o);
    echo "</xmp>";
}

function _re($k = null, $_default = null ) {
    if ( $k ) {
        if ( isset($_REQUEST[$k]) ) return $_REQUEST[$k];
        else return $_default;
    }
    return $_REQUEST;
}

function error( $code, $message ) {
    echo json_encode(['code' => $code, 'message' => $message]);
    exit;
}

function success($data) {
    $res = [
        'query' => _re(),
        'data' => $data
    ];
    echo json_encode($res);
    exit;
}



function add0( $n ) {
    if ( $n < 10 ) return "0$n";
    else return $n;
}

/**
 * Returns a string of YmdHis
 *
 * If numbers are exceeding the end of the calendar time, it will compute with next year, month, day, hour, minutes, seconds.
 *
 *
 *
 * @param $Y
 * @param int $m
 * @param int $d
 * @param int $H
 * @param int $i
 * @param int $s
 * @return string
 *
 * @example YmdHis( 2018, 100, 100, 100, 100, 100 );
 */
function YmdHis( $Y, $m=1, $d=1, $H=0, $i=0, $s=0 ) {
//    $YmdHis = $Y . add0($m) . add0($d) . add0( $H ) . add0($i) . add0($s);
    return date("YmdHis", mktime( $H, $i, $s, $m, $d, $Y) );
}

/**
 * Returns a string of Ymd
 *
 * @param $Y
 * @param int $m
 * @param int $d
 * @return string
 */
function Ymd( $Y, $m=1, $d=1 ) {
    return date("Ymd", mktime( 0, 0, 0, $m, $d, $Y) );
}


/**
 * Returns timestamp of YmdHis
 * @param $YmdHis
 * @return false|int
 *
 * @example
 *  $until_date = date("Ymd", stamp_of_YmdHis( YmdHis( YmdHis( $to_year, $to_month, $to_day, 23, 59, 59 ) ) ));
 */
function stamp_of_YmdHis( $YmdHis ) {

    $Y = substr( "$YmdHis", 0, 4 );
    $m = substr( "$YmdHis", 4, 2 );
    $d = substr( "$YmdHis", 6, 2 );
    $H = substr( "$YmdHis", 8, 2 );
    $i = substr( "$YmdHis", 10, 2 );
    $s = substr( "$YmdHis", 12, 2 );

    return mktime( $H, $i, $s, $m, $d, $Y);
}


function getFromDate() {

    $from_year = _re('from_year');
    $from_month = _re('from_month');
    $from_day = _re('from_day');

    return Ymd( $from_year, $from_month, $from_day );
}

function getUntilDate() {

    $to_year = _re('to_year');
    $to_month = _re('to_month');
    $to_day = _re('to_day');

    return  Ymd( $to_year, $to_month, $to_day );
}

/**
 *
 * Returns the next date of input date.
 *
 * @desc Get '20180505' and returns '20180506'
 *
 * @param $skip this will leap to next days
 * @param $date
 * @return false|string
 */
function getNextDate( $date, $skip = 1 ) {
    $stamp = stamp_of_YmdHis("{$date}000000");
    return date('Ymd', $stamp + 60 * 60 * 24 * $skip );
}

/**
 * get the number of days between two dates
 */
function numberOfDaysBetween( $begin, $end ) {  

    $begin_stamp = stamp_of_YmdHis( "{$begin}000000");
    $end_stamp = stamp_of_YmdHis( "{$end}000000" );

    $datediff = $end_stamp - $begin_stamp;
    
    return round($datediff / (60 * 60 * 24));
} 

function statistics() {
    $ret = [
        'pageView' => pageView(true),
        'uniqueVisitor' => uniqueVisitor(true),
        'visitorLanguage' => visitorLanguage(true),
    ];

    success( $ret );
}

/**
 * @param bool $return if you need to return the data to xhr or return to method where it was called.
 * @return array
 */
function pageView($return = false) {
    $date = getFromDate();
    $until_date = getUntilDate();
    $number_of_days = numberOfDaysBetween($date, $until_date);
    $daySkip = 1;
    if( $number_of_days > 30 ) {
        $daySkip = round($number_of_days / 30);
    }

    $data = [];
    $total = 0;
    $last_date = false;
    $first_date = true;
    do {
        $nextDate = getNextDate( $date, $daySkip );
        if( !$last_date && $nextDate > $until_date ) {
            $nextDate = $until_date;
            $last_date = true;
        }
        if( $nextDate > $until_date ) {
            break;
        }

        $conds = [];
        if ( $domain = _re('domain') ) $conds[] = "domain='$domain'";


        if ( $first_date && $daySkip > 1 ) {
            $conds[] = "YmdHis>={$date}000000";
            $conds[] = "YmdHis<{$nextDate}000000";
            $first_date = false;
        } else if ($last_date && $daySkip > 1) {
            if( $date == $nextDate ) {
                $conds[] = "YmdHis>={$date}000000";
            } else {
                $conds[] = "YmdHis>{$date}235959";
            }
            $conds[] = "YmdHis<={$nextDate}235959";
        }  else if ($daySkip > 1) {
            $conds[] = "YmdHis>{$date}235959";
            $conds[] = "YmdHis<={$nextDate}235959";
        } else {
            $conds[] = "YmdHis>={$date}000000";
            $conds[] = "YmdHis<={$date}235959";
        }

        $where = implode(' AND ', $conds);
        $q = "SELECT COUNT(*) FROM logs WHERE $where";

        $cnt = db()->result($q);


        if ( $daySkip > 1 ) {
            $data[$nextDate] = $cnt;
        } else {
            $data[$date] = $cnt;
        }
        $total += $cnt;
        
        $date = $nextDate;
    } while ( $date <= $until_date );


    $ret = [
        'stats' => $data,
        'total' => $total
    ];

    if ( $return ) return $ret;
    else success( $ret );
}

/**
 * Count Unique Visitor
 * @param bool $return if you need to return the data to xhr or return to method where it was called.
 * @return array
 */
function uniqueVisitor($return = false) {
    $date = getFromDate();
    $until_date = getUntilDate();
    $number_of_days = numberOfDaysBetween($date, $until_date);
    $daySkip = 1;
    if( $number_of_days > 30 ) {
        $daySkip = round($number_of_days / 30);
    }

    $data = [];
    $total = 0;
    $last_date = false;
    $first_date = true;
    do {
        $nextDate = getNextDate( $date, $daySkip );
        if( !$last_date && $nextDate > $until_date ) {
            $nextDate = $until_date;
            $last_date = true;
        }
        if( $nextDate > $until_date ) {
            break;
        }

        $conds = [];
        if ( $domain = _re('domain') ) $conds[] = "domain='$domain'";


        if ( $first_date && $daySkip > 1 ) {
            $conds[] = "YmdHis>={$date}000000";
            $conds[] = "YmdHis<{$nextDate}000000";
            $first_date = false;
        } else if ($last_date && $daySkip > 1) {
            if( $date == $nextDate ) {
                $conds[] = "YmdHis>={$date}000000";
            } else {
                $conds[] = "YmdHis>{$date}235959";
            }
            $conds[] = "YmdHis<={$nextDate}235959";
        }  else if ($daySkip > 1) {
            $conds[] = "YmdHis>{$date}235959";
            $conds[] = "YmdHis<={$nextDate}235959";
        } else {
            $conds[] = "YmdHis>={$date}000000";
            $conds[] = "YmdHis<={$date}235959";
        }


        $where = implode(' AND ', $conds);
        $sub_q = "SELECT COUNT(*) FROM logs WHERE $where GROUP BY ip";
        $q = "SELECT COUNT(*) FROM ($sub_q) AS CNT";

        $cnt = db()->result($q);
        if ( $daySkip > 1 ) {
            $data[$nextDate] = $cnt;
        } else {
            $data[$date] = $cnt;
        }
        $total += $cnt;

        $date = $nextDate;
    } while ( $date <= $until_date );

    $ret = [
        'stats' => $data,
        'total' => $total
    ];

    if ( $return ) return $ret;
    else success( $ret );
}



/**
 *
 */
function everyHourPageView() {
    $date = getFromDate();
    $data = [];
    $from_hour = _re('from_hour', 0);
    $to_hour = _re('to_hour', 23);
    do {
        for( $hour = $from_hour; $hour <= $to_hour; $hour++ ) {
            $conds = [];
            if ( $domain = _re('domain') ) $conds[] = "domain='$domain'";
            $conds[] = "YmdHis>={$date}" . add0($hour). "0000";
            $conds[] = "YmdHis<={$date}" . add0($hour). "5959";
            $where = implode(' AND ', $conds);
            $q = "SELECT COUNT(*) FROM logs WHERE $where";
            $cnt = db()->result($q);
            if ( isset($data[$hour]) ) {
                $data[$hour] += $cnt;
            } else {
                $data[$hour] = 0;
            }
        }

        $date = getNextDate( $date );
    } while ( $date <= getUntilDate() );

    success( $data );
}

/**
 * Count Unique Visitor
 */
function everyHourUniqueVisitor() {
    $date = getFromDate();
    $data = [];

    $from_hour = _re('from_hour', 0);
    $to_hour = _re('to_hour', 23);
    do {

        for( $hour = $from_hour; $hour <= $to_hour; $hour++ ) {
            $conds = [];
            if ( $domain = _re('domain') ) $conds[] = "domain='$domain'";
            $conds[] = "YmdHis>={$date}" . add0($hour). "0000";
            $conds[] = "YmdHis<={$date}" . add0($hour). "5959";
            $where = implode(' AND ', $conds);
            $sub_q = "SELECT COUNT(*) FROM logs WHERE $where GROUP BY ip";
            $q = "SELECT COUNT(*) FROM ($sub_q)";
            $cnt = db()->result($q);
            if ( isset($data[$hour]) ) {
                $data[$hour] += $cnt;
            } else {
                $data[$hour] = 0;
            }
        }

        $date = getNextDate( $date );
    } while ( $date <= getUntilDate() );

    success( $data );
}



/**
 * Count Visitor Language
 */
function visitorLanguage( $return = false) {
    $date = getFromDate();
    $data = [];
    $total = 0;
    // $from_hour = add0(_re('from_hour', 0));
    // $to_hour = add0(_re('to_hour', 23));

    // do {

    //     $conds = [];
    //     if ( $domain = _re('domain') ) $conds[] = "domain='$domain'";
    //     $conds[] = "YmdHis>={$date}{$from_hour}0000";
    //     $conds[] = "YmdHis<={$date}{$to_hour}5959";
    //     $where = implode(' AND ', $conds);
    //     $sub_q = "SELECT COUNT(*) FROM logs WHERE $where GROUP BY ip";
    //     $q = "SELECT COUNT(*) FROM ($sub_q)";
    //     $data[$date] = db()->result($q);
    //     $total += $data[$date];
    //     $date = getNextDate( $date );
    // } while ( $date <= getUntilDate() );

    $ret = [
        'stats' => $data,
        'total' => $total
    ];

    if ( $return ) return $ret;
    else success( $ret );
}


