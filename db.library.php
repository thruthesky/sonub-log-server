<?php

class ezSQL_DB {

    private $db;
    /**
     * @return ezSQL_mysqli
     */
    public function __construct()
    {
        global $db;
        $this->db = $db;
    }
    public function result($q) {
        return $this->db->get_var($q);
    }
    public function row($q) {
        return $this->db->get_row($q, ARRAY_A);
    }
    public function rows($q) {
        return $this->db->get_results($q, ARRAY_A);
    }
    public function query($q) {
        return $this->db->query( $q );
    }


    /**
     * @param $k
     * @param null $v
     * @return mixed
     *
     * @example
     *
    db()->config('hi', 'how are you?');


    echo db()->config('hi');

     */
    public function config( $k, $v = null ) {
        if ( $v !== null ) {
            $idx = $this->result("SELECT `idx` FROM config WHERE code = '$k'");
            if ( $idx ) {
                $this->db->update( 'config', [ 'value' => $v ] );
            } else {
                $this->db->insert( 'config', ['code' => $k, 'value' => $v]);
            }
            return null;
        } else {
            return $this->result("SELECT `value` FROM config WHERE code = '$k'");
        }
    }
}

$exEzSQL = new ezSQL_DB();
/**
 * @return ezSQL_DB
 */
function db() {
    global $exEzSQL;
    return $exEzSQL;
}
