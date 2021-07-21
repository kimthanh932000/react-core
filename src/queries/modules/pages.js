module.exports = `query($page: Int, $first: Int){
	pages(page: $page, first: $first){
		data {
			id
			name,
			url,
			meta_title,
			meta_description,
		}
	}
}`