"use strict";
const database = require("../../utils/rocksdb_util");
const BaseDao = require("../../base/base_dao");
const assert = require("assert");
const strUtil = require("../../utils/str_util");
class PostDao extends BaseDao {
    constructor() {
        super(...arguments);
        this.postTable = "post_";
        this.commentTable = "comment_";
        this.postHistory = "postHistory_";
        this.commentHistory = "commentHistory_";
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
            let nowPostData = await database.get(this.postTable + postId);
            if (!nowPostData) {
                throw new Error("文章不存在！");
            }
            let newPostData = nowPostData;
            newPostData.editTime = Date.now();
            newPostData.status = 1;
            await database.put(this.postTable + postId, newPostData);
            return postId;
        } catch (err) {
            this.logger.error(`delete post error|err=${err.message}|postId=${postId}`);
            throw err;
        }
    }
    /**
     * 根据index获取post列表
     * @param {Object} index 
     */
    async getPostList(index) {
        try {
            let ret = [];
            let posts = await database.find(this.postTable);
            for (let postData of posts) {
                postData = postData.value;
                if (postData.status === 0) {
                    if (index.userId && (index.userId !== postData.userId)) {
                        continue;
                    }
                    if (index.type && (index.type !== postData.type)) {
                        continue;
                    }
                    if (index.title && (postData.title.match(index.title) === null)) {
                        continue;
                    }
                    if (index.tags) {
                        let tags = index.tags.split("|");
                        let match = false;
                        for (let tag of tags) {
                            if (postData.tags.match(tag) !== null) {
                                match = true;
                                break;
                            }
                        }
                        if (!match) {
                            continue;
                        }
                    }
                    ret.push(postData);
                }
            }
            this.logger.info(`getPostList success|index=${JSON.stringify(index)}|ret=${ret.length}`);
            return ret;
        } catch (err) {
            this.logger.error(`get post list error|${err.message}|${JSON.stringify(index)}`);
            throw err;
        }
    }
    async getPost(postId) {
        try {
            let nowPostData = await database.get(this.postTable + postId);
            if (!nowPostData) {
                throw new Error("文章不存在");
            }
            if (nowPostData.status === 1) {
                throw new Error("文章已删除");
            }
            let hisPostDataList = await database.find(this.postHistory + postId);
            let hVersions = hisPostDataList.map(hisPostData => {
                return hisPostData.value.createTime;
            });
            this.logger.debug(`getPost Success|postId=${postId}`);
            return Object.assign(nowPostData, { hVersions });
        } catch (err) {
            this.logger.error(`get post error|${err.message}`);
            throw err;
        }
    }
    async setPost(title, type, context, tags, userId, version, postId) {
        try {
            if (postId) {
                let nowPostData = await database.get(this.postTable + postId);
                let nowVersion = nowPostData.version;
                let newVersion = version;
                assert(newVersion !== nowVersion, "文章版本号不符合要求");
                let hisPostData = Object.assign({}, nowPostData);
                hisPostData.createTime = Date.now();
                hisPostData.editTime = Date.now();
                let newPostData = {
                    title,
                    type,
                    context,
                    tags,
                    version,
                    postId,
                    userId,
                    createTime: nowPostData.createTime,
                    editTime: Date.now()
                };
                let ops = [
                    { method: "put", key: this.postTable + postId, value: hisPostData },
                    { method: "put", key: this.postHistory + postId + "_" + nowVersion, value: newPostData }
                ];
                try {
                    await database.batch(ops);
                    this.logger.info(`update post success|postId=${postId}`);
                } catch (err) {
                    await database.put(this.postTable + postId, nowPostData);
                    this.logger.error(`update post failed|postId=${postId}|err=${err.message}`);
                    throw err;
                }
                return postId;
            } else {
                postId = Date.now() + strUtil.genRandStr({ len: 2, symbol: false });
                let newPostData = {
                    title,
                    type,
                    context,
                    tags,
                    version,
                    postId,
                    userId,
                    status: 0,
                    createTime: Date.now(),
                    editTime: Date.now()
                };
                await database.put(this.postTable + postId, newPostData);
                let nowPostData = await database.get(this.postTable + postId);
                if (!nowPostData) {
                    throw new Error("文章存储失败");
                }
                this.logger.debug(`post set success|post=${JSON.stringify(newPostData)}`);
                this.logger.info(`post set success|postId=${postId}`);
                return postId;
            }
        } catch (err) {
            this.logger.error(`set post error|${err.message}`);
            throw err;
        }
    }
}

module.exports = new PostDao();