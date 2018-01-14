class Topic < ApplicationRecord
    has_many :subtopics
    has_many :tips
    
    validates :name,
    presence: true,
    length: {maximum: 45},
    on: :create,
    allow_nil: false
end
