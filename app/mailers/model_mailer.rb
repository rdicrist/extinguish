class ModelMailer < ApplicationMailer

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.model_mailer.new_record_notification.subject
  #
  
  default from: ""
  default(
   from: "Extinguish.io <me@sandboxe012b15bc3c641649e2178dabd67fd4e.mailgun.org.com>",
   reply_to: "Extinguish.io <me@sandboxe012b15bc3c641649e2178dabd67fd4e.mailgun.org.com>"
   )
  def new_record_notification(content)
    @email = content
    mail to: "extinguishcontact@gmail.com", subject: "New Contact From #{@email.name.capitalize} (#{@email.email})"
  end
end
