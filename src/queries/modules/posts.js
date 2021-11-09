module.exports = `query($page: Int, $first: Int){
	posts(page: $page, first: $first){
		data {
			id
			title,
			url,
			resource,
			topic,
			author,
			preview,
			lightweight,
			body
			meta_title,
			meta_description,
			created_at
			updated_at
		}
	}
}`