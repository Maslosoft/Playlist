<?php
require '_header.php'
?>
<?php
$items = [
	'http://www.dailymotion.com/video/x1282jw_dailymotion-test_lifestyle' => 'Test video',
	'https://www.dailymotion.com/video/x54imp7_zig-sharko-new-compilation-2016-the-island-tour-hd_kids' => 'Zig Sharko',
	'https://vimeo.com/83393819' => 'Surfing Morocco Taghazout',
	'https://www.youtube.com/watch?v=w-niB3biH34' => 'Zawsze z Tobą',
	'https://vimeo.com/47393642' => 'Morocco Surf Trip 2011',
	'https://vimeo.com/68806241' => 'BOARD CAMP 2012 / epizod 1 - Surfing',
	'https://vimeo.com/47393645' => 'Morocco Surf Trip 2011',
	'https://vimeo.com/47393647' => 'Morocco Surf Trip 2011',
	'https://vimeo.com/68806248' => 'BOARD CAMP 2012 / epizod 1 - Surfing',
];
?>
<div class="row">
	<div class="col-md-12">
		<h1>
			Playlist Demo
		</h1>
	</div>
</div>
<div class="row">
	<div class="col-md-4 col-xs-12 col-sm-6" style="margin-bottom: 100px;">
		<div class="maslosoft-playlist">
			<?php foreach ($items as $url => $title): ?>
				<a href="<?= $url ?>"><?= $title ?></a>
			<?php endforeach; ?>
		</div>
	</div>
</div>
<div id="log">

</div>

<?php
require '_footer.php'
?>
