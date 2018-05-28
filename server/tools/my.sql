
CREATE TABLE `collections` (
	`id` BIGINT(20) NOT NULL AUTO_INCREMENT,
	`openid` VARCHAR(128) NULL DEFAULT NULL,
	`content` MEDIUMTEXT NULL,
	`lastchange` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	INDEX `openid` (`openid`),
	INDEX `lastchange` (`lastchange`)
)
COMMENT='collections'
COLLATE='utf8_general_ci'
ENGINE=InnoDB
;

CREATE TABLE `picset` (
	`id` BIGINT(20) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(256) NOT NULL DEFAULT '0',
	`content` MEDIUMTEXT NULL,
	`lastchange` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE INDEX `name` (`name`),
	INDEX `lastchange` (`lastchange`)
)
COMMENT='picset'
COLLATE='utf8_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=4
;
CREATE TABLE `tags` (
	`target_id` BIGINT(20) NOT NULL DEFAULT '0',
	`target_type` VARCHAR(20) NOT NULL DEFAULT '0',
	`tag` VARCHAR(50) NOT NULL DEFAULT '0',
	`random_index` BIGINT(20) NULL DEFAULT '0',
	UNIQUE INDEX `targetId_targetType_tag` (`target_type`, `target_id`, `tag`),
	INDEX `tag` (`tag`),
	INDEX `targetId` (`target_id`),
	INDEX `random_index` (`random_index`)
)
COMMENT='tags'
COLLATE='utf8_general_ci'
ENGINE=InnoDB
;

CREATE TABLE `images` (
	`id` BIGINT(20) NOT NULL AUTO_INCREMENT,
	`type` VARCHAR(50) NOT NULL DEFAULT '0',
	`url` VARCHAR(256) NOT NULL DEFAULT '0',
	`source_id` BIGINT(20) NOT NULL DEFAULT '0',
	`cos_uri` VARCHAR(512) NULL DEFAULT NULL,
	`tag_list` VARCHAR(256) NULL DEFAULT NULL,
	`random_index` BIGINT(20) NULL DEFAULT '0',
	`height` BIGINT(20) NULL DEFAULT '0',
	`width` BIGINT(20) NULL DEFAULT '0',
	`status` VARCHAR(50) NULL DEFAULT NULL,
	`choice` TINYINT(4) NULL DEFAULT '0',
	`lastchange` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE INDEX `source_id` (`source_id`),
	INDEX `type` (`type`),
	INDEX `lastchange` (`lastchange`),
	INDEX `height` (`height`),
	INDEX `width` (`width`),
	INDEX `status` (`status`),
	INDEX `random_index` (`random_index`),
	INDEX `choice` (`choice`)
)
COMMENT='images'
COLLATE='utf8_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=1
;

