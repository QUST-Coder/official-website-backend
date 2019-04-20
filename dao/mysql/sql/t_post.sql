CREATE TABLE `{table}` (
  `f_post_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'post id',
  `f_post_page` int(11) NOT NULL COMMENT '页数',
  `f_title` varchar(255) NOT NULL COMMENT '标题',
  `f_type` varchar(255) NOT NULL COMMENT '文章类型',
  `f_context` text NOT NULL COMMENT '文章内容',
  `f_tags` varchar(255) NOT NULL COMMENT '文章标签',
  `f_user_id` int(11) NOT NULL COMMENT 'user_auth表的f_id，表示作者',
  `f_status` int(11) NOT NULL COMMENT '文章状态',
  `f_version` varchar(255) NOT NULL COMMENT '文章版本',
  `f_create_time` datetime NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  `f_edit_time` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '修改时间',
  PRIMARY KEY (`f_post_id`) USING BTREE,
  UNIQUE INDEX `uniq_post_page` (`f_post_id`,`f_post_page`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
