<?php
require '_header.php'
?>
<?php
$items = [
	'https://www.youtube.com/watch?v=4-33aCEwbro' => 'YT 1',
	'https://vimeo.com/194647607' => 'VM 1',
	'https://vimeo.com/194647400?from=outro-embed' => 'VM 2',
	'https://www.youtube.com/watch?v=UGFebAkUqqI' => 'YT 2'
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
