"use strict";
const database = require("../../utils/mysql_util");
const { configs } = require("../../config");
const instance = configs["db_config"]["db_user"];
const BaseDao = require("../../base/base_dao");
const assert = require("assert");
class PostDao extends BaseDao {
    constructor() {
        super(...arguments);
        this.postTable = this.table_prefix + "_post";
        this.commentTable = this.table_prefix + "_post_comment";
        this.postHistory = this.table_prefix + "_post_history";
        this.commentHistory = this.table_prefix + "_post_comment_history";
        this.instance = instance;
    }
    async setComment() {
        //TODO
    }
    async delComment() {
        //TODO
    }
    async getComment() {
        //TODO
    }
    async getPostListByContext() {
        //TODO
    }
    async delPost(postId) {
        try {
            let sql = `update ${this.postTable} set f_status = 1 where f_post_id = ?`;
            let args = [postId];
            let rows = await database.query(sql, args, instance);
            this.logger.debug(`database exec success|sql=${sql}|args=${JSON.stringify(args)}|ret=${JSON.stringify(rows)}`);
            return rows;
        } catch (err) {
            this.logger.error(`delete post error|err=${err.message}`);
            throw err;
        }
    }
    /**
     * 根据index获取post列表
     * @param {Object} index 
     */
    async getPostList(index) {
        try {
            let where = [];
            let args = [];
            if (index.userId) {
                where.push("f_user_id=?");
                args.push(index.userId);
            }
            if (index.type) {
                where.push("f_type");
                args.push(index.type);
            }
            if (index.title) {
                where.push(`f_title like '%${index.title.replace(/'/g, "\\'")}%'`);
            }
            if (index.tags) {
                let tags = index.tags.split("|");
                for (let i = 0; i < tags.length; i++) {
                    where.push(`f_tags like '%${tags.replace(/'/g, "\\'")}%'`);
                }
            }
            let sql = `select f_post_id,f_create_time,f_edit_time,f_version,f_status from ${this.postTable} where ${where.join(" and ")} order by f_edit_time desc`;
            let rows = await database.query(sql, args, instance);
            this.logger.debug(`database exec success|sql=${sql}|args=${JSON.stringify(args)}|ret=${JSON.stringify(rows)}`);
            return rows;
        } catch (err) {
            this.logger.error(`get post list err|err=${err.message}`);
            throw err;
        }
    }

    async getPost(postId) {
        try {
            let postSql = `select * from ${this.postTable} where f_post_id = ?`;
            let historySql = `select f_create_time from ${this.postHistory} where f_post_id = ?`;
            let postRows = await database.query(postSql, [postId], instance);
            if (postRows.length === 0) {
                throw new Error("文章不存在");
            }
            postRows = postRows[0];
            let histRows = await database.query(historySql, [postId], instance);
            histRows = histRows.forEach(row => {
                return { createTime: row["f_create_time"] };
            });
            return {
                title: postRows["f_title"],
                type: postRows["f_type"],
                context: postRows["f_context"],
                tags: postRows["f_tags"],
                userId: postRows["f_user_id"],
                version: postRows["f_version"],
                hVersions: histRows
            };
        } catch (err) {
            this.logger.error(err);
            throw err;
        }
    }

    async setPost(title, type, context, tags, userId, version, postId) {
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
                            let commit = () => {
                                return new Promise((resolve, _reject) => {
                                    connection.commit((err) => {
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
                                assert(newVersion !== nowVersion, "文章版本号不符合要求");
                                let setSql = `insert into ${this.postHistory} (f_post_id,f_post_page,f_context,f_version) values (?,?,?,?)`;
                                await querySql(setSql, [postId, 0, nowContext, nowVersion]);
                                let updateSql = `update ${this.postTable} set f_title = ?,f_type = ?,f_context = ?,f_tags = ?,f_version = ? where f_post_id = ?`;
                                await querySql(updateSql, [title, type, newContext, tags, version, postId]);
                                await commit();
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