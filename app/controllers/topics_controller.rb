class TopicsController < ApplicationController
    def create
        @topic = Topic.new(topic_params)
        if @topic.save
            redirect_to "/tips", alert: "Topic added sucessfully!"
        else
            redirect_to "/tips", alert: "Error adding topic."
            # maybe change to new_user_path
        end
    end
    
    def topic_params
        params.require(:topic).permit(:name)
    end
end
