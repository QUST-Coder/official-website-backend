CREATE TABLE `{table}`  (
  `f_id` int(11) NOT NULL AUTO_INCREMENT,
  `f_session` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'sessionId',
  `f_data` varchar(4096) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT 'session数据',
  `f_expire_time` datetime(0) NULL DEFAULT NULL COMMENT '超期时间',
  `f_status` int(8) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'session状态 0正常 1续期 2过期',
  `f_create_time` datetime(0)  NOT NULL DEFAULT NOW() COMMENT '创建时间',
  `f_edit_time` datetime(0)  NOT NULL DEFAULT NOW() ON UPDATE NOW() COMMENT '编辑时间',
  PRIMARY KEY (`f_id`) USING BTREE,
  UNIQUE INDEX `session_index`(`f_session`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;