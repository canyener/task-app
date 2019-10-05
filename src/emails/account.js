const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = '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'

sgMail.setApiKey(sendgridAPIKey)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'can.yener@hotmail.com.tr',
        subject: 'Thanks for joining in!',
        text: `Welcome to the Task App ${name}. Let me know how you get along with the app`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'can.yener@hotmail.com.tr',
        subject:'Sorry to see you go!',
        text: `Goodbye, ${name}. I hope to see you back sometime soon`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}