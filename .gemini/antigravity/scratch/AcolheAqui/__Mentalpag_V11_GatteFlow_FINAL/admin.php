<?php
session_start();
$_SESSION['user_mode'] = 'admin';
$_GET['page'] = 'dashboard';
include 'index.php';
?>
