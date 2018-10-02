<?php

require 'db.library.php';



print_r( db()->result("select count(*) from logs"));
