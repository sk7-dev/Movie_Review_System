<?php
session_start();
session_destroy();
header("Location: /movie_review/frontend/user/pages/index.html");
exit;
?>