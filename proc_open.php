
<?php

$src = "int a,b; int main(){ a = 5; b = 10; printf a * b; }";
$descriptorspec = array(0 => array("pipe","r"),
	1 => array("pipe","w"),
	2 => array("file","/tmp/error-output.txt","a"));
$a_out = '~/Documents/S/Compiler';
$process = proc_open($a_out, $descriptorspec, $pipes);
if(is_resource($process)){
	fwrite($pipes[0], $src);
	fclose($pipes[0]);;
	$json = stream_get_contents($pipes[1]);
	fclose($pipes[1]);
	echo $json;
}
?>
