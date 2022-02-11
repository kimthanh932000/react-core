module.exports = `query($page: Int, $first: Int){
	articles(page: $page, first: $first){
		data {
			id
			name,
			title,
			url,
			anchor,
			body
			meta_title,
			meta_description,
			created_at
			updated_at
		}
	}
}`