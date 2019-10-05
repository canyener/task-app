const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = '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'

sgMail.setApiKey(sendgridAPIKey)

sgMail.send({
    to:'can.yener@hotmail.com.tr',
    from: 'duneverjudgeme@gmail.com',
    subject: 'Mail from nodejs',
    text: 'Sent from node task app'
})