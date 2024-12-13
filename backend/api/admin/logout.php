<?php
session_start();
session_destroy();
header("Location: /movie_review/frontend/admin/pages/index.html");
exit();
?>