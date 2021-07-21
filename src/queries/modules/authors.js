module.exports = `query($page: Int, $first: Int) {
	authors(page: $page, first: $first){
		data {
			id,
			url,
			name,
			photo,
			info,
			latest,
			meta_title,
			meta_description,
		}
	}
}`