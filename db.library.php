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
}

$exEzSQL = new ezSQL_DB();
/**
 * @return ezSQL_DB
 */
function db() {
    global $exEzSQL;
    return $exEzSQL;
}
