class Subtopic < ApplicationRecord
    belongs_to :topic
    has_many :tips
    
    validates :topic_id,
    presence: true,
    on: :create,
    allow_nil: false
    
    validates :name,
    presence: true,
    length: {maximum: 45},
    on: :create,
    allow_nil: false
end
