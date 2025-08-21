import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddSvnRevisionToUpdateLogs1731234567891 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
