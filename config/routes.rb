# Guidelines, rules, other pages, etc. tells it where to go
Rails.application.routes.draw do  

  root to: 'home#show'
  get "/about" => "static#about"
  get "/contact" => "static#contact"
  get "/info" => "static#info"
  get "/terms" => "static#terms"
  get "/privacy" => "static#privacy"
  get "/rules" => "static#rules"
  
  scope path: 'admin' do
    authenticate :user, lambda { |u| u.admin? } do
      mount RailsEmailPreview::Engine, at: 'emails'
    end
  end

  get '/users/block/:id' => 'users#block_user'
  get '/users/add_admin/:id' => 'users#add_admin_to_user'
  get '/users/remove_admin/:id' => 'users#remove_admin_from_user'

  devise_for :users
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  resources :users, only: [:show]
  mount Thredded::Engine => '/forum'
  
  scope "/tips" do
    resources :tips, :tip_moderation
    root to: "tips#index"
  end
  
  scope "/tips/tip_moderation" do
    resources :topics, :subtopics, only: [:new, :create]
  end

  match '/contacts',     to: 'contacts#new', via: 'get'
  resources "contacts", only: [:new, :create]
  
end
