import * as uuid from 'uuid';
import { ulid } from 'ulid';
import { Injectable, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UsersService {
    constructor(
        private emailService: EmailService,
        @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
        private dataSource : DataSource
    ) { }

    async createUser(name: string, email: string, password: string) {
        const userExist = await this.checkUserExists(email);
        if (userExist) {
            throw new UnprocessableEntityException('해당 이메일로는 가입할 수 없습니다.');
        }

        const signupVerifyToken = uuid.v1();

        // 트랜잭션 사용 안하는 경우 
        //await this.saveUser(name, email, password, signupVerifyToken);
        
        // QueryRunner 트랜잭션 
        //await this.saveUserUsingRunner(name, email, password, signupVerifyToken);

        // Transaction 함수 직접 시행
        await this.saveUserUsingTransaction(name, email, password, signupVerifyToken);

        await this.sendMemberJoinEmail(email, signupVerifyToken);
    }

    async verifyEmail(signupVerifyToken: string) : Promise<string> {
        // TODO
        // 1. DB에서 signupVerifyToken으로 회원 가입 처리 중인 유저가 있는지 조회하고 없다면 에러 처리
        // 2. 바로 로그인 상태가 되도록 JWT를 발급

        throw new Error('Method not implemented.');
    }

    async login(email: string, password: string) : Promise<string> { 
        // TODO
        // 1. email, password 를 가진 유저가 존재하는지 DB에서 확인하고 없다면 에러 처리
        // 2. JWT를 발급

        throw new Error('Method not implemented');
    }

    private async checkUserExists(emailAddress: string) : Promise<boolean>{
        const user = await this.usersRepository.findOne({
            where: {
              email: emailAddress
            }
        });

        return user !== null;
    }

    private async saveUser(name: string, email: string, password: string, signupVerifyToken: string) {
        const user = new UserEntity();
        user.id = ulid();
        user.name = name;
        user.email = email;
        user.password = password;
        user.signupVerifyToken = signupVerifyToken;

        await this.usersRepository.save(user);
    }

    private async saveUserUsingRunner(name: string, email: string, password: string, signupVerifyToken: string) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = new UserEntity();
            user.id = ulid();
            user.name = name;
            user.email = email;
            user.password = password;
            user.signupVerifyToken = signupVerifyToken;

            await queryRunner.manager.save(user);

            // 일부로 에러를 발생시켜본다.
            //throw new InternalServerErrorException();

            await queryRunner.commitTransaction();
        } catch (e) { 
            // 에러가 발생하면 롤벨 
            await queryRunner.rollbackTransaction();
        } finally {
            // 직접 생성한 QueryRunner는 해재시켜주어야 함 
            await queryRunner.release();
        }
    }

    private async saveUserUsingTransaction(name: string, email: string, password: string, signupVerifyToken: string) {
        await this.dataSource.transaction(async manager => {
            const user = new UserEntity();
            user.id = ulid();
            user.name = name;
            user.email = email;
            user.password = password;
            user.signupVerifyToken = signupVerifyToken;

            await manager.save(user);

            //throw new InternalServerErrorException(); 
        });
    }

    private async sendMemberJoinEmail(email: string, signupVerifyToken: string) {
        await this.emailService.sendMemberJoinVerification(email, signupVerifyToken);
    }
}
