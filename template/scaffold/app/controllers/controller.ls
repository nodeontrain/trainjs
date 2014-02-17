class App.%%controller_name%%Controller extends ApplicationController
	# GET /%%model_plural%%
	# GET /%%model_plural%%.json
	index: !->
		@%%model_plural%% = %%model_name%%.all()
		this.respond_to do
			format_html: { %%model_plural%%: @%%model_plural%% }
			format_json: render json: @%%model_plural%%

	# GET /%%model_plural%%/1
	# GET /%%model_plural%%/1.json
	show: !->
		@%%model%% = %%model_name%%.findSync(this.params['id'])
		this.respond_to do
			format_html: { %%model%%: @%%model%% }
			format_json: render json: @%%model%%

	# GET /%%model_plural%%/new
	# GET /%%model_plural%%/new.json
	new: !->
		@%%model%% = %%model_name%%.new()
		this.respond_to do
			format_html: { %%model%%: @%%model%% }
			format_json: render json: @%%model%%
	
	# GET /%%model_plural%%/1/edit
	edit: !->
		@%%model%% = %%model_name%%.findSync(this.params['id'])
		this.render data: { %%model%%: @%%model%% }

	# POST /%%model_plural%%
	# POST /%%model_plural%%.json
	create: !->
		@%%model%% = %%model_name%%.new(this.params["data"])
		if @%%model%%.saveSync()
			this.respond_to do
				format_html: redirect_to %%model%%_path(@%%model%%), notice: "%%model_name%% was successfully created."
				format_json: render json: @%%model%%, status: "created", location: %%model%%_path(@%%model%%)
		else
			this.respond_to do
				format_html: render action: "new", data: { %%model%% : @%%model%% }
				format_json: render json: @%%model%%.errors, status: "unprocessable_entity"

	# PUT /%%model_plural%%/1
	# PUT /%%model_plural%%/1.json
	update: !->
		@%%model%% = %%model_name%%.findSync(this.params['id'])
		if @%%model%%.update(this.params['data'])
			this.respond_to do
				format_html: redirect_to %%model%%_path(@%%model%%), notice: "%%model_name%% was successfully updated."
				format_json: { head: "no_content" }
		else
			this.respond_to do
				format_html: render action: "edit", data: { %%model%% : @%%model%% }
				format_json: render json: @%%model%%.errors, status: "unprocessable_entity"

	# DELETE /%%model_plural%%/1
	# DELETE /%%model_plural%%/1.json
	destroy: !->
		@%%model%% = %%model_name%%.findSync(this.params['id'])
		@%%model%%.destroySync()
		this.respond_to do
			format_html: redirect_to %%model_plural%%_url
			format_json: { head: "no_content" }
