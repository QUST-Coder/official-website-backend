CREATE TABLE `{table}`  (
`f_user_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'uid',
`f_username` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户名',
`f_password` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '密码',
`f_email` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '邮箱',
`f_create_time` datetime(0) NOT NULL DEFAULT NOW() COMMENT '创建时间',
`f_edit_time` datetime(0) NOT NULL DEFAULT NOW() ON UPDATE NOW() COMMENT '修改时间',
`f_status` int(8) NOT NULL DEFAULT 0 COMMENT '账号状态',
PRIMARY KEY (`f_user_id`) USING BTREE,
INDEX `user_index`(`f_user_id`, `f_username`, `f_email`) USING BTREE,
UNIQUE INDEX `uniq_userid`(`f_user_id`) USING BTREE,
UNIQUE INDEX `uniq_email`(`f_email`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 100000 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic