CREATE TABLE `{table}` (
  `f_comment_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'post id',
  `f_post_id` int(11) NOT NULL COMMENT '留言的文章ID',
  `f_parent_id` int(11) NOT NULL COMMENT '楼中楼父楼ID',
  `f_context` text NOT NULL COMMENT '评论内容',
  `f_user_id` int(11) NOT NULL COMMENT 'user_auth表的f_id，表示作者',
  `f_status` int(11) NOT NULL COMMENT '评论状态',
  `f_version` varchar(255) NOT NULL COMMENT '评论版本',
  `f_create_time` datetime NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  `f_edit_time` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '修改时间',
  UNIQUE KEY `f_unique` (`f_comment_id`,`f_post_id`,`f_parent_id`) USING BTREE,
  KEY `f_comment_id_index` (`f_comment_id`) USING BTREE,
  KEY `f_post_id_index` (`f_post_id`) USING BTREE,
  KEY `f_parent_id_index` (`f_parent_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;