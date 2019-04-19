"use strict";
const BaseHandler = require("../base/base_handler");
const postDao = require("../dao")("postDao");
const { checkPrivilege } = require("../service/privilege_server");
class postHandler extends BaseHandler {
    constructor() {
        super(...arguments);
    }

    async v_setPost(type, title, context, tags, postId, userData) {
        try {
            this.logger.info(`set Post|${JSON.stringify(userData)}|${title}|${type}|${postId || "new Post"}`);
            let { userId } = userData;
            let version = "0";
            if (postId) {
                let postData = await postDao.getPost(postId);
                if (userId != postDao.userId && !checkPrivilege(userId)) {
                    throw new Error("用户不匹配：无权修改其他用户文章");
                }
                version = parseInt(postData.version) + 1 + "";
                await postDao.setPost(title, type, context, tags, userId, version, postId);
            } else {
                postId = await postDao.setPost(title, type, context, tags, userId, version, false);
            }
            return {
                error: {
                    code: 0,
                    msg: "success"
                },
                postId,
                version
            };
        } catch (err) {
            this.logger.error(err);
            return { error: { code: -1, msg: err.message }, };
        }
    }


    async v_getPost(postId, userData) {
        try {
            this.logger.info(`getPost|${JSON.stringify(userData)}|postId=${postId}`);
            let postData = await postDao.getPost(postId);
            //TODO 文章到可见等级
            let rsp = Object.assign({
                error: {
                    code: 0,
                    msg: "success"
                }
            }, postData);
            return rsp;
        } catch (err) {
            this.logger.error(err);
            return { error: { code: -1, msg: err.message }, };
        }
    }


    async v_getPostList(index, userData) {
        try {
            this.logger.info(`get post list|${JSON.stringify(userData)}|${JSON.stringify(index)}`);
            let postRows = await postDao.getPostList(index);
            let postList = [];
            for (let row of postRows) {
                if (row.f_status === 0) {
                    //row.authorInfo = //TODO
                    postList.push(row);
                }
            }
            return {
                error: {
                    code: 0,
                    msg: "success"
                },
                postList
            };
        } catch (err) {
            this.logger.error(err);
            return { error: { code: -1, msg: err.message }, };
        }
    }

}
module.exports = postHandler;
