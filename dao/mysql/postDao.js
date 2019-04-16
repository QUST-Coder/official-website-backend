"use strict";
const database = require("../../utils/mysql_util");
const { configs } = require("../../config");
const instance = configs["db_config"]["db_user"];
const BaseDao = require("../../base/base_dao");
const assert = require("assert");
class PostDao extends BaseDao {
    constructor() {
        super(...arguments);
        this.postTable = "_post";
        this.commentTable = "_post_comment";
        this.postHistory = "_post_history";
        this.commentHistory = "_post_comment_history";
    }
    async searchTitle() {

    }
    async searchContext() {

    }

    async savePost(title, type, context, tags, userId, version, postId) {
        try {
            if (postId) {
                await new Promise((resolve, reject) => {
                    database.init(instance).getConnection((err, connection) => {
                        if (err) {
                            return reject(err);
                        }
                        connection.beginTransaction(async err => {
                            if (err) {
                                connection.release();
                                return reject(err);
                            }
                            let querySql = (sql, args) => {
                                return new Promise((resolve, _reject) => {
                                    connection.query(sql, args, (err, rows) => {
                                        if (err) {
                                            return _reject(err);
                                        }
                                        resolve(rows);
                                    });
                                });
                            };
                            let rollback = () => {
                                return new Promise((resolve, _reject) => {
                                    connection.rollback(err => {
                                        if (err) {
                                            _reject(err);
                                        }
                                        resolve();
                                    });
                                });
                            };
                            try {
                                let getNowContextSql = `select f_context,f_version from ${this.postTable} where f_post_id = ?`;
                                let newContext = context;
                                let newVersion = version;
                                let nowContextRows = await querySql(getNowContextSql, [postId]);
                                let nowContext = nowContextRows[0]["f_context"];
                                let nowVersion = nowContextRows[0]["f_version"];
                                assert(newVersion >= nowVersion, "版本号不符合要求");
                                let saveSql = `insert into ${this.postHistory} (f_post_id,f_post_page,f_context,f_version) values (?,?,?,?)`;
                                await querySql(saveSql, [postId, 0, nowContext, nowVersion]);
                                let updateSql = `update ${this.postTable} set f_title = ?,f_type = ?,f_context = ?,f_tags = ?,f_version = ?`;
                                await querySql(updateSql, [title, type, newContext, tags, version]);
                                connection.release();
                                resolve();
                            } catch (err) {
                                this.logger.error();
                                await rollback();
                                connection.release();
                                return reject(err);
                            }
                        });
                    });
                });
                return postId;
            } else {
                let sql = `insert into ${this.postTable} 
                (f_post_page,f_title,f_type,f_context,f_tags,f_user_id,f_version,f_status) 
                values 
                (?,?,?,?,?,?,?,?)`;
                let args = [1, title, type, context, tags, userId, 0, 0];
                let rows = await database.query(sql, args, instance);
                let insertId = rows.insertId;
                return insertId;
            }
        } catch (err) {
            this.logger.error(`${err.message}`);
            throw err;
        }
    }
}

module.exports = new PostDao();