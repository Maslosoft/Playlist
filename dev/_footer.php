<?php
$text = ob_get_flush();
?>
<script>
	jQuery(document).ready(function () {
		jQuery('.maslosoft-playlist').each(function (index) {
			new Maslosoft.Playlist(this);
		});
	});
</script>
</div>
</body>
</html>
