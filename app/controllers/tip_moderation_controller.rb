class TipModerationController < ApplicationController

    def index
        if current_user.admin
            @tips = Tip.all
        else
            redirect_to "/tips"
        end
    end
    
    
    
end
