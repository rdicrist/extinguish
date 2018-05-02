class ContactsController < ApplicationController
  skip_before_action :authenticate_user!
  def new
    @contact = Contact.new
  end

  def create
    @record = Record.new
    if @record.save
      ModelMailer.new_record_notification(@record).deliver
      redirect_to "/", alert: "Thank you for your message. We will contact you soon!"
      # flash.now[:notice] = 'Thank you for your message. We will contact you soon!'
    else
      flash.now[:error] = 'Cannot send message.'
      render :new
    end
  end
end
