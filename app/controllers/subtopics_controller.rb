class SubtopicsController < ApplicationController
    def create
        if current_user.admin
            @subtopic = Subtopic.new(subtopic_params)
            if @subtopic.save
                redirect_to "/tips", alert: "Subtopic added sucessfully!"
            else
                redirect_to "/tips", alert: "Error adding subtopic. Don't forget to choose a topic."
            end
        else
            redirect_to "/tips", alert: "Error adding subtopic."
        end
    end
    
    def subtopic_params
        params.require(:subtopic).permit(:name, :topic_id)
    end
end
