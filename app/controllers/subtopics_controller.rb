class SubtopicsController < ApplicationController
    def create
        @subtopic = Subtopic.new(subtopic_params)
        if @subtopic.save
            redirect_to "/tips", alert: "Subtopic added sucessfully!"
        else
            redirect_to "/tips", alert: "Error adding subtopic. Don't forget to choose a topic."
            # maybe change to new_user_path
        end
    end
    
    def subtopic_params
        params.require(:subtopic).permit(:name, :topic_id)
    end
end
