module.exports = `query{
	articles: articles{
		paginatorInfo {
			lastPage
		}
	}
    authors: authors{
		paginatorInfo {
			lastPage
		}
	}
    pages: pages{
		paginatorInfo {
			lastPage
		}
	}
    posts: posts{
		paginatorInfo {
			lastPage
		}
	}
    topics: topics{
		paginatorInfo {
			lastPage
		}
	}
}`