<?php
// Bootstrap switch
$bs = true;
if (isset($_GET['bs']) && $_GET['bs'] == false)
{
	$bs = false;
};
?>
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>Maslosoft Playlist</title>
		<meta name="Description" content="Vendor Independent Video Playlist"/>
		<style>
			body{
				font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
				font-size: 14px;
				line-height: 20px;
				color: #333333;
			}
			pre
			{
				-moz-tab-size: 4;
				-o-tab-size:   4;
				tab-size:      4;
			}

			nav ul, nav ul li{
				list-style: none;
				margin: 0px 2px;
				padding: 2px;
			}
			nav ul{
				/*background: url('./images/menuBg.jpg') no-repeat;*/
				background-size: cover;
			}
			nav ul li{
				display: inline-block;
				color: white;
			}
			nav ul li a, nav ul li a:hover{
				color: white;
			}
		</style>
		<!--Option to disable bootstrap styles-->
		<?php if ($bs): ?>
			<link rel="stylesheet" href="../bower_components/bootstrap/dist/css/bootstrap.min.css">
			<link rel="stylesheet" href="../bower_components/bootstrap/dist/css/bootstrap-theme.min.css">
		<?php endif; ?>
		<link rel="stylesheet" href="../bower_components/font-awesome/css/font-awesome.min.css">
		<link rel="stylesheet" href="../dist/playlist.css" />

		<script type="text/javascript" src="../bower_components/jquery/dist/jquery.min.js"></script>
		<script type="text/javascript" src="../bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
		<script type="text/javascript" src="../dist/playlist.js"></script>
		<!--<script type="text/javascript" src="../dist/lang/pl.js"></script>-->
		<?php
		$simple = [];
		$combined = [];
		foreach (new DirectoryIterator(__DIR__) as $file)
		{
			if (strpos($file->getFilename(), '_') === 0)
			{
				continue;
			}
			if ($file->getFilename() === 'index.php')
			{
				continue;
			}
			if ($file->getExtension() != 'php')
			{
				continue;
			}
			if (strstr($file->getFilename(), '-'))
			{
				$combined[$file->getFilename()] = substr($file->getFilename(), 0, -4);
			}
			else
			{
				$simple[$file->getFilename()] = substr($file->getFilename(), 0, -4);
			}
		}
		ksort($simple);
		ksort($combined);
		?>
	</head>
	<body>
		<div class="container-fluid">
			<nav>
				<h1><?= basename($_SERVER['SCRIPT_FILENAME'], '.php') ?></h1>
				<?php if ($bs): ?>
					<a href="?bs=0">Disable twitter bootstrap</a>
				<?php else: ?>
					<a href="?bs=1">Enable twitter bootstrap</a>
				<?php endif; ?>
				<ul>
					<li class="link">
						<a href="./index.php">Index</a>
					</li>
					<li class="link">
						|
					</li>
					<?php foreach ($simple as $file => $name): ?>
						<li class="link">
							<a href="./<?= $file; ?>"><?= ucfirst($name); ?></a>
						</li>
					<?php endforeach; ?>
					<li class="link">
						|
					</li>
					<?php foreach ($combined as $file => $name): ?>
						<li class="link">
							<a href="./<?= $file; ?>"><?= str_replace('-', ' - ', ucfirst($name)); ?></a>
						</li>
					<?php endforeach; ?>
				</ul>
			</nav>
			<hr />
			<?php
			ob_start()
			?>
