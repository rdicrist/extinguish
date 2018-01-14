class TopicsController < ApplicationController
    def create
        if current_user.admin
            @topic = Topic.new(topic_params)
            if @topic.save
                redirect_to "/tips", alert: "Topic added sucessfully!"
            else
                redirect_to "/tips", alert: "Error adding topic."
            end
        else
            redirect_to "/tips", alert: "Error adding topic."
        end
    end
    
    def topic_params
        params.require(:topic).permit(:name)
    end
end
