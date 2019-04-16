CREATE TABLE `{table}` (
  `f_post_id` int(11) NOT NULL COMMENT 'post id',
  `f_post_page` int(11) NOT NULL COMMENT '页数',
  `f_context` text NOT NULL COMMENT '文章内容',
  `f_version` varchar(255) NOT NULL COMMENT '文章版本',
  `f_create_time` datetime NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  `f_edit_time` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '修改时间',
  UNIQUE KEY `post_index` (`f_post_id`,`f_post_page`,`f_version`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;