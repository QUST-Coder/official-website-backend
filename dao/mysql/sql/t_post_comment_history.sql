CREATE TABLE `{table}` (
  `f_comment_id` int(11) NOT NULL COMMENT 'post id',
  `f_context` text NOT NULL COMMENT '评论内容',
  `f_version` varchar(255) NOT NULL COMMENT '评论版本',
  `f_create_time` datetime NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  `f_edit_time` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '修改时间',
  PRIMARY KEY (`f_comment_id`) USING BTREE,
  UNIQUE KEY `uniq_version` (`f_comment_id`,`f_version`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;