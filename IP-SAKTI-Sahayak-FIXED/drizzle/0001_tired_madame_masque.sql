CREATE TABLE `audit_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(120) NOT NULL,
	`entityType` varchar(120) NOT NULL,
	`entityId` int,
	`metadataJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `classification_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`queryId` int,
	`userId` int,
	`productName` varchar(255) NOT NULL,
	`inputJson` text NOT NULL,
	`category` varchar(120) NOT NULL,
	`confidence` enum('high','medium','low') NOT NULL,
	`explanation` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `classification_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`title` varchar(255) NOT NULL,
	`language` varchar(16) NOT NULL DEFAULT 'en',
	`jurisdiction` enum('india','international','both','unknown') NOT NULL DEFAULT 'india',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `escalation_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`queryId` int,
	`question` text NOT NULL,
	`contact` varchar(255) NOT NULL,
	`contextJson` text,
	`status` enum('new','in_review','resolved') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `escalation_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`section` varchar(255),
	`content` text NOT NULL,
	`keywords` text,
	`intent` enum('ip','regulatory','abs','prior_art','general') NOT NULL,
	`jurisdiction` enum('india','international','both') NOT NULL,
	`language` varchar(16) NOT NULL DEFAULT 'en',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledge_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `query_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int,
	`userId` int,
	`question` text NOT NULL,
	`language` varchar(16) NOT NULL DEFAULT 'en',
	`intent` enum('ip','regulatory','abs','prior_art','general') NOT NULL,
	`jurisdiction` enum('india','international','both','unknown') NOT NULL,
	`answer` text NOT NULL,
	`confidence` enum('high','medium','low') NOT NULL,
	`evidenceJson` text,
	`routingJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `query_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `source_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`authority` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`category` enum('ip','regulatory','abs','prior_art','standards') NOT NULL,
	`jurisdiction` enum('india','international','both') NOT NULL,
	`country` varchar(120),
	`versionLabel` varchar(120),
	`effectiveDate` varchar(120),
	`verificationStatus` enum('verified','needs_review','unverified') NOT NULL DEFAULT 'needs_review',
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `source_documents_id` PRIMARY KEY(`id`)
);
