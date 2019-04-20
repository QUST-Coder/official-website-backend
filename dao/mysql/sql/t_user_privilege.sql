CREATE TABLE `{table}` (
  `f_user_id` int(11) NOT NULL COMMENT 'uid',
  `f_privilege` int(11) NOT NULL COMMENT '权限掩码',
  `f_operator` varchar(255) NOT NULL COMMENT '修改人',
  `f_create_time` datetime NOT NULL DEFAULT current_timestamp() COMMENT '创建时间',
  `f_edit_time` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '修改时间',
  PRIMARY KEY (`f_user_id`) USING BTREE,
  UNIQUE KEY `uniq_userid` (`f_user_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
