module.exports = function(m) {
     /**
     * Instantiation of dependencies allowing the use of SQLITE3.
     */
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./db/data.db');

    /**
     *Function allowing the use of embed.
     */
    const embed = require('../embed');

    /**
     *File containing BOT variable data.
     */
    const config = require('../config');

   /**
     * Checking if the command is indeed used, if not, end the function.
     */
    if (m.command !== "user") return false;

    /**
     * If user did not give 2 arguments then return an error.
     */
    if (m.args.length != 2) return embed(m.message, 'Need more arguments', 15158332, 'You need to give 2 argument, example : **!user add @example**', m.user);

    /**
     * Check if the 2nd argument is indeed one of the available arguments,
     * Only add, delete, info and setadmin are available.
     */
    var cmd = m.args[0];
    if(cmd != 'add' && cmd != 'delete' && cmd != 'info' && cmd != 'setadmin') return embed(m.message, 'Bad first argument', 15158332, 'The first argument needs to be add/delete/info/setadmin, example : **!user add @example**', m.user);

    /**
     * Did the user mention the user to be set to admin? If yes, pass, otherwise return an error.
     */
    const user = m.message.mentions.users.first();
    if (!user) return embed(m.message, 'Mention', 15158332, 'You didn\'t mentionned the user, example : **!user add @user**', m.user);

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
    db.get('SELECT userid FROM users WHERE userid = ?', [userid], (err, row) => {
        if (err) {
            return console.error(err.message);
        }

        /**
         * We put a switch to choose the function to use case by case.
         */
        switch(cmd) {
            case 'add':
                    /**
                     * We check if the user is not already in the DB, if yes, we send an error.
                     */
                    if (row != undefined) return embed(m.message, 'Already user', 15158332, 'You can\'t add someone in your database if he\'s already in.', m.user);

                    /**
                     * We add the user role to the person if they have been added to the DB.
                     */
                    let addrole = m.message.guild.roles.cache.find(r => r.name === config.botuser_rolename);
                        member.roles.add(addrole).catch(console.error);

                    /**
                     *We insert it into the DB.
                     */
                    db.run(`INSERT INTO users(userid, username, discriminator, date, permissions) VALUES(?, ?, ?, ?, ?)`, [userid, username, discriminator, date, 1], function(err) {
                        if (err) {
                            return console.log(err.message);
                        }
            
                        return embed(m.message, 'User been added', 3066993, '@' + username + ' has been added to the database.', m.user);
                    });
                break;
            case 'delete':
                    /**
                     * We check if the user is not in the db, if he is not there, we cannot delete him.
                     */
                    if (row == undefined) return embed(m.message, 'Already delete', 15158332, 'You can\'t delete someone from your database if he\'s not in.', m.user);

                    /**
                     *We remove the user role.
                     */
                    let deleterole = m.message.guild.roles.cache.find(r => r.name === config.botuser_rolename);
                        member.roles.remove(deleterole).catch(console.error);
                    
                    /**
                     * We remove the admin role from him.
                     */
                    let deleteadminrole = m.message.guild.roles.cache.find(r => r.name === config.admin_rolename);
                        member.roles.remove(deleteadminrole).catch(console.error);

                    /**
                     * We delete it from the DB.
                     */
                    db.run(`DELETE FROM users WHERE userid = ?`, [userid], function(err) {
                        if (err) {
                            return console.log(err.message);
                        }
            
                        return embed(m.message, 'User been deleted', 3066993, '@' + username + ' has been deleted from the database.', m.user);
                    });
                break;
            case 'info':
                    /**
                     * We retrieve the user information from the DB.
                     */
                    db.get('SELECT * FROM users WHERE userid  = ?', [userid], (err, row) => {
                        if (err) { return console.error(err.message); }
        
                        /**
                         * If it is not in db, we announce it.
                         */
                        if(row == undefined) return embed(m.message, 'No information', 15158332, '@' + username + ' is not in the database. He can\'t use the bot or any command.', m.user);
        
                        /**
                         * We define its grade and return it in embed.
                         */
                        rank = row.permissions == 0 ? 'admin' : 'a normal user';
                        return embed(m.message, 'Informations about ' + username, 3066993, '@' + username + ' is **' + rank +  '**. He can use the bot.', m.user);
                    });
                break;
            case 'setadmin':
                    /**
                     * We check in DB the rank of the user.
                     */
                    db.get('SELECT * FROM users WHERE userid  = ?', [userid], (err, row) => {
                        if (err) { return console.error(err.message); }

                        /**
                         * We remove the user role.
                         */
                        let userrole = m.message.guild.roles.cache.find(r => r.name === config.botuser_rolename);
                        member.roles.remove(userrole).catch(console.error);

                        /**
                         *We add the rank Admin.
                         */
                        let adminrole = m.message.guild.roles.cache.find(r => r.name === config.admin_rolename);
                        member.roles.add(adminrole).catch(console.error);

                        /**
                         *If it is not in DB, we add it.
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
                             * If he is already Admin, we throw an error.
                             */
                            return embed(m.message, 'Already Admin', 15158332, '@' + username + ' is already Admin. If you want to delete him as admin,\n type : **!user delete @username**', m.user);
                        } else {
                            /**
                             * And in the last case we only update our rank. 
                             */
                            db.run(`UPDATE users SET permissions = ? WHERE userid = ?`, [0, userid], function(err) {
                                if (err) {
                                  return console.log(err.message);
                                }
    
                                return embed(m.message, 'Upgrade succesfully', 3066993, '@' + username + ' is now Admin. He can use the bot as an Admin. If you want to delete him as admin,\n type : **!user delete @username**', m.user);
                            });
                        }
                    });
                break;
            default:
                break;
        }
    });
}