<?php
declare(strict_types=1);

header("Content-Type: text/plain; charset=utf-8");

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
    http_response_code(405);
    echo "method not allowed\n";
    exit;
}

$token = $_SERVER["HTTP_X_DEPLOY_TOKEN"] ?? "";
$expected = trim((string) @file_get_contents("/home/righwail/.deploy_token"));

if ($expected === "" || !hash_equals($expected, $token)) {
    http_response_code(403);
    echo "forbidden\n";
    exit;
}

set_time_limit(300);
ignore_user_abort(true);

$script = "/home/righwail/rightskills/scripts/cpanel-auto-deploy.sh";
$cmd = "/bin/bash " . escapeshellarg($script) . " --force";

$output = [];
$code = 1;
exec($cmd . " 2>&1", $output, $code);

http_response_code($code === 0 ? 200 : 500);
echo implode("\n", $output) . "\n";
echo $code === 0 ? "DEPLOY_OK\n" : "DEPLOY_FAIL\n";
