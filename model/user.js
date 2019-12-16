const argon2 = require('argon2');

const db = require('../util/database');

module.exports = class User {
    constructor(id, name, password){
        this.id = id;
        this.name= name;
        this.password = password;
    }

    async save() {
        const hash = await argon2.hash(this.password);
        return db.execute(`insert into customer values(?, ?, ?)`, [this.id, this.name, hash]);
    }
    static updateById(id, name) {
        return db.execute(`update customer set c_name = ? where c_id = ?`, [name, id]);
    }
    static deleteById(id) {
        return db.execute(`delete from customer where c_id = ?`, [id]);
    }
    static verifyPassword (hash, pass) {
        return argon2.verify(hash, pass);
    }
    static fetchAll() {
        return db.execute('select c_id, c_name from customer');
    }
    static findById(id) {
        return db.execute(`select c_id, c_name from customer where c_id = ?`, [id]);
    }
    static login(id) {
        return db.execute(`select password from customer where c_id = ?`, [id]);
    }
    static checkId(id) {
        return db.execute(`select count(*) count from customer where c_id = ?`, [id]);
    }
}