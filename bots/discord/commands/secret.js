module.exports = function(m) {
    /**
     * Instantiation of dependencies allowing the use of SQLITE3.
     */
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./db/data.db');

    /**
     * Function allowing the use of embed.
     */
    const embed = require('../embed');

    /**
     * File containing BOT variable data.
     */
    const config = require('../config');

    /**
     * Checking if the command is indeed secret, otherwise, end the function.
     */
    if (m.command !== "secret") return false;

    /**
     *If user did not give 2 arguments then return an error.
     */
    if (m.args.length != 2) return embed(m.message, 'Need more arguments', 15158332, 'You need to give 2 argument, example : **!secret yoursecretpass @example**', m.user);

    /**
     * Check if the 2nd argument is indeed the emergency password, 
     * the password is lowercase coming from the config file because all the arguments provided in the commands are lowercase,
     * If the password matches, then we continue.
     */
    var cmd = m.args[0];
    if(cmd != config.secretpassword.toLowerCase()) return embed(m.message, 'Bad first argument', 15158332, 'The first argument needs to be your secret password, example : **!secret yoursecretpass @example**', m.user);

    /**
     *Did the user mention the user to be set to admin? If yes, pass, otherwise return an error.
     */
    const user = m.message.mentions.users.first();
    if (!user) return embed(m.message, 'Mention', 15158332, 'You didn\'t mention the user to set admin.', m.user);

    /**
     * Check if the user is on the server.
     */
    const member = m.message.guild.member(user);
    if (!member) return embed(m.message, 'Not possible', 15158332, '@' + username + ' is not on your server. Or wasn\'t found.', m.user);

    /**
     * Creation of constants, information on the user to put admin.
     */
    const userid = member.user.id,
        username = member.user.username,
        discriminator = member.user.discriminator,
        date = Date.now();

    /**
     * We remove the user role from the person, because they become Admin.
     */
    let userrole = m.message.guild.roles.cache.find(r => r.name === config.botuser_rolename);
    member.roles.remove(userrole).catch(console.error);

    /**
     * And we add the Admin role to it.
     */
    let adminrole = m.message.guild.roles.cache.find(r => r.name === config.admin_rolename);
    member.roles.add(adminrole).catch(console.error);    

    /**
     * We check if the user is already in the BD.
     */
    db.get('SELECT * FROM users WHERE userid  = ?', [userid], (err, row) => {
        if (err) { return console.error(err.message); }
        
        /**
         * If not, we add it.
         */
        if(row == undefined) {
            db.run(`INSERT INTO users(userid, username, discriminator, date, permissions) VALUES(?, ?, ?, ?, ?)`, [userid, username, discriminator, date, 0], function(err) {
                if (err) {
                    return console.log(err.message);
                }
    
                return embed(m.message, 'User been added', 3066993, '@' + username + ' has been added to the database.', m.user);
            });
        } else if(row.permissions == 0){
            /**
             * If he is already Admin, we return an error.
             */
            return embed(m.message, 'Already Admin', 15158332, '@' + username + ' is already Admin. If you want to delete him as admin,\n type : **!user delete @username**', m.user);
        } else {
            /**
             * Otherwise we update our rank in the DB.
             */
            db.run(`UPDATE users SET permissions = ? WHERE userid = ?`, [0, userid], function(err) {
                if (err) {
                  return console.log(err.message);
                }
    
                return embed(m.message, 'Upgrade succesfully', 3066993, '@' + username + ' is now Admin. He can use the bot as an Admin. If you want to delete him as admin,\n type : **!user delete @username**', m.user);
            });
        }
    });
}