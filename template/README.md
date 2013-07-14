## Welcome to Train

Node On Train is an MVC Web Framework, similar to Ruby on Rails


## Getting Started

1. At the command prompt, create a new Train application:
       <tt>trainjs new myapp</tt> (where <tt>myapp</tt> is the application name)

2. Change directory to <tt>myapp</tt> and start the web server:
       <tt>cd myapp; trainjs server</tt> (run with --help for options)

3. Go to http://localhost:1337/ and you'll see:
       "Welcome aboard: You're riding Node on Train!"


## Description of Contents

The default directory structure of a generated Node on Train application:

  |-- app
  |   |-- assets
  |       |-- images
  |       |-- javascripts
  |       `-- stylesheets
  |   |-- controllers
  |   |-- models
  |   `-- views
  |       `-- layouts
  |-- config
  |-- public

app
  Holds all the code that's specific to this particular application.

app/assets
  Contains subdirectories for images, stylesheets, and JavaScript files.

app/controllers
  Holds controllers that should be named like weblogs_controller.rb for
  automated URL mapping. All controllers should descend from
  ApplicationController which itself descends from ActionController::Base.

app/models
  Holds models that should be named like post.rb. Models descend from
  ActiveRecord::Base by default.

app/views
  Holds the template files for the view that should be named like
  weblogs/index.html.erb for the WeblogsController#index action. All views use
  eRuby syntax by default.

app/views/layouts
  Holds the template files for layouts to be used with views. This models the
  common header/footer method of wrapping views. In your views, define a layout
  using the <tt>layout :default</tt> and create a file named default.html.erb.
  Inside default.html.erb, call <% yield %> to render the view using this
  layout.

config
  Configuration files for the Train environment, the routing map, the database,
  and other dependencies.

public
  The directory available for the web server. Also contains the dispatchers and the
  default HTML files. This should be set as the DOCUMENT_ROOT of your web
  server.
