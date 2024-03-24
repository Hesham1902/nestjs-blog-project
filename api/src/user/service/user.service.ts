import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../models/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { User, UserRole } from '../models/user.interface';
import { AuthService } from 'src/auth/service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { UpdateDto } from '../dto/update.dto';
import { LoginDto } from '../dto/login.dto';
import { v4 as uuidv4 } from 'uuid';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { ApiFeatures } from 'src/utils/api.features';

@Injectable()
export class UserService {
  private readonly bucket;
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_S3_REGION'),
  });
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    this.bucket = this.configService.getOrThrow('AWS_S3_BUCKET');
  }

  async UploadToS3(file: Express.Multer.File, id) {
    console.log(file);
    // const bucket = this.configService.getOrThrow('AWS_S3_BUCKET');
    const key = `${uuidv4()}-${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Optionally, specify the ACL (access control list)
    });
    try {
      const updatedResult = await this.updateOne(id, {
        profileImg: key,
      });

      if (!updatedResult) {
        throw new BadRequestException('Could not update the profile image');
      }
      await this.s3Client.send(command);
      const imageUrl = `https://${this.bucket}.s3.amazonaws.com/${key}`;
      return { imageUrl, result: 'Image uploaded and saved succesfully' };
    } catch (err) {
      console.error('Error uploading file to S3:', err);
      return err;
    }
  }

  async create(user: RegisterDto): Promise<RegisterDto> {
    if (
      (await this.userRepository.findOne({ where: { email: user.email } })) ||
      (await this.userRepository.findOne({
        where: { username: user.username },
      }))
    ) {
      throw new BadRequestException('email or username already exists');
    }
    const hashedPassword = await this.authService.hashPassword(user.password);
    const savedUser = await this.userRepository.save({
      ...user,
      role: UserRole.USER,
      password: hashedPassword,
    });
    delete savedUser.password;
    return savedUser;
  }

  async findAll() {
    return this.userRepository.find();
  }

  async paginate(options: IPaginationOptions): Promise<Pagination<UserEntity>> {
    return paginate<UserEntity>(this.userRepository, options);
  }

  // async paginateFilter(
  //   options: IPaginationOptions,
  //   filters: any,
  // ): Promise<Pagination<User>> {
  //   const { page, limit } = options;

  //   // Create a base query
  //   const queryBuilder = this.userRepository
  //     .createQueryBuilder('user')
  //     .select([
  //       'user.id',
  //       'user.name',
  //       'user.username',
  //       'user.email',
  //       'user.role',
  //     ])
  //     .orderBy('user.id', 'ASC');

  //   // Apply additional filters dynamically
  //   if (filters && Object.keys(filters).length > 0) {
  //     console.log('filters Object:', filters);
  //     console.log('Object keys:', Object.keys(filters));
  //     console.log('Object entries:', Object.entries(filters));
  //     // Loop through the remaining filters and apply them dynamically
  //     Object.entries(filters).forEach(([key, value]) => {
  //       console.log([key], value);
  //       queryBuilder.andWhere(`user.${key} LIKE :${key}`, {
  //         [key]: `%${value}%`,
  //       });
  //     });
  //   }

  //   // Paginate the query
  //   const results = await paginate<User>(queryBuilder, { page, limit });

  //   return results;
  // }

  // Using ApiFeatures
  async paginateFilter(queryObj) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    const { page, limit, ...filters } = queryObj;
    console.log(queryObj, filters);
    // if (!(Object.entries(filters).length > 0)) {
    //   queryBuilder =
    // }
    const apiFeatures = await new ApiFeatures<User>(queryBuilder, queryObj)
      .filter(filters)
      .pagination();
    const users = await apiFeatures.query.getMany();
    return { users, paginationResult: apiFeatures.paginationObj };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`No User with this ${id} found`);
    }
    const { password, ...result } = user;
    return result;
  }

  deleteOne(id: number): Promise<any> {
    return this.userRepository.delete(id);
  }

  async updateOne(id: number, user: UpdateDto) {
    const updateResult: UpdateResult = await this.userRepository.update(
      id,
      user,
    );
    if (updateResult.affected && updateResult.affected > 0) {
      return this.userRepository.findOne({ where: { id } });
    }
    throw new NotFoundException(`Couldn\'t update the user`);
  }

  async login(body: LoginDto): Promise<object> {
    const { result, user } = await this.validateUser(body.email, body.password);
    if (!result) {
      throw new UnauthorizedException('Invalid login credentials');
    }
    delete user.password;
    return this.authService.generateJwtToken(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    return {
      result: this.authService.comparePasswords(password, user.password),
      user,
    };
  }

  updateRoleOfUser(role: UserRole, id: string): Promise<any> {
    return this.userRepository.update(id, { role });
  }
}
