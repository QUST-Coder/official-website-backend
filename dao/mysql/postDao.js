"use strict";
const database = require("../../utils/mysql_util");
const { configs } = require("../../config");
const instance = configs["db_config"]["db_user"];
const BaseDao = require("../../base/base_dao");

class PostDao extends BaseDao {
    constructor() {
        super(...arguments);
        this.postTable = "_post";
        this.commentTable = "_post_comment";
        this.postHistory = "_post_history";
        this.commentHistory = "_post_comment_history";
    }
    async searchTitle(){

    }
    async searchContext(){

    }
    
    async savePost(title, type, context, tags, userId, version, postId) {
        try {
            if(postId){
                },
            }else{

            }
        } catch (err) {
            this.logger.error(`${err.message}`);
            throw err;
        }
    }

    async() {
        try {

        } catch (err) {
            this.logger.error(`${err.message}`);
            throw err;
        }
    }
}