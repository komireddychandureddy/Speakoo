import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import cookieParser from 'cookie-parser';

describe('Auth E2E smoke tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/auth/register returns 201', () => {
    const timestamp = Date.now();
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `e2e-${timestamp}@speakoo.test`,
        password: 'SecurePass123!',
        firstName: 'E2E',
        lastName: 'Test',
        role: 'learner',
      })
      .expect(201);
  });

  it('POST /api/v1/auth/login returns 200', async () => {
    const timestamp = Date.now();
    const email = `e2e-login-${timestamp}@speakoo.test`;

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'SecurePass123!',
        firstName: 'E2E',
        lastName: 'Login',
        role: 'learner',
      })
      .expect(201);

    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'SecurePass123!' })
      .expect(200);
  });

  it('POST /api/v1/auth/login returns 401 for wrong password', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'nonexistent@speakoo.test', password: 'wrong' })
      .expect(401);
  });
});
