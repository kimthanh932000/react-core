module.exports = `query($page: Int, $first: Int) {
	topics(page: $page, first: $first){
		data {
			id,
			url,
			title,
			related,
			meta_title,
			meta_description,
		}
	}
}`