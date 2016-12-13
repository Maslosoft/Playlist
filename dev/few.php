<?php
require '_header.php'
?>
<?php
$items = [
	'https://vimeo.com/137939626' => 'Morocco Surf Trip by BoardRider',
	'https://vimeo.com/83393819' => 'Surfing Morocco Taghazout',
	'https://www.youtube.com/watch?v=w-niB3biH34' => 'Zawsze z Tobą',
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
		<div class="maslosoft-playlist" style="border-radius: 30px;">
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
